"""
Domain Reputation Intelligence MCP Server
Archestra-Native Implementation with FastMCP

This server performs sender domain verification and reputation analysis.
Checks: Domain age, brand impersonation, blacklists, MX records.
"""

import re
import hashlib
import random
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from fastmcp import FastMCP
import structlog
import Levenshtein

# Initialize structured logging
logger = structlog.get_logger()

# Initialize FastMCP server
mcp = FastMCP("Domain Reputation Analyzer")


# Pydantic Models
class DomainReputationResult(BaseModel):
    """Structured domain reputation analysis"""
    domain: str
    domain_age_days: int = Field(description="Estimated domain age in days")
    is_newly_registered: bool = Field(description="Registered within last 90 days")
    is_blacklisted: bool
    impersonation_detected: bool
    impersonation_target: Optional[str] = None
    mx_records_valid: bool
    trust_score: int = Field(ge=0, le=100, description="Overall trust score")
    risk_factors: List[str] = Field(default_factory=list)


# Threat Intelligence (Mock Data)
KNOWN_BLACKLIST = {
    "evilcorp.com",
    "phishing-test.tk",
    "malware-download.ml",
    "scam-alert.buzz"
}

LEGITIMATE_BRANDS = {
    "google.com", "microsoft.com", "apple.com", "amazon.com",
    "paypal.com", "facebook.com", "linkedin.com", "netflix.com",
    "dropbox.com", "adobe.com", "salesforce.com"
}


def extract_domain(email: str) -> str:
    """Extract domain from email address"""
    return email.split("@")[-1].lower()


def check_brand_impersonation(domain: str) -> tuple[bool, Optional[str]]:
    """
    Detect brand impersonation using Levenshtein distance
    Returns: (is_impersonation, target_brand)
    """
    for brand in LEGITIMATE_BRANDS:
        # Check if domain is suspiciously similar but not exact
        distance = Levenshtein.distance(domain, brand)
        
        # If 1-2 characters different, likely typosquatting
        if 1 <= distance <= 2 and domain != brand:
            logger.warning(
                "brand_impersonation.detected",
                suspicious_domain=domain,
                target_brand=brand,
                levenshtein_distance=distance
            )
            return True, brand
        
        # Check for brand name in subdomain (e.g., paypal.verify-account.com)
        if brand.split(".")[0] in domain and domain != brand:
            return True, brand
    
    return False, None


def simulate_domain_age(domain: str) -> int:
    """
    Simulate domain age check (deterministic based on domain hash)
    In production, would use WHOIS API
    """
    seed = int(hashlib.md5(domain.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    # Most domains are old; some are new (realistic distribution)
    if random.random() < 0.15:  # 15% chance newly registered
        return random.randint(1, 90)
    else:
        return random.randint(365, 3650)  # 1-10 years


def validate_mx_records(domain: str) -> bool:
    """
    Simulate MX record validation (deterministic)
    In production, would use dnspython
    """
    seed = int(hashlib.md5(domain.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    # 95% of domains have valid MX records
    return random.random() > 0.05


@mcp.tool()
def check_domain_reputation(sender_email: str) -> DomainReputationResult:
    """
    Analyze sender domain reputation and trust characteristics.
    
    Called by Archestra agent to assess sender legitimacy.
    Performs multi-factor domain trust analysis.
    
    Args:
        sender_email: Full email address of sender
        
    Returns:
        DomainReputationResult with trust score and risk factors
    """
    logger.info("domain_reputation.started", sender_email=sender_email)
    
    # Extract domain
    domain = extract_domain(sender_email)
    
    # Initialize risk tracking
    risk_factors = []
    risk_score = 0
    
    # Check 1: Domain Age
    domain_age = simulate_domain_age(domain)
    is_new = domain_age < 90
    
    if is_new:
        risk_score += 20
        risk_factors.append(f"Newly registered domain ({domain_age} days old)")
    
    # Check 2: Blacklist
    is_blacklisted = domain in KNOWN_BLACKLIST
    if is_blacklisted:
        risk_score += 50
        risk_factors.append("Domain found in threat intelligence blacklist")
    
    # Check 3: Brand Impersonation
    impersonation_detected, target = check_brand_impersonation(domain)
    if impersonation_detected:
        risk_score += 35
        risk_factors.append(f"Possible impersonation of {target}")
    
    # Check 4: MX Records
    mx_valid = validate_mx_records(domain)
    if not mx_valid:
        risk_score += 15
        risk_factors.append("Invalid or missing MX records")
    
    # Calculate trust score (inverse of risk)
    trust_score = max(0, 100 - risk_score)
    
    result = DomainReputationResult(
        domain=domain,
        domain_age_days=domain_age,
        is_newly_registered=is_new,
        is_blacklisted=is_blacklisted,
        impersonation_detected=impersonation_detected,
        impersonation_target=target,
        mx_records_valid=mx_valid,
        trust_score=trust_score,
        risk_factors=risk_factors
    )
    
    logger.info(
        "domain_reputation.completed",
        domain=domain,
        trust_score=trust_score,
        risk_factors_count=len(risk_factors)
    )
    
    return result


if __name__ == "__main__":
    # Run MCP server
    mcp.run(transport='sse', port=8002)
