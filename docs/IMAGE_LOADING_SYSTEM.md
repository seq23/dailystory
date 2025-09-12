# Image Loading System Documentation

## Overview
The Enhanced Image Loading System provides robust image handling with automatic fallbacks, progressive preloading, and seamless user experience across all scenarios.

## Core Components

### 1. useImageWithFallback Hook
```typescript
const { imageSrc, isLoading, error, isUsingFallback, manualRetry, isManualRetry } = useImageWithFallback(src, {
  fallbackText,
  retryAttempts: 2,
  retryDelay: 1000
});
```

**Features:**
- **Configurable Retry Mechanism**: Default 2 attempts with 1000ms delays
- **Automatic Fallback**: Generated SVG placeholders on failure
- **URL Type Support**: Data URLs, blob URLs, and external URLs
- **Timeout Handling**: 10-second timeout for external URLs
- **Manual Retry**: User-triggered retry functionality

**State Management:**
- `imageSrc`: Current image source (original or fallback)
- `isLoading`: Loading state indicator
- `error`: Error message if loading fails
- `isUsingFallback`: Boolean indicating fallback usage
- `manualRetry`: Function to trigger manual retry
- `isManualRetry`: Loading state for manual retries

### 2. ImageWithFallback Component
```typescript
<ImageWithFallback
  src={imageUrl}
  alt="Story illustration"
  fallbackText="Custom fallback text"
  onLoadingChange={(isLoading) => console.log('Loading:', isLoading)}
  onFallbackUsed={(isUsing) => console.log('Using fallback:', isUsing)}
  onRetry={() => console.log('Retry requested')}
/>
```

**UI Features:**
- **Loading State**: Animated skeleton loader with visual feedback
- **Error Indication**: Clear error messaging with retry options
- **Fallback Indication**: Visual badge showing "Generated" content
- **Retry Interface**: Prominent retry button with loading animation

### 3. ImageFallbackService
Advanced SVG placeholder generation with multiple fallback strategies.

#### CSP-Aware Detection
```typescript
static detectCSPIssues(): boolean {
  // Detects Content Security Policy restrictions
  // Tests data URL and blob URL support
  // Returns true if CSP blocks image loading
}
```

#### Environment-Specific Fallbacks
```typescript
static getBestFallback(config: Partial<FallbackImageConfig> = {}): string {
  // Automatically selects best fallback format
  // Prefers data URLs for compatibility
  // Falls back to blob URLs if needed
  // Ultimate fallback to simple encoded SVG
}
```

#### Fallback Types

**1. Story-Specific Placeholders**
```typescript
static generateStoryPlaceholder(storyText: string, pageNumber: number): string {
  // Generates page-specific placeholders
  // Extracts key elements from story text
  // Uses warm yellow theme for story context
}
```

**2. Character-Themed Placeholders**
```typescript
static generateCharacterPlaceholder(characterName: string, pageNumber: number): string {
  // Character-specific placeholder generation
  // Random emoji selection for personality
  // Light green theme for character focus
}
```

**3. Generic Placeholders**
```typescript
static generatePlaceholderSVG(config: FallbackImageConfig): string {
  // Customizable SVG generation
  // Professional design with geometric elements
  // Configurable colors, text, and dimensions
}
```

## Progressive Image Preloading

### 3-Page-Ahead Strategy
```typescript
// Aggressive prefetch: preload upcoming images without blocking UI
useEffect(() => {
  const urls: string[] = [];
  // Prefer forward direction, then backward few pages
  for (let i = currentPage + 1; i < story.length; i++) {
    const url = pageImages[i];
    if (url && !preloadedUrlsRef.current.has(url)) urls.push(url);
  }
  // ... preload logic
}, [currentPage, pageImages, story.length]);
```

**Features:**
- **Non-Blocking**: Preloading doesn't affect UI responsiveness
- **Duplicate Prevention**: Tracks preloaded URLs to avoid duplicate requests
- **Forward Priority**: Prioritizes upcoming pages for better UX
- **Memory Management**: Efficient tracking with Set data structure

### Preloading Benefits
- **Instant Page Transitions**: Images ready before user navigation
- **Bandwidth Optimization**: Intelligent preloading scheduling
- **UX Enhancement**: Eliminates loading delays during reading

## Fallback Hierarchy

### 1. Data URLs (Primary)
- **Best Compatibility**: Works across all environments
- **CSP Safe**: Bypasses most Content Security Policy restrictions
- **Immediate Display**: No additional network requests
- **Base64 Encoded**: Compact SVG representation

### 2. Blob URLs (Secondary)
- **Dynamic Generation**: Created at runtime
- **Memory Efficient**: Better for large placeholders
- **Modern Browser Support**: Excellent compatibility
- **Automatic Cleanup**: Garbage collected when not needed

### 3. Simple SVG (Fallback)
- **Universal Compatibility**: Works everywhere
- **Minimal Size**: Ultra-lightweight fallback
- **Text-Based**: Human-readable placeholder content
- **Guaranteed Success**: 100% compatibility assurance

## Integration with Anti-Flicker System

### Story Stability Coordination
```typescript
// Images only generate when story is stable
if (isStoryStable && story.length > 0) {
  // Trigger image generation
  window.dispatchEvent(new CustomEvent('story:stabilized'));
}
```

**Benefits:**
- **Race Condition Prevention**: Images match final story content
- **Consistent Timing**: Coordinated with story loading
- **Smooth Transitions**: No image-text mismatches

## Error Handling & Recovery

### Automatic Recovery
- **Retry Logic**: Configurable retry attempts with exponential backoff
- **Graceful Degradation**: Smooth transition to fallbacks
- **User Feedback**: Clear error messaging and recovery options

### Manual Recovery
- **Retry Button**: Prominent user-triggered retry functionality
- **Loading Indicators**: Clear feedback during retry attempts
- **Success Tracking**: Monitors retry success rates

## Debug Features

### Query Parameters
- `?imagedebug=true`: Enhanced image loading logging
- Shows loading states, fallback usage, and preloading status

### Console Logging
```typescript
console.log('🖼️ ImageWithFallback: Image display error', {
  src: imageSrc,
  error: e
});

console.log('🖼️ ImageFallback: Generated SVG fallback', {
  config: finalConfig,
  dataUrlLength: dataUrl.length
});
```

## Performance Characteristics

### Loading Performance
- **Parallel Processing**: Multiple images can load simultaneously
- **Timeout Protection**: 10-second timeout prevents hanging requests
- **Memory Optimization**: Efficient preloading with duplicate prevention

### Fallback Performance
- **Instant Generation**: SVG placeholders created synchronously
- **Minimal Overhead**: Lightweight placeholder generation
- **Cached Results**: Fallback configurations cached for reuse

## Environment Compatibility

### CSP Compatibility
- **Automatic Detection**: Detects Content Security Policy restrictions
- **Adaptive Fallbacks**: Chooses appropriate fallback based on environment
- **Universal Support**: Works across all deployment scenarios

### Cross-Platform Support
- **Mobile Optimized**: Touch-friendly retry interfaces
- **Desktop Enhanced**: Hover states and detailed error information
- **Responsive Design**: Adapts to different screen sizes and orientations

## Architecture Benefits

### 1. User Experience
- **Seamless Loading**: No broken images or empty spaces
- **Professional Appearance**: High-quality fallback placeholders
- **Instant Feedback**: Clear loading and error states

### 2. System Reliability
- **Fault Tolerance**: Graceful handling of all failure scenarios
- **Recovery Mechanisms**: Multiple retry and fallback strategies
- **Performance Optimization**: Intelligent preloading and caching

### 3. Developer Experience
- **Easy Integration**: Simple hook and component APIs
- **Comprehensive Logging**: Detailed debugging information
- **Flexible Configuration**: Customizable retry and fallback behavior

This comprehensive image loading system ensures professional, reliable image display across all scenarios while maintaining optimal performance and user experience.

## Static Embedded Fallback System

- The image fallback system now uses 6 high-quality children's book illustrations showing diverse children holding "Images Not Working" signs.
- Professional, child-friendly error messaging that matches the app's quality and target audience.
- The system cycles through the 6 variations based on page numbers and character names for visual variety while maintaining consistency.
