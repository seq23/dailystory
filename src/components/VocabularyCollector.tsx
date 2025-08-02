import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Star, TrendingUp, Volume2, Trash2, Plus } from 'lucide-react';
import { createOpenAITTSService } from '@/services/textToSpeechService';
import type { UserInfo } from '@/types';

interface VocabularyWord {
  word: string;
  definition: string;
  translation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dateAdded: Date;
  timesReviewed: number;
  mastered: boolean;
  storyContext?: string;
}

interface VocabularyCollectorProps {
  userInfo: UserInfo;
  isVisible: boolean;
  onClose: () => void;
}

export const VocabularyCollector = ({ userInfo, isVisible, onClose }: VocabularyCollectorProps) => {
  const { t } = useTranslation();
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [ttsService] = useState(() => createOpenAITTSService(userInfo));
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Load vocabulary from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`vocabulary_${userInfo.name}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((word: any) => ({
          ...word,
          dateAdded: new Date(word.dateAdded)
        }));
        setVocabulary(parsed);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      }
    }
  }, [userInfo.name]);

  // Save vocabulary to localStorage
  useEffect(() => {
    if (vocabulary.length > 0) {
      localStorage.setItem(`vocabulary_${userInfo.name}`, JSON.stringify(vocabulary));
    }
  }, [vocabulary, userInfo.name]);

  const addWordToVocabulary = (word: VocabularyWord) => {
    setVocabulary(prev => {
      const exists = prev.find(w => w.word.toLowerCase() === word.word.toLowerCase());
      if (exists) return prev;
      return [...prev, word];
    });
  };

  const removeWord = (wordToRemove: string) => {
    setVocabulary(prev => prev.filter(w => w.word !== wordToRemove));
  };

  const markAsReviewed = (word: string) => {
    setVocabulary(prev => prev.map(w => 
      w.word === word 
        ? { ...w, timesReviewed: w.timesReviewed + 1, mastered: w.timesReviewed >= 4 }
        : w
    ));
  };

  const playPronunciation = async (word: string) => {
    if (playingWord) return;
    
    setPlayingWord(word);
    try {
      // Use the slow speed setting for pronunciation - slower for non-native speakers
      const speed = userInfo.nativeLanguage === 'en' ? 0.7 : 0.6;
      await ttsService.speakText(word, { speed });
    } catch (error) {
      console.error('Pronunciation error:', error);
    } finally {
      setPlayingWord(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWordsByCategory = () => {
    const newWords = vocabulary.filter(w => w.timesReviewed < 2);
    const reviewing = vocabulary.filter(w => w.timesReviewed >= 2 && !w.mastered);
    const mastered = vocabulary.filter(w => w.mastered);
    return { newWords, reviewing, mastered };
  };

  const { newWords, reviewing, mastered } = getWordsByCategory();

  // Expose addWordToVocabulary globally for InteractiveWord component
  useEffect(() => {
    (window as any).addToVocabulary = addWordToVocabulary;
    return () => {
      delete (window as any).addToVocabulary;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('vocabulary.title', 'My Vocabulary Collection')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
          <div className="text-sm opacity-90">
            {vocabulary.length} words collected
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new" className="flex items-center gap-1">
                <Plus className="w-3 h-3" />
                New ({newWords.length})
              </TabsTrigger>
              <TabsTrigger value="reviewing" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Reviewing ({reviewing.length})
              </TabsTrigger>
              <TabsTrigger value="mastered" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Mastered ({mastered.length})
              </TabsTrigger>
            </TabsList>

            <div className="max-h-96 overflow-y-auto">
              <TabsContent value="new" className="p-4 space-y-3">
                {newWords.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No new words yet!</p>
                    <p className="text-sm">Click on words in stories to add them here.</p>
                  </div>
                ) : (
                  newWords.map((word) => (
                    <WordCard 
                      key={word.word} 
                      word={word} 
                      playingWord={playingWord}
                      onPlay={playPronunciation}
                      onReview={markAsReviewed}
                      onRemove={removeWord}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="reviewing" className="p-4 space-y-3">
                {reviewing.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No words to review!</p>
                  </div>
                ) : (
                  reviewing.map((word) => (
                    <WordCard 
                      key={word.word} 
                      word={word} 
                      playingWord={playingWord}
                      onPlay={playPronunciation}
                      onReview={markAsReviewed}
                      onRemove={removeWord}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="mastered" className="p-4 space-y-3">
                {mastered.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No mastered words yet!</p>
                    <p className="text-sm">Keep reviewing to master your vocabulary.</p>
                  </div>
                ) : (
                  mastered.map((word) => (
                    <WordCard 
                      key={word.word} 
                      word={word} 
                      playingWord={playingWord}
                      onPlay={playPronunciation}
                      onReview={markAsReviewed}
                      onRemove={removeWord}
                      getDifficultyColor={getDifficultyColor}
                      showMasteredBadge
                    />
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface WordCardProps {
  word: VocabularyWord;
  playingWord: string | null;
  onPlay: (word: string) => void;
  onReview: (word: string) => void;
  onRemove: (word: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  showMasteredBadge?: boolean;
}

const WordCard = ({ 
  word, 
  playingWord, 
  onPlay, 
  onReview, 
  onRemove, 
  getDifficultyColor, 
  showMasteredBadge 
}: WordCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{word.word}</h3>
            <Badge className={getDifficultyColor(word.difficulty)}>
              {word.difficulty}
            </Badge>
            {showMasteredBadge && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Star className="w-3 h-3 mr-1" />
                Mastered
              </Badge>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">{word.definition}</p>
          {word.translation && (
            <p className="text-blue-600 text-sm italic">{word.translation}</p>
          )}
          {word.storyContext && (
            <p className="text-gray-500 text-xs mt-1">
              Context: "{word.storyContext}"
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPlay(word.word)}
            disabled={playingWord === word.word}
            className="text-xs"
          >
            <Volume2 className="w-3 h-3 mr-1" />
            {playingWord === word.word ? 'Playing...' : 'Hear'}
          </Button>
          
          {!word.mastered && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReview(word.word)}
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Review
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Reviewed {word.timesReviewed}x</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(word.word)}
            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};