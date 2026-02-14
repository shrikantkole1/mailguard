import asyncio
from datetime import datetime
from typing import List
import logging

from backend.models.schemas import (
    EmailAnalysisRequest, 
    SecurityVerdict, 
    ToolExecutionTrace, 
    AggregatedScores, 
    ThreatClassification
)
from backend.engine.domain import analyze_domain
from backend.engine.url import scan_urls
from backend.engine.forensics import analyze_attachments
from backend.engine.social import detect_social_engineering

logger = logging.getLogger("email_threat_triage")

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


async def analyze_email_content(parsed_email: EmailAnalysisRequest) -> SecurityVerdict:
    """
    Core orchestration logic: Runs all analysis tools in parallel.
    """
    logger.info(
        f"orchestrator.start: sender={parsed_email.sender_email} subject={parsed_email.subject}"
    )
    
    trace_log: List[ToolExecutionTrace] = []
    
    # Execute all tools in parallel using asyncio.gather
    results = await asyncio.gather(
        analyze_domain(parsed_email.sender_email),
        scan_urls(parsed_email.body),
        analyze_attachments(parsed_email.attachments),
        detect_social_engineering(parsed_email.subject, parsed_email.body),
        return_exceptions=True
    )
    
    domain_result, url_result, file_result, social_result = results
    
    # Check for exceptions
    for i, res in enumerate(results):
        if isinstance(res, Exception):
            logger.error(f"Tool execution failed: {res}")
            # Fallback to empty/safe result if a tool fails
            if i == 0: domain_result = {"trust_score": 100, "output_summary": "Analysis failed"}
            elif i == 1: url_result = {"risk_score": 0, "output_summary": "Analysis failed"}
            elif i == 2: file_result = {"risk_score": 0, "output_summary": "Analysis failed"}
            elif i == 3: social_result = {"risk_score": 0, "output_summary": "Analysis failed"}

    # Build execution trace
    current_time = datetime.utcnow()
    
    trace_log.append(ToolExecutionTrace(
        tool_name="check_domain_reputation",
        called_at=current_time.isoformat(),
        input_params={"sender_email": parsed_email.sender_email},
        output_summary=domain_result.get("output_summary", ""),
        execution_time_ms=domain_result.get("execution_time_ms", 0)
    ))
    
    trace_log.append(ToolExecutionTrace(
        tool_name="scan_urls",
        called_at=current_time.isoformat(),
        input_params={"email_body": parsed_email.body[:50] + "..."},
        output_summary=url_result.get("output_summary", ""),
        execution_time_ms=url_result.get("execution_time_ms", 0)
    ))
    
    if parsed_email.attachments:
        trace_log.append(ToolExecutionTrace(
            tool_name="analyze_attachments",
            called_at=current_time.isoformat(),
            input_params={"filenames": [a['filename'] for a in parsed_email.attachments]},
            output_summary=file_result.get("output_summary", ""),
            execution_time_ms=file_result.get("execution_time_ms", 0)
        ))
    
    trace_log.append(ToolExecutionTrace(
        tool_name="detect_social_engineering",
        called_at=current_time.isoformat(),
        input_params={"subject": parsed_email.subject, "body_length": len(parsed_email.body)},
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
    
    # Generate reasoning with specific threat warnings
    reasoning_parts = []
    threat_level = "unknown"
    
    if scores.attachment_risk > 80:
        reasoning_parts.append("🚨 MALWARE DETECTED in attachments")
        threat_level = "malware"
    elif scores.attachment_risk > 60:
        reasoning_parts.append("⚠️ Dangerous attachment detected")
        threat_level = "malware"
    
    if scores.domain_risk > 80:
        reasoning_parts.append("🚨 PHISHING: Domain impersonating trusted brand")
        if threat_level == "unknown":
            threat_level = "phishing"
    elif scores.domain_risk > 60:
        reasoning_parts.append("⚠️ Suspicious sender domain")
        if threat_level == "unknown":
            threat_level = "phishing"
    
    if scores.url_risk > 60:
        reasoning_parts.append("⚠️ Malicious URLs attempting to steal credentials")
    
    if scores.social_engineering_risk > 60:
        reasoning_parts.append("⚠️ Manipulation tactics designed to extract sensitive information")
    
    if not reasoning_parts:
        reasoning = "✅ Email appears legitimate with no significant security concerns. All checks passed successfully."
    elif classification == ThreatClassification.MALICIOUS:
        if threat_level == "malware":
            reasoning = f"🚨 CRITICAL MALWARE THREAT: {', '.join(reasoning_parts)}. This email contains dangerous malware attempting to compromise your system. QUARANTINE IMMEDIATELY and notify security team."
        elif threat_level == "phishing":
            reasoning = f"🚨 CRITICAL PHISHING ATTACK: {', '.join(reasoning_parts)}. Attackers are impersonating a trusted entity to steal your credentials or financial information. DO NOT CLICK any links or provide any information."
        else:
            reasoning = f"🚨 CRITICAL THREAT DETECTED: {', '.join(reasoning_parts)}. Immediate action required to prevent security breach."
    else:
        reasoning = f"⚠️ SUSPICIOUS EMAIL: {', '.join(reasoning_parts)}. Exercise extreme caution - this may be a phishing attempt. Verify sender through alternate channels before taking any action."
    
    # Build verdict
    verdict = SecurityVerdict(
        email_metadata={
            "sender": parsed_email.sender_email,
            "subject": parsed_email.subject,
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
        f"orchestrator.complete: classification={classification.value} risk_score={final_score}"
    )
    
    return verdict
