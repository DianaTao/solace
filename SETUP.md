# SOLACE - Quick Setup Guide

This guide will help you get SOLACE up and running quickly with the new organized structure.

## 📁 Project Structure

```
solace/
├── 📱 mobile/          # React Native mobile app
├── 🌐 web/             # Next.js web application  
├── 🗄️ backend/         # Database setup and configuration
├── 📚 README.md        # Main project documentation
└── 📋 SETUP.md         # This quick setup guide
```

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (for mobile development)
- Supabase account

## 🚀 Quick Start

### 1. Database Setup (First!)
```bash
cd backend
# Follow backend/README.md for Supabase setup
# Run setup-database.sql in Supabase SQL Editor
```

### 2. Web Application
```bash
cd web
npm install
npm run dev
# Visit http://localhost:3000
```

### 3. Mobile Application
```bash
cd mobile
npm install
npx expo start
# Use Expo Go app or simulator
```

## 🔧 Configuration

### Database (Required)
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `backend/setup-database.sql` in SQL Editor
3. Note your project URL and API key

### Web App
- Uses hardcoded Supabase config (no env vars needed)
- Configured in `web/src/lib/supabase.js`

### Mobile App
- Uses hardcoded Supabase config
- Configured in `mobile/lib/supabase.js`

## 📱 Demo Credentials

For testing both web and mobile apps:
- **Email**: `demo@solace.app`
- **Password**: `demo123`

## 🐛 Troubleshooting

### Database Issues
```bash
cd backend
# Run database-fix.sql if user profiles aren't being created
```

### Web App Issues
```bash
cd web
rm -rf .next node_modules
npm install
npm run dev
```

### Mobile App Issues
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

## 📚 Detailed Documentation

- **Main Overview**: `README.md`
- **Web App**: `web/README.md`
- **Mobile App**: `mobile/README.md`
- **Backend/Database**: `backend/README.md`

## 🔗 Development URLs

- **Web App**: http://localhost:3000
- **Mobile App**: Expo DevTools (varies)
- **Supabase**: https://ccotkrhrqkldgfdjnlea.supabase.co

---

**Choose your development focus and dive into the specific folder documentation!** 