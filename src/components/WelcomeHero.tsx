import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Heart } from "lucide-react";
import heroImage from "@/assets/hero-image-diverse.jpg";

interface WelcomeHeroProps {
  onGetStarted: () => void;
}

export const WelcomeHero = ({ onGetStarted }: WelcomeHeroProps) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/30 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-yellow-300/40 rounded-full animate-bounce-gentle blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-pink-300/40 rounded-full animate-float blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/30 rounded-full animate-bounce-gentle blur-xl"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="mb-8 relative">
            <img 
              src={heroImage} 
              alt="Children creating magical stories" 
              className="w-full max-w-2xl mx-auto rounded-3xl shadow-glow border-4 border-white/20"
            />
            <div className="absolute -top-4 -right-4 animate-bounce-gentle">
              <Sparkles className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-float">
              <Heart className="w-10 h-10 text-pink-300 drop-shadow-lg" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Create Your Own
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Magical Story!
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Every day, discover a new adventure written just for you! 
            Tell us about yourself and watch your personal story come to life.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
              <BookOpen className="w-6 h-6 text-yellow-300" />
              <span className="text-white font-medium">20+ Minutes of Reading (as recommended by teachers)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
              <Sparkles className="w-6 h-6 text-pink-300" />
              <span className="text-white font-medium">Personalized Stories</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
              <Heart className="w-6 h-6 text-blue-300" />
              <span className="text-white font-medium">Grade Level Perfect</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="animate-bounce-gentle hover:animate-none shadow-glow"
          >
            <BookOpen className="w-6 h-6" />
            Start My Story Adventure!
          </Button>

          <p className="text-white/70 mt-4 text-sm">
            Safe, fun, and educational stories for kids of all ages
          </p>
        </div>
      </div>
    </div>
  );
};