#!/usr/bin/env node

/**
 * Simple file copy script to properly copy the complete backup file
 */

const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('🚀 Starting complete file copy operation');
    console.log('🎯 Target: Copy complete arcManager.js to arcManager.ts');
    console.log('==========================================');
    
    const inputPath = path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'arcManager.js');
    const outputPath = path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'arcManager.ts');
    
    console.log('Source:', inputPath);
    console.log('Target:', outputPath);
    console.log('');
    
    // Read the complete backup file
    console.log('Reading source file...');
    const content = fs.readFileSync(inputPath, 'utf8');
    
    console.log('Source file size:', content.length, 'characters');
    console.log('Source line count:', content.split('\n').length, 'lines');
    
    // Write the complete file (exact copy)
    console.log('Writing target file...');
    fs.writeFileSync(outputPath, content, 'utf8');
    
    // Verify the copy
    const copiedContent = fs.readFileSync(outputPath, 'utf8');
    console.log('Target file size:', copiedContent.length, 'characters');
    console.log('Target line count:', copiedContent.split('\n').length, 'lines');
    
    const isIdentical = content === copiedContent;
    console.log('Files identical:', isIdentical);
    
    if (isIdentical) {
      console.log('✅ Copy operation completed successfully!');
      console.log('Both files are now identical with', copiedContent.split('\n').length, 'lines');
    } else {
      console.error('❌ Copy operation failed - files are not identical');
      process.exit(1);
    }
    
    console.log('');
    console.log('📊 COPY OPERATION RESULTS:');
    console.log('==========================================');
    console.log('Lines copied:', copiedContent.split('\n').length);
    console.log('Characters copied:', copiedContent.length);
    console.log('Success: Both backup files are now identical');
    
  } catch (error) {
    console.error('❌ Copy operation failed:', error.message);
    process.exit(1);
  }
}

main();