"""
Google Calendar Integration Router
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from typing import Dict, Any
import logging
import os

from middleware.auth import get_current_user
from services.task_management_service import task_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/auth")
async def google_calendar_auth(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Initiate Google Calendar OAuth flow"""
    try:
        auth_url = task_service.get_google_auth_url(current_user["id"])
        if not auth_url:
            raise HTTPException(
                status_code=503, 
                detail="Google Calendar integration is not configured"
            )
        
        return {"auth_url": auth_url}
    except Exception as e:
        logger.error(f"Failed to get Google auth URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/callback")
async def google_calendar_callback(
    code: str = Query(..., description="Authorization code from Google"),
    state: str = Query(..., description="State parameter containing user ID"),
    error: str = Query(None, description="Error from Google OAuth")
):
    """Handle Google Calendar OAuth callback"""
    try:
        if error:
            logger.error(f"Google OAuth error: {error}")
            # Redirect to frontend with error
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
            return RedirectResponse(
                url=f"{frontend_url}/settings?google_calendar_error={error}"
            )
        
        # In a real implementation, you would:
        # 1. Exchange the code for tokens
        # 2. Store the tokens securely in the database
        # 3. Associate them with the user ID from state
        
        logger.info(f"Google Calendar authorization successful for user {state}")
        
        # For now, just redirect to success page
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            url=f"{frontend_url}/settings?google_calendar_success=true"
        )
        
    except Exception as e:
        logger.error(f"Google Calendar callback error: {e}")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            url=f"{frontend_url}/settings?google_calendar_error=callback_failed"
        )

@router.post("/disconnect")
async def disconnect_google_calendar(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Disconnect Google Calendar integration"""
    try:
        # In a real implementation, you would:
        # 1. Revoke the stored tokens
        # 2. Remove calendar event IDs from tasks
        # 3. Clear user's Google Calendar credentials
        
        logger.info(f"Google Calendar disconnected for user {current_user['id']}")
        return {"message": "Google Calendar integration disconnected successfully"}
        
    except Exception as e:
        logger.error(f"Failed to disconnect Google Calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def google_calendar_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get Google Calendar integration status"""
    try:
        # In a real implementation, check if user has valid tokens
        is_connected = False  # Placeholder
        
        return {
            "connected": is_connected,
            "available": task_service.google_calendar_enabled,
            "calendar_id": task_service.calendar_id if is_connected else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get Google Calendar status: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 