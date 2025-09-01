# Validation Architecture - Single Source of Truth

## Overview
The validation system now uses system prompts as the single source of truth for all token limits, eliminating hardcoded values and ensuring consistency between frontend and backend.

## Key Changes Made

### 1. Fixed Token Limit Mismatch
- **Issue**: `validation-config.json` had Level1 (easy) set to 24 tokens/page, but system prompt specified 60 tokens/page
- **Fix**: Updated `validation-config.json` Level1 to 60 tokens/page to match system prompt: "Maximum 60 tokens per page. Target 15-24 words per page."

### 2. Dynamic Token Extraction
- **Before**: `getTokenLimitsForLevel()` used hardcoded JSON values
- **After**: Dynamically extracts token limits from system prompts using `extractTokenLimitFromPrompt()`
- **Benefits**: Changes to prompts automatically propagate to validation without code changes

### 3. Vocabulary Loading Fix
- **Issue**: Set objects couldn't be directly used as arrays
- **Fix**: Added `Array.from()` conversion in `vocabularyLoader.ts`

## Architecture Flow

```
System Prompts (storyPrompts.ts)
    ↓ extractTokenLimitFromPrompt()
Shared Validation Utils (validation-utils.ts)
    ↓ getTokenLimitsForLevel()
Frontend Validators (tokenLimitValidator.ts)
    ↓ getPerPageTokenLimit(), getTotalStoryTokensForGuests()
Tests & Components
```

## Token Limits by Level (Extracted from System Prompts)

| Level | Difficulty | Tokens/Page | Guest Story (6 pages) | Source |
|-------|------------|-------------|----------------------|---------|
| Level0 | beginner | 15 | 90 | "Maximum 15 tokens per page" |
| Level1 | easy | 60 | 360 | "Maximum 60 tokens per page" |
| Level2 | medium | 250 | 1500 | "Maximum 250 tokens per page" |
| Level3 | hard | 350 | 2100 | "Maximum 350 tokens per page" |
| Level4 | expert | 500 | 3000 | "Maximum 500 tokens per page" |
| Grade6-10 | 6th-10th | 500 | 3000 | "450-550 words per page" → ~500 tokens |

## Validation Strategy

### Dual Validation System
- **Primary**: Token count validation
- **Secondary**: Character count validation
- **Tolerance**: 1.5x splitTolerance for edge cases
- **Emergency**: Sentence chunking for extremely long content

### Business Logic
- **Guest Users**: 6-page stories with artificial cutoff
- **Premium Users**: Unlimited pages with per-page validation
- **Never-ending**: Stories continue indefinitely unless user requests ending

## Testing
- All tests now use dynamic extraction from system prompts
- No hardcoded token expectations
- Tests validate against actual prompt values
- Coverage includes token limits, character limits, and vocabulary integration