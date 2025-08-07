import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUserInfo, suppressConsoleLogs } from '../utils/testHelpers';

// Mock all required services
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobileOrTablet: false, isCapacitor: false, isMobile: false }),
}));

describe('User Journey Integration Tests', () => {
  suppressConsoleLogs();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles basic component rendering without errors', () => {
    // Basic smoke test to ensure our test infrastructure works
    const TestComponent = () => <div data-testid="test">Hello World</div>;
    
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId('test')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('supports async operations', async () => {
    const AsyncComponent = () => {
      const [loading, setLoading] = React.useState(true);
      
      React.useEffect(() => {
        setTimeout(() => setLoading(false), 100);
      }, []);
      
      return loading ? <div>Loading...</div> : <div>Loaded!</div>;
    };
    
    renderWithProviders(<AsyncComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Loaded!')).toBeInTheDocument();
    });
  });

  it('handles user interactions properly', async () => {
    const InteractiveComponent = () => {
      const [clicked, setClicked] = React.useState(false);
      return (
        <button onClick={() => setClicked(true)}>
          {clicked ? 'Clicked!' : 'Click me'}
        </button>
      );
    };
    
    renderWithProviders(<InteractiveComponent />);
    const button = screen.getByText('Click me');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clicked!')).toBeInTheDocument();
    });
  });
});