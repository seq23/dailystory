import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus, Star, Heart, Sparkles } from "lucide-react";
import type { UserInfo } from "./UserInfoForm";
import ancientBookBg from "@/assets/ancient-book-bg.jpg";
import illustration1 from "@/assets/story-illustration-1.jpg";
import illustration2 from "@/assets/story-illustration-2.jpg";
import illustration3 from "@/assets/story-illustration-3.jpg";
import illustration4 from "@/assets/story-illustration-4.jpg";
import illustration5 from "@/assets/story-illustration-5.jpg";
import illustration6 from "@/assets/story-illustration-6.jpg";
import illustration7 from "@/assets/story-illustration-7.jpg";
import illustration8 from "@/assets/story-illustration-8.jpg";
import illustration9 from "@/assets/story-illustration-9.jpg";
import illustration10 from "@/assets/story-illustration-10.jpg";
import illustration11 from "@/assets/story-illustration-11.jpg";
import illustration12 from "@/assets/story-illustration-12.jpg";
import illustration13 from "@/assets/story-illustration-13.jpg";
import illustration14 from "@/assets/story-illustration-14.jpg";
import illustration15 from "@/assets/story-illustration-15.jpg";
import illustration16 from "@/assets/story-illustration-16.jpg";
import illustration17 from "@/assets/story-illustration-17.jpg";
import illustration18 from "@/assets/story-illustration-18.jpg";
import illustration19 from "@/assets/story-illustration-19.jpg";
import illustration20 from "@/assets/story-illustration-20.jpg";
import illustration21 from "@/assets/story-illustration-21.jpg";
import illustration22 from "@/assets/story-illustration-22.jpg";
import illustration23 from "@/assets/story-illustration-23.jpg";
import illustration24 from "@/assets/story-illustration-24.jpg";
import illustration25 from "@/assets/story-illustration-25.jpg";
import illustration26 from "@/assets/story-illustration-26.jpg";
import illustration27 from "@/assets/story-illustration-27.jpg";
import illustration28 from "@/assets/story-illustration-28.jpg";
import illustration29 from "@/assets/story-illustration-29.jpg";
import illustration30 from "@/assets/story-illustration-30.jpg";
import illustration31 from "@/assets/story-illustration-31.jpg";
import illustration32 from "@/assets/story-illustration-32.jpg";
import illustration33 from "@/assets/story-illustration-33.jpg";
import illustration34 from "@/assets/story-illustration-34.jpg";
import illustration35 from "@/assets/story-illustration-35.jpg";
import illustration36 from "@/assets/story-illustration-36.jpg";
import illustration37 from "@/assets/story-illustration-37.jpg";
import illustration38 from "@/assets/story-illustration-38.jpg";
import illustration39 from "@/assets/story-illustration-39.jpg";
import illustration40 from "@/assets/story-illustration-40.jpg";
import illustration41 from "@/assets/story-illustration-41.jpg";
import illustration42 from "@/assets/story-illustration-42.jpg";
import illustration43 from "@/assets/story-illustration-43.jpg";
import illustration44 from "@/assets/story-illustration-44.jpg";
import avatarBoyPale from "@/assets/avatar-boy-pale.jpg";
import avatarBoyLight from "@/assets/avatar-boy-light.jpg";
import avatarBoyMedium from "@/assets/avatar-boy-medium.jpg";
import avatarBoyOlive from "@/assets/avatar-boy-olive.jpg";
import avatarBoyDark from "@/assets/avatar-boy-dark.jpg";
import avatarGirlPale from "@/assets/avatar-girl-pale.jpg";
import avatarGirlLight from "@/assets/avatar-girl-light.jpg";
import avatarGirlMedium from "@/assets/avatar-girl-medium.jpg";
import avatarGirlOlive from "@/assets/avatar-girl-olive.jpg";
import avatarGirlDark from "@/assets/avatar-girl-dark.jpg";
import time2ReadLogo from "@/assets/time2read-logo.png";
import { FloatingTimer } from "./FloatingTimer";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { SecureRunwareService, secureImageCache, cacheImage, getCachedImage } from "@/services/secureRunwareService";
import { SecurityValidator } from "@/utils/securityValidation";
import { SecurityMonitor } from "@/utils/monitoring";
import { createChildFriendlyPrompt } from "@/services/runwareService";
import { ElevenLabsService } from "@/services/textToSpeechService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
}

export const StoryDisplay = ({ userInfo, onHome, onNewStory }: StoryDisplayProps) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);
  const [storyExtensions, setStoryExtensions] = useState(0);
  const [story, setStory] = useState<string[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  const [hasShownDifficultyAlert, setHasShownDifficultyAlert] = useState(false);
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  const [illustrationGenerationQueue, setIllustrationGenerationQueue] = useState<number[]>([]);
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));
  const [elevenLabsService] = useState<any>(() => 
    new ElevenLabsService({ apiKey: "sk_9935316e04bb91ad195bacd28187279ec30691b8fa66ab6b" })
  );

  const getUserAvatar = () => {
    const avatarImages = {
      boy: {
        pale: avatarBoyPale,
        light: avatarBoyLight,
        medium: avatarBoyMedium,
        olive: avatarBoyOlive,
        dark: avatarBoyDark,
      },
      girl: {
        pale: avatarGirlPale,
        light: avatarGirlLight,
        medium: avatarGirlMedium,
        olive: avatarGirlOlive,
        dark: avatarGirlDark,
      },
    };
    
    return avatarImages[userInfo.avatar.type]?.[userInfo.avatar.skinTone] || avatarBoyLight;
  };

  const getAvatarDescription = (includeAppearance = false) => {
    const genderDesc = userInfo.avatar.type === "boy" ? "young boy" : "young girl";
    
    if (!includeAppearance) {
      return `a ${genderDesc}`;
    }
    
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar.skinTone];
    
    return `a happy ${genderDesc} with ${skinToneDesc}`;
  };

  const generateStoryExtension = (info: UserInfo, difficulty: DifficultyLevel, extensionNumber: number): string[] => {
    const avatarDesc = getAvatarDescription();
    const hobbies = info.hobbies;
    
    // Create different extension content based on difficulty level
    const createExtensionByDifficulty = () => {
      if (difficulty === "easy") {
        const simpleExtensions = [
          [
            `${info.name} sees a dog.`,
            `The dog is big.`,
            `${info.name} says hi.`,
            `The dog wags tail.`,
            `They are friends.`
          ],
          [
            `${info.name} finds a ball.`,
            `The ball is red.`,
            `${info.name} throws the ball.`,
            `The ball bounces high.`,
            `${info.name} catches it.`
          ]
        ];
        return simpleExtensions[extensionNumber % simpleExtensions.length];
      } else if (difficulty === "medium") {
        const mediumExtensions = [
          [
            `${info.name} discovered a hidden portal behind a waterfall. The water sparkled with rainbow colors.`,
            `Stepping through the portal, ${info.name} found themselves in a floating cloud city. Friendly cloud people welcomed them warmly.`,
            `The cloud people taught ${info.name} how to bounce on fluffy clouds. They played exciting games in the sky.`,
            `${info.name} helped the cloud people fix their rainbow maker. Now beautiful rainbows appeared everywhere.`,
            `Before leaving, the cloud people gave ${info.name} a special cloud pet. It followed them home happily.`
          ],
          [
            `${info.name} met a wise owl who owned a magical library. The books could tell stories all by themselves.`,
            `Each book contained adventures about ${hobbies} and amazing discoveries. ${info.name} listened with wonder.`,
            `The owl asked ${info.name} to help organize the flying books. Together they created perfect order.`,
            `As a reward, the owl gave ${info.name} a special bookmark. It could take them into any story.`,
            `${info.name} promised to return and share their own adventures. The owl hooted with joy.`
          ]
        ];
        return mediumExtensions[extensionNumber % mediumExtensions.length];
      } else if (difficulty === "hard") {
        const hardExtensions = [
          [
            `${info.name} encountered an interdimensional gateway concealed within crystalline formations. The portal emanated extraordinary luminescence.`,
            `Traversing the threshold, ${info.name} materialized within a realm where sentient celestial bodies communicated through harmonic vibrations.`,
            `These astronomical entities revealed ancient knowledge about ${hobbies}, expanding ${info.name}'s understanding beyond conventional limitations.`,
            `${info.name} participated in cosmic ceremonies that synchronized planetary movements with their personal growth and development.`,
            `Upon completing their celestial education, ${info.name} received astral abilities that would enhance their future endeavors.`
          ],
          [
            `${info.name} discovered an academy where remarkable individuals mastered extraordinary talents related to ${hobbies}.`,
            `The academy's professors were legendary figures who had achieved unprecedented accomplishments throughout history.`,
            `${info.name} underwent rigorous training that challenged their intellectual, emotional, and spiritual capabilities.`,
            `Through determination and perseverance, ${info.name} developed skills that surpassed their previous limitations.`,
            `Graduating with honors, ${info.name} joined an elite society dedicated to using their abilities for universal betterment.`
          ]
        ];
        return hardExtensions[extensionNumber % hardExtensions.length];
      } else { // expert
        const expertExtensions = [
          [
            `${info.name} encountered an infinitely complex multidimensional nexus where parallel realities converged through quantum entanglement phenomena.`,
            `Navigation through these interconnected universes required sophisticated comprehension of theoretical physics and metaphysical principles governing existence.`,
            `${info.name} assimilated knowledge from civilizations spanning eons, synthesizing their expertise in ${hobbies} with cosmic wisdom.`,
            `The expedition necessitated resolving paradoxical situations that challenged fundamental assumptions about causality and temporal mechanics.`,
            `Ultimately, ${info.name} transcended conventional limitations, achieving enlightenment that unified scientific understanding with spiritual awareness.`
          ],
          [
            `${info.name} infiltrated a clandestine organization dedicated to preserving universal equilibrium through sophisticated manipulation of probability matrices.`,
            `Membership required demonstrating exceptional proficiency in ${hobbies} while simultaneously mastering esoteric disciplines encompassing consciousness research.`,
            `${info.name} undertook increasingly complex missions that influenced the trajectory of civilizations across multiple dimensional planes.`,
            `Success demanded synthesizing intuitive wisdom with analytical reasoning, transcending dichotomous thinking to embrace holistic perspectives.`,
            `${info.name} eventually assumed leadership responsibilities, guiding interdimensional affairs with unprecedented wisdom and compassion.`
          ]
        ];
        return expertExtensions[extensionNumber % expertExtensions.length];
      }
    };

    const selectedExtension = createExtensionByDifficulty();
    
    const difficultySettings = {
      easy: { words: 25 },
      medium: { words: 50 },
      hard: { words: 75 },
      expert: { words: 100 }
    };
    
    const settings = difficultySettings[difficulty];
    
    return selectedExtension.map(paragraph => {
      const words = paragraph.split(' ');
      if (words.length > settings.words) {
        return words.slice(0, settings.words).join(' ') + '...';
      }
      return paragraph;
    });
  };

  const generateInitialStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    const avatarDesc = getAvatarDescription();
    const hobbies = info.hobbies;
    
    const difficultySettings = {
      easy: { 
        sentences: 1, 
        words: 6, 
        vocabulary: "very simple words that 3-5 year olds know",
        structure: "one short, simple sentence"
      },
      medium: { 
        sentences: 3, 
        words: 60, 
        vocabulary: "age-appropriate words for 7-9 year olds",
        structure: "clear, engaging sentences"
      },
      hard: { 
        sentences: 4, 
        words: 90, 
        vocabulary: "challenging but accessible words for 10-12 year olds",
        structure: "varied sentence structures"
      },
      expert: { 
        sentences: 5, 
        words: 120, 
        vocabulary: "advanced vocabulary for 13+ year olds",
        structure: "complex and sophisticated sentences"
      }
    };

    const settings = difficultySettings[difficulty];
    
    // Create different story content based on difficulty level
    const createStoryByDifficulty = () => {
      if (difficulty === "easy") {
        return [
          `${info.name} likes to play.`,
          `${info.name} found a cat.`,
          `The cat is soft.`,
          `${info.name} pets the cat.`,
          `The cat says meow.`,
          `They play together.`,
          `${info.name} is happy.`,
          `The cat is happy.`,
          `They run and jump.`,
          `${info.name} loves the cat.`
        ];
      } else if (difficulty === "medium") {
        return [
          `${info.name} was a curious ${info.avatar.type} who loved ${hobbies} more than anything. Every day brought new adventures.`,
          `One sunny morning, ${info.name} discovered a mysterious glowing object in their backyard. It sparkled like stars and felt warm to touch.`,
          `The magical object suddenly transported ${info.name} to an amazing world. Colorful creatures welcomed them with cheerful songs.`,
          `A wise unicorn approached ${info.name} and explained they were chosen for a special quest. The unicorn gave them magical abilities.`,
          `${info.name} used their new powers to help lost forest animals find their homes. Everyone was grateful for their kindness.`,
          `Along the journey, ${info.name} met a friendly dragon who taught them about courage. Together they solved exciting puzzles.`,
          `The adventure led ${info.name} to a beautiful castle where a celebration was happening. All the creatures they helped were there.`,
          `${info.name} was honored as a hero and received a special medal. The ceremony was filled with music and laughter.`,
          `When it was time to return home, ${info.name} promised to visit again. They had learned so much about friendship.`,
          `Back in their own world, ${info.name} treasured the memories forever. Their love for ${hobbies} had grown even stronger.`
        ];
      } else if (difficulty === "hard") {
        return [
          `${info.name} was an adventurous ${info.avatar.type} with an insatiable passion for ${hobbies}. Their imagination knew no boundaries, constantly seeking extraordinary experiences.`,
          `During an exploration of their grandmother's mysterious attic, ${info.name} uncovered an ancient, luminescent artifact. The relic pulsated with otherworldly energy, emanating whispers of forgotten legends.`,
          `Without warning, the enchanted artifact transported ${info.name} into a mystical realm where reality defied conventional understanding. Majestic creatures soared through crystalline skies while magical energies danced around them.`,
          `An ethereal guardian materialized before ${info.name}, revealing they had been destined for this momentous encounter. The guardian bestowed upon them extraordinary abilities connected to their passion for ${hobbies}.`,
          `Utilizing their newfound supernatural talents, ${info.name} embarked on a perilous mission to restore balance to the endangered realm. Ancient prophecies spoke of their arrival and potential triumph.`,
          `Throughout their treacherous journey, ${info.name} encountered formidable challenges that tested their courage, wisdom, and determination. Each obstacle strengthened their resolve and expanded their understanding.`,
          `The quest culminated in an epic confrontation with malevolent forces threatening the magical world's existence. ${info.name}'s unique connection to ${hobbies} proved instrumental in the decisive victory.`,
          `Grateful inhabitants from across the liberated realm gathered to honor ${info.name}'s heroic accomplishments. The celebration resonated with triumphant melodies and expressions of eternal gratitude.`,
          `As their incredible adventure concluded, ${info.name} reluctantly prepared to return to their original world. The bonds forged during their quest would endure beyond dimensional boundaries.`,
          `Forever transformed by their extraordinary experience, ${info.name} returned home with profound wisdom and an unshakeable belief in the power of pursuing one's passions with unwavering dedication.`
        ];
      } else { // expert
        return [
          `${info.name} exemplified the quintessential characteristics of an intellectually curious and remarkably perceptive ${info.avatar.type}, whose profound dedication to ${hobbies} transcended conventional boundaries and ventured into realms of extraordinary possibility.`,
          `While meticulously examining the labyrinthine corridors of their ancestral estate's forgotten archives, ${info.name} fortuitously discovered an ineffably ancient artifact whose luminescent properties defied scientific explanation and resonated with interdimensional harmonics.`,
          `The archaeological marvel instantaneously precipitated a quantum displacement phenomenon, catapulting ${info.name} across the metaphysical threshold into an alternate universe where fundamental laws of physics yielded to supernatural phenomena and impossibility became manifest reality.`,
          `An omniscient celestial entity of incomprehensible wisdom materialized through dimensional convergence, elucidating ${info.name}'s predestined role in fulfilling an ancient cosmological prophecy that would determine the fate of multiple interconnected realms throughout the multiverse.`,
          `Harnessing their exponentially amplified metaphysical capabilities, ${info.name} initiated a systematic campaign to neutralize the catastrophic entropy threatening to obliterate the delicate equilibrium maintaining existence across parallel dimensions, utilizing their expertise in ${hobbies} as a foundational framework.`,
          `The unprecedented odyssey necessitated navigating increasingly complex moral dilemmas and philosophical paradoxes that challenged ${info.name}'s fundamental understanding of reality, consciousness, and the interconnectedness of all sentient beings throughout the cosmic tapestry.`,
          `The climactic confrontation against primordial chaos entities required ${info.name} to synthesize advanced theoretical knowledge with intuitive wisdom, ultimately discovering that their mastery of ${hobbies} contained the key to unlocking universal harmonization principles.`,
          `Upon achieving the seemingly impossible victory through intellectual prowess and spiritual transcendence, representatives from countless civilizations converged to acknowledge ${info.name}'s unprecedented contribution to preserving the fundamental structure of existence itself.`,
          `The inevitable conclusion of their transformative expedition approached with bittersweet contemplation, as ${info.name} recognized that their consciousness had been permanently elevated to comprehend previously inconceivable truths about the nature of reality and purpose.`,
          `Returning to their original dimension with consciousness expanded beyond conventional limitations, ${info.name} embraced their eternal responsibility as a guardian of interdimensional wisdom, forever changed by the realization that true mastery of ${hobbies} represented a pathway to universal understanding.`
        ];
      }
    };

    const baseStory = createStoryByDifficulty();

    return baseStory.map(paragraph => {
      const words = paragraph.split(' ');
      if (words.length > settings.words) {
        return words.slice(0, settings.words).join(' ') + '...';
      }
      return paragraph;
    });
  };

  // Function to generate custom illustration for a story page
  const generateCustomIllustration = async (storyText: string, pageIndex: number) => {
    try {
      setIsGeneratingImage(true);
      
      // Check if we already have a cached illustration for this page
      const cachedImage = getCachedImage(`story-${pageIndex}-${storyText.slice(0, 50)}`);
      if (cachedImage) {
        setCustomIllustrations(prev => new Map(prev).set(pageIndex, cachedImage));
        return;
      }
      
      // Generate child-friendly prompt based on story content
      const prompt = createChildFriendlyPrompt(storyText, userInfo, pageIndex);
      
      // Generate the illustration
      const result = await runwareService.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        width: 1024,
        height: 1024,
        numberResults: 1,
        outputFormat: "WEBP"
      });
      
      if (result?.imageURL) {
        // Cache the generated image
        cacheImage(`story-${pageIndex}-${storyText.slice(0, 50)}`, result.imageURL);
        
        // Update the custom illustrations map
        setCustomIllustrations(prev => new Map(prev).set(pageIndex, result.imageURL));
      }
    } catch (error) {
      console.error(`Failed to generate illustration for page ${pageIndex}:`, error);
      // Fallback to static illustration
      const fallbackIndex = pageIndex % illustrations.length;
      setCustomIllustrations(prev => new Map(prev).set(pageIndex, illustrations[fallbackIndex]));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Initialize story with useEffect to avoid conflicts
  useEffect(() => {
    const initialStory = generateInitialStory(userInfo, currentDifficulty);
    setStory(initialStory);
    
    // Only clear custom illustrations when user changes, not difficulty
    setCustomIllustrations(new Map());
    setIllustrationGenerationQueue([]);
  }, [userInfo]);

  // Regenerate story text when difficulty changes, but preserve images
  useEffect(() => {
    if (story.length > 0) {
      // Add 1-2 second delay before updating story text for difficulty changes
      const difficultyChangeTimer = setTimeout(() => {
        const updatedStory = generateInitialStory(userInfo, currentDifficulty);
        setStory(updatedStory);
      }, Math.random() * 1000 + 1000); // 1-2 second delay

      return () => clearTimeout(difficultyChangeTimer);
    }
  }, [currentDifficulty]);

  // Generate illustrations with delay after story is loaded
  useEffect(() => {
    if (story.length > 0) {
      // Start generating illustrations after a 1.5-second delay
      const delayTimer = setTimeout(() => {
        // Queue all pages for illustration generation
        const pages = Array.from({ length: story.length }, (_, i) => i);
        setIllustrationGenerationQueue(pages);
      }, 1500);

      return () => clearTimeout(delayTimer);
    }
  }, [story]);

  // Process illustration generation queue
  useEffect(() => {
    if (illustrationGenerationQueue.length > 0 && !isGeneratingImage) {
      const nextPage = illustrationGenerationQueue[0];
      const storyText = story[nextPage];
      
      if (storyText && !customIllustrations.has(nextPage)) {
        // Generate illustration for this page
        generateCustomIllustration(storyText, nextPage);
        
        // Remove this page from the queue
        setIllustrationGenerationQueue(prev => prev.slice(1));
      } else {
        // Skip this page and move to next
        setIllustrationGenerationQueue(prev => prev.slice(1));
      }
    }
  }, [illustrationGenerationQueue, isGeneratingImage, story, customIllustrations]);

  const totalPages = story.length;
  const currentStory = story[currentParagraph] || "Loading your magical story...";

  const illustrations = [
    illustration1, illustration2, illustration3, illustration4, illustration5,
    illustration6, illustration7, illustration8, illustration9, illustration10,
    illustration11, illustration12, illustration13, illustration14, illustration15,
    illustration16, illustration17, illustration18, illustration19, illustration20,
    illustration21, illustration22, illustration23, illustration24, illustration25,
    illustration26, illustration27, illustration28, illustration29, illustration30,
    illustration31, illustration32, illustration33, illustration34, illustration35,
    illustration36, illustration37, illustration38, illustration39, illustration40,
    illustration41, illustration42, illustration43, illustration44
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (isReading && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsReading(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isReading, timeRemaining]);

  useEffect(() => {
    // Use custom illustration if available, otherwise fall back to static illustrations
    const customIllustration = customIllustrations.get(currentParagraph);
    if (customIllustration) {
      setCurrentIllustration(customIllustration);
    } else {
      const illustrationIndex = currentParagraph % illustrations.length;
      setCurrentIllustration(illustrations[illustrationIndex]);
    }
  }, [currentParagraph, customIllustrations]);

  // Alert user about difficulty buttons when reaching page 3
  useEffect(() => {
    if (currentParagraph === 2 && !hasShownDifficultyAlert) {
      // Show animation for 3 seconds, then mark as shown
      setTimeout(() => {
        setHasShownDifficultyAlert(true);
      }, 3000);
    }
  }, [currentParagraph, hasShownDifficultyAlert]);


  const handleNext = () => {
    if (currentParagraph < totalPages - 1) {
      setCurrentParagraph(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
    }
  };

  const handleDifficultyUp = () => {
    const levels: DifficultyLevel[] = ["easy", "medium", "hard", "expert"];
    const currentIndex = levels.indexOf(currentDifficulty);
    if (currentIndex < levels.length - 1) {
      setCurrentDifficulty(levels[currentIndex + 1]);
    }
  };

  const handleDifficultyDown = () => {
    const levels: DifficultyLevel[] = ["easy", "medium", "hard", "expert"];
    const currentIndex = levels.indexOf(currentDifficulty);
    if (currentIndex > 0) {
      setCurrentDifficulty(levels[currentIndex - 1]);
    }
  };

  const handleAddTime = () => {
    const MAX_SESSION_TIME = 40 * 60; // 40 minutes in seconds
    const currentTime = timeRemaining;
    
    // Only add time if we haven't reached the maximum
    if (currentTime < MAX_SESSION_TIME) {
      const timeToAdd = Math.min(600, MAX_SESSION_TIME - currentTime); // Add up to 10 minutes, but not exceed max
      setTimeRemaining(prev => prev + timeToAdd);
    }
  };

  const handleAddPages = () => {
    // Generate new story pages without adding time
    const extensionPages = generateStoryExtension(userInfo, currentDifficulty, storyExtensions);
    setStory(prev => [...prev, ...extensionPages]);
    setStoryExtensions(prev => prev + 1);
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Magical floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-20 left-4 md:left-10 text-accent w-4 h-4 md:w-6 md:h-6 animate-float" />
        <Heart className="absolute top-32 right-8 md:right-16 text-primary-glow w-4 h-4 md:w-5 md:h-5 animate-bounce-gentle" />
        <Sparkles className="absolute bottom-32 left-8 md:left-20 text-secondary w-5 h-5 md:w-7 md:h-7 animate-wiggle" />
        <Star className="absolute bottom-20 right-16 md:right-32 text-accent w-3 h-3 md:w-4 md:h-4 animate-float" />
      </div>

      {/* Header with Logo and Company Branding */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-soft border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src={time2ReadLogo} 
                alt="Time2Read Logo" 
                className="w-8 h-8 sm:w-12 sm:h-12 hover:animate-wiggle cursor-pointer"
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Time2Read
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-comic hidden sm:block">
                  Reading Adventures for Kids
                </p>
              </div>
            </div>

            {/* User Info and Navigation */}
            <div className="flex items-center gap-1 sm:gap-4">
              <div className="hidden lg:flex items-center gap-3 bg-gradient-card rounded-2xl px-4 py-2 shadow-soft">
                <img 
                  src={getUserAvatar()} 
                  alt="Your avatar" 
                  className="w-8 h-8 rounded-full border-2 border-primary"
                />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{userInfo.name}</p>
                  <p className="text-muted-foreground">Age {userInfo.age}</p>
                </div>
              </div>
              
              <Button
                onClick={onHome}
                variant="outline"
                size="sm"
                className="font-comic hover:scale-105 transition-transform bg-white/80 hover:bg-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              
              <Button
                onClick={onNewStory}
                size="sm"
                className="font-comic hover:scale-105 transition-transform bg-gradient-primary hover:shadow-glow text-xs sm:text-sm px-2 sm:px-4"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Story</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Story Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-32">
        {/* Story Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-semibold text-foreground text-sm sm:text-base">
                Page {currentParagraph + 1} of {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Progress:</span>
              <div className="w-16 sm:w-20 text-xs sm:text-sm font-semibold text-primary">
                {Math.round(((currentParagraph + 1) / totalPages) * 100)}%
              </div>
            </div>
          </div>
          <Progress 
            value={((currentParagraph + 1) / totalPages) * 100} 
            className="h-2 sm:h-3 bg-secondary/30"
          />
        </div>

        {/* Story Book Layout */}
        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-card border-2 sm:border-4 border-primary/20 overflow-hidden">
          <div className="p-3 sm:p-6 lg:p-8">
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
              {/* Illustration Panel */}
              <div className="relative order-1 lg:order-1">
                <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-secondary p-2 sm:p-4 shadow-soft">
                  {currentIllustration ? (
                    <img
                      src={currentIllustration}
                      alt={`Story illustration for page ${currentParagraph + 1}`}
                      className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-card rounded-lg sm:rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        {isGeneratingImage ? (
                          <>
                            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2 sm:mb-4 animate-spin" />
                            <p className="text-muted-foreground font-comic text-sm sm:text-base">
                              Creating magical illustration...
                            </p>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2 sm:mb-4" />
                            <p className="text-muted-foreground font-comic text-sm sm:text-base">
                              Illustration loading...
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decorative corner elements - smaller on mobile */}
                <Star className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 text-accent w-4 h-4 sm:w-6 sm:h-6" />
                <Heart className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-primary w-3 h-3 sm:w-5 sm:h-5" />
                <Sparkles className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 text-secondary w-4 h-4 sm:w-6 sm:h-6" />
                <Star className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 text-accent w-3 h-3 sm:w-5 sm:h-5" />
              </div>

              {/* Story Text Panel */}
              <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
                {/* Difficulty Level Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-secondary rounded-full text-xs sm:text-sm font-semibold text-secondary-foreground">
                      {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level
                    </span>
                  </div>
                  
                  {/* Difficulty Controls */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDifficultyDown}
                          size="sm"
                          variant="outline"
                          className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 hover:scale-110 transition-transform ${
                            currentParagraph === 2 && !hasShownDifficultyAlert 
                              ? 'animate-bounce bg-yellow-100 border-yellow-400' 
                              : ''
                          }`}
                          disabled={currentDifficulty === "easy"}
                        >
                          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Easier</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDifficultyUp}
                          size="sm"
                          variant="outline"
                          className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 hover:scale-110 transition-transform ${
                            currentParagraph === 2 && !hasShownDifficultyAlert 
                              ? 'animate-bounce bg-yellow-100 border-yellow-400' 
                              : ''
                          }`}
                          disabled={currentDifficulty === "expert"}
                        >
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Harder</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Story Text */}
                <div className="bg-gradient-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft min-h-[200px] sm:min-h-[300px] flex items-center">
                  <div className="w-full">
                    <p className={`leading-relaxed font-comic text-center ${
                      currentDifficulty === "easy" ? 'text-2xl sm:text-3xl lg:text-4xl font-bold' :
                      userInfo.age <= 7 ? 'text-lg sm:text-xl lg:text-2xl' : 
                      userInfo.age <= 9 ? 'text-base sm:text-lg lg:text-xl' : 
                      'text-sm sm:text-base lg:text-lg'
                    }`}>
                      {processTextForPhonetics(currentStory, "", currentDifficulty, elevenLabsService)}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center gap-2">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentParagraph === 0}
                    className="bg-gradient-secondary hover:shadow-soft font-comic rounded-xl sm:rounded-2xl px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">← Previous</span>
                    <span className="sm:hidden">←</span>
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={currentParagraph >= totalPages - 1}
                    className="bg-gradient-primary hover:shadow-glow font-comic rounded-xl sm:rounded-2xl px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden">→</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Floating Timer */}
      <FloatingTimer
        timeRemaining={timeRemaining}
        isReading={isReading}
        onToggleReading={() => setIsReading(!isReading)}
        onAddTime={handleAddTime}
        onAddPages={handleAddPages}
        pagesRemaining={totalPages - currentParagraph - 1}
      />
    </div>
    </TooltipProvider>
  );
};
