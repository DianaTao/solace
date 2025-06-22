import sys
import os
from pathlib import Path
import logging
from typing import Dict, Any

# Add the current directory to the Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Now import everything else
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Import our modules
from config.database import get_supabase, test_database_connection
from routers import clients, case_notes, tasks, reports
from middleware.auth import get_current_user

# Log startup information
logger.info("🚀 Starting SOLACE Backend API...")
logger.info(f"🔧 Python Path: {sys.path[:3]}...")  # Show first 3 path entries
logger.info(f"🔧 Current Directory: {current_dir}")

# Check environment variables
env_vars = {
    'SUPABASE_URL': os.getenv("SUPABASE_URL"),
    'SUPABASE_ANON_KEY': os.getenv("SUPABASE_ANON_KEY"),
    'SUPABASE_JWT_SECRET': os.getenv("SUPABASE_JWT_SECRET"),
    'PORT': os.getenv("PORT", "8000"),
    'LOG_LEVEL': os.getenv("LOG_LEVEL", "INFO"),
    'NODE_ENV': os.getenv("NODE_ENV", "development")
}

logger.info("🔧 Environment Variables Status:")
for key, value in env_vars.items():
    if value:
        if 'KEY' in key or 'SECRET' in key:
            logger.info(f"   ✅ {key}: {value[:20]}...{value[-10:] if len(value) > 30 else value}")
        else:
            logger.info(f"   ✅ {key}: {value}")
    else:
        logger.warning(f"   ⚠️ {key}: NOT SET")

# Test database connection
logger.info("🔍 Testing database connection...")
db_status = test_database_connection()
logger.info(f"🔧 Database Status: {'✅ Connected' if db_status else '❌ Failed'}")

# Create FastAPI app
app = FastAPI(
    title="SOLACE Backend API",
    description="Backend API for SOLACE Social Work Case Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False  # Disable automatic slash redirects
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGIN", "http://localhost:3000").split(",")
logger.info(f"🔧 CORS Origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins + ["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint (no authentication required)
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    logger.info("🔍 Health check requested")
    
    # Test database connectivity
    db_connected = test_database_connection()
    
    health_status = {
        "status": "healthy" if db_connected else "degraded",
        "timestamp": "2024-01-01T00:00:00Z",
        "services": {
            "database": db_connected,
            "clients": True,
            "case_notes": True,
            "tasks": True,
            "reports": True
        }
    }
    
    logger.info(f"📊 Health Status: {health_status}")
    return health_status

# Include routers with authentication
logger.info("🔄 Setting up API routes...")

app.include_router(
    clients.router,
    prefix="/api/clients",
    tags=["clients"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    case_notes.router,
    prefix="/api/case-notes",
    tags=["case_notes"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    tasks.router,
    prefix="/api/tasks",
    tags=["tasks"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    reports.router,
    prefix="/api/reports",
    tags=["reports"],
    dependencies=[Depends(get_current_user)]
)

logger.info("✅ API routes configured successfully")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SOLACE Backend API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Starting server on port {port}")
    logger.info("📋 Server endpoints will be available at:")
    logger.info(f"   🌐 API Health: http://localhost:{port}/api/health")
    logger.info(f"   📚 API Docs: http://localhost:{port}/docs")
    logger.info(f"   📖 ReDoc: http://localhost:{port}/redoc")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    ) 