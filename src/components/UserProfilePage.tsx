import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Briefcase, MessageCircle, Download, ExternalLink } from 'lucide-react';
import { userAPI } from '../services/api';
import type { User, Post } from '../types';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const data = await userAPI.getUserProfile(username);
      setUser(data);
      setPosts(data.posts);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'User not found');
    }
    setLoading(false);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'notes':
        return <FileText className="text-blue-600" size={16} />;
      case 'jobs':
        return <Briefcase className="text-green-600" size={16} />;
      case 'threads':
        return <MessageCircle className="text-purple-600" size={16} />;
      default:
        return <FileText className="text-gray-600" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to posts
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back to Posts</span>
      </Link>

      {/* User Profile */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.full_name}</h1>
            <p className="text-gray-600 mb-3">@{user.username}</p>
            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}
            <p className="text-sm text-gray-500">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Posts by {user.full_name}</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPostTypeIcon(post.post_type)}
                    <span className="text-sm font-medium text-gray-500 capitalize">
                      {post.post_type}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/post/${post._id}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {post.content}
                  </p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {post.job_link && (
                    <a
                      href={post.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      <ExternalLink size={14} />
                      <span>View Job</span>
                    </a>
                  )}
                  
                  {post.file_url && (
                    <a
                      href={post.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Download size={14} />
                      <span>Download File</span>
                    </a>
                  )}
                </div>
              </div>
              
              {post.post_type === 'threads' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/post/${post._id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Comments
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
