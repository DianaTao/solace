#!/usr/bin/env python3
"""
SOLACE Backend Startup Script
Quick start script for development and production
"""

import os
import sys
import subprocess
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 9):
        print("❌ Python 3.9 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import supabase
        import anthropic
        print("✅ All required dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)

def check_env_file():
    """Check if .env file exists"""
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("⚠️  .env file not found")
        print("Copy env.example to .env and configure your settings")
        return False
    print("✅ .env file found")
    return True

def start_development():
    """Start the development server"""
    print("🚀 Starting SOLACE Backend in development mode...")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Set development environment
    os.environ.setdefault("NODE_ENV", "development")
    
    # Start uvicorn with reload
    cmd = [
        sys.executable, "-m", "uvicorn", 
        "src.main:app", 
        "--reload", 
        "--host", "0.0.0.0", 
        "--port", "8000",
        "--log-level", "info"
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n👋 Shutting down SOLACE Backend...")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

def start_production():
    """Start the production server"""
    print("🚀 Starting SOLACE Backend in production mode...")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Set production environment
    os.environ.setdefault("NODE_ENV", "production")
    
    # Start uvicorn
    cmd = [
        sys.executable, "-m", "uvicorn", 
        "src.main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000",
        "--workers", "4"
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n👋 Shutting down SOLACE Backend...")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("🎯 SOLACE Backend - Python Edition")
    print("=" * 50)
    
    # Pre-flight checks
    check_python_version()
    check_dependencies()
    env_exists = check_env_file()
    
    # Parse command line arguments
    mode = "dev"
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
    
    if mode in ["prod", "production"]:
        if not env_exists:
            print("❌ .env file required for production mode")
            sys.exit(1)
        start_production()
    else:
        start_development()

if __name__ == "__main__":
    main() 