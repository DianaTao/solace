'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        alert('SOLACE app installed successfully! 🎉');
      }
      setDeferredPrompt(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'demo@solace.app' && password === 'demo123') {
      alert('✅ Login successful! Welcome to SOLACE mobile!');
    } else {
      alert(`📱 Mobile login attempt with email: ${email}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Install PWA Banner */}
        {isInstallable && (
          <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">📱 Install SOLACE App</p>
                <p className="text-xs opacity-90">Get the full mobile experience!</p>
              </div>
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
            <div className="h-8 w-8 text-blue-600 font-bold text-2xl">S</div>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Welcome to SOLACE
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            📱 Mobile-Ready Social Work Assistant
          </p>
          <div className="mt-2 flex items-center justify-center space-x-2 text-xs">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
              ✅ JavaScript
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              📱 PWA Ready
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              📡 Responsive
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform active:scale-95 transition-all duration-150 shadow-lg"
          >
            📱 Sign In to Mobile
          </button>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">🎯 Demo Credentials:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Email:</strong> demo@solace.app</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
            </div>
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            SOLACE - Social Work Operations Assistant
          </p>
          <p className="text-xs text-gray-400">
            🌍 Empowering social workers in the San Francisco Bay Area
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>📱 Mobile Optimized</span>
            <span>🔒 Secure</span>
            <span>⚡ Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
