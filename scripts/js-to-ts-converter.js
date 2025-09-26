const fs = require('fs');
const path = require('path');

/**
 * JavaScript to TypeScript Converter
 * Adds TypeScript syntax while preserving all functionality
 */
class JSToTSConverter {
  constructor() {
    this.conversionLog = [];
  }

  /**
   * Main conversion function
   */
  async convertFile(inputPath, outputPath) {
    console.log('🚀 Starting JavaScript to TypeScript conversion');
    console.log('==========================================');
    console.log(`Source: ${inputPath}`);
    console.log(`Target: ${outputPath}`);
    
    try {
      // Read JavaScript file
      const jsContent = await this.readFile(inputPath);
      const fileSize = jsContent.length;
      const lineCount = jsContent.split('\n').length;
      
      console.log(`📊 File Analysis:`);
      console.log(`   Lines: ${lineCount.toLocaleString()}`);
      console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
      
      // Convert JavaScript to TypeScript
      console.log('\n🔄 Converting JavaScript syntax to TypeScript...');
      let tsContent = jsContent;

      // Add TypeScript imports and interfaces
      tsContent = this.addTypeImports(tsContent);
      
      // Add interface definitions
      tsContent = this.addInterfaces(tsContent);
      
      // Add function type annotations
      tsContent = this.addFunctionTypes(tsContent);
      
      // Add variable type annotations
      tsContent = this.addVariableTypes(tsContent);
      
      // Add object type annotations
      tsContent = this.addObjectTypes(tsContent);
      
      // Add error handling types
      tsContent = this.addErrorTypes(tsContent);
      
      // Clean up and finalize TypeScript syntax
      tsContent = this.finalTypeScriptCleanup(tsContent);
      
      // Write the converted file
      await this.writeFile(outputPath, tsContent);
      
      const finalLineCount = tsContent.split('\n').length;
      console.log(`✅ Conversion complete!`);
      console.log(`   Original lines: ${lineCount}`);
      console.log(`   Converted lines: ${finalLineCount}`);
      console.log(`   File saved: ${outputPath}`);
      
      return tsContent;
      
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

  addTypeImports(content) {
    // Add TypeScript type imports after the existing imports
    const importRegex = /(import.*from.*["'];?\n)/g;
    const imports = content.match(importRegex) || [];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const typeImports = `
// TypeScript type imports
import type { UserInfo, SessionId } from "../_shared/types/index.ts";

`;
      content = content.replace(lastImport, lastImport + typeImports);
    }
    
    return content;
  }

  addInterfaces(content) {
    // Add interface definitions after imports
    const interfaces = `
// TypeScript interface definitions
interface TierLogger {
  t1: (msg: string, ctx?: Record<string, any>) => void;
  t2: (msg: string, ctx?: Record<string, any>) => void;
  attempt: (tier: string, ctx?: Record<string, any>) => void;
  success: (tier: string, ctx?: Record<string, any>) => void;
  failure: (tier: string, ctx?: Record<string, any>) => void;
}

interface CircuitBreakerConfig {
  DIRECT_MODE: number;
  TIER_1: number;
  AI_GENERATION: number;
  RUNWARE_API: number;
}

interface ErrorContext {
  sessionId?: string;
  requestId?: string;
  details?: any;
}

interface ValidationPayload {
  pageText?: string;
  storyText?: string;
  sessionId?: string;
  userInfo?: UserInfo;
}

interface StyleFramework {
  name: string;
  frameworkPrompt: string;
}

interface EdgeError {
  type: string;
  message: string;
  functionName: string;
  timestamp: number;
  details?: any;
  sessionId?: string;
  category: string;
}

interface BootStatus {
  status: string;
  reason?: string;
  timestamp?: string;
  services?: Record<string, any>;
}

`;

    // Insert interfaces after the imports section
    const insertPoint = content.indexOf('// ============================================================================');
    if (insertPoint !== -1) {
      content = content.slice(0, insertPoint) + interfaces + content.slice(insertPoint);
    }
    
    return content;
  }

  addFunctionTypes(content) {
    // Add type annotations to functions
    content = content.replace(
      /function bindTierLogger\(([^)]+)\)/,
      'function bindTierLogger(supabaseClient: any, sessionId: SessionId, requestId: string, authHeader: string | null = null): TierLogger'
    );
    
    content = content.replace(
      /function validatePayloadFast\(([^)]+)\)/,
      'function validatePayloadFast(payload: ValidationPayload): boolean'
    );
    
    content = content.replace(
      /function shouldFailFast\(([^)]+)\)/,
      'function shouldFailFast(error: any): boolean'
    );
    
    content = content.replace(
      /function validatePrimarySceneQuality\(([^)]+)\)/,
      'function validatePrimarySceneQuality(scene: string): boolean'
    );
    
    content = content.replace(
      /function validateImageURL\(([^)]+)\)/,
      'function validateImageURL(url: string): boolean'
    );
    
    content = content.replace(
      /function shouldEscalateToTier25\(([^)]+)\)/,
      'function shouldEscalateToTier25(error: any): boolean'
    );
    
    content = content.replace(
      /function getNuclearStyleFramework\(([^)]+)\)/,
      'function getNuclearStyleFramework(difficulty: string): StyleFramework'
    );
    
    content = content.replace(
      /function generateInlineNuclearNegative\(([^)]+)\)/,
      'function generateInlineNuclearNegative(culturalProfile: string, avatarType: string, difficulty: string): string'
    );
    
    content = content.replace(
      /function generateContextSummary\(([^)]+)\)/,
      'function generateContextSummary(text: string): string'
    );
    
    // Add async function types
    content = content.replace(
      /async function tryNuclearTemplates\(/,
      'async function tryNuclearTemplates('
    );
    
    content = content.replace(
      /async function handleRequest\(([^)]+)\)/,
      'async function handleRequest(req: Request): Promise<Response>'
    );
    
    return content;
  }

  addVariableTypes(content) {
    // Add type annotations to key variables
    content = content.replace(
      /const TIER_TIMEOUTS = {/,
      'const TIER_TIMEOUTS: CircuitBreakerConfig = {'
    );
    
    content = content.replace(
      /const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {/,
      'const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS: Record<string, StyleFramework> = {'
    );
    
    return content;
  }

  addObjectTypes(content) {
    // Add type annotations to object parameters and returns
    content = content.replace(
      /static handleError\(error, functionName, context = {}\)/,
      'static handleError(error: any, functionName: string, context: ErrorContext = {}): Response'
    );
    
    content = content.replace(
      /static categorizeError\(error, functionName\)/,
      'static categorizeError(error: any, functionName: string): string'
    );
    
    content = content.replace(
      /static getEscalationTarget\(category\)/,
      'static getEscalationTarget(category: string): string'
    );
    
    content = content.replace(
      /static getHttpStatusCode\(errorType\)/,
      'static getHttpStatusCode(errorType: string): number'
    );
    
    return content;
  }

  addErrorTypes(content) {
    // Add proper error handling types
    content = content.replace(
      /catch \(error\)/g,
      'catch (error: any)'
    );
    
    content = content.replace(
      /catch \(err\)/g,
      'catch (err: any)'
    );
    
    return content;
  }

  finalTypeScriptCleanup(content) {
    // Clean up any remaining JavaScript patterns and add TypeScript equivalents
    
    // Add proper return types for class methods
    content = content.replace(
      /static async validateBoot\(\)/,
      'static async validateBoot(): Promise<BootStatus>'
    );
    
    content = content.replace(
      /static getService\(name\)/,
      'static getService(name: string): any'
    );
    
    content = content.replace(
      /static isHealthy\(\)/,
      'static isHealthy(): boolean'
    );
    
    // Add proper Map and class property types
    content = content.replace(
      /static errorCounts = new Map\(\);/,
      'static errorCounts: Map<string, number> = new Map();'
    );
    
    content = content.replace(
      /static performanceMetrics = \[\];/,
      'static performanceMetrics: any[] = [];'
    );
    
    content = content.replace(
      /static bootStatus = null;/,
      'static bootStatus: BootStatus | null = null;'
    );
    
    content = content.replace(
      /static criticalServices = new Map\(\);/,
      'static criticalServices: Map<string, any> = new Map();'
    );
    
    content = content.replace(
      /static nonCriticalServices = new Map\(\);/,
      'static nonCriticalServices: Map<string, any> = new Map();'
    );
    
    content = content.replace(
      /static services = new Map\(\);/,
      'static services: Map<string, any> = new Map();'
    );
    
    content = content.replace(
      /static inFlight = new Map\(\);/,
      'static inFlight: Map<string, Promise<any>> = new Map();'
    );
    
    // Clean up multiple blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return content;
  }
}

// Run the conversion
async function main() {
  const converter = new JSToTSConverter();
  const inputPath = 'ai-visual-scene-creator.js.temp';
  const outputPath = 'ai-visual-scene-creator.ts.temp';
  
  try {
    await converter.convertFile(inputPath, outputPath);
    console.log('🎉 JavaScript to TypeScript conversion completed successfully!');
  } catch (error) {
    console.error('💥 Conversion failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { JSToTSConverter };