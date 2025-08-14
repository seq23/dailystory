/**
 * Utility functions for converting hex color codes to human-readable color names
 */

const HEX_TO_COLOR_MAP: Record<string, string> = {
  '#EF4444': 'red',
  '#F59E0B': 'yellow', 
  '#10B981': 'green',
  '#8B5CF6': 'purple',
  '#F97316': 'orange',
  '#EC4899': 'pink',
  '#1E3A8A': 'navy-blue',
  '#92400E': 'copper',
  '#374151': 'slate-gray',
  '#14B8A6': 'teal'
};

/**
 * Convert hex color code to human-readable color name
 */
export function hexToColorName(hex: string): string {
  // If it's already a color name (not starting with #), return as-is
  if (!hex?.startsWith('#')) {
    return hex || 'blue';
  }
  
  // Look up the hex code in our mapping
  const colorName = HEX_TO_COLOR_MAP[hex.toLowerCase()];
  
  // Return the mapped color name or default to 'blue'
  return colorName || 'blue';
}

/**
 * Ensure color is always a name, not a hex code
 */
export function ensureColorName(color: string | undefined): string {
  if (!color) return 'blue';
  return hexToColorName(color);
}