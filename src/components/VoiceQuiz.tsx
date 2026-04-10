import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2, RotateCcw, ArrowRight, Star } from 'lucide-react';
import { useVoiceIntegration } from '@/hooks/useVoiceIntegration';
import { useToast } from '@/components/ui/use-toast';
import type { UserInfo } from '@/types';
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

interface VoiceQuizProps {
  userInfo: UserInfo;
  storyText: string;
  isVisible: boolean;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
  storyTitle?: string;
}

// Simple hash for caching quiz per story
const hashStory = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < Math.min(text.length, 500); i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return `quiz_${hash}`;
};

export const VoiceQuiz: React.FC<VoiceQuizProps> = ({ 
  userInfo, 
  storyText, 
  isVisible, 
  onComplete, 
  onClose,
  storyTitle = ''
}) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { status, isSpeaking, handleVoiceToggle, isConnected } = useVoiceIntegration();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const voiceEventListenerRef = useRef<((event: CustomEvent) => void) | null>(null);

  // Fetch AI-generated questions
  useEffect(() => {
    if (isVisible && storyText) {
      fetchQuizQuestions();
    }
  }, [isVisible, storyText, userInfo]);

  const fetchQuizQuestions = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    // Check cache
    const cacheKey = hashStory(storyText);
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Question[];
        if (parsed.length > 0) {
          setQuestions(parsed);
          setAnswers(new Array(parsed.length).fill(null));
          setIsGenerating(false);
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
      try { sessionStorage.setItem(cacheKey, JSON.stringify(generated)); } catch {}
    } catch (err: any) {
      DebugLogger.error('ui', 'AI voice quiz generation failed', err);
      setGenerationError(err?.message || 'Could not generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // Set up voice event listeners for quiz interactions
  useEffect(() => {
    if (!isVisible) return;

    const handleVoiceQuizEvent = (event: CustomEvent) => {
      const { action, data } = event.detail;
      DebugLogger.log('audio', 'Voice quiz event received:', { action, data });

      switch (action) {
        case 'start':
          handleStartQuiz();
          break;
        case 'answer':
          if (waitingForAnswer) {
            handleVoiceAnswer(data);
          }
          break;
        case 'next':
          if (showResult) {
            handleNextQuestion();
          }
          break;
        case 'end':
          handleEndQuiz();
          break;
      }
    };

    voiceEventListenerRef.current = handleVoiceQuizEvent;
    window.addEventListener('voice:quiz', handleVoiceQuizEvent as EventListener);

    return () => {
      if (voiceEventListenerRef.current) {
        window.removeEventListener('voice:quiz', voiceEventListenerRef.current as EventListener);
      }
    };
  }, [isVisible, waitingForAnswer, showResult, currentQuestion]);

  // Set quiz context when connected
  useEffect(() => {
    if (isConnected && quizStarted) {
      (window as any).__quizContext = {
        storyTitle,
        userInfo,
        questions,
        currentQuestion,
        score
      };
    }
  }, [isConnected, quizStarted, questions, currentQuestion, score]);

  const handleStartQuiz = async () => {
    if (!isConnected) {
      toast({
        title: "Connect to Buddy",
        description: "Please connect to Buddy first to start the voice quiz"
      });
      return;
    }
    
    setQuizStarted(true);
    setWaitingForAnswer(true);
    
    window.dispatchEvent(new CustomEvent('voice:quiz:askQuestion', {
      detail: {
        question: questions[0],
        questionNumber: 1,
        totalQuestions: questions.length
      }
    }));
  };

  const handleVoiceAnswer = (answerData: any) => {
    const { answerIndex, answerText } = answerData;
    
    let selectedIndex = answerIndex;
    if (selectedIndex === undefined && answerText) {
      const currentQ = questions[currentQuestion];
      const lowerAnswer = answerText.toLowerCase();
      
      selectedIndex = currentQ.options.findIndex(option => 
        option.toLowerCase().includes(lowerAnswer) || 
        lowerAnswer.includes(option.toLowerCase())
      );

      if (selectedIndex === -1) {
        if (lowerAnswer.includes('first') || lowerAnswer.includes('a') || lowerAnswer.includes('one')) {
          selectedIndex = 0;
        } else if (lowerAnswer.includes('second') || lowerAnswer.includes('b') || lowerAnswer.includes('two')) {
          selectedIndex = 1;
        } else if (lowerAnswer.includes('third') || lowerAnswer.includes('c') || lowerAnswer.includes('three')) {
          selectedIndex = 2;
        } else if (lowerAnswer.includes('fourth') || lowerAnswer.includes('d') || lowerAnswer.includes('four')) {
          selectedIndex = 3;
        }
      }
    }

    if (selectedIndex !== -1 && selectedIndex < questions[currentQuestion].options.length) {
      setCurrentAnswer(selectedIndex);
      submitAnswer(selectedIndex);
    } else {
      window.dispatchEvent(new CustomEvent('voice:quiz:clarify', {
        detail: { message: "I didn't catch that. Could you say your answer again?" }
      }));
    }
  };

  const submitAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
    setWaitingForAnswer(false);

    window.dispatchEvent(new CustomEvent('voice:quiz:result', {
      detail: {
        correct: isCorrect,
        correctAnswer: questions[currentQuestion].options[questions[currentQuestion].correctAnswer],
        userAnswer: questions[currentQuestion].options[answerIndex],
        explanation: questions[currentQuestion].explanation
      }
    }));

    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(null);
      setShowResult(false);
      setWaitingForAnswer(true);
      
      window.dispatchEvent(new CustomEvent('voice:quiz:askQuestion', {
        detail: {
          question: questions[currentQuestion + 1],
          questionNumber: currentQuestion + 2,
          totalQuestions: questions.length
        }
      }));
    } else {
      setQuizComplete(true);
      setWaitingForAnswer(false);
      
      window.dispatchEvent(new CustomEvent('voice:quiz:complete', {
        detail: {
          score,
          totalQuestions: questions.length,
          percentage: Math.round((score / questions.length) * 100)
        }
      }));
    }
  };

  const handleEndQuiz = () => {
    onComplete(score, questions.length);
    onClose();
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setCurrentAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setQuizComplete(false);
    setQuizStarted(false);
    setWaitingForAnswer(false);
  };

  if (!isVisible) return null;

  // Loading
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Creating quiz questions from your story...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error
  if (generationError || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-gray-600 mb-4">{generationError || 'Could not generate quiz'}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={fetchQuizQuestions}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = quizComplete ? 100 : ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Quiz with Buddy
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
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
          {!quizStarted ? (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-xl font-bold">Ready for a Voice Quiz?</h3>
              <p className="text-gray-600">
                Connect with Buddy and answer questions about your story using your voice!
              </p>
              
              <div className="space-y-3">
                {!isConnected ? (
                  <Button onClick={handleVoiceToggle} className="w-full">
                    <Mic className="w-4 h-4 mr-2" />
                    Connect to Buddy
                  </Button>
                ) : (
                  <Button onClick={handleStartQuiz} className="w-full">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Start Voice Quiz
                  </Button>
                )}
                
                <Button variant="outline" onClick={onClose} className="w-full">
                  Take Text Quiz Instead
                </Button>
              </div>
            </div>
          ) : !quizComplete ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Mic className="w-5 h-5" />
                      <span className="text-sm">Connected to Buddy</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <MicOff className="w-5 h-5" />
                      <span className="text-sm">Disconnected</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-4">
                  {currentQ.question}
                </h3>

                <div className="space-y-2 mb-4">
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 text-left rounded-lg border-2 ${
                        currentAnswer === index
                          ? showResult
                            ? index === currentQ.correctAnswer
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : 'border-red-500 bg-red-50 text-red-800'
                            : 'border-blue-500 bg-blue-50 text-blue-800'
                          : showResult && index === currentQ.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + index)}. {option}</span>
                    </div>
                  ))}
                </div>

                {waitingForAnswer && (
                  <div className="text-sm text-gray-600">
                    🎤 Listening for your answer... Say "A", "B", "C", or "D"
                  </div>
                )}

                {showResult && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {currentAnswer === currentQ.correctAnswer ? (
                        <span className="text-green-600 font-medium">✓ Correct!</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ Not quite right</span>
                      )}
                    </div>
                    {currentQ.explanation && (
                      <p className="text-xs text-blue-600 mb-1">💡 {currentQ.explanation}</p>
                    )}
                    <p className="text-xs text-gray-500">Moving to next question...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">
                {score === questions.length ? '🎉' : score >= questions.length / 2 ? '👏' : '💪'}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {score === questions.length 
                    ? 'Perfect!'
                    : score >= questions.length / 2 
                    ? 'Good job!'
                    : 'Keep trying!'
                  }
                </h3>
                <p className="text-gray-600">
                  You got {score} out of {questions.length} questions correct!
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleRetry}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={handleEndQuiz}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
