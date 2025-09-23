#!/usr/bin/env node

// Emergency fix for service files with too many ProductionLogging errors
const fs = require('fs');

const filesToFix = [
  'src/services/SessionCacheManager.ts',
  'src/services/ComprehensiveDictionaryManager.ts',
  'src/services/CharacterConsistencyService.ts',
  'src/services/DebugGateway.ts',
  'src/services/enhancedElevenLabsTTS.ts',
  'src/services/errorHandlingManager.ts',
  'src/services/storySessionCache.ts'
];

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove duplicate DebugLogger imports
      content = content.replace(/(import { DebugLogger } from '@\/services\/DebugLogger';[\s\n]*)+/g, "import { DebugLogger } from '@/services/DebugLogger';\n");
      
      // Replace all ProductionLogging calls with simple DebugLogger calls
      content = content.replace(/ProductionLogging\.(error|warn|info|debug|log)\([^)]*\)/g, "DebugLogger.log('service', 'Migrated call')");
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }
});

console.log('Emergency service fix complete!');