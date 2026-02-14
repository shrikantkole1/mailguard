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
    
    # Known safe domains
    safe_domains = ['company.com', 'gmail.com', 'outlook.com', 'microsoft.com']
    # Known typosquatting/phishing patterns
    phishing_patterns = ['paypa1', 'paypal-', 'amaz0n', 'amazon-', 'g00gle', 'micros0ft', 
                        'apple-', 'verify', 'secure', 'account-', 'support-']
    # Known malware/dangerous domains
    malware_domains = ['payro11', '.tk', '.ml', '.ga', '.ru', '.cn']
    
    trust_score = 100
    risk_factors = []
    
    # Check for safe domains
    is_safe = any(safe_domain in domain for safe_domain in safe_domains)
    
    # Check for phishing patterns (typosquatting)
    is_phishing = any(pattern in domain for pattern in phishing_patterns)
    
    # Check for malware domains
    is_malware = any(pattern in domain for pattern in malware_domains)
    
    if is_malware:
        trust_score = 5  # Very low trust
        risk_factors.append("CRITICAL: Domain associated with malware distribution")
        risk_factors.append("Domain recently flagged in threat intelligence feeds")
        domain_age_days = random.randint(1, 30)
    elif is_phishing:
        trust_score = 15  # Low trust
        risk_factors.append("WARNING: Typosquatting detected - impersonating legitimate brand")
        risk_factors.append("Domain mimics trusted service provider")
        domain_age_days = random.randint(1, 60)
    elif is_safe:
        trust_score = 95  # High trust
        domain_age_days = random.randint(1000, 3650)
    else:
        # Check for typosquatting using known brands
        legitimate_brands = ["google.com", "microsoft.com", "paypal.com", "apple.com", "amazon.com"]
        for brand in legitimate_brands:
            if brand.replace('a', '4') in domain or brand.replace('o', '0') in domain or brand.replace('l', '1') in domain:
                trust_score = 20
                risk_factors.append(f"Possible impersonation of {brand}")
                domain_age_days = random.randint(1, 90)
                break
        else:
            # Unknown domain
            trust_score = 60
            domain_age_days = random.randint(90, 365)
    
    # Check suspicious TLDs
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.buzz', '.ru']
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        trust_score = max(0, trust_score - 40)
        risk_factors.append("Suspicious top-level domain commonly used in attacks")
    
    # Domain age check
    if domain_age_days < 90:
        trust_score = max(0, trust_score - 20)
        risk_factors.append(f"Newly registered domain ({domain_age_days} days old)")
    
    trust_score = max(0, min(100, trust_score))
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "domain": domain,
        "trust_score": trust_score,
        "domain_age_days": domain_age_days,
        "risk_factors": risk_factors,
        "execution_time_ms": execution_time,
        "output_summary": f"Domain: {domain} | Trust Score: {trust_score}/100 | Age: {domain_age_days} days | {', '.join(risk_factors) if risk_factors else 'Domain appears legitimate'}"
    }
