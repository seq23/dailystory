// Manual test execution to run full comprehensive test suite
import './execute-comprehensive-tests';

// Also expose individual test suites for detailed debugging
import { EnhancedFormattingTester } from './testing/modules/EnhancedFormattingTester';
import { VisualDesignTestSuite } from './testing/modules/VisualDesignTestSuite';
import { EnhancedUXTestSuite } from './testing/modules/EnhancedUXTestSuite';

// Add to window for manual testing
declare global {
  interface Window {
    testFormatting: () => Promise<any>;
    testVisualDesign: () => Promise<any>;
    testUX: () => Promise<any>;
    runFullSuite: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.testFormatting = () => EnhancedFormattingTester.runFormattingTests();
  window.testVisualDesign = () => VisualDesignTestSuite.runVisualDesignTests();
  window.testUX = () => EnhancedUXTestSuite.runComprehensiveUXTests();
  window.runFullSuite = () => {
    import('./execute-comprehensive-tests');
  };
}

console.log('🧪 Test execution utilities loaded:');
console.log('- window.testFormatting() - Run formatting tests');
console.log('- window.testVisualDesign() - Run visual design tests');
console.log('- window.testUX() - Run UX tests');
console.log('- window.runFullSuite() - Run complete test suite');

export {};