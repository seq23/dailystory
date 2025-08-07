// Spacing utilities using design system tokens
export const spacing = {
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)', 
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
  '2xl': 'var(--space-2xl)',
  '3xl': 'var(--space-3xl)'
} as const;

// Tailwind classes using consistent spacing
export const spacingClasses = {
  // Margins
  margins: {
    xs: 'm-1',   // 0.25rem
    sm: 'm-2',   // 0.5rem
    md: 'm-4',   // 1rem
    lg: 'm-6',   // 1.5rem
    xl: 'm-8',   // 2rem
    '2xl': 'm-12', // 3rem
    '3xl': 'm-16'  // 4rem
  },
  
  // Padding
  padding: {
    xs: 'p-1',
    sm: 'p-2', 
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
    '3xl': 'p-16'
  },
  
  // Gaps
  gaps: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
    '3xl': 'gap-16'
  }
} as const;

export type SpacingSize = keyof typeof spacing;