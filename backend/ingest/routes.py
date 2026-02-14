from fastapi import APIRouter, Depends, HTTPException
from typing import List
from backend.db.database import get_database
from backend.auth.routes import get_current_user
from backend.models.user import UserResponse, UserInDB
from backend.models.schemas import EmailMessage
from backend.models.scan import ScanInDB
from backend.ingest.gmail_service import GmailService
import logging
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["Ingestion"])
logger = logging.getLogger("email_threat_triage")

@router.get("/sync", response_model=List[EmailMessage])
async def sync_emails(
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Sync emails from Gmail, filter processed ones, and return new batch for analysis.
    """
    # 1. Get full user with tokens (UserResponse doesn't have tokens)
    user_with_tokens = await db["users"].find_one({"_id": ObjectId(current_user.id)})
    
    if not user_with_tokens or not user_with_tokens.get("google_access_token"):
        # Fallback to mock data if no tokens (for demo/dev without oauth)
        # In production, raise HTTPException(400, "Google account not connected")
        logger.warning(f"User {current_user.id} has no Google token. Returning empty list or mock.")
        return [] 
        
    access_token = user_with_tokens["google_access_token"]
    service = GmailService(access_token)
    
    # 2. Fetch Recent Emails
    raw_messages = await service.fetch_recent_emails(limit=10)
    
    new_emails = []
    
    for msg_meta in raw_messages:
        msg_id = msg_meta["id"]
        
        # 3. Idempotency Check
        # Check if we already have a scan for this message
        existing_scan = await db["scans"].find_one({
            "user_id": current_user.id,
            "message_id": msg_id
        })
        
        if existing_scan:
            continue # Skip already processed
            
        # 4. Fetch Full Content & Parse
        full_msg = await service.get_email_details(msg_id)
        if not full_msg:
            continue
            
        email_obj = service.parse_email(full_msg)
        new_emails.append(email_obj)
        
        # In a real queue system, we would push to queue here.
        # For now, we return them to frontend which will trigger individual analysis
        # or we could batch analyze here.
        
    return new_emails
