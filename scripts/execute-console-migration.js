#!/usr/bin/env node

// Phase 4: Execute Console Statement Migration
const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Files that should NEVER be modified (preserve intentional debug utilities)
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

// Console replacement patterns for remaining console statements
const CONSOLE_REPLACEMENTS = [
  // Standard console.log patterns
  { pattern: /console\.log\('🔐 \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('auth', $2)" },
  { pattern: /console\.log\('📚 \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('story', $2)" },
  { pattern: /console\.log\('🔊 \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('audio', $2)" },
  { pattern: /console\.log\('🖼️ \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('image', $2)" },
  { pattern: /console\.log\('⚡ \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('performance', $2)" },
  { pattern: /console\.log\('🌐 \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('network', $2)" },
  { pattern: /console\.log\('🎨 \[([^\]]+)\]', (.+)\)/g, replacement: "DebugLogger.log('ui', $2)" },
  
  // Generic console.log without emoji
  { pattern: /console\.log\(([^)]+)\)/g, replacement: "DebugLogger.log('ui', $1)" },
  { pattern: /console\.warn\(([^)]+)\)/g, replacement: "DebugLogger.warn('ui', $1)" },
  { pattern: /console\.error\(([^)]+)\)/g, replacement: "DebugLogger.error('ui', $1)" }
];

function migrateConsoleStatements(filePath) {
  if (PRESERVE_CONSOLE_FILES.includes(filePath)) {
    console.log(`⏭️  Skipping preserved debug file: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let needsDebugLogger = false;
  
  // Apply console replacements
  CONSOLE_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      needsDebugLogger = true;
    }
  });
  
  // Add DebugLogger import if needed
  if (needsDebugLogger && !content.includes("import { DebugLogger }")) {
    const importMatch = content.match(/^(import[^;]+;?\n)*/m);
    if (importMatch) {
      const importSection = importMatch[0];
      const restOfFile = content.slice(importSection.length);
      content = `${importSection}import { DebugLogger } from '@/services/DebugLogger';\n${restOfFile}`;
    } else {
      content = `import { DebugLogger } from '@/services/DebugLogger';\n\n${content}`;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function executeConsoleCleanup() {
  console.log('🧹 Phase 4: Executing Console Statement Migration');
  
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'src/**/*.test.{ts,tsx}' });
  let totalFiles = 0;
  let migratedFiles = 0;
  let totalStatements = 0;
  
  files.forEach(file => {
    totalFiles++;
    const content = fs.readFileSync(file, 'utf8');
    const consoleCount = (content.match(/console\.(log|warn|error)/g) || []).length;
    
    if (consoleCount > 0 && !PRESERVE_CONSOLE_FILES.includes(file)) {
      totalStatements += consoleCount;
      if (migrateConsoleStatements(file)) {
        migratedFiles++;
        console.log(`✅ Migrated ${file} (${consoleCount} statements)`);
      }
    }
  });
  
  console.log(`\n📊 Console Migration Summary:`);
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files migrated: ${migratedFiles}`);
  console.log(`   Console statements migrated: ${totalStatements}`);
  console.log(`   Preserved debug files: ${PRESERVE_CONSOLE_FILES.length}`);
}

if (require.main === module) {
  executeConsoleCleanup();
}

module.exports = { executeConsoleCleanup, PRESERVE_CONSOLE_FILES };