-- Case Notes Database Schema for SOLACE
-- Includes voice integration support with Vapi

-- Case Notes table
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    social_worker_id UUID NOT NULL,
    
    -- Content fields
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    tags TEXT[], -- Array of tags for categorization
    
    -- Voice integration fields
    voice_session_id VARCHAR(100), -- Vapi session ID
    has_voice_recording BOOLEAN DEFAULT FALSE,
    voice_recording_url TEXT, -- URL to voice recording
    voice_duration_seconds INTEGER, -- Duration of voice recording
    voice_quality_score DECIMAL(3,2), -- Transcription quality score (0.00-1.00)
    
    -- TTS fields
    tts_generated BOOLEAN DEFAULT FALSE,
    tts_audio_url TEXT, -- Generated TTS audio URL
    tts_voice_id VARCHAR(50), -- Vapi voice ID used
    
    -- Metadata
    intake_method VARCHAR(20) DEFAULT 'manual' CHECK (intake_method IN ('manual', 'voice', 'phone', 'web_form')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    is_confidential BOOLEAN DEFAULT FALSE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Sessions table (for Vapi integration tracking)
CREATE TABLE IF NOT EXISTS voice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vapi_session_id VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    social_worker_id UUID NOT NULL,
    
    -- Session details
    session_type VARCHAR(20) DEFAULT 'intake' CHECK (session_type IN ('intake', 'follow_up', 'assessment', 'call')),
    phone_number VARCHAR(20),
    call_duration_seconds INTEGER,
    
    -- Vapi specific fields
    vapi_call_id VARCHAR(100),
    vapi_assistant_id VARCHAR(100),
    transcript_status VARCHAR(20) DEFAULT 'pending' CHECK (transcript_status IN ('pending', 'processing', 'completed', 'failed')),
    full_transcript TEXT,
    transcript_summary TEXT,
    
    -- Analysis results
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
    key_topics TEXT[], -- Extracted topics
    action_items TEXT[], -- Extracted action items
    urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Transcripts table
CREATE TABLE IF NOT EXISTS voice_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
    case_note_id UUID REFERENCES case_notes(id) ON DELETE SET NULL,
    
    -- Transcript details
    speaker VARCHAR(20) DEFAULT 'client' CHECK (speaker IN ('client', 'social_worker', 'system')),
    text_content TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- Transcription confidence
    start_time_seconds DECIMAL(8,2), -- Start time in recording
    end_time_seconds DECIMAL(8,2), -- End time in recording
    
    -- Processing flags
    is_processed BOOLEAN DEFAULT FALSE,
    contains_sensitive_info BOOLEAN DEFAULT FALSE,
    requires_follow_up BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_notes_client_id ON case_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_social_worker_id ON case_notes(social_worker_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created_at ON case_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_notes_category ON case_notes(category);
CREATE INDEX IF NOT EXISTS idx_case_notes_priority ON case_notes(priority);
CREATE INDEX IF NOT EXISTS idx_case_notes_status ON case_notes(status);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_vapi_session ON voice_sessions(vapi_session_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_client_id ON voice_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_social_worker ON voice_sessions(social_worker_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_started_at ON voice_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_transcripts_session ON voice_transcripts(voice_session_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_case_note ON voice_transcripts(case_note_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_speaker ON voice_transcripts(speaker);
