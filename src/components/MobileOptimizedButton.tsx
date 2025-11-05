import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLongPressButton } from '@/hooks/useLongPressButton';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps extends ButtonProps {
  children: React.ReactNode;
  mobileSize?: 'sm' | 'default' | 'lg';
  tabletSize?: 'sm' | 'default' | 'lg';
  longPressDuration?: number;
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({ 
  children, 
  className, 
  onClick,
  mobileSize = 'default',
  tabletSize = 'default',
  longPressDuration = 500,
  ...props 
}) => {
  const { isMobile, isTablet, isMobileOrTablet, hasTouchCapability } = useIsMobile();
  
  // Wrap onClick to remove event parameter for long-press hook
  const handleClick = onClick ? () => onClick({} as any) : undefined;
  
  // Apply long-press handlers for touch devices, standard click for desktop
  const longPressHandlers = useLongPressButton(handleClick, { duration: longPressDuration });
  const buttonHandlers = isMobileOrTablet && onClick ? longPressHandlers : { onClick };

  // Mobile-specific classes (phones) - Increased minimum sizes
  const mobileClasses = isMobile ? {
    sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm', // Increased from 40px to 44px
    default: 'min-h-[48px] min-w-[48px] px-4 py-3 text-base',
    lg: 'min-h-[52px] min-w-[52px] px-6 py-4 text-lg'
  }[mobileSize] : '';

  // Tablet-specific classes (larger touch targets for tablets) - Increased minimum sizes  
  const tabletClasses = isTablet ? {
    sm: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-base', // Increased from 44px to 44px (already compliant)
    default: 'min-h-[48px] min-w-[48px] px-5 py-3 text-base',
    lg: 'min-h-[52px] min-w-[52px] px-6 py-4 text-lg'
  }[tabletSize] : '';

  const finalClassName = cn(
    className,
    // Apply touch optimizations for any touch-capable device
    isMobileOrTablet && 'touch-target touch-feedback mobile-text-fixed transition-transform active:scale-95',
    // Apply size-specific classes based on device type
    mobileClasses,
    tabletClasses
  );

  return (
    <Button className={finalClassName} {...buttonHandlers} {...props}>
      {children}
    </Button>
  );
};