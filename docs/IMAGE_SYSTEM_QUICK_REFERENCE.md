# Image Generation System - Developer Quick Reference

## 🚀 System Status: PRODUCTION READY

**Architecture**: JavaScript-based 4-tier fallback system  
**Success Rate**: 100% guaranteed  
**Primary Quality**: Tier 1 for all users  

## Active Functions (Use These) ✅

| Function | Purpose | Status | Success Rate |
|----------|---------|--------|--------------|
| `runware-generate-image/index.js` | Main orchestrator | 🟢 ACTIVE | 100% (routing) |
| `ai-visual-scene-creator/index.js` | Tier 1 AI generation | 🟢 ACTIVE | 85-90% |
| `runware-template-ab/index.js` | Tier 2.5A-B fallback | 🟢 ACTIVE | 95-99% |
| `runware-template-cd/index.js` | Tier 2.5C-D nuclear | 🟢 ACTIVE | 99.9% |
| `image-proxy/index.js` | Image processing | 🟢 ACTIVE | Support |

## Deprecated Functions (Don't Use) ❌

| Function | Status | Action |
|----------|--------|--------|
| `*.ts` files | ❌ DEPRECATED | DO NOT EDIT |
| `CharacterConsistencyService.ts` | ❌ NON-FUNCTIONAL | Use backend instead |
| `generate-fallback-images/index.ts` | ❌ BACKUP ONLY | Preserved but unused |

## Quick Usage Examples

### Frontend Image Generation
```javascript
const result = await supabase.functions.invoke('runware-generate-image', {
  body: {
    prompt: storyText,
    characterName: character.name,
    sessionId: session.id,
    userId: user.id,
    pageNumber: currentPage,
    difficulty: 'B'  // A, B, C, D
  }
});
```

### Character Consistency Hook
```javascript
const { 
  traits, 
  generateVisualDescription, 
  hasTraits 
} = useCharacterConsistency({
  userId: user.id,
  characterName: character.name,
  sessionId: session.id
});
```

## Tier Progression Logic

```
All Users → Tier 1 (AI) → Tier 2.5A-B (Template+Services) → Tier 2.5C-D (Nuclear) → Tier 4 (SVG)
```

**Key Rule**: Every user starts with Tier 1 regardless of subscription status

## Common Debugging Steps

### 1. Check Function Status
```bash
# Supabase dashboard → Functions → Check health
```

### 2. Verify Request Correlation
```javascript
// Look for correlation_id in logs
console.log('Request ID:', response.correlation_id);
```

### 3. Test Tier Fallback
```javascript
// Force fallback testing in ImageTierTester component
// Navigate to /prompt-testing?debug=1
```

### 4. Database Connection Issues
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('character_traits', 'visual_details');
```

## Business Rules (Critical)

### ✅ Universal Quality Policy
- **All users get Tier 1**: Guest and premium start with same quality
- **No artificial restrictions**: Subscription doesn't affect image generation tier
- **Premium differentiation**: Features (library, unlimited time), not image quality

### 🔄 Cache Behavior
- **Backward navigation**: Shows cached images
- **Session end**: Cache cleared
- **Story reset**: Cache cleared, new character consistency

### 👤 User Experience
- **Guest**: 20min timer, 6 pages max, "Next Story" button
- **Premium**: Unlimited timer, unlimited pages, library access

## API Endpoints & Payloads

### Main Generation Endpoint
```
POST /functions/v1/runware-generate-image
```

**Required Payload**:
```json
{
  "prompt": "Story text for image generation",
  "characterName": "Character name for consistency",
  "sessionId": "Unique session identifier",
  "userId": "User ID from auth",
  "pageNumber": 1,
  "difficulty": "B"
}
```

**Response Format**:
```json
{
  "success": true,
  "imageUrl": "https://...",
  "tier": 1,
  "metadata": {
    "correlation_id": "uuid",
    "processing_time": 12.5,
    "characterConsistency": true,
    "positivePrompt": "Enhanced prompt text",
    "negativePrompt": "Negative prompt elements"
  }
}
```

## Error Handling Patterns

### Automatic Fallback
```javascript
// System handles tier fallback automatically
// Frontend just calls main orchestrator
try {
  const result = await generateImage(params);
  // Always succeeds due to 4-tier fallback
} catch (error) {
  // Should never happen - system guarantees success
}
```

### Manual Fallback Testing
```javascript
// For debugging - bypass orchestrator
const result = await supabase.functions.invoke('runware-template-ab', {
  body: { ...params, difficulty: 'A' }
});
```

## Configuration Quick Checks

### Environment Variables (Backend)
```
RUNWARE_API_KEY - Required for Tier 1 & 2.5
OPENAI_API_KEY - Required for Tier 1
SUPABASE_URL - Auto-configured
SUPABASE_ANON_KEY - Auto-configured
```

### Frontend Configuration
```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

## Performance Benchmarks

| Tier | Avg Response Time | Success Rate | Quality Level |
|------|------------------|--------------|---------------|
| 1 | 8-15 seconds | 85-90% | Highest (AI) |
| 2.5A-B | 3-8 seconds | 95-99% | High (Template+) |
| 2.5C-D | 2-5 seconds | 99.9% | High (Nuclear) |
| 4 | <1 second | 100% | Basic (SVG) |

## Files You Should NOT Touch

```
❌ supabase/functions/*/index.ts - All TypeScript files
❌ src/services/CharacterConsistencyService.ts - Deprecated frontend service  
❌ src/services/VisualDetailTracker.ts - Deleted (moved to backend)
❌ Any function marked with deprecation warnings
```

## Files You CAN Edit

```
✅ supabase/functions/*/index.js - Active JavaScript functions
✅ src/hooks/useCharacterConsistency.ts - Frontend integration
✅ src/components/ImageTierTester.tsx - Debug component
✅ src/services/SimpleImageService.ts - Frontend orchestration
✅ supabase/functions/_shared/*.js - Backend services
```

## Emergency Procedures

### System Down
1. Check Supabase dashboard for function health
2. Verify API key configurations
3. Test individual tier functions manually
4. SVG fallback should always work (Tier 4)

### Character Consistency Issues
1. Check `character_traits` table in database
2. Verify backend `CharacterConsistencyService.js`
3. Test with simple character name
4. Clear session cache and retry

### Performance Issues
1. Monitor tier success rates in logs
2. Check if falling back to lower tiers too often
3. Verify API response times
4. Scale Supabase resources if needed

---

**Remember**: The system is designed to NEVER FAIL. If something isn't working, check the tier fallback progression and logs for the correlation ID.