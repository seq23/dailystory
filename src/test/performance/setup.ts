import { vi } from 'vitest';

// Performance test setup
// Mock performance APIs for testing
global.performance = {
  ...global.performance,
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn().mockReturnValue([]),
  getEntriesByType: vi.fn().mockReturnValue([]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn(() => Date.now())
};