import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps extends ButtonProps {
  children: React.ReactNode;
  mobileSize?: 'sm' | 'default' | 'lg';
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({ 
  children, 
  className, 
  mobileSize = 'default',
  ...props 
}) => {
  const { isMobileDevice } = useIsMobile();

  const mobileClasses = isMobileDevice ? {
    sm: 'min-h-[36px] min-w-[36px] px-3 py-2 text-sm',
    default: 'min-h-[44px] min-w-[44px] px-4 py-2 text-base',
    lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-lg'
  }[mobileSize] : '';

  const finalClassName = cn(
    className,
    isMobileDevice && 'touch-target touch-feedback mobile-text-fixed',
    mobileClasses
  );

  return (
    <Button className={finalClassName} {...props}>
      {children}
    </Button>
  );
};