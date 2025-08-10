#!/usr/bin/env bash
set -euo pipefail
python3 --version
node --version

# Install deps
if [ -f "backend/requirements.txt" ]; then
    pip3 install -r backend/requirements.txt
else
    echo "Warning: backend/requirements.txt not found, skipping Python dependencies"
fi

if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    pushd frontend
    npm ci
    popd
else
    echo "Warning: frontend directory or package.json not found, skipping Node dependencies"
fi

# Create DB if needed
set +e
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE overwatch;"
set -e

echo "Devcontainer setup complete. Use Tasks: Start Backend and Start Frontend."