import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
}

export const MobileTooltip: React.FC<MobileTooltipProps> = ({
  content,
  children,
  className,
  side = 'top',
  align = 'center',
  disabled = false
}) => {
  const { isMobileDevice } = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0');
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0');

    let x = 0;
    let y = 0;

    // Calculate base position
    switch (side) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
    }

    // Apply alignment adjustments
    if (side === 'top' || side === 'bottom') {
      if (align === 'start') x = triggerRect.left;
      if (align === 'end') x = triggerRect.right - tooltipRect.width;
    } else {
      if (align === 'start') y = triggerRect.top;
      if (align === 'end') y = triggerRect.bottom - tooltipRect.height;
    }

    // Mobile-specific boundary checks with safe areas
    if (isMobileDevice) {
      // Horizontal boundary check
      if (x < 16) x = 16; // Left padding
      if (x + tooltipRect.width > viewportWidth - 16) {
        x = viewportWidth - tooltipRect.width - 16; // Right padding
      }

      // Vertical boundary check with safe areas
      if (y < safeAreaTop + 16) y = safeAreaTop + 16; // Top safe area + padding
      if (y + tooltipRect.height > viewportHeight - safeAreaBottom - 16) {
        y = viewportHeight - tooltipRect.height - safeAreaBottom - 16; // Bottom safe area + padding
      }
    }

    setPosition({ x, y });
  };

  const showTooltip = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(calculatePosition, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible, side, align, isMobileDevice]);

  useEffect(() => {
    if (isVisible) {
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onTouchStart={isMobileDevice ? showTooltip : undefined}
        onTouchEnd={isMobileDevice ? hideTooltip : undefined}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg",
            "transition-opacity duration-200",
            isMobileDevice && "max-w-[90vw] text-center break-words",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
            opacity: position.x === 0 && position.y === 0 ? 0 : 1
          }}
        >
          {content}
          
          {/* Arrow indicator - simplified for mobile */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 transform rotate-45",
              side === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2",
              side === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2",
              side === 'left' && "right-[-4px] top-1/2 -translate-y-1/2",
              side === 'right' && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </>
  );
};