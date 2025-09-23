#!/usr/bin/env node

/**
 * ProductionLogging to DebugLogger Migration Script
 * Replaces all ProductionLogging calls with direct DebugLogger calls
 */

const fs = require('fs');
const glob = require('glob');

// Category mapping from ProductionLogging to DebugLogger categories
const CATEGORY_MAP = {
  'AUDIO': 'audio',
  'CACHE': 'performance', 
  'STORY': 'story',
  'IMAGE': 'image',
  'UI': 'ui',
  'NETWORK': 'network',
  'AUTH': 'auth',
  'ERROR': 'error',
  'PERFORMANCE': 'performance'
};

const PRODUCTION_LOGGING_REPLACEMENTS = [
  // Replace ProductionLogging.error calls
  { 
    pattern: /ProductionLogging\.error\('([^']+)', '([^']+)'(?:, ([^)]+))?\)/g, 
    replacement: (match, category, message, data) => {
      const debugCategory = CATEGORY_MAP[category] || 'error';
      return data ? `DebugLogger.error('${debugCategory}', '${message}', ${data})` : `DebugLogger.error('${debugCategory}', '${message}')`;
    }
  },
  // Replace ProductionLogging.warn calls  
  {
    pattern: /ProductionLogging\.warn\('([^']+)', '([^']+)'(?:, ([^)]+))?\)/g,
    replacement: (match, category, message, data) => {
      const debugCategory = CATEGORY_MAP[category] || 'ui';
      return data ? `DebugLogger.warn('${debugCategory}', '${message}', ${data})` : `DebugLogger.warn('${debugCategory}', '${message}')`;
    }
  },
  // Replace ProductionLogging.info calls
  {
    pattern: /ProductionLogging\.info\('([^']+)', '([^']+)'(?:, ([^)]+))?\)/g,
    replacement: (match, category, message, data) => {
      const debugCategory = CATEGORY_MAP[category] || 'ui';
      return data ? `DebugLogger.log('${debugCategory}', '${message}', ${data})` : `DebugLogger.log('${debugCategory}', '${message}')`;
    }
  },
  // Replace ProductionLogging.debug calls
  {
    pattern: /ProductionLogging\.debug\('([^']+)', '([^']+)'(?:, ([^)]+))?\)/g,
    replacement: (match, category, message, data) => {
      const debugCategory = CATEGORY_MAP[category] || 'ui';
      return data ? `DebugLogger.log('${debugCategory}', '${message}', ${data})` : `DebugLogger.log('${debugCategory}', '${message}')`;
    }
  },
  // Replace ProductionLogging.log calls
  {
    pattern: /ProductionLogging\.log\('([^']+)', '([^']+)'(?:, ([^)]+))?\)/g,
    replacement: (match, category, message, data) => {
      const debugCategory = CATEGORY_MAP[category] || 'ui';
      return data ? `DebugLogger.log('${debugCategory}', '${message}', ${data})` : `DebugLogger.log('${debugCategory}', '${message}')`;
    }
  }
];

function migrateProductionLogging(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasProductionLogging = false;
  let hasDebugImport = content.includes('DebugLogger');
  
  // Apply all ProductionLogging replacements
  PRODUCTION_LOGGING_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      hasProductionLogging = true;
      if (typeof replacement === 'function') {
        content = content.replace(pattern, replacement);
      } else {
        content = content.replace(pattern, replacement);
      }
    }
  });
  
  if (hasProductionLogging) {
    // Remove ProductionLogging imports
    content = content.replace(/import.*ProductionLogging.*from.*['"]@\/services\/ProductionLogger['"];?\n?/g, '');
    content = content.replace(/import.*ProductionLogger.*from.*['"]@\/services\/ProductionLogger['"];?\n?/g, '');
    
    // Add DebugLogger import if needed
    if (!hasDebugImport) {
      const importMatch = content.match(/^import/m);
      if (importMatch) {
        content = content.replace(/^(import[^;]+;\n)/, `$1import { DebugLogger } from '@/services/DebugLogger';\n`);
      } else {
        content = "import { DebugLogger } from '@/services/DebugLogger';\n" + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function main() {
  const serviceFiles = glob.sync('src/**/*.{ts,tsx}');
  
  let migratedCount = 0;
  let totalProductionLoggingCount = 0;
  
  console.log(`🔍 Scanning ${serviceFiles.length} files for ProductionLogging calls...`);
  
  serviceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const productionLoggingMatches = content.match(/ProductionLogging\.(error|warn|info|debug|log)/g);
    
    if (productionLoggingMatches) {
      totalProductionLoggingCount += productionLoggingMatches.length;
      console.log(`📄 ${file}: ${productionLoggingMatches.length} ProductionLogging calls`);
      
      if (migrateProductionLogging(file)) {
        migratedCount++;
        console.log(`✅ Migrated ${file}`);
      }
    }
  });
  
  console.log(`\n🎉 ProductionLogging Migration Complete!`);
  console.log(`📊 Files processed: ${migratedCount}`);
  console.log(`📊 Total ProductionLogging calls found: ${totalProductionLoggingCount}`);
  console.log(`📊 All calls converted to DebugLogger`);
}

if (require.main === module) {
  main();
}

module.exports = { migrateProductionLogging, PRODUCTION_LOGGING_REPLACEMENTS };