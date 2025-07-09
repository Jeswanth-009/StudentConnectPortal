from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import os
from decouple import config
import cloudinary
import cloudinary.uploader
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from pydantic import BaseModel, EmailStr
from bson import ObjectId
import json

# Configuration
SECRET_KEY = config("SECRET_KEY", default="your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

MONGODB_URL = config("MONGODB_URL", default="mongodb://localhost:27017")
DATABASE_NAME = config("DATABASE_NAME", default="student_connect")

# Cloudinary config
cloudinary.config(
    cloud_name=config("CLOUDINARY_CLOUD_NAME", default=""),
    api_key=config("CLOUDINARY_API_KEY", default=""),
    api_secret=config("CLOUDINARY_API_SECRET", default="")
)

# Email config
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = config("EMAIL_ADDRESS", default="")
EMAIL_PASSWORD = config("EMAIL_PASSWORD", default="")

app = FastAPI(title="Student Connect API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class PostCreate(BaseModel):
    title: str
    content: str
    post_type: str  # notes, jobs, threads
    tags: Optional[List[str]] = []
    job_link: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    username: Optional[str] = None

class CommentCreate(BaseModel):
    content: str
    post_id: str

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MimeMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MimeText(body, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

# Routes
@app.get("/")
async def root():
    return {"message": "Student Connect API"}

@app.post("/api/auth/register")
async def register(user: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password and save user
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "email": user.email,
        "username": user.username,
        "password": hashed_password,
        "full_name": user.full_name,
        "bio": "",
        "profile_picture": "",
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/forgot-password")
async def forgot_password(request: ForgotPassword):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create reset token
    reset_token = create_access_token(
        data={"sub": request.email, "type": "reset"}, 
        expires_delta=timedelta(hours=1)
    )
    
    # Send email
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    email_body = f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    """
    
    if send_email(request.email, "Password Reset", email_body):
        return {"message": "Reset link sent to email"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPassword):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "reset":
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Update password
    hashed_password = get_password_hash(request.new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )
    
    return {"message": "Password reset successful"}

@app.get("/api/user/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_data = {
        "_id": str(current_user["_id"]),
        "email": current_user["email"],
        "username": current_user["username"],
        "full_name": current_user["full_name"],
        "bio": current_user.get("bio", ""),
        "profile_picture": current_user.get("profile_picture", "")
    }
    return user_data

@app.put("/api/user/profile")
async def update_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if profile.full_name:
        update_data["full_name"] = profile.full_name
    if profile.bio:
        update_data["bio"] = profile.bio
    if profile.username:
        # Check if username is already taken
        existing = await db.users.find_one({"username": profile.username, "_id": {"$ne": current_user["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data["username"] = profile.username
    
    if update_data:
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
    
    return {"message": "Profile updated successfully"}

@app.post("/api/upload/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="profile_pictures",
            public_id=f"user_{current_user['_id']}"
        )
        
        # Update user profile
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"profile_picture": result["secure_url"]}}
        )
        
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Upload failed")

@app.post("/api/posts")
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    post_type: str = Form(...),
    tags: str = Form(""),
    job_link: str = Form(""),
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    post_data = {
        "title": title,
        "content": content,
        "post_type": post_type,
        "tags": tags.split(",") if tags else [],
        "job_link": job_link if job_link else None,
        "author_id": current_user["_id"],
        "author_username": current_user["username"],
        "author_name": current_user["full_name"],
        "created_at": datetime.utcnow(),
        "file_url": None
    }
    
    # Handle file upload for notes
    if file and post_type == "notes":
        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder="documents",
                resource_type="auto"
            )
            post_data["file_url"] = result["secure_url"]
        except Exception as e:
            raise HTTPException(status_code=500, detail="File upload failed")
    
    result = await db.posts.insert_one(post_data)
    post_data["_id"] = str(result.inserted_id)
    
    return post_data

@app.get("/api/posts")
async def get_posts(
    post_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    query = {}
    
    if post_type:
        query["post_type"] = post_type
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
            {"author_username": {"$regex": search, "$options": "i"}},
            {"author_name": {"$regex": search, "$options": "i"}}
        ]
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    
    for post in posts:
        post["_id"] = str(post["_id"])
        post["author_id"] = str(post["author_id"])
    
    return posts

@app.get("/api/posts/{post_id}")
async def get_post(post_id: str):
    try:
        post = await db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        post["_id"] = str(post["_id"])
        post["author_id"] = str(post["author_id"])
        
        # Get comments
        comments = await db.comments.find({"post_id": post_id}).sort("created_at", 1).to_list(None)
        for comment in comments:
            comment["_id"] = str(comment["_id"])
            comment["author_id"] = str(comment["author_id"])
        
        post["comments"] = comments
        return post
        
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid post ID")

@app.post("/api/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Check if post exists
        post = await db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        comment_data = {
            "content": comment.content,
            "post_id": post_id,
            "author_id": current_user["_id"],
            "author_username": current_user["username"],
            "author_name": current_user["full_name"],
            "created_at": datetime.utcnow()
        }
        
        result = await db.comments.insert_one(comment_data)
        comment_data["_id"] = str(result.inserted_id)
        comment_data["author_id"] = str(comment_data["author_id"])
        
        return comment_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid post ID")

@app.get("/api/user/{username}")
async def get_user_profile(username: str):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = {
        "_id": str(user["_id"]),
        "username": user["username"],
        "full_name": user["full_name"],
        "bio": user.get("bio", ""),
        "profile_picture": user.get("profile_picture", "")
    }
    
    # Get user's posts
    posts = await db.posts.find({"author_id": user["_id"]}).sort("created_at", -1).to_list(None)
    for post in posts:
        post["_id"] = str(post["_id"])
        post["author_id"] = str(post["author_id"])
    
    user_data["posts"] = posts
    return user_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
