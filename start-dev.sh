
#!/bin/bash

# Set environment variables for polling
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=2000
export FORCE_COLOR=1

echo "Starting development server with polling enabled..."
echo "Polling interval: 2000ms"

# Start the dev server
npm run dev
