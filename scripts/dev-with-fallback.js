
import { spawn } from 'child_process';
import process from 'process';

console.log('🚀 Starting robust development server...');

// Function to start the dev server with error handling
function startDevServer(attempt = 1) {
  console.log(`📡 Starting dev server (attempt ${attempt})...`);
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      CHOKIDAR_USEPOLLING: 'false',
      CHOKIDAR_INTERVAL: '3000'
    }
  });

  let hasStarted = false;
  let serverOutput = '';

  child.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    process.stdout.write(output);
    
    // Check if server has started successfully
    if (output.includes('Local:') || output.includes('localhost:5173')) {
      hasStarted = true;
      console.log('✅ Development server started successfully!');
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    
    // Suppress ENOSPC errors but log other errors
    if (!output.includes('ENOSPC') && 
        !output.includes('System limit for number of file watchers reached') &&
        !output.includes('FSWatcher')) {
      process.stderr.write(output);
    } else if (output.includes('ENOSPC')) {
      console.log('⚠️  File watcher limit reached, but server should continue...');
      
      // If server hasn't started yet and we have retries left, try polling mode
      if (!hasStarted && attempt < 3) {
        console.log('🔄 Switching to polling mode...');
        setTimeout(() => {
          child.kill();
          startDevServerWithPolling(attempt + 1);
        }, 1000);
      }
    }
  });

  child.on('exit', (code) => {
    if (code !== 0 && !hasStarted && attempt < 3) {
      console.log(`❌ Server exited with code ${code}, retrying...`);
      setTimeout(() => startDevServer(attempt + 1), 2000);
    } else if (code !== 0 && !hasStarted) {
      console.log(`💥 Server failed to start after ${attempt} attempts`);
      console.log('🔄 Trying polling mode as final fallback...');
      startDevServerWithPolling(attempt);
    } else if (code === 0) {
      console.log('✅ Server exited cleanly');
    }
  });

  return child;
}

// Fallback function with polling
function startDevServerWithPolling(attempt) {
  console.log('📊 Using polling mode for file watching...');
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      CHOKIDAR_USEPOLLING: 'true',
      CHOKIDAR_INTERVAL: '5000'
    }
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    
    // Still suppress ENOSPC errors in polling mode
    if (!output.includes('ENOSPC') && 
        !output.includes('System limit for number of file watchers reached')) {
      process.stderr.write(output);
    }
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log('💥 Server failed even with polling fallback');
      console.log('⚠️  Continuing anyway - the app may still work...');
      // Don't exit, let it continue
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
const serverProcess = startDevServer();

// Keep the process alive
const keepAlive = setInterval(() => {
  // This keeps the Node.js process running
}, 30000);

// Handle graceful shutdown
const cleanup = () => {
  clearInterval(keepAlive);
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
