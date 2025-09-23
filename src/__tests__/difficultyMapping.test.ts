/**
 * Critical Difficulty Mapping Tests
 * Ensures pre-reader maps to Grade Level 0 and prevents regressions
 */

import { describe, test, expect } from 'vitest';
import { DifficultyLevelMapper } from '@/services/DifficultyLevelMapper';
import { difficultyToEducationalLevel } from '@/constants/educationalStandards';

describe('Difficulty Level Mapping - Critical Tests', () => {
  test('Pre-Reader Frontend → Beginner Backend Mapping', () => {
    const backendLevel = DifficultyLevelMapper.toBackend('pre-reader');
    expect(backendLevel).toBe('beginner');
  });

  test('Beginner Backend → Grade Level 0 Mapping', () => {
    const gradeLevel = difficultyToEducationalLevel('beginner');
    expect(gradeLevel).toBe(0);
  });

  test('Complete Pre-Reader → Grade Level 0 Flow', () => {
    // This is the critical path that MUST work
    const frontendLevel = 'pre-reader';
    const backendLevel = DifficultyLevelMapper.toBackend(frontendLevel);
    const gradeLevel = difficultyToEducationalLevel(backendLevel);
    
    expect(frontendLevel).toBe('pre-reader');
    expect(backendLevel).toBe('beginner');
    expect(gradeLevel).toBe(0);
  });

  test('All Frontend Levels Map to Correct Backend Levels', () => {
    const mappings = [
      { frontend: 'pre-reader', backend: 'beginner', grade: 0 },
      { frontend: 'beginner', backend: 'easy', grade: 1 },
      { frontend: 'developing', backend: 'medium', grade: 2 },
      { frontend: 'independent', backend: 'hard', grade: 3 },
      { frontend: 'advanced', backend: 'expert', grade: 4 }
    ];

    mappings.forEach(({ frontend, backend, grade }) => {
      const mappedBackend = DifficultyLevelMapper.toBackend(frontend);
      const mappedGrade = difficultyToEducationalLevel(mappedBackend);
      
      expect(mappedBackend).toBe(backend);
      expect(mappedGrade).toBe(grade);
    });
  });

  test('Display Names Are User-Friendly', () => {
    const displayName = DifficultyLevelMapper.getDisplayName('pre-reader');
    expect(displayName).toBe('Pre-Reader');
  });

  test('Validation Functions Work Correctly', () => {
    expect(DifficultyLevelMapper.isValidFrontendLevel('pre-reader')).toBe(true);
    expect(DifficultyLevelMapper.isValidBackendLevel('beginner')).toBe(true);
    expect(DifficultyLevelMapper.isValidFrontendLevel('invalid-level')).toBe(false);
  });
});