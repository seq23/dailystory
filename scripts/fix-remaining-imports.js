#!/usr/bin/env node

// Fix all remaining ProductionLogger imports - final cleanup
const fs = require('fs');

const FILES_WITH_IMPORT_ERRORS = [
  'src/services/CharacterConsistencyService.ts',
  'src/services/ComprehensiveDictionaryManager.ts',
  'src/services/DebugGateway.ts',
  'src/services/PromptFlowDebugger.ts',
  'src/services/PronunciationAnalyzer.ts',
  'src/services/SessionCacheManager.ts',
  'src/services/SimplifiedAudioEngine.ts',
  'src/services/SmartPhoneticMapper.ts',
  'src/services/StaticDataCache.ts',
  'src/services/StoryCacheIntegration.ts',
  'src/services/UnifiedCharacterDescriptor.ts',
  'src/services/charlotteLexiconIntegration.ts',
  'src/services/difficultyManager.ts',
  'src/services/enhancedElevenLabsTTS.ts',
  'src/services/enhancedImageCache.ts',
  'src/services/enhancedInputProcessor.ts',
  'src/services/enhancedSubscriptionManager.ts',
  'src/services/errorHandlingManager.ts',
  'src/services/expertDifficultyManager.ts',
  'src/services/hintRegenerationService.ts',
  'src/services/languagePreferenceService.ts',
  'src/services/mobileAudioManager.ts',
  'src/services/mobileTemplateOptimizer.ts',
  'src/services/parentGuardrailsService.ts',
  'src/services/phoneticRulesEngine.ts',
  'src/services/premiumStoryManager.ts',
  'src/services/productionAnalyticsTracker.ts',
  'src/services/progressTrackingService.ts',
  'src/services/repairService.ts',
  'src/services/simpleAudioCoordinator.ts',
  'src/services/spellcheckService.ts',
  'src/services/storyGenerationService.ts',
  'src/services/storySessionCache.ts'
];

function fixImports(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace ProductionLogger imports
    const importPatterns = [
      { find: /import.*ProductionLogger.*from.*['"]\.\/ProductionLogger['"];?\n?/g, replace: "import { DebugLogger } from '@/services/DebugLogger';\n" },
      { find: /import.*ProductionLogger.*from.*['"]@\/services\/ProductionLogger['"];?\n?/g, replace: "import { DebugLogger } from '@/services/DebugLogger';\n" }
    ];
    
    importPatterns.forEach(({ find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

let fixedCount = 0;
FILES_WITH_IMPORT_ERRORS.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount}/${FILES_WITH_IMPORT_ERRORS.length} files with ProductionLogger imports`);