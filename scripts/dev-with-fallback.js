
const { spawn } = require('child_process');
const process = require('process');

console.log('🚀 Starting robust development server...');

// Function to start the dev server with error handling
function startDevServer(attempt = 1) {
  console.log(`📡 Starting dev server (attempt ${attempt})...`);
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      CHOKIDAR_USEPOLLING: 'false', // Start with native watching
      CHOKIDAR_INTERVAL: '3000'
    }
  });

  let hasStarted = false;
  let restartTimeout;

  child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    // Check if server has started successfully
    if (output.includes('Local:') || output.includes('localhost:5173')) {
      hasStarted = true;
      console.log('✅ Development server started successfully!');
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    
    // Filter out ENOSPC errors but log other errors
    if (!output.includes('ENOSPC') && !output.includes('System limit for number of file watchers reached')) {
      process.stderr.write(output);
    } else if (output.includes('ENOSPC')) {
      console.log('⚠️  File watcher limit reached, but server should continue running...');
      if (!hasStarted && attempt < 3) {
        console.log('🔄 Restarting with polling fallback...');
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(() => {
          child.kill();
          startDevServerWithPolling(attempt + 1);
        }, 2000);
      }
    }
  });

  child.on('exit', (code) => {
    if (code !== 0 && !hasStarted && attempt < 3) {
      console.log(`❌ Server exited with code ${code}, retrying...`);
      setTimeout(() => startDevServer(attempt + 1), 2000);
    } else if (code !== 0) {
      console.log(`💥 Server failed to start after ${attempt} attempts`);
      process.exit(code);
    }
  });

  return child;
}

// Fallback function with polling
function startDevServerWithPolling(attempt) {
  console.log('📊 Falling back to polling mode for file watching...');
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      CHOKIDAR_USEPOLLING: 'true',
      CHOKIDAR_INTERVAL: '5000'
    }
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log('💥 Server failed even with polling fallback');
      process.exit(code);
    }
  });

  return child;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  process.exit(0);
});

// Start the server
startDevServer();
