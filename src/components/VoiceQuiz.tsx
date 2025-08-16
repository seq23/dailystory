import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2, RotateCcw, ArrowRight, Star } from 'lucide-react';
import { useVoiceIntegration } from '@/hooks/useVoiceIntegration';
import { useToast } from '@/components/ui/use-toast';
import type { UserInfo } from '@/types';

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

export const VoiceQuiz: React.FC<VoiceQuizProps> = ({ 
  userInfo, 
  storyText, 
  isVisible, 
  onComplete, 
  onClose,
  storyTitle = ''
}) => {
  const { t } = useTranslation();
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

  const voiceEventListenerRef = useRef<((event: CustomEvent) => void) | null>(null);

  // Generate questions based on story and user info (same logic as ComprehensionQuiz)
  useEffect(() => {
    if (isVisible && storyText) {
      generateQuestions();
    }
  }, [isVisible, storyText, userInfo]);

  // Set up voice event listeners for quiz interactions
  useEffect(() => {
    if (!isVisible) return;

    const handleVoiceQuizEvent = (event: CustomEvent) => {
      const { action, data } = event.detail;
      console.log('🎯 Voice quiz event received:', action, data);

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
      // Pass story context to Charlotte
      (window as any).__quizContext = {
        storyTitle,
        userInfo,
        questions,
        currentQuestion,
        score
      };
    }
  }, [isConnected, quizStarted, questions, currentQuestion, score]);

  const generateQuestions = () => {
    const generatedQuestions: Question[] = [];
    const sentences = storyText.split('.').filter(s => s.trim().length > 10);
    
    const isYoung = userInfo.age < 8;
    const readingLevel = (userInfo.readingAbility || userInfo.difficultyLevel || 'easy') as any;
    const isLowerLevel = readingLevel === 'beginner' || readingLevel === 'easy';
    const questionCount = isLowerLevel ? 2 : (isYoung ? 3 : 4); // Slightly fewer for voice

    // Question 1: Main character
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      const characters = extractCharacters(firstSentence);
      if (characters.length > 0) {
        generatedQuestions.push({
          id: 'character',
          question: t('comprehension.whoIsMainCharacter', 'Who is the main character in this story?'),
          options: [
            characters[0],
            'A dragon',
            'A teacher',
            'A robot'
          ],
          correctAnswer: 0,
          type: 'multiple-choice'
        });
      }
    }

    // Question 2: What happened
    if (sentences.length > 1) {
      const actions = extractActions(sentences);
      if (actions.length > 0) {
        generatedQuestions.push({
          id: 'action',
          question: t('comprehension.whatHappened', 'What happened in the story?'),
          options: [
            actions[0],
            'They went to space',
            'They ate ice cream',
            'They found treasure'
          ],
          correctAnswer: 0,
          type: 'multiple-choice'
        });
      }
    }

    // Question 3: True/false
    generatedQuestions.push({
      id: 'setting',
      question: t('comprehension.trueFalse', 'The story takes place during the day.'),
      options: ['True', 'False'],
      correctAnswer: storyText.toLowerCase().includes('sun') || storyText.toLowerCase().includes('morning') ? 0 : 1,
      type: 'true-false'
    });

    // Question 4: Emotion (for older kids)
    if (!isYoung) {
      generatedQuestions.push({
        id: 'emotion',
        question: t('comprehension.howDidCharacterFeel', 'How did the character feel?'),
        options: ['Happy', 'Sad', 'Excited', 'Scared'],
        correctAnswer: 0,
        type: 'character-emotion'
      });
    }

    setQuestions(generatedQuestions.slice(0, questionCount));
    setAnswers(new Array(questionCount).fill(null));
  };

  const extractCharacters = (text: string): string[] => {
    const words = text.split(' ');
    const possibleNames = words.filter(word => 
      /^[A-Z][a-z]+$/.test(word) && 
      !['The', 'This', 'That', 'Once', 'Then', 'When', 'Where'].includes(word)
    );
    return possibleNames.length > 0 ? possibleNames : [userInfo.name];
  };

  const extractActions = (sentences: string[]): string[] => {
    const actionWords = ['went', 'walked', 'found', 'saw', 'played', 'discovered', 'met', 'helped'];
    for (const sentence of sentences) {
      for (const action of actionWords) {
        if (sentence.toLowerCase().includes(action)) {
          return [`They ${action} somewhere special`];
        }
      }
    }
    return ['They had an adventure'];
  };

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
    
    // Trigger Charlotte to ask the first question
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
    
    // Try to parse the answer
    let selectedIndex = answerIndex;
    if (selectedIndex === undefined && answerText) {
      // Try to match answer text to options
      const currentQ = questions[currentQuestion];
      const lowerAnswer = answerText.toLowerCase();
      
      selectedIndex = currentQ.options.findIndex(option => 
        option.toLowerCase().includes(lowerAnswer) || 
        lowerAnswer.includes(option.toLowerCase())
      );

      // Handle common patterns
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
      // Ask for clarification
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

    // Tell Charlotte the result
    window.dispatchEvent(new CustomEvent('voice:quiz:result', {
      detail: {
        correct: isCorrect,
        correctAnswer: questions[currentQuestion].options[questions[currentQuestion].correctAnswer],
        userAnswer: questions[currentQuestion].options[answerIndex],
        explanation: questions[currentQuestion].explanation
      }
    }));

    // Auto advance after 3 seconds
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
      
      // Ask next question
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
      
      // Tell Charlotte the final score
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

  if (!isVisible || questions.length === 0) return null;

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