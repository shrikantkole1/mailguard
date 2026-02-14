from typing import List, Dict, Any
import asyncio

async def analyze_attachments(attachments: List[Dict[str, str]]) -> Dict[str, Any]:
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
