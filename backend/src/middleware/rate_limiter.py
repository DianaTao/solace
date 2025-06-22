"""
Rate limiting middleware
"""

import time
import logging
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from config.redis_client import get_redis
from typing import Dict

logger = logging.getLogger(__name__)

# In-memory fallback for rate limiting when Redis is not available
rate_limit_cache: Dict[str, Dict[str, float]] = {}

async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware
    """
    
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/health", "/api", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    # Get client IP
    client_ip = request.client.host
    
    # Rate limit configuration
    max_requests = 100  # requests per minute
    window_seconds = 60
    
    try:
        redis_client = get_redis()
        
        # Use Redis for rate limiting if available
        current_time = time.time()
        key = f"rate_limit:{client_ip}"
        
        # Check if Redis is available (not MockRedis)
        if hasattr(redis_client, 'pipeline'):
            # Redis is available
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, current_time - window_seconds)
            pipe.zcard(key)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, window_seconds)
            results = await pipe.execute()
            
            request_count = results[1]
        else:
            # Use in-memory fallback
            if client_ip not in rate_limit_cache:
                rate_limit_cache[client_ip] = {}
            
            client_cache = rate_limit_cache[client_ip]
            
            # Clean old entries
            cutoff_time = current_time - window_seconds
            client_cache = {k: v for k, v in client_cache.items() if v > cutoff_time}
            rate_limit_cache[client_ip] = client_cache
            
            # Add current request
            client_cache[str(current_time)] = current_time
            request_count = len(client_cache)
        
        # Check if rate limit exceeded
        if request_count > max_requests:
            logger.warning(f"Rate limit exceeded for IP {client_ip}: {request_count} requests")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {max_requests} per minute",
                    "retry_after": window_seconds
                },
                headers={"Retry-After": str(window_seconds)}
            )
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, max_requests - request_count))
        response.headers["X-RateLimit-Reset"] = str(int(current_time + window_seconds))
        
        return response
        
    except Exception as e:
        logger.error(f"Rate limiting error: {e}")
        # Continue without rate limiting if there's an error
        return await call_next(request) 