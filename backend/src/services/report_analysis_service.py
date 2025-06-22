"""
Report analysis service for business logic
"""

import logging

logger = logging.getLogger(__name__)

class ReportAnalysisService:
    def __init__(self):
        self.logger = logger
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return True 