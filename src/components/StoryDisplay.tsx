import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Home, RotateCcw, Volume2, VolumeX, TrendingUp, TrendingDown, Plus } from "lucide-react";
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
// Import avatar images
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
import { FloatingTimer } from "./FloatingTimer";
import { processTextForPhonetics } from "@/utils/textProcessor";
import { SecureRunwareService, secureImageCache, cacheImage, getCachedImage } from "@/services/secureRunwareService";
import { SecurityValidator } from "@/utils/securityValidation";
import { SecurityMonitor } from "@/utils/monitoring";
import { createChildFriendlyPrompt } from "@/services/runwareService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
}

export const StoryDisplay = ({ userInfo, onHome, onNewStory }: StoryDisplayProps) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true); // Auto-start reading
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // Start at 10 minutes
  const [storyExtensions, setStoryExtensions] = useState(0); // Track how many 10-min extensions added
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));

  // Get user's avatar image
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

  // Get avatar description for image generation prompts
  const getAvatarDescription = () => {
    const genderDesc = userInfo.avatar.type === "boy" ? "young boy" : "young girl";
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar.skinTone];
    
    return `a happy ${genderDesc} with ${skinToneDesc}`;
  };

  // Generate age-appropriate G/PG rated stories with calibrated length for 20-minute reading
  // Maximum reading level is capped at 12th grade (expert difficulty)
  const generateStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    // Ensure all content is family-friendly and G/PG rated
    const contentGuidelines = "All stories must be positive, uplifting, non-violent, educational, and appropriate for children. No scary, dark, or inappropriate themes.";
    const baseStoryTemplates = {
      // Easy: 12 very simple pages (ages 4-6, K-1st grade, 5-15 words per page like real children's books)
      easy: [
        `Hi! This is ${info.name}.`,
        
        `${info.name} is ${info.age} years old.`,
        
        `${info.name} likes ${info.favoriteColor}.`,
        
        `One day, ${info.name} went outside.`,
        
        `${info.name} saw a ${info.favoriteAnimal}.`,
        
        `The ${info.favoriteAnimal} was sad.`,
        
        `"Help me!" said the ${info.favoriteAnimal}.`,
        
        `${info.name} helped the ${info.favoriteAnimal}.`,
        
        `They went to a magic place.`,
        
        `Everything was made of ${info.favoriteFood}!`,
        
        `${info.name} and the ${info.favoriteAnimal} played.`,
        
        `${info.name} was happy. The End.`
      ],
      
      // Medium: 10 medium pages (ages 7-9, 2nd-4th grade reading level)
      medium: [
        `Once upon a time, there was a special child named ${info.name} who was ${info.age} years old and in ${info.grade} grade. ${info.name} had a wonderful gift that made everything turn the beautiful color ${info.favoriteColor}!`,
        
        `One beautiful morning, while ${info.name} was enjoying ${info.hobbies}, they heard a small voice calling for help. Looking around carefully, they discovered a magical ${info.favoriteAnimal} stuck high up in a shimmering, golden tree.`,
        
        `"Please help me!" called the ${info.favoriteAnimal}, its voice filled with hope. ${info.name} felt sorry for their new friend and carefully used their special ${info.favoriteColor} powers to gently free the trapped animal from the branches.`,
        
        `The grateful ${info.favoriteAnimal} was so thankful that it invited ${info.name} on an amazing adventure. "I know a secret kingdom," whispered the ${info.favoriteAnimal}. "Would you like to see something truly magical?"`,
        
        `Together, they traveled through a rainbow portal and arrived in a fantastic kingdom where all the buildings were made of delicious ${info.favoriteFood}! The castle walls were ${info.favoriteFood}, and even the roads were made of ${info.favoriteFood}.`,
        
        `In this magical place, the sad people explained that their beautiful rainbow had lost all its wonderful colors. Without the rainbow, their kingdom was becoming gray and gloomy. They had been waiting for someone special to help them.${info.specialRequest ? ` They also mentioned that ${info.specialRequest} might be the key to solving the problem!` : ''}`,
        
        `${info.name} remembered what they had learned about working together to solve big problems.${info.specialRequest ? ` They also thought about how ${info.specialRequest} could help make everything better.` : ''} "We can fix this!" said ${info.name} confidently. The ${info.favoriteAnimal} nodded and smiled encouragingly.`,
        
        `With determination and kindness, ${info.name} and the ${info.favoriteAnimal} joined their powers together. Suddenly, a burst of beautiful ${info.favoriteColor} light shot up into the sky and restored the rainbow to its full, magnificent glory!`,
        
        `The grateful kingdom celebrated with singing and dancing! The people offered ${info.name} an important royal position, but ${info.name} politely explained they needed to return home to share this adventure.${info.specialRequest ? ` They promised to bring ${info.specialRequest} back with them next time!` : ''}`,
        
        `As they returned home, ${info.name} felt proud and happy. They had learned that being brave, kind, and helpful can lead to the most wonderful experiences.${info.specialRequest ? ` And they discovered that ${info.specialRequest} made everything even more magical!` : ''} ${info.name} fell asleep that night dreaming of future adventures. The End.`
      ],
      
      // Hard: 14 longer pages (ages 10-12, 5th-8th grade reading level)
      hard: [
        `In a world where extraordinary things happened to ordinary children, there lived a remarkable young person named ${info.name}, who at ${info.age} years old and in ${info.grade} grade, possessed an incredible ability to transform anything they touched into the most magnificent shade of ${info.favoriteColor}.`,
        
        `On a particularly enchanting morning, while ${info.name} was enthusiastically pursuing their favorite activity of ${info.hobbies}, an urgent plea for assistance echoed through the crisp autumn air. The voice seemed to come from nowhere and everywhere at once.`,
        
        `Upon careful investigation, ${info.name} discovered an extraordinary ${info.favoriteAnimal} trapped within the crystalline branches of an ancient, mystical tree that shimmered with otherworldly energy. The creature's eyes sparkled with intelligence and desperate hope.`,
        
        `"I desperately need your help!" implored the ${info.favoriteAnimal}, its voice filled with both dignity and desperation. "I have been imprisoned here by a powerful spell, and only someone with a pure heart and special abilities can free me."`,
        
        `${info.name}, moved by deep compassion and armed with their supernatural ${info.favoriteColor} abilities, carefully and methodically worked to break the magical bonds. With each touch, the crystalline prison began to crack and dissolve.`,
        
        `The profoundly grateful ${info.favoriteAnimal} extended a formal invitation to ${info.name} for an unprecedented journey to a magnificent realm that existed beyond the boundaries of the ordinary world. "Your kindness has earned you a great adventure," it declared solemnly.`,
        
        `Through a swirling vortex of colors and stardust, they traveled to a fantastical kingdom where architectural marvels were constructed entirely from varieties of ${info.favoriteFood}, creating a landscape that was both beautiful, aromatic, and surprisingly delicious.`,
        
        `Upon arriving in this extraordinary realm, the inhabitants—who possessed an ethereal, luminescent quality—revealed a catastrophic problem that threatened their very existence. Their legendary rainbow, the source of all color, joy, and life force in their world, had mysteriously lost its vibrancy.`,
        
        `The royal council explained that without the rainbow's power, their kingdom would gradually fade into a colorless void, and all the magical creatures who depended on its energy would slowly lose their vitality and eventually disappear forever.${info.specialRequest ? ` However, ancient legends spoke of ${info.specialRequest} having the power to restore such magic.` : ''}`,
        
        `${info.name} recalled wise words about the transformative power of collaboration, determination, and unwavering friendship in the face of seemingly impossible challenges.${info.specialRequest ? ` They also remembered stories about how ${info.specialRequest} had helped heroes in the past.` : ''} These words now seemed prophetic and deeply meaningful.`,
        
        `Drawing upon every ounce of courage and wisdom they possessed, ${info.name} proposed a daring plan that would require the combined efforts of every citizen in the kingdom, along with the magical energy of the ${info.favoriteAnimal} and their own unique abilities.${info.specialRequest ? ` The plan also incorporated the mystical power of ${info.specialRequest} to make it even stronger.` : ''}`,
        
        `Through unwavering determination, creative problem-solving, and the combined strength of their extraordinary partnership, ${info.name} and the ${info.favoriteAnimal} channeled their collective energy into a spectacular ritual that lasted from dawn until dusk.${info.specialRequest ? ` The ${info.specialRequest} provided crucial magical energy throughout the entire process.` : ''}`,
        
        `As the sun reached its zenith, a magnificent explosion of ${info.favoriteColor} radiance burst forth from their joined hands, creating a brilliant beam of light that shot directly into the heart of the faded rainbow, instantly restoring its former splendor and even enhancing its beauty beyond its original glory.${info.specialRequest ? ` The ${info.specialRequest} glowed brightly, adding their own special magic to the restored rainbow.` : ''}`,
        
        `The eternally grateful citizens offered ${info.name} a prestigious leadership position, along with a magnificent castle and all the treasures of the kingdom. However, ${info.name} graciously declined, explaining their responsibility to return home and share these remarkable experiences.${info.specialRequest ? ` They promised to return someday with more ${info.specialRequest} to help protect the kingdom.` : ''}`,
        
        `During their homeward journey, soaring through clouds painted with colors they had helped restore, ${info.name} reflected deeply on the profound lessons learned about courage, empathy, leadership, and the extraordinary impact that one person's kindness and determination can have on an entire world.${info.specialRequest ? ` They also marveled at how ${info.specialRequest} had made their adventure even more magical.` : ''}`,
        
         `Upon returning home, ${info.name} spent hours sharing their transformative adventure, recounting the wisdom they had gained and the magical memories they would treasure forever.${info.specialRequest ? ` They especially loved telling about how ${info.specialRequest} had helped save the day.` : ''} They fell asleep knowing that true friendship and courage make even the most incredible adventures meaningful. The End.`
      ],
      
      // Expert: 18 complex pages (ages 13+, 9th-12th grade reading level - maximum complexity)
      expert: [
        `In an extraordinary convergence of circumstance and destiny, there existed a remarkably gifted individual named ${info.name}, whose ${info.age} years of life in ${info.grade} grade had been distinguished by an unprecedented mastery over chromatic transformation—specifically, the ability to metamorphose any substance into the most exquisite manifestation of ${info.favoriteColor} through conscious intention and focused willpower.`,
        
        `During a particularly transcendent morning while ${info.name} was immersed in the contemplative practice of ${info.hobbies}, the atmospheric tranquility was suddenly pierced by an ethereal entreaty that seemed to emanate from the very fabric of reality itself, suggesting the presence of a sentient being requiring immediate intervention.`,
        
        `Through methodical investigation employing both intuitive perception and systematic observation, ${info.name} discovered an extraordinary ${info.favoriteAnimal} whose corporeal form had become inexplicably entangled within the crystalline matrices of an ancient, luminescent arboreal specimen that pulsed with interdimensional energy signatures.`,
        
        `"I find myself in dire need of assistance from one whose spiritual resonance aligns with the fundamental forces of benevolence," articulated the ${info.favoriteAnimal} with remarkable eloquence, its communication transcending mere vocalization to encompass telepathic harmonics that conveyed profound urgency coupled with unwavering dignity.`,
        
        `Responding to this existential crisis with characteristic compassion and leveraging their supernatural command over ${info.favoriteColor} chromatic manipulation, ${info.name} initiated a complex liberation protocol that involved the systematic dissolution of quantum crystalline bonds through precise application of transformative energy.`,
        
        `The profoundly grateful ${info.favoriteAnimal}, recognizing the magnitude of ${info.name}'s altruistic intervention, extended a formal invitation to participate in an unprecedented expedition to a metaphysical realm that existed parallel to conventional reality, where the fundamental laws of physics operated according to radically different principles.`,
        
        `Their transdimensional journey commenced through a spiraling vortex of chromatic energy that transported them to a magnificent civilization where architectural achievements had been constructed entirely from crystallized variants of ${info.favoriteFood}, resulting in a landscape that stimulated multiple sensory modalities simultaneously.`,
        
        `Upon materialization in this extraordinary dimension, the indigenous population—characterized by their luminescent physiological properties and advanced telepathic capabilities—revealed the catastrophic deterioration of their primary chromatic energy source, a legendary rainbow that functioned as the fundamental life-support system for their entire ecosystem.`,
        
        `The governing council, comprised of the realm's most distinguished scholars and mystics, elucidated that the rainbow's deterioration threatened not merely aesthetic degradation but complete existential collapse, as all sentient beings within their dimension derived their essential life force from its chromatic emanations.${info.specialRequest ? ` However, ancient prophetic texts had foretold that ${info.specialRequest} possessed latent capabilities that could potentially restore such cosmic phenomena.` : ''}`,
        
        `Drawing upon accumulated wisdom regarding the exponential power multiplication achieved through collaborative endeavor, strategic planning, and unwavering commitment to humanitarian principles, ${info.name} recognized the profound significance of this moment.${info.specialRequest ? ` They also recalled esoteric knowledge suggesting that ${info.specialRequest} had historically served as catalysts for miraculous transformations.` : ''}`,
        
        `Through comprehensive analysis of the situation's complexities and consultation with the ${info.favoriteAnimal}'s extensive knowledge of interdimensional mechanics, ${info.name} formulated an ambitious restoration strategy that would require the synchronized participation of every conscious entity within the realm.${info.specialRequest ? ` The methodology incorporated sophisticated utilization of ${info.specialRequest}'s inherent metaphysical properties to amplify the restoration process exponentially.` : ''}`,
        
        `The implementation phase demanded extraordinary perseverance, innovative problem-solving methodologies, and the harmonious integration of diverse energy signatures as ${info.name} and the ${info.favoriteAnimal} channeled their combined consciousness into a transcendent ritual spanning multiple temporal cycles.${info.specialRequest ? ` Throughout this process, the ${info.specialRequest} served as a crucial conduit for maintaining stable energy flow and preventing dimensional collapse.` : ''}`,
        
        `At the precise moment of optimal cosmic alignment, a spectacular cascade of ${info.favoriteColor} radiance erupted from their unified consciousness, generating a beam of pure creative energy that penetrated the rainbow's deteriorated core and initiated a comprehensive regeneration sequence that exceeded all previous manifestations of its power.${info.specialRequest ? ` The ${info.specialRequest} resonated with harmonic frequencies that enhanced the restoration beyond theoretical limitations.` : ''}`,
        
        `In recognition of their unprecedented achievement, the grateful civilization offered ${info.name} permanent residence as Supreme Leader of their realm, along with access to infinite resources and the opportunity to study advanced metaphysical sciences unavailable in conventional reality.${info.specialRequest ? ` They promised to establish a permanent sanctuary for ${info.specialRequest} to ensure continued protection and study of their remarkable properties.` : ''}`,
        
        `During the contemplative return journey through shifting dimensional boundaries, ${info.name} engaged in profound philosophical reflection regarding the interconnected nature of existence, the exponential impact of individual moral choices, and the fundamental responsibility that accompanies the possession of extraordinary capabilities.${info.specialRequest ? ` They marveled at the unexpected ways in which ${info.specialRequest} had contributed to outcomes that transcended initial expectations.` : ''}`,
        
        `Upon reintegration with their original dimensional framework, ${info.name} dedicated considerable time to documenting and sharing the transformative insights gained through this extraordinary experience, recognizing their obligation to contribute to humanity's collective understanding of compassion, courage, and the unlimited potential for positive change.${info.specialRequest ? ` They particularly emphasized the crucial role that ${info.specialRequest} had played in demonstrating the power of seemingly ordinary elements to achieve extraordinary results.` : ''}`,
        
        `As ${info.name} concluded this remarkable chapter of their existence, they carried forward an enhanced awareness of their unique position within the cosmic order and their ongoing responsibility to utilize their gifts in service of universal well-being, knowing that this adventure represented merely the beginning of a lifetime dedicated to making meaningful contributions to the world. The End.`
      ]
    };
    
    return baseStoryTemplates[difficulty];
  };

  // Generate additional story content for time extensions
  const generateExtendedContent = (info: UserInfo, difficulty: DifficultyLevel, extensionNumber: number): string[] => {
    const extensionTemplates = {
      easy: [
        `The next day, ${info.name} went back.`,
        `The ${info.favoriteAnimal} was waiting!`,
        `They found a playground.`,
        `It was made of ${info.favoriteFood}!`,
        `${info.name} played on the swings.`,
        `Then they met more friends.`,
        `A nice dog came to play.`,
        `A funny bird sang songs.`,
        `They all played together.`,
        `${info.name} had so much fun!`,
        `Time to go home.`,
        `${info.name} waved goodbye.`
      ],
      medium: [
        `As ${info.name} settled back into their normal routine, they discovered that their magical adventure had given them new abilities. They could now sense when others needed help, just like the ${info.favoriteAnimal} had needed help.`,
        `One afternoon, ${info.name} noticed their neighbor looking sad and worried. Using their newfound wisdom and the lessons learned from their magical journey, they offered kindness and assistance.`,
        `The neighbor explained that their garden was dying and they didn't know why. ${info.name} remembered the power of ${info.favoriteColor} magic and gently touched the wilting plants.`,
        `Miraculously, the garden began to bloom with vibrant flowers in every color imaginable! The neighbor was amazed and grateful, and ${info.name} realized their adventure had taught them to help others.`,
        `That evening, ${info.name} looked up at the sky and saw a small rainbow forming. The ${info.favoriteAnimal} appeared beside them and smiled. "Your kindness is spreading magic everywhere," it said warmly.`
      ],
      hard: [
        `In the weeks following their extraordinary adventure, ${info.name} began to notice subtle changes in their ordinary world. The experience had awakened a deeper awareness of the interconnectedness of all living things and the responsibility that comes with great power.`,
        `During a particularly challenging day at school, ${info.name} encountered a situation that required the same courage and wisdom they had demonstrated in the magical kingdom. A new student was being treated unfairly by others.`,
        `Drawing upon the lessons learned about standing up for those who cannot stand up for themselves, ${info.name} intervened with compassion and determination, creating an atmosphere of inclusion and understanding.`,
        `The transformation in their school environment was remarkable. Other students began following ${info.name}'s example, creating a community built on mutual respect and kindness, much like the kingdom they had helped restore.`,
        `That night, as ${info.name} reflected on the day's events, they understood that the true magic wasn't in the fantastic realm they had visited, but in the ability to bring positive change to the world around them through consistent acts of courage and compassion.`,
        `The ${info.favoriteAnimal} appeared one more time in their dreams, offering a final piece of wisdom: "The greatest adventures are not in distant magical lands, but in the everyday moments where you choose to make a difference."`,
        `${info.name} awoke with a profound sense of purpose, knowing that their story was just beginning and that every day offered new opportunities to create magic through kindness, courage, and the unwavering belief that one person can indeed change the world.`,
        `Years later, ${info.name} would look back on that transformative experience as the moment they truly understood their place in the world and their responsibility to use their gifts in service of others, carrying forward the lessons of the magical kingdom into every aspect of their life.`
       ],
      expert: [
        `In the subsequent temporal period following their transcendental interdimensional experience, ${info.name} discovered that their consciousness had undergone fundamental alterations that manifested as enhanced perceptual capabilities, allowing them to detect subtle energetic disturbances in the fabric of conventional reality that indicated opportunities for humanitarian intervention.`,
        `During an academic period characterized by significant interpersonal challenges, ${info.name} encountered a complex social dynamic wherein established power structures were perpetuating systematic exclusion of a recently integrated student, presenting an opportunity to apply the advanced conflict resolution principles they had mastered during their metaphysical adventure.`,
        `Drawing upon the sophisticated understanding of systemic change methodology acquired through their interdimensional leadership experience, ${info.name} implemented a comprehensive intervention strategy that addressed both immediate symptomatic manifestations and underlying structural inequities contributing to the problematic social dynamic.`,
        `The cascading positive effects of their intervention created a transformative ripple effect throughout the educational environment, establishing new paradigms of inclusive communication and collaborative problem-solving that fundamentally altered the institutional culture in measurable and sustainable ways.`,
        `Through careful analysis of these outcomes, ${info.name} recognized that their extraordinary adventure had not merely been an isolated experience but rather a preparation phase for their ongoing mission to serve as a catalyst for positive transformation within their immediate sphere of influence and beyond.`,
        `The ${info.favoriteAnimal} manifested once more through enhanced sensory perception during a moment of deep contemplation, transmitting advanced wisdom regarding the exponential multiplication of positive impact through consistent application of enlightened principles in seemingly mundane circumstances.`,
        `${info.name} integrated this profound understanding into a comprehensive personal philosophy that recognized every interpersonal interaction as an opportunity to contribute to the collective elevation of human consciousness and the advancement of universal compassion.`,
        `Years later, as ${info.name} reflected upon the trajectory of their personal development and the expanding sphere of their positive influence, they understood that their magical adventure had been the initial activation of a lifelong commitment to utilizing their enhanced capabilities in service of humanity's highest potential.`
       ]
    };
    
    const templates = extensionTemplates[difficulty];
    const startIndex = (extensionNumber - 1) * getExtensionPageCount(difficulty);
    return templates.slice(startIndex, startIndex + getExtensionPageCount(difficulty)) || templates;
  };

  // Calculate pages to add per 10-minute extension based on difficulty
  const getExtensionPageCount = (difficulty: DifficultyLevel): number => {
    switch (difficulty) {
      case "easy": return 3; // ~3.5 min per page, so 3 pages for 10 min
      case "medium": return 5; // ~2 min per page, so 5 pages for 10 min  
      case "hard": return 8; // ~1.25 min per page, so 8 pages for 10 min
      case "expert": return 10; // ~1 min per page, so 10 pages for 10 min
      default: return 5;
    }
  };

  // Combine base story with any extensions
  const getCompleteStory = (): string[] => {
    const baseStory = generateStory(userInfo, currentDifficulty);
    let completeStory = [...baseStory];
    
    // Add extended content for each 10-minute extension
    for (let i = 1; i <= storyExtensions; i++) {
      const extensionContent = generateExtendedContent(userInfo, currentDifficulty, i);
      completeStory = [...completeStory, ...extensionContent];
    }
    
    return completeStory;
  };

  const storyParagraphs = getCompleteStory();
  const totalParagraphs = storyParagraphs.length;

  useEffect(() => {
    if (isReading && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsReading(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isReading, timeRemaining]);

  const handleNext = () => {
    if (currentParagraph < totalParagraphs - 1) {
      setCurrentParagraph(currentParagraph + 1);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
  };

  const handleStartReading = () => {
    setIsReading(true);
    if (timeRemaining === 0) {
      setTimeRemaining(10 * 60); // Reset to 10 minutes if timer reached 0
    }
  };

  const handleAddTime = () => {
    setTimeRemaining(prev => {
      const newTime = prev + (10 * 60); // Add 10 minutes
      return Math.min(newTime, 40 * 60); // Cap at 40 minutes maximum
    });
    if (timeRemaining < 40 * 60 - (10 * 60)) { // Only add story content if under the cap
      setStoryExtensions(prev => prev + 1);
    }
  };

  const handleDifficultyUp = () => {
    if (currentDifficulty === "easy") setCurrentDifficulty("medium");
    else if (currentDifficulty === "medium") setCurrentDifficulty("hard");
    else if (currentDifficulty === "hard") setCurrentDifficulty("expert");
    setCurrentParagraph(0); // Reset to beginning with new difficulty
    setStoryExtensions(0); // Reset extensions when difficulty changes
  };

  const handleDifficultyDown = () => {
    if (currentDifficulty === "expert") setCurrentDifficulty("hard");
    else if (currentDifficulty === "hard") setCurrentDifficulty("medium");
    else if (currentDifficulty === "medium") setCurrentDifficulty("easy");
    setCurrentParagraph(0); // Reset to beginning with new difficulty
    setStoryExtensions(0); // Reset extensions when difficulty changes
  };

  // Dynamic text size based on age and difficulty
  const getTextSize = () => {
    if (userInfo.age <= 7 && currentDifficulty === "easy") return "text-3xl leading-relaxed";
    if (userInfo.age <= 9 && currentDifficulty === "easy") return "text-2xl leading-relaxed";
    if (currentDifficulty === "easy") return "text-xl leading-relaxed";
    if (currentDifficulty === "medium") return "text-lg leading-relaxed";
    if (currentDifficulty === "hard") return "text-base leading-relaxed";
    return "text-sm leading-relaxed"; // expert level
  };

  const getDifficultyColor = () => {
    switch (currentDifficulty) {
      case "easy": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "hard": return "text-orange-600";
      case "expert": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getDifficultyLabel = () => {
    switch (currentDifficulty) {
      case "easy": return "Easy Reading";
      case "medium": return "Medium Reading";
      case "hard": return "Advanced Reading";
      case "expert": return "Expert Reading";
      default: return "Reading";
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((currentParagraph + 1) / totalParagraphs) * 100;


  // Smart illustration selection with automatic generation
  const getCurrentIllustration = async () => {
    const currentText = storyParagraphs[currentParagraph];
    const lowerText = currentText.toLowerCase();
    
    // Check if we have a cached generated image for this story text
    const cacheKey = currentText.substring(0, 100); // Use first 100 chars as cache key
    if (getCachedImage(cacheKey)) {
      return getCachedImage(cacheKey)!;
    }
    
    // Check if the story mentions the main character - use their avatar
    const characterMentions = [
      userInfo.name.toLowerCase(),
      userInfo.avatar.type,
      'main character',
      'protagonist',
      'hero'
    ];
    
    const mentionsCharacter = characterMentions.some(mention => 
      lowerText.includes(mention)
    );
    
    if (mentionsCharacter) {
      return getUserAvatar();
    }
    
    // Specific illustration mappings - exact keywords to exact illustrations
    const specificMappings = {
      'basketball': illustration26,
      'soccer': illustration25, 
      'football': illustration32,
      'baseball': illustration27,
      'swimming': illustration28,
      'tennis': illustration29,
      'dance': illustration30,
      'gymnastics': illustration31,
      'racing': illustration34,
      'cat': illustration1,
      'dog': illustration2, 
      'bird': illustration3,
      'dragon': illustration5,
      'unicorn': illustration9,
      'dinosaur': illustration10,
      'robot': illustration11,
      'space': illustration13,
      'astronaut': illustration13,
      'spaceship': illustration13,
      'art studio': illustration19,
      'painting': illustration19,
      'music': illustration17,
      'library': illustration16,
      'books': illustration16,
      'kitchen': illustration21,
      'cooking': illustration21,
      'mountain': illustration20,
      'castle': illustration36,
      'superhero': illustration35
    };
    
    // Check for exact keyword matches first
    for (const [keyword, illustration] of Object.entries(specificMappings)) {
      if (lowerText.includes(keyword)) {
        return illustration;
      }
    }
    
    // Category-based matching with weighted scoring
    const categories = {
      animals: ['cat', 'dog', 'bird', 'rabbit', 'bear', 'lion', 'elephant', 'tiger', 'horse', 'fish'],
      adventure: ['adventure', 'journey', 'explore', 'quest', 'travel', 'discover', 'mountain', 'forest', 'cave'],
      magic: ['magic', 'magical', 'wizard', 'fairy', 'spell', 'wand', 'potion', 'enchanted', 'crystal'],
      food: ['food', 'eat', 'hungry', 'delicious', 'cake', 'cookie', 'fruit', 'pizza', 'ice cream'],
      friendship: ['friend', 'friendship', 'together', 'help', 'kind', 'share', 'play', 'team'],
      science: ['science', 'experiment', 'laboratory', 'discovery', 'invention', 'research'],
      sports: ['sport', 'game', 'play', 'run', 'jump', 'race', 'win', 'team', 'exercise'],
      arts: ['art', 'draw', 'paint', 'create', 'music', 'dance', 'sing', 'beautiful']
    };
    
    const categoryScores = Object.entries(categories).map(([category, keywords]) => {
      const score = keywords.reduce((total, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        return total + matches;
      }, 0);
      return { category, score };
    }).sort((a, b) => b.score - a.score);
    
    const illustrationsByCategory = {
      animals: [illustration1, illustration2, illustration3, illustration4, illustration5],
      adventure: [illustration6, illustration7, illustration8, illustration9],
      magic: [illustration10, illustration11, illustration12, illustration13],
      food: [illustration14, illustration15, illustration16],
      friendship: [illustration17, illustration18, illustration19, illustration20],
      science: [illustration21, illustration22, illustration23],
      sports: [illustration24, illustration25, illustration26, illustration27],
      arts: [illustration28, illustration29, illustration30]
    };
    
    // If we have a strong category match, use those illustrations
    const topCategory = categoryScores[0];
    if (topCategory.score > 0) {
      const categoryIllustrations = illustrationsByCategory[topCategory.category as keyof typeof illustrationsByCategory] || [];
      if (categoryIllustrations.length > 0) {
        const progress = ((currentParagraph + 1) / totalParagraphs) * 100;
        const categoryIndex = Math.floor((progress / 100) * categoryIllustrations.length);
        const safeCategoryIndex = Math.min(categoryIndex, categoryIllustrations.length - 1);
        return categoryIllustrations[safeCategoryIndex];
      }
    }
    
    // Generate a custom image if no good match exists
    if (runwareService && !isGeneratingImage) {
      try {
        setIsGeneratingImage(true);
        
        // Create character-aware prompt that includes avatar characteristics
        let prompt = createChildFriendlyPrompt(currentText, userInfo);
        
        // If story mentions main character, enhance prompt with avatar details
        if (mentionsCharacter) {
          const avatarDescription = getAvatarDescription();
          prompt = prompt.replace('a happy child', avatarDescription);
          prompt = `${prompt}, featuring ${avatarDescription} as the main character`;
        }
        
        console.log("Auto-generating image with enhanced story-aware prompt:", prompt);
        
        const generatedImage = await runwareService.generateImage({
          positivePrompt: prompt,
          model: "runware:100@1",
          width: 768,
          height: 1024,
          numberResults: 1,
          outputFormat: "WEBP"
        });
        
        // Cache the generated image
        cacheImage(cacheKey, generatedImage.imageURL);
        setCurrentIllustration(generatedImage.imageURL);
        setIsGeneratingImage(false);
        return generatedImage.imageURL;
      } catch (error) {
        console.error("Error generating image:", error);
        setIsGeneratingImage(false);
      }
    }
    
    // Fallback to default illustrations
    const allIllustrations = [
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
    
    const progress = ((currentParagraph + 1) / totalParagraphs) * 100;
    const illustrationIndex = Math.floor((progress / 100) * allIllustrations.length);
    const safeIndex = Math.min(illustrationIndex, allIllustrations.length - 1);
    
    return allIllustrations[safeIndex];
  };

  // Generate automatic illustrations for every other story page
  useEffect(() => {
    const generatePageIllustration = async () => {
      const currentText = storyParagraphs[currentParagraph];
      if (!currentText) return;
      
      // Only generate images for every other page (0, 2, 4, 6, etc.)
      if (currentParagraph % 2 !== 0) {
        // For odd pages, use the previous page's illustration or fallback
        const prevPageKey = `page-${currentParagraph - 1}-${storyParagraphs[currentParagraph - 1]?.substring(0, 50)}`;
        if (getCachedImage(prevPageKey)) {
          setCurrentIllustration(getCachedImage(prevPageKey)!);
          return;
        }
        // Fallback to predefined illustrations for odd pages
        const allIllustrations = [
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
        const fallbackIndex = currentParagraph % allIllustrations.length;
        setCurrentIllustration(allIllustrations[fallbackIndex]);
        return;
      }
      
      const cacheKey = `page-${currentParagraph}-${currentText.substring(0, 50)}`;
      
      // Check if we already have this page cached
    if (getCachedImage(cacheKey)) {
      setCurrentIllustration(getCachedImage(cacheKey)!);
        return;
      }
      
      // Generate new illustration only for even pages
      try {
        setIsGeneratingImage(true);
        const prompt = createChildFriendlyPrompt(currentText, userInfo);
        console.log(`Generating illustration for page ${currentParagraph + 1}:`, prompt);
        
        const result = await runwareService.generateImage({
          positivePrompt: prompt,
          model: "runware:100@1",
          width: 768,
          height: 1024,
          numberResults: 1, // Explicitly set to 1 to avoid multiple images
          outputFormat: "WEBP"
        });
        
        if (result.imageURL) {
          cacheImage(cacheKey, result.imageURL);
          setCurrentIllustration(result.imageURL);
        }
      } catch (error) {
        console.error("Failed to generate illustration:", error);
        // Fallback to predefined illustrations
        const allIllustrations = [
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
        const fallbackIndex = currentParagraph % allIllustrations.length;
        setCurrentIllustration(allIllustrations[fallbackIndex]);
      } finally {
        setIsGeneratingImage(false);
      }
    };
    
    generatePageIllustration();
  }, [currentParagraph, storyParagraphs, userInfo, runwareService]);

  // Get current chapter based on story progress
  const getCurrentChapter = () => {
    if (progress <= 33) return 1;
    if (progress <= 66) return 2;
    return 3;
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ 
        backgroundImage: `url(${ancientBookBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Book pages overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-yellow-50/60 to-amber-100/70"></div>
      
      {/* Magical floating elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300/30 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-amber-300/40 rounded-full animate-bounce-gentle blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-300/30 rounded-full animate-float blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-yellow-400/35 rounded-full animate-bounce-gentle blur-xl"></div>
      </div>

      {/* Main content positioned as if on book pages */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header positioned at top of book */}
        <div className="flex items-center justify-between p-6 bg-amber-100/60 backdrop-blur-sm border-b border-amber-300/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-full shadow-soft">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {userInfo.name}'s Magical Adventure
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  A personalized story just for you!
                </p>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full bg-white/80 ${getDifficultyColor()}`}>
                  {getDifficultyLabel()}
                </span>
              </div>
            </div>
            {/* User's Avatar */}
            <div className="ml-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
                <img
                  src={getUserAvatar()}
                  alt={`${userInfo.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="playful" size="lg" onClick={onNewStory}>
              <RotateCcw className="w-5 h-5" />
              New Story
            </Button>
            <Button variant="ghost" size="lg" onClick={onHome}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Story content positioned on book pages */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl mx-auto">
            {/* Story Progress Indicator - floating above the page */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center gap-2 bg-amber-100/90 backdrop-blur-sm rounded-full px-8 py-4 border-2 border-amber-300/60 shadow-xl">
                <span className="text-lg font-medium text-amber-800">
                  Page {currentParagraph + 1} of {totalParagraphs}
                </span>
                <div className="w-40 h-3 bg-amber-200 rounded-full overflow-hidden ml-6">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Two-column responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 max-w-7xl mx-auto">
              {/* Illustration Column */}
              <div className="flex flex-col items-center space-y-6">
                {/* Chapter Indicator */}
                <div className="bg-amber-100/90 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-amber-400/60 shadow-lg">
                  <span className="text-lg font-bold text-amber-800">
                    Chapter {getCurrentChapter()} of 3
                  </span>
                </div>
                
                {/* Illuminated Manuscript Frame */}
                <div className="relative bg-amber-50/95 p-6 rounded-3xl border-4 border-amber-400/80 shadow-2xl backdrop-blur-sm">
                  {/* Ornate corner decorations */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-300"></div>
                  
                  {/* Medieval manuscript decorative elements */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-2 border-amber-500 rounded-tl-xl opacity-60"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-2 border-amber-500 rounded-tr-xl opacity-60"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-amber-500 rounded-bl-xl opacity-60"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-amber-500 rounded-br-xl opacity-60"></div>
                  
                  {/* The Illustration */}
                  <div className="relative overflow-hidden rounded-2xl border-3 border-amber-300">
                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-amber-100/80 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                          <p className="text-amber-800 font-medium">Creating custom illustration...</p>
                        </div>
                      </div>
                    )}
                    <img 
                      src={currentIllustration || illustration1} 
                      alt={`Chapter ${getCurrentChapter()} illustration`}
                      className="w-full h-auto max-w-md mx-auto shadow-lg transition-transform duration-300 hover:scale-105"
                      style={{ aspectRatio: '3/4' }}
                    />
                    {/* Magical overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-100/20 via-transparent to-amber-100/20 pointer-events-none"></div>
                  </div>
                  
                  {/* Decorative flourish below image */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Story Text Column */}
              <div className="flex flex-col justify-center">
                <div className="bg-yellow-50/95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border-3 border-amber-300/60 shadow-2xl relative">
                  {/* Ornate corner decorations */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-3 border-l-3 border-amber-500 rounded-tl-2xl opacity-70"></div>
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-3 border-r-3 border-amber-500 rounded-tr-2xl opacity-70"></div>
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-3 border-l-3 border-amber-500 rounded-bl-2xl opacity-70"></div>
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-3 border-r-3 border-amber-500 rounded-br-2xl opacity-70"></div>
                  
                  {/* Central ornamental flourish */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"></div>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className={`${getTextSize()} text-amber-900 font-medium leading-relaxed drop-shadow-sm animate-fade-in text-left lg:text-justify`} 
                       style={{ 
                         fontFamily: 'Comic Neue, cursive',
                         textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                         lineHeight: '1.8'
                       }}>
                      {processTextForPhonetics(storyParagraphs[currentParagraph], `${getTextSize()} text-amber-900 font-medium leading-relaxed drop-shadow-sm animate-fade-in text-left lg:text-justify`, currentDifficulty)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty controls - floating like magical runes */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDifficultyDown}
                disabled={currentDifficulty === "easy"}
                className="bg-amber-50/90 border-2 border-amber-400 text-amber-800 hover:bg-amber-100/90 shadow-lg backdrop-blur-sm px-6 py-3 animate-[wiggle_0.5s_ease-in-out_2s,_fade-in_0.8s_ease-out_1.5s] disabled:animate-none disabled:opacity-50"
                style={{
                  animationFillMode: 'both'
                }}
              >
                <TrendingDown className="w-5 h-5 mr-2" />
                Easier
              </Button>
              
              <div className="text-center bg-amber-100/90 backdrop-blur-sm rounded-2xl px-8 py-4 border-3 border-amber-400/70 shadow-xl animate-[scale-in_0.6s_ease-out_1s] opacity-0"
                style={{
                  animationFillMode: 'both'
                }}
              >
                <div className={`text-lg font-bold ${getDifficultyColor()}`}>
                  {getDifficultyLabel()}
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  {currentDifficulty === "easy" && "K-1st grade: Simple words & short sentences"}
                  {currentDifficulty === "medium" && "2nd-4th grade: Moderate vocabulary & sentences"}
                  {currentDifficulty === "hard" && "5th-8th grade: Advanced vocabulary & complex sentences"}
                  {currentDifficulty === "expert" && "9th-12th grade: Expert vocabulary & sophisticated writing"}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleDifficultyUp}
                disabled={currentDifficulty === "expert"}
                className="bg-amber-50/90 border-2 border-amber-400 text-amber-800 hover:bg-amber-100/90 shadow-lg backdrop-blur-sm px-6 py-3 animate-[wiggle_0.5s_ease-in-out_2.5s,_fade-in_0.8s_ease-out_1.5s] disabled:animate-none disabled:opacity-50"
                style={{
                  animationFillMode: 'both'
                }}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Harder
              </Button>
            </div>

            {/* Floating Page Navigation */}
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 flex gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrevious}
                disabled={currentParagraph === 0}
                className="w-16 h-16 rounded-full bg-amber-100/95 border-3 border-amber-400 text-amber-800 hover:bg-amber-200/95 backdrop-blur-sm shadow-2xl hover:scale-110 hover:animate-bounce transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                title="Previous Page"
              >
                ←
              </Button>
              
              <Button
                variant="default"
                size="lg"
                onClick={handleNext}
                disabled={currentParagraph === totalParagraphs - 1}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-2xl hover:scale-110 hover:animate-bounce transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                title={currentParagraph === totalParagraphs - 1 ? "Story Complete" : "Next Page"}
              >
                {currentParagraph === totalParagraphs - 1 ? "✨" : "→"}
              </Button>
            </div>
          </div>
        </div>

        {/* Story completion overlay - appears over the book */}
        {currentParagraph === totalParagraphs - 1 && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in">
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 border-4 border-amber-400 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden max-w-2xl mx-8 animate-scale-in">
              {/* Magical celebration sparkles */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-6 left-12 w-6 h-6 bg-yellow-400 rounded-full animate-bounce-gentle"></div>
                <div className="absolute top-16 right-16 w-4 h-4 bg-amber-400 rounded-full animate-float"></div>
                <div className="absolute bottom-12 left-16 w-8 h-8 bg-yellow-500 rounded-full animate-bounce-gentle"></div>
                <div className="absolute bottom-6 right-12 w-5 h-5 bg-amber-500 rounded-full animate-float"></div>
                <div className="absolute top-1/2 left-8 w-3 h-3 bg-yellow-300 rounded-full animate-bounce-gentle"></div>
                <div className="absolute top-1/3 right-8 w-4 h-4 bg-amber-300 rounded-full animate-float"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-5xl font-bold text-amber-800 mb-6 drop-shadow-sm animate-bounce-gentle">
                  🎉 Congratulations, {userInfo.name}! 🎉
                </h2>
                <p className="text-2xl text-amber-700 mb-4 font-semibold">
                  You've completed your magical adventure!
                </p>
                <p className="text-lg text-amber-600 mb-8">
                  Time used: {formatTime((10 * 60 + storyExtensions * 10 * 60) - timeRemaining)} • Come back tomorrow for a brand new story!
                </p>
                <div className="flex gap-6 justify-center">
                  <Button 
                    variant="default" 
                    size="xl" 
                    onClick={onNewStory}
                    className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 shadow-xl text-lg font-semibold hover:scale-105 transition-all duration-200"
                  >
                    Create Another Story
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="xl" 
                    onClick={onHome}
                    className="px-8 py-4 bg-amber-100 border-3 border-amber-400 text-amber-800 hover:bg-amber-200 text-lg font-semibold hover:scale-105 transition-all duration-200"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Floating Timer Component */}
        <FloatingTimer
          timeRemaining={timeRemaining}
          isReading={isReading}
          onToggleReading={() => setIsReading(!isReading)}
          onAddTime={handleAddTime}
        />
      </div>
    </div>
  );
};