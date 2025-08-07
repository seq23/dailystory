/**
 * Utility functions for converting hex color codes to human-readable color names
 */

const HEX_TO_COLOR_MAP: Record<string, string> = {
  '#3B82F6': 'blue',
  '#EF4444': 'red', 
  '#10B981': 'green',
  '#F59E0B': 'yellow',
  '#8B5CF6': 'purple',
  '#EC4899': 'pink',
  '#F97316': 'orange',
  '#06B6D4': 'cyan',
  '#84CC16': 'lime',
  '#6366F1': 'indigo',
  '#14B8A6': 'teal',
  '#F43F5E': 'rose',
  '#A855F7': 'violet',
  '#22C55E': 'emerald'
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