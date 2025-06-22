'use client';

import { useState, useEffect } from 'react';
import logger from '../lib/logger';

export default function WelcomeScreen({ onContinue }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    logger.info('WelcomeScreen initialized', 'UI');
  }, []);

  const slides = [
    {
      emoji: '🤝',
      title: 'Welcome to SOLACE',
      subtitle: 'Social Work Operations Assistant',
      description: 'Empowering social workers with modern tools to better serve their communities in the San Francisco Bay Area.',
      colorClass: 'blue'
    },
    {
      emoji: '💻',
      title: 'Web-Based Platform',
      subtitle: 'Access from anywhere',
      description: 'Work seamlessly across devices with our responsive web platform that adapts to your workflow.',
      colorClass: 'green'
    },
    {
      emoji: '🔒',
      title: 'Secure & Private',
      subtitle: 'Your data is protected',
      description: 'Built with enterprise-grade security to protect sensitive client information and maintain confidentiality.',
      colorClass: 'purple'
    },
    {
      emoji: '⚡',
      title: 'Ready to Start?',
      subtitle: 'Join the SOLACE community',
      description: 'Sign in to your account or create a new one to begin streamlining your social work operations.',
      colorClass: 'yellow'
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

  const getColorClasses = (colorClass) => {
    switch (colorClass) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
      case 'green':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white';
      case 'purple':
        return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-500 to-orange-500 text-white';
      default:
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full relative">
        
        {/* Skip Button */}
        <div className="absolute top-0 right-0 z-10">
          <button
            onClick={handleSkip}
            className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-white/50 transition-all duration-200"
          >
            Skip Introduction
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center">
          
          {/* Slide Content */}
          <div className={`${getColorClasses(currentSlideData.colorClass)} rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl w-full text-center transform transition-all duration-500 ease-out`}>
            
            {/* Emoji Icon */}
            <div className="mb-6">
              <span className="text-6xl md:text-8xl animate-bounce-gentle">{currentSlideData.emoji}</span>
            </div>

            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-slide-in-up">
                {currentSlideData.title}
              </h1>
              <p className="text-lg md:text-xl opacity-90 animate-slide-in-up animation-delay-200">
                {currentSlideData.subtitle}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-base md:text-lg leading-relaxed opacity-95 animate-slide-in-up animation-delay-400">
                {currentSlideData.description}
              </p>
            </div>

            {/* Features List - Show on first slide */}
            {currentSlide === 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6 animate-slide-in-up animation-delay-600">
                <div className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                  <span className="text-2xl">👥</span>
                  <span className="font-medium">Client Management</span>
                </div>
                <div className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                  <span className="text-2xl">📋</span>
                  <span className="font-medium">Case Documentation</span>
                </div>
                <div className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                  <span className="text-2xl">✅</span>
                  <span className="font-medium">Task Tracking</span>
                </div>
                <div className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                  <span className="text-2xl">📊</span>
                  <span className="font-medium">Progress Reports</span>
                </div>
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between w-full max-w-2xl mt-8">
            
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentSlide === 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 hover:shadow-lg'
              }`}
            >
              ← Previous
            </button>

            {/* Slide Indicators */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Next/Get Started Button */}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            >
              {currentSlide === slides.length - 1 ? '🚀 Get Started' : 'Next →'}
            </button>

          </div>

          {/* Version Info */}
          <div className="mt-8 text-center text-slate-600">
            <p className="font-medium">SOLACE Web Platform v1.0</p>
            <p className="text-sm opacity-75">Built for Social Workers</p>
          </div>

        </div>

      </div>
    </div>
  );
} 