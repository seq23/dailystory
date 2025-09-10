#!/usr/bin/env node

/**
 * Run the TypeScript to JavaScript conversion for runware-simple-fallback
 */

const { convertFile } = require('./convert-ts-to-js.js');
const path = require('path');

async function main() {
  try {
    console.log('🚀 Starting systematic TypeScript to JavaScript conversion');
    console.log('==========================================');
    
    const inputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.backup.ts');
    const outputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.js');
    
    console.log('Input:', inputPath);
    console.log('Output:', outputPath);
    console.log('');
    
    const results = convertFile(inputPath, outputPath);
    
    console.log('');
    console.log('📊 CONVERSION RESULTS:');
    console.log('==========================================');
    console.log('Original lines:', results.originalLines);
    console.log('Converted lines:', results.convertedLines);
    console.log('Line retention:', ((results.convertedLines / results.originalLines) * 100).toFixed(1) + '%');
    console.log('Original size:', results.originalSize, 'chars');
    console.log('Converted size:', results.convertedSize, 'chars');
    console.log('Size retention:', ((results.convertedSize / results.originalSize) * 100).toFixed(1) + '%');
    
    if (results.convertedLines < results.originalLines * 0.95) {
      console.warn('⚠️  WARNING: Significant line loss detected!');
    } else if (results.convertedLines >= results.originalLines * 0.95) {
      console.log('✅ Excellent line retention - conversion successful!');
    }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

main();