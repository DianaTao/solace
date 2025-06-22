# SOLACE Mobile App 📱

A React Native mobile application for the SOLACE (Social Work Operations Assistant) platform, built with Expo and designed for social workers in the San Francisco Bay Area.

## 🚀 Quick Start

### Prerequisites

Before running the mobile app, make sure you have:

- **Node.js** (v16 or higher) installed on your computer
- **Expo Go app** installed on your mobile device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Git** (optional, for cloning)

### Installation & Setup

1. **Navigate to the mobile app directory:**
   ```bash
   cd solace-mobile-js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment configuration:**
   ```bash
   # Copy the environment template
   cp config/env.template.js config/env.js
   
   # Edit config/env.js with your Supabase credentials
   # See SUPABASE_SETUP.md for detailed instructions
   ```

4. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

### Running on Your Device

#### Method 1: Using Expo Go (Recommended)

1. **Start the development server** (if not already running):
   ```bash
   npx expo start
   ```

2. **Open Expo Go** on your mobile device

3. **Scan the QR code** that appears in your terminal or browser:
   - **iOS**: Use the built-in Camera app to scan the QR code
   - **Android**: Use the QR scanner in the Expo Go app

4. **Wait for the app to load** - it may take a few moments on first launch

#### Method 2: Using iOS Simulator (Mac only)

1. **Install Xcode** from the Mac App Store (if not already installed)

2. **Start the development server:**
   ```bash
   npx expo start
   ```

3. **Press `i`** in the terminal to open iOS Simulator

#### Method 3: Using Android Emulator

1. **Install Android Studio** and set up an Android Virtual Device (AVD)

2. **Start your Android emulator**

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Press `a`** in the terminal to open in Android emulator

## 🔧 Development Commands

```bash
# Start development server
npx expo start

# Start with cache cleared (useful for troubleshooting)
npx expo start --clear

# Open in iOS Simulator (Mac only)
npx expo start --ios

# Open in Android Emulator
npx expo start --android

# Check for dependency issues
npx expo-doctor

# Update dependencies to match Expo SDK
npx expo install --check
```

## 📱 App Features

- **Mobile-Optimized Login Interface** - Responsive design for all screen sizes
- **PWA-Ready** - Can be installed as a native-like app
- **Secure Authentication** - Demo credentials for testing
- **Modern UI** - Beautiful gradient backgrounds and smooth animations
- **Cross-Platform** - Works on both iOS and Android

## 🎯 Demo Credentials

For testing the app, use these demo credentials:

- **Email:** `demo@solace.app`
- **Password:** `demo123`

## 🐛 Troubleshooting

### Common Issues & Solutions

#### "Cannot determine which native SDK version" Error
- **Problem:** Running `expo start` from wrong directory
- **Solution:** Make sure you're in the `solace-mobile-js` directory:
  ```bash
  cd solace-mobile-js
  npx expo start
  ```

#### "Project is incompatible with this version of Expo Go"
- **Problem:** SDK version mismatch
- **Solution:** Update dependencies:
  ```bash
  npx expo install --check
  ```

#### App crashes with C++ exception
- **Problem:** Dependency conflicts or missing assets
- **Solution:** Clear cache and restart:
  ```bash
  npx expo start --clear
  ```

#### QR Code not scanning
- **Problem:** Network connectivity issues
- **Solution:** 
  - Ensure both devices are on the same WiFi network
  - Try the tunnel connection: `npx expo start --tunnel`

### Getting Help

If you encounter issues:

1. **Check the terminal output** for error messages
2. **Clear the cache** with `npx expo start --clear`
3. **Restart the Metro bundler** by pressing `r` in the terminal
4. **Check network connectivity** between your computer and mobile device

## 📋 Project Structure

```
solace-mobile-js/
├── App.js              # Main application component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel configuration
├── assets/             # App icons and images (optional)
└── README.md           # This file
```

## 🔍 Console Logging

The app includes helpful console logs for debugging:

- `🚀 SOLACE Mobile App initialized` - When the app loads
- `🔐 Login attempt: { email, password: ... }` - When login is attempted

View these logs in:
- **Metro bundler terminal** (where you ran `npx expo start`)
- **Browser developer console** (if using web)
- **Device debugging tools** (for advanced debugging)

## 🌐 Related

- **Web App:** The main SOLACE web application runs at `http://10.40.104.226:3000`
- **PWA Version:** The web app can also be installed as a PWA on mobile devices

## 📝 Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and toolchain
- **JavaScript** - Programming language
- **LinearGradient** - Beautiful gradient backgrounds
- **React Hooks** - State management

---

**SOLACE** - Empowering social workers in the San Francisco Bay Area 🌍 