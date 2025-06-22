# SOLACE Web Application

**Next.js Progressive Web App for Social Workers**

A responsive, PWA-ready web application built with Next.js 15 and JavaScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation & Setup
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

## 🔧 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── favicon.ico      # App icon
│   │   ├── globals.css      # Global styles
│   │   ├── layout.jsx       # Root layout
│   │   └── page.jsx         # Home page (login/signup)
│   └── lib/                 # Utility libraries
│       ├── auth.js          # Authentication service
│       ├── store.js         # State management
│       ├── supabase.js      # Database client
│       └── utils.js         # Helper functions
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   └── *.svg               # Icons and graphics
├── package.json            # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── eslint.config.mjs       # ESLint configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Technology Stack

- **Framework**: Next.js 15
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **PWA**: Next.js PWA support
- **State**: React hooks + Context

## ✨ Features

### Core Features
- ✅ **Responsive Design** - Works on all devices
- ✅ **PWA Support** - Installable as native app
- ✅ **Authentication** - Secure login/signup
- ✅ **Real-time Sync** - Live data updates
- ✅ **Offline Ready** - Basic offline functionality

### User Interface
- 🎨 **Modern Design** - Clean, professional interface
- 📱 **Mobile-First** - Optimized for mobile devices
- 🌙 **Accessible** - WCAG compliant design
- ⚡ **Fast Loading** - Optimized performance

### Authentication Flow
- 📧 **Email/Password** - Standard authentication
- 🔄 **Auto-Login** - Remember user sessions
- 🔐 **Secure** - Protected routes and data
- 👤 **User Profiles** - Manage user information

## 🗄️ Database Integration

The web app connects to a shared Supabase database with:

- **Users Table** - User profiles and settings
- **Clients Table** - Client information management
- **Case Notes** - Documentation and notes
- **Tasks** - Task management and tracking
- **Real-time** - Live updates across devices

## 🔐 Authentication

Uses Supabase Auth with enhanced error handling:

```javascript
// Example usage
import { AuthService } from '../lib/auth';

// Sign in
const { user, session } = await AuthService.signIn({
  email: 'user@example.com',
  password: 'password'
});

// Sign up
await AuthService.signUp(email, password, {
  name: 'User Name',
  role: 'social_worker'
});

// Get current user
const user = await AuthService.getCurrentUser();
```

## 📱 PWA Features

The web app is PWA-ready with:

- **Installable** - Add to home screen
- **Offline Support** - Basic offline functionality
- **Push Notifications** - (Future feature)
- **App-like Experience** - Native app feel

### Installing as PWA
1. Visit the web app in Chrome/Edge
2. Look for "Install" prompt in address bar
3. Click "Install" to add to home screen
4. Launch like a native app

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Manual Build
```bash
# Create production build
npm run build

# Start production server
npm run start
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` in the web directory:
```env
# Not needed - using hardcoded Supabase config
# NEXT_PUBLIC_SUPABASE_URL=your_url_here
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### Supabase Configuration
Located in `src/lib/supabase.js` with hardcoded credentials for consistency with mobile app.

## 🧪 Testing

### Demo Credentials
- **Email**: `demo@solace.app`
- **Password**: `demo123`

### Manual Testing
1. Visit http://localhost:3000
2. Test signup/login flows
3. Verify PWA installation
4. Test responsive design
5. Check browser console for errors

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Authentication Issues**
- Check browser console for Supabase errors
- Verify database connection
- Check user profile creation

**PWA Issues**
- Ensure HTTPS in production
- Check manifest.json validity
- Verify service worker registration

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 🔗 Related

- **Mobile App**: `../mobile/` - React Native mobile app
- **Backend**: `../backend/` - Database setup and configuration
- **Main README**: `../README.md` - Project overview

## 📝 Development Notes

- Uses JavaScript instead of TypeScript for simplicity
- Tailwind CSS for rapid styling
- Shared Supabase backend with mobile app
- Enhanced error handling for auth operations
- PWA-ready with offline support

---

**Part of the SOLACE ecosystem - empowering social workers with modern technology.** 