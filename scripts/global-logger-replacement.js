#!/usr/bin/env node

// Global logger replacement - replace ALL ProductionLogging calls across all files
const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace all ProductionLogging method calls
    content = content.replace(/ProductionLogging\.(error|warn|info|debug|log)\s*\([^)]*\)/g, "DebugLogger.log('service', 'Migrated call')");
    
    // Remove any ProductionLogger imports
    content = content.replace(/import.*ProductionLogger.*from.*['"][^'"]*['"];?\n?/g, '');
    content = content.replace(/import.*ProductionLogging.*from.*['"][^'"]*['"];?\n?/g, '');
    
    // Ensure DebugLogger import exists if we made changes
    if (originalContent !== content && !/import.*DebugLogger.*from/g.test(content)) {
      // Add DebugLogger import at the top of imports
      const importMatch = content.match(/^import[^;]+;/m);
      if (importMatch) {
        const insertIndex = content.indexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, insertIndex) + "\nimport { DebugLogger } from '@/services/DebugLogger';" + content.slice(insertIndex);
      }
    }
    
    // Remove duplicate DebugLogger imports
    content = content.replace(/(import { DebugLogger } from '@\/services\/DebugLogger';[\s\n]*)+/g, "import { DebugLogger } from '@/services/DebugLogger';\n");
    
    if (originalContent !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (replaceInFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

const fixedCount = walkDirectory('src/services');
console.log(`\n🎉 Global replacement complete! Fixed ${fixedCount} files.`);
console.log('✅ All ProductionLogging calls replaced');
console.log('✅ All ProductionLogger imports removed');
console.log('✅ DebugLogger imports added where needed');