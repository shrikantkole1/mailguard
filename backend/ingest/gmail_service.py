import httpx
from typing import List, Dict, Any
import base64
from backend.models.schemas import EmailMessage

class GmailService:
    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me"

    def __init__(self, access_token: str):
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }

    async def fetch_recent_emails(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch email list IDs"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/messages",
                headers=self.headers,
                params={"maxResults": limit}
            )
            if response.status_code != 200:
                print(f"Gmail API Error: {response.text}") # Debug log
                return []
            
            data = response.json()
            return data.get("messages", [])

    async def get_email_details(self, message_id: str) -> Dict[str, Any]:
        """Fetch full email content"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/messages/{message_id}",
                headers=self.headers,
                params={"format": "full"}
            )
            if response.status_code != 200:
                return {}
            
            return response.json()

    def parse_email(self, raw_email: Dict[str, Any]) -> EmailMessage:
        """Parse Gmail API response into our EmailMessage model"""
        payload = raw_email.get("payload", {})
        headers = payload.get("headers", [])
        
        def get_header(name):
            return next((h["value"] for h in headers if h["name"].lower() == name.lower()), "")

        sender = get_header("From")
        subject = get_header("Subject")
        date = get_header("Date")
        
        # Body extraction (Simplified)
        body =  raw_email.get("snippet", "") # Fallback to snippet
        parts = payload.get("parts", [])
        
        # Try to find text/plain or text/html
        for part in parts:
            if part.get("mimeType") == "text/plain":
                if "data" in part["body"]:
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                    break
        
        return EmailMessage(
            id=raw_email["id"],
            sender=sender,
            subject=subject,
            snippet=raw_email.get("snippet", ""),
            date=date,
            body=body,
            is_read="UNREAD" not in raw_email.get("labelIds", []),
            folder="inbox"
        )
