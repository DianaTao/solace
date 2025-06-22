"""
Case notes service with voice integration and database operations
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from config.database import get_supabase
from services.voice_service import voice_service

logger = logging.getLogger(__name__)


class CaseNotesService:
    """Service for case notes management with voice integration"""
    
    def __init__(self):
        self.logger = logger
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        try:
            supabase = get_supabase()
            return supabase is not None
        except Exception:
            return False
    
    # ===== CASE NOTES CRUD OPERATIONS =====
    
    async def get_case_notes(
        self,
        user_id: str,
        client_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status: str = "active",
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get list of case notes with optional filtering"""
        try:
            supabase = get_supabase()
            
            # For now, return empty list until schema is implemented
            # TODO: Implement actual database queries after schema setup
            return []
            
        except Exception as e:
            self.logger.error(f"❌ Error getting case notes: {e}")
            raise
    
    async def create_case_note(
        self, 
        case_note_data: Dict[str, Any], 
        user_id: str
    ) -> Dict[str, Any]:
        """Create a new case note"""
        try:
            supabase = get_supabase()
            
            # For now, return mock data
            # TODO: Implement actual database operations after schema setup
            mock_note = {
                "id": str(uuid.uuid4()),
                "title": case_note_data["title"],
                "content": case_note_data["content"],
                "client_id": case_note_data["client_id"],
                "social_worker_id": user_id,
                "category": case_note_data.get("category", "general"),
                "priority": case_note_data.get("priority", "medium"),
                "status": "active",
                "intake_method": case_note_data.get("intake_method", "manual"),
                "has_voice_recording": case_note_data.get("has_voice_recording", False),
                "tts_generated": False,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            self.logger.info(f"✅ Mock created case note {mock_note['id']}")
            return mock_note
            
        except Exception as e:
            self.logger.error(f"❌ Error creating case note: {e}")
            raise
    
    # ===== VOICE INTEGRATION OPERATIONS =====
    
    async def start_voice_intake(
        self, 
        client_id: str, 
        user_id: str,
        session_type: str = "intake",
        phone_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """Start a voice intake session for case notes"""
        try:
            # Start voice session with OpenAI Whisper
            voice_response = await voice_service.start_voice_intake(
                client_id=client_id,
                social_worker_id=user_id,
                session_type=session_type,
                phone_number=phone_number
            )
            
            self.logger.info(f"✅ Started voice intake session {voice_response.get('voice_session_id')}")
            
            return voice_response
            
        except Exception as e:
            self.logger.error(f"❌ Error starting voice intake: {e}")
            raise
    
    async def generate_tts_for_note(
        self, 
        note_id: str, 
        user_id: str,
        voice_id: Optional[str] = None,
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Generate TTS audio for a case note"""
        try:
            # Mock case note content for TTS
            mock_content = f"Case note {note_id} content for TTS generation."
            
            # Generate TTS using voice service
            tts_response = await voice_service.generate_tts(
                case_note_id=note_id,
                text_content=mock_content,
                voice_id=voice_id,
                speed=speed
            )
            
            self.logger.info(f"✅ Generated TTS for case note {note_id}")
            
            return tts_response
            
        except Exception as e:
            self.logger.error(f"❌ Error generating TTS for note {note_id}: {e}")
            raise
    
    async def get_case_notes_analytics(
        self, 
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get analytics for case notes"""
        try:
            # Return mock analytics for now
            analytics = {
                "total_notes": 0,
                "voice_notes": 0,
                "manual_notes": 0,
                "tts_generated": 0,
                "voice_adoption_rate": 0.0,
                "tts_adoption_rate": 0.0,
                "category_distribution": {},
                "priority_distribution": {},
                "period_days": days
            }
            
            self.logger.info(f"✅ Generated mock analytics for user {user_id}")
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"❌ Error generating analytics: {e}")
            raise
