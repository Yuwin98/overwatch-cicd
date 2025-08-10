import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.models.database import get_db, Run, Script
from app.schemas import RunCreate, RunResponse
from app.services.run_queue import run_queue

router = APIRouter()

@router.post("/script/{script_id}", response_model=RunResponse)
async def create_run(script_id: int, run_data: RunCreate, db: Session = Depends(get_db)):
    """Queue a run for a script"""
    
    # Check if script exists
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    # Create run record
    db_run = Run(
        target_type="script",
        target_id=script_id,
        params=run_data.params
    )
    
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    
    # Enqueue the run
    run_queue.enqueue(db_run.id)
    
    return db_run

@router.get("/", response_model=List[RunResponse])
async def list_runs(db: Session = Depends(get_db)):
    """List all runs"""
    runs = db.query(Run).order_by(Run.created_at.desc()).all()
    return runs

@router.get("/{run_id}", response_model=RunResponse)
async def get_run(run_id: int, db: Session = Depends(get_db)):
    """Get a specific run"""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/{run_id}/logs", response_class=PlainTextResponse)
async def get_run_logs(run_id: int, db: Session = Depends(get_db)):
    """Get logs for a specific run"""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    if not run.log_path or not os.path.exists(run.log_path):
        return "No logs available yet."
    
    try:
        with open(run.log_path, 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error reading logs: {str(e)}"