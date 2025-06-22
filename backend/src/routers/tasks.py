"""
Tasks API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from middleware.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_tasks(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get tasks"""
    # TODO: Implement actual tasks retrieval from database
    # For now, return empty array to avoid frontend errors
    return []

@router.post("/")
async def create_task(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Create a new task"""
    return {"message": "Create task endpoint - Coming soon!", "user": current_user["name"]} 