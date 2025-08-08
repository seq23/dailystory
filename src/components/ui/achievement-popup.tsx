import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Star, Trophy, Target, Sparkles } from 'lucide-react';
import { Card, CardContent } from './card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'special' | 'level';
  points: number;
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementPopupProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/30',
    border: 'border-gray-300',
    particles: 'text-gray-400',
    bg: 'from-gray-50 to-gray-100'
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/40',
    border: 'border-blue-300',
    particles: 'text-blue-400',
    bg: 'from-blue-50 to-blue-100'
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-300',
    particles: 'text-purple-400',
    bg: 'from-purple-50 to-purple-100'
  },
  legendary: {
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    glow: 'shadow-amber-500/60',
    border: 'border-amber-300',
    particles: 'text-amber-400',
    bg: 'from-amber-50 to-orange-100'
  }
};

const getAchievementIcon = (type: Achievement['type']) => {
  switch (type) {
    case 'milestone':
      return Target;
    case 'streak':
      return Sparkles;
    case 'level':
      return Star;
    case 'special':
      return Trophy;
    default:
      return Star;
  }
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  isVisible,
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const rarity = rarityConfig[achievement.rarity];
  const IconComponent = getAchievementIcon(achievement.type);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      
      // Generate particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2000
      }));
      setParticles(newParticles);

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    setShouldShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Achievement Card */}
      <Card className={cn(
        "relative overflow-hidden max-w-md w-full",
        "transform transition-all duration-300",
        shouldShow ? "scale-100 opacity-100" : "scale-95 opacity-0",
        rarity.border,
        `bg-gradient-to-br ${rarity.bg}`,
        "shadow-2xl",
        rarity.glow
      )}>
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map(particle => (
            <div
              key={particle.id}
              className={cn(
                "absolute w-2 h-2 rounded-full animate-float",
                rarity.particles
              )}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}ms`,
                animationDuration: '3s'
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Rarity border glow */}
        <div className={cn(
          "absolute inset-0 rounded-lg opacity-50",
          `bg-gradient-to-r ${rarity.gradient}`,
          "animate-pulse"
        )} 
        style={{ 
          padding: '2px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor'
        }} />

        <CardContent className="p-6 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Achievement content */}
          <div className="text-center">
            {/* Rarity badge */}
            <div className="mb-4">
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                `bg-gradient-to-r ${rarity.gradient} text-white`,
                "shadow-lg"
              )}>
                {achievement.rarity}
              </span>
            </div>

            {/* Icon */}
            <div className={cn(
              "mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center",
              `bg-gradient-to-br ${rarity.gradient}`,
              "text-white shadow-lg",
              "animate-bounce"
            )}>
              <IconComponent className="w-8 h-8" />
            </div>

            {/* Title and description */}
            <h3 className="text-xl font-bold text-foreground mb-2">
              {achievement.title}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              {achievement.description}
            </p>

            {/* Points */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-amber-600">
                +{achievement.points} points
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={handleClose}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all duration-200",
                `bg-gradient-to-r ${rarity.gradient}`,
                "text-white shadow-lg hover:shadow-xl",
                "transform hover:scale-105"
              )}
            >
              Awesome! 🎉
            </button>
          </div>
        </CardContent>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer opacity-0" />
      </Card>
    </div>
  );
};