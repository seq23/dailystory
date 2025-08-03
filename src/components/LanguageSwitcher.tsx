import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language) return;
    
    setIsChanging(true);
    try {
      await i18n.changeLanguage(languageCode);
      // Small delay for smooth transition
      setTimeout(() => setIsChanging(false), 300);
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsChanging(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`language-picker touch-target touch-feedback mobile-text-fixed ${isChanging ? 'translation-loading' : ''}`}
          disabled={isChanging}
        >
          <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="content-hierarchy hidden xs:inline font-medium">
            {currentLanguage.nativeName}
          </span>
          <span className="content-hierarchy xs:hidden text-xs font-medium">
            {currentLanguage.code.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 mobile-scroll max-h-60 overflow-y-auto touch-target"
        sideOffset={4}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center justify-between cursor-pointer content-hierarchy touch-target touch-feedback p-4 ${
              language.code === i18n.language ? 'bg-muted' : ''
            }`}
          >
            <div className="flex flex-col flex-1">
              <span className="font-medium text-base mobile-text-fixed">{language.nativeName}</span>
              <span className="text-sm text-muted-foreground mobile-text-fixed">{language.name}</span>
            </div>
            {language.code === i18n.language && (
              <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}