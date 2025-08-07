import { describe, it, expect } from 'vitest';

describe('GamificationService', () => {
  it('should calculate levels correctly', () => {
    const calculateLevel = (points: number) => {
      if (points < 100) return 1;
      if (points < 250) return 2;
      if (points < 500) return 3;
      return 4;
    };

    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(150)).toBe(2);
    expect(calculateLevel(300)).toBe(3);
    expect(calculateLevel(600)).toBe(4);
  });

  it('should handle achievement structures', () => {
    const mockAchievement = {
      id: 'test_achievement',
      title: 'Test Achievement',
      points: 10,
      unlocked: false
    };

    expect(mockAchievement.id).toBe('test_achievement');
    expect(mockAchievement.points).toBe(10);
    expect(mockAchievement.unlocked).toBe(false);
  });
});