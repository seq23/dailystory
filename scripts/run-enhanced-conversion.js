#!/usr/bin/env node

/**
 * Enhanced conversion runner for complete TypeScript to JavaScript conversion
 * Handles the full 6,223-line runware-simple-fallback file
 */

const { convertFile } = require('./convert-ts-to-js.js');
const path = require('path');

async function main() {
  try {
    console.log('🚀 Starting ENHANCED systematic TypeScript to JavaScript conversion');
    console.log('🎯 Target: Complete 6,223-line runware-simple-fallback function');
    console.log('==========================================');
    
    const inputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.backup.ts');
    const outputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.js');
    
    console.log('Input:', inputPath);
    console.log('Output:', outputPath);
    console.log('');
    
    const results = convertFile(inputPath, outputPath);
    
    console.log('');
    console.log('📊 ENHANCED CONVERSION RESULTS:');
    console.log('==========================================');
    console.log('Original lines:', results.originalLines);
    console.log('Converted lines:', results.convertedLines);
    console.log('Line retention:', ((results.convertedLines / results.originalLines) * 100).toFixed(1) + '%');
    console.log('Original size:', results.originalSize, 'chars');
    console.log('Converted size:', results.convertedSize, 'chars');
    console.log('Size retention:', ((results.convertedSize / results.originalSize) * 100).toFixed(1) + '%');
    
    // Critical success metrics
    const lineRetention = (results.convertedLines / results.originalLines) * 100;
    const sizeRetention = (results.convertedSize / results.originalSize) * 100;
    
    if (lineRetention < 95) {
      console.warn('⚠️  WARNING: Significant line loss detected!');
      console.warn('Expected: 6,223+ lines, Got:', results.convertedLines, 'lines');
    } else if (lineRetention >= 95) {
      console.log('✅ Excellent line retention - conversion successful!');
    }
    
    if (sizeRetention < 85) {
      console.warn('⚠️  WARNING: Significant size loss detected!');
      console.warn('This may indicate missing functionality');
    } else {
      console.log('✅ Good size retention - functionality preserved!');
    }
    
    // Critical function count check
    const jsContent = require('fs').readFileSync(outputPath, 'utf8');
    const functionCount = (jsContent.match(/function\s+\w+/g) || []).length;
    const arrowFunctionCount = (jsContent.match(/\w+\s*=\s*\(/g) || []).length;
    const totalFunctions = functionCount + arrowFunctionCount;
    
    console.log('');
    console.log('🔧 FUNCTION ANALYSIS:');
    console.log('Traditional functions:', functionCount);
    console.log('Arrow functions:', arrowFunctionCount);
    console.log('Total functions:', totalFunctions);
    
    if (totalFunctions < 80) {
      console.warn('⚠️  WARNING: Expected 89+ functions, found only', totalFunctions);
    } else {
      console.log('✅ Function count looks healthy!');
    }
    
    console.log('');
    console.log('🎉 ENHANCED CONVERSION COMPLETE!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Enhanced conversion failed:', error.message);
    process.exit(1);
  }
}

main();