# SOLACE - Social Work Operations Assistant

**Social Work Operations and Link-up Assistant for Collaborative Excellence**

SOLACE is a mobile-first application designed to empower social workers in the San Francisco Bay Area. It solves critical pain points in the social work field by automating administrative tasks, enhancing inter-agency collaboration, and providing intelligent tools for case management.

## 🎯 Purpose

The primary goal is to free up social workers from burdensome paperwork and fragmented communication, allowing them to focus on direct client interaction and delivering effective care.

## ✨ Key Features

### 🎤 Voice-Driven Documentation
- Real-time voice transcription using Vapi integration
- AI-powered case note generation
- Automatic task extraction from voice recordings
- Professional documentation formatting

### 🤖 Intelligent Case Management
- **Claude Integration**: Task classification and entity extraction
- **Gemini Integration**: Case analysis and narrative generation
- Automated task orchestration and scheduling
- Mood assessment and client status tracking

### 📱 Mobile-First Design
- Responsive design optimized for touch interaction
- Fast load times and minimal data usage
- Native mobile browser feature integration
- Offline-capable functionality

### 🔗 Inter-Agency Collaboration
- Resource discovery and referral system
- Real-time availability tracking
- Secure information sharing between agencies
- Automated follow-up coordination

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom component library
- **Icons**: Lucide React

### Backend
- **Runtime**: Serverless functions (Vercel Functions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

### AI Integrations
- **Voice Processing**: Vapi for real-time transcription
- **Task Extraction**: Anthropic Claude
- **Case Analysis**: Google Gemini
- **Agent Orchestration**: Fetch.ai (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- API keys for AI services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # AI Service API Keys
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   VAPI_PUBLIC_KEY=your_vapi_public_key_here
   VAPI_PRIVATE_KEY=your_vapi_private_key_here

   # Fetch.ai Configuration
   FETCHAI_AGENT_ADDRESS=your_fetchai_agent_address_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   Run the database migrations to create the required tables:
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     agency TEXT,
     role TEXT DEFAULT 'social_worker',
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Clients table
   CREATE TABLE clients (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     email TEXT,
     phone TEXT,
     address TEXT,
     date_of_birth DATE,
     emergency_contact TEXT,
     case_status TEXT DEFAULT 'active',
     assigned_worker_id UUID REFERENCES users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Case notes table
   CREATE TABLE case_notes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     case_id TEXT,
     client_id UUID REFERENCES clients(id),
     worker_id UUID REFERENCES users(id),
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     transcription TEXT,
     mood_assessment TEXT,
     ai_generated BOOLEAN DEFAULT FALSE,
     priority TEXT DEFAULT 'medium',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tasks table
   CREATE TABLE tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     case_id TEXT,
     client_id UUID REFERENCES clients(id),
     worker_id UUID REFERENCES users(id),
     title TEXT NOT NULL,
     description TEXT,
     due_date TIMESTAMP WITH TIME ZONE,
     status TEXT DEFAULT 'pending',
     priority TEXT DEFAULT 'medium',
     task_type TEXT DEFAULT 'other',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Voice sessions table
   CREATE TABLE voice_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     worker_id UUID REFERENCES users(id),
     case_id TEXT,
     client_id UUID REFERENCES clients(id),
     transcription TEXT,
     duration INTEGER DEFAULT 0,
     status TEXT DEFAULT 'recording',
     ai_analysis JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: demo@solace.app
- **Password**: demo123

## 📋 User Flow

### 1. Authentication & Dashboard
- Social worker logs in using agency credentials
- Clean, intuitive dashboard showing assigned cases, urgent alerts, and notifications
- Prominent voice dictation button for quick access

### 2. Voice-Driven Documentation
- Tap "Start Dictation" to activate voice interface
- Speak naturally about case observations and client interactions
- Real-time transcription with visual feedback
- AI processes transcription to extract tasks and generate case notes

### 3. Intelligent Case Management
- **Claude** analyzes transcription and classifies tasks
- **Gemini** generates professional case notes and summaries
- Automatic integration of tasks into worker's task list
- Compliance with standard social work documentation formats

### 4. Task Orchestration
- Extracted tasks appear in organized task list
- Background agents facilitate scheduling and coordination
- Inter-agency communication for status updates
- Automated calendar integration and notifications

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables**
   Configure all environment variables in the Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred hosting platform**
   - Static hosting: Netlify, Vercel, Cloudflare Pages
   - Server hosting: Railway, Heroku, AWS

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── voice/             # Voice recording page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── ui/                # Reusable UI components
│   └── voice/             # Voice recording components
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication service
│   ├── store.ts           # State management
│   ├── supabase.ts        # Database client
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    └── index.ts           # Shared types
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@solace.app
- Documentation: [docs.solace.app](https://docs.solace.app)

## 🙏 Acknowledgments

- San Francisco Bay Area social work community for requirements and feedback
- Vapi for voice transcription technology
- Anthropic for Claude AI integration
- Google for Gemini AI services
- Fetch.ai for agent orchestration platform

---

**SOLACE** - Empowering social workers through intelligent automation and collaboration.
