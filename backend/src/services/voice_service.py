"""
OpenAI Whisper Integration Service for Voice Operations
"""

import os
import json
import logging
import aiofiles
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import openai

logger = logging.getLogger(__name__)


class VoiceService:
    """Service for integrating with OpenAI Whisper for voice operations"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_WHISPER_MODEL", "whisper-1")
        self.language = os.getenv("OPENAI_TRANSCRIPTION_LANGUAGE", "en")
        self.max_file_size = int(os.getenv("MAX_AUDIO_FILE_SIZE_MB", "25")) * 1024 * 1024  # Convert to bytes
        
        if not self.api_key:
            logger.warning("⚠️ OPENAI_API_KEY not configured - voice features will be disabled")
        else:
            openai.api_key = self.api_key
    
    def is_configured(self) -> bool:
        """Check if OpenAI Whisper is properly configured"""
        return bool(self.api_key)
    
    # ===== VOICE TRANSCRIPTION OPERATIONS =====
    
    async def transcribe_audio_file(
        self, 
        file_path: str,
        client_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe an audio file using OpenAI Whisper"""
        try:
            if not self.is_configured():
                raise Exception("OpenAI API key not configured")
            
            # Check file size
            file_size = os.path.getsize(file_path)
            if file_size > self.max_file_size:
                raise Exception(f"File size {file_size/1024/1024:.1f}MB exceeds limit of {self.max_file_size/1024/1024}MB")
            
            # Transcribe using OpenAI Whisper
            with open(file_path, "rb") as audio_file:
                transcript = await openai.Audio.atranscribe(
                    model=self.model,
                    file=audio_file,
                    language=self.language if self.language != "auto" else None,
                    response_format="verbose_json"
                )
            
            # Extract transcript information
            text = transcript.get("text", "")
            confidence = transcript.get("confidence", 0.0)
            duration = transcript.get("duration", 0.0)
            
            # Analyze transcript content
            analysis = self._analyze_transcript(text)
            
            session_id = session_id or str(uuid.uuid4())
            
            logger.info(f"✅ Transcribed audio file: {file_path} (duration: {duration}s)")
            
            return {
                "session_id": session_id,
                "client_id": client_id,
                "transcript": text,
                "confidence": confidence,
                "duration_seconds": duration,
                "language": transcript.get("language", self.language),
                "analysis": analysis,
                "status": "completed",
                "message": "Audio transcribed successfully"
            }
                    
        except Exception as e:
            logger.error(f"❌ Transcription error: {e}")
            raise
    
    async def transcribe_audio_buffer(
        self, 
        audio_buffer: bytes,
        filename: str = "audio.wav",
        client_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe audio from a buffer using OpenAI Whisper"""
        try:
            if not self.is_configured():
                raise Exception("OpenAI API key not configured")
            
            # Check buffer size
            if len(audio_buffer) > self.max_file_size:
                raise Exception(f"Audio buffer size {len(audio_buffer)/1024/1024:.1f}MB exceeds limit")
            
            # Save buffer to temporary file
            temp_path = f"/tmp/{uuid.uuid4()}_{filename}"
            async with aiofiles.open(temp_path, "wb") as temp_file:
                await temp_file.write(audio_buffer)
            
            try:
                # Transcribe the temporary file
                result = await self.transcribe_audio_file(temp_path, client_id, session_id)
                return result
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        except Exception as e:
            logger.error(f"❌ Buffer transcription error: {e}")
            raise
    
    def _analyze_transcript(self, text: str) -> Dict[str, Any]:
        """Basic analysis of transcript content"""
        if not text:
            return {
                "word_count": 0,
                "keywords": [],
                "sentiment": "neutral",
                "urgency_indicators": []
            }
        
        words = text.lower().split()
        word_count = len(words)
        
        # Basic keyword detection for case notes
        case_keywords = [
            "emergency", "urgent", "crisis", "help", "assistance", 
            "housing", "food", "medical", "mental health", "family",
            "children", "safety", "abuse", "neglect", "domestic violence"
        ]
        
        found_keywords = [keyword for keyword in case_keywords if keyword in text.lower()]
        
        # Basic urgency detection
        urgency_words = ["emergency", "urgent", "crisis", "immediate", "asap", "help"]
        urgency_indicators = [word for word in urgency_words if word in text.lower()]
        
        # Simple sentiment (this could be enhanced with a proper sentiment analysis library)
        positive_words = ["good", "better", "improving", "stable", "safe", "progress"]
        negative_words = ["bad", "worse", "crisis", "danger", "unsafe", "problems"]
        
        positive_count = sum(1 for word in positive_words if word in text.lower())
        negative_count = sum(1 for word in negative_words if word in text.lower())
        
        if positive_count > negative_count:
            sentiment = "positive"
        elif negative_count > positive_count:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        return {
            "word_count": word_count,
            "keywords": found_keywords,
            "sentiment": sentiment,
            "urgency_indicators": urgency_indicators
        }
    
    # ===== VOICE SESSION MANAGEMENT =====
    
    async def start_voice_intake(
        self, 
        client_id: str,
        social_worker_id: str,
        session_type: str = "intake",
        phone_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """Start a voice intake session (file upload based)"""
        try:
            # Generate unique session ID
            voice_session_id = str(uuid.uuid4())
            
            # Since we're using file upload instead of live calls,
            # we return session info for the client to upload audio
            logger.info(f"✅ Voice intake session created: {voice_session_id}")
            
            return {
                "voice_session_id": voice_session_id,
                "client_id": client_id,
                "social_worker_id": social_worker_id,
                "session_type": session_type,
                "status": "ready_for_upload",
                "message": "Session ready - please upload audio file for transcription",
                "upload_url": f"/api/case-notes/voice-sessions/{voice_session_id}/upload"
            }
                    
        except Exception as e:
            logger.error(f"❌ Voice intake session error: {e}")
            raise
    
    # ===== TEXT-TO-SPEECH OPERATIONS (Mock for now) =====
    
    async def generate_tts(
        self, 
        case_note_id: str,
        text_content: str,
        voice_id: Optional[str] = None,
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> Dict[str, Any]:
        """Generate TTS audio for case note content (mock implementation)"""
        try:
            # Mock response since OpenAI doesn't have TTS in Whisper
            # This could be integrated with other TTS services if needed
            logger.info(f"✅ Mock TTS generated for case note: {case_note_id}")
            
            return {
                "case_note_id": case_note_id,
                "tts_audio_url": f"https://mock-audio-url.com/{case_note_id}.mp3",
                "voice_id": voice_id or "default",
                "duration_seconds": len(text_content) // 10,  # Rough estimate
                "status": "completed",
                "message": "TTS audio generated successfully (mock)"
            }
                    
        except Exception as e:
            logger.error(f"❌ TTS generation error: {e}")
            raise
    
    # ===== HEALTH CHECK =====
    
    async def health_check(self) -> Dict[str, Any]:
        """Check voice service health"""
        try:
            if not self.is_configured():
                return {
                    "status": "disabled",
                    "message": "OpenAI API key not configured - add OPENAI_API_KEY to enable voice features",
                    "configured": False,
                    "features": {
                        "voice_transcription": False,
                        "tts_generation": False,
                        "file_upload": False
                    }
                }
            
            # Test API connectivity with a simple request
            try:
                models = await openai.Model.alist()
                whisper_available = any(model.id.startswith("whisper") for model in models.data)
                
                return {
                    "status": "healthy",
                    "message": "OpenAI Whisper service is operational",
                    "configured": True,
                    "whisper_model": self.model,
                    "max_file_size_mb": self.max_file_size // 1024 // 1024,
                    "features": {
                        "voice_transcription": whisper_available,
                        "tts_generation": False,  # Mock only
                        "file_upload": True
                    }
                }
                
            except Exception as e:
                return {
                    "status": "error",
                    "message": f"OpenAI API error: {str(e)}",
                    "configured": True,
                    "features": {
                        "voice_transcription": False,
                        "tts_generation": False,
                        "file_upload": False
                    }
                }
                    
        except Exception as e:
            return {
                "status": "error",
                "message": f"Voice service health check failed: {str(e)}",
                "configured": self.is_configured(),
                "features": {
                    "voice_transcription": False,
                    "tts_generation": False,
                    "file_upload": False
                }
            }


# Create service instance
voice_service = VoiceService() 