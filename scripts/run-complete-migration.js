#!/usr/bin/env node

/**
 * Complete Console Cleanup Migration
 * Runs both console and ProductionLogging migrations while preserving intentional debug utilities
 */

const fs = require('fs');
const glob = require('glob');

// Files to preserve console statements (intentional debug utilities)
const PRESERVE_CONSOLE_FILES = [
  'src/utils/StoryContentLogger.ts',
  'src/utils/audioImplementationValidator.ts', 
  'src/components/SecurityMonitor.tsx',
  'src/services/ProductionHardening.ts',
  'src/utils/cacheDebugConsole.ts',
  'src/utils/FINAL_100_PERCENT_COMPLETION.ts'
];

// Console replacements (from existing script)
const CONSOLE_REPLACEMENTS = [
  { pattern: /console\.log\('📚([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🚀([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('♻️([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('📄([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('✅([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🔍([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🎯([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('📊([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('story', '$1', $2)" },
  { pattern: /console\.log\('🖼️([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('image', '$1', $2)" },
  { pattern: /console\.log\('📸([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('image', '$1', $2)" },
  { pattern: /console\.log\('🎤([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('audio', '$1', $2)" },
  { pattern: /console\.log\('🔊([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('audio', '$1', $2)" },
  { pattern: /console\.log\('🎨([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('ui', '$1', $2)" },
  { pattern: /console\.log\('📱([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('ui', '$1', $2)" },
  { pattern: /console\.log\('⚡([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('performance', '$1', $2)" },
  { pattern: /console\.log\('⏰([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('performance', '$1', $2)" },
  { pattern: /console\.log\('🌐([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('network', '$1', $2)" },
  { pattern: /console\.log\('🔐([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.log('auth', '$1', $2)" },
  { pattern: /console\.log\(([^)]+)\)/g, replacement: "DebugLogger.log('ui', $1)" },
  { pattern: /console\.warn\('⚠️([^']*)', ?([^)]+)?\)/g, replacement: "DebugLogger.warn('error', '$1', $2)" },
  { pattern: /console\.warn\(([^)]+)\)/g, replacement: "DebugLogger.warn('error', $1)" },
  { pattern: /console\.error\(([^)]+)\)/g, replacement: "DebugLogger.error('error', $1)" },
];

// ProductionLogging replacements
const CATEGORY_MAP = {
  'AUDIO': 'audio',
  'CACHE': 'performance', 
  'STORY': 'story',
  'IMAGE': 'image',
  'UI': 'ui',
  'NETWORK': 'network',
  'AUTH': 'auth',
  'ERROR': 'error',
  'PERFORMANCE': 'performance',
  'PHONETIC': 'audio',
  'AVATAR': 'ui',
  'STORY_CACHE': 'story',
  'CHARACTER': 'story'
};

const PRODUCTION_LOGGING_PATTERNS = [
  /ProductionLogging\.error\('([^']+)', '([^']+)'(?:, '[^']*')?(?:, ([^)]+))?\)/g,
  /ProductionLogging\.warn\('([^']+)', '([^']+)'(?:, '[^']*')?(?:, ([^)]+))?\)/g,
  /ProductionLogging\.info\('([^']+)', '([^']+)'(?:, '[^']*')?(?:, ([^)]+))?\)/g,
  /ProductionLogging\.debug\('([^']+)', '([^']+)'(?:, '[^']*')?(?:, ([^)]+))?\)/g,
  /ProductionLogging\.log\('([^']+)', '([^']+)'(?:, '[^']*')?(?:, ([^)]+))?\)/g
];

function shouldPreserveFile(filePath) {
  return PRESERVE_CONSOLE_FILES.some(preserveFile => filePath.includes(preserveFile));
}

function migrateConsoleStatements(filePath) {
  if (shouldPreserveFile(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasConsole = false;
  let hasDebugImport = content.includes('DebugLogger');
  
  // Apply console replacements
  CONSOLE_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      hasConsole = true;
      content = content.replace(pattern, replacement);
    }
  });
  
  // Add DebugLogger import if needed
  if (hasConsole && !hasDebugImport) {
    const importMatch = content.match(/^import/m);
    if (importMatch) {
      content = content.replace(/^(import[^;]+;\n)/, `$1import { DebugLogger } from '@/services/DebugLogger';\n`);
    } else {
      content = "import { DebugLogger } from '@/services/DebugLogger';\n" + content;
    }
  }
  
  if (hasConsole) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function migrateProductionLogging(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasProductionLogging = false;
  let hasDebugImport = content.includes('DebugLogger');
  
  // Replace ProductionLogging calls with DebugLogger
  PRODUCTION_LOGGING_PATTERNS.forEach(pattern => {
    content = content.replace(pattern, (match, category, message, data) => {
      hasProductionLogging = true;
      const debugCategory = CATEGORY_MAP[category] || 'ui';
      const methodName = match.includes('.error') ? 'error' : match.includes('.warn') ? 'warn' : 'log';
      return data ? `DebugLogger.${methodName}('${debugCategory}', '${message}', ${data})` : `DebugLogger.${methodName}('${debugCategory}', '${message}')`;
    });
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
  const files = glob.sync('src/**/*.{ts,tsx}');
  
  let consoleMigrated = 0;
  let productionLoggingMigrated = 0;
  let totalConsoleFound = 0;
  let totalProductionLoggingFound = 0;
  let preservedFiles = 0;
  
  console.log(`🔍 Scanning ${files.length} files for migration...`);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Count console statements
    const consoleMatches = content.match(/console\.(log|warn|error)/g);
    if (consoleMatches) {
      totalConsoleFound += consoleMatches.length;
      if (shouldPreserveFile(file)) {
        console.log(`🚫 PRESERVING ${file}: ${consoleMatches.length} console statements (intentional debug utility)`);
        preservedFiles++;
      } else {
        console.log(`📄 ${file}: ${consoleMatches.length} console statements`);
        if (migrateConsoleStatements(file)) {
          consoleMigrated++;
          console.log(`✅ Console migrated: ${file}`);
        }
      }
    }
    
    // Count ProductionLogging calls
    const productionLoggingMatches = content.match(/ProductionLogging\.(error|warn|info|debug|log)/g);
    if (productionLoggingMatches) {
      totalProductionLoggingFound += productionLoggingMatches.length;
      console.log(`🏭 ${file}: ${productionLoggingMatches.length} ProductionLogging calls`);
      if (migrateProductionLogging(file)) {
        productionLoggingMigrated++;
        console.log(`✅ ProductionLogging migrated: ${file}`);
      }
    }
  });
  
  console.log(`\n🎉 COMPLETE MIGRATION FINISHED!`);
  console.log(`📊 Console Migration:`);
  console.log(`  - Files migrated: ${consoleMigrated}`);
  console.log(`  - Files preserved: ${preservedFiles} (intentional debug utilities)`);
  console.log(`  - Total console statements: ${totalConsoleFound}`);
  console.log(`📊 ProductionLogging Migration:`);
  console.log(`  - Files migrated: ${productionLoggingMigrated}`);
  console.log(`  - Total ProductionLogging calls: ${totalProductionLoggingFound}`);
  console.log(`✅ All migrations complete - DebugLogger integration finished!`);
}

if (require.main === module) {
  main();
}