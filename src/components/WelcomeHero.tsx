import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, Heart, Globe } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import heroImage from "@/assets/hero-image-diverse-clear.jpg";
import logoImage from "@/assets/time2read-logo.png";
import carouselImage1 from "@/assets/carousel-1-car-reading.jpg";
import carouselImage2 from "@/assets/carousel-2-home-reading.jpg";
import carouselImage3 from "@/assets/carousel-3-outdoor-reading.jpg";
import carouselImage4 from "@/assets/carousel-4-library-reading.jpg";

interface WelcomeHeroProps {
  onGetStarted: () => void;
}

export const WelcomeHero = ({ onGetStarted }: WelcomeHeroProps) => {
  const { t, i18n } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const autoplay = setInterval(() => {
      api.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(autoplay);
  }, [api]);

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col relative overflow-hidden">
      {/* Header with Company Branding and Language Selector */}
      <header className="relative z-20 bg-black/15 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
              <Globe className="w-4 h-4 text-white" />
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] border-none bg-transparent text-white text-sm h-auto p-0 focus:ring-0">
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

            {/* Company Logo */}
            <div className="flex items-center gap-4 hover-scale transition-all duration-300">
              <img 
                src={logoImage} 
                alt="Time 2 Read Logo" 
                className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg"
              />
              <div className="flex flex-col">
                <div className="flex items-center font-comic">
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                    Time
                  </h1>
                  <span className="text-4xl md:text-6xl font-schoolbell text-yellow-300 drop-shadow-lg mx-0.5 transform rotate-3">
                    2
                  </span>
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                    Read!
                  </h1>
                </div>
                <p className="text-sm text-white/80 hidden md:block">{t("welcomeHero.companyTagline")}</p>
              </div>
            </div>

            {/* Spacer for balance */}
            <div className="w-[140px]"></div>
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
              <Carousel setApi={setApi} className="w-full max-w-3xl mx-auto">
                <CarouselContent>
                  <CarouselItem>
                    <div className="relative">
                      <img 
                        src={carouselImage1} 
                        alt="Black girl reading on tablet in car" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base">
                          {t("welcomeHero.carousel.item1")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  <CarouselItem>
                    <div className="relative">
                      <img 
                        src={carouselImage2} 
                        alt="Asian boy reading on laptop at home" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base">
                          {t("welcomeHero.carousel.item2")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  <CarouselItem>
                    <div className="relative">
                      <img 
                        src={carouselImage3} 
                        alt="Hispanic girl reading on phone in park" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base">
                          {t("welcomeHero.carousel.item3")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  <CarouselItem>
                    <div className="relative">
                      <img 
                        src={carouselImage4} 
                        alt="White boy reading on tablet in library" 
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl md:rounded-3xl shadow-glow border-2 md:border-4 border-white/20"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl md:rounded-b-3xl p-3 md:p-4">
                        <p className="text-white font-inter font-medium text-xs sm:text-sm md:text-base">
                          {t("welcomeHero.carousel.item4")}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                
                <CarouselPrevious className="left-2 md:left-4 bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 w-8 md:h-10 md:w-10" />
                <CarouselNext className="right-2 md:right-4 bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 w-8 md:h-10 md:w-10" />
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
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-2">
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

            {/* CTA Button */}
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onGetStarted}
              className="animate-bounce-gentle hover:animate-none shadow-glow"
            >
              <BookOpen className="w-6 h-6" />
              {t("welcomeHero.ctaButton")}
            </Button>

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
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs">
              <div>© {new Date().getFullYear()} {t("welcomeHero.footer.companyName")}. {t("welcomeHero.footer.copyright")}</div>
              <div className="flex gap-4">
                <button className="hover:text-white/90 transition-colors">{t("welcomeHero.footer.privacyPolicy")}</button>
                <button className="hover:text-white/90 transition-colors">{t("welcomeHero.footer.termsOfService")}</button>
                <a href="mailto:hello@time-2-read.com" className="hover:text-white/90 transition-colors">{t("welcomeHero.footer.contactUs")}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};