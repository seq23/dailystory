#!/usr/bin/env node

/**
 * TypeScript to JavaScript Conversion Script
 * Systematically converts TypeScript files to JavaScript
 */

const fs = require('fs');
const path = require('path');

function convertTsToJs(tsContent) {
  let jsContent = tsContent;
  console.log('Starting conversion of', tsContent.length, 'characters...');

  // 1. Remove type annotations from function parameters and variables (ENHANCED)
  // Handle complex patterns: (param: string, other: number) => (param, other)
  jsContent = jsContent.replace(/(\w+):\s*[^,)=>\s{]+(?=\s*[,)])/g, '$1');
  
  // 2. Remove return type annotations (ENHANCED)
  // Handle complex return types: ): Promise<string[]> => )
  jsContent = jsContent.replace(/\):\s*[^{=>\s]+(?=\s*[{=>\s])/g, ')');
  
  // 3. Remove interface definitions (ENHANCED - preserve structure)  
  jsContent = jsContent.replace(/interface\s+(\w+)\s*\{[^}]*\}/gs, (match, name) => {
    return `// Interface ${name} removed during conversion`;
  });
  
  // 4. Remove type definitions (ENHANCED)
  jsContent = jsContent.replace(/type\s+\w+\s*=\s*[^;]+;/g, '// Type definition removed');
  
  // 5. Remove generic types (ENHANCED - handle nested generics)
  // Example: Array<string> => Array, Promise<Response<Data>> => Promise
  jsContent = jsContent.replace(/<[^<>]*(?:<[^<>]*>[^<>]*)*>/g, '');
  
  // 6. Update import extensions from .ts to .js (ENHANCED)
  jsContent = jsContent.replace(/from\s+["']([^"']+)\.ts["']/g, 'from "$1.js"');
  
  // 7. Remove export type statements (ENHANCED)
  jsContent = jsContent.replace(/export\s+type\s+[^;]+;/g, '// Export type removed');
  
  // 8. Remove as Type assertions (ENHANCED - handle complex assertions)
  jsContent = jsContent.replace(/\s+as\s+[\w\[\]<>|&\s]+/g, '');
  
  // 9. Handle function declarations with type parameters
  jsContent = jsContent.replace(/function\s+(\w+)<[^>]+>\s*\(/g, 'function $1(');
  
  // 10. Handle arrow functions with type parameters  
  jsContent = jsContent.replace(/(\w+)\s*=\s*<[^>]+>\s*\(/g, '$1 = (');
  
  // 11. Remove const assertions
  jsContent = jsContent.replace(/\s+as\s+const/g, '');
  
  // 12. Handle optional parameters (remove ? from parameter names)
  jsContent = jsContent.replace(/(\w+)\?(?=\s*[,):=])/g, '$1');
  
  // 13. Clean up extra whitespace and empty lines (ENHANCED)
  jsContent = jsContent.replace(/\n\n\n+/g, '\n\n');
  jsContent = jsContent.replace(/\/\/\s*Type definition removed\n+/g, '');
  jsContent = jsContent.replace(/\/\/\s*Export type removed\n+/g, '');
  
  console.log('Conversion completed. Output length:', jsContent.length, 'characters');
  
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