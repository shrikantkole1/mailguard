from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
import httpx
import os
from typing import Optional
from backend.db.database import get_database
from backend.models.user import UserCreate, UserInDB, UserResponse
from backend.auth.utils import create_access_token, decode_access_token
from datetime import timedelta, datetime
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your_google_client_id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your_google_client_secret")
REDIRECT_URI = os.getenv("REDIRECT_URI", "http://localhost:8000/auth/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@router.get("/login/google")
async def login_google():
    """Redirect user to Google OAuth consent screen"""
    return RedirectResponse(
        url=f"https://accounts.google.com/o/oauth2/v2/auth?client_id={GOOGLE_CLIENT_ID}&response_type=code&scope=openid%20email%20profile&redirect_uri={REDIRECT_URI}&access_type=offline"
    )

@router.get("/callback")
async def auth_callback(code: str, db=Depends(get_database)):
    """Handle Google callback, exact token, and create user session"""
    
    # 1. Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
        }
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve token from Google")
        token_data = response.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        
        # 2. Get user info using access token
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_info_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve user info from Google")
        user_info = user_info_response.json()
    
    # 3. Upsert User in DB
    users_collection = db["users"]
    existing_user = await users_collection.find_one({"email": user_info["email"]})
    
    if existing_user:
        # Update existing user
        update_data = {
            "last_login_at": datetime.utcnow(), 
            "picture": user_info.get("picture"),
            "google_access_token": access_token
        }
        if refresh_token:
            update_data["google_refresh_token"] = refresh_token
            
        await users_collection.update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_data}
        )
        user_id = str(existing_user["_id"])
        user_plan = existing_user.get("plan", "free")
    else:
        # Create new user
        new_user = UserInDB(
            google_id=user_info["id"],
            email=user_info["email"],
            name=user_info["name"],
            picture=user_info.get("picture"),
            google_access_token=access_token,
            google_refresh_token=refresh_token
        )
        result = await users_collection.insert_one(new_user.model_dump(by_alias=True, exclude={"id"}))
        user_id = str(result.inserted_id)
        user_plan = "free"
        
    # 4. Create Session Token (JWT)
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user_id, "email": user_info["email"], "plan": user_plan},
        expires_delta=access_token_expires
    )
    
    # 5. Redirect to Frontend with Token (Or set cookie)
    # For simplicity, we'll redirect to frontend with token in URL fragment
    # In production, use HttpOnly cookies for better security
    response = RedirectResponse(url=f"{FRONTEND_URL}/auth/success?token={access_token}")
    
    # Set HttpOnly Cookie (Optional but recommended)
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", secure=False) # Secure=True in prod
    
    return response

@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request, db=Depends(get_database)):
    """Get current authenticated user"""
    token = request.cookies.get("access_token")
    if not token:
         # Check Authorization header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Convert ObjectId to string for Pydantic model
    user["id"] = str(user["_id"])
    return user
