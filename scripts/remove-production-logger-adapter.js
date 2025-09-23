#!/usr/bin/env node

// Remove ProductionLogger adapter after successful migration
const fs = require('fs');
const path = require('path');

function removeProductionLoggerAdapter() {
  const adapterPath = 'src/services/ProductionLogger.ts';
  
  if (fs.existsSync(adapterPath)) {
    // Archive the adapter before removal
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = `src/services/ProductionLogger.archived.${timestamp}.ts`;
    
    const content = fs.readFileSync(adapterPath, 'utf8');
    const archivedContent = `// ARCHIVED: ${timestamp}
// This file was the ProductionLogger adapter during console cleanup migration
// It has been archived after successful completion of the cleanup

${content}`;
    
    fs.writeFileSync(archivePath, archivedContent, 'utf8');
    fs.unlinkSync(adapterPath);
    
    console.log(`✅ ProductionLogger adapter removed and archived to: ${archivePath}`);
    return true;
  } else {
    console.log('⚠️  ProductionLogger adapter not found - may have been removed already');
    return false;
  }
}

function cleanupImports() {
  const glob = require('glob');
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'src/**/*.test.{ts,tsx}' });
  let cleanedFiles = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Remove ProductionLogger/ProductionLogging imports
    content = content.replace(/import\s*\{\s*ProductionLogging?\s*\}\s*from\s*['"][^'"]*['"];\s*\n?/g, '');
    content = content.replace(/import\s*\{\s*[^}]*,\s*ProductionLogging?\s*\}\s*from\s*['"][^'"]*['"];\s*\n?/g, '');
    content = content.replace(/import\s*\{\s*ProductionLogging?\s*,\s*[^}]*\}\s*from\s*['"][^'"]*['"];\s*\n?/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      cleanedFiles++;
      console.log(`🧹 Cleaned imports from: ${file}`);
    }
  });
  
  console.log(`📊 Cleaned imports from ${cleanedFiles} files`);
}

if (require.main === module) {
  console.log('🗑️  Removing ProductionLogger adapter...');
  removeProductionLoggerAdapter();
  cleanupImports();
  console.log('✅ ProductionLogger adapter removal complete');
}

module.exports = { removeProductionLoggerAdapter, cleanupImports };