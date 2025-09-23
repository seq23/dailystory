#!/usr/bin/env node

// Brute force fix - replace all ProductionLogging calls at once
const fs = require('fs');

// Files with the most errors
const criticalFiles = [
  'src/services/SessionCacheManager.ts',
  'src/services/ComprehensiveDictionaryManager.ts', 
  'src/services/CharacterConsistencyService.ts',
  'src/services/DebugGateway.ts',
  'src/services/enhancedElevenLabsTTS.ts',
  'src/services/errorHandlingManager.ts',
  'src/services/storySessionCache.ts',
  'src/services/mobileAudioManager.ts'
];

criticalFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace ALL ProductionLogging calls
    content = content.replace(/ProductionLogging\.(error|warn|info|debug|log)\s*\([^)]*\)/g, "DebugLogger.log('service', 'Migrated call')");
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed all ProductionLogging calls in: ${filePath}`);
  }
});

console.log('🎉 Brute force fix complete!');