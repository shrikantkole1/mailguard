from typing import Dict, Any
import asyncio

async def detect_social_engineering(subject: str, body: str) -> Dict[str, Any]:
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
