import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
import { createOpenAITTSService } from "@/services/textToSpeechService";
import InclusiveStoryGenerator from "@/services/inclusiveStoryGenerator";
import CulturalAdaptationService from "@/services/culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryDisplayProps {
  userInfo: UserInfo;
  onHome: () => void;
  onNewStory: () => void;
  onSessionEnded: () => void;
}

const StoryDisplay = ({ userInfo, onHome, onNewStory, onSessionEnded }: StoryDisplayProps) => {
  const { t } = useTranslation();
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60 + 10);
  const [storyExtensions, setStoryExtensions] = useState(0);
  const [story, setStory] = useState<string[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    userInfo.difficultyLevel || (userInfo.age <= 6 ? "easy" : userInfo.age <= 9 ? "medium" : userInfo.age <= 12 ? "hard" : "expert")
  );
  const [hasShownDifficultyAlert, setHasShownDifficultyAlert] = useState(false);
  const [showTutorialBubble, setShowTutorialBubble] = useState(true);
  const [lastStoryVariant, setLastStoryVariant] = useState<number | null>(null);

  // Auto-dismiss tutorial bubble after 6 seconds (with 5 second delay)
  useEffect(() => {
    if (showTutorialBubble && currentParagraph === 0) {
      // Wait 5 seconds before starting the 6-second flash animation
      const delayTimer = setTimeout(() => {
        const flashTimer = setTimeout(() => {
          setShowTutorialBubble(false);
        }, 6000);
        
        return () => clearTimeout(flashTimer);
      }, 5000);
      
      return () => clearTimeout(delayTimer);
    }
  }, [showTutorialBubble, currentParagraph]);
  const [currentIllustration, setCurrentIllustration] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customIllustrations, setCustomIllustrations] = useState<Map<number, string>>(new Map());
  const [illustrationGenerationQueue, setIllustrationGenerationQueue] = useState<number[]>([]);
  const [runwareService] = useState<SecureRunwareService>(() => new SecureRunwareService("LRRGqlrg67zH8uss6lMjVvc54pVOrznM"));
  const [openAIService] = useState<any>(() => createOpenAITTSService());

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
    // Use the new inclusive story generator for culturally adapted extensions
    return InclusiveStoryGenerator.generateCulturallyAdaptedStory(
      info, 
      difficulty, 
      true, // isExtension = true
      extensionNumber
    );
  };

  const generateInitialStory = (info: UserInfo, difficulty: DifficultyLevel): string[] => {
    // Use the new inclusive story generator for culturally adapted initial stories
    return InclusiveStoryGenerator.generateCulturallyAdaptedStory(
      info, 
      difficulty, 
      false // isExtension = false
    );
  };
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
        words: 110, 
        vocabulary: "advanced vocabulary with complex terminology for mature readers",
        structure: "sophisticated sentence structures with varied complexity"
      },
      expert: { 
        sentences: 6, 
        words: 150, 
        vocabulary: "sophisticated academic vocabulary with advanced terminology",
        structure: "complex, multi-layered sentences with advanced literary techniques"
      }
    };

    const settings = difficultySettings[difficulty];
    
    // Create different story variants to ensure no consecutive duplicates
    const createStoryByDifficulty = () => {
      if (difficulty === "easy") {
        // Multiple story variants - Dr. Seuss / Margaret Wise Brown / Eric Carle style
        const storyVariants = [
          [
            `${info.name} wakes up in the morning bright. The sun is shining. What a sight!`,
            `"What shall I do?" asks ${info.name} with glee. "I think I'll try some ${info.hobbies}!"`,
            `Out the door and down the street. Dancing, dancing with happy feet!`,
            `Hello, birds! Hello, trees! Hello, flowers! Hello, bees!`,
            `${info.name} loves to play all day. ${info.hobbies} makes everything okay!`,
            `Friends come over to play along. Together they sing a happy song.`,
            `Hop and skip and jump so high! Look at all the clouds in the sky!`,
            `When the day is nearly done, ${info.name} says, "That was so much fun!"`,
            `Stars come out to say goodnight. ${info.name} sleeps tight until morning light.`,
            `Tomorrow brings another day for ${info.name} to play and play!`
          ],
          [
            `Hooray! Hooray! It's a beautiful day! ${info.name} wants to go out and play!`,
            `"${info.hobbies} sounds like fun," says ${info.name}. "Let's play until the day is done!"`,
            `Skip and hop and jump around. Happy sounds are everywhere found!`,
            `Red and blue and green and yellow! ${info.name} is one happy fellow!`,
            `Wiggle, giggle, laugh and cheer! Fun and joy are always near!`,
            `Animals come to play today. They love ${info.hobbies} in every way!`,
            `Round and round and up and down. ${info.name} is the happiest ${info.avatar.type} in town!`,
            `Time to rest, time to play. What a perfectly wonderful day!`,
            `Moon and stars shine bright above. ${info.name} goes to sleep with so much love.`,
            `Sweet dreams tonight, wake up bright! Tomorrow will be another delight!`
          ],
          [
            `${info.name} opens eyes so wide. It's time to play outside!`,
            `"I love ${info.hobbies} most of all! Come on, let's have a ball!"`,
            `Bouncy, bouncy, here and there! Fun is floating in the air!`,
            `Look! A butterfly so blue! "Hello there! How do you do?"`,
            `${info.name} and friends all play. Laughing, smiling all the day!`,
            `Twirl and swirl and spin around. The best fun ever can be found!`,
            `Pat-a-cake and peek-a-boo! There's so much fun for me and you!`,
            `When the sun begins to set, this was the best day yet!`,
            `Sleepy time is drawing near. Sweet dreams, my little dear.`,
            `Close your eyes and drift away. Dream of fun and play!`
          ]
        ];
        
        // Select a variant different from the last one
        let selectedVariant = Math.floor(Math.random() * storyVariants.length);
        if (lastStoryVariant !== null && storyVariants.length > 1) {
          while (selectedVariant === lastStoryVariant) {
            selectedVariant = Math.floor(Math.random() * storyVariants.length);
          }
        }
        setLastStoryVariant(selectedVariant);
        return storyVariants[selectedVariant];
        
      } else if (difficulty === "medium") {
        // Multiple story variants - Magic Tree House / Beverly Cleary / Roald Dahl style
        const storyVariants = [
          [
            `${info.name} was the kind of ${info.avatar.type} who believed in magic, especially when it came to ${info.hobbies}. Today felt different somehow.`,
            `While practicing ${info.hobbies} in the garden, ${info.name} noticed something peculiar. A tiny door had appeared at the base of the old oak tree!`,
            `"This wasn't here yesterday," ${info.name} whispered, kneeling down to examine the miniature entrance. It was painted bright purple with a golden doorknob.`,
            `Suddenly, the door swung open! Out popped a mouse wearing a red velvet jacket and tiny spectacles. "Finally!" squeaked the mouse. "I've been waiting ages for you!"`,
            `"Me?" asked ${info.name} in amazement. The mouse nodded importantly. "You're exactly the person we need to help solve the Great Acorn Mystery!"`,
            `Without hesitation, ${info.name} shrunk down to mouse size (magic is funny that way) and followed their new friend through a tunnel lined with glowing mushrooms.`,
            `They emerged in a bustling underground city where animals of all kinds lived in harmony. But something was terribly wrong—all the acorns had vanished!`,
            `Using their special knowledge of ${info.hobbies}, ${info.name} helped the animals search high and low. They discovered the acorns had been borrowed by young squirrels for a surprise party!`,
            `The whole city celebrated with the biggest feast anyone had ever seen. ${info.name} was made an honorary citizen and given a magical compass that would always point toward new adventures.`,
            `When it was time to return home, ${info.name} felt their heart full of joy. They knew that whenever they needed magic, they just had to believe—and practice ${info.hobbies}!`
          ],
          [
            `${info.name} had always wondered what it would be like to fly like a bird. While practicing ${info.hobbies} on the roof, something magical happened.`,
            `A gentle breeze swirled around ${info.name}, lifting them higher and higher until they were soaring above the clouds with a flock of friendly rainbow parrots.`,
            `"Welcome to the Sky Kingdom!" chirped the lead parrot, whose feathers sparkled like jewels. "We've been watching you practice ${info.hobbies} and we're very impressed!"`,
            `The parrots led ${info.name} to a floating castle made entirely of clouds and stardust, where the Sky King was waiting with a worried expression.`,
            `"Our magical Sky Crystal has lost its power," the King explained. "Without it, all the colors will drain from the world below. We need someone special to help us."`,
            `${info.name} discovered that their love for ${info.hobbies} was exactly what the crystal needed to recharge. As they shared their passion, the crystal began to glow brighter and brighter.`,
            `The colors returned to the world in a spectacular display of rainbows and shooting stars. The Sky King was so grateful that he granted ${info.name} the power to visit the Sky Kingdom whenever they wished.`,
            `As the parrots gently carried ${info.name} back home, they whispered the secret of the Sky Kingdom: "Believe in yourself, and magic will always find you."`,
            `Back on solid ground, ${info.name} looked up at the sky with new eyes, knowing that adventure was always just a cloud away.`,
            `From that day forward, whenever ${info.name} practiced ${info.hobbies}, they could feel the wind calling them back to their friends in the Sky Kingdom.`
          ],
          [
            `${info.name} found a mysterious old map while cleaning the attic, and it seemed to show a secret path through their own neighborhood.`,
            `Following the map's curious symbols and riddles, ${info.name} discovered that their ordinary town was filled with extraordinary secrets and hidden treasures.`,
            `The first clue led to the library, where ${info.name} met a talking cat named Whiskers who claimed to be the Guardian of Lost Stories.`,
            `"Every story that's ever been forgotten ends up here," Whiskers explained, leading ${info.name} through a hidden door behind the poetry section.`,
            `Inside was a vast underground library where characters from unfinished books lived, waiting for someone to help complete their adventures.`,
            `${info.name} used their creativity and knowledge of ${info.hobbies} to help solve the characters' problems and finish their interrupted stories.`,
            `Each completed story created a burst of golden light that made the underground library even more beautiful and filled it with the sound of grateful laughter.`,
            `As a reward for their kindness and creativity, the story characters gave ${info.name} a magical pen that could bring any story to life.`,
            `Whiskers walked ${info.name} back to the regular library and winked. "Remember, every ordinary place can become extraordinary if you know how to look for the magic."`,
            `${info.name} left the library with their magical pen, excited to create new stories and knowing that adventure could be found anywhere, even in the most unexpected places.`
          ]
        ];
        
        // Select a variant different from the last one
        let selectedVariant = Math.floor(Math.random() * storyVariants.length);
        if (lastStoryVariant !== null && storyVariants.length > 1) {
          while (selectedVariant === lastStoryVariant) {
            selectedVariant = Math.floor(Math.random() * storyVariants.length);
          }
        }
        setLastStoryVariant(selectedVariant);
        return storyVariants[selectedVariant];
        
      } else if (difficulty === "hard") {
        // Multiple story variants - Harry Potter / Holes / Bridge to Terabithia style
        const storyVariants = [
          [
            `${info.name} had always felt like an outsider at school, finding solace only in ${info.hobbies} and the quiet corners of the library where nobody bothered to look for them.`,
            `Everything changed the day Mrs. Chen, the new art teacher, pulled ${info.name} aside after class. "I've been watching you," she said quietly. "You have a gift that needs nurturing."`,
            `She handed ${info.name} an old, leather-bound journal. "This belonged to my grandmother. She was like you—someone who saw the world differently, more deeply than others."`,
            `That night, ${info.name} opened the journal and discovered it was filled with sketches, poems, and stories about young people who had changed the world through their unique talents and passion for their interests.`,
            `The journal seemed to come alive under ${info.name}'s touch. Pages fluttered on their own, revealing a hidden message: "The Society of Young Dreamers seeks a new member."`,
            `Following cryptic clues hidden throughout their town, ${info.name} uncovered a secret network of young people who used their talents—like ${info.hobbies}—to solve real problems in their community.`,
            `Their first mission involved helping an elderly man who had lost all his family photographs in a fire. Using creativity and determination, ${info.name} helped recreate precious memories through art and storytelling.`,
            `As ${info.name} grew more confident in their abilities, they realized that being different wasn't something to hide from—it was their greatest strength and the key to making a real difference.`,
            `The Society's leader, a wise teenager named Alex, told ${info.name}, "Every person who changes the world starts exactly where you are now—feeling different, but choosing to embrace it."`,
            `With newfound purpose and a community of like-minded friends, ${info.name} understood that their love for ${info.hobbies} wasn't just a hobby—it was a pathway to helping others and making the world a better place.`
          ],
          [
            `${info.name} never expected that inheriting their great-aunt's old house would lead to the discovery of a time machine hidden in the basement.`,
            `The machine was covered in dust and cobwebs, with a note attached: "For ${info.name}, when you're ready to understand that every generation faces the same challenges, just in different ways."`,
            `Curious and a bit nervous, ${info.name} activated the machine and found themselves transported to their great-aunt's childhood during a time when young people weren't allowed to pursue interests like ${info.hobbies}.`,
            `They met their great-aunt as a young girl, also passionate about creative pursuits but forced to hide her talents from a society that didn't value them.`,
            `Working together across time, ${info.name} and young Aunt Marie organized a secret group of creative kids who used their combined talents to solve problems in their community and prove their worth.`,
            `Through their adventures in the past, ${info.name} learned that every generation of young people has had to fight for the right to be different, to be creative, and to follow their dreams.`,
            `When the time machine brought ${info.name} back to the present, they discovered that their actions in the past had created a ripple effect that made their own world more accepting of creativity and individuality.`,
            `The experience taught ${info.name} that their struggles weren't unique, but part of a long tradition of young people who had the courage to be themselves and make a difference.`,
            `Aunt Marie's final note, which appeared after the time travel, read: "Every young person who refuses to give up their dreams helps create a better world for the next generation."`,
            `${info.name} decided to continue their great-aunt's legacy, using their passion for ${info.hobbies} to inspire other young people to embrace their uniqueness and work together to build a more creative world.`
          ]
        ];
        
        // Select a variant different from the last one
        let selectedVariant = Math.floor(Math.random() * storyVariants.length);
        if (lastStoryVariant !== null && storyVariants.length > 1) {
          while (selectedVariant === lastStoryVariant) {
            selectedVariant = Math.floor(Math.random() * storyVariants.length);
          }
        }
        setLastStoryVariant(selectedVariant);
        return storyVariants[selectedVariant];
        
      } else { // expert
        // Multiple story variants - The Hunger Games / The Giver / sophisticated YA style
        const storyVariants = [
          [
            `In a world where creativity was measured and rationed, ${info.name} had learned to hide their passion for ${info.hobbies} behind a mask of calculated conformity.`,
            `The Society of Productive Citizens had ruled for fifty years, determining that only "useful" skills deserved development. Art, music, and creative expression were considered dangerous distractions from economic progress.`,
            `${info.name}'s secret practice sessions took place in an abandoned subway tunnel, where they had discovered remnants of the old world—books, paintings, and instruments left behind by those who had dared to dream.`,
            `On the morning of their sixteenth birthday, ${info.name} received two letters: one assigned them to a factory job, the other bore only an address and the words "The Underground Academy of Lost Arts."`,
            `The choice was impossible yet clear. Reporting to the factory meant safety but a life of spiritual emptiness. Following the mysterious letter meant risking everything for the chance to truly live.`,
            `At the Underground Academy, ${info.name} met other young people who had chosen freedom over security. They learned that creativity wasn't just personal expression—it was the foundation of human progress and dignity.`,
            `Their teacher, a former government official who had abandoned power to protect young artists, explained: "Every totalitarian regime in history has first attacked the artists. Do you know why?"`,
            `Through intensive study and practice of ${info.hobbies}, ${info.name} began to understand that art and creativity were forms of resistance, ways of preserving human truth in an increasingly mechanized world.`,
            `When the government discovered the Academy, ${info.name} faced the ultimate test: lead a peaceful revolution to restore creative freedom, knowing that failure meant not just personal destruction but the loss of hope for future generations.`,
            `Standing before the Council of Productive Citizens, ${info.name} spoke with the power of truth: "You fear our ${info.hobbies} because they remind people what it means to be human. But humanity cannot be destroyed—only temporarily forgotten."`,
            `The revolution that followed wasn't won with violence, but with beauty—thousands of young people sharing their hidden art, music, and stories, proving that the human spirit cannot be suppressed when it chooses to rise together.`
          ],
          [
            `${info.name} lived in the last free city on Earth, surrounded by a vast wasteland where creativity had been systematically eliminated by machines that valued only efficiency and uniformity.`,
            `As the youngest member of the city's Council of Guardians, ${info.name} was chosen to venture into the wasteland to discover why children from their city were beginning to lose their ability to imagine and create.`,
            `Armed only with their knowledge of ${info.hobbies} and an ancient device called a Memory Keeper, ${info.name} set out across the desolate landscape, following signals from other survivors.`,
            `They discovered hidden communities of artists, musicians, and dreamers who had been living underground for generations, preserving human creativity while the world above forgot what it meant to be truly alive.`,
            `The underground dwellers revealed that the machines were powered by harvested human imagination, and that ${info.name}'s city was slowly being drained of its creative energy through a network of invisible sensors.`,
            `Working with the underground resistance, ${info.name} learned to use their passion for ${info.hobbies} as a weapon against the machines, discovering that genuine creativity could overload and disable the oppressive technology.`,
            `The final battle wasn't fought with conventional weapons, but with a massive coordinated expression of human creativity—millions of people across the globe simultaneously creating art, music, stories, and beauty.`,
            `As the machines fell silent, defeated by the very thing they had tried to eliminate, ${info.name} watched as color and imagination began to return to the world like sunrise after an endless night.`,
            `The Memory Keeper revealed its final secret: it had been recording every act of creativity throughout the dark ages, and now those memories flowed back into the world, restoring what had been lost.`,
            `${info.name} returned home not as a guardian of the last free city, but as a leader of the first truly free world, where every person was encouraged to explore their creativity and contribute to the ongoing human story.`
          ]
        ];
        
        // Select a variant different from the last one
        let selectedVariant = Math.floor(Math.random() * storyVariants.length);
        if (lastStoryVariant !== null && storyVariants.length > 1) {
          while (selectedVariant === lastStoryVariant) {
            selectedVariant = Math.floor(Math.random() * storyVariants.length);
          }
        }
        setLastStoryVariant(selectedVariant);
        return storyVariants[selectedVariant];
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

  // Regenerate story text when difficulty changes, but preserve images and page count
  useEffect(() => {
    if (story.length > 0) {
      // Add 1-2 second delay before updating story text for difficulty changes
      const difficultyChangeTimer = setTimeout(() => {
        const currentPageCount = story.length;
        const baseStory = generateInitialStory(userInfo, currentDifficulty);
        
        // If user has added pages beyond the base 10, preserve those pages by regenerating extensions
        if (currentPageCount > baseStory.length) {
          const additionalPagesNeeded = currentPageCount - baseStory.length;
          const extensionsNeeded = Math.ceil(additionalPagesNeeded / 5); // Extensions add 5 pages each
          
          let updatedStory = [...baseStory];
          for (let i = 0; i < extensionsNeeded; i++) {
            const extensionPages = generateStoryExtension(userInfo, currentDifficulty, i);
            updatedStory = [...updatedStory, ...extensionPages];
          }
          
          // Trim to exact page count if needed
          updatedStory = updatedStory.slice(0, currentPageCount);
          setStory(updatedStory);
        } else {
          // User hasn't added extra pages, just update with base story
          setStory(baseStory);
        }
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
    const MAX_SESSION_TIME = 30 * 60; // 30 minutes in seconds
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
                  {t("storyDisplay.header.tagline")}
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
                <span className="hidden sm:inline">{t("storyDisplay.header.home")}</span>
              </Button>
              
              <Button
                onClick={onNewStory}
                size="sm"
                className="font-comic hover:scale-105 transition-transform bg-gradient-primary hover:shadow-glow text-xs sm:text-sm px-2 sm:px-4"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("storyDisplay.header.newStory")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Story Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-32 sm:pb-40 lg:pb-32">
        {/* Story Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-semibold text-foreground text-sm sm:text-base">
                {t("storyDisplay.progress.page")} {currentParagraph + 1} {t("storyDisplay.progress.of")} {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">{t("storyDisplay.progress.progress")}</span>
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
                              {t("storyDisplay.illustration.creating")}
                            </p>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2 sm:mb-4" />
                            <p className="text-muted-foreground font-comic text-sm sm:text-base">
                              {t("storyDisplay.illustration.loading")}
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
                      {t(`storyDisplay.difficulty.${currentDifficulty}`)} {t("storyDisplay.difficulty.level")}
                    </span>
                  </div>
                  
                  {/* Difficulty Controls */}
                  <div className="relative flex items-center gap-1 sm:gap-2">
                    {/* Tutorial Bubble */}
                    {showTutorialBubble && currentParagraph === 0 && (
                      <div className="absolute -top-16 -left-32 sm:-top-20 sm:-left-40 lg:-left-48 z-50 animate-fade-in">
                        <div className="relative bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-5 rounded-2xl shadow-lg w-56 sm:w-72 animate-[pulse_2s_infinite]">
                          <div className="text-sm sm:text-base font-semibold">
                            {t("storyDisplay.difficulty.tutorialTitle")}
                          </div>
                          <div className="text-xs sm:text-sm mt-1 opacity-90">
                            {t("storyDisplay.difficulty.tutorialText")}
                          </div>
                          {/* Arrow pointing directly to buttons */}
                          <div className="absolute -bottom-2 right-12 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary"></div>
                          {/* Close button */}
                          <button
                            onClick={() => setShowTutorialBubble(false)}
                            className="absolute -top-2 -right-2 bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDifficultyDown}
                          size="sm"
                          variant="outline"
                          className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 hover:scale-110 transition-transform ${
                            showTutorialBubble && currentParagraph === 0
                              ? 'animate-[pulse_1.5s_infinite] ring-2 ring-primary/50' 
                              : ''
                          }`}
                          disabled={currentDifficulty === "easy"}
                        >
                          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{t("storyDisplay.difficulty.easier")}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDifficultyUp}
                          size="sm"
                          variant="outline"
                          className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 hover:scale-110 transition-transform ${
                            showTutorialBubble && currentParagraph === 0
                              ? 'animate-[pulse_1.5s_infinite] ring-2 ring-primary/50' 
                              : ''
                          }`}
                          disabled={currentDifficulty === "expert"}
                        >
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{t("storyDisplay.difficulty.harder")}</p>
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
                      {processTextForPhonetics(currentStory, "", currentDifficulty, userInfo)}
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
                    <span className="hidden sm:inline">← {t("storyDisplay.navigation.previous")}</span>
                    <span className="sm:hidden">{t("storyDisplay.navigation.previousShort")}</span>
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={currentParagraph >= totalPages - 1}
                    className="bg-gradient-primary hover:shadow-glow font-comic rounded-xl sm:rounded-2xl px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">{t("storyDisplay.navigation.next")} →</span>
                    <span className="sm:hidden">{t("storyDisplay.navigation.nextShort")}</span>
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
        currentParagraph={currentParagraph}
        onSessionEnded={onSessionEnded}
      />
    </div>
    </TooltipProvider>
  );
};

export default StoryDisplay;
