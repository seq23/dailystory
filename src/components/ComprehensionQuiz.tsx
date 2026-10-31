import { uiText, useUiLanguage } from "@/i18n/uiText";
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileOptimizedButton } from '@/components/MobileOptimizedButton';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Star, ArrowRight, RotateCcw } from 'lucide-react';
import type { UserInfo } from '@/types';
import { saveQuizAttempt } from '@/hooks/useActivityPersistence';
import { useToast } from '@/components/ui/use-toast';
import { DebugLogger } from '@/services/DebugLogger';
import { loadStoryQuiz, quizBandFor, quizCacheKey, readCachedQuiz, type QuizQuestion, type QuizSource } from '@/lib/quiz';

type Question = QuizQuestion;

interface ComprehensionQuizProps {
  userInfo: UserInfo;
  storyText: string;
  isVisible: boolean;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
  storyTitle?: string;
  /** The reading grade the story was written at, so the questions match it. */
  storyGrade?: string;
  /** The parent's practice words for this story. */
  practiceWords?: string[];
}


export const ComprehensionQuiz = ({ 
  userInfo, 
  storyText, 
  isVisible, 
  onComplete, 
  onClose,
  storyTitle,
  storyGrade,
  practiceWords,
}: ComprehensionQuizProps) => {
  useUiLanguage();
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
  const [source, setSource] = useState<QuizSource>('ai');
  const [saved, setSaved] = useState(false);
  // Band by Reads-at grade: Pre-K–1st hear every question; older readers can tap to hear.
  const band = quizBandFor(userInfo as any, storyGrade);
  const speak = (text: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = band.readAloud === 'always' ? 0.85 : 0.95;
      window.speechSynthesis.speak(u);
    } catch { /* no speech on this device */ }
  };
  const speakQuestion = (q?: Question) => {
    if (!q) return;
    speak([q.say || q.question, ...(q.skill === 'sight-words' ? [] : q.options)].join('. '));
  };

  const loadedStoryRef = useRef('');
  useEffect(() => {
    if (isVisible && storyText && loadedStoryRef.current !== storyText) {
      loadedStoryRef.current = storyText;
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
    const cacheKey = quizCacheKey({ storyText, userInfo: userInfo as any, storyGrade, practiceWords });
    try {
      const cached = readCachedQuiz(sessionStorage.getItem(cacheKey));
      if (cached) {
        setSource(cached.source);
        DebugLogger.log('ui', 'Using cached quiz questions');
        setQuestions(cached.questions as Question[]);
        setAnswers(new Array(cached.questions.length).fill(null));
        setIsGeneratingQuestions(false);
        return;
      }
    } catch {}

    try {
      // AI first; a quiz from the story text itself when the AI is down (never empty).
      const quiz = await loadStoryQuiz({ storyText, userInfo: userInfo as any, storyGrade, practiceWords });
      if (!quiz.questions.length) throw new Error('This story is too short for a quiz');
      setQuestions(quiz.questions);
      setSource(quiz.source);
      setAnswers(new Array(quiz.questions.length).fill(null));
      try { sessionStorage.setItem(cacheKey, JSON.stringify({ questions: quiz.questions, source: quiz.source })); } catch {}
    } catch (err: any) {
      DebugLogger.error('ui', 'Quiz could not be built', err);
      setGenerationError(err?.message || 'Could not make a quiz for this story');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || showResult) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) setScore((s) => s + 1);
    // The child reads the feedback and taps Next: no 2-second auto-advance.
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  useEffect(() => {
    if (band.readAloud === 'always' && questions[currentQuestion] && !quizComplete && isVisible) speakQuestion(questions[currentQuestion]);
  }, [currentQuestion, questions, quizComplete, isVisible]);

  // Save the result as soon as the quiz is finished (closing with ✕ used to lose it).
  useEffect(() => {
    if (!quizComplete || saved) return;
    setSaved(true);
    void persistResult();
  }, [quizComplete]);

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setQuizComplete(false);
    setSaved(false);
  };

  const persistResult = async () => {
    try {
      // Each answer is saved with its skill, for Reports → strengths by skill.
      const skillAnswers = questions.map((q, i) => ({ skill: q.skill, correct: answers[i] === q.correctAnswer }));
      const details = {
        answers,
        skillAnswers,
        questions: questions.map(q => ({ id: q.id, type: q.type, skill: q.skill })),
        source,
        grade: storyGrade,
      };
      const result = await saveQuizAttempt({
        score,
        totalQuestions: questions.length,
        storyText: storyText || '',
        language: i18n.language || 'en',
        userInfo,
        mode: source === 'fallback' ? 'offline' : 'ai',
        details,
        storyTitle,
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
  };

  const handleComplete = () => {
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
            <p className="text-gray-600 mb-4">{generationError || uiText("Could not generate quiz")}</p>
            <div className="flex gap-2 justify-center">
              <MobileOptimizedButton variant="outline" onClick={onClose}>{uiText("Close")}</MobileOptimizedButton>
              <MobileOptimizedButton onClick={fetchQuizQuestions}>{uiText("Try Again")}</MobileOptimizedButton>
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
              <span>{uiText("Question {{current}} of {{total}}", { current: currentQuestion + 1, total: questions.length })}</span>
              <span>{uiText("Score:")} {score}/{questions.length}</span>
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
              <button
                type="button"
                onClick={() => speakQuestion(currentQ)}
                className="text-sm text-blue-700 underline underline-offset-2"
                aria-label={t('comprehension.hear', 'Tap to hear')}
              >
                🔊 {t('comprehension.hear', 'Tap to hear')}
              </button>

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
                      <span className={band.pictures ? 'text-xl' : undefined}>
                        {currentQ.pictures?.[index] && <span className="mr-2 text-3xl" aria-hidden="true">{currentQ.pictures[index]}</span>}
                        {option}
                      </span>
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

              {showResult && (
                <div className={`p-3 rounded-lg border ${selectedAnswer === currentQ.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <p className="font-semibold mb-1">
                    {selectedAnswer === currentQ.correctAnswer
                      ? t('comprehension.rightAnswer', 'Yes, you got it! 🌟')
                      : t('comprehension.goodTry', 'Good try! The answer is: {{answer}}', { answer: currentQ.options[currentQ.correctAnswer] })}
                  </p>
                  {currentQ.explanation && <p className="text-sm text-gray-700">💡 {currentQ.explanation}</p>}
                  {currentQ.evidence && !currentQ.explanation.includes(currentQ.evidence.slice(0, 20)) && (
                    <p className="text-sm text-gray-600 italic mt-1">📖 “{currentQ.evidence}”</p>
                  )}
                </div>
              )}

              {!showResult ? (
                <MobileOptimizedButton
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full"
                >
                  {t('comprehension.check', 'Check my answer')}
                </MobileOptimizedButton>
              ) : (
                <MobileOptimizedButton onClick={handleNext} className="w-full">
                  {currentQuestion < questions.length - 1 ? t('comprehension.next', 'Next question') : t('comprehension.seeScore', 'See my score')}
                </MobileOptimizedButton>
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
                  {uiText("You got {{score}} out of {{total}} questions correct!", { score, total: questions.length })}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <MobileOptimizedButton variant="outline" onClick={handleRetry}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {uiText("Try Again")}
                </MobileOptimizedButton>
                <MobileOptimizedButton onClick={handleComplete}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {uiText("Continue Reading")}
                </MobileOptimizedButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
