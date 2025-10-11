/**
 * AUTOMATED VENDOR IMPORT VALIDATION
 * Run this script to detect filename mismatches between vendor files and import statements
 * Usage: deno run --allow-read supabase/functions/_vendor/validate-vendor-imports.js
 */

const VENDOR_DIR = './supabase/functions/_vendor';
const FUNCTIONS_DIR = './supabase/functions';

async function validateVendorImports() {
  console.log('🔍 Validating vendor import paths...\n');
  
  // Step 1: List actual vendor files
  const vendorFiles = new Set();
  for await (const entry of Deno.readDir(VENDOR_DIR)) {
    if (entry.isFile && (entry.name.endsWith('.mjs') || entry.name.endsWith('.bundle.mjs'))) {
      vendorFiles.add(entry.name);
      console.log(`✅ Found vendor file: ${entry.name}`);
    }
  }
  
  console.log(`\n📦 Total vendor files: ${vendorFiles.size}\n`);
  
  // Step 2: Scan all function files for vendor imports
  const importPattern = /import.*['"]\.\.\/\.\.?\/_vendor\/([^'"]+)['"]/g;
  let issues = [];
  
  async function scanDirectory(dir) {
    for await (const entry of Deno.readDir(dir)) {
      const fullPath = `${dir}/${entry.name}`;
      
      if (entry.isDirectory) {
        await scanDirectory(fullPath);
      } else if (entry.isFile && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        const content = await Deno.readTextFile(fullPath);
        let match;
        
        while ((match = importPattern.exec(content)) !== null) {
          const importedFile = match[1];
          
          if (!vendorFiles.has(importedFile)) {
            issues.push({
              file: fullPath,
              importedFile,
              line: content.substring(0, match.index).split('\n').length
            });
          }
        }
      }
    }
  }
  
  await scanDirectory(FUNCTIONS_DIR);
  
  // Step 3: Report results
  if (issues.length === 0) {
    console.log('✅ All vendor imports are valid!\n');
    return true;
  } else {
    console.log(`❌ Found ${issues.length} invalid vendor import(s):\n`);
    
    issues.forEach(issue => {
      console.log(`  File: ${issue.file}:${issue.line}`);
      console.log(`  Importing: ${issue.importedFile}`);
      console.log(`  Issue: File does not exist in _vendor directory`);
      console.log('');
    });
    
    console.log('🔧 Available vendor files:');
    vendorFiles.forEach(file => console.log(`  - ${file}`));
    
    return false;
  }
}

// Run validation
const isValid = await validateVendorImports();
Deno.exit(isValid ? 0 : 1);
