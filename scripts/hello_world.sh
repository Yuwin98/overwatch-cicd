# ---
# name: hello-world
# description: A simple hello world script that demonstrates basic functionality
# inputs:
#   message: The message to display (optional, defaults to "World")
#   environment: The environment name (optional)
# ---

#!/bin/bash

echo "=== Hello World Script ==="
echo "Hello, ${message:-World}!"
echo "Environment: ${environment:-development}"
echo "Script executed at: $(date)"
echo "Running on: $(hostname)"
echo "Current directory: $(pwd)"
echo "=== Script completed ==="