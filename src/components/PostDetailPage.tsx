import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Briefcase, MessageCircle, Download, ExternalLink, Send } from 'lucide-react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Post, Comment } from '../types';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const data = await postsAPI.getPost(postId);
      setPost(data);
      setComments(data.comments || []);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Post not found');
    }
    setLoading(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !postId) return;

    setSubmittingComment(true);
    try {
      const newComment = await postsAPI.addComment(postId, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      alert(error.response?.data?.detail || 'Failed to add comment');
    }
    setSubmittingComment(false);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'notes':
        return <FileText className="text-blue-600" size={20} />;
      case 'jobs':
        return <Briefcase className="text-green-600" size={20} />;
      case 'threads':
        return <MessageCircle className="text-purple-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
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

  if (!post) {
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

      {/* Post Detail */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          {getPostTypeIcon(post.post_type)}
          <span className="text-sm font-medium text-gray-500 capitalize">
            {post.post_type}
          </span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-500">
            {formatDate(post.created_at)}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {post.job_link && (
          <div className="mb-4">
            <a
              href={post.job_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
            >
              <ExternalLink size={16} />
              <span>View Job Opening</span>
            </a>
          </div>
        )}
        
        {post.file_url && (
          <div className="mb-4">
            <a
              href={post.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Download size={16} />
              <span>Download File</span>
            </a>
          </div>
        )}
        
        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
          <Link
            to={`/user/${post.author_username}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
              {post.author_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{post.author_name}</span>
            <span className="text-gray-400">@{post.author_username}</span>
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Comments ({comments.length})
        </h2>
        
        {/* Add Comment Form */}
        {user && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Send size={16} />
                    <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
        
        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link
                        to={`/user/${comment.author_username}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {comment.author_name}
                      </Link>
                      <span className="text-gray-400">@{comment.author_username}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
