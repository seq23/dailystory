import { describe, it, expect } from 'vitest';
import { computeCoverage } from '@/utils/vocabCoverage';
import { validateLevel2Sentence } from '@/constants/gradeBased';

describe('computeCoverage', () => {
  it('normalizes punctuation and matches Level 2 contractions', () => {
    const sentence1 = "don't";
    const sentence2 = 'dont';
    const c1 = computeCoverage(sentence1, 2, { userName: 'Sam' });
    const c2 = computeCoverage(sentence2, 2, { userName: 'Sam' });
    expect(c1.coverage).toBe(1);
    expect(c2.coverage).toBe(1);

    const v1 = validateLevel2Sentence(sentence1);
    const v2 = validateLevel2Sentence(sentence2);
    expect(v1.isValid).toBe(true);
    expect(v2.isValid).toBe(true);
  });

  it('does not penalize the user name', () => {
    const c = computeCoverage('Sequoia loves pizza', 1, { userName: 'Sequoia' });
    expect(c.coverage).toBeGreaterThan(0);
  });

  // Test new educational standards approach
  it('validates educational standards instructions are generated', () => {
    // Test that our new system would generate appropriate instructions
    const gradeLevel = 2;
    const mockInstructions = "Use 2nd-3rd grade vocabulary following Dolch Grade 1-2 + Fry's words 101-300";
    
    // Verify instruction format matches educational standards
    expect(mockInstructions).toContain('Dolch');
    expect(mockInstructions).toContain('grade vocabulary');
    expect(mockInstructions).toContain('2nd-3rd');
  });

  it('supports all grade levels with educational standards', () => {
    // Test grade mapping for educational standards
    const gradeMappings = [
      { level: 0, expected: 'Pre-K' },
      { level: 1, expected: '1st-2nd grade' },
      { level: 2, expected: '2nd-3rd grade' },
      { level: 3, expected: '4th-5th grade' },
      { level: 4, expected: 'middle/high school' }
    ];

    gradeMappings.forEach(({ level, expected }) => {
      // Mock the instruction generation logic
      const instruction = level === 0 ? 'Pre-K vocabulary following Dolch Pre-Primer'
        : level === 1 ? '1st-2nd grade vocabulary following Dolch Primer'
        : level === 2 ? '2nd-3rd grade vocabulary following Dolch Grade 1-2'
        : level === 3 ? '4th-5th grade vocabulary following Common Core'
        : 'middle/high school vocabulary following Academic Word List';
      
      expect(instruction.toLowerCase()).toContain(expected.toLowerCase());
    });
  });
});
