import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Sparkles, Heart, Globe, Crown, Users } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { APP_CONFIG } from "@/constants/app";
import heroImage from "@/assets/hero-image-diverse-clear.jpg";
import logoImage from "@/assets/time2read-logo.png";
import carouselImage1 from "@/assets/carousel-1-car-reading.jpg";
import carouselImage2 from "@/assets/carousel-2-home-reading.jpg";
import carouselImage3 from "@/assets/carousel-3-outdoor-reading.jpg";
import carouselImage4 from "@/assets/carousel-4-library-reading.jpg";

interface WelcomeHeroProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

export const WelcomeHero = ({ onGetStarted, onSignIn }: WelcomeHeroProps) => {
  const { t, i18n } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [isShaking, setIsShaking] = useState(true);

  useEffect(() => {
    if (!api) return;

    const autoplay = setInterval(() => {
      api.scrollNext();
    }, APP_CONFIG.CAROUSEL_AUTO_ADVANCE);

    return () => clearInterval(autoplay);
  }, [api]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShaking(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    console.log("Language changed to:", newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen mobile-wrapper bg-gradient-hero flex flex-col relative overflow-hidden">
      {/* Header with Company Branding and Language Selector */}
      <header className="relative z-20 bg-black/15 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          
          {/* Mobile Layout - Fixed for overlapping */}
          <div className="flex sm:hidden relative items-center justify-between w-full min-h-[50px] px-1">
            {/* Language Selector - Left Side */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20 touch-target">
                <Globe className="w-3 h-3 text-white flex-shrink-0" />
                <Select value={i18n.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[50px] border-none bg-transparent text-white text-xs h-auto p-0 focus:ring-0 mobile-input touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mobile-scroll w-[200px]">
                    <SelectItem value="en" className="touch-target p-3">English</SelectItem>
                    <SelectItem value="ar" className="touch-target p-3">العربية</SelectItem>
                    <SelectItem value="es" className="touch-target p-3">Español</SelectItem>
                    <SelectItem value="zh" className="touch-target p-3">中文</SelectItem>
                    <SelectItem value="hi" className="touch-target p-3">हिन्दी</SelectItem>
                    <SelectItem value="pt" className="touch-target p-3">Português</SelectItem>
                    <SelectItem value="fr" className="touch-target p-3">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Company Logo - Centered */}
            <div className="flex items-center gap-2 mx-auto flex-shrink-0">
              <img 
                src={logoImage} 
                alt="Time 2 Read Logo" 
                className="w-6 h-6 drop-shadow-lg"
              />
              <div className="flex items-center font-comic mobile-text-fixed">
                <h1 className="text-sm font-bold text-white drop-shadow-lg">
                  Time
                </h1>
                <span className="text-lg font-schoolbell text-yellow-300 drop-shadow-lg mx-0.5 transform rotate-3">
                  2
                </span>
                <h1 className="text-sm font-bold text-white drop-shadow-lg">
                  Read!
                </h1>
              </div>
            </div>

            {/* Sign In Button - Right Side */}
            <div className="flex-shrink-0">
              {onSignIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignIn}
                  className="text-white text-xs px-2 py-1 h-auto touch-target touch-feedback whitespace-nowrap"
                >
                  {t("welcome.signIn", "Sign In")}
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
              <Globe className="w-4 h-4 text-white" />
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] border-none bg-transparent text-white text-sm h-auto p-0 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="Time 2 Read Logo" 
                className="w-12 h-12 drop-shadow-lg"
              />
              <div className="flex items-center font-comic">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Time
                </h1>
                <span className="text-4xl font-schoolbell text-yellow-300 drop-shadow-lg mx-1 transform rotate-3">
                  2
                </span>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Read!
                </h1>
              </div>
            </div>

            {onSignIn && (
              <Button
                variant="outline"
                size="default"
                onClick={onSignIn}
                className="text-white border-white bg-white/20 hover:bg-white hover:text-gray-800"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t("welcome.signIn", "Sign In")}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-md">
                  <img 
                    src={heroImage} 
                    alt="Children reading together" 
                    className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>

              <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                {t("welcome.title", "Create Amazing Stories")}
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  {t("welcome.subtitle", "Just for You!")}
                </span>
              </h2>

              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                {t("welcome.description", "Personalized reading adventures that grow with your child's learning journey")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full touch-target ${
                    isShaking ? 'animate-bounce' : ''
                  }`}
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  {t("welcome.getStarted", "Create Your First Story")}
                </Button>
              </div>
            </div>

            {/* Features Carousel */}
            <div className="mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 drop-shadow-lg">
                {t("welcome.features.title", "Reading Adventures Everywhere")}
              </h3>
              
              <div className="max-w-4xl mx-auto">
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="relative">
                        <img 
                          src={carouselImage1} 
                          alt="Reading in the car"
                          className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="text-xl font-bold mb-2">{t("welcome.features.anywhere", "Read Anywhere")}</h4>
                          <p className="text-sm">{t("welcome.features.anywhereDesc", "Perfect for car rides and travel")}</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative">
                        <img 
                          src={carouselImage2} 
                          alt="Reading at home"
                          className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="text-xl font-bold mb-2">{t("welcome.features.home", "Cozy Reading")}</h4>
                          <p className="text-sm">{t("welcome.features.homeDesc", "Create magical moments at home")}</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative">
                        <img 
                          src={carouselImage3} 
                          alt="Reading outdoors"
                          className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="text-xl font-bold mb-2">{t("welcome.features.outdoor", "Nature Stories")}</h4>
                          <p className="text-sm">{t("welcome.features.outdoorDesc", "Adventures in the great outdoors")}</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative">
                        <img 
                          src={carouselImage4} 
                          alt="Reading in library"
                          className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="text-xl font-bold mb-2">{t("welcome.features.library", "Learning Together")}</h4>
                          <p className="text-sm">{t("welcome.features.libraryDesc", "Discover new worlds of knowledge")}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full touch-target"
              >
                <BookOpen className="w-6 h-6 mr-2" />
                {t("welcome.startReading", "Start Reading Now")}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};