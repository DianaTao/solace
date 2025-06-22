"""
Global error handler middleware
"""

import logging
import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

logger = logging.getLogger(__name__)

async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for the application
    """
    
    # If it's already an HTTPException, return it as-is
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
                "path": request.url.path,
                "method": request.method
            }
        )
    
    # Log the full traceback for debugging
    logger.error(f"Unhandled exception in {request.method} {request.url.path}: {exc}")
    logger.error(traceback.format_exc())
    
    # Return a generic error response
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "status_code": HTTP_500_INTERNAL_SERVER_ERROR,
            "path": request.url.path,
            "method": request.method,
            "message": "An unexpected error occurred. Please try again later."
        }
    ) 