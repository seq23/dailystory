import { useState, useEffect } from 'react';

export interface ErrorNetworkState {
  error: string | null;
  lastImageError: string | null;
  isNetworkAvailable: boolean;
}

export interface ErrorNetworkActions {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLastImageError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsNetworkAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  clearErrors: () => void;
}

export const useErrorNetworkState = () => {
  const [error, setError] = useState<string | null>(null);
  const [lastImageError, setLastImageError] = useState<string | null>(null);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(navigator.onLine);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsNetworkAvailable(true);
    const handleOffline = () => setIsNetworkAvailable(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearErrors = () => {
    setError(null);
    setLastImageError(null);
  };

  const state: ErrorNetworkState = {
    error,
    lastImageError,
    isNetworkAvailable,
  };

  const actions: ErrorNetworkActions = {
    setError,
    setLastImageError,
    setIsNetworkAvailable,
    clearErrors,
  };

  return { state, actions };
};