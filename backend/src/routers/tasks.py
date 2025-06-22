"""
Tasks API endpoints with Google Calendar integration
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from middleware.auth import get_current_user
from services.task_management_service import task_service
from models.task import TaskPriority, TaskStatus, TaskRecurrence

router = APIRouter()

# Pydantic models for request/response
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    client_id: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None  # ISO format datetime string
    start_time: Optional[str] = None  # ISO format datetime string
    end_time: Optional[str] = None  # ISO format datetime string
    priority: Optional[str] = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    status: Optional[str] = Field(default="pending", pattern="^(pending|in_progress|completed|cancelled|overdue)$")
    recurrence: Optional[str] = Field(default="none", pattern="^(none|daily|weekly|monthly|yearly)$")
    tags: Optional[List[str]] = Field(default_factory=list)
    location: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)
    estimated_duration_minutes: Optional[int] = Field(None, ge=1, le=1440)  # Max 24 hours

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    client_id: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed|cancelled|overdue)$")
    recurrence: Optional[str] = Field(None, pattern="^(none|daily|weekly|monthly|yearly)$")
    tags: Optional[List[str]] = None
    location: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)
    estimated_duration_minutes: Optional[int] = Field(None, ge=1, le=1440)

@router.get("/", response_model=List[Dict[str, Any]])
async def get_tasks(
    client_id: Optional[str] = Query(None, description="Filter by client ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    due_date_from: Optional[str] = Query(None, description="Filter tasks due from this date (ISO format)"),
    due_date_to: Optional[str] = Query(None, description="Filter tasks due to this date (ISO format)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks to return"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get tasks with optional filtering"""
    try:
        # Parse dates if provided
        due_date_from_dt = None
        if due_date_from:
            try:
                due_date_from_dt = datetime.fromisoformat(due_date_from.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid due_date_from format. Use ISO format.")
        
        due_date_to_dt = None
        if due_date_to:
            try:
                due_date_to_dt = datetime.fromisoformat(due_date_to.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid due_date_to format. Use ISO format.")
        
        # Parse tags
        tags_list = None
        if tags:
            tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        tasks = await task_service.get_tasks(
            user_id=current_user["id"],
            client_id=client_id,
            status=status,
            priority=priority,
            assigned_to=assigned_to,
            tags=tags_list,
            due_date_from=due_date_from_dt,
            due_date_to=due_date_to_dt,
            limit=limit,
            offset=offset
        )
        
        return [task.to_dict() for task in tasks]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tasks: {str(e)}")

@router.get("/overdue", response_model=List[Dict[str, Any]])
async def get_overdue_tasks(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all overdue tasks"""
    try:
        tasks = await task_service.get_overdue_tasks(current_user["id"])
        return [task.to_dict() for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve overdue tasks: {str(e)}")

@router.get("/due-today", response_model=List[Dict[str, Any]])
async def get_tasks_due_today(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get tasks due today"""
    try:
        tasks = await task_service.get_tasks_due_today(current_user["id"])
        return [task.to_dict() for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tasks due today: {str(e)}")

@router.get("/upcoming", response_model=List[Dict[str, Any]])
async def get_upcoming_tasks(
    days_ahead: int = Query(7, ge=1, le=365, description="Number of days ahead to look"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get upcoming tasks within the next N days"""
    try:
        tasks = await task_service.get_upcoming_tasks(current_user["id"], days_ahead)
        return [task.to_dict() for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve upcoming tasks: {str(e)}")

@router.get("/{task_id}", response_model=Dict[str, Any])
async def get_task(
    task_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific task by ID"""
    try:
        task = await task_service.get_task(task_id, current_user["id"])
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task: {str(e)}")

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new task"""
    try:
        task = await task_service.create_task(task_data.dict(), current_user["id"])
        return task.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

@router.put("/{task_id}", response_model=Dict[str, Any])
async def update_task(
    task_id: str,
    updates: TaskUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update an existing task"""
    try:
        # Filter out None values
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid updates provided")
        
        task = await task_service.update_task(task_id, update_data, current_user["id"])
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return task.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

@router.patch("/{task_id}/complete", response_model=Dict[str, Any])
async def mark_task_complete(
    task_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark a task as completed"""
    try:
        task = await task_service.mark_task_complete(task_id, current_user["id"])
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark task complete: {str(e)}")

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a task"""
    try:
        success = await task_service.delete_task(task_id, current_user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")

# Google Calendar Integration Endpoints

@router.get("/google-calendar/auth-url")
async def get_google_calendar_auth_url(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get Google Calendar authorization URL"""
    try:
        auth_url = task_service.get_google_auth_url(current_user["id"])
        if not auth_url:
            raise HTTPException(status_code=503, detail="Google Calendar integration not available")
        
        return {"auth_url": auth_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")

@router.get("/stats", response_model=Dict[str, Any])
async def get_task_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get task statistics for the current user"""
    try:
        # Get all tasks
        all_tasks = await task_service.get_tasks(current_user["id"], limit=1000)
        
        # Calculate statistics
        total_tasks = len(all_tasks)
        completed_tasks = len([t for t in all_tasks if t.status == TaskStatus.COMPLETED])
        pending_tasks = len([t for t in all_tasks if t.status == TaskStatus.PENDING])
        in_progress_tasks = len([t for t in all_tasks if t.status == TaskStatus.IN_PROGRESS])
        overdue_tasks = len([t for t in all_tasks if t.is_overdue()])
        
        # Priority breakdown
        priority_breakdown = {
            "low": len([t for t in all_tasks if t.priority == TaskPriority.LOW]),
            "medium": len([t for t in all_tasks if t.priority == TaskPriority.MEDIUM]),
            "high": len([t for t in all_tasks if t.priority == TaskPriority.HIGH]),
            "urgent": len([t for t in all_tasks if t.priority == TaskPriority.URGENT])
        }
        
        # Get upcoming tasks
        upcoming_tasks = await task_service.get_upcoming_tasks(current_user["id"], 7)
        tasks_due_today = await task_service.get_tasks_due_today(current_user["id"])
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "overdue_tasks": overdue_tasks,
            "tasks_due_today": len(tasks_due_today),
            "upcoming_tasks_7_days": len(upcoming_tasks),
            "completion_rate": round(completion_rate, 1),
            "priority_breakdown": priority_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task statistics: {str(e)}") 