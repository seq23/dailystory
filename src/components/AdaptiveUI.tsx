import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Languages, BookOpen, Globe, Target, Heart } from 'lucide-react';
import type { UserInfo } from './UserInfoForm';

interface AdaptiveUIProps {
  userInfo: UserInfo;
  children: React.ReactNode;
  showLanguageSupport?: boolean;
  showLearningGoals?: boolean;
  className?: string;
}

export const AdaptiveUI: React.FC<AdaptiveUIProps> = ({
  userInfo,
  children,
  showLanguageSupport = true,
  showLearningGoals = true,
  className = ""
}) => {
  const { t } = useTranslation();
  
  const isESLLearner = userInfo.nativeLanguage !== 'en';
  const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
  
  // Adaptive styling based on user type
  const getAdaptiveStyles = () => {
    if (isESLLearner) {
      return {
        container: "border-2 border-blue-200 bg-blue-50/50",
        header: "bg-blue-100",
        accent: "text-blue-700",
        badge: "bg-blue-100 text-blue-800"
      };
    } else {
      return {
        container: "border-2 border-green-200 bg-green-50/50", 
        header: "bg-green-100",
        accent: "text-green-700",
        badge: "bg-green-100 text-green-800"
      };
    }
  };
  
  const styles = getAdaptiveStyles();
  
  // Context-sensitive help messages
  const getContextHelp = () => {
    if (isESLLearner) {
      return {
        title: t("adaptiveUI.eslHelp.title"),
        tips: [
          t("adaptiveUI.eslHelp.tip1"),
          t("adaptiveUI.eslHelp.tip2"),
          t("adaptiveUI.eslHelp.tip3")
        ]
      };
    } else {
      return {
        title: t("adaptiveUI.nativeHelp.title"),
        tips: [
          t("adaptiveUI.nativeHelp.tip1"),
          t("adaptiveUI.nativeHelp.tip2"),
          t("adaptiveUI.nativeHelp.tip3")
        ]
      };
    }
  };
  
  const helpContent = getContextHelp();
  
  return (
    <div className={`${styles.container} rounded-xl p-4 ${className}`}>
      {/* Adaptive Header */}
      <div className={`${styles.header} rounded-lg p-3 mb-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isESLLearner ? (
              <Languages className={`w-5 h-5 ${styles.accent}`} />
            ) : (
              <BookOpen className={`w-5 h-5 ${styles.accent}`} />
            )}
            <span className={`font-semibold ${styles.accent}`}>
              {isESLLearner ? t("adaptiveUI.eslMode") : t("adaptiveUI.nativeMode")}
            </span>
          </div>
          
          {/* User's personalization indicators */}
          <div className="flex items-center space-x-2">
            {userInfo.favoriteColor && (
              <Badge variant="outline" className={styles.badge}>
                <Heart className="w-3 h-3 mr-1" />
                {userInfo.favoriteColor}
              </Badge>
            )}
            {userInfo.favoriteAnimal && (
              <Badge variant="outline" className={styles.badge}>
                🐾 {userInfo.favoriteAnimal}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Context-sensitive help */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className={styles.accent}>
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="p-2">
                <h4 className="font-semibold mb-2">{helpContent.title}</h4>
                <ul className="text-sm space-y-1">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Learning Goals Display */}
      {showLearningGoals && (
        <div className="mb-4 p-3 bg-background/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className={`w-4 h-4 ${styles.accent}`} />
            <span className={`text-sm font-medium ${styles.accent}`}>
              {t("adaptiveUI.learningGoal")}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t(`userInfoForm.fields.learningGoal.options.${userInfo.learningGoal}`)}
          </Badge>
        </div>
      )}
      
      {/* Language Support Indicator */}
      {showLanguageSupport && isESLLearner && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-1">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {t("adaptiveUI.languageSupport")}
            </span>
          </div>
          <p className="text-xs text-blue-600">
            {t("adaptiveUI.languageSupportDesc")}
          </p>
        </div>
      )}
      
      {/* Main Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default AdaptiveUI;