# Overwatch CI/CD Platform

This repository contains the implementation of the Overwatch CI/CD platform using Python FastAPI for the backend and React TypeScript for the frontend.

## Features
- Backend: FastAPI, PostgreSQL, Redis, Celery
- Frontend: React, TypeScript
- Multi-cloud deployment support (AWS, GCP, Linode)

## Web preview in GitHub Codespaces

Get a 1-click development environment with live preview URLs:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Yuwin98/overwatch-cicd?quickstart=1)

1. Click the badge above to create a new Codespace
2. After the container builds, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run the tasks:
   - **Tasks: Run Task** → **Start Backend** (starts FastAPI on port 8000)
   - **Tasks: Run Task** → **Start Frontend** (starts Vite dev server on port 5173)
4. Codespaces will automatically forward ports 8000 and 5173 as public URLs
5. The backend connects to a PostgreSQL database automatically configured in the container

## Installation
1. Clone the repository
2. Run the setup scripts in the `deployment/scripts` directory.

## Usage
- Start the development environment using `scripts/start-dev.sh`
- Build Docker images with `deployment/scripts/build-images.sh`

## Deployment
- Deploy to Kubernetes using `deployment/scripts/k8s-deploy.sh`

## License
MIT License