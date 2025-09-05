// Voice Style Indicator - Shows users when they have enhanced storytelling
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen } from 'lucide-react';
import type { DifficultyLevel } from '@/types';
// import { DifficultyManager } from '@/services/difficultyManager';

interface VoiceStyleIndicatorProps {
  difficulty: DifficultyLevel;
  className?: string;
}

export const AuthorVoiceIndicator: React.FC<VoiceStyleIndicatorProps> = ({ 
  difficulty, 
  className = "" 
}) => {
  // All difficulty levels now have voice style patterns in the unified system
  const hasVoiceStyle = true;

  const getStyleForDifficulty = () => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-gradient-to-r from-red-100 to-yellow-100 text-red-700 border-red-200';
      case 'easy':
        return 'bg-gradient-to-r from-green-100 to-purple-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border-orange-200';
      case 'hard':
        return 'bg-gradient-to-r from-blue-100 to-amber-100 text-blue-700 border-blue-200';
      case 'expert':
        return 'bg-gradient-to-r from-slate-100 to-teal-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200';
    }
  };

  const getStyleDescriptor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'Gentle & Playful Style';
      case 'easy':
        return 'Curious & Cheerful Style';
      case 'medium':
        return 'Brave & Creative Style';
      case 'hard':
        return 'Epic & Mysterious Style';
      case 'expert':
        return 'Complex & Visionary Style';
      default:
        return 'Enhanced Storytelling';
    }
  };

  return (
    <Badge variant="secondary" className={`${className} ${getStyleForDifficulty()}`}>
      <Sparkles className="w-3 h-3 mr-1" />
      {getStyleDescriptor()}
    </Badge>
  );
};