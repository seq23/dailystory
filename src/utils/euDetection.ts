/**
 * EU detection utility for GDPR age thresholds
 * GDPR Article 8: Parental consent required for children under 16 in most EU countries
 * (Some EU states set it lower: 13-15, but 16 is the default)
 */

// EU/EEA country timezone patterns
const EU_TIMEZONES = [
  'Europe/Vienna', 'Europe/Brussels', 'Europe/Sofia', 'Europe/Zagreb',
  'Europe/Nicosia', 'Europe/Prague', 'Europe/Copenhagen', 'Europe/Tallinn',
  'Europe/Helsinki', 'Europe/Paris', 'Europe/Berlin', 'Europe/Athens',
  'Europe/Budapest', 'Europe/Dublin', 'Europe/Rome', 'Europe/Riga',
  'Europe/Vilnius', 'Europe/Luxembourg', 'Europe/Malta', 'Europe/Amsterdam',
  'Europe/Warsaw', 'Europe/Lisbon', 'Europe/Bucharest', 'Europe/Bratislava',
  'Europe/Ljubljana', 'Europe/Madrid', 'Europe/Stockholm',
  // EEA
  'Europe/Oslo', 'Atlantic/Reykjavik', 'Europe/Zurich',
  // UK (post-Brexit but still uses similar age threshold)
  'Europe/London',
];

// EU language codes
const EU_LANGUAGES = [
  'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ro', 'hu', 'cs',
  'el', 'bg', 'da', 'fi', 'sv', 'sk', 'sl', 'hr', 'lt', 'lv',
  'et', 'mt', 'ga', 'is', 'no',
];

/**
 * Heuristic: detect if user is likely in the EU/EEA based on timezone and language
 */
export function isLikelyEU(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (EU_TIMEZONES.includes(tz)) return true;

    const lang = navigator.language?.split('-')[0]?.toLowerCase();
    if (lang && EU_LANGUAGES.includes(lang)) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Get the minimum age for independent consent based on likely region
 * GDPR default: 16, COPPA (US): 13
 */
export function getMinConsentAge(): number {
  return isLikelyEU() ? 16 : 13;
}

/**
 * Check if a child needs parental consent based on birth year and region
 */
export function needsParentalConsent(birthYear: number | null): boolean {
  if (!birthYear) return true; // Default to requiring consent if unknown
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  const minAge = getMinConsentAge();
  
  return age < minAge;
}
