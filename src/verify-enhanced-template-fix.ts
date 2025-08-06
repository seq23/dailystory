// Comprehensive Verification of Enhanced Template Manager Fix
// Double-checks that the Level 1-4 template continuation issues are resolved

import { EnhancedTemplateManager } from './services/enhancedTemplateManager';
import type { UserInfo, DifficultyLevel } from './types';

/**
 * Comprehensive verification of the Enhanced Template Manager fix
 */
export async function verifyEnhancedTemplateManagerFix() {
  console.log('🔍 COMPREHENSIVE VERIFICATION: Enhanced Template Manager Fix');
  console.log('=' .repeat(70));
  
  const testUser: UserInfo = {
    name: 'Sequoia',
    age: 7,
    grade: '2nd',
    nativeLanguage: 'en',
    learningGoal: 'improve-english-reading',
    avatar: { type: 'boy', skinTone: 'medium' },
    favoriteColor: 'blue',
    favoriteAnimal: 'tiger',
    hobbies: 'reading',
    favoriteFood: 'pizza',
    specialRequest: ''
  };

  let allTestsPassed = true;
  const testResults: any = {};

  try {
    // VERIFICATION 1: Template State Management
    console.log('\n🧪 VERIFICATION 1: Template State Management');
    
    EnhancedTemplateManager.clearSession();
    
    const initialStory = await EnhancedTemplateManager.generateEnhancedStory({
      userInfo: testUser,
      difficulty: 'easy' as DifficultyLevel,
      isPremium: false
    });
    
    console.log(`Initial story: ${initialStory.pages.length} pages, template ${initialStory.templateIndex + 1}`);
    
    const continuation1 = await EnhancedTemplateManager.continueStory({
      userInfo: testUser,
      difficulty: 'easy' as DifficultyLevel,
      isPremium: false,
      targetPages: 5
    });
    
    console.log(`Continuation 1: ${continuation1.pages.length} pages, template ${continuation1.templateIndex + 1}`);
    
    // Check if template state is being managed properly
    const templateStateManaged = continuation1.pages.length === 5;
    testResults.templateStateManagement = templateStateManaged;
    
    if (!templateStateManaged) {
      console.log('❌ Template state management FAILED');
      allTestsPassed = false;
    } else {
      console.log('✅ Template state management PASSED');
    }

    // VERIFICATION 2: Template Sequence Continuity
    console.log('\n🧪 VERIFICATION 2: Template Sequence Continuity');
    
    const continuation2 = await EnhancedTemplateManager.continueStory({
      userInfo: testUser,
      difficulty: 'easy' as DifficultyLevel,
      isPremium: false,
      targetPages: 3
    });
    
    console.log(`Continuation 2: ${continuation2.pages.length} pages, template ${continuation2.templateIndex + 1}`);
    
    // Check for coherent content (no abrupt repetition like "Sequoia was not quite ready for...")
    const hasCoherentContent = !checkForAbruptRepetition([
      ...continuation1.pages,
      ...continuation2.pages
    ]);
    
    testResults.sequenceContinuity = hasCoherentContent;
    
    if (!hasCoherentContent) {
      console.log('❌ Template sequence continuity FAILED - detected repetitive content');
      allTestsPassed = false;
    } else {
      console.log('✅ Template sequence continuity PASSED');
    }

    // VERIFICATION 3: Multi-Level Testing
    console.log('\n🧪 VERIFICATION 3: Multi-Level Testing');
    
    const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    let multiLevelSuccess = true;
    
    for (const level of levels) {
      try {
        EnhancedTemplateManager.clearSession();
        
        const levelTest = await EnhancedTemplateManager.continueStory({
          userInfo: testUser,
          difficulty: level,
          isPremium: false,
          targetPages: 5
        });
        
        console.log(`Level ${level}: ${levelTest.pages.length} pages, template ${levelTest.templateIndex + 1}`);
        
        if (levelTest.pages.length !== 5 || levelTest.pages.some(page => page.length < 10)) {
          multiLevelSuccess = false;
          console.log(`❌ Level ${level} FAILED`);
        } else {
          console.log(`✅ Level ${level} PASSED`);
        }
      } catch (error) {
        console.error(`❌ Level ${level} ERROR:`, error);
        multiLevelSuccess = false;
      }
    }
    
    testResults.multiLevelTesting = multiLevelSuccess;
    if (!multiLevelSuccess) allTestsPassed = false;

    // VERIFICATION 4: Template Efficiency Test
    console.log('\n🧪 VERIFICATION 4: Template Efficiency (10 continuations)');
    
    EnhancedTemplateManager.clearSession();
    
    const allPages: string[] = [];
    const templateUsage: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const story = await EnhancedTemplateManager.continueStory({
        userInfo: testUser,
        difficulty: 'easy' as DifficultyLevel,
        isPremium: false,
        targetPages: 5
      });
      
      allPages.push(...story.pages);
      templateUsage.push(story.templateIndex);
      
      console.log(`Continuation ${i + 1}: Template ${story.templateIndex + 1}, Pages: ${story.pages.length}`);
    }
    
    // Calculate template efficiency
    const uniqueTemplates = new Set(templateUsage).size;
    const totalPages = allPages.length;
    const expectedTemplates = Math.ceil(totalPages / 5);
    const efficiency = uniqueTemplates <= expectedTemplates;
    
    console.log(`Total pages: ${totalPages}, Unique templates: ${uniqueTemplates}, Expected: ${expectedTemplates}`);
    console.log(`Template efficiency: ${efficiency ? '✅ EFFICIENT' : '❌ WASTEFUL'}`);
    
    testResults.templateEfficiency = efficiency;
    if (!efficiency) allTestsPassed = false;

    // VERIFICATION 5: Content Quality Assessment
    console.log('\n🧪 VERIFICATION 5: Content Quality Assessment');
    
    const qualityMetrics = assessContentQuality(allPages);
    const qualityPassed = qualityMetrics.averageLength > 15 && 
                         qualityMetrics.uniqueContent > 0.7 && 
                         qualityMetrics.hasProperNames;
    
    console.log('Content Quality Metrics:', qualityMetrics);
    console.log(`Content quality: ${qualityPassed ? '✅ HIGH QUALITY' : '❌ LOW QUALITY'}`);
    
    testResults.contentQuality = qualityPassed;
    if (!qualityPassed) allTestsPassed = false;

    // VERIFICATION 6: Session Storage Integration
    console.log('\n🧪 VERIFICATION 6: Session Storage Integration');
    
    // Test session persistence simulation
    let sessionPersistenceWorks = true;
    try {
      const { MobileSessionManager } = require('./services/mobileSessionManager');
      const testKey = 'enhanced_template_session_1';
      const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });
      
      MobileSessionManager.setItem(testKey, testData);
      const retrieved = MobileSessionManager.getItem(testKey);
      
      if (retrieved !== testData) {
        sessionPersistenceWorks = false;
      }
      
      MobileSessionManager.removeItem(testKey);
    } catch (error) {
      console.error('Session storage test error:', error);
      sessionPersistenceWorks = false;
    }
    
    console.log(`Session storage: ${sessionPersistenceWorks ? '✅ WORKING' : '❌ FAILED'}`);
    testResults.sessionStorage = sessionPersistenceWorks;
    if (!sessionPersistenceWorks) allTestsPassed = false;

    // FINAL RESULTS
    console.log('\n' + '=' .repeat(70));
    console.log('🎯 VERIFICATION RESULTS SUMMARY');
    console.log('=' .repeat(70));
    
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log('\n' + (allTestsPassed ? '🎉 ALL VERIFICATIONS PASSED!' : '🚨 SOME VERIFICATIONS FAILED!'));
    
    if (allTestsPassed) {
      console.log('\n✅ Enhanced Template Manager Fix is WORKING CORRECTLY:');
      console.log('   • Template state management implemented');
      console.log('   • Proper template continuation logic');
      console.log('   • Efficient template utilization (5/5 pages)');
      console.log('   • Coherent story sequences maintained');
      console.log('   • Session storage integration working');
      console.log('   • Multi-level support confirmed');
    } else {
      console.log('\n❌ Enhanced Template Manager Fix has ISSUES:');
      const failedTests = Object.entries(testResults).filter(([_, passed]) => !passed);
      failedTests.forEach(([test, _]) => {
        console.log(`   • ${test} failed verification`);
      });
    }
    
    return { allTestsPassed, testResults };
    
  } catch (error) {
    console.error('🚨 VERIFICATION PROCESS FAILED:', error);
    return { allTestsPassed: false, error };
  }
}

/**
 * Check for abrupt repetition patterns that indicate broken continuation
 */
function checkForAbruptRepetition(pages: string[]): boolean {
  const repetitivePatterns = [
    'Sequoia was not quite ready for',
    'Things never go the way Sequoia planned',
    'Life with family is never boring'
  ];
  
  let repetitionCount = 0;
  
  for (const page of pages) {
    for (const pattern of repetitivePatterns) {
      if (page.toLowerCase().includes(pattern.toLowerCase())) {
        repetitionCount++;
        if (repetitionCount > 1) {
          console.log(`🚨 Detected repetitive pattern: "${pattern}"`);
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Assess overall content quality
 */
function assessContentQuality(pages: string[]) {
  const totalLength = pages.reduce((sum, page) => sum + page.length, 0);
  const averageLength = totalLength / pages.length;
  
  const uniquePages = new Set(pages.map(p => p.trim().toLowerCase()));
  const uniqueContent = uniquePages.size / pages.length;
  
  const hasProperNames = pages.some(page => page.includes('Sequoia'));
  
  return {
    totalPages: pages.length,
    averageLength: Math.round(averageLength),
    uniqueContent: Math.round(uniqueContent * 100) / 100,
    hasProperNames
  };
}

// Auto-run verification in development
if (typeof window !== 'undefined') {
  (window as any).verifyEnhancedTemplateManagerFix = verifyEnhancedTemplateManagerFix;
  console.log('🔧 Enhanced Template Manager verification available:');
  console.log('   verifyEnhancedTemplateManagerFix()');
}