# Vercel Deployment Instructions

## Quick Deploy to Vercel

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Student Connect app"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com
   - Connect your GitHub account
   - Import your repository
   - Vercel will auto-detect it's a Vite project

3. **Add Environment Variables in Vercel**:
   Go to your project settings and add these environment variables:
   ```
   SECRET_KEY=your-super-secret-key-here-change-this-in-production
   MONGODB_URL=mongodb+srv://studentconnect_user:db_Jeswanth321@studentconnect-cluster.kunpucj.mongodb.net/?retryWrites=true&w=majority&appName=studentconnect-cluster
   DATABASE_NAME=studentconnect_db
   CLOUDINARY_CLOUD_NAME=doot8hbtv
   CLOUDINARY_API_KEY=566631669326457
   CLOUDINARY_API_SECRET=UPLT4M7MqHHftxuNW-bHKpNjptE
   EMAIL_ADDRESS=studentconnect33@gmail.com
   EMAIL_PASSWORD=shbrmxlqdbiicodr
   ```

4. **Deploy**: Vercel will automatically deploy your app with both frontend and backend!
