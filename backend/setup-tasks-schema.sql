-- Create tasks table for SOLACE task management system
-- Run this script in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'overdue');
CREATE TYPE task_recurrence AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timing fields
    due_date TIMESTAMPTZ,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0 AND estimated_duration_minutes <= 1440),
    
    -- Task properties
    priority task_priority DEFAULT 'medium' NOT NULL,
    status task_status DEFAULT 'pending' NOT NULL,
    recurrence task_recurrence DEFAULT 'none' NOT NULL,
    
    -- Additional fields
    location VARCHAR(200),
    notes TEXT,
    tags TEXT[], -- Array of tags
    
    -- Google Calendar integration
    google_calendar_event_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_start_time ON tasks(start_time);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

-- Create GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_client_status ON tasks(client_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_status ON tasks(due_date, status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();

-- Create function to automatically update overdue status
CREATE OR REPLACE FUNCTION update_overdue_tasks()
RETURNS VOID AS $$
BEGIN
    UPDATE tasks 
    SET status = 'overdue'::task_status,
        updated_at = NOW()
    WHERE status = 'pending'::task_status 
    AND due_date < NOW()
    AND due_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a view for task statistics
CREATE OR REPLACE VIEW task_stats AS
SELECT 
    assigned_to,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,
    COUNT(CASE WHEN due_date::date = CURRENT_DATE THEN 1 END) as due_today,
    COUNT(CASE WHEN due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 END) as due_this_week,
    ROUND(
        (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as completion_rate
FROM tasks
GROUP BY assigned_to;

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can see tasks assigned to them or created by them
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT 
    USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid()
    );

-- Users can create tasks
CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT 
    WITH CHECK (
        created_by = auth.uid()
    );

-- Users can update tasks assigned to them or created by them
CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE 
    USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid()
    )
    WITH CHECK (
        assigned_to = auth.uid() OR 
        created_by = auth.uid()
    );

-- Users can delete tasks created by them
CREATE POLICY "Users can delete tasks they created" ON tasks
    FOR DELETE 
    USING (created_by = auth.uid());

-- Insert some sample tasks for testing (optional)
INSERT INTO tasks (
    title, 
    description, 
    priority, 
    status, 
    due_date, 
    tags,
    created_by,
    assigned_to
) VALUES 
(
    'Review housing assistance case',
    'Review and process housing assistance application for client',
    'high',
    'pending',
    NOW() + INTERVAL '2 hours',
    ARRAY['housing', 'urgent'],
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Prepare monthly report',
    'Compile monthly case management statistics and insights',
    'medium',
    'pending',
    NOW() + INTERVAL '1 week',
    ARRAY['reporting', 'monthly'],
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Schedule follow-up appointment',
    'Contact client to schedule follow-up for employment services',
    'low',
    'pending',
    NOW() + INTERVAL '3 days',
    ARRAY['appointment', 'employment'],
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Grant necessary permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON task_stats TO authenticated;

-- Create a scheduled job to update overdue tasks (if pg_cron is available)
-- This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('update-overdue-tasks', '0 1 * * *', 'SELECT update_overdue_tasks();');

COMMENT ON TABLE tasks IS 'Tasks table for SOLACE case management system with Google Calendar integration';
COMMENT ON COLUMN tasks.tags IS 'Array of tags for categorizing and filtering tasks';
COMMENT ON COLUMN tasks.google_calendar_event_id IS 'ID of the corresponding Google Calendar event';
COMMENT ON FUNCTION update_overdue_tasks() IS 'Function to automatically mark pending tasks as overdue when past due date';
COMMENT ON VIEW task_stats IS 'Aggregated statistics for tasks by assigned user'; 