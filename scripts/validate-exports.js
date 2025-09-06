#!/usr/bin/env node

/**
 * Export Validation Script
 * Detects duplicate exports and common export issues that could cause edge function failures
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const EXPORT_PATTERNS = [
  /export\s+const\s+(\w+)/g,
  /export\s+function\s+(\w+)/g,
  /export\s+class\s+(\w+)/g,
  /export\s+interface\s+(\w+)/g,
  /export\s+type\s+(\w+)/g,
  /export\s+enum\s+(\w+)/g,
  /export\s+\{\s*([^}]+)\s*\}/g,
];

const DEFAULT_EXPORT_PATTERN = /export\s+default/g;

function extractExports(content, filePath) {
  const exports = new Set();
  const lines = content.split('\n');
  const issues = [];

  EXPORT_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const exportName = match[1];
      
      if (exportName.includes(',')) {
        // Handle destructured exports like: export { a, b, c }
        exportName.split(',').forEach(name => {
          const cleanName = name.trim().replace(/\s+as\s+\w+/, '');
          if (cleanName && exports.has(cleanName)) {
            issues.push({
              type: 'duplicate_export',
              name: cleanName,
              file: filePath,
              line: findLineNumber(content, match.index)
            });
          } else if (cleanName) {
            exports.add(cleanName);
          }
        });
      } else if (exportName) {
        if (exports.has(exportName)) {
          issues.push({
            type: 'duplicate_export',
            name: exportName,
            file: filePath,
            line: findLineNumber(content, match.index)
          });
        } else {
          exports.add(exportName);
        }
      }
    }
  });

  // Check for multiple default exports
  const defaultExports = [...content.matchAll(DEFAULT_EXPORT_PATTERN)];
  if (defaultExports.length > 1) {
    issues.push({
      type: 'multiple_default_exports',
      file: filePath,
      count: defaultExports.length
    });
  }

  return { exports: Array.from(exports), issues };
}

function findLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

async function validateExports() {
  console.log('🔍 Validating exports across the project...\n');
  
  const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/*.d.ts'] });
  let totalIssues = 0;
  const allExports = new Map();

  for (const file of files) {
    if (!existsSync(file)) continue;
    
    try {
      const content = readFileSync(file, 'utf8');
      const { exports, issues } = extractExports(content, file);
      
      // Track cross-file export conflicts
      exports.forEach(exportName => {
        if (!allExports.has(exportName)) {
          allExports.set(exportName, []);
        }
        allExports.get(exportName).push(file);
      });

      if (issues.length > 0) {
        console.log(`❌ Issues found in ${file}:`);
        issues.forEach(issue => {
          totalIssues++;
          if (issue.type === 'duplicate_export') {
            console.log(`   - Duplicate export "${issue.name}" at line ${issue.line}`);
          } else if (issue.type === 'multiple_default_exports') {
            console.log(`   - Multiple default exports (${issue.count} found)`);
          }
        });
        console.log();
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  // Check for cross-file export name conflicts
  console.log('🔍 Checking for cross-file export conflicts...\n');
  allExports.forEach((files, exportName) => {
    if (files.length > 1) {
      console.log(`⚠️  Export name "${exportName}" used in multiple files:`);
      files.forEach(file => console.log(`   - ${file}`));
      console.log();
      totalIssues++;
    }
  });

  if (totalIssues === 0) {
    console.log('✅ No export issues found!');
  } else {
    console.log(`❌ Found ${totalIssues} export issues that need to be resolved.`);
    process.exit(1);
  }
}

// Check if this is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateExports().catch(console.error);
}

export { validateExports };