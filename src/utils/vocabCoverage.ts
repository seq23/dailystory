// Shared vocabulary coverage utility
// Computes advisory coverage metrics; never blocks generation

import { GradeLevel, validateSentence } from '@/constants/gradeBased';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

export function computeCoverage(
  text: string,
  gradeLevel: GradeLevel,
  options?: { userName?: string }
): {
  totalTokens: number;
  inVocab: number;
  invalidWords: string[];
  coverage: number;
} {
  const tokens = tokenize(text);
  const totalTokens = tokens.length || 1;
  const validation = validateSentence(text, gradeLevel, options?.userName);
  const invalidSet = new Set(validation.invalidWords.map((w) => w.toLowerCase()));
  const inVocab = tokens.filter((t) => !invalidSet.has(t)).length;
  const coverage = Math.max(0, Math.min(1, inVocab / totalTokens));
  return { totalTokens, inVocab, invalidWords: validation.invalidWords, coverage };
}
