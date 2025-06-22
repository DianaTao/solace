"""
Case notes API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from middleware.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_case_notes(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get case notes"""
    # TODO: Implement actual case notes retrieval from database
    # For now, return empty array to avoid frontend errors
    return []

@router.post("/")
async def create_case_note(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Create a new case note"""
    return {"message": "Create case note endpoint - Coming soon!", "user": current_user["name"]} 