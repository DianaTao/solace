# 🎤 SOLACE Voice Integration Setup Guide

## Overview

This guide covers the complete setup and usage of **Vapi.ai** voice integration for SOLACE case notes, including voice-based intake and Text-to-Speech (TTS) capabilities.

## 🎯 Features Implemented

### ✅ Core Voice Features
- **Voice Intake Sessions** - Start voice calls for case note collection
- **Text-to-Speech (TTS)** - Generate audio from case note content
- **Voice Transcription** - Automatic speech-to-text conversion
- **Real-time Processing** - Live transcription and analysis
- **Voice Analytics** - Usage statistics and insights

### ✅ Database Schema
- **Case Notes** with voice metadata
- **Voice Sessions** tracking
- **Voice Transcripts** storage
- **Performance indexes** for fast queries

### ✅ API Endpoints
- `POST /api/case-notes/voice-intake/` - Start voice session
- `POST /api/case-notes/{note_id}/generate-tts/` - Generate TTS
- `GET /api/case-notes/voice/health/` - Check voice service status
- `GET /api/case-notes/analytics/` - Voice usage analytics
- `POST /api/case-notes/webhooks/vapi/` - Vapi webhook handler

## 🔧 Setup Instructions

### 1. **Get Vapi.ai Credentials**

1. Visit [Vapi Dashboard](https://dashboard.vapi.ai)
2. Create an account or sign in
3. Navigate to **API Keys** section
4. Copy your **API Key**
5. Generate a **Webhook Secret**

### 2. **Environment Configuration**

Update your `.env` file with Vapi credentials:

```bash
# ===== VOICE INTEGRATION - VAPI.AI =====
# Required: Vapi API Key for voice operations
VAPI_API_KEY=vapi_your_actual_api_key_here

# Required: Webhook secret for verifying Vapi webhooks
VAPI_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Default assistant ID for case notes intake
VAPI_DEFAULT_ASSISTANT_ID=your_assistant_id_here

# Optional: Phone number for outbound calls
VAPI_PHONE_NUMBER=+1234567890

# ===== VOICE FEATURES CONFIGURATION =====
VOICE_INTAKE_ENABLED=true
TTS_GENERATION_ENABLED=true
VOICE_TRANSCRIPTION_ENABLED=true

# Default TTS voice settings
DEFAULT_TTS_VOICE_ID=sarah
DEFAULT_TTS_SPEED=1.0
DEFAULT_TTS_PITCH=1.0

# Voice quality thresholds (0.0 - 1.0)
MIN_TRANSCRIPT_CONFIDENCE=0.7
MIN_VOICE_QUALITY_SCORE=0.6

# Maximum voice session duration in minutes
MAX_VOICE_SESSION_DURATION=30
```

### 3. **Database Schema Setup**

Run the database schema setup:

```bash
# Navigate to backend directory
cd backend

# Setup the voice integration database schema
# Option 1: Using psql directly
psql -h your_supabase_host -U postgres -d postgres -f setup-case-notes-schema.sql

# Option 2: Using Supabase SQL editor
# Copy the contents of setup-case-notes-schema.sql into the Supabase SQL editor
```

### 4. **Install Dependencies**

```bash
# Navigate to backend directory
cd backend

# Install voice integration dependencies
pip install aiohttp aiofiles websockets
```

### 5. **Create Vapi Assistant**

Create a specialized assistant for case notes:

```bash
# Test the voice service health
curl -X GET "http://10.40.104.226:8000/api/case-notes/voice/health/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🚀 Usage Examples

### 1. **Start Voice Intake Session**

```javascript
// Start a voice intake session for a client
const response = await fetch('/api/case-notes/voice-intake/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        client_id: 'client-uuid-here',
        session_type: 'intake',
        phone_number: '+1234567890'  // Optional
    })
});

const voiceSession = await response.json();
console.log('Voice session started:', voiceSession);
```

### 2. **Create Case Note with Voice Data**

```javascript
// Create a case note with voice integration
const response = await fetch('/api/case-notes/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        title: "Client Intake - Voice Session",
        content: "Transcript content from voice session...",
        client_id: "client-uuid-here",
        category: "intake",
        priority: "medium",
        intake_method: "voice",
        has_voice_recording: true,
        voice_session_id: "vapi-session-id",
        voice_duration_seconds: 300,
        voice_quality_score: 0.92
    })
});

const caseNote = await response.json();
console.log('Case note created:', caseNote);
```

### 3. **Generate TTS for Case Note**

```javascript
// Generate Text-to-Speech audio for a case note
const response = await fetch(`/api/case-notes/${noteId}/generate-tts/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        voice_id: 'sarah',      // Optional: specific voice
        speed: 1.2,             // Optional: speech speed
        pitch: 1.0              // Optional: voice pitch
    })
});

const ttsResult = await response.json();
console.log('TTS generated:', ttsResult.tts.tts_audio_url);
```

### 4. **Get Voice Analytics**

```javascript
// Get voice usage analytics
const response = await fetch('/api/case-notes/analytics/?days=30', {
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
});

const analytics = await response.json();
console.log('Voice analytics:', analytics.analytics);
```

## 📊 Database Schema

### Case Notes Table
```sql
CREATE TABLE case_notes (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    social_worker_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Voice integration fields
    voice_session_id VARCHAR(100),
    has_voice_recording BOOLEAN DEFAULT FALSE,
    voice_recording_url TEXT,
    voice_duration_seconds INTEGER,
    voice_quality_score DECIMAL(3,2),
    
    -- TTS fields
    tts_generated BOOLEAN DEFAULT FALSE,
    tts_audio_url TEXT,
    tts_voice_id VARCHAR(50),
    
    intake_method VARCHAR(20) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Voice Sessions Table
```sql
CREATE TABLE voice_sessions (
    id UUID PRIMARY KEY,
    vapi_session_id VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    social_worker_id UUID NOT NULL,
    session_type VARCHAR(20) DEFAULT 'intake',
    call_duration_seconds INTEGER,
    full_transcript TEXT,
    sentiment_score DECIMAL(3,2),
    urgency_level VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 Integration Workflow

### Voice Intake Process
1. **Start Session** → Call `/api/case-notes/voice-intake/`
2. **Vapi Handles Call** → Real-time transcription
3. **Webhook Updates** → Session progress via `/api/case-notes/webhooks/vapi/`
4. **Create Case Note** → From transcript using `/api/case-notes/`
5. **Generate TTS** → Optional audio generation

### TTS Generation Process
1. **Request TTS** → Call `/api/case-notes/{id}/generate-tts/`
2. **Vapi Processes** → Text-to-speech conversion
3. **Audio Ready** → URL returned for playback
4. **Update Note** → TTS metadata saved

## 🔧 Troubleshooting

### Common Issues

**1. "Vapi not configured" Error**
```bash
# Check environment variables
echo $VAPI_API_KEY
echo $VAPI_WEBHOOK_SECRET

# Verify credentials in Vapi dashboard
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/account
```

**2. Voice Session Not Starting**
```bash
# Check voice service health
curl -X GET "http://10.40.104.226:8000/api/case-notes/voice/health/" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**3. Database Schema Missing**
```bash
# Re-run schema setup
psql -h your_host -U postgres -d postgres -f setup-case-notes-schema.sql
```

### Debug Mode
Enable debug logging by setting:
```bash
LOG_LEVEL=DEBUG
```

## 📋 Testing

Run the voice integration test:
```bash
node test-voice-integration.js
```

Expected output:
```
🧪 Testing SOLACE Voice Integration...
✅ Health check: healthy
📝 Case notes endpoint status: 403 (expected without auth)
🎉 Voice integration test completed successfully!
```

## 🔒 Security Considerations

### Authentication
- All voice endpoints require valid JWT tokens
- Webhook endpoints verify Vapi signatures
- Voice recordings are stored securely

### Data Privacy
- Voice transcripts are encrypted at rest
- Sensitive information detection in transcripts
- Configurable data retention policies

### Compliance
- HIPAA-compliant voice processing
- Audit logs for all voice operations
- Secure webhook handling

## 📈 Monitoring

### Health Checks
- Voice service status: `/api/case-notes/voice/health/`
- Vapi API connectivity monitoring
- Database schema validation

### Metrics
- Voice session success rates
- TTS generation times
- Transcript quality scores
- Error rates and types

## 🎯 Next Steps

1. **Setup Vapi Account** and get credentials
2. **Configure Environment** variables
3. **Run Database Schema** setup
4. **Test Voice Features** with real calls
5. **Create Custom Assistant** for your use case
6. **Monitor Performance** and adjust settings

## 📞 Support

For issues with:
- **Vapi Integration**: Check [Vapi Documentation](https://docs.vapi.ai)
- **SOLACE Backend**: Review application logs
- **Database Issues**: Verify schema and connections
- **Authentication**: Check JWT token validity

---

**🎉 Congratulations! Your SOLACE system now has full voice integration capabilities with Vapi.ai for enhanced case note management and accessibility.** 