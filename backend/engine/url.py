from typing import Dict, Any
import asyncio
import re

async def scan_urls(email_body: str) -> Dict[str, Any]:
    """
    Calls the URL Scanner MCP server
    In production: Use MCP client to call server_url_analysis.py
    """
    
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
