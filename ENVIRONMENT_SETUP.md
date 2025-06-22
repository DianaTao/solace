# 🔐 Environment Variables Setup Guide

This guide explains how to properly configure environment variables for SOLACE to avoid exposing sensitive keys in your codebase.

## 🌐 Web App Environment Variables

### For Local Development

Create a `.env.local` file in the `web/` directory:

```bash
# web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://ccotkrhrqkldgfdjnlea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0
```

### For Vercel Deployment

Add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://ccotkrhrqkldgfdjnlea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0
```

### For Other Hosting Platforms

For platforms like Netlify, Railway, or others, add the same environment variables in their respective environment variable settings.

## 📱 Mobile App Environment Variables

The mobile app uses a configuration file system. Update `mobile/config/env.js`:

```javascript
// mobile/config/env.js
const config = {
  development: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
  },
  production: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
  }
};

export { config };
```

## 🔒 Security Best Practices

### ✅ Do's
- ✅ Use environment variables for all sensitive configuration
- ✅ Keep `.env.local` files in `.gitignore`
- ✅ Use different keys for development and production when possible
- ✅ Validate environment variables at startup
- ✅ Document required environment variables

### ❌ Don'ts
- ❌ Never commit `.env` files to version control
- ❌ Don't hardcode sensitive keys in source code
- ❌ Don't expose service role keys (only use anon keys in frontend)
- ❌ Don't share environment files in chat/email

## 🔑 Current Supabase Configuration

**Project URL**: `https://ccotkrhrqkldgfdjnlea.supabase.co`
**Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (truncated for security)

> **Note**: The anon key is safe to expose in frontend applications as it only provides public access. The service role key should NEVER be used in frontend code.

## 🚨 If Keys Are Compromised

If you suspect your Supabase keys have been compromised:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Click **Reset** next to the anon key
4. Update all environment variables with the new key
5. Redeploy your applications

## 🔄 Environment Variable Updates

After updating environment variables:

### Web App
```bash
cd web
npm run build  # Test the build
npm run dev    # Test locally
```

### Mobile App
```bash
cd mobile
expo start --clear  # Clear cache and restart
```

### Vercel Deployment
1. Update environment variables in Vercel dashboard
2. Trigger a new deployment (or push a commit)

## 📋 Quick Setup Checklist

- [ ] Create `web/.env.local` with Supabase credentials
- [ ] Update `mobile/config/env.js` with Supabase credentials
- [ ] Test web app locally: `cd web && npm run dev`
- [ ] Test mobile app locally: `cd mobile && expo start`
- [ ] Add environment variables to Vercel project settings
- [ ] Deploy and test production web app
- [ ] Build and test mobile app for production

## 🆘 Troubleshooting

**Error**: "Supabase configuration is missing"
- **Solution**: Check that environment variables are properly set

**Error**: "Invalid API key"
- **Solution**: Verify the Supabase anon key is correct and not truncated

**Error**: Build fails on Vercel
- **Solution**: Ensure environment variables are set in Vercel project settings

**Error**: Mobile app can't connect to Supabase
- **Solution**: Check `mobile/config/env.js` configuration 