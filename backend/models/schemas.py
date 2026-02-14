from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from enum import Enum

# ============================================================================
# REQUEST/RESPONSE MODELS (Type-Safe Contract)
# ============================================================================

class EmailAnalysisRequest(BaseModel):
    """Request payload from frontend"""
    sender_email: EmailStr
    subject: str = Field(min_length=1, max_length=500)
    body: str = Field(min_length=1, max_length=50000)
    attachments: List[Dict[str, str]] = Field(default_factory=list)


class ThreatClassification(str, Enum):
    """Email threat classification levels"""
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    MALICIOUS = "malicious"


class ToolExecutionTrace(BaseModel):
    """Single tool execution record"""
    tool_name: str
    called_at: str
    input_params: Dict[str, Any]
    output_summary: str
    execution_time_ms: int


class AggregatedScores(BaseModel):
    """Risk scores from all analysis tools"""
    url_risk: int = Field(ge=0, le=100)
    domain_risk: int = Field(ge=0, le=100)
    attachment_risk: int = Field(ge=0, le=100)
    social_engineering_risk: int = Field(ge=0, le=100)


class SecurityVerdict(BaseModel):
    """
    Primary API response - matches frontend TypeScript interface exactly
    """
    email_metadata: Dict[str, str]
    tool_execution_trace: List[ToolExecutionTrace]
    aggregated_scores: AggregatedScores
    final_risk_score: int = Field(ge=0, le=100)
    classification: ThreatClassification
    recommended_action: str
    reasoning_summary: str
    confidence_percentage: int = Field(ge=0, le=100)


class EmailMessage(BaseModel):
    """
    Represents an email fetched from the inbox
    """
    id: str
    sender: str
    subject: str
    snippet: str
    date: str
    body: str
    attachments: List[Dict[str, str]] = Field(default_factory=list)
    is_read: bool = False
    folder: str = "inbox"
