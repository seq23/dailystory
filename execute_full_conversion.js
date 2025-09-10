#!/usr/bin/env node

/**
 * COMPLETE SYSTEMATIC CONVERSION - Execute Full 6,223-Line Conversion
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 EXECUTING COMPLETE 6,223-LINE SYSTEMATIC CONVERSION');
console.log('=============================================================');

// Enhanced TypeScript to JavaScript conversion function
function convertTsToJs(tsContent) {
  let jsContent = tsContent;
  console.log('Starting systematic conversion of', tsContent.length, 'characters...');
  
  // 1. Remove all TypeScript type annotations from function parameters
  // Handle: (param: string, other: number[]) => (param, other)
  jsContent = jsContent.replace(/(\w+):\s*[^,)=>\s{]+(?=\s*[,)])/g, '$1');
  
  // 2. Remove return type annotations
  // Handle: ): Promise<string[]> => )
  jsContent = jsContent.replace(/\):\s*[^{=>\s]+(?=\s*[{=>\s])/g, ')');
  
  // 3. Remove interface definitions completely
  jsContent = jsContent.replace(/interface\s+\w+\s*\{[^}]*\}/gs, '');
  
  // 4. Remove type definitions
  jsContent = jsContent.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // 5. Remove ALL generic types (comprehensive)
  // Handle nested generics: Array<Promise<Response<Data>>> => Array
  jsContent = jsContent.replace(/<[^<>]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>[^<>]*)*>/g, '');
  
  // 6. Update import extensions from .ts to .js
  jsContent = jsContent.replace(/from\s+["']([^"']+)\.ts["']/g, 'from "$1.js"');
  
  // 7. Remove export type statements
  jsContent = jsContent.replace(/export\s+type\s+[^;]+;/g, '');
  
  // 8. Remove 'as Type' assertions completely
  jsContent = jsContent.replace(/\s+as\s+[\w\[\]<>|&\s.]+/g, '');
  
  // 9. Remove function type parameters
  jsContent = jsContent.replace(/function\s+(\w+)<[^>]+>\s*\(/g, 'function $1(');
  
  // 10. Remove arrow function type parameters
  jsContent = jsContent.replace(/(\w+)\s*=\s*<[^>]+>\s*\(/g, '$1 = (');
  
  // 11. Remove const assertions
  jsContent = jsContent.replace(/\s+as\s+const/g, '');
  
  // 12. Handle optional parameters (remove ? from parameter names)
  jsContent = jsContent.replace(/(\w+)\?\s*:/g, '$1:');
  jsContent = jsContent.replace(/(\w+)\?(?=\s*[,):=])/g, '$1');
  
  // 13. Remove variable type annotations
  // Handle: let variable: string = => let variable =
  jsContent = jsContent.replace(/(\b(?:let|const|var)\s+\w+):\s*[^=]+=/g, '$1 =');
  
  // 14. Clean up extra whitespace and empty lines
  jsContent = jsContent.replace(/\n\n\n+/g, '\n\n');
  jsContent = jsContent.replace(/^\s*$/gm, '');
  
  console.log('Systematic conversion completed. Output length:', jsContent.length, 'characters');
  return jsContent;
}

try {
  const inputPath = path.join(__dirname, 'supabase', 'functions', 'runware-simple-fallback', 'index.backup.ts');
  const outputPath = path.join(__dirname, 'supabase', 'functions', 'runware-simple-fallback', 'index.js');
  
  console.log('📂 Input file:', inputPath);
  console.log('📂 Output file:', outputPath);
  
  // Verify input file exists
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }
  
  console.log('📖 Reading complete 6,223-line TypeScript file...');
  const tsContent = fs.readFileSync(inputPath, 'utf8');
  
  console.log('📊 Original TypeScript file statistics:');
  console.log('   Lines:', tsContent.split('\n').length);
  console.log('   Characters:', tsContent.length);
  console.log('   Expected: ~6,223 lines');
  
  if (tsContent.split('\n').length < 6000) {
    throw new Error('TypeScript file appears incomplete - expected ~6,223 lines');
  }
  
  console.log('⚙️ Converting complete TypeScript to JavaScript...');
  const jsContent = convertTsToJs(tsContent);
  
  console.log('📊 Converted JavaScript file statistics:');
  console.log('   Lines:', jsContent.split('\n').length);
  console.log('   Characters:', jsContent.length);
  
  const lineRetention = (jsContent.split('\n').length / tsContent.split('\n').length) * 100;
  const sizeRetention = (jsContent.length / tsContent.length) * 100;
  
  console.log('📈 Conversion metrics:');
  console.log('   Line retention:', lineRetention.toFixed(1) + '%');
  console.log('   Size retention:', sizeRetention.toFixed(1) + '%');
  
  if (jsContent.split('\n').length < 6000) {
    throw new Error(`Conversion failed - only ${jsContent.split('\n').length} lines generated, expected ~6,200+`);
  }
  
  console.log('💾 Writing complete JavaScript file...');
  fs.writeFileSync(outputPath, jsContent, 'utf8');
  
  console.log('✅ COMPLETE 6,223-LINE CONVERSION SUCCESSFUL!');
  console.log('=============================================================');
  
  // Final validation
  const writtenContent = fs.readFileSync(outputPath, 'utf8');
  const finalLineCount = writtenContent.split('\n').length;
  
  console.log('🔍 Final validation:');
  console.log('   Final line count:', finalLineCount);
  console.log('   Target line count: ~6,200+');
  
  if (finalLineCount >= 6000) {
    console.log('🎉 SUCCESS: Complete conversion achieved!');
  } else {
    console.error('❌ FAILURE: Conversion incomplete');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ COMPLETE CONVERSION FAILED:', error.message);
  process.exit(1);
}