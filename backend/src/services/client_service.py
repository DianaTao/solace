"""
Client service for managing client data
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from models.client import Client, ClientCreate, ClientUpdate, ClientSummary
from config.database import get_supabase

class ClientService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            supabase = get_supabase()
            # Simple health check - try to access the clients table
            result = supabase.table("clients").select("id").limit(1).execute()
            return True
        except Exception as e:
            self.logger.error(f"ClientService health check failed: {e}")
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
            
            # Use actual database columns: id, name, date_of_birth, contact_info, address, emergency_contact, case_type, status, created_at, updated_at
            query = supabase.table("clients").select("id, name, contact_info, case_type, status, created_at, updated_at")
            
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
                client_summary = ClientSummary(
                    id=client_data["id"],
                    name=client_data["name"],
                    case_number=f"CASE-{str(client_data['id'])[:8].upper()}",
                    status=client_data.get("status", "active"),
                    priority="medium",  # Default priority since not in DB
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
            
            # Use actual database columns
            result = supabase.table("clients").select(
                "id, name, date_of_birth, contact_info, address, emergency_contact, case_type, status, created_at, updated_at"
            ).eq("id", client_id).execute()
            
            if not result.data:
                return None
            
            client_record = result.data[0]
            
            # Map database fields to Client model, handling contact_info -> email/phone split
            contact_info = client_record.get("contact_info", "")
            email = ""
            phone = ""
            
            # Try to parse contact_info for email/phone (simple heuristic)
            if contact_info:
                if "@" in contact_info:
                    email = contact_info
                elif any(char.isdigit() for char in contact_info):
                    phone = contact_info
                else:
                    email = contact_info  # Default to email if unsure
            
            return Client(
                id=client_record["id"],
                name=client_record["name"],
                email=email,
                phone=phone,
                address=client_record.get("address", ""),
                notes="",  # Notes not in this table
                case_type=client_record.get("case_type", "general"),
                status=client_record.get("status", "active"),
                priority="medium",  # Default priority since not in DB
                emergency_contact=client_record.get("emergency_contact", ""),
                case_number=f"CASE-{str(client_record['id'])[:8].upper()}",
                social_worker_id=user_id,
                created_at=client_record["created_at"],
                updated_at=client_record["updated_at"],
                tags=[]
            )
            
        except Exception as e:
            self.logger.error(f"Error getting client {client_id}: {e}")
            raise
    
    async def create_client(self, client_data: ClientCreate, user_id: str) -> Client:
        """Create a new client"""
        try:
            supabase = get_supabase()
            
            # Map frontend fields to database schema
            # Combine email/phone into contact_info
            contact_info = ""
            if client_data.email:
                contact_info = client_data.email
            elif client_data.phone:
                contact_info = client_data.phone
            
            new_client = {
                "name": client_data.name,
                "contact_info": contact_info,
                "address": client_data.address or "",
                "emergency_contact": client_data.emergency_contact or "",
                "case_type": client_data.case_type or "general",
                "status": client_data.status or "active"
            }
            
            # Remove empty values
            new_client = {k: v for k, v in new_client.items() if v}
            
            result = supabase.table("clients").insert(new_client).execute()
            
            if not result.data:
                raise Exception("Failed to create client")
            
            # Return a Client object with the created data
            client_record = result.data[0]
            
            # Parse contact_info back to email/phone
            contact_info = client_record.get("contact_info", "")
            email = ""
            phone = ""
            
            if contact_info:
                if "@" in contact_info:
                    email = contact_info
                elif any(char.isdigit() for char in contact_info):
                    phone = contact_info
                else:
                    email = contact_info
            
            return Client(
                id=client_record["id"],
                name=client_record["name"],
                email=email,
                phone=phone,
                address=client_record.get("address", ""),
                notes="",
                case_type=client_record.get("case_type", "general"),
                status=client_record.get("status", "active"),
                priority="medium",
                emergency_contact=client_record.get("emergency_contact", ""),
                case_number=f"CASE-{str(client_record['id'])[:8].upper()}",
                social_worker_id=user_id,
                created_at=client_record["created_at"],
                updated_at=client_record["updated_at"],
                tags=[]
            )
            
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
            
            # Prepare update data using actual database columns
            update_fields = {}
            update_data = client_data.dict(exclude_unset=True)
            
            # Map frontend fields to database schema
            if 'name' in update_data:
                update_fields['name'] = update_data['name']
            
            # Handle contact_info mapping
            if 'email' in update_data or 'phone' in update_data:
                contact_info = ""
                if update_data.get('email'):
                    contact_info = update_data['email']
                elif update_data.get('phone'):
                    contact_info = update_data['phone']
                if contact_info:
                    update_fields['contact_info'] = contact_info
            
            # Map other fields
            field_mapping = {
                'address': 'address',
                'case_type': 'case_type',
                'status': 'status',
                'emergency_contact': 'emergency_contact'
            }
            
            for frontend_field, db_field in field_mapping.items():
                if frontend_field in update_data and update_data[frontend_field] is not None:
                    update_fields[db_field] = update_data[frontend_field]
            
            if update_fields:
                update_fields["updated_at"] = datetime.utcnow().isoformat()
                
                result = supabase.table("clients").update(update_fields).eq("id", client_id).execute()
                
                if not result.data:
                    return None
            
            # Return updated client
            return await self.get_client(client_id, user_id)
            
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
            
            # Simple summary without complex date parsing
            summary = {
                "client": client,
                "statistics": {
                    "total_notes": 0,
                    "total_tasks": 0,
                    "completed_tasks": 0,
                    "last_contact": client.updated_at,
                    "days_since_contact": 0
                }
            }
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error getting client summary {client_id}: {e}")
            raise 