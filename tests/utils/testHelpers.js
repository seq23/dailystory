import { render } from '@testing-library/react';
import React from 'react';

// Test wrapper for components that need providers
export const TestWrapper = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// Custom render with test wrapper
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
};

// Common user info for testing
export const mockUserInfo = {
  name: 'Test User',
  age: 10,
  nativeLanguage: 'en',
  grade: 'K',
  learningGoal: 'improve-english-reading',
  avatar: { type: 'girl', skinTone: 'medium' },
  favoriteColor: 'blue',
  favoriteAnimal: 'cat',
  hobbies: 'reading',
  favoriteFood: 'pizza',
  specialRequest: '',
};

// Mock services for testing
export const createMockTTSService = () => ({
  speakText: jest.fn().mockResolvedValue(undefined),
  stopCurrentAudio: jest.fn(),
  isPlaying: jest.fn().mockReturnValue(false),
  clearCache: jest.fn(),
});

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Suppress console logs during tests
export const suppressConsoleLogs = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });
};