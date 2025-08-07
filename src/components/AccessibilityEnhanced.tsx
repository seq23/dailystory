import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const TouchTarget = forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'min-h-[44px] min-w-[44px] px-3 py-2',
      md: 'min-h-[48px] min-w-[48px] px-4 py-3', 
      lg: 'min-h-[52px] min-w-[52px] px-6 py-4'
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'touch-manipulation select-none',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none'
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchTarget.displayName = 'TouchTarget';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink = ({ href, children }: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'z-50 font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {children}
    </a>
  );
};

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export const ScreenReaderOnly = ({ children }: ScreenReaderOnlyProps) => {
  return <span className="sr-only">{children}</span>;
};