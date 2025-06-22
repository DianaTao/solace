"""
Case notes service for business logic
"""

import logging

logger = logging.getLogger(__name__)

class CaseNotesService:
    def __init__(self):
        self.logger = logger
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return True 