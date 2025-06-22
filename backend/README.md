# SOLACE Backend - Python Edition

This directory contains the Python FastAPI backend for the Solace application, providing a comprehensive API for social work operations and link-up assistance.

## 🚀 Features

- **👥 Client Management**: Complete CRUD operations for client records
- **📋 Case Notes**: Voice-to-text case note creation and management
- **✅ Task Management**: AI-powered task generation and tracking
- **📊 Reports**: Multi-model AI analysis and report generation
- **🔐 Authentication**: JWT-based authentication with role-based access
- **⚡ Performance**: Redis caching and rate limiting
- **🛡️ Security**: Comprehensive middleware and error handling

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── middleware/      # Authentication, rate limiting, error handling
│   ├── models/          # Pydantic data models
│   ├── routers/         # API endpoints
│   ├── services/        # Business logic
│   └── utils/           # Logging and utilities
├── requirements.txt     # Python dependencies
├── start.py            # Development startup script
└── package.json        # Project metadata
```

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.104.1
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **AI**: Claude 4 (Anthropic), Vapi (Voice), Fetch AI (Agents)
- **Authentication**: JWT with Supabase Auth
- **Deployment**: Uvicorn ASGI server

## 📦 Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**:
   ```bash
   python start.py
   # or
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

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

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# AI Services Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Database Setup

1. Follow the instructions in `SUPABASE_SETUP.md` to set up your Supabase project
2. Run the SQL scripts to set up your database schema
3. Test the setup using the verification scripts

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

## 🧪 Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black src/
```

### Type Checking
```bash
mypy src/
```

### Linting
```bash
flake8 src/
```

## 📊 Database Schema

The database uses Supabase (PostgreSQL) with the following main tables:

- **`profiles`** - User profiles and authentication
- **`clients`** - Client information and case management
- **`case_notes`** - Case notes and documentation
- **`tasks`** - Task management and tracking
- **`reports`** - Report generation and storage

## 🚀 Deployment

### Production Startup
```bash
python start.py production
```

### Docker (Optional)
```bash
# Build image
docker build -t solace-backend .

# Run container
docker run -p 8000:8000 --env-file .env solace-backend
```

## 📝 Logging

Logs are written to:
- Console (development)
- `logs/solace.log` (all logs)
- `logs/error.log` (errors only)

## 🔒 Security Features

- JWT token validation
- Role-based access control
- Rate limiting (100 requests/minute)
- CORS protection
- Request/response validation
- Comprehensive error handling

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow Python PEP 8 style guidelines

## 📄 Legacy Database Files

The following SQL files are maintained for database setup and troubleshooting:

- `setup-database.sql` - Initial database setup and table creation
- `test-signup-process.sql` - Scripts to test the signup process
- `verify-profile-fix.sql` - Scripts to verify profile creation fixes
- `verify-signup-ready.sql` - Scripts to verify signup readiness
- `SUPABASE_SETUP.md` - Detailed Supabase setup instructions
- `create-missing-profile.sql` - Script to create missing profiles
- `database-fix.sql` - Database fixes and optimizations
- `diagnose-signup-issues.sql` - Diagnostic scripts for signup issues
- `direct-profile-fix.sql` - Direct profile fixes

## 📄 License

MIT License - see LICENSE file for details 