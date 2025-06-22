"""
Client management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from models.client import Client, ClientCreate, ClientUpdate, ClientSummary
from services.client_service import ClientService
from middleware.auth import get_current_user

router = APIRouter()

# Initialize service
client_service = ClientService()

@router.get("/", response_model=List[ClientSummary])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get list of clients with optional filtering"""
    try:
        clients = await client_service.get_clients(
            user_id=current_user["id"],
            skip=skip,
            limit=limit,
            status=status,
            priority=priority,
            search=search
        )
        return clients
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve clients: {str(e)}"
        )

@router.get("/{client_id}", response_model=Client)
async def get_client(
    client_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific client by ID"""
    try:
        client = await client_service.get_client(client_id, current_user["id"])
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        return client
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve client: {str(e)}"
        )

@router.post("/", response_model=Client, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new client"""
    try:
        client = await client_service.create_client(client_data, current_user["id"])
        return client
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create client: {str(e)}"
        )

@router.put("/{client_id}", response_model=Client)
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update an existing client"""
    try:
        client = await client_service.update_client(client_id, client_data, current_user["id"])
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        return client
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update client: {str(e)}"
        )

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a client"""
    try:
        success = await client_service.delete_client(client_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete client: {str(e)}"
        )

@router.get("/{client_id}/summary")
async def get_client_summary(
    client_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get client summary with statistics"""
    try:
        summary = await client_service.get_client_summary(client_id, current_user["id"])
        if not summary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve client summary: {str(e)}"
        ) 