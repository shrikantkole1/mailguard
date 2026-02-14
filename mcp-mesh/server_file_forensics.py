"""
File Forensics & Attachment Analysis MCP Server
Archestra-Native Implementation with FastMCP

This server analyzes email attachments for malicious indicators.
Detects: Executables, macros, double extensions, suspicious MIME types.
"""

import re
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field
from fastmcp import FastMCP
import structlog

# Initialize structured logging
logger = structlog.get_logger()

# Initialize FastMCP server
mcp = FastMCP("Attachment Risk Analyzer")


# Enums for structured classification
class SeverityLevel(str, Enum):
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AttachmentType(str, Enum):
    DOCUMENT = "document"
    IMAGE = "image"
    ARCHIVE = "archive"
    EXECUTABLE = "executable"
    SCRIPT = "script"
    MACRO_ENABLED = "macro_enabled"
    UNKNOWN = "unknown"


# Pydantic Models
class AttachmentAnalysis(BaseModel):
    """Single attachment risk assessment"""
    filename: str
    mime_type: str
    detected_type: AttachmentType
    severity: SeverityLevel
    risk_score: int = Field(ge=0, le=100)
    risk_indicators: List[str] = Field(default_factory=list)
    is_suspicious: bool


class FileForensicsResult(BaseModel):
    """Complete attachment analysis result"""
    total_attachments: int
    suspicious_attachments: List[AttachmentAnalysis]
    max_severity: SeverityLevel
    overall_risk_score: int = Field(ge=0, le=100)
    recommended_action: str


# Threat Intelligence: Dangerous File Types
EXECUTABLE_EXTENSIONS = {
    ".exe", ".dll", ".bat", ".cmd", ".com", ".scr", ".vbs", ".js",
    ".jar", ".msi", ".app", ".deb", ".rpm"
}

MACRO_ENABLED_DOCS = {
    ".docm", ".xlsm", ".pptm", ".dotm", ".xltm", ".potm"
}

SCRIPT_EXTENSIONS = {
    ".ps1", ".sh", ".py", ".pl", ".rb", ".php"
}

ARCHIVE_EXTENSIONS = {
    ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"
}

SAFE_EXTENSIONS = {
    ".pdf", ".txt", ".jpg", ".jpeg", ".png", ".gif", ".bmp",
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"
}


def detect_double_extension(filename: str) -> bool:
    """
    Detect double extension attacks (e.g., invoice.pdf.exe)
    Attackers hide malicious extensions after safe-looking ones
    """
    parts = filename.lower().split(".")
    if len(parts) >= 3:
        # Check if there's a safe extension followed by dangerous one
        for i in range(len(parts) - 1):
            current_ext = f".{parts[i]}"
            next_ext = f".{parts[i+1]}"
            if current_ext in SAFE_EXTENSIONS and next_ext in EXECUTABLE_EXTENSIONS:
                return True
    return False


def analyze_single_attachment(filename: str, mime_type: str) -> AttachmentAnalysis:
    """
    Perform forensic analysis on a single attachment
    """
    logger.info("attachment_analysis.started", filename=filename, mime_type=mime_type)
    
    risk_score = 0
    risk_indicators = []
    severity = SeverityLevel.SAFE
    detected_type = AttachmentType.UNKNOWN
    
    # Normalize filename
    filename_lower = filename.lower()
    
    # Extract file extension
    file_ext = f".{filename_lower.split('.')[-1]}" if "." in filename_lower else ""
    
    # Analysis 1: Double Extension Attack
    if detect_double_extension(filename):
        risk_score += 40
        risk_indicators.append("Double extension attack detected (e.g., .pdf.exe)")
        severity = SeverityLevel.CRITICAL
        detected_type = AttachmentType.EXECUTABLE
    
    # Analysis 2: Executable Files
    elif file_ext in EXECUTABLE_EXTENSIONS:
        risk_score += 50
        risk_indicators.append(f"Executable file type: {file_ext}")
        severity = SeverityLevel.CRITICAL
        detected_type = AttachmentType.EXECUTABLE
    
    # Analysis 3: Script Files
    elif file_ext in SCRIPT_EXTENSIONS:
        risk_score += 35
        risk_indicators.append(f"Script file detected: {file_ext}")
        severity = SeverityLevel.HIGH
        detected_type = AttachmentType.SCRIPT
    
    # Analysis 4: Macro-Enabled Documents
    elif file_ext in MACRO_ENABLED_DOCS:
        risk_score += 30
        risk_indicators.append(f"Macro-enabled document: {file_ext}")
        severity = SeverityLevel.HIGH
        detected_type = AttachmentType.MACRO_ENABLED
    
    # Analysis 5: Archives (potential payload delivery)
    elif file_ext in ARCHIVE_EXTENSIONS:
        risk_score += 15
        risk_indicators.append(f"Archive file (may contain hidden payload): {file_ext}")
        severity = SeverityLevel.MEDIUM
        detected_type = AttachmentType.ARCHIVE
    
    # Analysis 6: MIME Type Mismatch
    if mime_type and file_ext:
        expected_mime_map = {
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".exe": "application/x-msdownload"
        }
        
        expected_mime = expected_mime_map.get(file_ext)
        if expected_mime and mime_type != expected_mime:
            risk_score += 20
            risk_indicators.append(f"MIME type mismatch: expected {expected_mime}, got {mime_type}")
            severity = max(severity, SeverityLevel.HIGH, key=lambda s: list(SeverityLevel).index(s))
    
    # Analysis 7: Suspicious Naming Patterns
    suspicious_patterns = [
        r"invoice.*\d+",  # invoice123.exe
        r"payment.*details",
        r"urgent.*document",
        r"password.*reset",
        r"account.*verification"
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, filename_lower):
            risk_score += 10
            risk_indicators.append(f"Suspicious filename pattern: {pattern}")
            severity = max(severity, SeverityLevel.MEDIUM, key=lambda s: list(SeverityLevel).index(s))
            break
    
    # Safe files
    if file_ext in SAFE_EXTENSIONS and not risk_indicators:
        detected_type = AttachmentType.DOCUMENT if file_ext in {".pdf", ".doc", ".docx"} else AttachmentType.IMAGE
    
    # Normalize risk score
    risk_score = min(risk_score, 100)
    
    return AttachmentAnalysis(
        filename=filename,
        mime_type=mime_type or "unknown",
        detected_type=detected_type,
        severity=severity,
        risk_score=risk_score,
        risk_indicators=risk_indicators,
        is_suspicious=risk_score > 20
    )


@mcp.tool()
def analyze_attachments(
    filenames: List[str],
    mime_types: Optional[List[str]] = None
) -> FileForensicsResult:
    """
    Perform forensic analysis on email attachments.
    
    Called by Archestra agent to assess attachment-based threats.
    Detects executables, scripts, macros, and obfuscation techniques.
    
    Args:
        filenames: List of attachment filenames
        mime_types: Optional list of MIME types (same order as filenames)
        
    Returns:
        FileForensicsResult with risk assessment for all attachments
    """
    logger.info("file_forensics.started", attachment_count=len(filenames))
    
    if not filenames:
        return FileForensicsResult(
            total_attachments=0,
            suspicious_attachments=[],
            max_severity=SeverityLevel.SAFE,
            overall_risk_score=0,
            recommended_action="No attachments to analyze"
        )
    
    # Normalize MIME types list
    if not mime_types:
        mime_types = ["unknown"] * len(filenames)
    
    # Analyze each attachment
    results = []
    for filename, mime_type in zip(filenames, mime_types):
        analysis = analyze_single_attachment(filename, mime_type)
        results.append(analysis)
    
    # Aggregate results
    suspicious = [r for r in results if r.is_suspicious]
    max_severity = max((r.severity for r in results), default=SeverityLevel.SAFE, key=lambda s: list(SeverityLevel).index(s))
    overall_risk = max((r.risk_score for r in results), default=0)
    
    # Determine action
    if max_severity == SeverityLevel.CRITICAL:
        action = "QUARANTINE IMMEDIATELY - Critical threat detected"
    elif max_severity == SeverityLevel.HIGH:
        action = "BLOCK - High-risk attachment detected"
    elif max_severity == SeverityLevel.MEDIUM:
        action = "WARN USER - Potentially risky attachment"
    else:
        action = "ALLOW - Attachments appear safe"
    
    result = FileForensicsResult(
        total_attachments=len(filenames),
        suspicious_attachments=suspicious,
        max_severity=max_severity,
        overall_risk_score=overall_risk,
        recommended_action=action
    )
    
    logger.info(
        "file_forensics.completed",
        total=len(filenames),
        suspicious_count=len(suspicious),
        max_severity=max_severity.value,
        overall_risk=overall_risk
    )
    
    return result


if __name__ == "__main__":
    # Run MCP server
    mcp.run(transport='sse', port=8003)
