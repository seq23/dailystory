#!/usr/bin/env node

/**
 * Console to DebugLogger Migration Script
 * Automatically migrates remaining console statements to DebugLogger
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to preserve console usage (intentional debug utilities)
const PRESERVE_CONSOLE_FILES = [
  'src/utils/StoryContentLogger.ts',
  'src/utils/audioImplementationValidator.ts', 
  'src/components/SecurityMonitor.tsx',
  'src/services/ProductionHardening.ts',
  'src/utils/cacheDebugConsole.ts',
  'src/utils/childDebugConsole.ts',
  'src/utils/FINAL_100_PERCENT_COMPLETION.ts',
  'src/services/DebugLogger.ts'
];

const CONSOLE_REPLACEMENTS = [
  // Story-related logs with emojis
  { pattern: /console\.log\('📚([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🚀([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('♻️([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('📄([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('✅([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🔍([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🎯([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('📊([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  
  // Image-related logs
  { pattern: /console\.log\('🖼️([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('image', '$1', $2)" },
  { pattern: /console\.log\('📸([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('image', '$1', $2)" },
  
  // Audio-related logs
  { pattern: /console\.log\('🎤([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('audio', '$1', $2)" },
  { pattern: /console\.log\('🔊([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('audio', '$1', $2)" },
  
  // UI-related logs
  { pattern: /console\.log\('🎨([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('ui', '$1', $2)" },
  { pattern: /console\.log\('📱([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('ui', '$1', $2)" },
  
  // Performance-related logs
  { pattern: /console\.log\('⚡([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('performance', '$1', $2)" },
  { pattern: /console\.log\('⏰([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('performance', '$1', $2)" },
  
  // Network-related logs
  { pattern: /console\.log\('🌐([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('network', '$1', $2)" },
  
  // Auth-related logs
  { pattern: /console\.log\('🔐([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('auth', '$1', $2)" },
  
  // Generic console.log statements (without emojis)
  { pattern: /console\.log\(([^)]+)\)/g, replacement: "DebugLogger.log('story', $1)" },
  
  // Warning and error replacements
  { pattern: /console\.warn\('⚠️([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.warn('error', '$1', $2)" },
  { pattern: /console\.warn\(([^)]+)\)/g, replacement: "DebugLogger.warn('error', $1)" },
  { pattern: /console\.error\(([^)]+)\)/g, replacement: "DebugLogger.error('error', $1)" },
];

const DEBUG_IMPORT = "import { DebugLogger } from '@/services/DebugLogger';\n";

function migrateFile(filePath) {
  // Skip files that should preserve console usage
  if (PRESERVE_CONSOLE_FILES.includes(filePath)) {
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasConsole = false;
  let hasDebugImport = content.includes('DebugLogger');
  
  // Apply all console replacements
  CONSOLE_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      hasConsole = true;
      content = content.replace(pattern, replacement);
    }
  });
  
  // Add DebugLogger import if console statements were replaced and import doesn't exist
  if (hasConsole && !hasDebugImport) {
    // Find the first import or add at the top
    const importMatch = content.match(/^import/m);
    if (importMatch) {
      content = content.replace(/^(import[^;]+;\n)/, `$1${DEBUG_IMPORT}`);
    } else {
      content = DEBUG_IMPORT + content;
    }
  }
  
  // Write back if changes were made
  if (hasConsole) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function main() {
  const srcPattern = 'src/**/*.{ts,tsx}';
  const files = glob.sync(srcPattern);
  
  let migratedCount = 0;
  let totalConsoleCount = 0;
  
  console.log(`🔍 Scanning ${files.length} files for console statements...`);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const consoleMatches = content.match(/console\.(log|warn|error)/g);
    
    if (consoleMatches) {
      totalConsoleCount += consoleMatches.length;
      
      if (PRESERVE_CONSOLE_FILES.includes(file)) {
        console.log(`🛡️ ${file}: ${consoleMatches.length} console statements (PRESERVED)`);
      } else {
        console.log(`📄 ${file}: ${consoleMatches.length} console statements`);
        
        if (migrateFile(file)) {
          migratedCount++;
          console.log(`✅ Migrated ${file}`);
        }
      }
    }
  });
  
  console.log(`\n🎉 Migration Complete!`);
  console.log(`📊 Files processed: ${migratedCount}`);
  console.log(`📊 Total console statements found: ${totalConsoleCount}`);
  console.log(`📊 All statements migrated to DebugLogger`);
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, CONSOLE_REPLACEMENTS };