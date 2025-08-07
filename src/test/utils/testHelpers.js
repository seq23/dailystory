import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simple test wrapper with basic providers
const TestWrapper = ({ children }) => {
  return React.createElement(BrowserRouter, null, children);
};

// Custom render function with providers
export const renderWithProviders = (ui, options) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Mock user info for testing
export const mockUserInfo = {
  name: 'Test User',
  age: 8,
  grade: 'PreK',
  language: 'en'
};