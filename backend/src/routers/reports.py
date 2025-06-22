"""
AI-powered reports API endpoints with Claude integration
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, Optional
from datetime import datetime
from middleware.auth import get_current_user
from services.report_analysis_service import ReportAnalysisService

router = APIRouter()

# Initialize the AI report service
report_service = ReportAnalysisService()

@router.get("/")
async def get_reports(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get available reports and service status"""
    return {
        "message": "SOLACE AI-Powered Reports Service",
        "user": current_user["name"],
        "available_reports": [
            {
                "type": "monthly_case_summary",
                "name": "Monthly Case Summary",
                "description": "AI-generated monthly analysis of case management activities",
                "endpoint": "/api/reports/monthly-summary"
            },
            {
                "type": "quarterly_outcome",
                "name": "Quarterly Outcome Report", 
                "description": "AI-powered quarterly analysis of client outcomes and trends",
                "endpoint": "/api/reports/quarterly-outcome"
            }
        ],
        "ai_service_status": "enabled" if report_service.is_healthy() else "disabled",
        "features": {
            "claude_ai_analysis": report_service.is_healthy(),
            "database_integration": True,
            "real_time_generation": True
        }
    }

@router.post("/generate")
async def generate_report(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Generate a new report - deprecated, use specific endpoints"""
    return {
        "message": "This endpoint is deprecated. Please use specific report endpoints:",
        "endpoints": {
            "monthly_summary": "/api/reports/monthly-summary",
            "quarterly_outcome": "/api/reports/quarterly-outcome"
        },
        "user": current_user["name"]
    }

@router.post("/monthly-summary")
async def generate_monthly_case_summary(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2020, le=2030, description="Year"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate AI-powered monthly case summary report"""
    try:
        # Validate date parameters
        current_date = datetime.now()
        requested_date = datetime(year, month, 1)
        
        if requested_date > current_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot generate reports for future dates"
            )
        
        report = await report_service.generate_monthly_case_summary(
            user_id=current_user["id"],
            month=month,
            year=year
        )
        
        return {
            "message": "Monthly case summary generated successfully",
            "report": report,
            "generated_for": current_user["name"],
            "generation_time": datetime.utcnow().isoformat(),
            "ai_enabled": report_service.is_healthy()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate monthly case summary: {str(e)}"
        )

@router.post("/quarterly-outcome")
async def generate_quarterly_outcome_report(
    quarter: int = Query(..., ge=1, le=4, description="Quarter (1-4)"),
    year: int = Query(..., ge=2020, le=2030, description="Year"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate AI-powered quarterly outcome report"""
    try:
        # Validate date parameters
        current_date = datetime.now()
        quarter_start_month = (quarter - 1) * 3 + 1
        requested_date = datetime(year, quarter_start_month, 1)
        
        if requested_date > current_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot generate reports for future quarters"
            )
        
        report = await report_service.generate_quarterly_outcome_report(
            user_id=current_user["id"],
            quarter=quarter,
            year=year
        )
        
        return {
            "message": "Quarterly outcome report generated successfully",
            "report": report,
            "generated_for": current_user["name"],
            "generation_time": datetime.utcnow().isoformat(),
            "ai_enabled": report_service.is_healthy()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quarterly outcome report: {str(e)}"
        )

@router.get("/service-status")
async def get_service_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get AI report service health status"""
    try:
        health_status = {
            "service_healthy": report_service.is_healthy(),
            "claude_ai_configured": bool(report_service.anthropic_key),
            "available_features": {
                "monthly_case_summary": report_service.is_healthy(),
                "quarterly_outcome_report": report_service.is_healthy(),
                "real_time_generation": True,
                "database_integration": True
            },
            "last_checked": datetime.utcnow().isoformat()
        }
        
        if not report_service.is_healthy():
            health_status["message"] = "AI service unavailable - check ANTHROPIC_API_KEY configuration"
        else:
            health_status["message"] = "AI report service is operational"
        
        return health_status
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check service status: {str(e)}"
        ) 