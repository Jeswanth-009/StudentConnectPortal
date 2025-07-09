import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, Briefcase, MessageCircle, Download, ExternalLink } from 'lucide-react';
import { postsAPI } from '../services/api';
import CreatePostModal from './CreatePostModal_simple';
import type { Post } from '../types';
import { Link } from 'react-router-dom';

const PostsTab: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'jobs' | 'threads'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filterType, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType !== 'all') params.post_type = filterType;
      if (searchTerm) params.search = searchTerm;
      
      const data = await postsAPI.getPosts(params);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Create Post</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search posts, tags, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400" size={16} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Posts</option>
            <option value="notes">Notes</option>
            <option value="jobs">Jobs</option>
            <option value="threads">Threads</option>
          </select>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts found. Be the first to create one!</p>
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
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/user/${post.author_username}`}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      {post.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span>{post.author_name}</span>
                    <span className="text-gray-400">@{post.author_username}</span>
                  </Link>
                  
                  {post.post_type === 'threads' && (
                    <Link
                      to={`/post/${post._id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Comments
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default PostsTab;
