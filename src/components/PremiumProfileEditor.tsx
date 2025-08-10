import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Save, CheckCircle, BookOpen, Sparkles } from "lucide-react";
import type { UserInfo, Grade, LanguageCode, DifficultyLevel } from "@/types";
import { DifficultyManager } from "@/services/difficultyManager";

interface PremiumProfileEditorProps {
  userInfo: UserInfo;
  onSave: (updatedUserInfo: UserInfo) => void;
  onCancel: () => void;
}

export const PremiumProfileEditor = ({ userInfo, onSave, onCancel }: PremiumProfileEditorProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Get difficulty suggestions
  const difficultyProfile = DifficultyManager.suggestDifficulty(formData);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(userInfo);
    setHasChanges(changed);
  }, [formData, userInfo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      toast({
        title: "Profile Updated! ✨",
        description: "Your reading profile has been saved successfully.",
        duration: 3000,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Please try again in a moment.",
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
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
                  value={formData.age?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, age: parseInt(value) }))}
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
                  value={formData.grade}
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, nativeLanguage: value as LanguageCode }))}
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

            {/* Special Request removed for premium; now asked per-story at start */}
          </CardContent>
        </Card>

        {/* Personalization */}
        <Card>
          <CardHeader>
            <CardTitle>Personalization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Avatar</Label>
              <AvatarPicker
                value={formData.avatar}
                onChange={(avatar) => setFormData(prev => ({ ...prev, avatar }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Favorite Color</Label>
              <ColorPicker
                value={formData.favoriteColor || "blue"}
                onChange={(color) => setFormData(prev => ({ ...prev, favoriteColor: color }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal">Favorite Animal</Label>
              <Input
                id="animal"
                value={formData.favoriteAnimal || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, favoriteAnimal: e.target.value }))}
                placeholder="e.g. Cat, Dog, Dragon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="food">Favorite Food</Label>
              <Input
                id="food"
                value={formData.favoriteFood || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, favoriteFood: e.target.value }))}
                placeholder="e.g. Pizza, Ice cream"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies</Label>
              <Input
                id="hobbies"
                value={formData.hobbies || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, hobbies: e.target.value }))}
                placeholder="e.g. Soccer, Art, Music"
              />
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