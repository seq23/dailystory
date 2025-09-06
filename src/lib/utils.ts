import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely joins theme data of any format into a string
 * Returns empty string for null/undefined (silent failure)
 */
export function safeThemeJoin(themes: any): string {
  if (!themes) return '';
  if (Array.isArray(themes)) return themes.join(', ');
  if (typeof themes === 'string') return themes;
  return '';
}
