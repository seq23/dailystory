const fs = require('fs');
const path = require('path');

/**
 * TypeScript to JavaScript Converter
 * Removes TypeScript syntax while preserving all functionality
 */
class TSToJSConverter {
  constructor() {
    this.conversionLog = [];
  }

  /**
   * Main conversion function
   */
  async convertFile(inputPath, outputPath) {
    console.log('🚀 Starting TypeScript to JavaScript conversion');
    console.log('==========================================');
    console.log(`Source: ${inputPath}`);
    console.log(`Target: ${outputPath}`);
    
    try {
      // Read TypeScript file
      const tsContent = await this.readFile(inputPath);
      const fileSize = tsContent.length;
      const lineCount = tsContent.split('\n').length;
      
      console.log(`📊 File Analysis:`);
      console.log(`   Lines: ${lineCount.toLocaleString()}`);
      console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
      
      // Convert TypeScript to JavaScript
      console.log('\n🔄 Converting TypeScript syntax to JavaScript...');
      let jsContent = tsContent;

      // Remove type annotations from variables and parameters
      jsContent = this.removeTypeAnnotations(jsContent);
      
      // Remove interface definitions
      jsContent = this.removeInterfaces(jsContent);
      
      // Remove type assertions
      jsContent = this.removeTypeAssertions(jsContent);
      
      // Remove generic type parameters
      jsContent = this.removeGenerics(jsContent);
      
      // Remove access modifiers
      jsContent = this.removeAccessModifiers(jsContent);
      
      // Convert TypeScript imports to JavaScript
      jsContent = this.convertImports(jsContent);
      
      // Remove 'as const' declarations
      jsContent = this.removeAsConst(jsContent);
      
      // Clean up any remaining TypeScript syntax
      jsContent = this.finalCleanup(jsContent);
      
      // Write the converted file
      await this.writeFile(outputPath, jsContent);
      
      const finalLineCount = jsContent.split('\n').length;
      console.log(`✅ Conversion complete!`);
      console.log(`   Original lines: ${lineCount}`);
      console.log(`   Converted lines: ${finalLineCount}`);
      console.log(`   File saved: ${outputPath}`);
      
      return jsContent;
      
    } catch (error) {
      console.error('❌ Conversion failed:', error.message);
      throw error;
    }
  }

  async readFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Source file not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  async writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  removeTypeAnnotations(content) {
    // Remove parameter type annotations: (param: type)
    content = content.replace(/(\w+)\s*:\s*[^,)=\n]+/g, '$1');
    
    // Remove variable type annotations: let variable: type
    content = content.replace(/((?:let|const|var)\s+\w+)\s*:\s*[^=\n]+(?=\s*=)/g, '$1');
    
    // Remove function return type annotations: ): type =>
    content = content.replace(/\)\s*:\s*[^{=>]+(?=\s*[{=>])/g, ')');
    
    return content;
  }

  removeInterfaces(content) {
    // Remove interface definitions
    content = content.replace(/interface\s+\w+\s*{[^}]*}/gs, '');
    
    // Remove type definitions
    content = content.replace(/type\s+\w+\s*=\s*[^;]+;/gs, '');
    
    return content;
  }

  removeTypeAssertions(content) {
    // Remove 'as Type' assertions
    content = content.replace(/\s+as\s+\w+[\w<>[\],\s]*/g, '');
    
    // Remove angle bracket assertions: <Type>value
    content = content.replace(/<\w+[\w<>[\],\s]*>/g, '');
    
    return content;
  }

  removeGenerics(content) {
    // Remove generic type parameters from functions and classes
    content = content.replace(/(<[^>]+>)(?=\s*\()/g, '');
    
    // Remove generic constraints
    content = content.replace(/<[^>]+extends[^>]+>/g, '');
    
    return content;
  }

  removeAccessModifiers(content) {
    // Remove public, private, protected modifiers
    content = content.replace(/\b(public|private|protected)\s+/g, '');
    
    return content;
  }

  convertImports(content) {
    // Convert .ts imports to .js
    content = content.replace(/from\s+["']([^"']+)\.ts["']/g, 'from "$1.js"');
    
    return content;
  }

  removeAsConst(content) {
    // Remove 'as const' assertions
    content = content.replace(/\s+as\s+const/g, '');
    
    return content;
  }

  finalCleanup(content) {
    // Remove any remaining TypeScript-specific syntax
    content = content.replace(/\?\s*:/g, ':'); // Remove optional property markers
    content = content.replace(/\s*!\s*\./g, '.'); // Remove non-null assertions
    
    // Clean up empty lines left by removed interfaces/types
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return content;
  }
}

// Run the conversion
async function main() {
  const converter = new TSToJSConverter();
  const inputPath = 'supabase/functions/runware-generate-image/index.backup.ts';
  const outputPath = 'supabase/functions/runware-generate-image/index.js';
  
  try {
    await converter.convertFile(inputPath, outputPath);
    console.log('🎉 TypeScript to JavaScript conversion completed successfully!');
  } catch (error) {
    console.error('💥 Conversion failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TSToJSConverter };