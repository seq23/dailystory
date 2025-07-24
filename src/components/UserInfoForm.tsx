import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ColorPicker } from "@/components/ui/color-picker";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { ChevronRight, User, GraduationCap, Heart, Star } from "lucide-react";
import { ContentSecurity, SecurityLogger } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";

export interface UserInfo {
  name: string;
  age: number;
  grade: string;
  avatar: {
    type: "boy" | "girl";
    skinTone: "pale" | "light" | "medium" | "olive" | "dark";
  };
  favoriteColor: string;
  favoriteAnimal: string;
  hobbies: string;
  favoriteFood: string;
  specialRequest: string;
  difficultyLevel?: "easy" | "medium" | "hard" | "expert";
  readingAbility?: "easy" | "medium" | "hard" | "expert";
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
}

export const UserInfoForm = ({ onSubmit, onBack }: UserInfoFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 6,
    grade: "",
    avatar: {
      type: "boy",
      skinTone: "light"
    },
    favoriteColor: "",
    favoriteAnimal: "",
    hobbies: "",
    favoriteFood: "",
    specialRequest: "",
    difficultyLevel: "easy",
    readingAbility: "easy"
  });

  // Enhanced content filtering with improved security
  const contentFilter = (text: string): { hasInappropriateContent: boolean; reason?: string } => {
    const validation = ContentSecurity.isContentAppropriate(text);
    return {
      hasInappropriateContent: !validation.appropriate,
      reason: validation.reason
    };
  };

  const handleInputChange = (field: keyof UserInfo, value: string | number) => {
    if (typeof value === 'string') {
      // Check if this is a deletion (shorter text) - skip security validation for deletions
      const currentValue = formData[field] as string;
      const isDeletion = value.length < currentValue.length;
      
      // Sanitize input
      const sanitizedValue = ContentSecurity.sanitizeInput(value);
      
      // Only check for inappropriate content on additions, not deletions
      if (!isDeletion) {
        const validation = contentFilter(sanitizedValue);
        if (validation.hasInappropriateContent) {
          SecurityLogger.log('inappropriate_content_attempt', {
            field,
            reason: validation.reason,
            originalValue: value
          });
          
          toast({
            title: "Content Warning",
            description: "Please use appropriate language for children's stories!",
            variant: "destructive"
          });
          return;
        }
      }
      
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    // Rate limiting check
    const userIdentifier = formData.name + Date.now(); // Simple identifier
    if (!ContentSecurity.checkRateLimit(userIdentifier)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait a moment before submitting again.",
        variant: "destructive"
      });
      return;
    }

    // Final validation of all form data
    const allText = `${formData.name} ${formData.favoriteAnimal} ${formData.favoriteFood} ${formData.hobbies} ${formData.specialRequest}`;
    const finalValidation = ContentSecurity.isContentAppropriate(allText);
    
    if (!finalValidation.appropriate) {
      SecurityLogger.log('form_submission_blocked', {
        reason: finalValidation.reason,
        formData: { ...formData, name: '[REDACTED]' }
      });
      
      toast({
        title: "Content Issue",
        description: "Please review your inputs for appropriate content.",
        variant: "destructive"
      });
      return;
    }

    // Use the selected reading ability, or fall back to age-based difficulty
    const difficulty = formData.readingAbility || (formData.age <= 6 ? "easy" : formData.age <= 9 ? "medium" : formData.age <= 12 ? "hard" : "expert");
    
    SecurityLogger.log('form_submission_success', {
      difficultyLevel: difficulty,
      age: formData.age,
      grade: formData.grade
    });
    
    onSubmit({ ...formData, difficultyLevel: difficulty });
  };

  const isFormComplete = () => {
    return formData.name && 
           formData.age && 
           formData.grade && 
           formData.avatar.type &&
           formData.avatar.skinTone;
    // favoriteColor, favoriteAnimal, hobbies, favoriteFood, and specialRequest are now optional
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-2 md:p-4">
      <Card className="w-full max-w-4xl bg-gradient-card shadow-card border-0 rounded-2xl md:rounded-3xl p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="p-3 md:p-4 bg-gradient-primary rounded-full text-white shadow-soft">
              <User className="w-8 h-8 md:w-12 md:h-12" />
            </div>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
            Tell us about yourself!
          </h2>
          <p className="text-muted-foreground text-base md:text-lg px-2">
            Help us create the perfect story just for you
          </p>
        </div>

        {/* All Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Basic Info Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              About You
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base md:text-lg font-semibold text-foreground">
                  What's your name?
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Type your name here..."
                  className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base md:text-lg font-semibold text-foreground">
                  How old are you?
                </Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder="Pick your age" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(age => (
                      <SelectItem key={age} value={age.toString()}>{age} years old</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-base md:text-lg font-semibold text-foreground">
                  What grade are you in?
                </Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PreK">Pre-K</SelectItem>
                    <SelectItem value="K">Kindergarten</SelectItem>
                    <SelectItem value="1st">1st Grade</SelectItem>
                    <SelectItem value="2nd">2nd Grade</SelectItem>
                    <SelectItem value="3rd">3rd Grade</SelectItem>
                    <SelectItem value="4th">4th Grade</SelectItem>
                    <SelectItem value="5th">5th Grade</SelectItem>
                    <SelectItem value="6th">6th Grade</SelectItem>
                    <SelectItem value="7th">7th Grade</SelectItem>
                    <SelectItem value="8th">8th Grade</SelectItem>
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="11th">11th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readingAbility" className="text-base md:text-lg font-semibold text-foreground">
                  What reading level feels right for you?
                </Label>
                <Select value={formData.readingAbility} onValueChange={(value) => handleInputChange("readingAbility", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 bg-white dark:bg-gray-800 z-50">
                    <SelectValue placeholder="Choose your reading level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-2 border-primary/20 rounded-xl md:rounded-2xl shadow-lg z-50">
                    <SelectItem value="easy" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-green-600">Easy Reading</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">(K-1st grade: Simple words & short sentences)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-yellow-600">Medium Reading</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">(2nd-4th grade: Moderate vocabulary & sentences)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-orange-600">Advanced Reading</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">(5th-8th grade: Advanced vocabulary & complex sentences)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expert" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-red-600">Expert Reading</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">(9th-12th grade: Expert vocabulary & sophisticated writing)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-base md:text-lg font-semibold text-foreground">
                  Which avatar do you want?
                </Label>
                <AvatarPicker
                  value={formData.avatar}
                  onChange={(avatar) => setFormData(prev => ({ ...prev, avatar }))}
                />
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Your Favorites
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favoriteColor" className="text-base md:text-lg font-semibold text-foreground">
                  What's your favorite color?
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">(Optional)</span>
                </Label>
                <ColorPicker
                  value={formData.favoriteColor}
                  onChange={(color) => handleInputChange("favoriteColor", color)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteAnimal" className="text-base md:text-lg font-semibold text-foreground">
                  What's your favorite animal?
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">(Optional)</span>
                </Label>
                <TagInput
                  value={formData.favoriteAnimal}
                  onChange={(value) => handleInputChange("favoriteAnimal", value)}
                  placeholder="Type animals and press Enter..."
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteFood" className="text-base md:text-lg font-semibold text-foreground">
                  What's your favorite food?
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">(Optional)</span>
                </Label>
                <TagInput
                  value={formData.favoriteFood}
                  onChange={(value) => handleInputChange("favoriteFood", value)}
                  placeholder="Type foods and press Enter..."
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies" className="text-base md:text-lg font-semibold text-foreground">
                  What do you like to do for fun?
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">(Optional)</span>
                </Label>
                <TagInput
                  value={formData.hobbies}
                  onChange={(value) => handleInputChange("hobbies", value)}
                  placeholder="Type activities and press Enter..."
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Additional Info
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="specialRequest" className="text-base md:text-lg font-semibold text-foreground">
                Tell us if there is anything special you want to include in your story?
                <span className="text-xs md:text-sm text-muted-foreground ml-2">(Optional)</span>
              </Label>
              <Textarea
                id="specialRequest"
                value={formData.specialRequest}
                onChange={(e) => handleInputChange("specialRequest", e.target.value)}
                placeholder="Dragons, princesses, space adventures, magic powers..."
                className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 focus:border-primary/50 min-h-[80px] md:min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
          <Button
            variant="playful"
            size="lg"
            onClick={onBack}
            className="flex-1 sm:max-w-xs order-2 sm:order-1"
          >
            Back to Home
          </Button>
          <Button
            variant="fun"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormComplete()}
            className="flex-1 sm:max-w-xs order-1 sm:order-2"
          >
            Create My Story!
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};