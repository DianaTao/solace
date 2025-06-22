"""
Pydantic models for client data
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ClientStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"

class ClientPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    case_type: Optional[str] = "general"
    status: ClientStatus = ClientStatus.ACTIVE
    priority: ClientPriority = ClientPriority.MEDIUM
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    @validator('email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[ClientStatus] = None
    priority: Optional[ClientPriority] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None

class Client(ClientBase):
    id: str
    case_number: Optional[str] = None
    social_worker_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ClientSummary(BaseModel):
    id: str
    name: str
    case_number: str
    status: ClientStatus
    priority: ClientPriority
    last_contact: Optional[datetime] = None
    notes_count: int = 0
    tasks_count: int = 0
    
    class Config:
        from_attributes = True 