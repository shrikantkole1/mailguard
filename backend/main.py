"""
FastAPI Gateway for Email Threat Triage Platform
Orchestrates MCP servers and Pydantic AI Agent

This is the production API that the React frontend communicates with.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from enum import Enum
import asyncio
from datetime import datetime
import logging

# Initialize FastAPI app
app = FastAPI(
    title="Email Threat Triage API",
    description="Autonomous security analysis powered by Archestra AI",
    version="1.0.0"
)

# Configure CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("email_threat_triage")


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


# ============================================================================
# MCP TOOL CLIENT (Simulated - Replace with actual MCP calls)
# ============================================================================

async def call_domain_reputation_tool(sender_email: str) -> Dict[str, Any]:
    """
    Calls the Domain Reputation MCP server
    In production: Use MCP client to call server_domain_intel.py
    """
    import random
    import hashlib
    
    # Simulate realistic API latency
    await asyncio.sleep(1.5)
    
    start_time = asyncio.get_event_loop().time()
    
    domain = sender_email.split('@')[-1].lower()
    
    # Deterministic seeding for consistent demos
    seed = int(hashlib.md5(domain.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    # Check for typosquatting
    legitimate_brands = ["google.com", "microsoft.com", "paypal.com", "apple.com"]
    is_typosquatting = any(
        domain in brand or brand.replace('a', '4') in domain or brand.replace('o', '0') in domain
        for brand in legitimate_brands
    )
    
    # Check suspicious TLDs
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.buzz']
    is_suspicious_tld = any(domain.endswith(tld) for tld in suspicious_tlds)
    
    # Domain age simulation
    domain_age_days = random.randint(1, 90) if is_typosquatting or is_suspicious_tld else random.randint(365, 3650)
    
    # Calculate trust score
    trust_score = 100
    risk_factors = []
    
    if is_typosquatting:
        trust_score -= 40
        risk_factors.append("Possible brand impersonation detected")
    
    if is_suspicious_tld:
        trust_score -= 25
        risk_factors.append("Suspicious top-level domain")
    
    if domain_age_days < 90:
        trust_score -= 20
        risk_factors.append(f"Newly registered domain ({domain_age_days} days)")
    
    trust_score = max(0, trust_score)
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "domain": domain,
        "trust_score": trust_score,
        "domain_age_days": domain_age_days,
        "risk_factors": risk_factors,
        "execution_time_ms": execution_time,
        "output_summary": f"Domain: {domain} | Trust Score: {trust_score}/100 | Age: {domain_age_days} days | Factors: {', '.join(risk_factors) if risk_factors else 'None'}"
    }


async def call_url_scanner_tool(email_body: str) -> Dict[str, Any]:
    """
    Calls the URL Scanner MCP server
    In production: Use MCP client to call server_url_analysis.py
    """
    import re
    
    await asyncio.sleep(1.2)
    start_time = asyncio.get_event_loop().time()
    
    # Extract URLs
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, email_body)
    
    risk_score = 0
    findings = []
    
    for url in urls:
        # IP-based URLs
        if re.match(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
            risk_score += 30
            findings.append(f"IP-based URL detected: {url}")
        
        # URL shorteners
        shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl']
        if any(s in url for s in shorteners):
            risk_score += 20
            findings.append(f"URL shortener detected: {url}")
    
    risk_score = min(risk_score, 100)
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "urls_found": len(urls),
        "risk_score": risk_score,
        "findings": findings,
        "execution_time_ms": execution_time,
        "output_summary": f"Found {len(urls)} URL(s) | Risk: {risk_score}/100 | {', '.join(findings) if findings else 'No suspicious URLs'}"
    }


async def call_file_forensics_tool(attachments: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Calls the File Forensics MCP server
    In production: Use MCP client to call server_file_forensics.py
    """
    await asyncio.sleep(1.8)
    start_time = asyncio.get_event_loop().time()
    
    if not attachments:
        return {
            "risk_score": 0,
            "findings": [],
            "execution_time_ms": 50,
            "output_summary": "No attachments to analyze"
        }
    
    risk_score = 0
    findings = []
    
    for att in attachments:
        filename = att.get('filename', '')
        mime_type = att.get('mime_type', '')
        
        # Double extension attack
        if filename.count('.') >= 2 and any(ext in filename.lower() for ext in ['.exe', '.scr', '.bat', '.cmd']):
            risk_score = 95
            findings.append(f"CRITICAL: Double extension attack detected in '{filename}'")
        
        # Executable files
        elif filename.lower().endswith(('.exe', '.scr', '.bat', '.cmd', '.vbs')):
            risk_score = max(risk_score, 85)
            findings.append(f"Executable file detected: '{filename}'")
        
        # Macro-enabled documents
        elif filename.lower().endswith(('.docm', '.xlsm', '.pptm')):
            risk_score = max(risk_score, 60)
            findings.append(f"Macro-enabled document: '{filename}'")
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "risk_score": risk_score,
        "findings": findings,
        "execution_time_ms": execution_time,
        "output_summary": f"Analyzed {len(attachments)} file(s) | Risk: {risk_score}/100 | {', '.join(findings) if findings else 'All files appear safe'}"
    }


async def call_social_engineering_detector(subject: str, body: str) -> Dict[str, Any]:
    """
    Detects social engineering patterns
    """
    await asyncio.sleep(0.8)
    start_time = asyncio.get_event_loop().time()
    
    risk_score = 0
    findings = []
    
    # Urgency keywords
    urgency_keywords = ['urgent', 'immediate', 'action required', 'suspended', 'verify now']
    if any(keyword in subject.lower() or keyword in body.lower() for keyword in urgency_keywords):
        risk_score += 25
        findings.append("Urgency language detected")
    
    # Financial requests
    financial_keywords = ['payment', 'invoice', 'wire transfer', 'bitcoin', 'bank account']
    if any(keyword in body.lower() for keyword in financial_keywords):
        risk_score += 20
        findings.append("Financial transaction language detected")
    
    # Credential harvesting
    credential_keywords = ['verify your account', 'confirm your identity', 'update password', 'login here']
    if any(keyword in body.lower() for keyword in credential_keywords):
        risk_score += 30
        findings.append("Credential harvesting pattern detected")
    
    risk_score = min(risk_score, 100)
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "risk_score": risk_score,
        "findings": findings,
        "execution_time_ms": execution_time,
        "output_summary": f"Social Engineering Risk: {risk_score}/100 | {', '.join(findings) if findings else 'No manipulation patterns detected'}"
    }


# ============================================================================
# RISK SCORING ENGINE
# ============================================================================

def calculate_final_risk_score(scores: AggregatedScores) -> int:
    """
    Weighted risk calculation:
    - Attachment: 35%
    - Domain: 30%
    - URL: 20%
    - Social Engineering: 15%
    """
    weighted_score = (
        (scores.attachment_risk * 0.35) +
        (scores.domain_risk * 0.30) +
        (scores.url_risk * 0.20) +
        (scores.social_engineering_risk * 0.15)
    )
    return min(int(weighted_score), 100)


def classify_threat(risk_score: int) -> tuple[ThreatClassification, str]:
    """
    Classify threat and recommend action
    Returns: (classification, recommended_action)
    """
    if risk_score >= 61:
        return ThreatClassification.MALICIOUS, "block_sender"
    elif risk_score >= 31:
        return ThreatClassification.SUSPICIOUS, "warn_user"
    else:
        return ThreatClassification.SAFE, "allow"


# ============================================================================
# MAIN ANALYSIS ENDPOINT
# ============================================================================

@app.post("/api/analyze", response_model=SecurityVerdict)
async def analyze_email(request: EmailAnalysisRequest) -> SecurityVerdict:
    """
    Main email analysis endpoint
    Orchestrates all MCP tools in parallel and returns structured verdict
    """
    logger.info(
        f"analysis.started: sender={request.sender_email} subject={request.subject} attachments={len(request.attachments)}"
    )
    
    trace_log: List[ToolExecutionTrace] = []
    
    try:
        # Execute all tools in parallel using asyncio.gather
        results = await asyncio.gather(
            call_domain_reputation_tool(request.sender_email),
            call_url_scanner_tool(request.body),
            call_file_forensics_tool(request.attachments),
            call_social_engineering_detector(request.subject, request.body),
            return_exceptions=True
        )
        
        domain_result, url_result, file_result, social_result = results
        
        # Build execution trace
        current_time = datetime.utcnow()
        
        trace_log.append(ToolExecutionTrace(
            tool_name="check_domain_reputation",
            called_at=current_time.isoformat(),
            input_params={"sender_email": request.sender_email},
            output_summary=domain_result.get("output_summary", ""),
            execution_time_ms=domain_result.get("execution_time_ms", 0)
        ))
        
        trace_log.append(ToolExecutionTrace(
            tool_name="scan_urls",
            called_at=current_time.isoformat(),
            input_params={"email_body": request.body[:50] + "..."},
            output_summary=url_result.get("output_summary", ""),
            execution_time_ms=url_result.get("execution_time_ms", 0)
        ))
        
        if request.attachments:
            trace_log.append(ToolExecutionTrace(
                tool_name="analyze_attachments",
                called_at=current_time.isoformat(),
                input_params={"filenames": [a['filename'] for a in request.attachments]},
                output_summary=file_result.get("output_summary", ""),
                execution_time_ms=file_result.get("execution_time_ms", 0)
            ))
        
        trace_log.append(ToolExecutionTrace(
            tool_name="detect_social_engineering",
            called_at=current_time.isoformat(),
            input_params={"subject": request.subject, "body_length": len(request.body)},
            output_summary=social_result.get("output_summary", ""),
            execution_time_ms=social_result.get("execution_time_ms", 0)
        ))
        
        # Aggregate scores
        scores = AggregatedScores(
            url_risk=url_result.get("risk_score", 0),
            domain_risk=100 - domain_result.get("trust_score", 100),
            attachment_risk=file_result.get("risk_score", 0),
            social_engineering_risk=social_result.get("risk_score", 0)
        )
        
        # Calculate final score
        final_score = calculate_final_risk_score(scores)
        
        # Classify
        classification, action = classify_threat(final_score)
        
        # Generate reasoning
        reasoning_parts = []
        if scores.attachment_risk > 60:
            reasoning_parts.append("Malicious attachment detected")
        if scores.domain_risk > 60:
            reasoning_parts.append("Suspicious sender domain")
        if scores.url_risk > 60:
            reasoning_parts.append("Dangerous URLs found")
        if scores.social_engineering_risk > 60:
            reasoning_parts.append("Social engineering patterns detected")
        
        if not reasoning_parts:
            reasoning = "Email appears legitimate with no significant security concerns."
        elif classification == ThreatClassification.MALICIOUS:
            reasoning = f"CRITICAL THREAT: {', '.join(reasoning_parts)}. Immediate action required."
        else:
            reasoning = f"Suspicious indicators: {', '.join(reasoning_parts)}. Recommend caution."
        
        # Build verdict
        verdict = SecurityVerdict(
            email_metadata={
                "sender": request.sender_email,
                "subject": request.subject,
                "analyzed_at": datetime.utcnow().isoformat()
            },
            tool_execution_trace=trace_log,
            aggregated_scores=scores,
            final_risk_score=final_score,
            classification=classification,
            recommended_action=action,
            reasoning_summary=reasoning,
            confidence_percentage=92
        )
        
        logger.info(
            f"analysis.completed: classification={classification.value} risk_score={final_score}"
        )
        
        return verdict
        
        
    except Exception as e:
        logger.error(f"analysis.failed: error={str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ============================================================================
# EMAIL FETCHING (SIMULATED)
# ============================================================================

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


@app.get("/api/fetch-emails", response_model=List[EmailMessage])
async def fetch_emails(email: Optional[str] = None):
    """
    Simulates fetching emails from a connected inbox.
    In production, this would use Gmail/Outlook APIs with OAuth tokens.
    """
    import random
    import uuid
    
    # Simulate API latency
    await asyncio.sleep(1.0)
    
    current_date = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Mock data for demonstration
    mock_emails = [
        EmailMessage(
            id=str(uuid.uuid4()),
            sender="security-alert@metasploit-demo.com",
            subject="URGENT: Suspicious Login Detected",
            snippet="We detected a login from an unrecognized device in Moscow, Russia. Please verify immediately...",
            date=current_date,
            body="""
            Dear User,
            
            We detected a login from an unrecognized device in Moscow, Russia.
            
            Device: iPhone 13 Pro
            Location: Moscow, RU
            Time: Just now
            
            If this wasn't you, please secure your account immediately by clicking the link below:
            
            <a href="http://bit.ly/secure-account-login">Secure My Account</a>
            
            Failure to verify may result in account suspension.
            
            Security Team
            """,
            is_read=False,
            folder="inbox"
        ),
        EmailMessage(
            id=str(uuid.uuid4()),
            sender="newsletter@tech-weekly.io",
            subject="Top 5 AI Trends in 2026",
            snippet="Here are the top stories you missed this week in the world of Artificial Intelligence...",
            date=current_date,
            body="""
            Hi Subscriber,
            
            Here are the top stories you missed this week:
            
            1. GPT-6 released with reasoning capabilities
            2. Quantum computing breakthrough in encryption
            3. AI agents now managing 40% of enterprise workflows
            
            Read the full story on our blog.
            
            Cheers,
            The Tech Weekly Team
            """,
            is_read=True,
            folder="updates"
        ),
        EmailMessage(
            id=str(uuid.uuid4()),
            sender="hr-payroll@company-secure-docs.net",
            subject="Action Required: Q1 Bonus Distribution",
            snippet="Please review the attached Excel file to confirm your bank details for the upcoming bonus payout...",
            date=current_date,
            body="""
            Hello Team,
            
            We are finalizing the Q1 bonus distribution.
            
            Please review the attached Excel file to confirm your bank details. You may need to enable editing to view the protected fields.
            
            Regards,
            Human Resources
            """,
            attachments=[{"filename": "Bonus_Payout_Q1.xlsm", "mime_type": "application/vnd.ms-excel.sheet.macroEnabled.12"}],
            is_read=False,
            folder="inbox"
        ),
        EmailMessage(
            id=str(uuid.uuid4()),
            sender="invoice@vendor-billing-update.com",
            subject="Overdue Invoice #9928",
            snippet="Your payment for Invoice #9928 is overdue. Please remit payment immediately to avoid service interruption...",
            date=current_date,
            body="""
            Dear Customer,
            
            Your payment for Invoice #9928 ($4,500.00) is overdue.
            
            Please remit payment immediately to avoid service interruption.
            
            Pay securely here: http://secure-payment-portal-redirect.com/pay/9928
            
            Accounts Receivable
            """,
            is_read=False,
            folder="inbox"
        ),
        EmailMessage(
            id=str(uuid.uuid4()),
            sender="alice@project-team.com",
            subject="Meeting notes from today",
            snippet="Hi everyone, here are the key takeaways from our sync. 1. Design phase is complete. 2. Dev starts Monday...",
            date=current_date,
            body="""
            Hi everyone,
            
            Here are the key takeaways from our sync:
            
            1. Design phase is complete.
            2. Dev starts Monday.
            3. QA planned for next Friday.
            
            See you at the standup.
            
            Best,
            Alice
            """,
            is_read=True,
            folder="inbox"
        )
    ]
    
    return mock_emails


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "email-threat-triage-api",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
