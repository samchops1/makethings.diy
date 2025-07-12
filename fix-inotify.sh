#!/bin/bash
# fix-inotify.sh: Fix ENOSPC (inotify watcher) error for Linux systems

set -e

if [ "$(id -u)" -ne 0 ]; then
  echo "[ERROR] This script must be run as root (use sudo)."
  exit 1
fi

CONF_FILE="/etc/sysctl.conf"
KEY="fs.inotify.max_user_watches"
VALUE="524288"

if grep -q "^$KEY" "$CONF_FILE"; then
  # Update existing value
  sed -i "s/^$KEY=.*/$KEY=$VALUE/" "$CONF_FILE"
else
  # Add new value
  echo "$KEY=$VALUE" >> "$CONF_FILE"
fi

sysctl -p > /dev/null

if sysctl $KEY | grep -q "$VALUE"; then
  echo "[SUCCESS] $KEY set to $VALUE. You should now be able to use more file watchers."
else
  echo "[WARNING] Failed to set $KEY. Please check your permissions."
fi 