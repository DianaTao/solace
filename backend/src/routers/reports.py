"""
Reports API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from middleware.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_reports(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get reports"""
    return {"message": "Reports endpoint - Coming soon!", "user": current_user["name"]}

@router.post("/generate")
async def generate_report(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Generate a new report"""
    return {"message": "Generate report endpoint - Coming soon!", "user": current_user["name"]} 