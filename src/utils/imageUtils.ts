// Shared utility for image conversion across components
export const convertImagesToRecord = (images: any, source: string): Record<number, string> | null => {
  if (!images) {
    console.log(`🐛 DEBUG: No images provided from ${source}`);
    return null;
  }

  console.log(`🐛 DEBUG: Converting images from ${source}:`, images);
  
  // Handle array format from cached stories/sessions
  if (Array.isArray(images)) {
    const convertedImages: Record<number, string> = {};
    images.forEach((item, index) => {
      if (item?.url) {
        convertedImages[index] = item.url;
      }
    });
    console.log(`🐛 DEBUG: ${source} - Converted array to Record:`, convertedImages);
    return convertedImages;
  } 
  
  // Handle Record format (backward compatibility)
  if (typeof images === 'object' && images !== null) {
    // Validate that it's already in Record<number, string> format
    const validatedImages: Record<number, string> = {};
    for (const [key, value] of Object.entries(images)) {
      const numKey = parseInt(key);
      if (!isNaN(numKey) && typeof value === 'string') {
        // Validate URL format
        try {
          new URL(value);
          validatedImages[numKey] = value;
        } catch {
          console.warn(`🖼️ Invalid image URL for page ${key}:`, value);
        }
      }
    }
    console.log(`🐛 DEBUG: ${source} - Validated Record:`, validatedImages);
    return validatedImages;
  }

  console.log(`🐛 DEBUG: ${source} - Unsupported images format:`, typeof images);
  return null;
};