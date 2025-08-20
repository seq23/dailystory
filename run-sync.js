#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔄 Running frontend-to-backend sync...');
  const result = execSync('node scripts/sync-frontend-to-backend.js', { 
    cwd: process.cwd(), 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('✅ Sync completed successfully');
} catch (error) {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
}