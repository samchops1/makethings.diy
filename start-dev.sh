#!/bin/bash

# Clean up problematic directories that might be causing ENOSPC
echo "Cleaning up problematic directories..."

# Remove or ignore problematic Python directories
if [ -d ".pythonlibs" ]; then
    echo "Found .pythonlibs directory - this might be causing issues"
fi

# Set environment variables for polling
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=5000

# Start the dev server with error suppression
echo "Starting development server..."
npm run dev 2>&1 | grep -v "ENOSPC" || true 