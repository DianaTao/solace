# SOLACE Mobile App - Organized Structure

This folder contains the organized React Native app structure with separated concerns for better maintainability.

## 📁 Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.js       # Custom button component
│   ├── Input.js        # Custom input component
│   └── index.js        # Component exports
├── screens/            # Screen components
│   ├── SplashScreen.js # Landing page with logo and slogan
│   ├── LoginScreen.js  # Login/signup form
│   └── index.js        # Screen exports
├── styles/             # Styling and design system
│   ├── commonStyles.js # Shared styles and design tokens
│   ├── splashStyles.js # Splash screen specific styles
│   ├── loginStyles.js  # Login screen specific styles
│   └── index.js        # Style exports
├── utils/              # Utility functions
│   └── validation.js   # Form validation helpers
└── README.md           # This file
```

## 🎨 Design System

### Colors
- **Primary**: `#2563eb` (Blue)
- **Background**: `#f8fafc` (Light gray)
- **Text**: `#111827` (Dark gray)
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)

### Typography
- **Sizes**: xs (12), sm (14), md (16), lg (18), xl (20), 2xl (24), 3xl (32), 4xl (36)
- **Weights**: normal (400), medium (500), semibold (600), bold (700)

### Spacing
- **xs**: 4px, **sm**: 8px, **md**: 16px, **lg**: 24px, **xl**: 32px, **xxl**: 48px

## 🧩 Components

### Button
Reusable button component with different variants and sizes.

```javascript
import { Button } from '../components';

<Button
  title="Get Started"
  onPress={handlePress}
  variant="primary" // or "secondary"
  size="large" // "small", "medium", "large"
  disabled={false}
/>
```

### Input
Reusable input component with validation and focus states.

```javascript
import { Input } from '../components';

<Input
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
/>
```

## 📱 Screens

### SplashScreen
- Shows the SOLACE logo with slogan "AI powered resources, human ready."
- "Get Started" button to navigate to login
- Clean, minimal design

### LoginScreen
- Login and signup functionality
- Form validation with error messages
- Demo credentials support
- User status display

## 🔧 Utilities

### Validation
Form validation helpers for consistent error handling.

```javascript
import { validateLoginForm, validateSignUpForm } from '../utils/validation';

const validation = validateLoginForm(email, password);
if (!validation.isValid) {
  setErrors(validation.errors);
}
```

## 🚀 Usage

The main `App.js` file now imports from the organized structure:

```javascript
import React, { useState } from 'react';
import { SplashScreen, LoginScreen } from './src/screens';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  
  if (!showLogin) {
    return <SplashScreen onGetStarted={() => setShowLogin(true)} />;
  }
  
  return <LoginScreen />;
}
```

## 🎯 Benefits

1. **Separation of Concerns**: Styles, components, and logic are separated
2. **Reusability**: Components can be reused across different screens
3. **Maintainability**: Easier to find and modify specific functionality
4. **Scalability**: Easy to add new components and screens
5. **Consistency**: Design tokens ensure consistent styling
6. **Type Safety**: Better organization makes it easier to add TypeScript later 