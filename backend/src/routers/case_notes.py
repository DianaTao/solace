"""
Case notes API endpoints with voice integration
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, UploadFile, File, Form
from typing import Dict, Any, List, Optional
from middleware.auth import get_current_user
from services.case_notes_service import CaseNotesService
from services.voice_service import voice_service

router = APIRouter()

# Initialize service
case_notes_service = CaseNotesService()

# ===== CASE NOTES CRUD ENDPOINTS =====

@router.get("/", response_model=List[Dict[str, Any]])
async def get_case_notes(
    client_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: str = Query("active"),
    search: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get case notes with optional filtering"""
    try:
        case_notes = await case_notes_service.get_case_notes(
            user_id=current_user["id"],
            client_id=client_id,
            skip=skip,
            limit=limit,
            category=category,
            priority=priority,
            status=status,
            search=search
        )
        return case_notes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve case notes: {str(e)}"
        )

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_case_note(
    case_note_data: Dict[str, Any] = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new case note"""
    try:
        # Validate required fields
        required_fields = ["title", "content", "client_id"]
        for field in required_fields:
            if field not in case_note_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        case_note = await case_notes_service.create_case_note(
            case_note_data, current_user["id"]
        )
        return case_note
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create case note: {str(e)}"
        )

@router.get("/{note_id}/", response_model=Dict[str, Any])
async def get_case_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific case note by ID"""
    try:
        case_note = await case_notes_service.get_case_note(note_id, current_user["id"])
        if not case_note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case note not found"
            )
        return case_note
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve case note: {str(e)}"
        )

# ===== VOICE INTEGRATION ENDPOINTS =====

@router.post("/voice-intake/", response_model=Dict[str, Any])
async def start_voice_intake(
    intake_request: Dict[str, Any] = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Start a voice intake session for case notes"""
    try:
        # Validate required fields
        if "client_id" not in intake_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="client_id is required"
            )
        
        voice_session = await case_notes_service.start_voice_intake(
            client_id=intake_request["client_id"],
            user_id=current_user["id"],
            session_type=intake_request.get("session_type", "intake"),
            phone_number=intake_request.get("phone_number")
        )
        
        return {
            "message": "Voice intake session started successfully",
            "session": voice_session
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start voice intake: {str(e)}"
        )

@router.post("/voice-sessions/{session_id}/upload", response_model=Dict[str, Any])
async def upload_voice_session_audio(
    session_id: str,
    audio_file: UploadFile = File(...),
    client_id: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload audio file for voice transcription"""
    try:
        # Validate file type
        allowed_types = ["audio/wav", "audio/mp3", "audio/m4a", "audio/mp4", "audio/webm", "audio/mpeg", "audio/x-m4a", "audio/x-wav", "audio/x-mp3"]
        if audio_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {audio_file.content_type}. Allowed: {', '.join(allowed_types)}"
            )
        
        # Read audio file
        audio_content = await audio_file.read()
        
        # Transcribe using voice service
        from services.voice_service import voice_service
        transcript_result = await voice_service.transcribe_audio_buffer(
            audio_buffer=audio_content,
            filename=audio_file.filename,
            client_id=client_id,
            session_id=session_id
        )
        
        # Create organized case note from transcript
        organized_note = await case_notes_service.create_note_from_transcript(
            transcript_result=transcript_result,
            client_id=client_id or transcript_result.get("client_id"),
            user_id=current_user["id"],
            session_id=session_id
        )
        
        return {
            "message": "Audio transcribed and case note created successfully",
            "transcript": transcript_result,
            "case_note": organized_note,
            "session_id": session_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process audio upload: {str(e)}"
        )

@router.post("/transcribe-audio/", response_model=Dict[str, Any])
async def transcribe_audio_direct(
    audio_file: UploadFile = File(...),
    client_id: Optional[str] = Form(None),
    auto_create_note: bool = Form(True),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Direct audio transcription endpoint"""
    try:
        # Validate file type
        allowed_types = ["audio/wav", "audio/mp3", "audio/m4a", "audio/mp4", "audio/webm", "audio/mpeg", "audio/x-m4a", "audio/x-wav", "audio/x-mp3"]
        if audio_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {audio_file.content_type}. Allowed: {', '.join(allowed_types)}"
            )
        
        # Read audio file
        audio_content = await audio_file.read()
        
        # Transcribe using voice service
        from services.voice_service import voice_service
        transcript_result = await voice_service.transcribe_audio_buffer(
            audio_buffer=audio_content,
            filename=audio_file.filename,
            client_id=client_id
        )
        
        result = {
            "message": "Audio transcribed successfully",
            "transcript": transcript_result
        }
        
        # Optionally create case note
        if auto_create_note and client_id:
            organized_note = await case_notes_service.create_note_from_transcript(
                transcript_result=transcript_result,
                client_id=client_id,
                user_id=current_user["id"]
            )
            result["case_note"] = organized_note
            result["message"] = "Audio transcribed and case note created successfully"
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio: {str(e)}"
        )

@router.post("/{note_id}/generate-tts/", response_model=Dict[str, Any])
async def generate_tts(
    note_id: str,
    tts_request: Dict[str, Any] = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate TTS audio for a case note"""
    try:
        tts_response = await case_notes_service.generate_tts_for_note(
            note_id=note_id,
            user_id=current_user["id"],
            voice_id=tts_request.get("voice_id"),
            speed=tts_request.get("speed", 1.0)
        )
        
        return {
            "message": "TTS audio generated successfully",
            "tts": tts_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate TTS: {str(e)}"
        )

# ===== ANALYTICS ENDPOINTS =====

@router.get("/analytics/", response_model=Dict[str, Any])
async def get_case_notes_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get case notes analytics and insights"""
    try:
        analytics = await case_notes_service.get_case_notes_analytics(
            user_id=current_user["id"],
            days=days
        )
        
        return {
            "message": "Analytics retrieved successfully",
            "analytics": analytics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analytics: {str(e)}"
        )

# ===== VOICE SERVICE HEALTH CHECK =====

@router.get("/voice/health/", response_model=Dict[str, Any])
async def check_voice_service_health(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Check the health of voice integration services"""
    try:
        health_status = await voice_service.health_check()
        
        return {
            "message": "Voice service health check completed",
            "health": health_status
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice service health check failed: {str(e)}"
        )

# ===== WEBHOOK ENDPOINTS (for Vapi integration) =====

@router.post("/webhooks/vapi/", response_model=Dict[str, Any])
async def handle_vapi_webhook(
    webhook_data: Dict[str, Any] = Body(...)
):
    """Handle webhooks from Vapi for voice session updates"""
    try:
        # Process the webhook (this would typically not require authentication)
        # as it's coming from Vapi's servers
        
        # Log the webhook for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔔 Received Vapi webhook: {webhook_data.get('event_type', 'unknown')}")
        
        # TODO: Process webhook data and update database records
        
        return {
            "message": "Webhook processed successfully",
            "status": "received"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process webhook: {str(e)}"
        ) 