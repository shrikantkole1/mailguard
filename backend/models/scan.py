from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from backend.models.schemas import ThreatClassification, AggregatedScores, ToolExecutionTrace

class Scan(BaseModel):
    user_id: str
    message_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any]
    verdict: Dict[str, Any]
    
    # Verdict structure specific to storage
    # {
    #   "score": 85,
    #   "classification": "MALICIOUS",
    #   "triggers": ["IP_URL_DETECTED", "TYPOSQUAT_DOMAIN"]
    # }

class ScanInDB(Scan):
    id: Optional[str] = Field(alias="_id", default=None)
