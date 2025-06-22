"""
Database configuration for Supabase
"""

import os
import logging
from supabase import create_client, Client
from typing import Optional

# Set up logger
logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None

def get_supabase() -> Client:
    """
    Get or create Supabase client instance (singleton pattern)
    """
    global _supabase_client
    
    if _supabase_client is None:
        logger.info("🔄 Initializing Supabase client...")
        
        # Get credentials from environment
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        logger.info(f"🔧 Supabase URL configured: {bool(supabase_url)}")
        logger.info(f"🔧 Supabase Anon Key configured: {bool(supabase_key)}")
        
        if supabase_url:
            logger.info(f"🌐 Supabase URL: {supabase_url}")
        if supabase_key:
            logger.info(f"🔑 Supabase Key preview: {supabase_key[:20]}...{supabase_key[-10:]}")
        
        if not supabase_url or not supabase_key:
            error_msg = "Missing required Supabase credentials"
            logger.error(f"❌ {error_msg}")
            logger.error("❌ Required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY")
            raise ValueError(error_msg)
        
        try:
            _supabase_client = create_client(supabase_url, supabase_key)
            logger.info("✅ Supabase client initialized successfully")
            
            # Test connection
            logger.info("🔍 Testing Supabase connection...")
            test_response = _supabase_client.table("profiles").select("count").limit(1).execute()
            logger.info(f"✅ Supabase connection test successful: {bool(test_response)}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {type(e).__name__}: {e}")
            raise
    
    return _supabase_client

def test_database_connection():
    """
    Test database connection and log results
    """
    try:
        logger.info("🔍 Testing database connection...")
        supabase = get_supabase()
        
        # Test basic query
        result = supabase.table("profiles").select("count").limit(1).execute()
        logger.info(f"✅ Database connection successful. Response: {bool(result)}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {type(e).__name__}: {e}")
        return False 