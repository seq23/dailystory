#!/usr/bin/env node

/**
 * Systematic TypeScript to JavaScript Conversion
 * Complete automated conversion of the 6,223-line runware-simple-fallback function
 */

const fs = require('fs');
const path = require('path');

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

function runSystematicConversion() {
  try {
    console.log('🚀 STARTING SYSTEMATIC TYPESCRIPT TO JAVASCRIPT CONVERSION');
    console.log('========================================================');
    
    const inputPath = path.join(__dirname, 'supabase', 'functions', 'runware-simple-fallback', 'index.backup.ts');
    const outputPath = path.join(__dirname, 'supabase', 'functions', 'runware-simple-fallback', 'index.js');
    
    console.log('📂 Input file:', inputPath);
    console.log('📂 Output file:', outputPath);
    
    // Verify input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }
    
    console.log('📖 Reading TypeScript file...');
    const tsContent = fs.readFileSync(inputPath, 'utf8');
    
    console.log('📊 Original file statistics:');
    console.log('   Lines:', tsContent.split('\n').length);
    console.log('   Characters:', tsContent.length);
    
    console.log('⚙️ Converting TypeScript to JavaScript...');
    const jsContent = convertTsToJs(tsContent);
    
    console.log('📊 Converted file statistics:');
    console.log('   Lines:', jsContent.split('\n').length);
    console.log('   Characters:', jsContent.length);
    
    const lineRetention = (jsContent.split('\n').length / tsContent.split('\n').length) * 100;
    const sizeRetention = (jsContent.length / tsContent.length) * 100;
    
    console.log('📈 Conversion metrics:');
    console.log('   Line retention:', lineRetention.toFixed(1) + '%');
    console.log('   Size retention:', sizeRetention.toFixed(1) + '%');
    
    console.log('💾 Writing JavaScript file...');
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log('✅ SYSTEMATIC CONVERSION COMPLETED SUCCESSFULLY!');
    console.log('========================================================');
    
    // Validation
    if (lineRetention < 95) {
      console.warn('⚠️ WARNING: Significant line loss detected!');
      console.warn('Expected ~6,223 lines, got:', jsContent.split('\n').length);
    } else {
      console.log('✅ Excellent line retention - conversion successful!');
    }
    
    // Function count analysis
    const functionCount = (jsContent.match(/function\s+\w+/g) || []).length;
    const arrowFunctionCount = (jsContent.match(/\w+\s*=\s*\(/g) || []).length;
    const totalFunctions = functionCount + arrowFunctionCount;
    
    console.log('🔧 Function analysis:');
    console.log('   Traditional functions:', functionCount);
    console.log('   Arrow functions:', arrowFunctionCount);
    console.log('   Total functions:', totalFunctions);
    
    if (totalFunctions < 80) {
      console.warn('⚠️ WARNING: Expected 89+ functions, found only', totalFunctions);
    } else {
      console.log('✅ Function count looks healthy!');
    }
    
    return {
      success: true,
      originalLines: tsContent.split('\n').length,
      convertedLines: jsContent.split('\n').length,
      originalSize: tsContent.length,
      convertedSize: jsContent.length,
      lineRetention,
      sizeRetention,
      totalFunctions
    };
    
  } catch (error) {
    console.error('❌ SYSTEMATIC CONVERSION FAILED:', error.message);
    return { success: false, error: error.message };
  }
}

// Execute the systematic conversion
const result = runSystematicConversion();

if (!result.success) {
  process.exit(1);
}

console.log('🎉 Systematic conversion process completed successfully!');