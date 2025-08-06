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
  // Level 3+ (hard/expert) should have author voice patterns  
  const hasAuthorVoice = difficulty === 'hard' || difficulty === 'expert';

  if (!hasAuthorVoice) {
    return (
      <Badge variant="outline" className={`${className} text-muted-foreground`}>
        <BookOpen className="w-3 h-3 mr-1" />
        Simple Stories
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`${className} bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200`}>
      <Sparkles className="w-3 h-3 mr-1" />
      Enhanced Storytelling
    </Badge>
  );
};