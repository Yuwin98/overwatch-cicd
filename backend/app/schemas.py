from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELED = "canceled"

# Script schemas
class ScriptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    content: str

class ScriptResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    path: str
    checksum: str
    script_metadata: Optional[Dict[str, Any]]  # Changed from metadata
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Run schemas
class RunCreate(BaseModel):
    params: Optional[Dict[str, str]] = None

class RunResponse(BaseModel):
    id: int
    target_type: str
    target_id: int
    params: Optional[Dict[str, str]]
    status: RunStatus
    log_path: Optional[str]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Health schema
class HealthResponse(BaseModel):
    status: str