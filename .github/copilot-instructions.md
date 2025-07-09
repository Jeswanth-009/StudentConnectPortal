# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack social media application called "Student Connect" built with:
- **Frontend**: React.js with TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Authentication**: JWT tokens
- **Email**: Gmail SMTP for password reset
- **Deployment**: Vercel (frontend and backend as serverless functions)

## Features
- User authentication (login, register, password reset)
- Posts with 3 types: Notes (with file upload), Jobs (with links), Threads (with comments)
- User profiles with editable information
- Search and filter functionality
- File uploads to Cloudinary
- Email notifications

## Code Guidelines
- Use TypeScript for type safety
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Implement proper error handling
- Keep components modular and reusable
- Use proper type definitions

## Architecture
- Frontend: React SPA with routing
- Backend: FastAPI with async/await
- Database: MongoDB with Motor (async driver)
- Authentication: JWT tokens stored in localStorage
- File uploads: Cloudinary integration
- Email: SMTP with Gmail

## Deployment
- Frontend: Vercel static deployment
- Backend: Vercel serverless functions
- Database: MongoDB Atlas (cloud)
- Files: Cloudinary (cloud)
