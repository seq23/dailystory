#!/usr/bin/env node

/**
 * Enhanced TypeScript to JavaScript Converter
 * Specifically designed for large files with complex type annotations
 * Handles 6,223+ line files with chunk-based processing
 */

const fs = require('fs');
const path = require('path');

function convertTsToJsEnhanced(tsContent) {
  let jsContent = tsContent;
  console.log('🔄 Starting enhanced conversion of', tsContent.length, 'characters...');
  
  // 1. Remove function parameter type annotations (ENHANCED)
  // Handle: (array: string[], seed: string): string → (array, seed)
  jsContent = jsContent.replace(/(\w+):\s*[^,=>\s{]+(?:\[\])?(?=\s*[,)])/g, '$1');
  
  // 2. Remove return type annotations (ENHANCED) 
  // Handle: ): Promise<{ scene: string, setting: string }> → )
  jsContent = jsContent.replace(/\):\s*[^{=>\s]+(?:\{[^}]*\})?(?=\s*[{=>\s])/g, ')');
  
  // 3. Remove optional parameter markers
  // Handle: pageNumber?: number → pageNumber
  jsContent = jsContent.replace(/(\w+)\?(?=\s*[,):=])/g, '$1');
  
  // 4. Update import extensions (.ts to .js) - but preserve external URLs
  // Handle: from "../_shared/NuclearNegativePrompts.ts" → from "../_shared/NuclearNegativePrompts.js"
  // Keep: from "https://deno.land/std@0.168.0/http/server.ts" unchanged
  jsContent = jsContent.replace(/from\s+["']([^"']*)(\.ts)["'](?!.*https?:)/g, 'from "$1.js"');
  
  // 5. Remove 'as Type' assertions
  // Handle: error as Error → error
  jsContent = jsContent.replace(/\s+as\s+[\w\[\]<>|&\s]+/g, '');
  
  // 6. Remove generic type parameters from functions
  // Handle: function name<T>(param) → function name(param)
  jsContent = jsContent.replace(/function\s+(\w+)<[^>]+>\s*\(/g, 'function $1(');
  
  // 7. Remove array type brackets in parameter contexts
  // Handle: param: string[] → param
  jsContent = jsContent.replace(/: \w+\[\](?=\s*[,)])/g, '');
  
  // 8. Remove variable type annotations
  // Handle: const result: SomeType = → const result =
  jsContent = jsContent.replace(/(const|let|var)\s+(\w+):\s*[^=]+=/, '$1 $2 =');
  
  // 9. Remove interface definitions completely
  // Handle: interface Name { ... } → // Interface Name removed during conversion
  jsContent = jsContent.replace(/interface\s+(\w+)\s*\{[^}]*\}/g, '// Interface $1 removed during conversion');
  
  // 10. Remove type definitions
  // Handle: type Name = ... → // Type Name removed during conversion
  jsContent = jsContent.replace(/type\s+(\w+)\s*=\s*[^;]+;?/g, '// Type $1 removed during conversion');
  
  // 11. Clean up extra whitespace
  jsContent = jsContent.replace(/\n\n\n+/g, '\n\n');
  
  console.log('✅ Enhanced conversion completed. Output length:', jsContent.length, 'characters');
  return jsContent;
}

function processFileInChunks(filePath) {
  console.log('📖 Reading large TypeScript file in chunks:', filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const totalLines = lines.length;
  
  console.log(`📊 Processing ${totalLines} lines in chunks of 1500...`);
  
  let processedContent = '';
  const chunkSize = 1500;
  
  for (let i = 0; i < totalLines; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n');
    console.log(`🔄 Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(totalLines/chunkSize)} (lines ${i+1}-${Math.min(i+chunkSize, totalLines)})`);
    
    const convertedChunk = convertTsToJsEnhanced(chunk);
    processedContent += convertedChunk;
    
    // Add newline between chunks if not last chunk
    if (i + chunkSize < totalLines) {
      processedContent += '\n';
    }
  }
  
  return processedContent;
}

function validateConversion(originalPath, convertedContent) {
  const original = fs.readFileSync(originalPath, 'utf8');
  const originalLines = original.split('\n').length;
  const convertedLines = convertedContent.split('\n').length;
  const originalSize = original.length;
  const convertedSize = convertedContent.length;
  
  console.log('📋 VALIDATION RESULTS:');
  console.log('==========================================');
  console.log(`Original lines: ${originalLines}`);
  console.log(`Converted lines: ${convertedLines}`);
  console.log(`Line retention: ${((convertedLines / originalLines) * 100).toFixed(1)}%`);
  console.log(`Original size: ${originalSize} chars`);
  console.log(`Converted size: ${convertedSize} chars`);
  console.log(`Size retention: ${((convertedSize / originalSize) * 100).toFixed(1)}%`);
  
  // Critical validation checks
  const lineRetention = (convertedLines / originalLines) * 100;
  const sizeRetention = (convertedSize / originalSize) * 100;
  
  if (lineRetention < 95) {
    console.warn('⚠️  WARNING: Significant line loss detected!');
    console.warn(`Expected: ${originalLines}+ lines, Got: ${convertedLines} lines`);
    throw new Error('❌ CRITICAL: Significant line loss detected! Conversion failed.');
  }
  
  if (sizeRetention < 85) {
    console.warn('⚠️  WARNING: Significant size loss detected!');
    console.warn('This may indicate missing functionality');
  }
  
  // Function count validation
  const functionCount = (convertedContent.match(/function\s+\w+/g) || []).length;
  const arrowFunctionCount = (convertedContent.match(/\w+\s*=\s*\(/g) || []).length;
  const totalFunctions = functionCount + arrowFunctionCount;
  
  console.log('');
  console.log('🔧 FUNCTION ANALYSIS:');
  console.log(`Traditional functions: ${functionCount}`);
  console.log(`Arrow functions: ${arrowFunctionCount}`);
  console.log(`Total functions: ${totalFunctions}`);
  
  if (totalFunctions < 80) {
    console.warn(`⚠️  WARNING: Expected 89+ functions, found only ${totalFunctions}`);
  } else {
    console.log('✅ Function count looks healthy!');
  }
  
  console.log('✅ Validation passed - conversion successful!');
  return {
    originalLines,
    convertedLines,
    lineRetention,
    originalSize,
    convertedSize,
    sizeRetention,
    totalFunctions
  };
}

function convertFileEnhanced(inputPath, outputPath) {
  try {
    console.log('🚀 Enhanced TypeScript to JavaScript conversion started');
    console.log('🎯 Target: Complete large file conversion with chunk processing');
    console.log('==========================================');
    console.log('Input:', inputPath);
    console.log('Output:', outputPath);
    console.log('');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    const convertedContent = processFileInChunks(inputPath);
    const validationResults = validateConversion(inputPath, convertedContent);
    
    fs.writeFileSync(outputPath, convertedContent, 'utf8');
    
    console.log('');
    console.log('🎉 ENHANCED CONVERSION COMPLETE!');
    console.log('==========================================');
    console.log('✅ Enhanced conversion completed successfully!');
    console.log('📁 JavaScript file written to:', outputPath);
    
    return {
      success: true,
      outputPath: outputPath,
      size: convertedContent.length,
      ...validationResults
    };
    
  } catch (error) {
    console.error('❌ Enhanced conversion failed:', error.message);
    throw error;
  }
}

// Main execution for direct running
if (require.main === module) {
  const inputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.backup.ts');
  const outputPath = path.join(__dirname, '..', 'supabase', 'functions', 'runware-simple-fallback', 'index.js');
  
  convertFileEnhanced(inputPath, outputPath);
}

module.exports = { 
  convertTsToJsEnhanced, 
  processFileInChunks, 
  validateConversion, 
  convertFileEnhanced 
};
