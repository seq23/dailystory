import { memo, lazy, Suspense } from 'react';
import { LoadingSpinner } from './LoadingStates';

// HOC for performance optimization
export function withPerformanceOptimization<T extends object>(Component: React.ComponentType<T>) {
  const OptimizedComponent = memo(Component);
  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;
  return OptimizedComponent;
}

// Simple lazy wrapper for any component
export function LazyWrapper({ 
  component, 
  fallback = <LoadingSpinner /> 
}: { 
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
}) {
  const Component = component;
  
  return function LazyComponent(props: any) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Optimized lazy loading for dashboard components
export const OptimizedAnalyticsDashboard = memo(lazy(() => 
  import('@/components/AnalyticsDashboard').then(module => ({ 
    default: module.AnalyticsDashboard 
  }))
));

export const OptimizedGamificationDashboard = memo(lazy(() => 
  import('@/components/GamificationDashboard').then(module => ({ 
    default: module.GamificationDashboard 
  }))
));