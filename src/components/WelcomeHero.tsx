import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileTooltip } from "@/components/MobileTooltip";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { BookOpen, Sparkles, Heart, Globe, Crown, Users } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { APP_CONFIG } from "@/constants/app";
import { Link } from "react-router-dom";
import { DebugLogger } from '@/services/DebugLogger';
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
    // Stop shaking after 5 seconds
    const timer = setTimeout(() => {
      setIsShaking(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    DebugLogger.log('ui', 'Language changed to:', newLanguage);
    // Store language preference for multi-step form to pick up
    localStorage.setItem('selectedLanguagePreference', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen mobile-wrapper bg-gradient-hero flex flex-col relative overflow-hidden">
      {/* Header with Company Branding and Language Selector */}
      <header className="relative z-20 bg-black/15 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          
          {/* Mobile Layout - Fixed Overlap Prevention */}
          <div className="flex sm:hidden justify-between items-center gap-2 min-h-[50px]">
            {/* Language Selector - Flexible */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20 touch-target">
                <Globe className="w-3 h-3 text-white" />
                <Select value={i18n.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[60px] border-none bg-transparent text-white text-xs h-auto p-0 focus:ring-0 mobile-input touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mobile-scroll">
                    <SelectItem value="en" className="touch-target">EN</SelectItem>
                    <SelectItem value="ar" className="touch-target">العربية</SelectItem>
                    <SelectItem value="es" className="touch-target">ES</SelectItem>
                    <SelectItem value="zh" className="touch-target">中文</SelectItem>
                    <SelectItem value="hi" className="touch-target">हिं</SelectItem>
                    <SelectItem value="pt" className="touch-target">PT</SelectItem>
                    <SelectItem value="fr" className="touch-target">FR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Company Logo - Centered with overflow protection */}
            <div className="flex items-center gap-1 flex-1 justify-center min-w-0 px-2">
              <img 
                src={logoImage} 
                alt="Time2Read - Interactive reading platform for children with AI-powered stories"
                className="w-5 h-5 flex-shrink-0 drop-shadow-lg"
              />
              <div className="flex items-center font-comic mobile-text-fixed truncate">
                <h1 className="text-xs font-bold text-white drop-shadow-lg">Time</h1>
                <span className="text-sm font-schoolbell text-yellow-300 drop-shadow-lg mx-0.5">2</span>
                <h1 className="text-xs font-bold text-white drop-shadow-lg">Read!</h1>
              </div>
            </div>

            {/* Premium Sign In Button - Clear with Tooltip */}
            <div className="flex-shrink-0">
              {onSignIn && (
                <MobileTooltip
                  content={
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-sm">Premium Access</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {t("welcomeHero.signInTooltip", "Sign in or create account for unlimited stories, AI images & premium features!")}
                      </p>
                    </div>
                  }
                  side="bottom"
                  align="end"
                >
                  <MobileOptimizedButton 
                    variant="outline" 
                    size="sm"
                    onClick={onSignIn}
                    className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-300/50 text-white hover:bg-purple-400/30 text-xs font-semibold shadow-lg px-2 py-1 h-8"
                  >
                    <Crown className="w-3 h-3 text-yellow-300 flex-shrink-0" />
                    <span className="ml-1">Sign In</span>
                  </MobileOptimizedButton>
                </MobileTooltip>
              )}
            </div>
          </div>

          {/* Desktop Layout - Two Row Structure */}
          <div className="hidden sm:flex flex-col gap-4">
            {/* Row 1: Utility Actions */}
            <div className="flex items-center justify-between">
              {/* Language Selector */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-2 border border-white/20">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <Select value={i18n.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[100px] sm:w-[140px] border-none bg-transparent text-white text-xs sm:text-sm h-auto p-0 focus:ring-0">
                    <SelectValue placeholder={t("welcomeHero.languageSelector.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sign In Button - Premium Users */}
              <div className="flex items-center">
                {onSignIn && (
                  <MobileTooltip
                    content={
                      <div>
                        <div className="flex items-center gap-2 p-2">
                          <Crown className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Premium Users Only</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Access unlimited stories, AI images, advanced features & more!
                        </p>
                      </div>
                    }
                    side="bottom"
                  >
                    <MobileOptimizedButton 
                      variant="outline" 
                      size="sm"
                      onClick={onSignIn}
                      className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-300/50 text-white hover:bg-purple-400/30 text-xs sm:text-sm font-semibold shadow-lg px-2 sm:px-3 py-1 sm:py-2"
                    >
                      <Crown className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="hidden sm:inline">{t("welcomeHero.signIn")} - Premium</span>
                      <span className="sm:hidden">Sign In</span>
                    </MobileOptimizedButton>
                  </MobileTooltip>
                )}
              </div>
            </div>

            {/* Row 2: Brand Hero - Centered */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 sm:gap-4 hover-scale transition-all duration-300">
                <img 
                  src={logoImage} 
                  alt="Time 2 Read Logo" 
                  className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-lg"
                />
                <div className="flex flex-col">
                  <div className="flex items-center font-comic">
                    <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                      Time
                    </h1>
                    <span className="text-2xl sm:text-4xl md:text-6xl font-schoolbell text-yellow-300 drop-shadow-lg mx-0.5 transform rotate-3">
                      2
                    </span>
                    <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                      Read!
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 whitespace-nowrap">{t("welcomeHero.companyTagline")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/30 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-yellow-300/40 rounded-full animate-bounce-gentle blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-pink-300/40 rounded-full animate-float blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/30 rounded-full animate-bounce-gentle blur-xl"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative z-10 py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Hero Carousel */}
            <div className="mb-6 md:mb-8 relative">
              <Carousel setApi={setApi} className="w-full max-w-3xl mx-auto carousel-component homepage-carousel">
                <CarouselContent className="carousel-content">
                  <CarouselItem className="carousel-item">
                    <div className="relative">
                      <img 
                        src={carouselImage1} 
                        alt="Young girl reading on tablet in car - mobile reading anywhere experience" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base carousel-text">
                          {t("welcomeHero.carousel.item1")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  <CarouselItem className="carousel-item">
                    <div className="relative">
                      <img 
                        src={carouselImage2} 
                        alt="Asian boy reading on laptop at home" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base carousel-text">
                          {t("welcomeHero.carousel.item2")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  <CarouselItem className="carousel-item">
                    <div className="relative">
                      <img 
                        src={carouselImage3} 
                        alt="Hispanic girl reading on phone in park" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base carousel-text">
                          {t("welcomeHero.carousel.item3")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  <CarouselItem className="carousel-item">
                    <div className="relative">
                      <img 
                        src={carouselImage4} 
                        alt="White boy reading on tablet in library" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base carousel-text">
                          {t("welcomeHero.carousel.item4")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                
                <CarouselPrevious className="left-2 md:left-4 bg-white/20 border-white/30 text-white hover:bg-white/30 h-10 w-10 md:h-12 md:w-12 touch-target transition-all duration-200 carousel-nav carousel-buttons" />
                <CarouselNext className="right-2 md:right-4 bg-white/20 border-white/30 text-white hover:bg-white/30 h-10 w-10 md:h-12 md:w-12 touch-target transition-all duration-200 carousel-nav carousel-buttons" />
              </Carousel>
              
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 animate-bounce-gentle">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 animate-float">
                <Heart className="w-6 h-6 md:w-10 md:h-10 text-pink-300 drop-shadow-lg" />
              </div>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
              {t("welcomeHero.title")}
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                {t("welcomeHero.titleHighlight")}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-2">
              {t("welcomeHero.subtitle")}
            </p>

            {/* Features */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-6 mb-8 md:mb-10 px-2">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/30 text-sm md:text-base">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 flex-shrink-0" />
                <div className="text-white font-medium">
                  {t("welcomeHero.features.reading.title")}
                  <div className="text-xs text-center">{t("welcomeHero.features.reading.subtitle")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/30 text-sm md:text-base">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-pink-300 flex-shrink-0" />
                <span className="text-white font-medium">{t("welcomeHero.features.personalized")}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/30 text-sm md:text-base">
                <Heart className="w-4 h-4 md:w-6 md:h-6 text-blue-300 flex-shrink-0" />
                <span className="text-white font-medium">{t("welcomeHero.features.gradeLevel")}</span>
              </div>
            </div>

            {/* CTA Button - Guest Users */}
            <MobileTooltip
              content={
                <div>
                  <div className="flex items-center gap-2 p-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Guest Users</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Start a guest session — no signup required!
                  </p>
                </div>
              }
              side="top"
            >
              <MobileOptimizedButton 
                variant="hero" 
                size="xl" 
                onClick={onGetStarted}
                className={`relative rounded-full bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--brand-purple))] to-[hsl(var(--accent))] text-white hover:scale-105 shadow-glow transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 group overflow-hidden ${
                  isShaking ? 'animate-bounce-gentle' : ''
                } hover:animate-none`}
              >
                <div className="absolute inset-0 bg-white/10/20 animate-pulse group-hover:animate-none"></div>
                <Users className="w-6 h-6 relative z-10 animate-pulse group-hover:animate-none" />
                <span className="relative z-10 text-center break-words leading-tight">
                  <span className="block sm:inline">{t("welcomeHero.ctaButtonNew") || "Create Your First Story"}</span>
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </MobileOptimizedButton>
            </MobileTooltip>

            <p className="text-white/70 mt-4 text-sm">
              {t("welcomeHero.safetyNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Company Information */}
      <footer className="relative z-20 bg-black/20 backdrop-blur-sm border-t border-white/10 py-6 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/70 text-sm">
            <div className="flex flex-col items-center md:items-start">
              <div className="font-semibold text-white/90 mb-1">{t("welcomeHero.footer.companyName")}</div>
              <div className="text-xs">{t("welcomeHero.footer.description")}</div>
              <div className="mt-2">
                <a href="/pricing" className="story-link text-sm">Plans & Pricing →</a>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs">
              <div>© {new Date().getFullYear()} {t("welcomeHero.footer.companyName")}. {t("welcomeHero.footer.copyright")}</div>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/privacy" className="hover:text-white/90 transition-colors">{t("welcomeHero.footer.privacyPolicy")}</a>
                <a href="/terms" className="hover:text-white/90 transition-colors">{t("welcomeHero.footer.termsOfService")}</a>
                <a href="/ccpa" className="hover:text-white/90 transition-colors">CCPA</a>
                <a href="/accessibility" className="hover:text-white/90 transition-colors">Accessibility</a>
                <a href="/vendors" className="hover:text-white/90 transition-colors">Vendors</a>
                <a href="mailto:hello@time2read.app" className="hover:text-white/90 transition-colors">{t("welcomeHero.footer.contactUs")}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};