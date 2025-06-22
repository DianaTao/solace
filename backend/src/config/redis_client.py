"""
Redis client configuration for caching and session management
"""

import os
import logging
import redis.asyncio as redis
from typing import Optional

logger = logging.getLogger(__name__)

# Global Redis client
redis_client: Optional[redis.Redis] = None

async def init_redis() -> redis.Redis:
    """Initialize Redis client"""
    global redis_client
    
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        
        redis_client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        
        # Test connection
        await redis_client.ping()
        logger.info("✅ Redis client initialized successfully")
        return redis_client
        
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}. Running without cache.")
        # Create a mock Redis client that does nothing
        redis_client = MockRedis()
        return redis_client

def get_redis() -> redis.Redis:
    """Get the initialized Redis client"""
    if redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return redis_client

class MockRedis:
    """Mock Redis client for when Redis is not available"""
    
    async def get(self, key: str) -> Optional[str]:
        return None
    
    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        return True
    
    async def delete(self, key: str) -> int:
        return 0
    
    async def exists(self, key: str) -> int:
        return 0
    
    async def ping(self) -> bool:
        return True
    
    async def close(self):
        pass 