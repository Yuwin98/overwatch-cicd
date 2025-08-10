import os
import hashlib
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db, Script
from app.schemas import ScriptCreate, ScriptResponse
from app.services.metadata_parser import parse_script_metadata

router = APIRouter()

@router.post("/", response_model=ScriptResponse)
async def create_script(script: ScriptCreate, db: Session = Depends(get_db)):
    """Create a new script"""
    
    # Check if script name already exists
    existing_script = db.query(Script).filter(Script.name == script.name).first()
    if existing_script:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Script with this name already exists"
        )
    
    # Parse metadata from script content
    metadata = parse_script_metadata(script.content)
    
    # Create checksum
    checksum = hashlib.sha256(script.content.encode()).hexdigest()
    
    # Prepare file path
    data_dir = os.getenv("DATA_DIR", "backend/data")
    scripts_dir = os.path.join(data_dir, "scripts")
    os.makedirs(scripts_dir, exist_ok=True)
    
    script_filename = f"{script.name}.sh"
    script_path = os.path.join(scripts_dir, script_filename)
    
    # Save script file
    with open(script_path, 'w') as f:
        f.write(script.content)
    
    # Make script executable
    os.chmod(script_path, 0o755)
    
    # Create database record
    db_script = Script(
        name=script.name,
        description=script.description,
        path=script_path,
        checksum=checksum,
        script_metadata=metadata  # Changed from metadata
    )
    
    db.add(db_script)
    db.commit()
    db.refresh(db_script)
    
    return db_script

@router.get("/", response_model=List[ScriptResponse])
async def list_scripts(db: Session = Depends(get_db)):
    """List all scripts"""
    scripts = db.query(Script).all()
    return scripts

@router.get("/{script_id}", response_model=ScriptResponse)
async def get_script(script_id: int, db: Session = Depends(get_db)):
    """Get a specific script"""
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return script

@router.delete("/{script_id}")
async def delete_script(script_id: int, db: Session = Depends(get_db)):
    """Delete a script"""
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    # Delete file
    try:
        if os.path.exists(script.path):
            os.remove(script.path)
    except OSError:
        pass  # Continue even if file deletion fails
    
    # Delete database record
    db.delete(script)
    db.commit()
    
    return {"message": "Script deleted successfully"}