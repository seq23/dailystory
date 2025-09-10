#!/usr/bin/env node

/**
 * TypeScript to JavaScript Conversion Script
 * Systematically converts TypeScript files to JavaScript
 */

const fs = require('fs');
const path = require('path');

function convertTsToJs(tsContent) {
  let jsContent = tsContent;

  // 1. Remove type annotations from function parameters and variables
  // Example: (param: string) => (param)
  jsContent = jsContent.replace(/(\w+):\s*[^,)=>\s]+/g, '$1');
  
  // 2. Remove return type annotations
  // Example: ): string => )
  jsContent = jsContent.replace(/\):\s*[^{=>\s]+/g, ')');
  
  // 3. Remove interface definitions (convert to JSDoc comments)
  jsContent = jsContent.replace(/interface\s+(\w+)\s*{[^}]+}/gs, (match) => {
    return `/**\n * Interface: ${match}\n */`;
  });
  
  // 4. Remove type definitions
  jsContent = jsContent.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // 5. Remove generic types
  // Example: Array<string> => Array
  jsContent = jsContent.replace(/<[^>]+>/g, '');
  
  // 6. Update import extensions from .ts to .js
  jsContent = jsContent.replace(/from\s+["']([^"']+)\.ts["']/g, 'from "$1.js"');
  
  // 7. Remove export type statements
  jsContent = jsContent.replace(/export\s+type\s+[^;]+;/g, '');
  
  // 8. Remove as Type assertions
  jsContent = jsContent.replace(/\s+as\s+\w+/g, '');
  
  // 9. Clean up extra whitespace and empty lines
  jsContent = jsContent.replace(/\n\n\n+/g, '\n\n');
  
  return jsContent;
}

function convertFile(inputPath, outputPath) {
  try {
    console.log('Reading TypeScript file:', inputPath);
    const tsContent = fs.readFileSync(inputPath, 'utf8');
    
    console.log('Converting TypeScript to JavaScript...');
    console.log('Original file size:', tsContent.length, 'characters');
    console.log('Original line count:', tsContent.split('\n').length, 'lines');
    
    const jsContent = convertTsToJs(tsContent);
    
    console.log('Converted file size:', jsContent.length, 'characters');
    console.log('Converted line count:', jsContent.split('\n').length, 'lines');
    
    console.log('Writing JavaScript file:', outputPath);
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log('✅ Conversion completed successfully!');
    console.log('Size retention:', ((jsContent.length / tsContent.length) * 100).toFixed(1) + '%');
    
    return {
      originalSize: tsContent.length,
      convertedSize: jsContent.length,
      originalLines: tsContent.split('\n').length,
      convertedLines: jsContent.split('\n').length
    };
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];
  
  if (!inputFile || !outputFile) {
    console.log('Usage: node convert-ts-to-js.js <input.ts> <output.js>');
    process.exit(1);
  }
  
  convertFile(inputFile, outputFile);
}

module.exports = { convertTsToJs, convertFile };