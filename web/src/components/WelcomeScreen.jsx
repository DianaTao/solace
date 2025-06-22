'use client';

import { useState, useEffect } from 'react';

export default function WelcomeScreen({ onContinue }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    console.log('👋 WelcomeScreen initialized');
  }, []);

  const slides = [
    {
      emoji: '🤝',
      title: 'Welcome to SOLACE',
      subtitle: 'Social Work Operations Assistant',
      description: 'Empowering social workers with modern tools to better serve their communities in the San Francisco Bay Area.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      emoji: '💻',
      title: 'Web-Based Platform',
      subtitle: 'Access from anywhere',
      description: 'Work seamlessly across devices with our responsive web platform that adapts to your workflow.',
      color: 'from-green-500 to-green-600'
    },
    {
      emoji: '🔒',
      title: 'Secure & Private',
      subtitle: 'Your data is protected',
      description: 'Built with enterprise-grade security to protect sensitive client information and maintain confidentiality.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      emoji: '⚡',
      title: 'Ready to Start?',
      subtitle: 'Join the SOLACE community',
      description: 'Sign in to your account or create a new one to begin streamlining your social work operations.',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onContinue();
    }
  };

  const handleSkip = () => {
    onContinue();
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Skip Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Skip Introduction
          </button>
        </div>

        {/* Main Content */}
        <div className="text-center">
          
          {/* Slide Content */}
          <div className={`bg-gradient-to-br ${currentSlideData.color} rounded-3xl p-12 shadow-2xl text-white mb-12 transform transition-all duration-500`}>
            
            {/* Emoji Icon */}
            <div className="w-32 h-32 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">{currentSlideData.emoji}</span>
            </div>

            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{currentSlideData.title}</h1>
              <p className="text-xl md:text-2xl font-medium text-white/90">{currentSlideData.subtitle}</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                {currentSlideData.description}
              </p>
            </div>

            {/* Features List - Show on first slide */}
            {currentSlide === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="flex items-center p-4 bg-white/10 rounded-xl">
                  <span className="text-2xl mr-3">👥</span>
                  <span className="font-medium">Client Management</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 rounded-xl">
                  <span className="text-2xl mr-3">📋</span>
                  <span className="font-medium">Case Documentation</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 rounded-xl">
                  <span className="text-2xl mr-3">✅</span>
                  <span className="font-medium">Task Tracking</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 rounded-xl">
                  <span className="text-2xl mr-3">📊</span>
                  <span className="font-medium">Progress Reports</span>
                </div>
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-md mx-auto">
            
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Previous
            </button>

            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-white' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Next/Get Started Button */}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
            >
              {currentSlide === slides.length - 1 ? '🚀 Get Started' : 'Next →'}
            </button>

          </div>

          {/* Version Info */}
          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm font-medium">SOLACE Web Platform v1.0</p>
            <p className="text-white/40 text-xs mt-1">Built for Social Workers</p>
          </div>

        </div>

      </div>
    </div>
  );
} 