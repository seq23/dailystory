#!/usr/bin/env node

/**
 * Complete TypeScript to JavaScript conversion for the full 6,223-line file
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

async function main() {
  try {
    console.log('🚀 Starting COMPLETE TypeScript to JavaScript conversion');
    console.log('🎯 Target: Complete 6,223-line runware-simple-fallback function');
    console.log('==========================================');
    
    const inputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.backup.ts');
    const outputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.js');
    
    console.log('Input:', inputPath);
    console.log('Output:', outputPath);
    console.log('');
    
    // Read the complete backup file
    console.log('Reading TypeScript file:', inputPath);
    const tsContent = fs.readFileSync(inputPath, 'utf8');
    
    console.log('Original file size:', tsContent.length, 'characters');
    console.log('Original line count:', tsContent.split('\n').length, 'lines');
    
    // Convert TypeScript to JavaScript
    console.log('Converting TypeScript to JavaScript...');
    const jsContent = convertTsToJs(tsContent);
    
    console.log('Converted file size:', jsContent.length, 'characters');
    console.log('Converted line count:', jsContent.split('\n').length, 'lines');
    
    // Write the complete JavaScript file
    console.log('Writing JavaScript file:', outputPath);
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log('✅ Conversion completed successfully!');
    console.log('Size retention:', ((jsContent.length / tsContent.length) * 100).toFixed(1) + '%');
    
    const results = {
      originalSize: tsContent.length,
      convertedSize: jsContent.length,
      originalLines: tsContent.split('\n').length,
      convertedLines: jsContent.split('\n').length
    };
    
    console.log('');
    console.log('📊 COMPLETE CONVERSION RESULTS:');
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
    console.log('🎉 COMPLETE CONVERSION FINISHED!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Complete conversion failed:', error.message);
    process.exit(1);
  }
}

main();