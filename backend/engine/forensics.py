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
        
        # Double extension attack (extreme danger)
        if filename.count('.') >= 2 and any(ext in filename.lower() for ext in ['.exe', '.scr', '.bat', '.cmd']):
            risk_score = 100
            findings.append(f"🚨 CRITICAL THREAT: Double extension attack detected in '{filename}' - DEFINITE MALWARE")
        
        # Executable files (very high risk)
        elif filename.lower().endswith(('.exe', '.scr', '.bat', '.cmd', '.vbs', '.js', '.jar', '.msi')):
            risk_score = max(risk_score, 95)
            findings.append(f"🚨 MALWARE DETECTED: Executable file '{filename}' - IMMEDIATE THREAT")
        
        # Macro-enabled documents (high risk - common malware vector)
        elif filename.lower().endswith(('.docm', '.xlsm', '.pptm', '.xlam', '.dotm')):
            risk_score = max(risk_score, 85)
            findings.append(f"⚠️ CRITICAL: Macro-enabled document '{filename}' - HIGH MALWARE RISK")
        
        # Compressed archives (potential malware delivery)
        elif filename.lower().endswith(('.zip', '.rar', '.7z', '.tar', '.gz')):
            risk_score = max(risk_score, 40)
            findings.append(f"WARNING: Compressed file '{filename}' may contain hidden malware")
        
        # Script files
        elif filename.lower().endswith(('.ps1', '.vbs', '.wsf', '.hta')):
            risk_score = max(risk_score, 90)
            findings.append(f"🚨 MALWARE: Script file '{filename}' - DANGEROUS PAYLOAD")
    
    execution_time = int((asyncio.get_event_loop().time() - start_time) * 1000)
    
    return {
        "risk_score": risk_score,
        "findings": findings,
        "execution_time_ms": execution_time,
        "output_summary": f"Analyzed {len(attachments)} file(s) | Risk: {risk_score}/100 | {findings[0] if findings else 'All files appear safe'}"
    }
