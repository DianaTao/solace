"""
Authentication middleware for JWT token validation
"""

import os
import jwt
import logging
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from config.database import get_supabase

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Validate JWT token and return current user information
    """
    logger.info("🔐 Starting authentication process")
    
    try:
        token = credentials.credentials
        logger.info(f"🔑 Received token: {token[:20]}...{token[-10:] if len(token) > 30 else token}")
        
        # Check if this is the anon key (which shouldn't be used for user authentication)
        supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        if token == supabase_anon_key:
            logger.error("❌ Received anon key instead of user access token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Anonymous key cannot be used for authenticated requests. Please sign in to get a user access token."
            )
        
        # Get JWT secret from environment
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        logger.info(f"🔧 JWT Secret configured: {bool(jwt_secret and jwt_secret != 'your_supabase_jwt_secret_here')}")
        
        if not jwt_secret or jwt_secret == "your_supabase_jwt_secret_here":
            logger.warning("⚠️ SUPABASE_JWT_SECRET not configured, using Supabase client validation")
            
            # Alternative: Try to validate using Supabase client directly
            try:
                logger.info("🔄 Attempting Supabase client validation")
                supabase = get_supabase()
                logger.info("✅ Supabase client retrieved successfully")
                
                # Use Supabase to verify the token by making a simple authenticated request
                logger.info("🔍 Attempting to get user from token")
                user_response = supabase.auth.get_user(token)
                logger.info(f"📊 User response: {bool(user_response)} | User: {bool(user_response.user if hasattr(user_response, 'user') else False)}")
                
                if hasattr(user_response, 'user') and user_response.user:
                    user_id = user_response.user.id
                    email = user_response.user.email
                    logger.info(f"👤 User validated - ID: {user_id}, Email: {email}")
                    
                    # Get user profile from database
                    logger.info("🔍 Fetching user profile from database")
                    result = supabase.table("profiles").select("*").eq("id", user_id).execute()
                    logger.info(f"📊 Profile query result: {len(result.data) if result.data else 0} records found")
                    
                    user_profile = {}
                    if result.data:
                        user_profile = result.data[0]
                        logger.info(f"👤 Profile loaded: {user_profile.get('name', 'No name')}")
                    else:
                        logger.warning(f"⚠️ No profile found for user {user_id}, creating default profile")
                        user_profile = {
                            "name": email.split("@")[0],
                            "role": "social_worker"
                        }
                    
                    # Return user information
                    user_info = {
                        "id": user_id,
                        "email": email,
                        "name": user_profile.get("name", email.split("@")[0]),
                        "role": user_profile.get("role", "social_worker"),
                        "token_payload": {"sub": user_id, "email": email}
                    }
                    logger.info(f"✅ Authentication successful for user: {email}")
                    return user_info
                else:
                    logger.error("❌ Supabase user validation failed - no user in response")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token - user not found"
                    )
                    
            except Exception as supabase_error:
                logger.error(f"❌ Supabase token validation failed: {type(supabase_error).__name__}: {supabase_error}")
                logger.error(f"❌ Full error details: {str(supabase_error)}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Authentication failed: {str(supabase_error)}"
                )
        
        # Original JWT validation code (when JWT secret is properly configured)
        logger.info("🔐 Using JWT secret validation")
        try:
            payload = jwt.decode(
                token, 
                jwt_secret, 
                algorithms=["HS256"],
                audience="authenticated"
            )
            logger.info(f"✅ JWT decoded successfully: {payload.get('sub', 'No sub')}")
        except jwt.ExpiredSignatureError:
            logger.error("❌ JWT token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.error(f"❌ Invalid JWT token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Extract user information
        user_id = payload.get("sub")
        if not user_id:
            logger.error("❌ No user ID in JWT payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Get user profile from database
        logger.info(f"🔍 Fetching profile for user: {user_id}")
        supabase = get_supabase()
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not result.data:
            logger.error(f"❌ User profile not found for ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_profile = result.data[0]
        logger.info(f"✅ JWT authentication successful for user: {payload.get('email')}")
        
        # Return user information
        return {
            "id": user_id,
            "email": payload.get("email"),
            "name": user_profile.get("name"),
            "role": user_profile.get("role", "user"),
            "token_payload": payload
        }
        
    except HTTPException:
        logger.error("❌ Authentication failed with HTTPException")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected authentication error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    """
    Optional authentication - returns user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

def require_role(required_role: str):
    """
    Decorator to require specific user role
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role", "user")
        
        # Define role hierarchy
        role_hierarchy = {
            "user": 0,
            "social_worker": 1,
            "supervisor": 2,
            "admin": 3
        }
        
        required_level = role_hierarchy.get(required_role, 0)
        user_level = role_hierarchy.get(user_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        
        return current_user
    
    return role_checker 