"""
FastAPI Gateway for Email Threat Triage Platform
Orchestrates MCP servers and Pydantic AI Agent

This is the production API that the React frontend communicates with.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from datetime import datetime
import logging
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Import modular components
from backend.models.schemas import (
    EmailAnalysisRequest, 
    SecurityVerdict, 
    ToolExecutionTrace, 
    AggregatedScores, 
    ThreatClassification, 
    EmailMessage
)
from backend.engine.domain import analyze_domain
from backend.engine.url import scan_urls
from backend.engine.forensics import analyze_attachments
from backend.engine.social import detect_social_engineering
from backend.db.database import db

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("email_threat_triage")

# Lifecycle Events (Startup/Shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB
    await db.connect()
    yield
    # Shutdown: Close DB
    await db.close()

# Import Auth and Ingest Routers
from backend.auth.routes import router as auth_router
from backend.ingest.routes import router as ingest_router

# Initialize FastAPI app
app = FastAPI(
    title="Email Threat Triage API",
    description="Autonomous security analysis powered by Archestra AI",
    version="1.0.0",
    lifespan=lifespan
)


# ============================================================================
# HEALTH CHECK
# ============================================================================
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Include Routers
app.include_router(auth_router)
app.include_router(ingest_router)

# Configure CORS
# Allow origins from environment variable (comma-separated) or default to localhost
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
if allowed_origins_env:
    origins.extend([origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()])

# If "*" is in the list or env var, allow all (useful for avoiding CORS issues initially)
if "*" in origins or allowed_origins_env == "*":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from backend.engine.orchestrator import analyze_email_content

# ============================================================================
# MAIN ANALYSIS ENDPOINT
# ============================================================================

@app.post("/api/analyze", response_model=SecurityVerdict)
async def analyze_email_endpoint(request: EmailAnalysisRequest) -> SecurityVerdict:
    """
    Main email analysis endpoint
    Orchestrates all MCP tools in parallel and returns structured verdict
    """
    try:
        return await analyze_email_content(request)
    except Exception as e:
        logger.error(f"analysis.failed: error={str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)
