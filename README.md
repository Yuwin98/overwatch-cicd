# Overwatch CICD Platform

A modular CI/CD platform built with FastAPI (backend), React + TypeScript (frontend), and PostgreSQL (database).

## Features

- **Backend**: FastAPI with PostgreSQL database
- **Frontend**: React + Vite + TypeScript
- **Script Management**: Store bash scripts with YAML metadata headers
- **Run Orchestration**: Queue and execute scripts locally with environment isolation
- **Multi-cloud Support**: Example deployment scripts for AWS, GCP, and Linode
- **Containerized Development**: Full Docker Compose setup

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Running with Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/Yuwin98/overwatch-cicd.git
cd overwatch-cicd
```

2. Start all services:
```bash
docker compose up --build
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up PostgreSQL database and environment variables:
```bash
export DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/overwatch"
export DATA_DIR="backend/data"
export CORS_ORIGINS="http://localhost:5173"
```

5. Run the backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables:
```bash
export VITE_API_BASE="http://localhost:8000"
```

4. Run the frontend:
```bash
npm run dev
```

## Script Metadata Format

Scripts use YAML metadata in commented headers:

```bash
# ---
# name: script-name
# description: Script description
# inputs:
#   param1: Description of parameter 1
#   param2: Description of parameter 2
# ---

#!/bin/bash
echo "Hello, ${param1:-World}!"
```

### Supported Metadata Fields

- `name`: Unique script identifier
- `description`: Human-readable description
- `inputs`: Map of input parameters with descriptions

## API Endpoints

### Health
- `GET /health` - Health check

### Scripts
- `POST /scripts` - Create a new script
- `GET /scripts` - List all scripts
- `GET /scripts/{id}` - Get script details
- `DELETE /scripts/{id}` - Delete script

### Runs
- `POST /runs/script/{script_id}` - Queue a script run
- `GET /runs` - List all runs
- `GET /runs/{id}` - Get run details
- `GET /runs/{id}/logs` - Get run logs

## Architecture

### Backend Structure
```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── models/       # SQLAlchemy models
│   ├── schemas.py    # Pydantic schemas
│   ├── services/     # Business logic
│   └── main.py       # FastAPI application
├── data/             # Runtime data (scripts, logs)
├── requirements.txt
└── Dockerfile
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API client
│   ├── types/        # TypeScript types
│   └── main.tsx      # Application entry point
├── package.json
└── Dockerfile
```

## Development

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `DATA_DIR`: Directory for storing scripts and logs
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

#### Frontend
- `VITE_API_BASE`: Backend API base URL

### Safety Features

- **Process Isolation**: Scripts run with `setsid` for process group isolation
- **Environment Whitelisting**: Only allowed environment variables are passed to scripts
- **File System Isolation**: Scripts and logs are stored in designated directories
- **Input Validation**: All API inputs are validated using Pydantic schemas

## Roadmap

- [ ] User authentication and authorization
- [ ] Advanced script scheduling (cron-like)
- [ ] Distributed execution with worker nodes
- [ ] Integration with external CI/CD providers
- [ ] Enhanced monitoring and alerting
- [ ] Audit logging and compliance features
- [ ] Template system for common deployment patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License