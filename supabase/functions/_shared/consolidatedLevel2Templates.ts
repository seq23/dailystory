// Consolidated Level 2 Templates - Ages 7-8, 2nd-3rd grade reading level
// Word count: 40-70 words per scene, 8 scenes per template
// Combines existing base templates with extension templates converted to StoryTemplate format

export interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
  };
}

export interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: {
    text: string;
    alternatives: string[];
    optionalDetails: string[];
  };
}

export interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

export const CONSOLIDATED_LEVEL_2_TEMPLATES: StoryTemplate[] = [
  // Template 1: Treasure Map Adventure (from extensions)
  {
    title: "The Mysterious Treasure Map",
    theme: "Adventure & Discovery",
    level: "Level 2",
    scenes: [
      {
        text: "One day, {userName} was thinking about adventure, and that's when the old treasure map appeared in Grandpa's desk drawer.",
        pause: true,
        hook: "What secrets does the treasure map hold?",
        microVariants: {
          text: "One day, {userName} was thinking about adventure, and that's when the old treasure map appeared in Grandpa's desk drawer.",
          alternatives: ["While searching for adventure stories, {userName} discovered an ancient treasure map hidden in Grandpa's old wooden desk."],
          optionalDetails: ["The map was yellowed with age and had mysterious symbols.", "Grandpa's desk smelled like old books and adventures.", "The drawer creaked when {userName} opened it slowly."]
        }
      },
      {
        text: "So {userName} followed the path through the neighborhood park with careful attention to every detail marked on the weathered paper.",
        pause: false,
        hook: "",
        microVariants: {
          text: "So {userName} followed the path through the neighborhood park with careful attention to every detail marked on the weathered paper.",
          alternatives: ["{userName} carefully studied each marking on the old map while walking through the familiar neighborhood park paths."],
          optionalDetails: ["The map showed trees, rocks, and hidden pathways.", "Other children were playing nearby but didn't notice the treasure hunt.", "The afternoon sun made perfect shadows that matched the map."]
        }
      },
      {
        text: "Naturally, the clues led to a hidden cave behind the waterfall filled with beautiful {favoriteColor} crystals that sparkled like magic gems.",
        pause: true,
        hook: "What treasure lies deeper in the cave?",
        microVariants: {
          text: "Naturally, the clues led to a hidden cave behind the waterfall filled with beautiful {favoriteColor} crystals that sparkled like magic gems.",
          alternatives: ["Following the map perfectly, {userName} discovered a secret cave behind rushing water, where {favoriteColor} crystals gleamed like precious jewels."],
          optionalDetails: ["The waterfall created a misty rainbow in the sunlight.", "The crystals were smooth and cool to touch.", "The cave felt ancient and mysterious."]
        }
      },
      {
        text: "Before long, sharing the treasure with friends became the most exciting part of the entire adventure and discovery.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Before long, sharing the treasure with friends became the most exciting part of the entire adventure and discovery.",
          alternatives: ["Soon {userName} realized that the joy of sharing this amazing discovery with friends was better than keeping the treasure alone."],
          optionalDetails: ["Friends gasped with wonder at the beautiful crystals.", "Everyone wanted to help explore the cave safely.", "The treasure felt more special when shared with others."]
        }
      },
      {
        text: "The friends worked together to carefully document their amazing find with drawings and notes about the magical crystal cave.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The friends worked together to carefully document their amazing find with drawings and notes about the magical crystal cave.",
          alternatives: ["Working as a team, the friends created detailed records of their discovery through careful drawings and written observations."],
          optionalDetails: ["They used {favoriteColor} pencils to draw the crystals.", "Each friend wrote something different about the cave.", "They made a special treasure book together."]
        }
      },
      {
        text: "They decided to keep the cave location secret while creating a special club for young explorers and treasure hunters.",
        pause: true,
        hook: "What adventures will the explorer club have?",
        microVariants: {
          text: "They decided to keep the cave location secret while creating a special club for young explorers and treasure hunters.",
          alternatives: ["The friends agreed to protect their secret cave while starting an exclusive club dedicated to exploration and adventure."],
          optionalDetails: ["They designed club badges with {favoriteColor} crystals.", "Each member got a special explorer handbook.", "They planned weekly adventure meetings."]
        }
      },
      {
        text: "Every weekend, the explorer club met to plan new adventures and share {favoriteFood} while telling stories about their discoveries.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Every weekend, the explorer club met to plan new adventures and share {favoriteFood} while telling stories about their discoveries.",
          alternatives: ["Each weekend brought exciting club meetings where friends enjoyed {favoriteFood} and shared tales of their exploration adventures."],
          optionalDetails: ["The meetings were held in {userName}'s backyard treehouse.", "They kept a journal of all their adventures.", "New members had to find three interesting rocks to join."]
        }
      },
      {
        text: "And wouldn't you know it - that treasure hunt created the best friendship memories that would last forever in their hearts.",
        pause: true,
        hook: "What mystery will they solve next?",
        microVariants: {
          text: "And wouldn't you know it - that treasure hunt created the best friendship memories that would last forever in their hearts.",
          alternatives: ["The treasure hunting adventure had given them precious memories and friendships that would remain special throughout their entire lives."],
          optionalDetails: ["They promised to be friends forever.", "The crystal cave became their special secret place.", "Every adventure brought them closer together as friends."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Years later, {userName} and their friends still visit the secret crystal cave during quiet afternoons. They sit surrounded by the beautiful {favoriteColor} crystals, sharing {favoriteFood} and remembering their first great adventure together. The cave remains their special place of friendship and wonder.",
        microVariants: ["Years later, the friends still cherish quiet afternoons in their secret crystal cave, sharing {favoriteFood} and remembering their precious first adventure."]
      },
      {
        type: 'silly',
        text: "The crystal cave becomes so popular with friendly animals that {userName} and friends have to make tiny explorer badges for squirrels, rabbits, and even a curious {favoriteAnimal} who keeps trying to join their club meetings! What a wonderfully silly situation!",
        microVariants: ["The cave attracts so many friendly animals that the friends create tiny explorer badges for squirrels, rabbits, and a persistent {favoriteAnimal} who wants to join!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s explorer club becomes famous throughout the school and community. They lead nature walks, teach other children about geology, and help create a new science program focused on local exploration and discovery.",
        microVariants: ["{userName}'s explorer club gains school-wide fame, leading nature walks and helping establish a new local exploration science program."]
      },
      {
        type: 'reflective',
        text: "{userName} realizes that the greatest treasures aren't crystals or maps, but the friendships formed through shared adventures. True treasure lies in the bonds we create when we explore the world together with people we care about.",
        microVariants: ["{userName} discovers that friendship and shared adventures are life's greatest treasures, more valuable than any crystals or hidden riches."]
      }
    ],
    reuse: {
      swappableElements: {
        "treasure_items": ["crystals", "coins", "jewels", "artifacts", "fossils"],
        "exploration_tools": ["maps", "compasses", "magnifying glasses", "notebooks", "flashlights"],
        "adventure_locations": ["caves", "forests", "mountains", "islands", "ruins"]
      },
      weatherVariants: ["sunny exploration day", "perfect adventure weather", "misty morning discovery", "golden afternoon hunt"],
      settingVariants: ["neighborhood park", "forest trail", "rocky hillside", "hidden valley"]
    }
  },

  // Template 2: Science Fair Project (from extensions)
  {
    title: "The Amazing Science Discovery",
    theme: "Learning & Scientific Discovery",
    level: "Level 2",
    scenes: [
      {
        text: "It all started when {userName} wondered how {favoriteAnimal} behave in different conditions and decided to create a real science experiment.",
        pause: true,
        hook: "What will the experiment discover?",
        microVariants: {
          text: "It all started when {userName} wondered how {favoriteAnimal} behave in different conditions and decided to create a real science experiment.",
          alternatives: ["The science project began when {userName} became curious about {favoriteAnimal} behavior and wanted to conduct a proper research study."],
          optionalDetails: ["The science fair was coming up in two months.", "{userName} had always loved watching {favoriteAnimal} in the backyard.", "Mom helped set up a special observation area."]
        }
      },
      {
        text: "Day by day, measuring and recording data became a daily routine that taught {userName} the importance of careful scientific observation.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Day by day, measuring and recording data became a daily routine that taught {userName} the importance of careful scientific observation.",
          alternatives: ["Each day brought new measurements and observations as {userName} learned the value of consistent, methodical scientific recording."],
          optionalDetails: ["The data sheets were organized with {favoriteColor} folders.", "Every morning before school, {userName} checked the experiment.", "Graphs and charts covered the bedroom wall."]
        }
      },
      {
        text: "Little by little, the experiment showed that {favoriteFood} affects animal behavior in surprising and interesting ways that nobody expected.",
        pause: true,
        hook: "What surprising discoveries will emerge?",
        microVariants: {
          text: "Little by little, the experiment showed that {favoriteFood} affects animal behavior in surprising and interesting ways that nobody expected.",
          alternatives: ["Gradually, the research revealed unexpected connections between {favoriteFood} and {favoriteAnimal} behavior patterns that surprised everyone."],
          optionalDetails: ["The {favoriteAnimal} acted differently on certain days.", "Some foods made them more playful and energetic.", "Other foods made them calmer and more focused."]
        }
      },
      {
        text: "Step by step, the project developed into something truly special as {userName} discovered patterns that even scientists might find fascinating.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Step by step, the project developed into something truly special as {userName} discovered patterns that even scientists might find fascinating.",
          alternatives: ["Through careful progression, the experiment evolved into remarkable research that revealed patterns worthy of professional scientific attention."],
          optionalDetails: ["The teacher was impressed with the detailed observations.", "Dad helped create professional-looking charts and graphs.", "The findings were clearer than anyone had expected."]
        }
      },
      {
        text: "The science teacher praised {userName}'s methodology and suggested submitting the research to the regional young scientist competition.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The science teacher praised {userName}'s methodology and suggested submitting the research to the regional young scientist competition.",
          alternatives: ["Impressed by the thorough approach, the science teacher recommended that {userName} enter the prestigious regional competition for young researchers."],
          optionalDetails: ["The competition included students from many different schools.", "Professional scientists would judge the projects.", "Winners would receive special recognition and science equipment."]
        }
      },
      {
        text: "Preparing the presentation required learning about scientific communication and creating visual displays that clearly explained the important findings.",
        pause: true,
        hook: "How will the presentation go?",
        microVariants: {
          text: "Preparing the presentation required learning about scientific communication and creating visual displays that clearly explained the important findings.",
          alternatives: ["The presentation preparation involved mastering scientific communication skills and designing clear visual displays to showcase the research results."],
          optionalDetails: ["The poster board was decorated with {favoriteColor} borders.", "Charts showed behavior changes over time.", "Photos documented the entire experiment process."]
        }
      },
      {
        text: "At the competition, judges were impressed by {userName}'s careful methodology and clear presentation of the behavioral research findings.",
        pause: false,
        hook: "",
        microVariants: {
          text: "At the competition, judges were impressed by {userName}'s careful methodology and clear presentation of the behavioral research findings.",
          alternatives: ["During the competition, professional judges praised {userName}'s systematic approach and articulate explanation of the animal behavior research."],
          optionalDetails: ["The judges asked thoughtful questions about the experiment.", "Other students gathered around to learn about the project.", "Parents and teachers watched proudly from the audience."]
        }
      },
      {
        text: "In the end, {userName} won second place and felt very accomplished about growing knowledge and contributing to scientific understanding.",
        pause: true,
        hook: "What will they discover next?",
        microVariants: {
          text: "In the end, {userName} won second place and felt very accomplished about growing knowledge and contributing to scientific understanding.",
          alternatives: ["Ultimately, {userName} earned second place recognition and experienced the satisfaction of expanding knowledge and advancing scientific understanding."],
          optionalDetails: ["The award ribbon was {favoriteColor} and beautiful.", "Scientists encouraged {userName} to continue research.", "The whole family celebrated the achievement together."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every evening, {userName} continues observing {favoriteAnimal} in the backyard, now with the confidence of a real scientist. The notebook filled with discoveries grows thicker each week, and each observation brings new wonder about the natural world.",
        microVariants: ["Each evening, {userName} continues scientific observations in the backyard, watching their notebook fill with discoveries and growing wonder about nature."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} becomes so smart from all the attention that it starts helping with other science experiments! Soon it's wearing tiny lab goggles and helping measure {favoriteFood} for other animal research. What a silly scientific assistant!",
        microVariants: ["The {favoriteAnimal} becomes so intelligent from the research that it dons tiny lab goggles and helps measure {favoriteFood} for other experiments - a hilarious scientific partner!"]
      },
      {
        type: 'triumphant',
        text: "{userName} starts a young scientists club at school, teaching other students about animal behavior research. Their work inspires a new after-school program where children conduct real scientific studies about local wildlife.",
        microVariants: ["{userName} establishes a school young scientists club, inspiring an after-school program where children conduct authentic wildlife research studies."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that science is about asking questions and finding answers through careful observation. Every creature, no matter how small, has important lessons to teach us about the wonderful complexity of life.",
        microVariants: ["{userName} discovers that science involves asking questions and careful observation, with every creature offering important lessons about life's wonderful complexity."]
      }
    ],
    reuse: {
      swappableElements: {
        "research_methods": ["observation", "measurement", "recording", "analysis", "experimentation"],
        "scientific_tools": ["notebooks", "charts", "graphs", "cameras", "timers"],
        "discovery_types": ["patterns", "behaviors", "preferences", "habits", "reactions"]
      },
      weatherVariants: ["perfect observation morning", "ideal research afternoon", "clear data collection day", "excellent experiment weather"],
      settingVariants: ["backyard laboratory", "school science room", "outdoor research area", "competition hall"]
    }
  },

  // Template 3: Drama Club Adventure (from extensions)
  {
    title: "The Exciting Drama Club",
    theme: "Creativity & Performance",
    level: "Level 2",
    scenes: [
      {
        text: "Suddenly, {userName} discovered the drama club and everything became exciting when they saw students practicing amazing scenes on the school stage!",
        pause: true,
        hook: "What role will {userName} play?",
        microVariants: {
          text: "Suddenly, {userName} discovered the drama club and everything became exciting when they saw students practicing amazing scenes on the school stage!",
          alternatives: ["All at once, {userName} found the drama club and felt tremendous excitement watching students rehearse incredible performances on the theater stage!"],
          optionalDetails: ["The stage lights created magical shadows and colors.", "Students wore colorful costumes and spoke with confident voices.", "The drama teacher welcomed new members with enthusiasm."]
        }
      },
      {
        text: "Amazingly, the play about brave knights and {favoriteColor} kingdoms sparked imagination and filled {userName} with creative energy and inspiration!",
        pause: false,
        hook: "",
        microVariants: {
          text: "Amazingly, the play about brave knights and {favoriteColor} kingdoms sparked imagination and filled {userName} with creative energy and inspiration!",
          alternatives: ["Incredibly, the production featuring courageous knights and magnificent {favoriteColor} kingdoms ignited {userName}'s imagination with powerful creative inspiration!"],
          optionalDetails: ["The castle sets were painted with beautiful details.", "Knight costumes included shining armor and colorful banners.", "The story involved dragons, quests, and magical adventures."]
        }
      },
      {
        text: "Surprisingly, practicing lines about {favoriteAnimal} characters felt natural and fun as {userName} discovered a talent for bringing stories to life!",
        pause: true,
        hook: "How will the performance go?",
        microVariants: {
          text: "Surprisingly, practicing lines about {favoriteAnimal} characters felt natural and fun as {userName} discovered a talent for bringing stories to life!",
          alternatives: ["Unexpectedly, rehearsing dialogue about {favoriteAnimal} characters came easily and joyfully as {userName} found their gift for storytelling performance!"],
          optionalDetails: ["The {favoriteAnimal} character was brave and wise.", "Other actors helped {userName} learn stage movements.", "Each rehearsal built confidence and acting skills."]
        }
      },
      {
        text: "Incredibly, opening night arrived and {userName} performed without forgetting anything while feeling nervous and excited at the same time!",
        pause: false,
        hook: "",
        microVariants: {
          text: "Incredibly, opening night arrived and {userName} performed without forgetting anything while feeling nervous and excited at the same time!",
          alternatives: ["Remarkably, the premiere evening came and {userName} delivered a flawless performance despite experiencing both nervousness and thrilling excitement!"],
          optionalDetails: ["The theater was packed with families and friends.", "Stage lights made everything feel magical and important.", "The audience was quiet and attentive during the performance."]
        }
      },
      {
        text: "The costume and makeup transformation made {userName} feel completely like the {favoriteAnimal} character from the magical {favoriteColor} kingdom story.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The costume and makeup transformation made {userName} feel completely like the {favoriteAnimal} character from the magical {favoriteColor} kingdom story.",
          alternatives: ["Through costume and makeup artistry, {userName} became fully transformed into the {favoriteAnimal} character from the enchanted {favoriteColor} kingdom tale."],
          optionalDetails: ["The makeup artist used special paints and glitter.", "The costume fit perfectly and felt comfortable.", "Looking in the mirror, {userName} saw the character come alive."]
        }
      },
      {
        text: "During the performance, {userName} felt the magic of storytelling as the audience laughed, gasped, and cheered at all the right moments.",
        pause: true,
        hook: "What will happen after the show?",
        microVariants: {
          text: "During the performance, {userName} felt the magic of storytelling as the audience laughed, gasped, and cheered at all the right moments.",
          alternatives: ["Throughout the show, {userName} experienced storytelling magic while the audience responded with perfect timing - laughing, gasping, and applauding enthusiastically."],
          optionalDetails: ["The funny parts made everyone laugh together.", "Scary moments caused the audience to hold their breath.", "The ending received thunderous applause and cheers."]
        }
      },
      {
        text: "After the final bow, fellow actors and the drama teacher praised {userName}'s natural talent and dedication to the theatrical arts.",
        pause: false,
        hook: "",
        microVariants: {
          text: "After the final bow, fellow actors and the drama teacher praised {userName}'s natural talent and dedication to the theatrical arts.",
          alternatives: ["Following the closing curtain call, cast members and the drama instructor commended {userName}'s exceptional ability and commitment to theater performance."],
          optionalDetails: ["The cast exchanged congratulatory hugs and high-fives.", "Parents brought flowers and took celebratory photographs.", "The drama teacher discussed future productions and roles."]
        }
      },
      {
        text: "Wonderfully, the audience applauded loudly and {userName} felt proud and accomplished while already dreaming about the next theatrical adventure!",
        pause: true,
        hook: "What role will they play next?",
        microVariants: {
          text: "Wonderfully, the audience applauded loudly and {userName} felt proud and accomplished while already dreaming about the next theatrical adventure!",
          alternatives: ["Magnificently, the crowd offered enthusiastic applause as {userName} experienced deep pride and achievement while anticipating future dramatic performances!"],
          optionalDetails: ["Family members cheered loudly from the audience.", "The feeling of accomplishment was better than expected.", "Dreams of future roles and productions filled {userName}'s mind."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Each evening after drama club rehearsals, {userName} practices lines while enjoying {favoriteFood} in the cozy living room. The house fills with dramatic voices and laughter as the whole family joins in the fun of acting and storytelling.",
        microVariants: ["Every evening, {userName} practices drama lines while sharing {favoriteFood} in the living room, with the whole family joining the fun of acting and storytelling."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} character becomes so popular that real {favoriteAnimal}s start showing up at rehearsals! Soon the drama club has to write special parts for their four-legged audience members. What a hilariously wonderful theater!",
        microVariants: ["The {favoriteAnimal} character attracts real {favoriteAnimal}s to rehearsals, leading the drama club to write special parts for their four-legged audience - a delightfully silly theater!"]
      },
      {
        type: 'triumphant',
        text: "{userName} becomes the drama club's lead actor and helps direct the spring musical. Their natural leadership and theatrical talent inspire younger students to join and discover their own love for performance arts.",
        microVariants: ["{userName} becomes the drama club's star performer and director, inspiring younger students to discover their own passion for theatrical arts."]
      },
      {
        type: 'reflective',
        text: "{userName} realizes that acting teaches empathy by helping us understand different characters and perspectives. Through drama, we learn to see the world through other people's eyes and tell stories that connect us all.",
        microVariants: ["{userName} discovers that acting develops empathy by exploring different perspectives and telling stories that connect all people through shared understanding."]
      }
    ],
    reuse: {
      swappableElements: {
        "performance_types": ["plays", "musicals", "puppet shows", "storytelling", "improv"],
        "character_types": ["knights", "princesses", "animals", "heroes", "villains"],
        "theater_elements": ["costumes", "sets", "lights", "music", "props"]
      },
      weatherVariants: ["opening night excitement", "rehearsal afternoon", "performance evening", "audition morning"],
      settingVariants: ["school theater", "community stage", "outdoor amphitheater", "classroom stage"]
    }
  },

  // Continue with more templates to reach the required 8 total templates...
  // I'll add the remaining templates to complete the set

  // Template 4: Cooking with Grandmother (from extensions)
  {
    title: "The Special Cooking Lessons",
    theme: "Family & Tradition",
    level: "Level 2",
    scenes: [
      {
        text: "One day, {userName} was thinking about {favoriteFood}, and that's when Grandmother offered cooking lessons in her warm, inviting kitchen.",
        pause: true,
        hook: "What delicious things will they make?",
        microVariants: {
          text: "One day, {userName} was thinking about {favoriteFood}, and that's when Grandmother offered cooking lessons in her warm, inviting kitchen.",
          alternatives: ["While dreaming about delicious {favoriteFood}, {userName} received Grandmother's wonderful invitation to learn cooking in her cozy, fragrant kitchen."],
          optionalDetails: ["Grandmother's kitchen smelled like cinnamon and vanilla.", "Old family recipes were written in a {favoriteColor} notebook.", "The stove was warm and welcoming."]
        }
      },
      {
        text: "So {userName} learned to make homemade {favoriteFood} from scratch together while Grandmother shared stories about family cooking traditions.",
        pause: false,
        hook: "",
        microVariants: {
          text: "So {userName} learned to make homemade {favoriteFood} from scratch together while Grandmother shared stories about family cooking traditions.",
          alternatives: ["{userName} discovered the art of creating {favoriteFood} from basic ingredients while listening to Grandmother's cherished family cooking stories."],
          optionalDetails: ["Each ingredient had a special purpose and story.", "Grandmother's hands moved with practiced skill and grace.", "The recipes had been passed down for generations."]
        }
      },
      {
        text: "Naturally, kneading dough and shaping loaves became a wonderful shared activity that connected them across generations through food and love.",
        pause: true,
        hook: "How will the cooking turn out?",
        microVariants: {
          text: "Naturally, kneading dough and shaping loaves became a wonderful shared activity that connected them across generations through food and love.",
          alternatives: ["Working the dough and forming shapes naturally evolved into a precious bonding experience that bridged generations through culinary tradition and affection."],
          optionalDetails: ["The dough felt soft and smooth under their hands.", "Grandmother guided {userName}'s movements gently.", "They worked together in comfortable, happy silence."]
        }
      },
      {
        text: "Before long, the kitchen smelled wonderful as fresh {favoriteFood} baked perfectly in the old oven that had cooked for the family for decades.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Before long, the kitchen smelled wonderful as fresh {favoriteFood} baked perfectly in the old oven that had cooked for the family for decades.",
          alternatives: ["Soon the kitchen filled with amazing aromas as the {favoriteFood} baked beautifully in the vintage oven that had served the family for many years."],
          optionalDetails: ["The smell attracted family members from other rooms.", "Steam rose from the oven in delicious clouds.", "The timer ticked slowly as anticipation grew."]
        }
      },
      {
        text: "While waiting for the baking to finish, Grandmother taught {userName} about measuring ingredients and the science behind cooking processes.",
        pause: false,
        hook: "",
        microVariants: {
          text: "While waiting for the baking to finish, Grandmother taught {userName} about measuring ingredients and the science behind cooking processes.",
          alternatives: ["During the baking time, Grandmother explained ingredient measurements and the fascinating scientific principles that make cooking work."],
          optionalDetails: ["They used {favoriteColor} measuring cups and spoons.", "Each measurement had to be precise for perfect results.", "Chemistry and cooking worked together like magic."]
        }
      },
      {
        text: "The whole family gathered around the kitchen table as {userName} proudly served the homemade {favoriteFood} they had created together.",
        pause: true,
        hook: "How will everyone react to the cooking?",
        microVariants: {
          text: "The whole family gathered around the kitchen table as {userName} proudly served the homemade {favoriteFood} they had created together.",
          alternatives: ["Family members assembled around the dining table while {userName} beamed with pride, presenting the {favoriteFood} they had lovingly prepared."],
          optionalDetails: ["Everyone complimented the delicious smell and appearance.", "The {favoriteColor} tablecloth made the meal feel special.", "Grandmother smiled with pride at {userName}'s accomplishment."]
        }
      },
      {
        text: "Everyone praised the delicious taste and asked for seconds while {userName} felt the joy of sharing homemade food with loved ones.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Everyone praised the delicious taste and asked for seconds while {userName} felt the joy of sharing homemade food with loved ones.",
          alternatives: ["Family members offered enthusiastic compliments and requested additional servings as {userName} experienced the happiness of sharing homemade meals with family."],
          optionalDetails: ["Dad said it was the best {favoriteFood} he'd ever tasted.", "Even the family {favoriteAnimal} got a small taste.", "The recipe was added to the family cookbook."]
        }
      },
      {
        text: "And wouldn't you know it - that {favoriteFood} brought the whole family together for dinner and created precious memories that would last forever.",
        pause: true,
        hook: "What will they bake next?",
        microVariants: {
          text: "And wouldn't you know it - that {favoriteFood} brought the whole family together for dinner and created precious memories that would last forever.",
          alternatives: ["The homemade {favoriteFood} had accomplished something wonderful - uniting the entire family around the dinner table while creating treasured memories for all time."],
          optionalDetails: ["They planned to make it again next weekend.", "Grandmother promised to teach more family recipes.", "The kitchen became everyone's favorite gathering place."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every Sunday afternoon, {userName} and Grandmother continue their cooking lessons in the warm kitchen. The house fills with delicious aromas and the sounds of family recipes being passed down with love from one generation to the next.",
        microVariants: ["Each Sunday, {userName} and Grandmother share cooking lessons in their warm kitchen, passing down family recipes with love across generations."]
      },
      {
        type: 'silly',
        text: "The cooking becomes so popular that the neighborhood {favoriteAnimal}s start lining up outside the kitchen window! Soon {userName} has to make special {favoriteFood} portions for all their four-legged fans. What a deliciously silly situation!",
        microVariants: ["The cooking attracts neighborhood {favoriteAnimal}s who line up at the window, requiring {userName} to prepare special {favoriteFood} portions for four-legged fans!"]
      },
      {
        type: 'triumphant',
        text: "{userName} becomes the family's official assistant chef and starts teaching cooking skills to younger cousins. Their homemade {favoriteFood} wins first prize at the community baking contest, making Grandmother incredibly proud.",
        microVariants: ["{userName} becomes the family's assistant chef, teaching younger cousins and winning first prize at the community baking contest, making Grandmother incredibly proud."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that cooking is about more than making food - it's about sharing love, preserving family traditions, and creating memories that connect generations. The best ingredient in any recipe is the love we put into it.",
        microVariants: ["{userName} learns that cooking involves sharing love, preserving traditions, and connecting generations - with love being the most important ingredient in any recipe."]
      }
    ],
    reuse: {
      swappableElements: {
        "cooking_activities": ["baking", "mixing", "measuring", "kneading", "decorating"],
        "kitchen_tools": ["measuring cups", "mixing bowls", "wooden spoons", "rolling pins", "timers"],
        "family_recipes": ["bread", "cookies", "pies", "cakes", "soups"]
      },
      weatherVariants: ["cozy baking morning", "perfect cooking weather", "warm kitchen afternoon", "family dinner evening"],
      settingVariants: ["grandmother's kitchen", "family dining room", "cozy breakfast nook", "festive holiday table"]
    }
  }

  // I'll continue with the remaining 4 templates in the next part to complete the 8 required templates
];