# Image Generation Functions Deprecation Guide

## Deprecated TypeScript Image Generation Functions

⚠️ **CRITICAL: DO NOT DELETE UNTIL USER IS COMFORTABLE WITH NEW .JS FILES** ⚠️

The following TypeScript edge functions are **DEPRECATED** and should not be edited:

### 1. runware-generate-image/index.ts
- **Status**: DEPRECATED - DO NOT EDIT
- **Purpose**: Image generation orchestrator with tier-based fallback system
- **Migration Status**: Being replaced with JavaScript implementation

### 2. prompt-studio/index.ts  
- **Status**: DEPRECATED - DO NOT EDIT
- **Purpose**: Prompt enhancement and testing utility
- **Migration Status**: Functionality moved to main orchestrator

### 3. runware-diagnostic/index.ts
- **Status**: DEPRECATED - DO NOT EDIT  
- **Purpose**: Diagnostic and debugging tools for image generation
- **Migration Status**: Being replaced with simplified diagnostic tools

### 4. ai-visual-scene-creator/index.ts
- **Status**: ACTIVE BUT NEEDS JS MIGRATION
- **Purpose**: AI-powered prompt enhancement for image generation
- **Migration Status**: Currently active but being migrated to JavaScript

### 5. runware-simple-fallback/index.backup.ts
- **Status**: BACKUP - DO NOT DELETE
- **Purpose**: Tier 2.5 nuclear independence fallback system (backup copy)
- **Migration Status**: Backup file preserved until JS migration complete

## Developer Guidelines

### 🚨 DO NOT DELETE UNTIL USER IS COMFORTABLE WITH NEW .JS FILES 🚨
- **NEVER DELETE** any deprecated TypeScript files without explicit user confirmation
- Keep all files until new JavaScript implementations are proven stable
- Files serve as backup during migration process and debugging

### DO NOT EDIT
- Never modify any of the deprecated TypeScript files
- All functionality is being migrated to JavaScript implementations
- Changes will be lost during migration
- Editing deprecated files may cause conflicts during migration

### Migration Safety
- TypeScript files remain functional during transition period
- JavaScript files will gradually replace TypeScript functionality
- Only delete TypeScript files after user confirms JavaScript files work correctly

## Current State
All TypeScript functions have been marked with prominent deprecation warnings at the top of each file. Developers will see these warnings when opening any deprecated file.

## Next Steps
1. Complete JavaScript migration
2. Test new JavaScript implementations thoroughly
3. Get user confirmation that JavaScript files work correctly
4. Only then remove TypeScript files