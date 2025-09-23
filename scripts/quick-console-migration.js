#!/usr/bin/env node

// Console Cleanup Migration Script
// Fixes imports and replaces logging calls with DebugLogger

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CONSOLE_MIGRATIONS = [
  // Fix duplicate imports
  {
    pattern: /import\s*{\s*DebugLogger\s*}\s*from\s*['"]{1}[^'"]*DebugLogger['"]{1};\s*\nimport\s*{\s*DebugLogger\s*}\s*from\s*['"]{1}[^'"]*DebugLogger['"]{1};/g,
    replacement: "import { DebugLogger } from '@/services/DebugLogger';"
  },
  
  // Replace ProductionLogger imports
  {
    pattern: /import\s*{\s*ProductionLogging\s*}\s*from\s*['"]{1}[^'"]*ProductionLogger['"]{1};/g,
    replacement: "import { DebugLogger } from '@/services/DebugLogger';"
  },
  
  // Replace LoggerService imports
  {
    pattern: /import\s*{\s*LoggerService\s*}\s*from\s*['"]{1}[^'"]*LoggerService['"]{1};/g,
    replacement: "import { DebugLogger } from '@/services/DebugLogger';"
  },
  
  // Replace logger import
  {
    pattern: /import\s*{\s*logger\s*}\s*from\s*['"]{1}[^'"]*LoggerService['"]{1};/g,
    replacement: "import { DebugLogger } from '@/services/DebugLogger';"
  },
  
  // Replace ProductionLogging calls
  {
    pattern: /ProductionLogging\.(error|warn|info|debug)\s*\(\s*['"][^'"]*['"],\s*([^,]+),\s*[^)]*\)/g,
    replacement: "DebugLogger.log('ui', $2)"
  },
  
  // Replace LoggerService calls
  {
    pattern: /LoggerService\.(error|warn|info|debug)\s*\(([^)]+)\)/g,
    replacement: "DebugLogger.log('ui', $2)"
  },
  
  // Replace logger calls
  {
    pattern: /logger\.(error|warn|info|debug)\s*\(([^)]+)\)/g,
    replacement: "DebugLogger.log('network', $2)"
  }
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const migration of CONSOLE_MIGRATIONS) {
      const before = content;
      content = content.replace(migration.pattern, migration.replacement);
      if (content !== before) {
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting console cleanup migration...\n');
  
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['src/services/DebugLogger.ts']
  });
  
  let migratedCount = 0;
  
  for (const file of files) {
    if (migrateFile(file)) {
      migratedCount++;
    }
  }
  
  console.log(`\n🎉 Migration complete!`);
  console.log(`📊 Files migrated: ${migratedCount}/${files.length}`);
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, CONSOLE_MIGRATIONS };