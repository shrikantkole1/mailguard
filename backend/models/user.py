from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None

class UserCreate(UserBase):
    google_id: str

class UserInDB(UserBase):
    id: Optional[str] = Field(alias="_id", default=None)
    google_id: str
    plan: UserPlan = UserPlan.FREE
    scan_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_superuser: bool = False
    
    # Google Tokens (In production, encrypt these!)
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    plan: UserPlan
    scan_count: int
    created_at: datetime
    last_login_at: datetime

    model_config = ConfigDict(populate_by_name=True)
