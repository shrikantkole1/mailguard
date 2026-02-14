from typing import Dict, Any
import asyncio
import random
import hashlib

async def analyze_domain(sender_email: str) -> Dict[str, Any]:
    """
    Calls the Domain Reputation MCP server
    In production: Use MCP client to call server_domain_intel.py
    """
    
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
