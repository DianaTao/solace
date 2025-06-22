# Google Calendar Integration Setup for SOLACE

This guide explains how to set up Google Calendar integration for the SOLACE task management system.

## Overview

The Google Calendar integration allows SOLACE to:
- Automatically create calendar events for tasks with due dates or scheduled times
- Sync task updates with Google Calendar events
- Color-code events based on task priority
- Support recurring tasks
- Manage task scheduling directly from Google Calendar

## Prerequisites

1. Google Cloud Console account
2. SOLACE backend server running
3. Valid SSL certificate (required for production OAuth)

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in the required information:
   - App name: "SOLACE Task Management"
   - User support email: your email
   - Developer contact email: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
5. Add test users (for development)

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "SOLACE Backend"
5. Authorized redirect URIs:
   - Development: `http://localhost:8000/api/google-calendar/callback`
   - Production: `https://your-domain.com/api/google-calendar/callback`
6. Save and copy the Client ID and Client Secret

### 4. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Google Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-calendar/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
```

### 5. Install Dependencies

The required Python packages are already included in `requirements.txt`:

```bash
cd backend
pip install -r requirements.txt
```

### 6. Database Setup

Run the tasks schema setup to create the necessary database tables:

```sql
-- Run this in your Supabase SQL editor
\i setup-tasks-schema.sql
```

## Using the Integration

### Authentication Flow

1. User clicks "Connect Google Calendar" in the frontend
2. Frontend calls `/api/tasks/google-calendar/auth-url`
3. User is redirected to Google OAuth consent screen
4. After approval, Google redirects to `/api/google-calendar/callback`
5. Backend processes the authorization and stores tokens
6. User is redirected back to frontend with success/error status

### Task Synchronization

When a task is created or updated with timing information:

1. Backend automatically creates/updates Google Calendar event
2. Event is color-coded based on task priority:
   - Low: Green
   - Medium: Yellow  
   - High: Orange
   - Urgent: Red
3. Event includes task title, description, location, and notes
4. Recurring tasks create recurring calendar events

### Event Types

- **Timed Events**: Tasks with `start_time` and `end_time`
- **All-Day Events**: Tasks with only `due_date`
- **Recurring Events**: Tasks with `recurrence` setting

## API Endpoints

### Task Management
- `GET /api/tasks/` - List tasks with filtering
- `POST /api/tasks/` - Create task (auto-creates calendar event)
- `PUT /api/tasks/{id}` - Update task (syncs with calendar)
- `DELETE /api/tasks/{id}` - Delete task (removes calendar event)
- `PATCH /api/tasks/{id}/complete` - Mark task complete
- `GET /api/tasks/stats` - Get task statistics

### Google Calendar Integration
- `GET /api/google-calendar/auth` - Get OAuth authorization URL
- `GET /api/google-calendar/callback` - OAuth callback handler
- `POST /api/google-calendar/disconnect` - Disconnect integration
- `GET /api/google-calendar/status` - Check connection status

## Security Considerations

### Production Setup

1. **Use HTTPS**: OAuth requires HTTPS in production
2. **Secure Token Storage**: Store refresh tokens encrypted in database
3. **Token Rotation**: Implement automatic token refresh
4. **Scope Limitation**: Only request necessary calendar permissions
5. **User Consent**: Clear explanation of what data is accessed

### Privacy & Compliance

1. Calendar events contain task information - ensure HIPAA compliance
2. Store minimal necessary data in calendar events
3. Implement data retention policies
4. Allow users to disconnect integration at any time

## Development Notes

### Mock Implementation

Currently, the Google Calendar service includes mock implementations that:
- Return sample tasks for development
- Log calendar operations without actual API calls
- Provide placeholder responses for OAuth flow

### Full Implementation Steps

To complete the implementation:

1. Implement token exchange in OAuth callback
2. Store encrypted tokens in user profiles table
3. Implement token refresh mechanism
4. Add calendar service initialization with stored tokens
5. Handle API rate limits and errors gracefully
6. Add calendar event conflict detection

### Testing

1. Test OAuth flow in development environment
2. Verify task creation creates calendar events
3. Test task updates sync to calendar
4. Verify task deletion removes calendar events
5. Test recurring task creation
6. Validate error handling for API failures

## Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**: Ensure redirect URI matches exactly
2. **Scope Errors**: Verify calendar scope is properly requested
3. **Token Expiry**: Implement proper refresh token handling
4. **Rate Limits**: Implement exponential backoff for API calls
5. **SSL Errors**: Use HTTPS for production OAuth

### Logs

Check backend logs for:
- OAuth flow completion
- Calendar API calls
- Token refresh attempts
- Error messages and stack traces

## Example Usage

```python
# Create a task with calendar integration
task_data = {
    "title": "Client Meeting",
    "description": "Meet with John Doe for housing assistance",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "priority": "high",
    "location": "Office Conference Room",
    "tags": ["meeting", "housing"]
}

# POST /api/tasks/
# This will automatically create a Google Calendar event
```

## Future Enhancements

1. Two-way sync (changes in Google Calendar update tasks)
2. Multiple calendar support
3. Calendar sharing for team coordination
4. Automatic meeting room booking
5. Integration with Google Meet for virtual meetings
6. Calendar-based task scheduling suggestions 