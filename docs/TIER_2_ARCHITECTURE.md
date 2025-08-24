# Tier 2 Architecture Documentation

## Overview
Tier 2 (`runware-template-generation`) is **MISLEADINGLY NAMED** - it contains **NO TEMPLATES** and is purely dynamic prompt building.

## Tier 2 Functionality
- **Dynamic Prompt Building**: Uses full pipeline identical to Tier 1, minus `ai-story-enhancer`
- **NO Templates**: Despite the name "runware-template-generation", there are zero templates
- **NO Internal Fallbacks**: Pure dynamic system that fails fast to trigger Tier 2.5

## Architecture Principles

### Single Source of Truth
- Avatar consistency handled by orchestrator (`runware-generate-image`)
- NO duplicate `validateAvatarConsistency()` functions
- NO duplicate `AVATAR_FALLBACK_DESCRIPTIONS` mappings

### Error Propagation Strategy
- If ANY dynamic system fails → Error propagates to orchestrator
- Orchestrator catches error → Falls back to Tier 2.5 (hardcoded fallback)
- NO internal safety nets or fallbacks within Tier 2

### Dynamic Pipeline Components
Tier 2 uses identical pipeline to Tier 1:
- `SessionStateManager`: Session state and character tracking
- `CharacterConsistencyService`: Character seed generation
- `SecondaryElementDetector`: Story element detection
- `RealContextCollector`: Context collection from session history
- `FrontendIntelligence`: Cultural enhancement and prompt building
- `UnifiedCharacterDescriptor`: Character description generation
- `StyleFrameworks`: Dynamic styling based on difficulty
- `VisualDetailTracker`: Visual element tracking

### What Tier 2 Does NOT Have
- ❌ Templates or template-based generation
- ❌ Internal avatar fallback handling
- ❌ Safety nets or error recovery
- ❌ Duplicate functions from orchestrator
- ❌ AI story enhancer (only difference from Tier 1)

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
| Dynamic Pipeline | ✅ | ✅ |
| Avatar Validation | Orchestrator | Orchestrator |
| Internal Fallbacks | None | None |
| Error Handling | Fail fast | Fail fast |

## Critical Rules
1. **NO duplicate functions** - Import from orchestrator only
2. **NO internal fallbacks** - Let errors propagate
3. **Pure dynamic building** - No templates despite name
4. **Single source of truth** - Avatar handling in orchestrator only

## Future Considerations
- Consider renaming to `runware-dynamic-generation` for clarity
- Maintain backward compatibility during any renaming
- Document the naming discrepancy clearly