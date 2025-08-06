import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SparkleAnimation } from './SparkleAnimation';
import { Crown, Star, Trophy } from 'lucide-react';

interface EnhancedProgressTowerProps {
  value: number;
  maxValue: number;
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'gold';
  isPremium?: boolean;
  isActive?: boolean;
  className?: string;
  previousValue?: number;
  onMilestone?: (milestone: number) => void;
  showPrediction?: boolean;
}

const colorGradients = {
  blue: {
    free: 'from-blue-400 to-blue-600',
    premium: 'from-blue-500 via-blue-600 to-blue-700'
  },
  green: {
    free: 'from-green-400 to-green-600',
    premium: 'from-green-500 via-green-600 to-green-700'
  },
  gold: {
    free: 'from-yellow-400 to-amber-500',
    premium: 'from-yellow-500 via-amber-600 to-orange-500'
  }
};

const colorBorders = {
  blue: {
    free: 'border-blue-300',
    premium: 'border-blue-400 shadow-blue-200'
  },
  green: {
    free: 'border-green-300',
    premium: 'border-green-400 shadow-green-200'
  },
  gold: {
    free: 'border-yellow-300',
    premium: 'border-yellow-400 shadow-yellow-200'
  }
};

export const EnhancedProgressTower: React.FC<EnhancedProgressTowerProps> = ({
  value,
  maxValue,
  label,
  icon,
  color,
  isPremium = false,
  isActive = false,
  className,
  previousValue = 0,
  onMilestone,
  showPrediction = false
}) => {
  const [sparkleActive, setSparkleActive] = useState(false);
  const [milestoneAchieved, setMilestoneAchieved] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);

  const percentage = Math.min((value / maxValue) * 100, 100);
  const hasIncreased = value > previousValue;
  
  // Calculate milestone thresholds
  const milestoneThreshold = isPremium ? 25 : 50;
  const isAtMilestone = value > 0 && value % milestoneThreshold === 0;

  // Trigger sparkle animation when value increases
  useEffect(() => {
    if (hasIncreased) {
      setSparkleActive(true);
      setGlowEffect(true);
      
      // Check for milestone
      if (isAtMilestone) {
        setMilestoneAchieved(true);
        onMilestone?.(value);
        
        setTimeout(() => setMilestoneAchieved(false), 3000);
      }
      
      setTimeout(() => {
        setSparkleActive(false);
        setGlowEffect(false);
      }, isPremium ? 3000 : 2000);
    }
  }, [value, hasIncreased, isAtMilestone, isPremium, onMilestone]);

  // Premium features
  const gradientClass = colorGradients[color][isPremium ? 'premium' : 'free'];
  const borderClass = colorBorders[color][isPremium ? 'premium' : 'free'];
  
  return (
    <div className={cn("flex flex-col items-center gap-2 relative", className)}>
      {/* Premium crown indicator */}
      {isPremium && (
        <div className="absolute -top-3 -right-1 z-10">
          <Crown className="w-4 h-4 text-yellow-500 drop-shadow-sm" />
        </div>
      )}

      {/* Sparkle Animation */}
      <SparkleAnimation 
        isActive={sparkleActive}
        intensity={milestoneAchieved ? 'high' : 'medium'}
        isPremium={isPremium}
      />

      {/* Icon and Value */}
      <div className="flex flex-col items-center gap-1 relative">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br shadow-sm transition-all duration-500",
          `${gradientClass} text-white`,
          glowEffect && "scale-110 shadow-lg",
          isPremium && "shadow-lg",
          milestoneAchieved && "animate-pulse ring-4 ring-yellow-400/60"
        )}>
          {icon}
        </div>
        
        {/* Value with premium styling */}
        <div className="relative">
          <span className={cn(
            "text-xs font-bold transition-all duration-300",
            isPremium ? "text-gray-800" : "text-gray-700",
            glowEffect && "scale-110 font-extrabold",
            isPremium && glowEffect && "text-primary"
          )}>
            {value}
          </span>
          
          {/* Premium progress prediction */}
          {isPremium && showPrediction && value > 0 && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Next: {Math.ceil(value / milestoneThreshold) * milestoneThreshold}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tower Container */}
      <div className="relative">
        {/* Premium background effects */}
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-lg -m-1" />
        )}
        
        {/* Tower Background */}
        <div className={cn(
          "w-12 h-32 bg-gradient-to-t from-gray-50 to-gray-100 rounded-lg border-2 relative overflow-hidden transition-all duration-300",
          borderClass,
          isPremium && "shadow-lg",
          glowEffect && isPremium && "shadow-xl scale-105",
          milestoneAchieved && "ring-2 ring-yellow-400 shadow-yellow-200"
        )}>
          {/* Top Label (Max Value) */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <span className={cn(
              "text-xs font-medium",
              isPremium ? "text-gray-600" : "text-gray-400"
            )}>
              {maxValue}
            </span>
          </div>

          {/* Enhanced Tick Marks for Premium */}
          {(isPremium ? [...Array(8)] : [...Array(6)]).map((_, i) => {
            const tickValue = i * (isPremium ? 62.5 : 100);
            const tickPosition = (tickValue / maxValue) * 100;
            const isMajorTick = isPremium ? tickValue % 125 === 0 : tickValue % 100 === 0;
            
            return (
              <div
                key={i}
                className={cn(
                  "absolute w-full border-t transition-colors duration-300",
                  isMajorTick 
                    ? (isPremium ? "border-primary/40" : "border-gray-400")
                    : (isPremium ? "border-primary/20" : "border-gray-200")
                )}
                style={{ bottom: `${tickPosition}%` }}
              >
                {isMajorTick && tickValue > 0 && tickValue < maxValue && (
                  <span className={cn(
                    "absolute -right-8 -top-2 text-xs",
                    isPremium ? "text-gray-600" : "text-gray-500"
                  )}>
                    {tickValue}
                  </span>
                )}
              </div>
            );
          })}

          {/* Progress Fill */}
          <div
            className={cn(
              "absolute bottom-0 w-full bg-gradient-to-t transition-all duration-800 ease-out rounded-b-lg",
              gradientClass,
              milestoneAchieved && "animate-pulse",
              isPremium && "shadow-inner"
            )}
            style={{ height: `${percentage}%` }}
          />

          {/* Enhanced Celebration Effect */}
          {milestoneAchieved && (
            <div className="absolute inset-0 pointer-events-none">
              {(isPremium ? [...Array(12)] : [...Array(8)]).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute rounded-full animate-ping",
                    isPremium ? "w-2 h-2 bg-yellow-400" : "w-1.5 h-1.5 bg-yellow-300"
                  )}
                  style={{
                    left: `${10 + (i * 7)}%`,
                    top: `${5 + (i * 10)}%`,
                    animationDelay: `${i * (isPremium ? 100 : 150)}ms`
                  }}
                />
              ))}
              
              {/* Premium exclusive milestone badge */}
              {isPremium && (
                <div className="absolute top-2 right-2">
                  <div className="bg-yellow-400 rounded-full p-1 animate-bounce">
                    <Trophy className="w-3 h-3 text-yellow-800" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Premium achievement indicator */}
          {isPremium && value > 0 && value % 100 === 0 && !milestoneAchieved && (
            <div className="absolute top-1 right-1">
              <Star className="w-3 h-3 text-yellow-500 animate-pulse" />
            </div>
          )}

          {/* Bottom Label (Zero) */}
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
            <span className={cn(
              "text-xs font-medium",
              isPremium ? "text-gray-600" : "text-gray-400"
            )}>
              0
            </span>
          </div>
        </div>
      </div>

      {/* Label */}
      <span className={cn(
        "text-xs text-center font-medium max-w-[60px] leading-tight transition-colors duration-300",
        isPremium ? "text-gray-700" : "text-gray-600",
        glowEffect && isPremium && "text-primary font-semibold"
      )}>
        {label}
      </span>
      
      {/* Premium tier indicator */}
      {isPremium && (
        <div className="text-xs text-primary/70 font-medium">
          Premium
        </div>
      )}
    </div>
  );
};