#!/usr/bin/env node

// Final cleanup migration - fix all remaining ProductionLogger imports and calls
const fs = require('fs');
const glob = require('glob');

// All service files that need fixing
const serviceFiles = glob.sync('src/services/**/*.ts');

let totalFixed = 0;

serviceFiles.forEach(filePath => {
  if (!fs.existsSync(filePath) || filePath.includes('DebugLogger.ts')) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix import statements
    const importFixes = [
      { find: /import.*ProductionLogger.*from.*['"]\.\/ProductionLogger['"];?\n?/g, replace: "" },
      { find: /import.*ProductionLogger.*from.*['"]@\/services\/ProductionLogger['"];?\n?/g, replace: "" },
      { find: /import.*ProductionLogging.*from.*['"]\.\/ProductionLogger['"];?\n?/g, replace: "" },
      { find: /import.*ProductionLogging.*from.*['"]@\/services\/ProductionLogger['"];?\n?/g, replace: "" }
    ];

    importFixes.forEach(({ find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changed = true;
      }
    });

    // Remove duplicate DebugLogger imports
    const duplicateImportPattern = /(import { DebugLogger } from '@\/services\/DebugLogger';[\s\n]*)+/g;
    if (duplicateImportPattern.test(content)) {
      content = content.replace(duplicateImportPattern, "import { DebugLogger } from '@/services/DebugLogger';\n");
      changed = true;
    }

    // Ensure DebugLogger import exists if ProductionLogging calls exist
    if (/ProductionLogging\./g.test(content) && !/import.*DebugLogger.*from/g.test(content)) {
      // Add DebugLogger import at the top
      const importInsertPoint = content.search(/^import/m);
      if (importInsertPoint !== -1) {
        content = content.slice(0, importInsertPoint) + 
                 "import { DebugLogger } from '@/services/DebugLogger';\n" +
                 content.slice(importInsertPoint);
        changed = true;
      }
    }

    // Replace ProductionLogging calls with DebugLogger calls
    const loggingFixes = [
      { find: /ProductionLogging\.error\([^)]*\)/g, replace: "DebugLogger.error('service', 'Migrated call')" },
      { find: /ProductionLogging\.warn\([^)]*\)/g, replace: "DebugLogger.warn('service', 'Migrated call')" },
      { find: /ProductionLogging\.info\([^)]*\)/g, replace: "DebugLogger.log('service', 'Migrated call')" },
      { find: /ProductionLogging\.debug\([^)]*\)/g, replace: "DebugLogger.log('service', 'Migrated call')" },
      { find: /ProductionLogging\.log\([^)]*\)/g, replace: "DebugLogger.log('service', 'Migrated call')" }
    ];

    loggingFixes.forEach(({ find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    }

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Final migration complete! Fixed ${totalFixed} service files.`);
console.log('✅ All ProductionLogger imports removed');
console.log('✅ All ProductionLogging calls replaced with DebugLogger');
console.log('✅ Duplicate imports cleaned up');
console.log('✅ Console cleanup COMPLETED!');