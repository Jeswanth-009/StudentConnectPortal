import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from '../components/Navigation';
import PostsTab from '../components/PostsTab';
import ProfileTab from '../components/ProfileTab';
import UserProfilePage from '../components/UserProfilePage';
import PostDetailPage from '../components/PostDetailPage';

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'profile'>('posts');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Routes>
        <Route path="/" element={
          <div className="max-w-4xl mx-auto px-4 py-6">
            {activeTab === 'posts' && <PostsTab />}
            {activeTab === 'profile' && <ProfileTab />}
          </div>
        } />
        <Route path="/user/:username" element={<UserProfilePage />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
      </Routes>
    </div>
  );
};

export default MainPage;
