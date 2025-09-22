import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DebugLogger } from '@/services/DebugLogger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Save, CheckCircle, BookOpen, Sparkles } from "lucide-react";
import { ChildSwitcher } from "@/components/ChildSwitcher";
import { useLanguageSync } from "@/hooks/useLanguageSync";
import type { UserInfo, Grade, LanguageCode, DifficultyLevel } from "@/types";
import { DifficultyManager } from "@/services/difficultyManager";

interface PremiumProfileEditorProps {
  userInfo: UserInfo;
  onSave: (updatedUserInfo: UserInfo) => void;
  onCancel: () => void;
}

export const PremiumProfileEditor = ({ userInfo, onSave, onCancel }: PremiumProfileEditorProps) => {
  const { toast } = useToast();
  // Ensure default values to prevent persistence issues
  const [formData, setFormData] = useState<UserInfo>({
    ...userInfo,
    name: userInfo.name || 'Reader',
    age: userInfo.age || 7,
    grade: userInfo.grade || 'K',
    nativeLanguage: userInfo.nativeLanguage || 'en',
    difficultyLevel: userInfo.difficultyLevel || 'beginner'
  });
  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { syncLanguagesForPremium } = useLanguageSync();
  
  // Get difficulty suggestions
  const difficultyProfile = DifficultyManager.suggestDifficulty(formData);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(userInfo);
    setHasChanges(changed);
  }, [formData, userInfo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        toast({
          title: "Name Required",
          description: "Please enter a name before saving.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.age || formData.age < 3 || formData.age > 11) {
        toast({
          title: "Invalid Age",
          description: "Please select a valid age between 3-11.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.grade) {
        toast({
          title: "Grade Required",
          description: "Please select a grade level.",
          variant: "destructive",
        });
        return;
      }

      DebugLogger.log('ui', 'PremiumProfileEditor: Saving account holder data...', {
        name: formData.name,
        age: formData.age,
        grade: formData.grade,
        nativeLanguage: formData.nativeLanguage,
        difficultyLevel: formData.difficultyLevel
      });
      await onSave(formData);
      toast({
        title: "Account Settings Updated! ✨",
        description: `Account holder "${formData.name}" preferences have been saved successfully.`,
        duration: 4000,
      });
      setHasChanges(false);
      DebugLogger.log('ui', 'PremiumProfileEditor: Account holder save completed successfully');
    } catch (error) {
      DebugLogger.error('auth', 'PremiumProfileEditor: Save failed', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your changes. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("Are you sure? Your changes will be lost.")) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary/20 rounded-full">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground">Customize your reading experience</p>
          </div>
        </div>
        <Badge variant="premium">Premium</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Holder Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Select
                  value={formData.age?.toString() || "7"}
                  onValueChange={(value) => {
                    const parsedAge = parseInt(value);
                    if (!isNaN(parsedAge)) {
                      setFormData(prev => ({ ...prev, age: parsedAge }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3,4,5,6,7,8,9,10,11].map(age => (
                      <SelectItem key={age} value={age.toString()}>
                        {age === 11 ? '11+' : `${age} years old`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={formData.grade || "K"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value as Grade }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PreK">Pre-K</SelectItem>
                    <SelectItem value="K">Kindergarten</SelectItem>
                    <SelectItem value="1">Grade 1</SelectItem>
                    <SelectItem value="2">Grade 2</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Native Language</Label>
              <Select
                value={formData.nativeLanguage}
                onValueChange={(value) => {
                  const newLanguage = value as LanguageCode;
                  syncLanguagesForPremium(newLanguage, (language) => {
                    setFormData(prev => ({ ...prev, nativeLanguage: language }));
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changing your native language will update the interface language. Story content and navigation will remain in their original format.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Reading & Story Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Reading & Story Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Reading Ability</Label>
              <Select
                value={formData.difficultyLevel || difficultyProfile.suggestedDifficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficultyLevel: value as DifficultyLevel }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reading ability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Pre‑Reader</span>
                      <span className="text-xs text-muted-foreground">Just starting out with sounds and letters</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="easy">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Beginner</span>
                      <span className="text-xs text-muted-foreground">Simple words and short sentences</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Developing</span>
                      <span className="text-xs text-muted-foreground">Growing vocabulary with more detail</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Independent</span>
                      <span className="text-xs text-muted-foreground">Reads comfortably with rich language</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expert">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Advanced</span>
                      <span className="text-xs text-muted-foreground">Sophisticated stories and complex ideas</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {!formData.difficultyLevel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  Suggested: {difficultyProfile.suggestedDifficulty.charAt(0).toUpperCase() + difficultyProfile.suggestedDifficulty.slice(1)} 
                  (Confidence: {Math.round(difficultyProfile.confidence * 100)}%)
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storyLanguage">Story Language Preference</Label>
              <Select
                value={"en"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, storyLanguagePreference: value as LanguageCode }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select story language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English Stories</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Only English is supported for stories at this time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Child Personalization Notice */}
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Child Personalization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Personalization settings like avatar, favorite color, animal, and hobbies are managed individually for each child profile below.
            </p>
            <div className="bg-muted/20 p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Current Active Child:</p>
              <ChildSwitcher />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};