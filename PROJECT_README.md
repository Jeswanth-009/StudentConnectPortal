# Student Connect - Social Media Platform

A full-stack social media application designed for students to share notes, job opportunities, and engage in discussions.

## Features

### 🔐 Authentication
- User registration and login
- Password reset via email
- JWT token-based authentication
- Secure password hashing

### 📝 Posts
- **Notes**: Upload documents with tags (subjects)
- **Jobs**: Share job openings with external links
- **Threads**: Start discussions with comments and replies

### 👤 User Profiles
- Profile picture upload
- Editable bio and information
- View other users' profiles
- Posts history

### 🔍 Search & Filter
- Search posts by title, tags, or username
- Filter by post type (notes, jobs, threads)
- Real-time search functionality

### 📁 File Management
- Document upload for notes
- Profile picture upload
- Cloudinary integration for file storage

## Tech Stack

### Frontend
- **React.js** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **FastAPI** (Python)
- **Motor** (async MongoDB driver)
- **JWT** for authentication
- **Cloudinary** for file storage
- **SMTP** for email functionality

### Database
- **MongoDB Atlas** (cloud database)

### Deployment
- **Vercel** (frontend and backend)
- **Cloudinary** (file storage)
- **Gmail SMTP** (email service)

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Cloudinary account
- Gmail account with app-specific password

### Environment Variables

Create `.env` file in the root directory:

```env
# Backend Configuration
SECRET_KEY=your-super-secret-key-here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/student_connect?retryWrites=true&w=majority
DATABASE_NAME=student_connect

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail SMTP)
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Installation & Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The `vercel.json` file configures both frontend and backend deployment.

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── contexts/           # React contexts (Auth)
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main app component
├── api/                    # Backend FastAPI code
│   ├── index.py           # Main FastAPI application
│   └── requirements.txt   # Python dependencies
├── .env                   # Environment variables
├── vercel.json           # Vercel deployment configuration
└── package.json          # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get posts (with search and filter)
- `GET /api/posts/{post_id}` - Get specific post
- `POST /api/posts/{post_id}/comments` - Add comment to post

### User Management
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/upload/profile-picture` - Upload profile picture
- `GET /api/user/{username}` - Get user profile by username
