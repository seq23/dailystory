import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, User, GraduationCap, Heart, Star } from "lucide-react";

export interface UserInfo {
  name: string;
  age: number;
  grade: string;
  favoriteColor: string;
  favoriteAnimal: string;
  hobbies: string;
  dreamJob: string;
  favoriteFood: string;
  specialRequest: string;
  difficultyLevel?: "easy" | "medium" | "hard";
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
}

export const UserInfoForm = ({ onSubmit, onBack }: UserInfoFormProps) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 6,
    grade: "",
    favoriteColor: "",
    favoriteAnimal: "",
    hobbies: "",
    dreamJob: "",
    favoriteFood: "",
    specialRequest: "",
    difficultyLevel: "easy"
  });

  const handleInputChange = (field: keyof UserInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Set initial difficulty based on age
    const difficulty = formData.age <= 7 ? "easy" : formData.age <= 10 ? "medium" : "hard";
    onSubmit({ ...formData, difficultyLevel: difficulty });
  };

  const isFormComplete = () => {
    return formData.name && 
           formData.age && 
           formData.grade && 
           formData.favoriteColor && 
           formData.favoriteAnimal && 
           formData.hobbies && 
           formData.dreamJob && 
           formData.favoriteFood;
    // specialRequest is optional, so not included in validation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gradient-card shadow-card border-0 rounded-3xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-full text-white shadow-soft">
              <User className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Tell us about yourself!
          </h2>
          <p className="text-muted-foreground text-lg">
            Help us create the perfect story just for you
          </p>
        </div>

        {/* All Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Basic Info Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              About You
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-semibold text-foreground">
                  What's your name?
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Type your name here..."
                  className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-lg font-semibold text-foreground">
                  How old are you?
                </Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger className="text-lg p-4 rounded-2xl border-2 border-primary/20">
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
                <Label htmlFor="grade" className="text-lg font-semibold text-foreground">
                  What grade are you in?
                </Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger className="text-lg p-4 rounded-2xl border-2 border-primary/20">
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Your Favorites
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favoriteColor" className="text-lg font-semibold text-foreground">
                  What's your favorite color?
                </Label>
                <Input
                  id="favoriteColor"
                  value={formData.favoriteColor}
                  onChange={(e) => handleInputChange("favoriteColor", e.target.value)}
                  placeholder="Blue, pink, rainbow..."
                  className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteAnimal" className="text-lg font-semibold text-foreground">
                  What's your favorite animal?
                </Label>
                <Input
                  id="favoriteAnimal"
                  value={formData.favoriteAnimal}
                  onChange={(e) => handleInputChange("favoriteAnimal", e.target.value)}
                  placeholder="Dog, cat, dragon..."
                  className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteFood" className="text-lg font-semibold text-foreground">
                  What's your favorite food?
                </Label>
                <Input
                  id="favoriteFood"
                  value={formData.favoriteFood}
                  onChange={(e) => handleInputChange("favoriteFood", e.target.value)}
                  placeholder="Pizza, ice cream, apples..."
                  className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Dreams & Friends Section */}
          <div className="space-y-6 md:col-span-2">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              Additional Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hobbies" className="text-lg font-semibold text-foreground">
                  What do you like to do for fun?
                </Label>
                <Textarea
                  id="hobbies"
                  value={formData.hobbies}
                  onChange={(e) => handleInputChange("hobbies", e.target.value)}
                  placeholder="Playing soccer, drawing, reading..."
                  className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dreamJob" className="text-lg font-semibold text-foreground">
                  What do you want to be when you grow up?
                </Label>
                <Textarea
                  id="dreamJob"
                  value={formData.dreamJob}
                  onChange={(e) => handleInputChange("dreamJob", e.target.value)}
                  placeholder="Astronaut, teacher, artist..."
                  className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50 min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequest" className="text-lg font-semibold text-foreground">
                Tell us if there is anything special you want to include in your story?
                <span className="text-sm text-muted-foreground ml-2">(Optional)</span>
              </Label>
              <Textarea
                id="specialRequest"
                value={formData.specialRequest}
                onChange={(e) => handleInputChange("specialRequest", e.target.value)}
                placeholder="Dragons, princesses, space adventures, magic powers..."
                className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="playful"
            size="lg"
            onClick={onBack}
            className="flex-1 max-w-xs"
          >
            Back to Home
          </Button>
          <Button
            variant="fun"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormComplete()}
            className="flex-1 max-w-xs"
          >
            Create My Story!
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};