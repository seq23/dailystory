# Tier 2 Architecture Documentation

## Overview
Tier 2 (`runware-template-generation`) is **MISLEADINGLY NAMED** - it contains **NO TEMPLATES** and is purely dynamic prompt building with enhanced capabilities.

## Tier 2 Functionality
- **Dynamic Prompt Building**: Uses enhanced pipeline with advanced pronoun resolution
- **Database-Backed Character Consistency**: Eliminates race conditions across edge function instances
- **Advanced Narrative Processing**: Includes pronoun resolution for story coherence
- **NO Templates**: Despite the name "runware-template-generation", there are zero templates
- **NO Internal Fallbacks**: Pure dynamic system that fails fast to trigger Tier 2.5

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
- `SessionStateManager`: Session state and character tracking
- `CharacterConsistencyService`: **DATABASE-BACKED** character seed generation (eliminates race conditions)
- `SecondaryElementDetector`: Story element detection
- `RealContextCollector`: Context collection from session history
- `FrontendIntelligence`: Cultural enhancement and prompt building
- `UnifiedCharacterDescriptor`: Character description generation
- `AdvancedPronounResolver`: **NEW** - Complex pronoun and relationship resolution for narrative coherence
- `StyleFrameworks`: Dynamic styling based on difficulty
- `VisualDetailTracker`: Visual element tracking

### What Tier 2 Does NOT Have
- ❌ Templates or template-based generation
- ❌ Internal avatar fallback handling
- ❌ Safety nets or error recovery
- ❌ Duplicate functions from orchestrator
- ❌ AI story enhancer (primary difference from Tier 1)
- ❌ Memory-based character cache (replaced with database-backed system)

## Naming Issue
The function name `runware-template-generation` is **MISLEADING**:
- **Actual Functionality**: Dynamic prompt building with full pipeline
- **Misleading Name Suggests**: Template-based generation
- **Historical Note**: Name remains for backward compatibility

## Fallback Chain
```
Tier 1: AI-Enhanced (ai-story-enhancer + full pipeline)
  ↓ (on failure)
Tier 2: Dynamic (full pipeline, no AI enhancer) ← YOU ARE HERE
  ↓ (on failure)
Tier 2.5: Hardcoded Fallback (guaranteed success)
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
6. **Enhanced narrative processing** - Includes AdvancedPronounResolver for story coherence

## Recent Enhancements (2024)
- **Database-Backed Character Consistency**: Eliminated race conditions across edge function instances
- **Advanced Pronoun Resolution**: Added AdvancedPronounResolver for improved narrative coherence
- **Scalable Architecture**: Multiple instances can share character state via database
- **Zero Breaking Changes**: Maintained full API compatibility during enhancement

## Future Considerations
- Consider renaming to `runware-dynamic-generation` for clarity
- Maintain backward compatibility during any renaming
- Document the naming discrepancy clearly
- Monitor database performance for character consistency operations