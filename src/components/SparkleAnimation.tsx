import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SparkleAnimationProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high';
  isPremium?: boolean;
  className?: string;
}

export const SparkleAnimation: React.FC<SparkleAnimationProps> = ({
  isActive,
  intensity = 'medium',
  isPremium = false,
  className
}) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (isActive) {
      const sparkleCount = isPremium 
        ? { low: 8, medium: 12, high: 16 }[intensity]
        : { low: 4, medium: 6, high: 8 }[intensity];
      
      const colors = isPremium 
        ? ['text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400']
        : ['text-blue-400', 'text-green-400', 'text-yellow-400'];

      const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: isPremium ? Math.random() * 8 + 8 : Math.random() * 6 + 6,
        delay: Math.random() * 1000,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));

      setSparkles(newSparkles);

      // Clear sparkles after animation
      const timer = setTimeout(() => {
        setSparkles([]);
      }, isPremium ? 3000 : 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, intensity, isPremium]);

  if (!isActive || sparkles.length === 0) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-visible", className)}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={cn(
            "absolute animate-sparkle",
            sparkle.color,
            isPremium && "animate-sparkle-premium"
          )}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            fontSize: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}ms`,
            animationDuration: isPremium ? '2s' : '1.5s'
          }}
        >
          {isPremium ? ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)] : '✨'}
        </div>
      ))}
      
      {/* Premium exclusive effects */}
      {isPremium && (
        <>
          {/* Glowing ring effect */}
          <div className="absolute inset-0 animate-ping border-2 border-primary/30 rounded-full" />
          
          {/* Trailing particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`trail-${i}`}
              className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 2) * 20}%`,
                animationDelay: `${i * 200}ms`,
                boxShadow: '0 0 6px hsl(var(--primary))'
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};