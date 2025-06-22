# SOLACE Mobile - Backend Connection Setup

This guide will help you connect the SOLACE mobile app to the Python FastAPI backend.

## Prerequisites

1. **Python Backend Running**: Make sure the Python backend is running on `http://localhost:8000`
2. **Mobile Development Environment**: Expo CLI and React Native development setup
3. **Authentication**: Supabase authentication should be working

## Backend Connection Overview

The mobile app now includes:
- **API Service** (`lib/api.js`): Handles all HTTP requests to the Python backend
- **Environment Configuration**: Backend URL configuration in `config/env.js`
- **Automatic Data Loading**: HomeScreen loads real data from the backend
- **API Test Screen**: Built-in testing interface for API endpoints

## Setup Steps

### 1. Start the Python Backend

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the FastAPI server
python start.py
```

The backend should be running at `http://localhost:8000`

### 2. Verify Backend Configuration

Check that `mobile/config/env.js` has the correct API URL:

```javascript
const config = {
  development: {
    // ... Supabase config ...
    API_BASE_URL: 'http://localhost:8000',  // ✅ Correct for local development
    API_TIMEOUT: 10000,
  },
  production: {
    // ... Supabase config ...
    API_BASE_URL: 'https://your-backend-domain.com',  // Update for production
    API_TIMEOUT: 10000,
  }
};
```

### 3. Start the Mobile App

```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies (if not already done)
npm install

# Start the Expo development server
npx expo start
```

### 4. Test the Connection

1. **Login to the mobile app** using your Supabase credentials
2. **Check the HomeScreen**: 
   - Stats should show "From API" if connected
   - Stats show "Offline mode" if using fallback data
3. **Use the API Test Screen**:
   - Open the hamburger menu
   - Tap "API Test" (purple menu item)
   - Run individual tests or "Run All Tests"
   - Check the results for successful connections

## API Endpoints Integrated

The mobile app connects to these backend endpoints:

### Health & Info
- `GET /health` - Check backend health
- `GET /api` - Get API information

### Clients
- `GET /api/clients` - List clients
- `GET /api/clients/{id}` - Get specific client
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Case Notes
- `GET /api/case-notes` - List case notes
- `POST /api/case-notes` - Create case note

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report

## Authentication Flow

The mobile app uses this authentication flow:

1. **User logs in** via Supabase authentication
2. **Supabase session token** is obtained
3. **API requests** include the token in the `Authorization` header:
   ```
   Authorization: Bearer <supabase_access_token>
   ```
4. **Backend validates** the token using Supabase JWT verification

## Features

### Real-time Data Loading
- HomeScreen automatically loads data from the backend on startup
- Pull-to-refresh functionality updates data from the API
- Graceful fallback to mock data if backend is unavailable

### Error Handling
- Network errors are caught and displayed to users
- Connection issues show "Offline mode" indicators
- API test screen provides detailed error information

### API Test Console
A built-in testing interface that allows you to:
- Check backend health status
- Test individual API endpoints
- View request/response details
- Monitor connection performance
- Debug authentication issues

## Troubleshooting

### Backend Not Connecting

1. **Check Backend Status**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Verify Network Access**:
   - Make sure your mobile device/emulator can reach the backend
   - **For physical devices**: Use your computer's IP address instead of `localhost`
   - **For iOS Simulator**: `localhost` should work
   - **For Android Emulator**: Use `10.0.2.2:8000` or your computer's IP

3. **Update API URL for Physical Devices** (MOST COMMON FIX):
   
   **Step 1**: Find your computer's IP address:
   ```bash
   # On macOS/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig | findstr "IPv4"
   ```
   
   **Step 2**: Update `mobile/config/env.js`:
   ```javascript
   // Replace localhost with your computer's actual IP address
   API_BASE_URL: 'http://YOUR_IP_ADDRESS:8000',  // e.g., 'http://192.168.1.100:8000'
   ```
   
   **Step 3**: Restart your mobile app (reload in Expo)

4. **Test the connection**:
   ```bash
   # Test from your computer
   curl http://YOUR_IP_ADDRESS:8000/health
   ```

### Authentication Errors

1. **Check Supabase Configuration**:
   - Verify Supabase URL and anon key in `config/env.js`
   - Ensure user is properly logged in

2. **Token Issues**:
   - Check browser/app console for authentication errors
   - Try logging out and back in

3. **Backend JWT Validation**:
   - Ensure backend is configured with correct Supabase settings
   - Check backend logs for JWT validation errors

### API Test Screen Results

- ✅ **Success**: Green checkmark, shows response data
- ❌ **Error**: Red X, shows error message
- **Duration**: Shows request timing for performance monitoring

## Production Deployment

For production deployment:

1. **Update API URL** in `mobile/config/env.js`:
   ```javascript
   production: {
     API_BASE_URL: 'https://your-backend-domain.com',
   }
   ```

2. **Backend CORS**: Ensure your backend allows requests from your mobile app domain

3. **HTTPS**: Use HTTPS for all production API endpoints

4. **Environment Variables**: Consider using Expo's environment variable system for sensitive configuration

## Development Tips

### Debugging API Calls
- Use the API Test Screen for quick endpoint testing
- Check React Native debugger console for detailed logs
- Monitor network requests in development tools

### Adding New Endpoints
1. Add the method to `mobile/lib/api.js`
2. Update the HomeScreen or create new screens to use the endpoint
3. Add test cases to the API Test Screen

### Mock Data Fallback
The app includes mock data that's used when the backend is unavailable:
- Located in HomeScreen component
- Provides seamless offline experience
- Automatically switches back to real data when backend reconnects

## Support

If you encounter issues:
1. Check the API Test Screen for detailed error information
2. Review the React Native console logs
3. Verify backend logs for server-side issues
4. Ensure all dependencies are properly installed 