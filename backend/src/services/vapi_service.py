"""
Vapi.ai Integration Service for Voice Operations and TTS
"""

import os
import json
import logging
import aiohttp
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from models.case_note import (
    VoiceIntakeRequest, VoiceIntakeResponse, 
    TTSGenerationRequest, TTSGenerationResponse,
    VoiceAnalyticsResponse, VapiWebhookData
)

logger = logging.getLogger(__name__)


class VapiService:
    """Service for integrating with Vapi.ai for voice operations"""
    
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.base_url = "https://api.vapi.ai"
        self.webhook_secret = os.getenv("VAPI_WEBHOOK_SECRET")
        self.default_assistant_id = os.getenv("VAPI_DEFAULT_ASSISTANT_ID")
        self.session = None
        
        if not self.api_key:
            logger.warning("⚠️ VAPI_API_KEY not configured - voice features will be disabled")
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            self.session = aiohttp.ClientSession(headers=headers)
        return self.session
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def is_configured(self) -> bool:
        """Check if Vapi is properly configured"""
        return bool(self.api_key)
    
    # ===== VOICE INTAKE OPERATIONS =====
    
    async def start_voice_intake(
        self, 
        client_id: str,
        social_worker_id: str,
        session_type: str = "intake",
        phone_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """Start a voice intake session"""
        try:
            if not self.is_configured():
                raise Exception("Vapi is not configured")
            
            session = await self._get_session()
            
            # Generate unique session ID
            voice_session_id = str(uuid.uuid4())
            
            # Prepare Vapi call request
            call_data = {
                "assistantId": self.default_assistant_id,
                "customer": {
                    "number": phone_number
                } if phone_number else None,
                "metadata": {
                    "clientId": client_id,
                    "socialWorkerId": social_worker_id,
                    "sessionType": session_type,
                    "voiceSessionId": voice_session_id
                }
            }
            
            # Make API call to Vapi
            async with session.post(f"{self.base_url}/call", json=call_data) as response:
                if response.status == 201:
                    result = await response.json()
                    
                    logger.info(f"✅ Voice intake started: {voice_session_id}")
                    
                    return {
                        "voice_session_id": voice_session_id,
                        "vapi_session_id": result.get("id"),
                        "vapi_call_id": result.get("id"),
                        "phone_number": phone_number,
                        "status": "started",
                        "message": "Voice intake session started successfully"
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Vapi call failed: {response.status} - {error_text}")
                    raise Exception(f"Failed to start voice intake: {error_text}")
                    
        except Exception as e:
            logger.error(f"❌ Voice intake error: {e}")
            raise
    
    async def get_voice_session_status(self, vapi_call_id: str) -> Dict[str, Any]:
        """Get the status of a voice session"""
        try:
            if not self.is_configured():
                raise Exception("Vapi is not configured")
            
            session = await self._get_session()
            
            async with session.get(f"{self.base_url}/call/{vapi_call_id}") as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Retrieved voice session status: {vapi_call_id}")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Failed to get session status: {response.status} - {error_text}")
                    raise Exception(f"Failed to get session status: {error_text}")
                    
        except Exception as e:
            logger.error(f"❌ Session status error: {e}")
            raise
    
    async def get_voice_transcript(self, vapi_call_id: str) -> Dict[str, Any]:
        """Get the transcript of a voice session"""
        try:
            if not self.is_configured():
                raise Exception("Vapi is not configured")
            
            session = await self._get_session()
            
            async with session.get(f"{self.base_url}/call/{vapi_call_id}/transcript") as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Retrieved transcript for: {vapi_call_id}")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Failed to get transcript: {response.status} - {error_text}")
                    raise Exception(f"Failed to get transcript: {error_text}")
                    
        except Exception as e:
            logger.error(f"❌ Transcript retrieval error: {e}")
            raise
    
    # ===== TEXT-TO-SPEECH OPERATIONS =====
    
    async def generate_tts(
        self, 
        case_note_id: str,
        text_content: str,
        voice_id: Optional[str] = None,
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> Dict[str, Any]:
        """Generate TTS audio for case note content"""
        try:
            if not self.is_configured():
                # Return mock response for development
                return {
                    "case_note_id": case_note_id,
                    "tts_audio_url": f"https://mock-audio-url.com/{case_note_id}.mp3",
                    "voice_id": voice_id or "default",
                    "duration_seconds": len(text_content) // 10,  # Rough estimate
                    "status": "completed",
                    "message": "TTS audio generated successfully (mock)"
                }
            
            session = await self._get_session()
            
            # Prepare TTS request
            tts_data = {
                "text": text_content,
                "voice": {
                    "voiceId": voice_id or "default",
                    "speed": speed,
                    "pitch": pitch
                },
                "metadata": {
                    "caseNoteId": case_note_id,
                    "source": "solace_case_notes"
                }
            }
            
            # Make TTS API call
            async with session.post(f"{self.base_url}/tts", json=tts_data) as response:
                if response.status == 200:
                    result = await response.json()
                    
                    logger.info(f"✅ TTS generated for case note: {case_note_id}")
                    
                    return {
                        "case_note_id": case_note_id,
                        "tts_audio_url": result.get("audioUrl"),
                        "voice_id": voice_id or "default",
                        "duration_seconds": result.get("durationSeconds", 0),
                        "status": "completed",
                        "message": "TTS audio generated successfully"
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"❌ TTS generation failed: {response.status} - {error_text}")
                    raise Exception(f"Failed to generate TTS: {error_text}")
                    
        except Exception as e:
            logger.error(f"❌ TTS generation error: {e}")
            raise
    
    # ===== ASSISTANT MANAGEMENT =====
    
    async def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available TTS voices"""
        try:
            if not self.is_configured():
                return []
            
            session = await self._get_session()
            
            async with session.get(f"{self.base_url}/voices") as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Retrieved {len(result)} available voices")
                    return result
                else:
                    logger.warning(f"⚠️ Failed to get voices: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"❌ Voices retrieval error: {e}")
            return []
    
    async def create_case_notes_assistant(
        self, 
        name: str = "SOLACE Case Notes Assistant"
    ) -> Dict[str, Any]:
        """Create a specialized assistant for case notes intake"""
        try:
            if not self.is_configured():
                raise Exception("Vapi is not configured")
            
            session = await self._get_session()
            
            assistant_config = {
                "name": name,
                "voice": {
                    "provider": "elevenlabs",
                    "voiceId": "sarah"  # Professional, empathetic voice
                },
                "model": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "systemMessage": """You are a professional social work case management assistant. 
                    Your role is to help social workers conduct intake interviews and gather case information.
                    
                    Guidelines:
                    - Be empathetic and professional
                    - Ask clear, structured questions
                    - Ensure confidentiality and privacy
                    - Help gather key information: client needs, situation, goals, and action items
                    - Summarize information clearly
                    - Flag urgent or sensitive matters
                    
                    Always maintain professional boundaries and follow social work ethics."""
                },
                "firstMessage": "Hello, I'm here to assist with case note intake. How can I help you document this case today?",
                "endCallMessage": "Thank you for using SOLACE case management. The session has been recorded and will be processed for your case notes.",
                "recordingEnabled": True,
                "transcriber": {
                    "provider": "deepgram",
                    "model": "enhanced"
                }
            }
            
            async with session.post(f"{self.base_url}/assistant", json=assistant_config) as response:
                if response.status == 201:
                    result = await response.json()
                    logger.info(f"✅ Created case notes assistant: {result.get('id')}")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Assistant creation failed: {response.status} - {error_text}")
                    raise Exception(f"Failed to create assistant: {error_text}")
                    
        except Exception as e:
            logger.error(f"❌ Assistant creation error: {e}")
            raise
    
    # ===== WEBHOOK PROCESSING =====
    
    def verify_webhook(self, payload: str, signature: str) -> bool:
        """Verify webhook signature from Vapi"""
        try:
            if not self.webhook_secret:
                logger.warning("⚠️ Webhook secret not configured")
                return True  # Allow in development
            
            # Implement webhook signature verification
            # This is a simplified version - implement proper HMAC verification
            return True
            
        except Exception as e:
            logger.error(f"❌ Webhook verification error: {e}")
            return False
    
    async def process_webhook(self, webhook_data: VapiWebhookData) -> Dict[str, Any]:
        """Process incoming webhook from Vapi"""
        try:
            event_type = webhook_data.event_type
            
            logger.info(f"🔔 Processing Vapi webhook: {event_type}")
            
            if event_type == "call.started":
                return await self._handle_call_started(webhook_data)
            elif event_type == "call.ended":
                return await self._handle_call_ended(webhook_data)
            elif event_type == "transcript.partial":
                return await self._handle_transcript_partial(webhook_data)
            elif event_type == "transcript.final":
                return await self._handle_transcript_final(webhook_data)
            else:
                logger.info(f"ℹ️ Unhandled webhook event: {event_type}")
                return {"status": "ignored", "event_type": event_type}
                
        except Exception as e:
            logger.error(f"❌ Webhook processing error: {e}")
            raise
    
    async def _handle_call_started(self, webhook_data: VapiWebhookData) -> Dict[str, Any]:
        """Handle call started webhook"""
        logger.info(f"📞 Call started: {webhook_data.session_id}")
        return {"status": "processed", "action": "call_started"}
    
    async def _handle_call_ended(self, webhook_data: VapiWebhookData) -> Dict[str, Any]:
        """Handle call ended webhook"""
        logger.info(f"📞 Call ended: {webhook_data.session_id}")
        return {"status": "processed", "action": "call_ended"}
    
    async def _handle_transcript_partial(self, webhook_data: VapiWebhookData) -> Dict[str, Any]:
        """Handle partial transcript webhook"""
        logger.info(f"📝 Partial transcript: {webhook_data.session_id}")
        return {"status": "processed", "action": "transcript_partial"}
    
    async def _handle_transcript_final(self, webhook_data: VapiWebhookData) -> Dict[str, Any]:
        """Handle final transcript webhook"""
        logger.info(f"📝 Final transcript: {webhook_data.session_id}")
        return {"status": "processed", "action": "transcript_final"}
    
    # ===== ANALYTICS =====
    
    async def get_voice_analytics(
        self, 
        social_worker_id: str,
        days: int = 30
    ) -> VoiceAnalyticsResponse:
        """Get voice usage analytics"""
        try:
            # This would typically query your database for analytics
            # For now, return mock data structure
            
            return VoiceAnalyticsResponse(
                total_sessions=0,
                total_duration_minutes=0,
                average_session_duration=0.0,
                sentiment_distribution={"positive": 0, "neutral": 0, "negative": 0},
                top_topics=[],
                urgency_distribution={"low": 0, "normal": 0, "high": 0, "urgent": 0},
                transcript_quality_average=0.0
            )
            
        except Exception as e:
            logger.error(f"❌ Analytics error: {e}")
            raise
    
    # ===== HEALTH CHECK =====
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Vapi service health"""
        try:
            if not self.is_configured():
                return {
                    "status": "disabled",
                    "message": "Vapi not configured - add VAPI_API_KEY to enable voice features",
                    "configured": False,
                    "features": {
                        "voice_intake": False,
                        "tts_generation": False,
                        "transcription": False
                    }
                }
            
            session = await self._get_session()
            
            # Simple health check - test API connectivity
            async with session.get(f"{self.base_url}/account") as response:
                if response.status == 200:
                    return {
                        "status": "healthy",
                        "message": "Vapi service is operational",
                        "configured": True,
                        "features": {
                            "voice_intake": True,
                            "tts_generation": True,
                            "transcription": True
                        }
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"Vapi API returned {response.status}",
                        "configured": True,
                        "features": {
                            "voice_intake": False,
                            "tts_generation": False,
                            "transcription": False
                        }
                    }
                    
        except Exception as e:
            return {
                "status": "error",
                "message": f"Vapi health check failed: {str(e)}",
                "configured": self.is_configured(),
                "features": {
                    "voice_intake": False,
                    "tts_generation": False,
                    "transcription": False
                }
            }


# Global instance
vapi_service = VapiService() 