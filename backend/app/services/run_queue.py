import os
import threading
import subprocess
import time
from datetime import datetime
from queue import Queue
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.models.database import SessionLocal, Run, RunStatus
import logging

logger = logging.getLogger(__name__)

class RunQueue:
    def __init__(self):
        self.queue = Queue()
        self.worker_thread = None
        self.running = False
    
    def start(self):
        """Start the background worker thread"""
        if not self.running:
            self.running = True
            self.worker_thread = threading.Thread(target=self._worker, daemon=True)
            self.worker_thread.start()
            logger.info("Run queue worker started")
    
    def stop(self):
        """Stop the background worker thread"""
        self.running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=5)
    
    def enqueue(self, run_id: int):
        """Add a run to the queue"""
        self.queue.put(run_id)
        logger.info(f"Enqueued run {run_id}")
    
    def _worker(self):
        """Background worker that processes queued runs"""
        while self.running:
            try:
                run_id = self.queue.get(timeout=1)
                self._execute_run(run_id)
                self.queue.task_done()
            except:
                continue
    
    def _execute_run(self, run_id: int):
        """Execute a single run"""
        db = SessionLocal()
        try:
            run = db.query(Run).filter(Run.id == run_id).first()
            if not run:
                logger.error(f"Run {run_id} not found")
                return
            
            # Update status to running
            run.status = RunStatus.RUNNING
            run.started_at = datetime.utcnow()
            db.commit()
            
            # Get script from database
            from app.models.database import Script
            script = db.query(Script).filter(Script.id == run.target_id).first()
            if not script:
                run.status = RunStatus.FAILED
                run.finished_at = datetime.utcnow()
                db.commit()
                logger.error(f"Script {run.target_id} not found for run {run_id}")
                return
            
            # Prepare log file
            data_dir = os.getenv("DATA_DIR", "backend/data")
            log_dir = os.path.join(data_dir, "runs", str(run_id))
            os.makedirs(log_dir, exist_ok=True)
            log_path = os.path.join(log_dir, "logs.txt")
            run.log_path = log_path
            db.commit()
            
            # Prepare environment variables
            env = os.environ.copy()
            if run.params:
                # Whitelist approach - only allow specific env vars
                allowed_vars = ['message', 'target', 'environment', 'region']
                for key, value in run.params.items():
                    if key in allowed_vars and isinstance(value, str):
                        env[key] = value
            
            # Execute script
            try:
                with open(log_path, 'w') as log_file:
                    process = subprocess.Popen(
                        [script.path],
                        stdout=log_file,
                        stderr=subprocess.STDOUT,
                        env=env,
                        text=True,
                        preexec_fn=os.setsid if hasattr(os, 'setsid') else None
                    )
                    
                    process.wait()
                    
                    if process.returncode == 0:
                        run.status = RunStatus.SUCCESS
                    else:
                        run.status = RunStatus.FAILED
                        
            except Exception as e:
                run.status = RunStatus.FAILED
                with open(log_path, 'a') as log_file:
                    log_file.write(f"\nExecution error: {str(e)}")
                logger.error(f"Error executing run {run_id}: {e}")
            
            run.finished_at = datetime.utcnow()
            db.commit()
            logger.info(f"Run {run_id} completed with status {run.status}")
            
        except Exception as e:
            logger.error(f"Error processing run {run_id}: {e}")
            try:
                run.status = RunStatus.FAILED
                run.finished_at = datetime.utcnow()
                db.commit()
            except:
                pass
        finally:
            db.close()

# Global run queue instance
run_queue = RunQueue()