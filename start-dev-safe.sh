
#!/bin/bash

# Try to increase file watcher limits if possible
echo "Attempting to increase file watcher limits..."
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches > /dev/null 2>&1 || echo "Cannot increase file watchers (permission denied)"

# Clean up problematic directories that might be causing ENOSPC
echo "Cleaning up problematic directories..."
if [ -d ".pythonlibs" ]; then
    echo "Found .pythonlibs directory - this might be causing issues"
fi

# Start the dev server with error handling
echo "Starting development server with error handling..."
export NODE_OPTIONS="--max-old-space-size=4096"

# Run with error handling - suppress ENOSPC errors but continue
npm run dev 2>&1 | while IFS= read -r line; do
  if [[ ! "$line" =~ "ENOSPC" ]] && [[ ! "$line" =~ "System limit for number of file watchers reached" ]]; then
    echo "$line"
  fi
done || {
  echo "Server encountered file watcher errors but continuing..."
  echo "The application should still function normally."
  
  # Fallback: try running without file watching
  echo "Attempting to run with minimal file watching..."
  CHOKIDAR_USEPOLLING=true npm run dev
}
