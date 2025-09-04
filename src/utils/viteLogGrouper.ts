// Development-only console wrapper for grouping Vite HMR logs
let hmrUpdateQueue: string[] = [];
let hmrTimeout: NodeJS.Timeout | null = null;
let originalConsoleLog: typeof console.log;

export const initializeViteLogGrouper = () => {
  if (import.meta.env.PROD || typeof window === 'undefined') return;
  
  // Store original console.log
  originalConsoleLog = console.log;
  
  // Override console.log to intercept Vite HMR messages
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this is a Vite HMR update message
    if (message.includes('[vite] hot updated:')) {
      const filePath = message.replace('[vite] hot updated: ', '');
      hmrUpdateQueue.push(filePath);
      
      // Clear existing timeout
      if (hmrTimeout) {
        clearTimeout(hmrTimeout);
      }
      
      // Set new timeout to batch updates
      hmrTimeout = setTimeout(() => {
        flushHmrUpdates();
      }, 200); // 200ms debounce
      
      return; // Don't log individual updates
    }
    
    // For non-HMR messages, use original console.log
    originalConsoleLog.apply(console, args);
  };
};

const flushHmrUpdates = () => {
  if (hmrUpdateQueue.length === 0) return;
  
  const uniqueFiles = [...new Set(hmrUpdateQueue)];
  const fileCount = hmrUpdateQueue.length;
  const uniqueCount = uniqueFiles.length;
  
  if (uniqueCount === 1) {
    const fileName = getFileName(uniqueFiles[0]);
    if (fileCount === 1) {
      originalConsoleLog(`🔥 Hot updated: ${fileName}`);
    } else {
      originalConsoleLog(`🔥 Hot updated: ${fileName} (×${fileCount})`);
    }
  } else {
    console.group(`🔥 Hot updated ${uniqueCount} files (${fileCount} changes)`);
    uniqueFiles.forEach(file => {
      const count = hmrUpdateQueue.filter(f => f === file).length;
      const fileName = getFileName(file);
      if (count === 1) {
        originalConsoleLog(`  ${fileName}`);
      } else {
        originalConsoleLog(`  ${fileName} (×${count})`);
      }
    });
    console.groupEnd();
  }
  
  // Clear the queue
  hmrUpdateQueue = [];
  hmrTimeout = null;
};

const getFileName = (path: string): string => {
  // Extract just the filename and parent directory for cleaner display
  const segments = path.split('/');
  if (segments.length > 2) {
    return `.../${segments[segments.length - 2]}/${segments[segments.length - 1]}`;
  }
  return segments.join('/');
};

export const cleanupViteLogGrouper = () => {
  if (originalConsoleLog) {
    console.log = originalConsoleLog;
  }
  
  if (hmrTimeout) {
    clearTimeout(hmrTimeout);
    flushHmrUpdates();
  }
};