"""
Client service for business logic
"""

import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from config.database import get_supabase
from models.client import Client, ClientCreate, ClientUpdate, ClientSummary

logger = logging.getLogger(__name__)

class ClientService:
    def __init__(self):
        self.logger = logger
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        try:
            supabase = get_supabase()
            return supabase is not None
        except Exception:
            return False
    
    async def get_clients(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ClientSummary]:
        """Get list of clients with optional filtering"""
        try:
            supabase = get_supabase()
            
            # Build query - Note: social_worker_id column doesn't exist yet
            query = supabase.table("clients").select(
                "id, name, case_type, status, created_at, updated_at"
            )
            
            # Apply filters
            if status:
                query = query.eq("status", status)
            if search:
                query = query.ilike("name", f"%{search}%")
            
            # Apply pagination
            query = query.range(skip, skip + limit - 1).order("created_at", desc=True)
            
            result = query.execute()
            
            # Convert to ClientSummary objects
            clients = []
            for client_data in result.data:
                # Get additional stats (placeholder for now)
                client_summary = ClientSummary(
                    id=client_data["id"],
                    name=client_data["name"],
                    case_number=client_data.get("case_type", f"CASE-{client_data['id'][:8]}"),  # Use case_type or generate case number
                    status=client_data.get("status", "active"),
                    priority="medium",  # Default priority since column doesn't exist
                    last_contact=client_data.get("updated_at"),
                    notes_count=0,  # TODO: Get actual count
                    tasks_count=0   # TODO: Get actual count
                )
                clients.append(client_summary)
            
            return clients
            
        except Exception as e:
            self.logger.error(f"Error getting clients: {e}")
            raise
    
    async def get_client(self, client_id: str, user_id: str) -> Optional[Client]:
        """Get a specific client by ID"""
        try:
            supabase = get_supabase()
            
            result = supabase.table("clients").select("*").eq("id", client_id).execute()
            
            if not result.data:
                return None
            
            client_data = result.data[0]
            return Client(**client_data)
            
        except Exception as e:
            self.logger.error(f"Error getting client {client_id}: {e}")
            raise
    
    async def create_client(self, client_data: ClientCreate, user_id: str) -> Client:
        """Create a new client"""
        try:
            supabase = get_supabase()
            
            # Prepare client data with available columns
            new_client = {
                "id": str(uuid.uuid4()),
                "name": client_data.name,
                "case_type": getattr(client_data, 'case_type', 'general'),
                "status": getattr(client_data, 'status', 'active'),
                "contact_info": getattr(client_data, 'contact_info', ''),
                "address": getattr(client_data, 'address', ''),
                "emergency_contact": getattr(client_data, 'emergency_contact', ''),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = supabase.table("clients").insert(new_client).execute()
            
            if not result.data:
                raise Exception("Failed to create client")
            
            return Client(**result.data[0])
            
        except Exception as e:
            self.logger.error(f"Error creating client: {e}")
            raise
    
    async def update_client(self, client_id: str, client_data: ClientUpdate, user_id: str) -> Optional[Client]:
        """Update an existing client"""
        try:
            supabase = get_supabase()
            
            # Check if client exists
            existing = await self.get_client(client_id, user_id)
            if not existing:
                return None
            
            # Prepare update data
            update_data = {
                "updated_at": datetime.utcnow().isoformat(),
                **{k: v for k, v in client_data.dict(exclude_unset=True).items() if v is not None}
            }
            
            result = supabase.table("clients").update(update_data).eq("id", client_id).execute()
            
            if not result.data:
                return None
            
            return Client(**result.data[0])
            
        except Exception as e:
            self.logger.error(f"Error updating client {client_id}: {e}")
            raise
    
    async def delete_client(self, client_id: str, user_id: str) -> bool:
        """Delete a client"""
        try:
            supabase = get_supabase()
            
            # Check if client exists
            existing = await self.get_client(client_id, user_id)
            if not existing:
                return False
            
            result = supabase.table("clients").delete().eq("id", client_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            self.logger.error(f"Error deleting client {client_id}: {e}")
            raise
    
    async def get_client_summary(self, client_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get client summary with statistics"""
        try:
            client = await self.get_client(client_id, user_id)
            if not client:
                return None
            
            # TODO: Get actual statistics from related tables
            summary = {
                "client": client,
                "statistics": {
                    "total_notes": 0,
                    "total_tasks": 0,
                    "completed_tasks": 0,
                    "last_contact": client.updated_at,
                    "days_since_contact": (datetime.utcnow() - client.updated_at).days
                }
            }
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error getting client summary {client_id}: {e}")
            raise 