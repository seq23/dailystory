# Tier 2 Architecture Documentation

## CharacterConsistencyService Function Classification Update (2025-10-01)

**CRITICAL CORRECTION**: Complete CCS function audit revealed that **only 1 of 21 functions** triggers tier escalation.

### Graceful Fallback Methods (20 Functions)
All CCS methods EXCEPT `getEnhancedCharacterSeed()` employ graceful fallback - return safe defaults, empty arrays, or null on failure.

### Fail-Fast Method (1 Function)
**Only `getEnhancedCharacterSeed()`** throws errors to trigger tier escalation.

> **📋 For complete function audit**, see [CHARACTER_CONSISTENCY_SERVICE_COMPLETE_FUNCTION_AUDIT.md](./CHARACTER_CONSISTENCY_SERVICE_COMPLETE_FUNCTION_AUDIT.md)  
> **🔗 For integration patterns**, see [CCS_FUNCTION_INTEGRATION_SNAPSHOT_2025-10-01.md](./CCS_FUNCTION_INTEGRATION_SNAPSHOT_2025-10-01.md)

---

## Overview
Tier 2 is the **Multi-Service Dynamic Pipeline** that orchestrates 5+ systematic services to build comprehensive prompts with database-backed character consistency.

## Tier 2 Functionality
- **Multi-Service Orchestra**: Coordinates CharacterConsistencyService, SecondaryElementDetector, VisualDetailTracker, RealContextCollector, and StyleFrameworks
- **Database-Backed Character Consistency**: Eliminates race conditions across edge function instances via `character_consistency_cache` table
- **Advanced Narrative Processing**: Includes pronoun resolution and systematic story element detection
- **Dynamic Prompt Building**: Uses enhanced pipeline with 5+ service dependencies
- **NO Internal Fallbacks**: Pure dynamic system that fails fast to trigger Tier 2.5 (Premium Templates)

## Architecture Principles

### Single Source of Truth
- Avatar consistency handled by orchestrator (`runware-generate-image`)
- Character consistency managed via `character_consistency_cache` database table
- NO duplicate `validateAvatarConsistency()` functions
- NO duplicate `AVATAR_FALLBACK_DESCRIPTIONS` mappings

### Error Propagation Strategy
- If ANY dynamic system fails → Error propagates to orchestrator
- Orchestrator catches error → Falls back to Tier 2.5 (hardcoded fallback)
- NO internal safety nets or fallbacks within Tier 2

### Enhanced Dynamic Pipeline Components
Tier 2 uses enhanced pipeline with advanced capabilities:
- `CharacterConsistencyService`: **CONSOLIDATED** character management (database-backed, eliminates race conditions)
  - Handles character generation, visual details, secondary characters, cultural enhancements
  - Replaces previous: SessionStateManager, SecondaryElementDetector, VisualDetailTracker, UnifiedCharacterDescriptor
- `RealContextCollector`: Context collection from session history  
- `StyleFrameworks`: Dynamic styling based on difficulty

### What Tier 2 Does NOT Have
- ❌ Templates or hardcoded prompt systems (that's Tier 2.5)
- ❌ Internal avatar fallback handling
- ❌ Safety nets or error recovery  
- ❌ Duplicate functions from orchestrator
- ❌ AI story enhancer (primary difference from Tier 1)
- ❌ Memory-based character cache (replaced with database-backed system)
- ❌ Nuclear independence (requires multiple service dependencies)

## Tier 2 vs Tier 2.5 Distinction

**TIER 2: Multi-Service Dynamic Pipeline**
- **Function**: `MultiStageEnhancementPipeline.processTier2HighQuality`
- **Dependencies**: 5+ systematic services + database calls
- **Approach**: Dynamic orchestration of multiple AI services
- **Complexity**: HIGH (imports, database calls, service coordination)

**TIER 2.5: Premium Template System (Split Architecture)**

**TIER 2.5A-B: Template with Shared Services**
- **Function**: `runware-template-ab`  
- **Dependencies**: CharacterService, SessionManager (shared services)
- **Approach**: Templates with character consistency and session management
- **Complexity**: A-B (basic to moderate templates)

**TIER 2.5C-D: Nuclear Independence Templates**
- **Function**: `runware-template-cd`
- **Dependencies**: ZERO (nuclear independence) 
- **Approach**: Hardcoded templates with placeholder filling
- **Complexity**: C-D (advanced to emergency templates)

## Fallback Chain
```
Tier 1: AI-Enhanced (ai-visual-scene-creator + orchestrator validation)
  ↓ (on failure)
Tier 2: Multi-Service Dynamic (5+ services + database) ← YOU ARE HERE
  ↓ (on failure)
Tier 2.5: Premium Templates (hardcoded arrays + templates)
  ↓ (on failure)
Tier 3: OpenAI DALL-E
  ↓ (on failure)
Tier 4: SVG Placeholder
```

## Key Differences from Tier 1
| Component | Tier 1 | Tier 2 |
|-----------|---------|---------|
| AI Story Enhancer | ✅ | ❌ |
| Dynamic Pipeline | ✅ | ✅ Enhanced |
| Character Consistency | Memory-based | **Database-backed** |
| Pronoun Resolution | ❌ | **✅** |
| Avatar Validation | Orchestrator | Orchestrator |
| Internal Fallbacks | None | None |
| Error Handling | Fail fast | Fail fast |

## Critical Rules
1. **NO duplicate functions** - Import from orchestrator only
2. **NO internal fallbacks** - Let errors propagate
3. **Pure dynamic building** - No templates despite name
4. **Single source of truth** - Avatar handling in orchestrator only
5. **Database-backed character consistency** - Uses `character_consistency_cache` table
6. **Enhanced narrative processing** - Improved story coherence through advanced processing
7. **TIER 1 FAIL-FAST** - Removed all repair mechanisms, immediate Tier 2 triggering

## Recent Enhancements (2024)
- **Database-Backed Character Consistency**: Eliminated race conditions across edge function instances
- **Advanced Narrative Processing**: Enhanced narrative coherence through improved processing
- **Scalable Architecture**: Multiple instances can share character state via database
- **Tier 1 Fail-Fast Implementation**: Removed `applyBasicFixes()` function and all repair mechanisms
- **Strict Validation**: Tier 1 now triggers Tier 2 immediately when AI extraction is insufficient
- **Zero Breaking Changes**: Maintained full API compatibility during enhancement

## Future Considerations
- Consider renaming to `runware-dynamic-generation` for clarity
- Maintain backward compatibility during any renaming
- Document the naming discrepancy clearly
- Monitor database performance for character consistency operations