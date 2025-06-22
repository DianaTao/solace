'use client';

import { useState, useEffect } from 'react';
import logger from '../lib/logger';
import styles from './WelcomeScreen.module.css';

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

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Skip Button */}
        <div className={styles.skipButton}>
          <button
            onClick={handleSkip}
            className={styles.skipButtonText}
          >
            Skip Introduction
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          
          {/* Slide Content */}
          <div className={`${styles.slideCard} ${styles[currentSlideData.colorClass]}`}>
            
            {/* Emoji Icon */}
            <div className={styles.emojiIcon}>
              <span>{currentSlideData.emoji}</span>
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{currentSlideData.title}</h1>
              <p className={styles.subtitle}>{currentSlideData.subtitle}</p>
            </div>

            {/* Description */}
            <div className={styles.description}>
              <p className={styles.descriptionText}>
                {currentSlideData.description}
              </p>
            </div>

            {/* Features List - Show on first slide */}
            {currentSlide === 0 && (
              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>👥</span>
                  <span className={styles.featureText}>Client Management</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>📋</span>
                  <span className={styles.featureText}>Case Documentation</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>✅</span>
                  <span className={styles.featureText}>Task Tracking</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>📊</span>
                  <span className={styles.featureText}>Progress Reports</span>
                </div>
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className={`${styles.navButton} ${styles.previous}`}
            >
              ← Previous
            </button>

            {/* Slide Indicators */}
            <div className={styles.indicators}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`${styles.indicator} ${
                    index === currentSlide ? styles.active : styles.inactive
                  }`}
                />
              ))}
            </div>

            {/* Next/Get Started Button */}
            <button
              onClick={handleNext}
              className={`${styles.navButton} ${styles.next}`}
            >
              {currentSlide === slides.length - 1 ? '🚀 Get Started' : 'Next →'}
            </button>

          </div>

          {/* Version Info */}
          <div className={styles.versionInfo}>
            <p className={styles.versionText}>SOLACE Web Platform v1.0</p>
            <p className={styles.versionSubtext}>Built for Social Workers</p>
          </div>

        </div>

      </div>
    </div>
  );
} 