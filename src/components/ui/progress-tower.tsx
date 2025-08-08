import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Star, TrendingUp } from 'lucide-react';

interface ProgressTowerProps {
  value: number;
  maxValue: number;
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'gold' | 'purple';
  isPremium?: boolean;
  isActive?: boolean;
  previousValue?: number;
  showMilestones?: boolean;
  className?: string;
}

const colorThemes = {
  blue: {
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    glow: 'shadow-blue-500/50',
    ring: 'ring-blue-300',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    premium: 'from-blue-500 via-cyan-500 to-blue-700'
  },
  green: {
    gradient: 'from-green-400 via-green-500 to-green-600',
    glow: 'shadow-green-500/50',
    ring: 'ring-green-300',
    bg: 'bg-green-500/10',
    text: 'text-green-600',
    premium: 'from-green-500 via-emerald-500 to-green-700'
  },
  gold: {
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    glow: 'shadow-amber-500/50',
    ring: 'ring-amber-300',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    premium: 'from-yellow-500 via-amber-500 to-orange-600'
  },
  purple: {
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    glow: 'shadow-purple-500/50',
    ring: 'ring-purple-300',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600',
    premium: 'from-purple-500 via-violet-500 to-purple-700'
  }
};

export const ProgressTower: React.FC<ProgressTowerProps> = ({
  value,
  maxValue,
  label,
  icon,
  color,
  isPremium = false,
  isActive = false,
  previousValue = 0,
  showMilestones = true,
  className
}) => {
  const [celebrating, setCelebrating] = useState(false);
  const [showGrowth, setShowGrowth] = useState(false);

  const percentage = Math.min((value / maxValue) * 100, 100);
  const theme = colorThemes[color];
  const hasGrowth = value > previousValue;
  const growthAmount = value - previousValue;

  // Trigger celebration effects
  useEffect(() => {
    if (isActive && hasGrowth) {
      setCelebrating(true);
      setShowGrowth(true);
      
      const timer = setTimeout(() => {
        setCelebrating(false);
        setShowGrowth(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, hasGrowth]);

  // Check for milestone achievement
  const isMilestone = showMilestones && value > 0 && (
    value % 100 === 0 || // Every 100 units
    (value < 100 && value % 25 === 0) // Every 25 units below 100
  );

  return (
    <div className={cn(
      "relative flex flex-col items-center group",
      "transition-all duration-300 ease-out",
      celebrating && "animate-bounce",
      className
    )}>
      {/* Growth indicator */}
      {showGrowth && growthAmount > 0 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
            "bg-white border shadow-lg animate-bounce",
            theme.text
          )}>
            <TrendingUp className="w-3 h-3" />
            +{growthAmount}
          </div>
        </div>
      )}

      {/* Milestone celebration */}
      {celebrating && isMilestone && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
        </div>
      )}

      {/* Icon only */}
      <div className={cn(
        "relative mb-3 p-3 rounded-full backdrop-blur-sm border",
        "transition-all duration-300",
        isPremium ? `bg-gradient-to-br ${theme.premium}` : `bg-gradient-to-br ${theme.gradient}`,
        "text-white shadow-lg",
        celebrating && `ring-4 ${theme.ring} ${theme.glow}`,
        "group-hover:scale-105"
      )}>
        <div className="w-5 h-5">
          {icon}
        </div>
      </div>

      {/* Progress tower */}
      <div className="relative">
        {/* Tower background */}
        <div className={cn(
          "w-16 h-32 rounded-lg border-2 overflow-hidden relative",
          "bg-gradient-to-b from-gray-50 to-gray-100",
          isPremium ? "border-primary/30" : "border-gray-200",
          "shadow-inner"
        )}>
          {/* Grid lines for visual reference */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute w-full border-t border-gray-300/50"
              style={{ bottom: `${tick}%` }}
            />
          ))}

          {/* Progress fill */}
          <div
            className={cn(
              "absolute bottom-0 w-full transition-all duration-700 ease-out",
              "bg-gradient-to-t",
              isPremium ? theme.premium : theme.gradient,
              celebrating && "animate-pulse",
              percentage > 90 && "animate-pulse"
            )}
            style={{ 
              height: `${percentage}%`,
              filter: celebrating ? 'brightness(1.2)' : 'none'
            }}
          >
            {/* Liquid effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-50" />
            
            {/* Shimmer effect for premium */}
            {isPremium && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>

          {/* Milestone markers */}
          {showMilestones && [100, 250, 500, 750].map((milestone) => {
            const milestonePercent = (milestone / maxValue) * 100;
            if (milestonePercent > 100) return null;
            
            const isAchieved = value >= milestone;
            
            return (
              <div
                key={milestone}
                className="absolute left-0 w-full flex items-center"
                style={{ bottom: `${milestonePercent}%` }}
              >
                <div className={cn(
                  "w-full h-0.5",
                  isAchieved ? "bg-yellow-400" : "bg-gray-400/50"
                )} />
                <div className={cn(
                  "absolute -right-8 text-xs font-medium",
                  isAchieved ? "text-yellow-600" : "text-gray-400"
                )}>
                  {milestone}
                </div>
              </div>
            );
          })}

          {/* Celebration particles */}
          {celebrating && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                  style={{
                    left: `${15 + (i * 10)}%`,
                    top: `${10 + (i * 8)}%`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Max value indicator at top */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-bold bg-white shadow-md border",
            "text-muted-foreground"
          )}>
            {maxValue.toLocaleString()}
          </div>
        </div>
        {/* Current value indicator at bottom */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-bold bg-white shadow-md border",
            theme.text
          )}>
            {value.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Label only */}
      <div className="mt-6 text-center">
        <p className={cn(
          "text-sm font-medium transition-colors duration-200",
          celebrating ? theme.text : "text-muted-foreground",
          "group-hover:text-foreground"
        )}>
          {label}
        </p>
      </div>
    </div>
  );
};