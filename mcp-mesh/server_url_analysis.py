"""
URL Analysis MCP Server
Archestra-Native Implementation with FastMCP

This server extracts and analyzes URLs from email content.
Detects: IP-based URLs, shorteners, suspicious TLDs, phishing patterns.
"""

import re
import hashlib
import random
from typing import List, Dict
from pydantic import BaseModel, Field
from fastmcp import FastMCP
import structlog

# Initialize structured logging for Archestra observability
logger = structlog.get_logger()

# Initialize FastMCP server
mcp = FastMCP("URL Analyzer")

# Pydantic Models for Type Safety
class URLRiskAnalysis(BaseModel):
    """Structured output for URL risk assessment"""
    url: str
    risk_score: int = Field(ge=0, le=100, description="Risk score 0-100")
    risk_factors: List[str] = Field(default_factory=list)
    is_suspicious: bool
    url_type: str  # "normal", "ip_based", "shortened", "suspicious_tld"


class URLAnalysisResult(BaseModel):
    """Complete URL analysis result for an email"""
    total_urls_found: int
    suspicious_urls: List[URLRiskAnalysis]
    max_risk_score: int = Field(ge=0, le=100)
    overall_verdict: str  # "safe", "suspicious", "malicious"


# Threat Intelligence Data (Mock)
SUSPICIOUS_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".buzz", ".work", ".click"}
URL_SHORTENERS = {"bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd"}
PHISHING_PATTERNS = [
    r"secure.*-verify",
    r"account.*-suspended",
    r"confirm.*-identity",
    r"update.*-payment",
    r"urgent.*-action"
]


def extract_urls(text: str) -> List[str]:
    """Extract all URLs from text content"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(url_pattern, text)


def analyze_single_url(url: str) -> URLRiskAnalysis:
    """
    Analyze a single URL for risk factors
    Uses deterministic mocking (same URL always returns same result)
    """
    # Deterministic seed for consistent testing
    seed = int(hashlib.md5(url.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    risk_score = 0
    risk_factors = []
    url_type = "normal"
    
    # Check 1: IP-based URL
    ip_pattern = r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
    if re.match(ip_pattern, url):
        risk_score += 30
        risk_factors.append("IP-based URL (not domain-based)")
        url_type = "ip_based"
    
    # Check 2: URL Shorteners
    if any(shortener in url for shortener in URL_SHORTENERS):
        risk_score += 20
        risk_factors.append("URL shortener detected")
        url_type = "shortened"
    
    # Check 3: Suspicious TLD
    if any(tld in url for tld in SUSPICIOUS_TLDS):
        risk_score += 25
        risk_factors.append("Suspicious top-level domain")
        url_type = "suspicious_tld"
    
    # Check 4: Phishing patterns in URL
    for pattern in PHISHING_PATTERNS:
        if re.search(pattern, url, re.IGNORECASE):
            risk_score += 15
            risk_factors.append(f"Phishing pattern detected: {pattern}")
    
    # Check 5: Excessive subdomains (e.g., paypal.secure.verify.example.com)
    domain_part = url.split("//")[-1].split("/")[0]
    subdomain_count = domain_part.count(".")
    if subdomain_count > 3:
        risk_score += 10
        risk_factors.append(f"Suspicious subdomain depth: {subdomain_count}")
    
    # Add randomized component (simulating reputation database check)
    reputation_penalty = random.randint(0, 15)
    if reputation_penalty > 10:
        risk_score += reputation_penalty
        risk_factors.append(f"Negative reputation score from threat intel")
    
    # Normalize score
    risk_score = min(risk_score, 100)
    
    return URLRiskAnalysis(
        url=url,
        risk_score=risk_score,
        risk_factors=risk_factors,
        is_suspicious=risk_score > 30,
        url_type=url_type
    )


@mcp.tool()
def scan_urls(email_body: str) -> URLAnalysisResult:
    """
    Extract and analyze all URLs from email body content.
    
    This tool is called by Archestra when the agent needs URL risk assessment.
    Returns structured risk analysis for all detected URLs.
    
    Args:
        email_body: The full email body text
        
    Returns:
        URLAnalysisResult with detailed risk breakdown
    """
    logger.info("url_analysis.started", body_length=len(email_body))
    
    # Extract URLs
    urls = extract_urls(email_body)
    
    if not urls:
        logger.info("url_analysis.completed", urls_found=0)
        return URLAnalysisResult(
            total_urls_found=0,
            suspicious_urls=[],
            max_risk_score=0,
            overall_verdict="safe"
        )
    
    # Analyze each URL
    results = [analyze_single_url(url) for url in urls]
    
    # Calculate overall verdict
    suspicious_results = [r for r in results if r.is_suspicious]
    max_risk = max((r.risk_score for r in results), default=0)
    
    if max_risk > 60:
        verdict = "malicious"
    elif max_risk > 30:
        verdict = "suspicious"
    else:
        verdict = "safe"
    
    logger.info(
        "url_analysis.completed",
        total_urls=len(urls),
        suspicious_count=len(suspicious_results),
        max_risk_score=max_risk,
        verdict=verdict
    )
    
    return URLAnalysisResult(
        total_urls_found=len(urls),
        suspicious_urls=suspicious_results,
        max_risk_score=max_risk,
        overall_verdict=verdict
    )


if __name__ == "__main__":
    # Run MCP server
    mcp.run(transport='sse', port=8001)
