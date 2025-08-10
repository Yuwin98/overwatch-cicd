from sqlalchemy import create_engine, Column, Integer, String, Text, JSON, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import enum

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://user:password@localhost:5432/overwatch")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class RunStatus(enum.Enum):
    QUEUED = "queued"
    RUNNING = "running" 
    SUCCESS = "success"
    FAILED = "failed"
    CANCELED = "canceled"

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    path = Column(String, nullable=False)
    checksum = Column(String, nullable=False)
    script_metadata = Column(JSON)  # Changed from metadata to script_metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Run(Base):
    __tablename__ = "runs"
    
    id = Column(Integer, primary_key=True, index=True)
    target_type = Column(String, default="script")
    target_id = Column(Integer, nullable=False)
    params = Column(JSON)
    status = Column(Enum(RunStatus), default=RunStatus.QUEUED)
    log_path = Column(String)
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()