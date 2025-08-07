import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

// Create a new QueryClient for each test to avoid cache pollution
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component for rendering components with all necessary providers
const AllProviders = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Custom render function with providers
export const renderWithProviders = (ui, options) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

// Mock user info for testing
export const mockUserInfo = {
  name: 'Test User',
  age: 8,
  gradeLevel: '2nd Grade',
  readingLevel: 'Beginner',
  interests: ['animals', 'adventure'],
  language: 'en',
  skinTone: 'light',
  gender: 'boy',
  specialRequests: 'Make it exciting!'
};

// Utility to suppress console logs during tests
export const suppressConsoleLogs = () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore?.();
    console.warn.mockRestore?.();
    console.error.mockRestore?.();
  });
};

// Mock React Query client for testing
export const createMockQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper for async testing
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Mock implementations for common hooks
export const mockToast = { toast: jest.fn() };
export const mockMobile = { 
  isMobileOrTablet: false, 
  isCapacitor: false, 
  isMobile: false 
};