"""
Task model for task management
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"

class TaskRecurrence(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class Task:
    """Task model for managing to-do items and calendar integration"""
    
    def __init__(
        self,
        title: str,
        description: Optional[str] = None,
        client_id: Optional[str] = None,
        assigned_to: Optional[str] = None,
        due_date: Optional[datetime] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        priority: TaskPriority = TaskPriority.MEDIUM,
        status: TaskStatus = TaskStatus.PENDING,
        recurrence: TaskRecurrence = TaskRecurrence.NONE,
        tags: Optional[List[str]] = None,
        location: Optional[str] = None,
        notes: Optional[str] = None,
        estimated_duration_minutes: Optional[int] = None,
        google_calendar_event_id: Optional[str] = None,
        created_by: Optional[str] = None,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id or str(uuid.uuid4())
        self.title = title
        self.description = description
        self.client_id = client_id
        self.assigned_to = assigned_to
        self.due_date = due_date
        self.start_time = start_time
        self.end_time = end_time
        self.priority = priority
        self.status = status
        self.recurrence = recurrence
        self.tags = tags or []
        self.location = location
        self.notes = notes
        self.estimated_duration_minutes = estimated_duration_minutes
        self.google_calendar_event_id = google_calendar_event_id
        self.created_by = created_by
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "client_id": self.client_id,
            "assigned_to": self.assigned_to,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "priority": self.priority.value,
            "status": self.status.value,
            "recurrence": self.recurrence.value,
            "tags": self.tags,
            "location": self.location,
            "notes": self.notes,
            "estimated_duration_minutes": self.estimated_duration_minutes,
            "google_calendar_event_id": self.google_calendar_event_id,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_overdue": self.is_overdue(),
            "time_until_due": self.time_until_due()
        }

    def is_overdue(self) -> bool:
        """Check if task is overdue"""
        if not self.due_date or self.status in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            return False
        return datetime.now(timezone.utc) > self.due_date

    def time_until_due(self) -> Optional[str]:
        """Get human-readable time until due"""
        if not self.due_date:
            return None
        
        now = datetime.now(timezone.utc)
        if self.due_date < now:
            delta = now - self.due_date
            if delta.days > 0:
                return f"Overdue by {delta.days} day{'s' if delta.days != 1 else ''}"
            elif delta.seconds > 3600:
                hours = delta.seconds // 3600
                return f"Overdue by {hours} hour{'s' if hours != 1 else ''}"
            else:
                minutes = delta.seconds // 60
                return f"Overdue by {minutes} minute{'s' if minutes != 1 else ''}"
        else:
            delta = self.due_date - now
            if delta.days > 0:
                return f"Due in {delta.days} day{'s' if delta.days != 1 else ''}"
            elif delta.seconds > 3600:
                hours = delta.seconds // 3600
                return f"Due in {hours} hour{'s' if hours != 1 else ''}"
            else:
                minutes = delta.seconds // 60
                return f"Due in {minutes} minute{'s' if minutes != 1 else ''}"

    def update_status_if_overdue(self):
        """Update status to overdue if past due date"""
        if self.is_overdue() and self.status == TaskStatus.PENDING:
            self.status = TaskStatus.OVERDUE
            self.updated_at = datetime.now(timezone.utc)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Task':
        """Create task from dictionary"""
        # Convert datetime strings back to datetime objects
        due_date = None
        if data.get('due_date'):
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        
        start_time = None
        if data.get('start_time'):
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        
        end_time = None
        if data.get('end_time'):
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        
        created_at = None
        if data.get('created_at'):
            created_at = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        
        updated_at = None
        if data.get('updated_at'):
            updated_at = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))

        return cls(
            id=data.get('id'),
            title=data['title'],
            description=data.get('description'),
            client_id=data.get('client_id'),
            assigned_to=data.get('assigned_to'),
            due_date=due_date,
            start_time=start_time,
            end_time=end_time,
            priority=TaskPriority(data.get('priority', TaskPriority.MEDIUM)),
            status=TaskStatus(data.get('status', TaskStatus.PENDING)),
            recurrence=TaskRecurrence(data.get('recurrence', TaskRecurrence.NONE)),
            tags=data.get('tags', []),
            location=data.get('location'),
            notes=data.get('notes'),
            estimated_duration_minutes=data.get('estimated_duration_minutes'),
            google_calendar_event_id=data.get('google_calendar_event_id'),
            created_by=data.get('created_by'),
            created_at=created_at,
            updated_at=updated_at
        )

    def to_google_calendar_event(self) -> Dict[str, Any]:
        """Convert task to Google Calendar event format"""
        event = {
            'summary': self.title,
            'description': self.description or '',
            'location': self.location or '',
        }

        # Handle timing
        if self.start_time and self.end_time:
            # Timed event
            event['start'] = {
                'dateTime': self.start_time.isoformat(),
                'timeZone': 'UTC'
            }
            event['end'] = {
                'dateTime': self.end_time.isoformat(),
                'timeZone': 'UTC'
            }
        elif self.due_date:
            # All-day event based on due date
            event['start'] = {
                'date': self.due_date.date().isoformat()
            }
            event['end'] = {
                'date': self.due_date.date().isoformat()
            }

        # Add color coding based on priority
        color_map = {
            TaskPriority.LOW: '2',      # Green
            TaskPriority.MEDIUM: '5',   # Yellow
            TaskPriority.HIGH: '6',     # Orange
            TaskPriority.URGENT: '11'   # Red
        }
        event['colorId'] = color_map.get(self.priority, '5')

        # Add recurrence if specified
        if self.recurrence != TaskRecurrence.NONE:
            recurrence_map = {
                TaskRecurrence.DAILY: 'RRULE:FREQ=DAILY',
                TaskRecurrence.WEEKLY: 'RRULE:FREQ=WEEKLY',
                TaskRecurrence.MONTHLY: 'RRULE:FREQ=MONTHLY',
                TaskRecurrence.YEARLY: 'RRULE:FREQ=YEARLY'
            }
            event['recurrence'] = [recurrence_map[self.recurrence]]

        return event 