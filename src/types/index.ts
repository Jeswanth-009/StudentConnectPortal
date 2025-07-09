export interface User {
  _id: string;
  email: string;
  username: string;
  full_name: string;
  bio: string;
  profile_picture: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  post_type: 'notes' | 'jobs' | 'threads';
  tags: string[];
  job_link?: string;
  file_url?: string;
  author_id: string;
  author_username: string;
  author_name: string;
  created_at: string;
  comments?: Comment[];
}

export interface Comment {
  _id: string;
  content: string;
  post_id: string;
  author_id: string;
  author_username: string;
  author_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

export interface PostFormData {
  title: string;
  content: string;
  post_type: 'notes' | 'jobs' | 'threads';
  tags: string[];
  job_link?: string;
  file?: File;
}
