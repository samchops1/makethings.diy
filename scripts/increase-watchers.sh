
#!/bin/bash

# Increase the inotify watcher limit to handle large projects
echo "Increasing file watcher limit..."
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf > /dev/null 2>&1
sudo sysctl -p > /dev/null 2>&1 || echo "Could not apply sysctl changes, trying temporary fix..."

# Apply temporary fix if the above fails
sudo sysctl -w fs.inotify.max_user_watches=524288 > /dev/null 2>&1 || echo "Could not set watcher limit"

echo "Current watcher limit: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo "Starting development server..."
