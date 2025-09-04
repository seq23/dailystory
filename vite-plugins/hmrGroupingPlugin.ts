import type { Plugin } from 'vite';

export interface HmrGroupingOptions {
  enabled?: boolean;
  debounceMs?: number;
  showDetails?: boolean;
}

export function hmrGroupingPlugin(options: HmrGroupingOptions = {}): Plugin {
  const {
    enabled = true,
    debounceMs = 200,
    showDetails = false
  } = options;

  if (!enabled) {
    return { name: 'hmr-grouping-disabled' };
  }

  let updateQueue: string[] = [];
  let debounceTimeout: NodeJS.Timeout | null = null;

  return {
    name: 'hmr-grouping',
    configResolved(config) {
      // Only run in development
      if (config.command !== 'serve') return;
      
      // Store original logger
      const originalLogger = config.logger;
      
      // Create a proxy logger that intercepts messages
      const proxyLogger = {
        ...originalLogger,
        info: (msg: string, options?: any) => {
          // Intercept HMR update messages
          if (msg.includes('hmr update')) {
            const filePath = extractFilePath(msg);
            if (filePath) {
              queueUpdate(filePath, originalLogger);
              return;
            }
          }
          
          // Pass through other messages
          originalLogger.info(msg, options);
        }
      };
      
      // Replace the logger (cast to avoid readonly error)
      (config as any).logger = proxyLogger;
    },
    
    handleHotUpdate(ctx) {
      // Additional HMR handling if needed
      return;
    }
  };

  function extractFilePath(message: string): string | null {
    const match = message.match(/\/src\/[^\s]+/);
    return match ? match[0] : null;
  }

  function queueUpdate(filePath: string, logger: any) {
    updateQueue.push(filePath);
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    debounceTimeout = setTimeout(() => {
      flushUpdates(logger);
    }, debounceMs);
  }

  function flushUpdates(logger: any) {
    if (updateQueue.length === 0) return;
    
    const uniqueFiles = [...new Set(updateQueue)];
    const totalUpdates = updateQueue.length;
    
    if (uniqueFiles.length === 1) {
      const fileName = getDisplayName(uniqueFiles[0]);
      if (totalUpdates === 1) {
        logger.info(`🔥 Hot updated: ${fileName}`, { timestamp: true });
      } else {
        logger.info(`🔥 Hot updated: ${fileName} (×${totalUpdates})`, { timestamp: true });
      }
    } else {
      logger.info(`🔥 Hot updated ${uniqueFiles.length} files (${totalUpdates} changes)`, { timestamp: true });
      
      if (showDetails) {
        uniqueFiles.forEach(file => {
          const count = updateQueue.filter(f => f === file).length;
          const fileName = getDisplayName(file);
          logger.info(`  └─ ${fileName}${count > 1 ? ` (×${count})` : ''}`, { timestamp: false });
        });
      }
    }
    
    updateQueue = [];
    debounceTimeout = null;
  }

  function getDisplayName(path: string): string {
    const segments = path.split('/');
    if (segments.length > 3) {
      return `.../${segments.slice(-2).join('/')}`;
    }
    return path.replace('/src/', '');
  }
}