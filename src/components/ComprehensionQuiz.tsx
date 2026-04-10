import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileOptimizedButton } from '@/components/MobileOptimizedButton';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Star, ArrowRight, RotateCcw } from 'lucide-react';
import type { UserInfo } from '@/types';
import { saveQuizAttempt } from '@/hooks/useActivityPersistence';
import { useToast } from '@/components/ui/use-toast';
import { DebugLogger } from '@/services/DebugLogger';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'multiple-choice' | 'true-false' | 'character-emotion';
}

interface ComprehensionQuizProps {
  userInfo: UserInfo;
  storyText: string;
  isVisible: boolean;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

// Simple hash for caching quiz per story
const hashStory = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < Math.min(text.length, 500); i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return `quiz_${hash}`;
};

export const ComprehensionQuiz = ({ 
  userInfo, 
  storyText, 
  isVisible, 
  onComplete, 
  onClose 
}: ComprehensionQuizProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && storyText) {
      DebugLogger.log('ui', 'Generating AI quiz questions for story', {
        storyLength: storyText.length,
        userAge: userInfo.age,
      });
      fetchQuizQuestions();
    }
  }, [isVisible, storyText, userInfo]);

  const fetchQuizQuestions = async () => {
    setIsGeneratingQuestions(true);
    setGenerationError(null);

    // Check sessionStorage cache first
    const cacheKey = hashStory(storyText);
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Question[];
        if (parsed.length > 0) {
          DebugLogger.log('ui', 'Using cached quiz questions');
          setQuestions(parsed);
          setAnswers(new Array(parsed.length).fill(null));
          setIsGeneratingQuestions(false);
          return;
        }
      }
    } catch {}

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          storyText,
          age: userInfo.age,
          difficulty: userInfo.difficultyLevel || 'easy',
          language: i18n.language || 'en',
        },
      });

      if (error) throw new Error(error.message || 'Quiz generation failed');
      if (!data?.questions?.length) throw new Error('No questions returned');

      const generated: Question[] = data.questions;
      setQuestions(generated);
      setAnswers(new Array(generated.length).fill(null));

      // Cache for retries
      try { sessionStorage.setItem(cacheKey, JSON.stringify(generated)); } catch {}
    } catch (err: any) {
      DebugLogger.error('ui', 'AI quiz generation failed', err);
      setGenerationError(err?.message || 'Could not generate quiz');
      toast({
        title: t('comprehension.errorTitle', 'Quiz unavailable'),
        description: t('comprehension.errorDesc', 'Could not generate quiz questions. Please try again later.'),
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
    }, 2000);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setQuizComplete(false);
  };

  const handleComplete = async () => {
    try {
      const details = {
        answers,
        questions: questions.map(q => ({ id: q.id, type: q.type })),
      };
      const result = await saveQuizAttempt({
        score,
        totalQuestions: questions.length,
        storyText: storyText || '',
        language: i18n.language || 'en',
        userInfo,
        mode: 'offline',
        details,
      });

      if (result.method === 'supabase') {
        toast({ title: t('postSession.saved', 'Progress saved'), description: t('postSession.savedCloud', 'Saved to your account') });
      } else {
        toast({ title: t('postSession.savedLocally', 'Saved locally'), description: t('postSession.savedQueue', 'Will sync when logged in') });
      }
    } catch (e: any) {
      DebugLogger.warn('ui', 'Quiz save failed', e);
      toast({ title: t('postSession.saveFailed', 'Could not save'), description: e?.message || 'Unknown error' });
    }

    onComplete(score, questions.length);
    onClose();
  };

  if (!isVisible) return null;

  // Loading state
  if (isGeneratingQuestions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('comprehension.generating', 'Creating quiz questions from your story...')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (generationError || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-gray-600 mb-4">{generationError || 'Could not generate quiz'}</p>
            <div className="flex gap-2 justify-center">
              <MobileOptimizedButton variant="outline" onClick={onClose}>Close</MobileOptimizedButton>
              <MobileOptimizedButton onClick={fetchQuizQuestions}>Try Again</MobileOptimizedButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              {t('comprehension.title', 'Story Quiz')}
            </CardTitle>
            <MobileOptimizedButton variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </MobileOptimizedButton>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm opacity-90">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <Progress value={progress} className="bg-white/20" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!quizComplete ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentQ.question}
              </h3>

              <div className="space-y-2">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? showResult
                          ? index === currentQ.correctAnswer
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-blue-500 bg-blue-50 text-blue-800'
                        : showResult && index === currentQ.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && selectedAnswer === index && (
                        <div className="ml-2">
                          {index === currentQ.correctAnswer ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                      {showResult && selectedAnswer !== index && index === currentQ.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showResult && currentQ.explanation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 </strong> {currentQ.explanation}
                  </p>
                </div>
              )}

              {!showResult && (
                <MobileOptimizedButton
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full"
                >
                  Submit Answer
                </MobileOptimizedButton>
              )}

              {showResult && currentQuestion < questions.length - 1 && (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    {selectedAnswer === currentQ.correctAnswer ? (
                      <span className="text-green-600 font-medium">✓ Correct!</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Not quite right</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Moving to next question...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">
                {score === questions.length ? '🎉' : score >= questions.length / 2 ? '👏' : '💪'}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {score === questions.length 
                    ? t('comprehension.perfect', 'Perfect!')
                    : score >= questions.length / 2 
                    ? t('comprehension.goodJob', 'Good job!')
                    : t('comprehension.keepTrying', 'Keep trying!')
                  }
                </h3>
                <p className="text-gray-600">
                  You got {score} out of {questions.length} questions correct!
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <MobileOptimizedButton variant="outline" onClick={handleRetry}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </MobileOptimizedButton>
                <MobileOptimizedButton onClick={handleComplete}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Reading
                </MobileOptimizedButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
