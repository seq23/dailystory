import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileOptimizedButton } from '@/components/MobileOptimizedButton';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Star, ArrowRight, RotateCcw } from 'lucide-react';
import type { UserInfo } from '@/types';
import { saveQuizAttempt } from '@/hooks/useActivityPersistence';
import { useToast } from '@/components/ui/use-toast';

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

  // Generate questions based on story and user info
  useEffect(() => {
    if (isVisible && storyText) {
      generateQuestions();
    }
  }, [isVisible, storyText, userInfo]);

  const generateQuestions = () => {
    const generatedQuestions: Question[] = [];
    const sentences = storyText.split('.').filter(s => s.trim().length > 10);
    
    // Generate different types of questions based on user age and difficulty
    const isYoung = userInfo.age < 8;
    const readingLevel = (userInfo.readingAbility || userInfo.difficultyLevel || 'easy') as any;
    const isLowerLevel = readingLevel === 'beginner' || readingLevel === 'easy';
    const questionCount = isLowerLevel ? 2 : (isYoung ? 3 : 5);

    // Question 1: Main character/subject (easy)
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

    // Question 2: What happened (comprehension)
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

    // Question 3: Simple true/false
    generatedQuestions.push({
      id: 'setting',
      question: t('comprehension.trueFalse', 'The story takes place during the day.'),
      options: ['True', 'False'],
      correctAnswer: storyText.toLowerCase().includes('sun') || storyText.toLowerCase().includes('morning') ? 0 : 1,
      type: 'true-false'
    });

    // Question 4: Emotion recognition (for older kids)
    if (!isYoung) {
      generatedQuestions.push({
        id: 'emotion',
        question: t('comprehension.howDidCharacterFeel', 'How did the character feel?'),
        options: ['Happy', 'Sad', 'Excited', 'Scared'],
        correctAnswer: 0, // Default to happy for positive stories
        type: 'character-emotion'
      });
    }

    // Question 5: Prediction/inference (for older kids)
    if (!isYoung) {
      generatedQuestions.push({
        id: 'prediction',
        question: t('comprehension.whatMightHappenNext', 'What might happen next?'),
        options: [
          'The adventure continues',
          'Everyone goes to sleep',
          'They have a party',
          'They go home'
        ],
        correctAnswer: 0,
        type: 'multiple-choice'
      });
    }

    setQuestions(generatedQuestions.slice(0, questionCount));
    setAnswers(new Array(questionCount).fill(null));
  };

  const extractCharacters = (text: string): string[] => {
    // Simple character extraction - look for capitalized words
    const words = text.split(' ');
    const possibleNames = words.filter(word => 
      /^[A-Z][a-z]+$/.test(word) && 
      !['The', 'This', 'That', 'Once', 'Then', 'When', 'Where'].includes(word)
    );
    return possibleNames.length > 0 ? possibleNames : [userInfo.name];
  };

  const extractActions = (sentences: string[]): string[] => {
    // Simple action extraction - look for verbs
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

    // Auto advance after showing result
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
    // Persist the attempt before closing
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
        toast({ title: t('postSession.saved', 'Progress saved'), description: t('postSession.savedCloud', 'Saved to your account'), });
      } else {
        toast({ title: t('postSession.savedLocally', 'Saved locally'), description: t('postSession.savedQueue', 'Will sync when logged in'), });
      }
    } catch (e: any) {
      console.warn('[quiz] save failed', e);
      toast({ title: t('postSession.saveFailed', 'Could not save'), description: e?.message || 'Unknown error' });
    }

    onComplete(score, questions.length);
    onClose();
  };

  if (!isVisible || questions.length === 0) return null;

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
                    <strong>Explanation:</strong> {currentQ.explanation}
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
