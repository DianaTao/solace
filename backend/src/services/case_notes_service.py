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
    
    async def create_note_from_transcript(
        self, 
        transcript_result: Dict[str, Any], 
        client_id: str,
        user_id: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create an organized case note from voice transcript"""
        try:
            transcript_text = transcript_result.get("transcript", "")
            analysis = transcript_result.get("analysis", {})
            
            # Extract key information from analysis
            keywords = analysis.get("keywords", [])
            sentiment = analysis.get("sentiment", "neutral")
            urgency_indicators = analysis.get("urgency_indicators", [])
            word_count = analysis.get("word_count", 0)
            
            # Generate an organized title based on keywords and content
            title = self._generate_note_title(transcript_text, keywords, urgency_indicators)
            
            # Organize the content with structure
            organized_content = self._organize_transcript_content(
                transcript_text, analysis, transcript_result
            )
            
            # Determine priority based on urgency indicators
            priority = "high" if urgency_indicators else "medium"
            if sentiment == "negative" and urgency_indicators:
                priority = "urgent"
            
            # Determine category based on keywords
            category = self._determine_category(keywords)
            
            # Create the case note
            case_note_data = {
                "title": title,
                "content": organized_content,
                "client_id": client_id,
                "category": category,
                "priority": priority,
                "tags": keywords[:5],  # Limit to 5 most relevant tags
                "voice_session_id": session_id,
                "transcript_confidence": transcript_result.get("confidence", 0.0),
                "source": "voice_transcription"
            }
            
            case_note = await self.create_case_note(case_note_data, user_id)
            
            self.logger.info(f"✅ Created organized case note from transcript: {case_note['id']}")
            
            return case_note
            
        except Exception as e:
            self.logger.error(f"❌ Error creating note from transcript: {e}")
            raise
    
    def _generate_note_title(self, transcript: str, keywords: List[str], urgency_indicators: List[str]) -> str:
        """Generate a meaningful title for the case note"""
        if urgency_indicators:
            return f"Urgent: {urgency_indicators[0].title()} - Voice Note"
        elif keywords:
            primary_keyword = keywords[0].title().replace("_", " ")
            return f"{primary_keyword} - Voice Note"
        else:
            # Use first few words of transcript
            words = transcript.split()[:4]
            if words:
                return f"{''.join(words).title()[:30]}... - Voice Note"
            return "Voice Note"
    
    def _organize_transcript_content(
        self, transcript: str, analysis: Dict[str, Any], transcript_result: Dict[str, Any]
    ) -> str:
        """Organize transcript into structured content"""
        organized_parts = []
        
        # Add summary header
        organized_parts.append("## Voice Transcription Summary")
        organized_parts.append("")
        
        # Add key information if available
        keywords = analysis.get("keywords", [])
        urgency = analysis.get("urgency_indicators", [])
        sentiment = analysis.get("sentiment", "neutral")
        
        if keywords or urgency:
            organized_parts.append("### Key Information")
            if keywords:
                organized_parts.append(f"**Topics Discussed:** {', '.join(keywords)}")
            if urgency:
                organized_parts.append(f"**Urgency Indicators:** {', '.join(urgency)}")
            organized_parts.append(f"**Overall Sentiment:** {sentiment.title()}")
            organized_parts.append("")
        
        # Add main transcript
        organized_parts.append("### Full Transcript")
        organized_parts.append(transcript)
        organized_parts.append("")
        
        # Add technical details
        organized_parts.append("### Transcription Details")
        duration = transcript_result.get("duration_seconds", 0)
        confidence = transcript_result.get("confidence", 0.0)
        word_count = analysis.get("word_count", 0)
        
        organized_parts.append(f"- **Duration:** {duration:.1f} seconds")
        organized_parts.append(f"- **Confidence:** {confidence:.1%}")
        organized_parts.append(f"- **Word Count:** {word_count}")
        organized_parts.append(f"- **Language:** {transcript_result.get('language', 'en')}")
        
        return "\n".join(organized_parts)
    
    def _determine_category(self, keywords: List[str]) -> str:
        """Determine case note category based on keywords"""
        category_mapping = {
            "housing": ["housing", "rent", "eviction", "homeless", "shelter"],
            "medical": ["medical", "health", "doctor", "hospital", "medication"],
            "family": ["family", "children", "child", "parent", "custody"],
            "employment": ["job", "work", "employment", "unemployment", "career"],
            "financial": ["money", "financial", "budget", "debt", "assistance"],
            "legal": ["legal", "court", "lawyer", "law", "rights"],
            "mental_health": ["mental health", "depression", "anxiety", "therapy"],
            "safety": ["safety", "abuse", "violence", "domestic", "danger"],
            "education": ["school", "education", "learning", "student"]
        }
        
        for category, category_keywords in category_mapping.items():
            if any(keyword in category_keywords for keyword in keywords):
                return category
        
        return "general"
    
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
