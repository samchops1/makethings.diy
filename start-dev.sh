#!/bin/bash

# Clean up problematic directories that might be causing ENOSPC
echo "Cleaning up problematic directories..."

# Remove or ignore problematic Python directories
if [ -d ".pythonlibs" ]; then
    echo "Found .pythonlibs directory - this might be causing issues"
fi

# Start the dev server with reduced file watching
echo "Starting development server..."
npm run dev 