const fs = require('fs');
const path = require('path');

/**
 * Sophisticated JavaScript to TypeScript Converter
 * Handles large files (6,000+ lines) with advanced type inference
 */

class JSToTSConverter {
  constructor() {
    this.typeInferences = new Map();
    this.importMappings = new Map();
    this.functionSignatures = new Map();
    this.objectShapes = new Map();
    this.conversionLog = [];
    this.errorCount = 0;
    this.warningCount = 0;
  }

  /**
   * Main conversion function
   */
  async convertFile(inputPath, outputPath) {
    console.log('🚀 Starting sophisticated JS to TS conversion');
    console.log('==========================================');
    console.log(`Source: ${inputPath}`);
    console.log(`Target: ${outputPath}`);
    
    try {
      // Read and validate input file
      const jsContent = await this.readAndValidateFile(inputPath);
      const fileSize = jsContent.length;
      const lineCount = jsContent.split('\n').length;
      
      console.log(`📊 File Analysis:`);
      console.log(`   Lines: ${lineCount.toLocaleString()}`);
      console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
      
      // Progressive conversion with multiple passes
      console.log('\n🔍 Phase 1: Analyzing structure and imports...');
      const analyzedContent = await this.analyzeStructure(jsContent);
      
      console.log('🧠 Phase 2: Inferring types from usage patterns...');
      const typeInferredContent = await this.inferTypes(analyzedContent);
      
      console.log('🔗 Phase 3: Resolving import chains and dependencies...');
      const resolvedContent = await this.resolveImports(typeInferredContent);
      
      console.log('📝 Phase 4: Converting JSDoc to TypeScript interfaces...');
      const interfaceContent = await this.convertJSDocToInterfaces(resolvedContent);
      
      console.log('🛠️ Phase 5: Adding type annotations and cleanup...');
      const finalContent = await this.addTypeAnnotations(interfaceContent);
      
      console.log('✅ Phase 6: Validating and optimizing output...');
      const validatedContent = await this.validateAndOptimize(finalContent);
      
      // Write the converted file
      await this.writeFile(outputPath, validatedContent);
      
      // Generate conversion report
      await this.generateReport(inputPath, outputPath, jsContent, validatedContent);
      
      return validatedContent;
      
    } catch (error) {
      console.error('❌ Conversion failed:', error.message);
      throw error;
    }
  }

  /**
   * Read and validate input file
   */
  async readAndValidateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Source file not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) {
      throw new Error('Source file is empty');
    }
    
    return content;
  }

  /**
   * Phase 1: Analyze file structure and prepare for conversion
   */
  async analyzeStructure(content) {
    this.log('Analyzing file structure...');
    
    // Extract all function declarations and their contexts
    const functionRegex = /(?:async\s+)?function\s+(\w+)\s*\([^)]*\)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1] || match[2];
      this.analyzeFunctionSignature(content, functionName, match.index);
    }
    
    // Extract object definitions and their shapes
    this.analyzeObjectShapes(content);
    
    // Extract import statements and map dependencies
    this.analyzeImports(content);
    
    return content;
  }

  /**
   * Analyze function signatures for type inference
   */
  analyzeFunctionSignature(content, functionName, startIndex) {
    try {
      // Find the function's full context
      const lines = content.split('\n');
      const startLine = content.substring(0, startIndex).split('\n').length - 1;
      
      // Analyze parameters and return patterns
      const functionBlock = this.extractFunctionBlock(content, startIndex);
      const paramTypes = this.inferParameterTypes(functionBlock);
      const returnType = this.inferReturnType(functionBlock);
      
      this.functionSignatures.set(functionName, {
        parameters: paramTypes,
        returnType: returnType,
        isAsync: functionBlock.includes('async'),
        line: startLine
      });
      
      this.log(`Function analyzed: ${functionName} -> ${returnType}`);
    } catch (error) {
      this.warn(`Could not analyze function ${functionName}: ${error.message}`);
    }
  }

  /**
   * Extract function block for analysis
   */
  extractFunctionBlock(content, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    let functionContent = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
      }
      
      if (inFunction) {
        functionContent += char;
      }
      
      if (inFunction && braceCount === 0) {
        break;
      }
    }
    
    return functionContent;
  }

  /**
   * Infer parameter types from usage patterns
   */
  inferParameterTypes(functionBlock) {
    const paramTypes = new Map();
    
    // Look for parameter usage patterns
    const paramRegex = /(?:function\s*\(([^)]*)\)|\(([^)]*)\)\s*=>)/;
    const match = paramRegex.exec(functionBlock);
    
    if (match) {
      const params = (match[1] || match[2]).split(',').map(p => p.trim());
      
      params.forEach(param => {
        if (param) {
          const cleanParam = param.replace(/[{}[\]]/g, '').trim();
          const type = this.inferTypeFromUsage(functionBlock, cleanParam);
          paramTypes.set(cleanParam, type);
        }
      });
    }
    
    return paramTypes;
  }

  /**
   * Infer return type from function content
   */
  inferReturnType(functionBlock) {
    // Check for explicit return statements
    const returnMatches = functionBlock.match(/return\s+([^;}\n]+)/g);
    
    if (!returnMatches) {
      return 'void';
    }
    
    // Analyze return patterns
    const returnTypes = new Set();
    
    returnMatches.forEach(returnStmt => {
      const value = returnStmt.replace('return', '').trim();
      const type = this.inferTypeFromValue(value);
      returnTypes.add(type);
    });
    
    // Handle async functions
    if (functionBlock.includes('async') || functionBlock.includes('await')) {
      const innerType = returnTypes.size === 1 ? [...returnTypes][0] : 'any';
      return `Promise<${innerType}>`;
    }
    
    // Return union type if multiple types detected
    if (returnTypes.size > 1) {
      return [...returnTypes].join(' | ');
    }
    
    return returnTypes.size === 1 ? [...returnTypes][0] : 'any';
  }

  /**
   * Infer type from variable usage patterns
   */
  inferTypeFromUsage(content, varName) {
    // Look for assignment patterns
    const assignmentRegex = new RegExp(`${varName}\\s*=\\s*([^;,\\n}]+)`, 'g');
    const usageRegex = new RegExp(`${varName}\\.([a-zA-Z_$][a-zA-Z0-9_$]*)`, 'g');
    const indexRegex = new RegExp(`${varName}\\[`, 'g');
    
    let hasObjectAccess = usageRegex.test(content);
    let hasArrayAccess = indexRegex.test(content);
    
    if (hasArrayAccess && hasObjectAccess) {
      return 'any[]';
    } else if (hasArrayAccess) {
      return 'any[]';
    } else if (hasObjectAccess) {
      return 'object';
    }
    
    // Check assignment patterns
    const assignMatch = assignmentRegex.exec(content);
    if (assignMatch) {
      return this.inferTypeFromValue(assignMatch[1]);
    }
    
    return 'any';
  }

  /**
   * Infer type from literal values
   */
  inferTypeFromValue(value) {
    value = value.trim();
    
    // Handle common patterns
    if (value === 'null' || value === 'undefined') return 'null';
    if (value === 'true' || value === 'false') return 'boolean';
    if (/^['"`]/.test(value)) return 'string';
    if (/^\d+$/.test(value)) return 'number';
    if (/^\d*\.\d+$/.test(value)) return 'number';
    if (value.startsWith('[')) return 'any[]';
    if (value.startsWith('{')) return 'object';
    if (value.includes('new ')) return 'object';
    if (value.includes('await ')) return 'Promise<any>';
    
    return 'any';
  }

  /**
   * Analyze object shapes for interface generation
   */
  analyzeObjectShapes(content) {
    // Find object literals and their structures
    const objectRegex = /(\w+)\s*[:=]\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = objectRegex.exec(content)) !== null) {
      const objName = match[1];
      const objContent = match[2];
      
      const shape = this.parseObjectShape(objContent);
      this.objectShapes.set(objName, shape);
    }
  }

  /**
   * Parse object shape for interface generation
   */
  parseObjectShape(objContent) {
    const properties = new Map();
    const propRegex = /(\w+)\s*:\s*([^,}]+)/g;
    let match;
    
    while ((match = propRegex.exec(objContent)) !== null) {
      const propName = match[1];
      const propValue = match[2].trim();
      const propType = this.inferTypeFromValue(propValue);
      
      properties.set(propName, propType);
    }
    
    return properties;
  }

  /**
   * Analyze imports and dependencies
   */
  analyzeImports(content) {
    const importRegex = /(?:import\s+.*?from\s+['"`]([^'"`]+)['"`]|require\s*\(\s*['"`]([^'"`]+)['"`]\))/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      
      // Map .js imports to .ts
      if (importPath.endsWith('.js')) {
        const tsPath = importPath.replace('.js', '.ts');
        this.importMappings.set(importPath, tsPath);
      }
    }
  }

  /**
   * Phase 2: Infer types from usage patterns
   */
  async inferTypes(content) {
    this.log('Inferring types from usage patterns...');
    
    // This phase uses the analysis from Phase 1 to add type annotations
    let result = content;
    
    // Add type annotations to function parameters
    for (const [funcName, signature] of this.functionSignatures.entries()) {
      result = this.addFunctionTypeAnnotations(result, funcName, signature);
    }
    
    return result;
  }

  /**
   * Add type annotations to function signatures
   */
  addFunctionTypeAnnotations(content, functionName, signature) {
    try {
      // Create typed parameter list
      const typedParams = [];
      for (const [paramName, paramType] of signature.parameters.entries()) {
        typedParams.push(`${paramName}: ${paramType}`);
      }
      
      const returnType = signature.returnType;
      const asyncModifier = signature.isAsync ? 'async ' : '';
      
      // Replace function declaration with typed version
      const functionRegex = new RegExp(
        `(${asyncModifier}function\\s+${functionName}\\s*)\\([^)]*\\)(\\s*\\{)`,
        'g'
      );
      
      const replacement = `$1(${typedParams.join(', ')}): ${returnType}$2`;
      
      return content.replace(functionRegex, replacement);
    } catch (error) {
      this.warn(`Could not add type annotations to ${functionName}: ${error.message}`);
      return content;
    }
  }

  /**
   * Phase 3: Resolve imports and dependencies
   */
  async resolveImports(content) {
    this.log('Resolving import chains...');
    
    let result = content;
    
    // Update import paths from .js to .ts
    for (const [jsPath, tsPath] of this.importMappings.entries()) {
      const importRegex = new RegExp(`(['"\`])${jsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
      result = result.replace(importRegex, `$1${tsPath}$1`);
      this.log(`Updated import: ${jsPath} -> ${tsPath}`);
    }
    
    return result;
  }

  /**
   * Phase 4: Convert JSDoc to TypeScript interfaces
   */
  async convertJSDocToInterfaces(content) {
    this.log('Converting JSDoc to TypeScript interfaces...');
    
    let result = content;
    let interfaces = '';
    
    // Extract JSDoc comments and convert to interfaces
    const jsdocRegex = /\/\*\*\s*\n([\s\S]*?)\*\//g;
    let match;
    
    while ((match = jsdocRegex.exec(content)) !== null) {
      const jsdocContent = match[1];
      const interfaceCode = this.convertJSDocToInterface(jsdocContent);
      
      if (interfaceCode) {
        interfaces += interfaceCode + '\n\n';
      }
    }
    
    // Add interfaces at the top of the file
    if (interfaces) {
      const importSection = this.extractImportSection(result);
      const restOfFile = result.replace(importSection, '').trim();
      
      result = importSection + '\n\n// Generated TypeScript Interfaces\n' + interfaces + restOfFile;
    }
    
    return result;
  }

  /**
   * Convert JSDoc comment to TypeScript interface
   */
  convertJSDocToInterface(jsdocContent) {
    // Look for @param and @returns patterns
    const paramRegex = /@param\s+\{([^}]+)\}\s+(\w+)\s*-?\s*(.*)/g;
    const returnsRegex = /@returns?\s+\{([^}]+)\}\s*(.*)/g;
    
    let interfaceProperties = [];
    let match;
    
    while ((match = paramRegex.exec(jsdocContent)) !== null) {
      const type = this.convertJSDocType(match[1]);
      const name = match[2];
      const description = match[3] || '';
      
      interfaceProperties.push(`  /** ${description} */\n  ${name}: ${type};`);
    }
    
    if (interfaceProperties.length > 0) {
      const interfaceName = `GeneratedInterface${Date.now()}`;
      return `interface ${interfaceName} {\n${interfaceProperties.join('\n')}\n}`;
    }
    
    return null;
  }

  /**
   * Convert JSDoc type notation to TypeScript
   */
  convertJSDocType(jsdocType) {
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'object',
      'array': 'any[]',
      'Object': 'object',
      'Array': 'any[]',
      'Function': 'Function',
      '*': 'any'
    };
    
    return typeMap[jsdocType] || jsdocType;
  }

  /**
   * Phase 5: Add type annotations and cleanup
   */
  async addTypeAnnotations(content) {
    this.log('Adding final type annotations...');
    
    let result = content;
    
    // Add explicit type annotations for common patterns
    result = this.addVariableTypeAnnotations(result);
    result = this.addReturnTypeAnnotations(result);
    result = this.cleanupSyntax(result);
    
    return result;
  }

  /**
   * Add type annotations to variable declarations
   */
  addVariableTypeAnnotations(content) {
    // Add types to const/let/var declarations where obvious
    const varRegex = /((?:const|let|var)\s+)(\w+)(\s*=\s*)([^;,\n]+)/g;
    
    return content.replace(varRegex, (match, declaration, varName, equals, value) => {
      const inferredType = this.inferTypeFromValue(value);
      
      // Only add type annotation if it's not 'any' and would be helpful
      if (inferredType !== 'any' && !varName.includes('Type')) {
        return `${declaration}${varName}: ${inferredType}${equals}${value}`;
      }
      
      return match;
    });
  }

  /**
   * Add return type annotations
   */
  addReturnTypeAnnotations(content) {
    // This is handled in the function signature analysis
    return content;
  }

  /**
   * Clean up TypeScript syntax
   */
  cleanupSyntax(content) {
    let result = content;
    
    // Remove duplicate type annotations
    result = result.replace(/:\s*any\s*:\s*any/g, ': any');
    
    // Clean up spacing around type annotations
    result = result.replace(/\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$|<>\[\]]*)\s*/g, ': $1 ');
    
    // Remove trailing spaces
    result = result.replace(/[ \t]+$/gm, '');
    
    // Normalize line endings
    result = result.replace(/\r\n/g, '\n');
    
    return result;
  }

  /**
   * Phase 6: Validate and optimize output
   */
  async validateAndOptimize(content) {
    this.log('Validating and optimizing output...');
    
    // Basic syntax validation
    try {
      // Check for balanced braces, brackets, and parentheses
      this.validateBrackets(content);
      
      // Check for valid TypeScript syntax patterns
      this.validateTypeScriptSyntax(content);
      
      this.log('✅ Validation passed');
    } catch (error) {
      this.warn(`Validation warning: ${error.message}`);
    }
    
    return content;
  }

  /**
   * Validate bracket matching
   */
  validateBrackets(content) {
    const brackets = { '{': '}', '[': ']', '(': ')' };
    const stack = [];
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (brackets[char]) {
        stack.push(brackets[char]);
      } else if (Object.values(brackets).includes(char)) {
        if (!stack.length || stack.pop() !== char) {
          throw new Error(`Mismatched bracket at position ${i}`);
        }
      }
    }
    
    if (stack.length > 0) {
      throw new Error('Unclosed brackets detected');
    }
  }

  /**
   * Basic TypeScript syntax validation
   */
  validateTypeScriptSyntax(content) {
    // Check for common TypeScript syntax errors
    const invalidPatterns = [
      /:\s*:\s*/, // Double colons
      /=\s*:\s*/, // Assignment followed by type annotation
      /\s+:\s*$/, // Type annotation at end of line
    ];
    
    invalidPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        throw new Error(`Invalid TypeScript syntax pattern ${index + 1} detected`);
      }
    });
  }

  /**
   * Extract import section from file
   */
  extractImportSection(content) {
    const lines = content.split('\n');
    let importLines = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('import ') || line.trim().startsWith('const ') && line.includes('require(')) {
        importLines.push(line);
      } else if (line.trim() === '' && importLines.length > 0) {
        importLines.push(line);
      } else if (importLines.length > 0 && line.trim() !== '') {
        break;
      }
    }
    
    return importLines.join('\n');
  }

  /**
   * Write converted file
   */
  async writeFile(outputPath, content) {
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create backup if file exists
    if (fs.existsSync(outputPath)) {
      const backupPath = outputPath + '.backup';
      fs.copyFileSync(outputPath, backupPath);
      this.log(`Created backup: ${backupPath}`);
    }
    
    fs.writeFileSync(outputPath, content, 'utf8');
    this.log(`✅ File written successfully: ${outputPath}`);
  }

  /**
   * Generate comprehensive conversion report
   */
  async generateReport(inputPath, outputPath, originalContent, convertedContent) {
    const originalLines = originalContent.split('\n').length;
    const convertedLines = convertedContent.split('\n').length;
    const originalSize = originalContent.length;
    const convertedSize = convertedContent.length;
    
    console.log('\n📊 CONVERSION REPORT');
    console.log('=====================');
    console.log(`✅ Conversion completed successfully`);
    console.log(`📁 Source: ${path.basename(inputPath)}`);
    console.log(`📁 Target: ${path.basename(outputPath)}`);
    console.log(`📏 Lines: ${originalLines.toLocaleString()} → ${convertedLines.toLocaleString()}`);
    console.log(`📦 Size: ${(originalSize / 1024).toFixed(2)} KB → ${(convertedSize / 1024).toFixed(2)} KB`);
    console.log(`🔧 Functions processed: ${this.functionSignatures.size}`);
    console.log(`📦 Objects analyzed: ${this.objectShapes.size}`);
    console.log(`🔗 Imports updated: ${this.importMappings.size}`);
    console.log(`⚠️  Warnings: ${this.warningCount}`);
    console.log(`❌ Errors: ${this.errorCount}`);
    
    if (this.conversionLog.length > 0) {
      console.log('\n📝 Conversion Log:');
      this.conversionLog.forEach(entry => console.log(`   ${entry}`));
    }
    
    console.log('\n🎉 TypeScript conversion complete!');
  }

  /**
   * Logging utilities
   */
  log(message) {
    this.conversionLog.push(`ℹ️  ${message}`);
    console.log(`   ${message}`);
  }

  warn(message) {
    this.warningCount++;
    this.conversionLog.push(`⚠️  ${message}`);
    console.log(`   ⚠️  ${message}`);
  }

  error(message) {
    this.errorCount++;
    this.conversionLog.push(`❌ ${message}`);
    console.log(`   ❌ ${message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const converter = new JSToTSConverter();
    
    // Define input and output paths
    const inputPath = path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'arcManager.js');
    const outputPath = path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'arcManager.ts');
    
    console.log('🔄 JavaScript to TypeScript Converter');
    console.log('=====================================');
    console.log('Advanced conversion with type inference for large files');
    console.log('');
    
    // Perform the conversion
    await converter.convertFile(inputPath, outputPath);
    
    console.log('\n✨ Conversion process completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Conversion failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { JSToTSConverter };