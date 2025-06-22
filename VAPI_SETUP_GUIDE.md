# 🎤 Vapi Integration Setup Guide for SOLACE

## Overview
SOLACE now uses [Vapi.ai](https://vapi.ai) for advanced voice transcription and real-time voice AI capabilities. Vapi provides superior voice processing compared to traditional transcription services.

## 🚀 Quick Setup

### Step 1: Create Vapi Account
1. **Go to Vapi Dashboard**: [https://dashboard.vapi.ai/](https://dashboard.vapi.ai/)
2. **Sign up for free account** using email or OAuth
3. **Verify your email** (if required)

### Step 2: Get API Key
1. **Navigate to API Keys** in the dashboard
2. **Create new API key**
3. **Copy the API key** (starts with `sk-...`)
4. **Store securely** - you won't see it again

### Step 3: Configure Backend
1. **Open backend/.env file**
2. **Add your Vapi API key**:
```bash
# ===== VOICE INTEGRATION - VAPI =====
VAPI_API_KEY=sk-your-actual-api-key-here
VAPI_API_BASE=https://api.vapi.ai
VAPI_TRANSCRIPTION_LANGUAGE=en
```

### Step 4: Test Integration
1. **Restart backend server**:
```bash
cd backend && python3 start.py
```

2. **Test voice health endpoint**:
```bash
curl http://localhost:8000/api/case-notes/voice/health/
```

## 📱 Mobile App Usage

### Recording Voice Notes
1. **Open SOLACE mobile app**
2. **Tap "Record Voice Note"**
3. **Choose "Record Live"**
4. **Grant microphone permission**
5. **Speak your case note**
6. **Tap stop** → AI transcribes and organizes

### Expected Flow
```
Record Audio → Upload to Vapi → Transcribe → AI Organize → Case Note Created
```

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Required
VAPI_API_KEY=sk-your-key-here

# Optional (with defaults)
VAPI_API_BASE=https://api.vapi.ai
VAPI_TRANSCRIPTION_LANGUAGE=en
MAX_AUDIO_FILE_SIZE_MB=25
```

### Supported Audio Formats
- **MP3** (recommended for mobile)
- **WAV** (highest quality)
- **M4A** (iOS default)
- **MP4** (video with audio)
- **WEBM** (web audio)

## 🎯 Features Available

### Current Implementation
- ✅ **File Upload Transcription**
- ✅ **Multi-format Audio Support**
- ✅ **AI-Powered Case Note Generation**
- ✅ **Real-time Progress Feedback**
- ✅ **Fallback to Mock (for development)**

### Potential Future Features
- 🚧 **Real-time Phone Calls** (using Vapi's phone system)
- 🚧 **Live Audio Streaming**
- 🚧 **Multi-language Support**
- 🚧 **Voice Assistant Integration**

## 🛠️ API Integration Details

### File Upload Process
```typescript
// 1. Mobile app records audio
const audioFile = await recording.getURI();

// 2. Upload to backend
const response = await api.uploadAudioForTranscription(audioFile, clientId);

// 3. Backend uploads to Vapi
const vapiResult = await voiceService.transcribe_audio_file(audioPath);

// 4. AI organizes transcript
const caseNote = await caseNotesService.create_note_from_transcript(vapiResult);
```

### Vapi API Endpoints Used
- **POST** `/file` - Upload audio files
- **GET** `/file` - List/retrieve files
- **POST** `/call` - Create voice calls (future)

## 📊 Dashboard Features

### Vapi Dashboard Access
Visit [https://dashboard.vapi.ai/](https://dashboard.vapi.ai/) to:

- **Monitor Usage** - See transcription volume and costs
- **Manage API Keys** - Create, rotate, and delete keys
- **View Logs** - Debug transcription issues
- **Configure Assistants** - Set up advanced voice AI
- **Billing Management** - Track usage and payments

### Usage Analytics
- **Transcription minutes used**
- **API calls per day/month**
- **Success/error rates**
- **Cost breakdown**

## 🚨 Troubleshooting

### Common Issues

#### 1. "VAPI_API_KEY not configured"
**Solution**: Add your API key to `.env` file:
```bash
VAPI_API_KEY=sk-your-actual-key-here
```

#### 2. "Vapi file upload failed: 401"
**Causes**:
- Invalid API key
- Expired API key
- Insufficient permissions

**Solution**: Generate new API key in dashboard

#### 3. "Vapi file upload failed: 403"
**Causes**:
- Account billing issues
- Usage limits exceeded
- API key restrictions

**Solution**: Check dashboard billing and limits

#### 4. "Network request failed"
**Causes**:
- No internet connection
- Firewall blocking Vapi API
- Backend server not running

**Solution**: Check network and backend status

### Debug Mode
Enable detailed logging:
```bash
LOG_LEVEL=DEBUG python3 start.py
```

### Health Check
```bash
# Check if Vapi is properly configured
curl http://localhost:8000/api/case-notes/voice/health/

# Expected response for working setup:
{
  "status": "healthy",
  "message": "Vapi service is operational",
  "configured": true,
  "features": {
    "voice_transcription": true,
    "real_time_calls": true,
    "file_upload": true
  }
}
```

## 💰 Pricing Information

### Vapi Pricing Tiers
- **Free Tier**: Limited transcription minutes
- **Starter**: Pay-per-use model
- **Pro**: Monthly subscriptions with higher limits
- **Enterprise**: Custom pricing

### Cost Optimization Tips
1. **Use compressed audio formats** (MP3 vs WAV)
2. **Trim silence** before uploading
3. **Monitor usage** in dashboard
4. **Set usage alerts** to avoid overages

## 🔒 Security Best Practices

### API Key Security
- ✅ **Never commit API keys to git**
- ✅ **Use environment variables**
- ✅ **Rotate keys regularly**
- ✅ **Restrict key permissions if possible**

### Data Privacy
- Vapi processes audio temporarily for transcription
- Audio files are not permanently stored by Vapi
- Check Vapi's privacy policy for details
- Consider client consent for voice recording

## 📚 Additional Resources

### Documentation
- **Vapi Docs**: [https://docs.vapi.ai/](https://docs.vapi.ai/)
- **API Reference**: [https://docs.vapi.ai/api-reference](https://docs.vapi.ai/api-reference)
- **GitHub Examples**: [https://github.com/VapiAI](https://github.com/VapiAI)

### Support
- **Vapi Discord**: Join the community
- **Support Email**: Available through dashboard
- **Documentation**: Comprehensive guides available

## 🎉 Success!

Once configured, your SOLACE app will have:
- **Real-time voice transcription**
- **Professional audio processing**
- **Scalable voice infrastructure** 
- **Advanced voice AI capabilities**

Your social workers can now efficiently create case notes by simply speaking, with AI automatically organizing and structuring the content! 