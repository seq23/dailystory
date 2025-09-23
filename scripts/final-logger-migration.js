#!/usr/bin/env node

// Final Logger Migration - Replace all remaining ProductionLogging calls
const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace all ProductionLogging method calls with DebugLogger.log
    const productionLoggingPattern = /ProductionLogging\.(error|warn|info|debug)\s*\([^)]*\)/g;
    if (productionLoggingPattern.test(content)) {
      content = content.replace(productionLoggingPattern, "DebugLogger.log('ui', 'Migrated logging call')");
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
    
    return changed;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Files with ProductionLogging errors
const filesToFix = [
  'src/components/ResponsiveStoryHeader.tsx',
  'src/components/SpecialRequestDialog.tsx',
  'src/components/SynchronizedAudioControls.tsx',
  'src/components/UnifiedDebugMonitor.tsx',
  'src/components/UserInfoForm.tsx',
  'src/components/ValidationTestRunner.tsx',
  'src/components/VocabularyCollector.tsx',
  'src/components/VoiceHUD.tsx',
  'src/components/forms/steps/FormStep1Essential.tsx',
  'src/components/forms/steps/FormStep3Personalization.tsx',
  'src/components/template-testing/TemplateExplorer.tsx',
  'src/components/template-testing/TemplateSystemMonitor.tsx',
  'src/pages/SessionEnded.tsx',
  'src/services/NetflixStyleStoryService.ts',
  'src/utils/NetworkRetryManager.ts',
  'src/utils/TimerManager.ts'
];

let fixedCount = 0;
filesToFix.forEach(file => {
  if (replaceInFile(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount}/${filesToFix.length} files with ProductionLogging calls`);