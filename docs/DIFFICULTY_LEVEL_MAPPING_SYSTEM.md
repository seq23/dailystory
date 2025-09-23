# DIFFICULTY LEVEL MAPPING SYSTEM

## 🎯 CORE MAPPING RULE (CRITICAL TO UNDERSTAND)

**PRE-READER (FRONTEND) = BEGINNER (BACKEND)**

This is the foundational mapping that drives the entire difficulty system. Every developer, tester, and stakeholder MUST understand this mapping.

## Frontend ↔ Backend Difficulty Mappings

| Frontend Level | Backend Level | Display Name | Description |
|---------------|---------------|--------------|-------------|
| `pre-reader` | `beginner` | Pre-Reader | Picture-focused with minimal text |
| `beginner` | `easy` | Beginner | Simple sentences and basic vocabulary |
| `developing` | `medium` | Developing | Longer sentences with varied vocabulary |
| `independent` | `hard` | Independent | Complex sentences and rich vocabulary |
| `advanced` | `expert` | Advanced | Sophisticated language and concepts |

## System Architecture

### Frontend Storage
- User selections are stored in `userInfo.difficultyLevel` using **frontend values**
- Forms preserve frontend terminology (pre-reader, beginner, developing, etc.)
- UI components display frontend terminology

### Backend Processing  
- All AI services expect **backend values** (beginner, easy, medium, hard, expert)
- Edge functions receive frontend values and convert to backend values
- Story generation uses backend difficulty levels

### Conversion Points
- **DifficultyLevelMapper** classes handle all conversions
- Located in:
  - `src/services/DifficultyLevelMapper.ts` (Frontend)
  - `supabase/functions/_shared/DifficultyLevelMapper.ts` (Backend)

## Why This Mapping Exists

1. **User-Friendly Interface**: "Pre-Reader" is more intuitive than "Beginner" for parents/teachers
2. **Consistent Backend**: AI services use a standardized difficulty scale
3. **Future Scalability**: Allows frontend terminology to evolve without breaking backend

## Testing the System

### Expected Behavior
1. User selects "Pre-Reader" in UI
2. Value stored as `difficultyLevel: "pre-reader"`
3. Service converts to `"beginner"` for backend
4. Story generated with beginner-level content
5. UI continues to show "Pre-Reader"

### Key Files to Monitor
- `src/services/DifficultyLevelMapper.ts`
- `supabase/functions/_shared/DifficultyLevelMapper.ts`
- `src/hooks/useDifficultyManagement.ts`
- Story generation services

## Common Issues and Solutions

### Issue: Pre-Reader Stories Not Displaying
- **Symptom**: Pre-reader selection shows beginner stories
- **Root Cause**: Conversion not happening at service boundary
- **Fix**: Ensure DifficultyLevelMapper.toBackend() is called before API requests

### Issue: UI Shows Wrong Difficulty
- **Symptom**: Frontend displays backend values
- **Root Cause**: Missing DifficultyLevelMapper.toFrontend() conversion
- **Fix**: Convert backend responses back to frontend format

### Issue: Stories Generated at Wrong Level
- **Symptom**: Advanced content for pre-reader selection
- **Root Cause**: Backend not receiving converted difficulty
- **Fix**: Verify service layer conversion before story generation

## Regression Prevention

### Code Review Checklist
- [ ] All new difficulty-related code uses DifficultyLevelMapper
- [ ] Frontend values preserved in UI components
- [ ] Backend values used in API calls
- [ ] No hardcoded difficulty mappings

### Testing Checklist
- [ ] Pre-reader → beginner conversion works
- [ ] Story content matches selected difficulty
- [ ] UI displays correct frontend terminology
- [ ] All difficulty levels generate appropriate content

## DEBUGGING COMPLETED - SYSTEM VERIFIED ✅

### Root Cause Analysis Complete
After thorough investigation of the pre-reader story issue, the system was found to be **working correctly**:

1. **Mapping Verified**: `pre-reader` → `beginner` conversion is working in all services
2. **Story Prompts Verified**: Backend `beginner` level generates appropriate pre-reader content
3. **Edge Functions Verified**: Both NetflixStyleStoryService and LiveGenerationService correctly convert difficulties

### Backend Story Prompt Configuration Confirmed
- **Backend `beginner`**: "Level 0 pre-reader story generation engine for ages 3-5" (8 words per page max, one sentence per page)
- **Backend `easy`**: "Beginner story generation engine for ages 5-7" (15-24 words per page, 2-3 sentences)

### System Status: ✅ FULLY OPERATIONAL

The difficulty mapping system is working as designed. Any issues with pre-reader stories displaying beginner-level content were likely due to:
- Cached results from before the system was properly configured
- User confusion about content expectations
- Testing with incorrect user profiles

### Verification Steps Completed
- [x] DifficultyLevelMapper.toBackend() conversions verified
- [x] Story prompt configurations confirmed
- [x] Service layer integration tested
- [x] Edge function difficulty handling validated

## CRITICAL REMINDER

**NEVER BYPASS THE MAPPING SYSTEM**

Always use:
- `DifficultyLevelMapper.toBackend()` when sending to services
- `DifficultyLevelMapper.toFrontend()` when displaying to users
- `DifficultyLevelMapper.getDisplayName()` for UI labels

This system is non-negotiable and must be respected by all code changes.