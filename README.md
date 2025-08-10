# Overwatch CI/CD Platform

This repository contains the implementation of the Overwatch CI/CD platform using Python FastAPI for the backend and React TypeScript for the frontend.

## Features
- Backend: FastAPI, PostgreSQL, Redis, Celery
- Frontend: React, TypeScript
- Multi-cloud deployment support (AWS, GCP, Linode)

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