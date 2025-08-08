import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SparkleAnimation } from './SparkleAnimation';
import { Crown, Star, Trophy, Sparkles, Zap } from 'lucide-react';

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

const colorThemes = {
  blue: {
    free: {
      gradient: 'from-blue-400/80 via-blue-500/80 to-blue-600/80',
      shadow: 'shadow-blue-500/20',
      glow: 'shadow-blue-500/40 shadow-2xl',
      border: 'border-blue-300/60',
      accent: 'bg-blue-500'
    },
    premium: {
      gradient: 'from-blue-500/90 via-cyan-500/90 to-blue-700/90',
      shadow: 'shadow-blue-500/30',
      glow: 'shadow-cyan-500/60 shadow-2xl',
      border: 'border-cyan-400/80',
      accent: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    }
  },
  green: {
    free: {
      gradient: 'from-green-400/80 via-green-500/80 to-green-600/80',
      shadow: 'shadow-green-500/20',
      glow: 'shadow-green-500/40 shadow-2xl',
      border: 'border-green-300/60',
      accent: 'bg-green-500'
    },
    premium: {
      gradient: 'from-green-500/90 via-emerald-500/90 to-teal-600/90',
      shadow: 'shadow-emerald-500/30',
      glow: 'shadow-emerald-500/60 shadow-2xl',
      border: 'border-emerald-400/80',
      accent: 'bg-gradient-to-r from-green-500 to-emerald-500'
    }
  },
  gold: {
    free: {
      gradient: 'from-yellow-400/80 via-amber-500/80 to-orange-500/80',
      shadow: 'shadow-amber-500/20',
      glow: 'shadow-amber-500/40 shadow-2xl',
      border: 'border-amber-300/60',
      accent: 'bg-amber-500'
    },
    premium: {
      gradient: 'from-amber-400/90 via-yellow-500/90 to-orange-600/90',
      shadow: 'shadow-amber-500/30',
      glow: 'shadow-yellow-500/60 shadow-2xl',
      border: 'border-yellow-400/80',
      accent: 'bg-gradient-to-r from-amber-500 to-yellow-500'
    }
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
  const [celebrationPulse, setCelebrationPulse] = useState(false);

  const percentage = Math.min((value / maxValue) * 100, 100);
  const hasIncreased = value > previousValue;
  
  // Calculate milestone thresholds
  const milestoneThreshold = isPremium ? 25 : 50;
  const isAtMilestone = value > 0 && value % milestoneThreshold === 0;

  // Get theme colors
  const theme = colorThemes[color][isPremium ? 'premium' : 'free'];

  // Trigger sparkle animation when value increases
  useEffect(() => {
    if (hasIncreased) {
      setSparkleActive(true);
      setGlowEffect(true);
      setCelebrationPulse(true);
      
      // Check for milestone
      if (isAtMilestone) {
        setMilestoneAchieved(true);
        onMilestone?.(value);
        
        setTimeout(() => setMilestoneAchieved(false), 4000);
      }
      
      setTimeout(() => {
        setSparkleActive(false);
        setGlowEffect(false);
        setCelebrationPulse(false);
      }, isPremium ? 3000 : 2000);
    }
  }, [value, hasIncreased, isAtMilestone, isPremium, onMilestone]);

  return (
    <div className={cn(
      "group relative transition-all duration-500 ease-out",
      "hover:scale-105 hover:-translate-y-1",
      className
    )}>
      {/* Glass morphism container */}
      <div className={cn(
        "relative backdrop-blur-xl bg-white/20 rounded-2xl p-4 border transition-all duration-500",
        theme.border,
        theme.shadow,
        glowEffect && theme.glow,
        isPremium && "bg-gradient-to-br from-white/30 via-white/20 to-white/10",
        milestoneAchieved && "animate-pulse ring-4 ring-yellow-400/60 ring-offset-2"
      )}>
        
        {/* Premium crown indicator with enhanced styling */}
        {isPremium && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-2">
                <Crown className="w-4 h-4 text-yellow-900" />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Sparkle Animation */}
        <SparkleAnimation 
          isActive={sparkleActive}
          intensity={milestoneAchieved ? 'high' : 'medium'}
          isPremium={isPremium}
        />

        {/* Floating particles effect for premium */}
        {isPremium && glowEffect && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-bounce"
                style={{
                  left: `${20 + (i * 12)}%`,
                  top: `${10 + (i * 8)}%`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}

        {/* Icon and Value with enhanced styling */}
        <div className="flex flex-col items-center gap-3 relative">
          <div className="relative">
            {/* Icon glow effect */}
            {glowEffect && (
              <div className={cn(
                "absolute inset-0 rounded-full blur-lg opacity-60",
                theme.accent
              )}></div>
            )}
            
            <div className={cn(
              "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
              "bg-gradient-to-br shadow-lg border border-white/30",
              theme.gradient,
              glowEffect && "scale-110 shadow-2xl",
              celebrationPulse && "animate-pulse",
              isPremium && "backdrop-blur-sm"
            )}>
              <div className={cn(
                "text-white transition-all duration-300",
                glowEffect && "scale-125"
              )}>
                {icon}
              </div>
              
              {/* Magic sparkle for premium */}
              {isPremium && isActive && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Value Display */}
          <div className="relative text-center">
            <div className={cn(
              "text-lg font-bold transition-all duration-300",
              isPremium ? "text-white" : "text-gray-800",
              glowEffect && "scale-110 font-black text-white",
              isPremium && "drop-shadow-lg"
            )}>
              {value}
              {glowEffect && isPremium && (
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm -z-10"></div>
              )}
            </div>
            
            {/* Premium progress prediction with enhanced styling */}
            {isPremium && showPrediction && value > 0 && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                  <span className="text-xs text-white/80 whitespace-nowrap font-medium">
                    Next: {Math.ceil(value / milestoneThreshold) * milestoneThreshold}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Tower Container */}
        <div className="relative mt-4">
          {/* Premium ambient glow */}
          {isPremium && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent rounded-xl -m-2"></div>
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-30",
                theme.glow.replace('shadow-2xl', 'blur-xl')
              )}></div>
            </>
          )}
          
          {/* Tower Background with glassmorphism */}
          <div className={cn(
            "w-16 h-40 relative overflow-hidden transition-all duration-500 rounded-xl",
            "bg-gradient-to-t from-white/40 via-white/20 to-white/10 backdrop-blur-sm",
            "border-2 border-white/30 shadow-inner",
            glowEffect && "scale-105 shadow-2xl",
            milestoneAchieved && "ring-2 ring-yellow-400/80 shadow-yellow-400/30"
          )}>
            
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-12 animate-pulse"></div>
            </div>

            {/* Max value label with enhanced styling */}
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                <span className={cn(
                  "text-xs font-bold",
                  isPremium ? "text-white" : "text-gray-700"
                )}>
                  {maxValue}
                </span>
              </div>
            </div>

            {/* Enhanced Progress Fill with liquid effect */}
            <div
              className={cn(
                "absolute bottom-0 w-full bg-gradient-to-t transition-all duration-1000 ease-out rounded-b-xl overflow-hidden",
                theme.gradient,
                milestoneAchieved && "animate-pulse",
                isPremium && "shadow-inner backdrop-blur-sm"
              )}
              style={{ height: `${percentage}%` }}
            >
              {/* Liquid wave effect for premium */}
              {isPremium && percentage > 10 && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-pulse"></div>
              )}
              
              {/* Progress shimmer effect */}
              {glowEffect && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              )}
            </div>

            {/* Enhanced Celebration Effect */}
            {milestoneAchieved && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Confetti explosion */}
                {(isPremium ? [...Array(15)] : [...Array(10)]).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute rounded-full animate-ping",
                      isPremium ? "w-3 h-3" : "w-2 h-2",
                      i % 3 === 0 ? "bg-yellow-400" : i % 3 === 1 ? "bg-pink-400" : "bg-blue-400"
                    )}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
                
                {/* Premium exclusive effects */}
                {isPremium && (
                  <>
                    {/* Lightning bolt effect */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
                    </div>
                    
                    {/* Milestone badge */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-2 animate-bounce shadow-lg">
                        <Trophy className="w-4 h-4 text-yellow-900" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Zero label with enhanced styling */}
            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                <span className={cn(
                  "text-xs font-bold",
                  isPremium ? "text-white" : "text-gray-700"
                )}>
                  0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Label */}
        <div className="mt-6 text-center">
          <div className={cn(
            "text-sm font-bold transition-colors duration-300 leading-tight",
            isPremium ? "text-white drop-shadow-lg" : "text-gray-800",
            glowEffect && isPremium && "text-yellow-100 scale-105"
          )}>
            {label}
          </div>
          
          {/* Premium tier indicator with enhanced styling */}
          {isPremium && (
            <div className="mt-2 inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-yellow-400/30">
              <Crown className="w-3 h-3 text-yellow-300" />
              <span className="text-xs text-yellow-200 font-medium">Premium</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};