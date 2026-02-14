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
    
    text = (subject + " " + body).lower()
    
    # CRITICAL urgency keywords (strong phishing indicators)
    critical_urgency = ['urgent', 'immediate action', 'suspended', 'verify now', 'within 24 hours', 
                        'account will be closed', 'unusual activity', 'temporarily suspended']
    if any(keyword in text for keyword in critical_urgency):
        risk_score += 35
        findings.append("CRITICAL: Extreme urgency tactics detected")
    
    # Standard urgency keywords
    urgency_keywords = ['action required', 'expires', 'hurry', 'limited time', 'act now']
    if any(keyword in text for keyword in urgency_keywords):
        risk_score += 20
        findings.append("Urgency language detected")
    
    # Credential harvesting (very high risk)
    credential_keywords = ['verify your account', 'confirm your identity', 'update password', 
                          'login here', 'click here to verify', 'confirm payment method',
                          'verify identity', 'update billing']
    if any(keyword in text for keyword in credential_keywords):
        risk_score += 40
        findings.append("CRITICAL: Credential harvesting pattern detected")
    
    # Financial requests
    financial_keywords = ['wire transfer', 'bitcoin', 'bank account', 'payment required',
                         'financial information', 'credit card']
    if any(keyword in text for keyword in financial_keywords):
        risk_score += 25
        findings.append("Financial transaction language detected")
    
    # Threat/fear tactics
    threat_keywords = ['permanently closed', 'legal action', 'suspended', 'blocked', 
                       'terminate', 'consequences', 'unauthorized access']
    if any(keyword in text for keyword in threat_keywords):
        risk_score += 30
        findings.append("Fear-based manipulation tactics detected")
    
    # Malware-specific patterns
    malware_patterns = ['enable macros', 'macroEnabled', 'open attachment', 'run this file',
                       'disable antivirus', 'confidential document']
    if any(pattern in text for pattern in malware_patterns):
        risk_score += 35
        findings.append("CRITICAL: Malware delivery patterns detected")
    
    risk_score = min(risk_score, 100)
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "risk_score": risk_score,
        "findings": findings,
        "execution_time_ms": execution_time,
        "output_summary": f"Social Engineering Risk: {risk_score}/100 | {', '.join(findings) if findings else 'No manipulation patterns detected'}"
    }
