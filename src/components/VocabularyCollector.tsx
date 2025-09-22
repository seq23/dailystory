import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileOptimizedButton } from '@/components/MobileOptimizedButton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Star, TrendingUp } from 'lucide-react';
import { MobileOptimizedInteractiveWord } from '@/components/MobileOptimizedInteractiveWord';
import { useIsMobile } from '@/hooks/use-mobile';
import type { UserInfo } from '@/types';
import { ProductionLogging } from '@/services/ProductionLogger';

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
  enablePersistence?: boolean;
}

export const VocabularyCollector = ({ userInfo, isVisible, onClose, enablePersistence = true }: VocabularyCollectorProps) => {
  const { t } = useTranslation();
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);

  // Load vocabulary from localStorage (only for premium users) + migrate legacy key
  useEffect(() => {
    if (!enablePersistence) return;

    const newKey = `vocabulary_${userInfo.name}`;
    let loaded: VocabularyWord[] = [];

    // Load from new key
    const saved = localStorage.getItem(newKey);
    if (saved) {
      try {
        loaded = JSON.parse(saved).map((word: any) => {
          const diff = (word?.difficulty || '').toLowerCase();
          const normalizedDifficulty = (
            diff === 'beginner' || diff === 'intermediate' || diff === 'advanced'
          ) ? diff : (diff === 'easy' ? 'beginner' : (diff === 'medium' ? 'intermediate' : 'advanced'));
          const dateStr = word?.dateAdded || word?.addedAt || new Date().toISOString();
          return {
            word: word.word,
            definition: word.definition || '',
            translation: word.translation,
            difficulty: normalizedDifficulty,
            dateAdded: new Date(dateStr),
            timesReviewed: typeof word.timesReviewed === 'number' ? word.timesReviewed : 0,
            mastered: !!word.mastered,
            storyContext: word.storyContext || word.context || word.sampleSentence || ''
          } as any;
        });
      } catch (error) {
        ProductionLogging.error('VOCABULARY', 'Error loading vocabulary', 'VocabularyCollector', { error });
      }
    }

    // Merge legacy collection once
    try {
      const migratedFlag = localStorage.getItem(`vocab_migrated_${userInfo.name}`);
      const legacy = localStorage.getItem('vocabulary_collection');
      if (legacy && migratedFlag !== '1') {
        const legacyItems = JSON.parse(legacy).map((word: any) => {
          const diff = (word?.difficulty || '').toLowerCase();
          const normalizedDifficulty = (
            diff === 'beginner' || diff === 'intermediate' || diff === 'advanced'
          ) ? diff : (diff === 'easy' ? 'beginner' : (diff === 'medium' ? 'intermediate' : 'advanced'));
          const dateStr = word?.dateAdded || word?.addedAt || new Date().toISOString();
          return {
            word: word.word,
            definition: word.definition || '',
            translation: word.translation,
            difficulty: normalizedDifficulty,
            dateAdded: new Date(dateStr),
            timesReviewed: typeof word.timesReviewed === 'number' ? word.timesReviewed : 0,
            mastered: !!word.mastered,
            storyContext: word.storyContext || word.context || word.sampleSentence || ''
          } as any;
        });
        const merged = [...loaded];
        for (const w of legacyItems) {
          if (!merged.find(m => m.word?.toLowerCase() === w.word?.toLowerCase())) {
            merged.push(w);
          }
        }
        loaded = merged;
        localStorage.setItem(newKey, JSON.stringify(loaded));
        localStorage.setItem(`vocab_migrated_${userInfo.name}`, '1');
      }
    } catch (e) {
      ProductionLogging.warn('VOCABULARY', 'Vocabulary legacy migration failed', 'VocabularyCollector', { error: e });
    }

    setVocabulary(loaded);
  }, [userInfo.name, enablePersistence]);

  // Save vocabulary to localStorage (only for premium users)
  useEffect(() => {
    if (!enablePersistence) return;
    localStorage.setItem(`vocabulary_${userInfo.name}`, JSON.stringify(vocabulary));
  }, [vocabulary, userInfo.name, enablePersistence]);

  const addWordToVocabulary = (word: VocabularyWord) => {
    if (!enablePersistence) return;
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
    setVocabulary(prev => prev.map(w => {
      if (w.word === word) {
        const newTimes = (w.timesReviewed || 0) + 1;
        return { ...w, timesReviewed: newTimes, mastered: newTimes >= 4 };
      }
      return w;
    }));
  };

  const moveToReview = (word: string) => {
    setVocabulary(prev => prev.map(w =>
      w.word === word
        ? { ...w, timesReviewed: Math.max(2, w.timesReviewed) }
        : w
    ));
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
  const { isMobileOrTablet } = useIsMobile();
  const [activeTab, setActiveTab] = useState<'new' | 'reviewing' | 'mastered'>('new');

  // Expose addWordToVocabulary globally for voice/interactive usage
  useEffect(() => {
    (window as any).addToVocabulary = addWordToVocabulary;
    (window as any).markWordReviewed = (w: string) => {
      try { markAsReviewed(w); } catch {}
    };
    return () => {
      delete (window as any).addToVocabulary;
      delete (window as any).markWordReviewed;
    };
  }, [addWordToVocabulary]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 bg-black/50 xl:items-center xl:p-4">
      <Card className="w-full h-full rounded-none overflow-hidden xl:w-[min(90vw,42rem)] xl:h-auto xl:rounded-xl">
        <CardHeader className="sticky top-0 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('vocabulary.title', 'My Vocabulary Collection')}
            </CardTitle>
            <MobileOptimizedButton variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </MobileOptimizedButton>
          </div>
          <div className="text-sm opacity-90">
            {vocabulary.length} words collected
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          {/* Unified selector for all breakpoints */}
          <div className="p-4 border-b bg-card">
            <Select value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'reviewing' | 'mastered')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('vocabulary.tabs.placeholder', 'Select category')} />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-background">
                <SelectItem value="new">{t('vocabulary.tabs.new', 'New')} ({newWords.length})</SelectItem>
                <SelectItem value="reviewing">{t('vocabulary.tabs.reviewing', 'Reviewing')} ({reviewing.length})</SelectItem>
                <SelectItem value="mastered">{t('vocabulary.tabs.mastered', 'Mastered')} ({mastered.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto xl:max-h-[70vh] p-4 space-y-3">
            {((activeTab === 'new' ? newWords : activeTab === 'reviewing' ? reviewing : mastered).length === 0) ? (
              <div className="text-center text-gray-500 py-8">
                {activeTab === 'new' ? (
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                ) : activeTab === 'reviewing' ? (
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                ) : (
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                )}
                <p>{activeTab === 'new' ? t('vocabulary.empty.new', 'No new words yet!') : activeTab === 'reviewing' ? t('vocabulary.empty.reviewing', 'No words to review!') : t('vocabulary.empty.mastered', 'No mastered words yet!')}</p>
              </div>
            ) : (
              (activeTab === 'new' ? newWords : activeTab === 'reviewing' ? reviewing : mastered).map((word) => (
                <WordCard 
                  key={word.word}
                  word={word}
                  userInfo={userInfo}
                  getDifficultyColor={getDifficultyColor}
                  category={activeTab}
                  onMoveToReview={moveToReview}
                  onMarkReviewed={markAsReviewed}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface WordCardProps {
  word: VocabularyWord;
  userInfo: UserInfo;
  getDifficultyColor: (difficulty: string) => string;
  category: 'new' | 'reviewing' | 'mastered';
  onMoveToReview?: (word: string) => void;
  onMarkReviewed?: (word: string) => void;
}

const WordCard = ({ 
  word,
  userInfo,
  getDifficultyColor,
  category,
  onMoveToReview,
  onMarkReviewed
}: WordCardProps) => {
  const { t } = useTranslation();
  const modalDifficulty = word.difficulty === 'beginner' ? 'easy' : word.difficulty === 'intermediate' ? 'medium' : 'hard';

  return (
    <div className="border rounded-lg p-3 bg-background hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <MobileOptimizedInteractiveWord
          word={word.word}
          forceModal
          userInfo={userInfo}
          difficulty={modalDifficulty as any}
          sentenceContext={word.storyContext || ''}
          wordAlreadySaved
        />
        <Badge className={getDifficultyColor(word.difficulty)}>
          {word.difficulty}
        </Badge>
      </div>
      {word.storyContext && (
        <p className="text-muted-foreground text-sm mt-1">"{word.storyContext}"</p>
      )}
      {category === 'new' && (
        <div className="mt-2">
          <MobileOptimizedButton size="sm" variant="outline" onClick={() => onMoveToReview?.(word.word)}>
            {t('vocabulary.actions.moveToReview', 'Move to Review')}
          </MobileOptimizedButton>
        </div>
      )}
      {category === 'reviewing' && (
        <div className="mt-2 flex gap-2">
          <MobileOptimizedButton size="sm" variant="default" onClick={() => onMarkReviewed?.(word.word)}>
            {t('vocabulary.actions.markReviewed', 'Mark as Reviewed')}
          </MobileOptimizedButton>
        </div>
      )}
    </div>
  );
};
