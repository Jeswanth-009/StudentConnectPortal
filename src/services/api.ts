import axios from 'axios';
import type { AuthResponse, LoginData, RegisterData, User, Post, PostFormData, Comment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (data: LoginData): Promise<AuthResponse> => 
    api.post('/api/auth/login', data).then(res => res.data),
  
  register: (data: RegisterData): Promise<AuthResponse> => 
    api.post('/api/auth/register', data).then(res => res.data),
  
  forgotPassword: (email: string): Promise<{ message: string }> => 
    api.post('/api/auth/forgot-password', { email }).then(res => res.data),
  
  resetPassword: (token: string, new_password: string): Promise<{ message: string }> => 
    api.post('/api/auth/reset-password', { token, new_password }).then(res => res.data),
};

// User API
export const userAPI = {
  getProfile: (): Promise<User> => 
    api.get('/api/user/profile').then(res => res.data),
  
  updateProfile: (data: Partial<User>): Promise<{ message: string }> => 
    api.put('/api/user/profile', data).then(res => res.data),
  
  uploadProfilePicture: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  getUserProfile: (username: string): Promise<User & { posts: Post[] }> => 
    api.get(`/api/user/${username}`).then(res => res.data),
};

// Posts API
export const postsAPI = {
  createPost: (data: PostFormData): Promise<Post> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('post_type', data.post_type);
    formData.append('tags', data.tags.join(','));
    if (data.job_link) formData.append('job_link', data.job_link);
    if (data.file) formData.append('file', data.file);
    
    return api.post('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  getPosts: (params?: { 
    post_type?: string; 
    search?: string; 
    skip?: number; 
    limit?: number; 
  }): Promise<Post[]> => 
    api.get('/api/posts', { params }).then(res => res.data),
  
  getPost: (id: string): Promise<Post> => 
    api.get(`/api/posts/${id}`).then(res => res.data),
  
  addComment: (postId: string, content: string): Promise<Comment> => 
    api.post(`/api/posts/${postId}/comments`, { content, post_id: postId }).then(res => res.data),
};

export default api;
