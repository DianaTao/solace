# SOLACE Backend & Database

**Supabase PostgreSQL Database Configuration**

This folder contains all database setup scripts, schemas, and configuration for the SOLACE application.

## 🗄️ Database Overview

SOLACE uses **Supabase** as the backend-as-a-service, providing:
- **PostgreSQL Database** - Relational data storage
- **Authentication** - User management and auth
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Data protection
- **API Auto-generation** - REST and GraphQL APIs

## 📁 Files in This Directory

```
backend/
├── setup-database.sql      # Main database setup script
├── database-fix.sql        # Troubleshooting and fixes
├── SUPABASE_SETUP.md      # Detailed Supabase setup guide
└── README.md              # This file
```

## 🚀 Quick Setup

### 1. Supabase Account Setup
1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Note your project URL and API keys

### 2. Database Setup
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste `setup-database.sql`
3. Click "Run" to execute the script
4. Verify tables are created in Table Editor

### 3. Troubleshooting (if needed)
1. If user profiles aren't being created, run `database-fix.sql`
2. Check the logs for any errors
3. Verify RLS policies are working

## 📊 Database Schema

### Core Tables

#### `users` Table
```sql
- id (UUID, Primary Key) - References auth.users
- name (TEXT) - User's full name
- email (TEXT, Unique) - Email address
- agency (TEXT) - Social work agency
- role (TEXT) - User role (default: 'social_worker')
- created_at (TIMESTAMP) - Account creation time
- updated_at (TIMESTAMP) - Last profile update
```

#### `clients` Table
```sql
- id (UUID, Primary Key) - Unique client identifier
- user_id (UUID) - References users.id
- name (TEXT) - Client's name
- email (TEXT) - Client's email
- phone (TEXT) - Contact number
- address (TEXT) - Client address
- notes (TEXT) - Additional notes
- created_at/updated_at (TIMESTAMP) - Timestamps
```

#### `case_notes` Table
```sql
- id (UUID, Primary Key) - Unique note identifier
- user_id (UUID) - References users.id
- client_id (UUID) - References clients.id
- title (TEXT) - Note title
- content (TEXT) - Note content
- category (TEXT) - Note category
- created_at/updated_at (TIMESTAMP) - Timestamps
```

#### `tasks` Table
```sql
- id (UUID, Primary Key) - Unique task identifier
- user_id (UUID) - References users.id
- client_id (UUID) - References clients.id
- title (TEXT) - Task title
- description (TEXT) - Task details
- status (TEXT) - Task status (pending/completed)
- priority (TEXT) - Priority level
- due_date (TIMESTAMP) - Due date
- created_at/updated_at (TIMESTAMP) - Timestamps
```

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies:

- **Users can only see their own data**
- **Users can only modify their own records**
- **Automatic user profile creation on signup**

### Authentication Trigger
```sql
-- Automatically creates user profile when auth user is created
CREATE FUNCTION handle_new_user()
CREATE TRIGGER on_auth_user_created
```

## 🔧 Configuration

### Supabase Connection Details
```
URL: https://ccotkrhrqkldgfdjnlea.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Environment Variables (if using)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ccotkrhrqkldgfdjnlea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🛠️ Maintenance Scripts

### Initial Setup
```bash
# Run this in Supabase SQL Editor
cat setup-database.sql
```

### Fix User Profile Issues
```bash
# If users aren't getting profiles created
cat database-fix.sql
```

### Check Database Status
```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Check for orphaned auth users
SELECT au.email, au.id 
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

## 🐛 Common Issues & Solutions

### Issue: Users created but no database profile
**Solution**: Run `database-fix.sql` to fix RLS policies and create missing profiles.

### Issue: Permission denied errors
**Solution**: Check RLS policies and ensure user is authenticated.

### Issue: Trigger not firing
**Solution**: Verify trigger exists and has proper permissions.

### Issue: API connection errors
**Solution**: Verify URL and API key in app configuration.

## 📈 Database Monitoring

### Useful Queries
```sql
-- Recent user signups
SELECT email, created_at FROM users 
ORDER BY created_at DESC LIMIT 10;

-- User activity summary
SELECT 
  u.email,
  COUNT(cn.id) as note_count,
  COUNT(t.id) as task_count
FROM users u
LEFT JOIN case_notes cn ON u.id = cn.user_id
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.email;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 🔄 Backup & Recovery

### Automated Backups
Supabase provides automatic daily backups for all paid plans.

### Manual Export
1. Go to Supabase Dashboard → Settings → Database
2. Click "Database backups"
3. Download backup files

### Data Migration
```sql
-- Export data
COPY users TO '/path/to/users.csv' CSV HEADER;

-- Import data
COPY users FROM '/path/to/users.csv' CSV HEADER;
```

## 🔗 Related Documentation

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **PostgreSQL Docs**: [postgresql.org/docs](https://postgresql.org/docs)
- **Web App**: `../web/README.md`
- **Mobile App**: `../mobile/README.md`

## 📞 Support

### Database Issues
1. Check Supabase Dashboard logs
2. Verify SQL script execution
3. Test connection from apps
4. Review RLS policies

### Performance Issues
1. Check query performance in Dashboard
2. Add indexes if needed
3. Monitor connection usage
4. Optimize queries

---

**SOLACE Backend - Secure, scalable data management for social workers.** 