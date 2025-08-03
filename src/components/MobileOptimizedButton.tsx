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
    sm: 'min-h-[40px] min-w-[40px] px-3 py-2 text-sm touch-target',
    default: 'min-h-[48px] min-w-[48px] px-4 py-3 text-base touch-target',
    lg: 'min-h-[52px] min-w-[52px] px-6 py-4 text-lg touch-target'
  }[mobileSize] : '';

  const finalClassName = cn(
    className,
    isMobileDevice && 'touch-target touch-feedback mobile-text-fixed transition-transform active:scale-95',
    mobileClasses
  );

  return (
    <Button className={finalClassName} {...props}>
      {children}
    </Button>
  );
};