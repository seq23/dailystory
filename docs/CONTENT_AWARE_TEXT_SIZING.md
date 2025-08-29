# Content-Aware Text Sizing System Documentation

## Overview
The Content-Aware Text Sizing System dynamically adjusts text presentation based on content length, viewport dimensions, and image presence to optimize readability and space utilization.

## Core Components

### 1. useContentAwareTextSize Hook
```typescript
const { fontSize, lineHeight, letterSpacing } = useContentAwareTextSize(text, isMobile, hasImage);
```

**Features:**
- **Word Count Analysis**: Analyzes text content to determine optimal sizing
- **Mobile Optimization**: Responsive adaptations for mobile viewports  
- **Image-Aware Scaling**: Increases text size by 20-30% when images are present
- **Smart Typography**: Adjusts line height, letter spacing, and paragraph spacing

**Parameters:**
- `text`: The story content to analyze
- `isMobile`: Boolean indicating mobile viewport
- `hasImage`: Boolean indicating if an image is present on the current page

**Returned Configuration:**
- `fontSize`: Responsive font size using clamp() for fluid scaling
- `lineHeight`: Line height optimized for word count and image presence
- `letterSpacing`: Character spacing for optimal readability
- `paragraphSpacing`: Spacing between paragraphs
- `maxWordsPerLine`: Optimal words per line for reading flow

### 2. Image-Aware Text Scaling Algorithm

**Short Content (≤15 words):**
- Without image: `clamp(1.5rem, 3vw, 2.5rem)` (desktop)
- With image: `clamp(1.875rem, 3.75vw, 3.125rem)` (desktop)
- Line height increases from 1.6 to 1.7 with images

**Medium Content (16-50 words):**
- Without image: `clamp(1.25rem, 2.5vw, 1.75rem)` (desktop)
- With image: `clamp(1.5625rem, 3.125vw, 2.1875rem)` (desktop)
- Adjusts max words per line from 12 to 10 with images

**Long Content (51-100 words):**
- Text scaling maintains readability while accommodating images
- Container width expands when images are present

**Very Long Content (100+ words):**
- Optimized for density while ensuring larger text with images
- Full-width containers when images are present

### 3. useContentAwareContainer Hook
```typescript
const containerClasses = useContentAwareContainer(wordCount, hasImage);
```

**Image-Aware Container Sizing:**
- Expands container width when images are present for better text distribution
- Short content: `max-w-4xl` → `max-w-5xl` with images
- Long content: `max-w-7xl` → `w-full` with images

## Integration with Story Display System

### 4. CleanStoryDisplay Integration
```typescript
// Detect current page image presence
const currentImage = pageImages[currentPage];
const hasCurrentImage = !!currentImage;

// Apply image-aware text sizing
const contentAwareTextConfig = useContentAwareTextSize(
  currentStoryText || "", 
  isMobile, 
  hasCurrentImage
);

const contentAwareContainerConfig = useContentAwareContainer(
  wordCount, 
  hasCurrentImage
);
```

**Dynamic Behavior:**
- Text size automatically increases when images are present
- Container width expands to accommodate larger text with images
- Smooth transitions between pages with different image states
- Maintains optimal reading experience across all scenarios

### 5. Story Stability & Auto-Generation System

**Fixed Issues:**
- ✅ **Story Stability**: Removed `setIsStoryStable(false)` during navigation
- ✅ **Auto-Generation**: Images now generate automatically on all pages when story is stable
- ✅ **Generate Button**: Removed manual "Generate illustration" button
- ✅ **Desktop Width**: Removed `max-w-[98vw]` constraint for full-width text

**Image Generation Flow:**
```typescript
// Story remains stable during navigation
if (isStoryStable && story.length > 0) {
  // Auto-trigger image generation for all pages
  window.dispatchEvent(new CustomEvent('story:stabilized'));
}
```

## Reading Experience Optimization

### Mobile Devices
- Responsive font scaling with image awareness
- Touch-optimized spacing and line heights
- Optimal container widths for thumb-friendly reading

### Desktop Devices  
- Full-width text utilization when no width constraints
- Larger text scaling when images are present (up to 30% increase)
- Split-screen layout with optimized text column usage

### Image-Text Coordination
- **Without Images**: Text uses full available width with standard sizing
- **With Images**: Text scales up 20-30% and uses expanded container width
- **Transitions**: Smooth scaling when navigating between pages with different image states

## Performance Optimizations

- **Memoized Calculations**: All sizing calculations are memoized to prevent unnecessary re-renders
- **Efficient Re-renders**: Only recalculates when text content, viewport, or image presence changes
- **CSS Clamp**: Uses modern CSS clamp() for fluid, performant responsive scaling
- **Container Queries**: Leverages container-based sizing for optimal layout adaptation

## Benefits

### User Experience
- **Consistent Readability**: Text always fills available space optimally
- **Image-Text Balance**: Larger text compensates for reduced reading area when images are present
- **Responsive Design**: Seamless experience across all device sizes
- **Automatic Adaptation**: No manual adjustments needed - system responds to content and layout

### Developer Experience  
- **Simple Integration**: Single hook provides complete text sizing configuration
- **Flexible Configuration**: Easy to customize scaling factors and breakpoints
- **Type Safety**: Full TypeScript support with clear interfaces
- **Performance Focused**: Memoized and optimized for minimal re-renders

This comprehensive system ensures optimal text presentation regardless of content length, device type, or image presence, providing a superior reading experience across all scenarios.