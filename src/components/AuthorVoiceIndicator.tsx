// Author Voice Indicator - Shows users when they have enhanced storytelling
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen } from 'lucide-react';
import type { DifficultyLevel } from '@/types';
// import { DifficultyManager } from '@/services/difficultyManager';

interface AuthorVoiceIndicatorProps {
  difficulty: DifficultyLevel;
  className?: string;
}

export const AuthorVoiceIndicator: React.FC<AuthorVoiceIndicatorProps> = ({ 
  difficulty, 
  className = "" 
}) => {
  // All difficulty levels now have author voice patterns in the 10-author system
  const hasAuthorVoice = true;

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

  const getAuthorPair = () => {
    switch (difficulty) {
      case 'beginner':
        return 'Eric Carle & Sandra Boynton Style';
      case 'easy':
        return 'Mo Willems & Arnold Lobel Style';
      case 'medium':
        return 'Beverly Cleary & Roald Dahl Style';
      case 'hard':
        return 'Rick Riordan & J.K. Rowling Style';
      case 'expert':
        return 'Suzanne Collins & Madeleine L\'Engle Style';
      default:
        return 'Author Voice Storytelling';
    }
  };

  return (
    <Badge variant="secondary" className={`${className} ${getStyleForDifficulty()}`}>
      <Sparkles className="w-3 h-3 mr-1" />
      {getAuthorPair()}
    </Badge>
  );
};