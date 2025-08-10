from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import scripts, runs, health
from app.models.database import create_tables
from app.services.run_queue import run_queue
import os

app = FastAPI(title="Overwatch CICD", version="1.0.0")

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(scripts.router, prefix="/scripts", tags=["scripts"])
app.include_router(runs.router, prefix="/runs", tags=["runs"])

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    create_tables()
    run_queue.start()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    run_queue.stop()