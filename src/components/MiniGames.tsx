
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, CheckCircle, XCircle, Star, Target, RotateCcw } from 'lucide-react';
import type { UserInfo } from '@/types';
import { saveGameSession } from '@/hooks/useActivityPersistence';
import { useToast } from '@/components/ui/use-toast';

interface MiniGameProps {
  userInfo: UserInfo;
  storyText: string;
  isVisible: boolean;
  onComplete: (score: number) => void;
  onClose: () => void;
}

type GameType = 'word-match' | 'character-emotion' | 'sequence';

interface WordMatchGame {
  type: 'word-match';
  word: string;
  options: string[];
  correctDefinition: string;
  correctIndex: number;
}

interface EmotionGame {
  type: 'character-emotion';
  scenario: string;
  options: string[];
  correctIndex: number;
}

interface SequenceGame {
  type: 'sequence';
  events: string[];
  shuffledEvents: string[];
  correctOrder: number[];
}

type Game = WordMatchGame | EmotionGame | SequenceGame;

export const MiniGames = ({ userInfo, storyText, isVisible, onComplete, onClose }: MiniGameProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [score, setScore] = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [typesPlayed, setTypesPlayed] = useState<GameType[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      setStartedAt(Date.now());
      setTypesPlayed([]);
      generateRandomGame();
    }
  }, [isVisible, storyText]);

  const generateRandomGame = () => {
    const gameTypes: GameType[] = ['word-match', 'character-emotion'];
    if (userInfo.age >= 7) {
      gameTypes.push('sequence');
    }
    
    const randomType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const game = generateGameByType(randomType);
    setCurrentGame(game);
    setSelectedAnswer(null);
    setShowResult(false);
    setTypesPlayed(prev => (prev.includes(randomType) ? prev : [...prev, randomType]));
  };

  const generateGameByType = (type: GameType): Game => {
    switch (type) {
      case 'word-match':
        return generateWordMatchGame();
      case 'character-emotion':
        return generateEmotionGame();
      case 'sequence':
        return generateSequenceGame();
      default:
        return generateWordMatchGame();
    }
  };

  const generateWordMatchGame = (): WordMatchGame => {
    const words = extractWordsFromStory();
    const targetWord = words[Math.floor(Math.random() * words.length)];
    
    const definitions = [
      `A ${targetWord.length <= 4 ? 'short' : 'longer'} word from the story`,
      'Something you eat',
      'A color',
      'An animal'
    ];
    
    const correctIndex = 0;
    const shuffledDefinitions = [...definitions];
    
    return {
      type: 'word-match',
      word: targetWord,
      options: shuffledDefinitions,
      correctDefinition: definitions[0],
      correctIndex
    };
  };

  const generateEmotionGame = (): EmotionGame => {
    const scenarios = [
      'When the character found something special, they felt...',
      'When the character met a new friend, they felt...',
      'When the character went on an adventure, they felt...',
      'When the character helped someone, they felt...'
    ];
    
    const emotions = ['Happy', 'Excited', 'Proud', 'Surprised'];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      type: 'character-emotion',
      scenario: randomScenario,
      options: emotions,
      correctIndex: 0 // Default to positive emotions for children's stories
    };
  };

  const generateSequenceGame = (): SequenceGame => {
    const events = [
      'The story began',
      'The character met someone new',
      'They went on an adventure',
      'The story ended happily'
    ];
    
    const shuffledEvents = [...events].sort(() => Math.random() - 0.5);
    const correctOrder = events.map(event => shuffledEvents.indexOf(event));
    
    return {
      type: 'sequence',
      events,
      shuffledEvents,
      correctOrder
    };
  };

  const extractWordsFromStory = (): string[] => {
    return storyText
      .split(/\s+/)
      .map(word => word.replace(/[.,!?;:'"()]/g, ''))
      .filter(word => word.length > 3 && word.length < 8)
      .slice(0, 10);
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentGame) return;

    const isCorrect = currentGame.type === 'sequence' ? false : selectedAnswer === currentGame.correctIndex;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      setGamesCompleted(gamesCompleted + 1);
      
      if (gamesCompleted >= 2) {
        setGameComplete(true);
      } else {
        generateRandomGame();
      }
    }, 2000);
  };

  const handleRestart = () => {
    setScore(0);
    setGamesCompleted(0);
    setGameComplete(false);
    setTypesPlayed([]);
    setStartedAt(Date.now());
    generateRandomGame();
  };

  const handleComplete = async () => {
    const durationSeconds = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : null;

    try {
      const details = {
        roundsPlayed: gamesCompleted,
        typesPlayed,
      };
      const result = await saveGameSession({
        score,
        maxScore: 3,
        storyText: storyText || '',
        language: i18n.language || 'en',
        gameType: 'mixed',
        durationSeconds: durationSeconds ?? undefined,
        userInfo,
        details,
      });

      if (result.method === 'supabase') {
        toast({ title: t('postSession.saved', 'Progress saved'), description: t('postSession.savedCloud', 'Saved to your account'), });
      } else {
        toast({ title: t('postSession.savedLocally', 'Saved locally'), description: t('postSession.savedQueue', 'Will sync when logged in'), });
      }
    } catch (e: any) {
      console.warn('[games] save failed', e);
      toast({ title: t('postSession.saveFailed', 'Could not save'), description: e?.message || 'Unknown error' });
    }

    onComplete(score);
    onClose();
  };

  if (!isVisible || !currentGame) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t('miniGames.title', 'Reading Games')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
          <div className="flex justify-between text-sm opacity-90">
            <span>Game {gamesCompleted + 1} of 3</span>
            <span>Score: {score}</span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!gameComplete ? (
            <div className="space-y-4">
              {/* Game Title */}
              <div className="text-center">
                <Badge className="mb-2">
                  {currentGame.type === 'word-match' && 'Word Match'}
                  {currentGame.type === 'character-emotion' && 'Emotion Game'}
                  {currentGame.type === 'sequence' && 'Story Order'}
                </Badge>
              </div>

              {/* Game Content */}
              {currentGame.type === 'word-match' && (
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-purple-600 mb-2">"{currentGame.word}"</h3>
                    <p className="text-sm text-gray-600">What does this word mean?</p>
                  </div>
                  
                  <div className="space-y-2">
                    {currentGame.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                          selectedAnswer === index
                            ? showResult
                              ? index === currentGame.correctIndex
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option}
                        {showResult && selectedAnswer === index && (
                          <span className="float-right">
                            {index === currentGame.correctIndex ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentGame.type === 'character-emotion' && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-lg mb-4">{currentGame.scenario}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {currentGame.options.map((emotion, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          selectedAnswer === index
                            ? showResult
                              ? index === currentGame.correctIndex
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {emotion === 'Happy' && '😊'}
                          {emotion === 'Excited' && '🤩'}
                          {emotion === 'Proud' && '😌'}
                          {emotion === 'Surprised' && '😮'}
                        </div>
                        <div className="text-sm">{emotion}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {!showResult && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}

              {/* Result */}
              {showResult && (
                <div className="text-center">
                  <div className="text-lg mb-2">
                    {currentGame.type !== 'sequence' && selectedAnswer === currentGame.correctIndex ? (
                      <span className="text-green-600 font-bold">✓ Correct!</span>
                    ) : (
                      <span className="text-red-600 font-bold">✗ Try again next time!</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {gamesCompleted < 2 ? 'Next game coming up...' : 'All games complete!'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl">
                {score === 3 ? '🏆' : score >= 2 ? '🌟' : '👍'}
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {score === 3 ? 'Perfect!' : score >= 2 ? 'Great job!' : 'Good try!'}
                </h3>
                <p className="text-gray-600">You scored {score} out of 3!</p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button onClick={handleComplete}>
                  <Star className="w-4 h-4 mr-2" />
                  Continue Reading
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
