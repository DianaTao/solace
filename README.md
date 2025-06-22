# SOLACE - Social Work Operations Assistant

**Social Work Operations and Link-up Assistant for Collaborative Excellence**

Empowering social workers in the San Francisco Bay Area with AI-powered tools for case management, documentation, and collaboration.

## 📁 Project Structure

```
solace/
├── 📱 mobile/          # React Native mobile app
├── 🌐 web/             # Next.js web application  
├── 🗄️ backend/         # Database setup and configuration
├── 📚 README.md        # This file
└── 📋 SETUP.md         # Quick setup guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (for mobile development)
- Supabase account

### 1. Database Setup
   ```bash
# Navigate to backend folder and follow database setup
cd backend
# Run the SQL scripts in your Supabase dashboard
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

## 🏗️ Architecture

### 🌐 Web App (`/web`)
- **Framework**: Next.js 15 with JavaScript
- **Styling**: Tailwind CSS
- **Features**: PWA-ready, responsive design
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL

### 📱 Mobile App (`/mobile`)
- **Framework**: React Native with Expo
- **Platform**: iOS and Android
- **Features**: Native mobile experience
- **Authentication**: Supabase Auth (shared with web)
- **Database**: Supabase PostgreSQL (shared with web)

### 🗄️ Backend (`/backend`)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Files**: SQL setup scripts, database schema
- **Security**: Row Level Security (RLS) policies

## 🔧 Technology Stack

- **Frontend**: React, Next.js, React Native, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Language**: JavaScript (ES6+)
- **Mobile**: Expo SDK 51
- **Deployment**: Vercel (web), Expo (mobile)

## 📊 Features

### Core Functionality
- ✅ **User Authentication** - Secure login/signup
- ✅ **Cross-Platform** - Web and mobile apps
- ✅ **Real-time Sync** - Data synced across devices
- ✅ **PWA Support** - Installable web app
- ✅ **Responsive Design** - Works on all screen sizes

### Social Work Tools
- 📋 **Case Management** - Track client cases
- 📝 **Documentation** - Digital case notes
- 📞 **Communication** - Client contact management
- 📊 **Reporting** - Generate reports and analytics
- 🔔 **Notifications** - Task and appointment reminders

## 🛡️ Security & Privacy

- **Authentication**: Secure Supabase Auth
- **Data Protection**: Row Level Security (RLS)
- **HIPAA Considerations**: Designed with privacy in mind
- **Encryption**: Data encrypted in transit and at rest

## 🚀 Development

### Web Development
   ```bash
cd web
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Code linting
```

### Mobile Development
   ```bash
cd mobile
npx expo start           # Start development server
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npx expo build          # Production build
   ```

### Database Development
   ```bash
cd backend
# Run SQL scripts in Supabase dashboard
# Check database-fix.sql for troubleshooting
```

## 📱 Demo Credentials

For testing both web and mobile apps:
- **Email**: `demo@solace.app`
- **Password**: `demo123`

## 🔗 Links

- **Web App**: http://localhost:3000 (development)
- **Supabase Dashboard**: https://ccotkrhrqkldgfdjnlea.supabase.co
- **Documentation**: See individual folder READMEs

## 🤝 Contributing

1. Choose your development area:
   - `/web` - Web application features
   - `/mobile` - Mobile app features  
   - `/backend` - Database and API changes

2. Follow the development setup for your chosen area
3. Make changes and test thoroughly
4. Submit pull requests with clear descriptions

## 📄 License

This project is designed for social work professionals in the San Francisco Bay Area. Please ensure compliance with local regulations and privacy requirements.

## 🆘 Support

For technical support or questions:
1. Check the relevant folder's README
2. Review the SETUP.md guide
3. Check the backend database setup scripts
4. Create an issue with detailed information

---

**Built with ❤️ for social workers making a difference in their communities.**
