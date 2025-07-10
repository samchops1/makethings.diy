
export async function checkWebContainerHealth() {
  try {
    const { webcontainer } = await import('./index');
    const container = await webcontainer;
    
    // Test basic file operations
    await container.fs.writeFile('health-check.txt', 'WebContainer is working');
    const content = await container.fs.readFile('health-check.txt', 'utf-8');
    await container.fs.rm('health-check.txt');
    
    console.log('WebContainer health check passed:', content === 'WebContainer is working');
    return true;
  } catch (error) {
    console.error('WebContainer health check failed:', error);
    return false;
  }
}

export async function initializeWebContainerWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const healthy = await checkWebContainerHealth();
      if (healthy) {
        console.log('WebContainer initialized successfully');
        return true;
      }
    } catch (error) {
      console.error(`WebContainer initialization attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) {
        console.error('WebContainer failed to initialize after all retries');
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return false;
}
