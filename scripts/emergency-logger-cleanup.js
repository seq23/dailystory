#!/usr/bin/env node

// Emergency Logger Cleanup - Simple replacement script
const fs = require('fs');
const glob = require('glob');

const patterns = [
  // Replace ProductionLogging calls with simple DebugLogger calls
  {
    find: /ProductionLogging\.(error|warn|info|debug)\([^)]+\)/g,
    replace: "DebugLogger.log('ui', 'Migrated call')"
  }
];

const files = [
  'src/components/ResponsiveStoryHeader.tsx',
  'src/components/SpecialRequestDialog.tsx', 
  'src/components/SynchronizedAudioControls.tsx',
  'src/components/UnifiedDebugMonitor.tsx',
  'src/components/UserInfoForm.tsx',
  'src/components/ValidationTestRunner.tsx',
  'src/components/VocabularyCollector.tsx',
  'src/components/VoiceHUD.tsx',
  'src/services/NetflixStyleStoryService.ts',
  'src/utils/NetworkRetryManager.ts',
  'src/utils/TimerManager.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    patterns.forEach(({ find, replace }) => {
      content = content.replace(find, replace);
    });
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Emergency cleanup complete!');