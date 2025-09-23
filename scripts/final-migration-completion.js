#!/usr/bin/env node

/**
 * FINAL MIGRATION COMPLETION SCRIPT
 * Completes all remaining ProductionLogging calls to DebugLogger
 */

const fs = require('fs');
const glob = require('glob');

const PRODUCTION_LOGGING_REPLACEMENTS = [
  // Audio coordinator
  { pattern: /ProductionLogging\.info\('([^']*)', 'simpleAudioCoordinator'\)/g, replacement: "DebugLogger.log('audio', '$1')" },
  { pattern: /ProductionLogging\.warn\('([^']*)', 'simpleAudioCoordinator', ([^)]+)\)/g, replacement: "DebugLogger.warn('audio', '$1', $2)" },
  
  // Story generation
  { pattern: /ProductionLogging\.(info|debug|warn|error)\('([^']*)', '([^']*)', 'storyGenerationService'(?:, ([^)]+))?\)/g, 
    replacement: (match, level, category, message, data) => {
      const debugLevel = level === 'info' || level === 'debug' ? 'log' : level;
      const debugCategory = category === 'STORY' ? 'story' : 
                           category === 'VOCABULARY' ? 'story' : 
                           category === 'GRAMMAR' ? 'story' : 
                           category === 'EDGE_FUNCTION' ? 'network' : 'story';
      return data ? `DebugLogger.${debugLevel}('${debugCategory}', '${message}', ${data})` : 
                   `DebugLogger.${debugLevel}('${debugCategory}', '${message}')`;
    }
  },
  
  // Story session cache
  { pattern: /ProductionLogging\.(info|warn)\('CACHE', '([^']*)', 'storySessionCache'(?:, ([^)]+))?\)/g,
    replacement: (match, level, message, data) => {
      const debugLevel = level === 'info' ? 'log' : 'warn';
      return data ? `DebugLogger.${debugLevel}('story', '${message}', ${data})` : 
                   `DebugLogger.${debugLevel}('story', '${message}')`;
    }
  }
];

function migrateRemainingFiles() {
  const files = ['src/services/simpleAudioCoordinator.ts', 'src/services/storyGenerationService.ts', 'src/services/storySessionCache.ts'];
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Simple replacements for common patterns
    content = content.replace(/ProductionLogging\.info\(/g, 'DebugLogger.log(');
    content = content.replace(/ProductionLogging\.debug\(/g, 'DebugLogger.log(');
    content = content.replace(/ProductionLogging\.warn\(/g, 'DebugLogger.warn(');
    content = content.replace(/ProductionLogging\.error\(/g, 'DebugLogger.error(');
    
    // Remove category and service name parameters (simplified)
    content = content.replace(/, '[^']*'\)/g, ')');
    content = content.replace(/, '[^']*', ([^)]+)\)/g, ', $1)');
    
    if (content !== fs.readFileSync(file, 'utf8')) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Completed migration: ${file}`);
    }
  });
}

if (require.main === module) {
  migrateRemainingFiles();
  console.log('🎉 Final ProductionLogging migration complete!');
}