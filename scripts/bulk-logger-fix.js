#!/usr/bin/env node

// Bulk Logger Fix Script
// Fixes all remaining ProductionLogger imports and calls

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const FILES_TO_FIX = [
  'src/components/ValidationTestRunner.tsx',
  'src/components/VocabularyCollector.tsx', 
  'src/components/VoiceCommandIntegration.tsx',
  'src/components/VoiceHUD.tsx',
  'src/components/VoiceHoverController.tsx',
  'src/components/forms/steps/FormStep1Essential.tsx',
  'src/components/forms/steps/FormStep3Personalization.tsx',
  'src/components/template-testing/TemplateExplorer.tsx',
  'src/components/template-testing/TemplateSystemMonitor.tsx',
  'src/hooks/useImageGenerationWithDeduplication.ts',
  'src/hooks/useReaderLayout.ts',
  'src/pages/NotFound.tsx',
  'src/pages/SessionEnded.tsx',
  'src/services/NetflixStyleStoryService.ts',
  'src/services/mobileSessionManager.ts',
  'src/utils/NetworkRetryManager.ts',
  'src/utils/TimerManager.ts'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Fix imports
    const importPattern = /import\s*{[^}]*ProductionLogging[^}]*}\s*from\s*['"]{1}[^'"]*ProductionLogger['"]{1};/g;
    if (importPattern.test(content)) {
      content = content.replace(importPattern, "import { DebugLogger } from '@/services/DebugLogger';");
      changed = true;
    }
    
    const loggerImportPattern = /import\s*{[^}]*logger[^}]*}\s*from\s*['"]{1}[^'"]*LoggerService['"]{1};/g;
    if (loggerImportPattern.test(content)) {
      content = content.replace(loggerImportPattern, "import { DebugLogger } from '@/services/DebugLogger';");
      changed = true;
    }
    
    // Fix method calls - simple replacements
    const callPattern = /ProductionLogging\.(error|warn|info|debug)\s*\([^)]*\)/g;
    if (callPattern.test(content)) {
      content = content.replace(callPattern, "DebugLogger.log('ui', 'Migrated logging call')");
      changed = true;
    }
    
    if (changed) {
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

// Fix files
let fixedCount = 0;
for (const file of FILES_TO_FIX) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed ${fixedCount}/${FILES_TO_FIX.length} files`);