import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, X, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Achievement } from "@/services/gamificationService";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  isVisible: boolean;
}

export const AchievementNotification = ({ 
  achievement, 
  onClose, 
  isVisible 
}: AchievementNotificationProps) => {
  const { t } = useTranslation();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      // Auto-close after 8 seconds for kids
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setShouldShow(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const getRarityConfig = (rarity: Achievement['rarity']) => {
    const rarityText = t(`gamification.achievements.rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`);
    
    switch (rarity) {
      case 'common':
        return {
          bgClass: 'from-green-400 via-green-500 to-green-600',
          textClass: 'text-green-50',
          borderClass: 'border-green-300',
          badgeClass: 'bg-green-200 text-green-800',
          rarityText
        };
      case 'rare':
        return {
          bgClass: 'from-blue-400 via-blue-500 to-blue-600',
          textClass: 'text-blue-50',
          borderClass: 'border-blue-300',
          badgeClass: 'bg-blue-200 text-blue-800',
          rarityText
        };
      case 'epic':
        return {
          bgClass: 'from-purple-400 via-purple-500 to-purple-600',
          textClass: 'text-purple-50',
          borderClass: 'border-purple-300',
          badgeClass: 'bg-purple-200 text-purple-800',
          rarityText
        };
      case 'legendary':
        return {
          bgClass: 'from-yellow-400 via-amber-500 to-orange-600',
          textClass: 'text-yellow-50',
          borderClass: 'border-yellow-300',
          badgeClass: 'bg-yellow-200 text-yellow-800',
          rarityText
        };
      default:
        return {
          bgClass: 'from-gray-400 via-gray-500 to-gray-600',
          textClass: 'text-gray-50',
          borderClass: 'border-gray-300',
          badgeClass: 'bg-gray-200 text-gray-800',
          rarityText: 'ACHIEVEMENT'
        };
    }
  };

  const config = getRarityConfig(achievement.rarity);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div 
        className={`transform transition-all duration-500 ${
          shouldShow 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-75 opacity-0 translate-y-8'
        }`}
      >
        <Card className={`w-[350px] sm:w-[400px] bg-gradient-to-br ${config.bgClass} border-3 ${config.borderClass} shadow-2xl overflow-hidden relative`}>
          {/* Floating sparkles animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                <Star className="w-3 h-3 text-white/80" />
              </div>
            ))}
          </div>

          {/* Close button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 z-10 ${config.textClass} hover:bg-white/20 p-1`}
          >
            <X className="w-4 h-4" />
          </Button>

          <CardContent className="p-0 relative z-10">
            {/* Header */}
            <div className="text-center py-6 px-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <span className="text-4xl animate-bounce">{achievement.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 animate-spin-slow">
                    <Trophy className="w-8 h-8 text-yellow-300" />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <Badge className={`${config.badgeClass} text-xs font-semibold px-3 py-1 mb-2`}>
                  {config.rarityText}
                </Badge>
              </div>
              
              <h2 className={`text-2xl font-bold ${config.textClass} mb-2`}>
                🎉 {t('gamification.achievements.unlocked')}
              </h2>
              
              <h3 className={`text-xl font-semibold ${config.textClass} mb-3`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm ${config.textClass} opacity-90 leading-relaxed`}>
                {achievement.description}
              </p>
            </div>

            {/* Points section */}
            <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className={`w-5 h-5 ${config.textClass}`} />
                  <span className={`font-semibold ${config.textClass}`}>
                    {t('gamification.achievements.pointsEarned', { points: achievement.points })}
                  </span>
                </div>
                <Button
                  onClick={handleClose}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                >
                  {t('gamification.achievements.awesome')}
                </Button>
              </div>
            </div>
          </CardContent>

          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-lg border-2 border-white/30 animate-pulse pointer-events-none"></div>
        </Card>
      </div>
    </div>
  );
};