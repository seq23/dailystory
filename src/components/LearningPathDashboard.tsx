import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Play, 
  CheckCircle, 
  Star,
  Brain,
  Mic,
  PenTool,
  Volume2,
  X
} from "lucide-react";
import PersonalizedLearningService, { 
  LearningPath, 
  LearningChallenge,
  VocabularyGame,
  ComprehensionQuiz 
} from "@/services/personalizedLearningService";
import type { UserInfo } from "@/components/UserInfoForm";
import type { ReadingProgress } from "@/services/progressTrackingService";

interface LearningPathDashboardProps {
  userInfo: UserInfo;
  progress: ReadingProgress;
  onClose: () => void;
  onChallengeComplete?: (challengeId: string, score: number) => void;
}

export const LearningPathDashboard = ({ 
  userInfo, 
  progress, 
  onClose,
  onChallengeComplete 
}: LearningPathDashboardProps) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChallenge, setSelectedChallenge] = useState<LearningChallenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load or generate learning path
    let path = PersonalizedLearningService.getUserCurrentPath(userInfo);
    if (!path) {
      path = PersonalizedLearningService.generateLearningPath(userInfo, progress);
      PersonalizedLearningService.saveLearningPath(path);
    }
    setCurrentPath(path);

    // Load completed challenges from storage
    const completed = sessionStorage.getItem(`completed-challenges-${userInfo.name}`);
    if (completed) {
      setCompletedChallenges(new Set(JSON.parse(completed)));
    }
  }, [userInfo, progress]);

  const handleChallengeComplete = (challengeId: string, score: number) => {
    const newCompleted = new Set([...completedChallenges, challengeId]);
    setCompletedChallenges(newCompleted);
    sessionStorage.setItem(`completed-challenges-${userInfo.name}`, JSON.stringify([...newCompleted]));
    
    if (onChallengeComplete) {
      onChallengeComplete(challengeId, score);
    }
    
    setSelectedChallenge(null);
  };

  const getChallengeIcon = (type: LearningChallenge["type"]) => {
    switch (type) {
      case "vocabulary": return <BookOpen className="h-4 w-4" />;
      case "comprehension": return <Brain className="h-4 w-4" />;
      case "phonics": return <Volume2 className="h-4 w-4" />;
      case "fluency": return <Mic className="h-4 w-4" />;
      case "writing": return <PenTool className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-orange-100 text-orange-800";
      case "expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = () => {
    if (!currentPath) return 0;
    return Math.round((completedChallenges.size / currentPath.challenges.length) * 100);
  };

  const renderOverview = () => {
    if (!currentPath) return null;

    const completedCount = completedChallenges.size;
    const totalChallenges = currentPath.challenges.length;
    const progressPercentage = getProgressPercentage();

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t("learningPath.currentPath")}
            </CardTitle>
            <CardDescription>{currentPath.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("learningPath.progress")}</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{totalChallenges} {t("learningPath.completed")}
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">{t("learningPath.challengesCompleted")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(currentPath.totalEstimatedHours)}h
                  </div>
                  <div className="text-sm text-muted-foreground">{t("learningPath.totalTime")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {completedChallenges.size * 50}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("learningPath.pointsEarned")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("learningPath.nextRecommended")}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentPath.challenges
              .filter(challenge => !completedChallenges.has(challenge.id))
              .slice(0, 3)
              .map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    {getChallengeIcon(challenge.type)}
                    <div>
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">{challenge.estimatedMinutes} min</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {t("learningPath.start")}
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderChallenges = () => {
    if (!currentPath) return null;

    return (
      <div className="space-y-4">
        {currentPath.challenges.map((challenge) => {
          const isCompleted = completedChallenges.has(challenge.id);
          
          return (
            <Card key={challenge.id} className={isCompleted ? "bg-green-50 border-green-200" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getChallengeIcon(challenge.type)}
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {challenge.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {challenge.rewards.points} points
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={isCompleted}
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("learningPath.completed")}
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        {t("learningPath.start")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderChallengeModal = () => {
    if (!selectedChallenge) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getChallengeIcon(selectedChallenge.type)}
                {selectedChallenge.title}
              </CardTitle>
              <CardDescription>{selectedChallenge.description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChallenge(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                    {selectedChallenge.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedChallenge.estimatedMinutes} minutes
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedChallenge.rewards.points} points
                  </span>
                </div>
                
                {/* Render challenge content based on type */}
                {selectedChallenge.type === "vocabulary" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">{t("learningPath.vocabularyChallenge")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("learningPath.vocabularyDescription")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedChallenge.content.words?.slice(0, 8).map((word: string, index: number) => (
                        <div key={index} className="p-3 bg-secondary rounded-lg text-center">
                          <span className="font-medium">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedChallenge.type === "comprehension" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">{t("learningPath.comprehensionChallenge")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("learningPath.comprehensionDescription")}
                    </p>
                  </div>
                )}
                
                {selectedChallenge.type === "phonics" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">{t("learningPath.phonicsChallenge")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("learningPath.phonicsDescription")}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleChallengeComplete(selectedChallenge.id, 85)}
                    className="flex-1"
                  >
                    {t("learningPath.startChallenge")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedChallenge(null)}
                  >
                    {t("learningPath.cancel")}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!currentPath) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t("learningPath.loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {currentPath.name}
              </CardTitle>
              <CardDescription>
                {t("learningPath.personalizedFor")} {userInfo.name}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[70vh]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">{t("learningPath.overview")}</TabsTrigger>
                <TabsTrigger value="challenges">{t("learningPath.challenges")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="h-full overflow-auto">
                <ScrollArea className="h-full">
                  {renderOverview()}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="challenges" className="h-full overflow-auto">
                <ScrollArea className="h-full">
                  {renderChallenges()}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {renderChallengeModal()}
    </>
  );
};

export default LearningPathDashboard;