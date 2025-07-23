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
  bestFriend: string;
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
    bestFriend: ""
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Tell us about yourself!",
      icon: <User className="w-8 h-8" />,
      fields: ["name", "age", "grade"]
    },
    {
      title: "What do you love?",
      icon: <Heart className="w-8 h-8" />,
      fields: ["favoriteColor", "favoriteAnimal", "favoriteFood"]
    },
    {
      title: "Your dreams and friends!",
      icon: <Star className="w-8 h-8" />,
      fields: ["hobbies", "dreamJob", "bestFriend"]
    }
  ];

  const handleInputChange = (field: keyof UserInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const renderField = (field: keyof UserInfo) => {
    switch (field) {
      case "name":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="text-lg font-semibold text-foreground">
              What's your name?
            </Label>
            <Input
              id={field}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Type your name here..."
              className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50"
            />
          </div>
        );
      
      case "age":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="text-lg font-semibold text-foreground">
              How old are you?
            </Label>
            <Select value={formData[field].toString()} onValueChange={(value) => handleInputChange(field, parseInt(value))}>
              <SelectTrigger className="text-lg p-4 rounded-2xl border-2 border-primary/20">
                <SelectValue placeholder="Pick your age" />
              </SelectTrigger>
              <SelectContent>
                {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => (
                  <SelectItem key={age} value={age.toString()}>{age} years old</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "grade":
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="text-lg font-semibold text-foreground">
              What grade are you in?
            </Label>
            <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
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
        );

      case "hobbies":
      case "dreamJob":
      case "bestFriend":
        const labels = {
          hobbies: "What do you like to do for fun?",
          dreamJob: "What do you want to be when you grow up?",
          bestFriend: "Tell us about your best friend!"
        };
        const placeholders = {
          hobbies: "Playing soccer, drawing, reading...",
          dreamJob: "Astronaut, teacher, artist...",
          bestFriend: "My best friend is..."
        };
        
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="text-lg font-semibold text-foreground">
              {labels[field]}
            </Label>
            <Textarea
              id={field}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={placeholders[field]}
              className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50 min-h-[100px]"
            />
          </div>
        );

      default:
        const simpleLabels = {
          favoriteColor: "What's your favorite color?",
          favoriteAnimal: "What's your favorite animal?",
          favoriteFood: "What's your favorite food?"
        };
        const simplePlaceholders = {
          favoriteColor: "Blue, pink, rainbow...",
          favoriteAnimal: "Dog, cat, dragon...",
          favoriteFood: "Pizza, ice cream, apples..."
        };
        
        return (
          <div key={field} className="space-y-2">
            <Label htmlFor={field} className="text-lg font-semibold text-foreground">
              {simpleLabels[field as keyof typeof simpleLabels]}
            </Label>
            <Input
              id={field}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={simplePlaceholders[field as keyof typeof simplePlaceholders]}
              className="text-lg p-4 rounded-2xl border-2 border-primary/20 focus:border-primary/50"
            />
          </div>
        );
    }
  };

  const currentStepData = steps[currentStep];
  const isStepComplete = currentStepData.fields.every(field => {
    const value = formData[field];
    return value !== "" && value !== 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-card shadow-card border-0 rounded-3xl p-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-primary text-white shadow-soft' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                  index < currentStep ? 'bg-gradient-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-full text-white shadow-soft">
              {currentStepData.icon}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Form fields */}
        <div className="space-y-6 mb-8">
          {currentStepData.fields.map(field => renderField(field as keyof UserInfo))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="playful"
            size="lg"
            onClick={handleBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="fun"
            size="lg"
            onClick={handleNext}
            disabled={!isStepComplete}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? "Create My Story!" : "Next"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};