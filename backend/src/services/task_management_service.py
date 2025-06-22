"""
Task Management Service
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from models.task import Task, TaskPriority, TaskStatus, TaskRecurrence
from config.database import get_supabase

logger = logging.getLogger(__name__)

class TaskManagementService:
    """Service for managing tasks"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.table_name = "tasks"
        self._ensure_tasks_table()

    def _ensure_tasks_table(self):
        """Ensure tasks table exists in the database"""
        try:
            # Check if table exists by trying to select from it
            self.supabase.table(self.table_name).select("id").limit(1).execute()
            logger.info("Tasks table exists")
            return True
        except Exception as e:
            logger.warning(f"Tasks table may not exist: {e}")
            return False

    async def get_tasks(
        self, 
        user_id: str,
        client_id: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[str] = None,
        tags: Optional[List[str]] = None,
        due_date_from: Optional[datetime] = None,
        due_date_to: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Task]:
        """Get tasks with filtering options"""
        try:
            query = self.supabase.table(self.table_name).select("*")
            
            # Apply filters
            if user_id:
                query = query.eq('created_by', user_id)
            if client_id:
                query = query.eq('client_id', client_id)
            if status:
                query = query.eq('status', status)
            if priority:
                query = query.eq('priority', priority)
            if assigned_to:
                query = query.eq('assigned_to', assigned_to)
            if due_date_from:
                query = query.gte('due_date', due_date_from.isoformat())
            if due_date_to:
                query = query.lte('due_date', due_date_to.isoformat())
            
            # Apply pagination
            query = query.range(offset, offset + limit - 1)
            
            result = query.execute()
            
            tasks = [Task(**task) for task in result.data]
            return tasks
            
        except Exception as e:
            logger.error(f"Error getting tasks: {e}")
            return []

    async def get_task(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get a specific task by ID"""
        try:
            result = self.supabase.table(self.table_name)\
                .select("*")\
                .eq('id', task_id)\
                .eq('created_by', user_id)\
                .execute()
            
            if result.data:
                return Task(**result.data[0])
            return None
            
        except Exception as e:
            logger.error(f"Error getting task {task_id}: {e}")
            return None

    async def create_task(self, task_data: Dict[str, Any], user_id: str) -> Optional[Task]:
        """Create a new task"""
        try:
            task = Task(
                title=task_data['title'],
                description=task_data.get('description'),
                client_id=task_data.get('client_id'),
                assigned_to=task_data.get('assigned_to', user_id),
                due_date=datetime.fromisoformat(task_data['due_date'].replace('Z', '+00:00')) if task_data.get('due_date') else None,
                priority=TaskPriority(task_data.get('priority', 'medium')),
                status=TaskStatus(task_data.get('status', 'pending')),
                tags=task_data.get('tags', []),
                created_by=user_id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            result = self.supabase.table(self.table_name).insert(task.dict()).execute()
            
            if result.data:
                return Task(**result.data[0])
            return None
            
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return None

    async def update_task(self, task_id: str, updates: Dict[str, Any], user_id: str) -> Optional[Task]:
        """Update an existing task"""
        try:
            # Get existing task
            existing_task = await self.get_task(task_id, user_id)
            if not existing_task:
                return None
            
            # Apply updates
            update_data = {}
            for key, value in updates.items():
                if hasattr(existing_task, key):
                    if key in ['due_date'] and value:
                        update_data[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    elif key in ['priority', 'status']:
                        update_data[key] = value.value if hasattr(value, 'value') else value
                    else:
                        update_data[key] = value
            
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            # Update in database
            result = self.supabase.table(self.table_name)\
                .update(update_data)\
                .eq('id', task_id)\
                .execute()
            
            if result.data:
                return Task(**result.data[0])
            return None
            
        except Exception as e:
            logger.error(f"Error updating task {task_id}: {e}")
            return None

    async def delete_task(self, task_id: str, user_id: str) -> bool:
        """Delete a task"""
        try:
            # Verify task exists and belongs to user
            task = await self.get_task(task_id, user_id)
            if not task:
                return False
                
            result = self.supabase.table(self.table_name)\
                .delete()\
                .eq('id', task_id)\
                .execute()
                
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error deleting task {task_id}: {e}")
            return False

    async def mark_task_complete(self, task_id: str, user_id: str) -> Optional[Task]:
        """Mark a task as completed"""
        return await self.update_task(task_id, {
            'status': TaskStatus.COMPLETED.value,
            'completed_at': datetime.now(timezone.utc).isoformat()
        }, user_id)

    async def get_overdue_tasks(self, user_id: str) -> List[Task]:
        """Get all overdue tasks"""
        now = datetime.now(timezone.utc)
        return await self.get_tasks(
            user_id=user_id,
            status=TaskStatus.PENDING.value,
            due_date_to=now
        )

    async def get_tasks_due_today(self, user_id: str) -> List[Task]:
        """Get tasks due today"""
        today = datetime.now(timezone.utc).date()
        start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
        end_of_day = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)
        
        return await self.get_tasks(
            user_id=user_id,
            due_date_from=start_of_day,
            due_date_to=end_of_day
        )

    async def get_upcoming_tasks(self, user_id: str, days_ahead: int = 7) -> List[Task]:
        """Get upcoming tasks within the next N days"""
        now = datetime.now(timezone.utc)
        future_date = now + timedelta(days=days_ahead)
        
        return await self.get_tasks(
            user_id=user_id,
            due_date_from=now,
            due_date_to=future_date,
            status=TaskStatus.PENDING.value
        )

# Global service instance
task_service = TaskManagementService()
