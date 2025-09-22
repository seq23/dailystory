import { useEffect, useRef } from 'react';
import { ManagedTimers } from '@/utils/managedTimers';

export const useManagedTimer = (componentName?: string) => {
  const timers = useRef<number[]>([]);
  
  const setTimeout = (callback: Function, delay: number): number => {
    const id = ManagedTimers.setTimeout(callback, delay, componentName);
    timers.current.push(id);
    return id;
  };
  
  const setInterval = (callback: Function, delay: number): number => {
    const id = ManagedTimers.setInterval(callback, delay, componentName);
    timers.current.push(id);
    return id;
  };
  
  const clearTimeout = (id: number): void => {
    ManagedTimers.clearTimeout(id);
    timers.current = timers.current.filter(timerId => timerId !== id);
  };
  
  const clearInterval = (id: number): void => {
    ManagedTimers.clearInterval(id);
    timers.current = timers.current.filter(timerId => timerId !== id);
  };
  
  const clearAllTimers = (): void => {
    timers.current.forEach(id => {
      ManagedTimers.clearTimeout(id);
      ManagedTimers.clearInterval(id);
    });
    timers.current = [];
  };
  
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);
  
  return {
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    clearAllTimers
  };
};