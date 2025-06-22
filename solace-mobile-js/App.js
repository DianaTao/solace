import React, { useState } from 'react';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  const handleGetStarted = () => {
    setShowLogin(true);
  };

  if (!showLogin) {
    return <SplashScreen onGetStarted={handleGetStarted} />;
  }

  return <LoginScreen />;
} 