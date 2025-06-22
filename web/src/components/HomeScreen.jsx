'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';

export default function HomeScreen({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🏠 HomeScreen initialized for user:', user?.email);
  }, []);

  const handleLogout = async () => {
    if (confirm('🚪 Are you sure you want to sign out?')) {
      setIsLoading(true);
      try {
        await AuthService.signOut();
        console.log('🚪 User signed out from HomeScreen');
        onLogout();
      } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Error: Failed to sign out. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProfileFix = async () => {
    console.log('🔧 Attempting to fix user profile from HomeScreen...');
    setIsLoading(true);
    
    try {
      const fixedProfile = await AuthService.createProfileForCurrentUser();
      
      if (fixedProfile) {
        console.log('✅ Profile fixed successfully from HomeScreen:', fixedProfile);
        alert(`✅ Profile Updated!\n\nYour profile has been refreshed!\n\nName: ${fixedProfile.name}\nEmail: ${fixedProfile.email}`);
      } else {
        alert('ℹ️ Profile OK\n\nYour profile is already up to date!');
      }
    } catch (error) {
      console.error('❌ Profile fix failed from HomeScreen:', error.message);
      alert(`❌ Profile Fix Failed\n\nCould not update your profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      id: 'clients', 
      title: '👥 Clients', 
      subtitle: 'Manage client records',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'cases', 
      title: '📋 Case Notes', 
      subtitle: 'Document case progress',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'tasks', 
      title: '✅ Tasks', 
      subtitle: 'Track your to-dos',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'reports', 
      title: '📊 Reports', 
      subtitle: 'Generate reports',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleQuickAction = (actionTitle) => {
    alert(`🚧 Coming Soon!\n\nThe ${actionTitle} feature is being developed. Stay tuned for updates!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-lg text-gray-600">{user?.email}</p>
            <p className="text-sm text-blue-600 font-medium">{user?.name || 'Social Worker'}</p>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center justify-center space-x-3 text-xs">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
              ✅ Online
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              💻 Web App
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800">
              🔒 Secure
            </span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.title)}
                className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left`}
              >
                <div className="text-lg font-bold mb-2">{action.title}</div>
                <div className="text-sm opacity-90">{action.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">👤 Your Profile</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">📧 Email:</span>
                <span className="text-blue-600">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">👤 Name:</span>
                <span className="text-blue-600">{user?.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">🏢 Role:</span>
                <span className="text-blue-600">{user?.role || 'Social Worker'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-700">🏛️ Agency:</span>
                <span className="text-blue-600">{user?.agency || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">⚙️ Account Actions</h2>
          
          {/* Profile Fix Button */}
          {(!user?.name || user?.name === 'User') && (
            <button
              onClick={handleProfileFix}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transform active:scale-95 transition-all duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Updating Profile...' : '🔧 Update Profile'}
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transform active:scale-95 transition-all duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Signing Out...' : '🚪 Sign Out'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 space-y-2">
          <p className="text-sm text-gray-500">
            SOLACE - Social Work Operations Assistant
          </p>
          <p className="text-sm text-gray-400">
            🌍 Empowering social workers in the San Francisco Bay Area
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>💻 Web Ready</span>
            <span>🔒 Secure</span>
            <span>⚡ Fast</span>
          </div>
        </div>

      </div>
    </div>
  );
} 