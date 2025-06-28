# SOLACE - Social Work Operations Assistant

**Social Work Operations and Link-up Assistant for Collaborative Excellence**

Empowering social workers in the San Francisco Bay Area with AI-powered tools for case management, documentation, and collaboration.

## 📁 Project Structure

```
solace/
├── 📱 mobile/          # React Native mobile app (Expo)
├── 🌐 web/             # Next.js web application  
├── 🗄️ backend/         # Python FastAPI backend & database setup
└── 📚 README.md        # This comprehensive guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend)
- Expo CLI (for mobile development)
- Supabase account

### 1. Database Setup (Required First!)
```bash
cd backend
pip install -r requirements.txt

# Set up Supabase:
# 1. Create project at supabase.com
# 2. Run setup-database.sql in SQL Editor
# 3. Update credentials in backend/.env and mobile/lib/supabase.js
```

### 2. Backend API (Python FastAPI)
```bash
cd backend
python start.py
# API runs at http://localhost:8000
```

### 3. Web Application
```bash
cd web
npm install
npm run dev
# Visit http://localhost:3000
```

### 4. Mobile Application
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
- **Framework**: React Native with Expo SDK 51
- **Platform**: iOS and Android
- **Features**: Native mobile experience
- **Authentication**: Supabase Auth (shared with web)
- **API**: Connects to Python FastAPI backend

### 🗄️ Backend (`/backend`)
- **Framework**: Python FastAPI
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT with Supabase Auth
- **AI Services**: Claude 4 (Anthropic), Vapi (Voice)
- **Caching**: Redis (optional)
- **Features**: Client management, case notes, task management, reports

## 🔧 Technology Stack

- **Frontend**: React, Next.js, React Native, Tailwind CSS
- **Backend**: Python FastAPI, Supabase PostgreSQL
- **AI/ML**: Claude 4, Vapi Voice Services
- **Auth**: Supabase Auth (JWT)
- **Mobile**: Expo SDK 51
- **Deployment**: Vercel (web), Expo (mobile), any Python host (backend)

## 📊 Features

### Core Functionality
- ✅ **User Authentication** - Secure login/signup across platforms
- ✅ **Cross-Platform** - Web and mobile apps with shared backend
- ✅ **Real-time Sync** - Data synced across all devices
- ✅ **PWA Support** - Installable web app
- ✅ **Responsive Design** - Works on all screen sizes

### Social Work Tools
- 📋 **Client Management** - Complete CRUD operations for client records
- 📝 **Case Notes** - Digital documentation with voice-to-text
- ✅ **Task Management** - AI-powered task generation and tracking
- 📊 **Reports** - Multi-model AI analysis and report generation
- 🔔 **Notifications** - Task and appointment reminders

### AI-Powered Features
- 🎤 **Voice Notes** - Convert speech to case notes
- 🤖 **Task Generation** - AI suggests tasks based on case context
- 📈 **Report Analysis** - Intelligent report generation
- 🔍 **Classification** - Automated case categorization

## 🔐 Configuration

### Environment Variables

**Backend** (create `backend/.env`):
```env
# Application Settings
NODE_ENV=development
PORT=8000
LOG_LEVEL=INFO

# Database Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# AI Services Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Web App** (create `web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Mobile App** (update `mobile/lib/supabase.js`):
```javascript
const supabaseUrl = 'your_supabase_url_here';
const supabaseAnonKey = 'your_supabase_anon_key_here';
```

### Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your Project URL and anon key

2. **Run Database Setup**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- backend/setup-database.sql
   -- backend/setup-tasks-schema.sql  
   -- backend/setup-case-notes-schema.sql
   ```

3. **Configure Authentication**:
   - Enable email/password auth in Supabase dashboard
   - Set up row-level security policies

## 🔌 API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api` - API information

### Clients
- `GET /api/clients` - List clients
- `GET /api/clients/{id}` - Get client details
- `POST /api/clients` - Create client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Case Notes
- `GET /api/case-notes` - List case notes
- `POST /api/case-notes` - Create case note

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report

## 🧪 Testing

### Demo Credentials
For testing both web and mobile apps:
- **Email**: `demo@solace.app`
- **Password**: `demo123`

### Development Testing
```bash
# Backend API testing
curl http://localhost:8000/health

# Web app testing
cd web && npm run build && npm run dev

# Mobile app testing  
cd mobile && npx expo start --clear
```

## 🚀 Deployment

### Web App (Vercel)
```bash
cd web
npm install -g vercel
vercel --prod
```

### Mobile App (Expo)
```bash
cd mobile
npx expo build:android  # or build:ios
```

### Backend (Python)
```bash
cd backend
python start.py production
# Deploy to any Python hosting service (Heroku, Railway, etc.)
```

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
npm install && npm run dev
```

### Mobile App Issues
```bash
cd mobile
rm -rf node_modules
npm install && npx expo start --clear
```

### Backend Connection Issues
- For physical devices: Replace `localhost` with your computer's IP address
- Check firewall settings for port 8000
- Verify Supabase credentials and network connectivity

## 🛡️ Security & Privacy

- **Authentication**: Secure Supabase Auth with JWT tokens
- **Data Protection**: Row Level Security (RLS) policies
- **HIPAA Considerations**: Designed with privacy best practices
- **Encryption**: Data encrypted in transit and at rest
- **Rate Limiting**: API rate limiting and request validation

## 🔄 Data Flow

1. **Authentication**: Users log in via Supabase Auth (web/mobile)
2. **API Requests**: Frontend apps call Python FastAPI backend
3. **Database**: Backend queries Supabase PostgreSQL with RLS
4. **Real-time**: Changes sync across web and mobile via Supabase
5. **AI Processing**: Voice notes and reports processed via Claude/Vapi

## 📱 Development URLs

- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Supabase Dashboard**: Your project dashboard URL

## 🤝 Contributing

1. Choose your development area:
   - `/web` - Web application features
   - `/mobile` - Mobile app features  
   - `/backend` - API and database changes

2. Follow the setup instructions for your chosen area
3. Make changes and test thoroughly across platforms
4. Submit pull requests with clear descriptions

## 📄 License

This project is designed for social work professionals in the San Francisco Bay Area. Please ensure compliance with local regulations and privacy requirements.

## 🆘 Support

For technical support:
1. Check this README for setup instructions
2. Review the development setup for your specific platform
3. Check console logs and error messages
4. Verify Supabase configuration and connectivity

---

**Built with ❤️ for social workers making a difference in their communities.**
