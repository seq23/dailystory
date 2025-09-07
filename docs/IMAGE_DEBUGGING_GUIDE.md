# Image Generation Debugging Guide

## Quick Steps to Diagnose Image Issues

### 1. Enable Debug Mode
Add `?debug=1` to your URL (e.g., `http://localhost:5173/?debug=1`) to enable comprehensive debugging.

### 2. Check the Debug Panel
When debug mode is enabled, you'll see a collapsible **Image Debug Panel** in the top-right corner that shows:
- Current page content analysis
- Expected vs actual image content
- Generation status
- All page images overview

### 3. Check Browser Console
Look for these key debug messages:

#### Image Display Debugging:
```
🔍 IMAGE DISPLAY DEBUG: {
  currentPage: 0,
  currentStoryText: "Sequoia plays with her friends in the park...",
  currentImage: "https://...",
  hasCurrentImage: true
}
```

#### Content Match Analysis:
```
🔍 CONTENT MATCH ANALYSIS: {
  storyText: "Sequoia plays with her friends in the park",
  hasMultipleCharacters: true,
  mentionsPark: true,
  possibleMismatch: true
}
```

#### Image Generation Tracking:
```
🔍 IMAGE GENERATION DEBUG - Starting generation: {
  currentPage: 0,
  pageText: "Sequoia plays with her friends in the park...",
  userInfo: { name, avatar, difficultyLevel }
}
```

#### Tier Success Detection:
```
🎯 TIER SUCCESS IDENTIFIED: {
  tier: "2.5",
  pageText: "Sequoia plays with her friends in the park",
  imageUrl: "https://...",
  contentMatches: {
    hasMultipleCharacters: true,
    mentionsPark: true,
    isPlayingScene: true
  }
}
```

### 4. Manual Tier Check
In the browser console, run:
```javascript
window.checkImageTier()
```

This will show recent image generation calls and which tier succeeded for each.

### 5. Common Issues and Solutions

#### Issue: Wrong Image Content
- **Symptom**: Image shows single character instead of multiple children playing
- **Diagnosis**: Check if the prompt sent to AI includes all story elements
- **Solution**: Regenerate image using the debug panel button

#### Issue: Cached Wrong Image
- **Symptom**: Same wrong image appears repeatedly
- **Solution**: Clear the specific image cache and regenerate

#### Issue: Tier Fallback Problems
- **Symptom**: Lower quality generic images instead of story-specific ones
- **Diagnosis**: Check which tier succeeded in console logs
- **Solution**: Investigate why higher tiers are failing

### 6. Backend Log Checking
The system automatically monitors backend edge function calls for:
- `runware-generate-image`
- `debug-recent-image-prompts` 
- `process-story-content`

### 7. Regeneration
Use the "Regenerate Image" button in the debug panel to:
1. Clear the current page's image
2. Trigger fresh generation
3. Monitor which tier succeeds

### 8. Content Validation
The debug system checks if the displayed image matches the expected content:
- Multiple characters for scenes with "friends", "together", etc.
- Park/playground settings for outdoor scenes
- Playing actions for active scenes

This helps identify when the AI scene creation or image generation isn't matching the story content properly.