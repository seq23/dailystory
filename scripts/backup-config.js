import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Backup script for supabase/config.toml
 * 
 * This script creates timestamped backups to protect against accidental truncation
 * during Supabase project reconnection or other operations.
 * 
 * Usage:
 *   node scripts/backup-config.js
 */

async function backupConfig() {
  const projectRoot = join(__dirname, '..');
  const configPath = join(projectRoot, 'supabase', 'config.toml');
  const backupDir = join(projectRoot, 'backups', 'config');
  
  console.log('🔒 Starting config.toml backup process...');
  
  // Check if source config exists
  if (!existsSync(configPath)) {
    console.error('❌ ERROR: supabase/config.toml not found!');
    process.exit(1);
  }
  
  // Create backup directory if it doesn't exist
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}`);
  }
  
  // Read current config
  const configContent = readFileSync(configPath, 'utf-8');
  
  // Validate config isn't truncated (should have more than just project_id)
  const lines = configContent.trim().split('\n');
  if (lines.length < 5) {
    console.warn('⚠️  WARNING: config.toml appears truncated (only ' + lines.length + ' lines)');
    console.warn('    This backup may not be complete!');
  }
  
  // Count functions in config
  const functionCount = (configContent.match(/\[functions\./g) || []).length;
  console.log(`📊 Config contains ${functionCount} edge functions`);
  
  // Create timestamped backup filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `config-backup-${timestamp}.toml`;
  const backupPath = join(backupDir, backupFilename);
  
  // Write backup
  writeFileSync(backupPath, configContent, 'utf-8');
  console.log(`✅ Backup created: ${backupFilename}`);
  
  // Verify backup
  const backupVerify = readFileSync(backupPath, 'utf-8');
  if (backupVerify === configContent) {
    console.log('✅ Backup verified successfully');
    console.log(`📦 Backup location: ${backupPath}`);
    
    // Create "latest" symlink backup
    const latestBackupPath = join(backupDir, 'config-latest.toml');
    writeFileSync(latestBackupPath, configContent, 'utf-8');
    console.log('✅ Latest backup updated: config-latest.toml');
  } else {
    console.error('❌ Backup verification FAILED!');
    process.exit(1);
  }
  
  console.log('\n🎉 Backup process completed successfully!');
}

// Run backup
backupConfig().catch(error => {
  console.error('❌ Backup failed:', error);
  process.exit(1);
});
