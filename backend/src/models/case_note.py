"""
Case Note data models with voice integration
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


class IntakeMethod(str, Enum):
    """Method used for case note intake"""
    MANUAL = "manual"
    VOICE = "voice"
    PHONE = "phone"
    WEB_FORM = "web_form"


class Priority(str, Enum):
    """Case note priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Status(str, Enum):
    """Case note status"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"


class SessionType(str, Enum):
    """Voice session types"""
    INTAKE = "intake"
    FOLLOW_UP = "follow_up"
    ASSESSMENT = "assessment"
    CALL = "call"


class TranscriptStatus(str, Enum):
    """Voice transcript processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class UrgencyLevel(str, Enum):
    """Voice session urgency levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Speaker(str, Enum):
    """Voice transcript speakers"""
    CLIENT = "client"
    SOCIAL_WORKER = "social_worker"
    SYSTEM = "system"


# Voice Session Models
class VoiceSessionBase(BaseModel):
    """Base voice session model"""
    session_type: SessionType = SessionType.INTAKE
    phone_number: Optional[str] = None
    vapi_assistant_id: Optional[str] = None


class VoiceSessionCreate(VoiceSessionBase):
    """Voice session creation model"""
    client_id: str
    vapi_session_id: str
    vapi_call_id: Optional[str] = None


class VoiceSessionUpdate(BaseModel):
    """Voice session update model"""
    call_duration_seconds: Optional[int] = None
    transcript_status: Optional[TranscriptStatus] = None
    full_transcript: Optional[str] = None
    transcript_summary: Optional[str] = None
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    key_topics: Optional[List[str]] = None
    action_items: Optional[List[str]] = None
    urgency_level: Optional[UrgencyLevel] = None
    ended_at: Optional[datetime] = None


class VoiceSession(VoiceSessionBase):
    """Complete voice session model"""
    id: str
    vapi_session_id: str
    client_id: Optional[str] = None
    social_worker_id: str
    call_duration_seconds: Optional[int] = None
    vapi_call_id: Optional[str] = None
    transcript_status: TranscriptStatus = TranscriptStatus.PENDING
    full_transcript: Optional[str] = None
    transcript_summary: Optional[str] = None
    sentiment_score: Optional[float] = None
    key_topics: Optional[List[str]] = None
    action_items: Optional[List[str]] = None
    urgency_level: UrgencyLevel = UrgencyLevel.NORMAL
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Voice Transcript Models
class VoiceTranscriptCreate(BaseModel):
    """Voice transcript creation model"""
    voice_session_id: str
    speaker: Speaker = Speaker.CLIENT
    text_content: str
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    start_time_seconds: Optional[float] = None
    end_time_seconds: Optional[float] = None
    contains_sensitive_info: bool = False
    requires_follow_up: bool = False


class VoiceTranscript(VoiceTranscriptCreate):
    """Complete voice transcript model"""
    id: str
    case_note_id: Optional[str] = None
    is_processed: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# Case Note Models
class CaseNoteBase(BaseModel):
    """Base case note model"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: str = "general"
    priority: Priority = Priority.MEDIUM
    tags: Optional[List[str]] = None
    is_confidential: bool = False
    follow_up_required: bool = False
    follow_up_date: Optional[date] = None

    @validator('tags', pre=True, always=True)
    def validate_tags(cls, v):
        if v is None:
            return []
        return v

    @validator('title')
    def validate_title(cls, v):
        return v.strip()

    @validator('content')
    def validate_content(cls, v):
        return v.strip()


class CaseNoteCreate(CaseNoteBase):
    """Case note creation model"""
    client_id: str
    intake_method: IntakeMethod = IntakeMethod.MANUAL
    
    # Voice integration fields
    voice_session_id: Optional[str] = None
    has_voice_recording: bool = False
    voice_recording_url: Optional[str] = None
    voice_duration_seconds: Optional[int] = None
    voice_quality_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class CaseNoteUpdate(BaseModel):
    """Case note update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = None
    priority: Optional[Priority] = None
    tags: Optional[List[str]] = None
    status: Optional[Status] = None
    is_confidential: Optional[bool] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    
    # TTS fields
    tts_generated: Optional[bool] = None
    tts_audio_url: Optional[str] = None
    tts_voice_id: Optional[str] = None

    @validator('tags', pre=True, always=True)
    def validate_tags(cls, v):
        if v is None:
            return None
        return v


class CaseNote(CaseNoteBase):
    """Complete case note model"""
    id: str
    client_id: str
    social_worker_id: str
    status: Status = Status.ACTIVE
    intake_method: IntakeMethod = IntakeMethod.MANUAL
    
    # Voice integration fields
    voice_session_id: Optional[str] = None
    has_voice_recording: bool = False
    voice_recording_url: Optional[str] = None
    voice_duration_seconds: Optional[int] = None
    voice_quality_score: Optional[float] = None
    
    # TTS fields
    tts_generated: bool = False
    tts_audio_url: Optional[str] = None
    tts_voice_id: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CaseNoteSummary(BaseModel):
    """Case note summary for listings"""
    id: str
    title: str
    category: str
    priority: Priority
    status: Status
    intake_method: IntakeMethod
    has_voice_recording: bool
    tts_generated: bool
    is_confidential: bool
    follow_up_required: bool
    client_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Voice Integration Request/Response Models
class VoiceIntakeRequest(BaseModel):
    """Request to start voice intake"""
    client_id: str
    session_type: SessionType = SessionType.INTAKE
    phone_number: Optional[str] = None
    assistant_id: Optional[str] = None


class VoiceIntakeResponse(BaseModel):
    """Response from voice intake initiation"""
    voice_session_id: str
    vapi_session_id: str
    vapi_call_id: Optional[str] = None
    phone_number: Optional[str] = None
    status: str
    message: str


class TTSGenerationRequest(BaseModel):
    """Request for TTS generation"""
    case_note_id: str
    voice_id: Optional[str] = None
    speed: Optional[float] = Field(1.0, ge=0.5, le=2.0)
    pitch: Optional[float] = Field(1.0, ge=0.5, le=2.0)


class TTSGenerationResponse(BaseModel):
    """Response from TTS generation"""
    case_note_id: str
    tts_audio_url: str
    voice_id: str
    duration_seconds: int
    status: str
    message: str


class VoiceAnalyticsResponse(BaseModel):
    """Voice analytics and insights"""
    total_sessions: int
    total_duration_minutes: int
    average_session_duration: float
    sentiment_distribution: Dict[str, int]
    top_topics: List[Dict[str, Any]]
    urgency_distribution: Dict[str, int]
    transcript_quality_average: float


# Webhook Models for Vapi
class VapiWebhookData(BaseModel):
    """Vapi webhook data structure"""
    session_id: str
    call_id: Optional[str] = None
    event_type: str
    timestamp: datetime
    data: Dict[str, Any]


class VapiTranscriptWebhook(VapiWebhookData):
    """Vapi transcript webhook"""
    transcript: str
    confidence: float
    speaker: str
    start_time: float
    end_time: float


class VapiSessionWebhook(VapiWebhookData):
    """Vapi session webhook"""
    status: str
    duration_seconds: Optional[int] = None
    summary: Optional[str] = None
    sentiment_score: Optional[float] = None 