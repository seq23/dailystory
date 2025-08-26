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
  },

  // Template 5: Animal Shelter Helper (from extensions)
  {
    title: "The Animal Shelter Adventure",
    theme: "Helping & Compassion",
    level: "Level 2",
    scenes: [
      {
        text: "It all started when {userName} wanted to help {favoriteAnimal} at the local shelter and decided to volunteer every Saturday morning.",
        pause: true,
        hook: "How will {userName} help the animals?",
        microVariants: {
          text: "It all started when {userName} wanted to help {favoriteAnimal} at the local shelter and decided to volunteer every Saturday morning.",
          alternatives: ["The volunteer work began when {userName} felt called to assist {favoriteAnimal} at the community shelter, committing to Saturday morning service."],
          optionalDetails: ["The shelter was busy with many animals needing care.", "Volunteers wore special {favoriteColor} aprons.", "The staff welcomed young helpers with enthusiasm."]
        }
      },
      {
        text: "Day by day, feeding {favoriteFood} and giving attention became important work that made a real difference in the animals' lives.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Day by day, feeding {favoriteFood} and giving attention became important work that made a real difference in the animals' lives.",
          alternatives: ["Each day brought meaningful responsibilities as {userName} provided {favoriteFood} and affection, significantly improving the animals' well-being."],
          optionalDetails: ["Animals recognized {userName} and got excited when they arrived.", "The {favoriteFood} was specially chosen for each animal's needs.", "Some animals were shy at first but gradually warmed up."]
        }
      },
      {
        text: "Little by little, playing with puppies and brushing cats gently brought joy to both {userName} and the grateful animals.",
        pause: true,
        hook: "Which animals will {userName} help most?",
        microVariants: {
          text: "Little by little, playing with puppies and brushing cats gently brought joy to both {userName} and the grateful animals.",
          alternatives: ["Gradually, gentle play with puppies and careful cat grooming created happiness for both {userName} and the appreciative shelter animals."],
          optionalDetails: ["The brushes were soft and {favoriteColor}.", "Puppies wagged their tails and played fetch games.", "Cats purred contentedly during grooming sessions."]
        }
      },
      {
        text: "Step by step, one shy {favoriteAnimal} became friendly after {userName}'s patient care and consistent daily visits to the shelter.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Step by step, one shy {favoriteAnimal} became friendly after {userName}'s patient care and consistent daily visits to the shelter.",
          alternatives: ["Through gradual progress, a timid {favoriteAnimal} developed trust and friendship following {userName}'s persistent kindness and regular shelter visits."],
          optionalDetails: ["The {favoriteAnimal} had been at the shelter for months.", "It slowly learned to trust humans again.", "Other volunteers noticed the remarkable transformation."]
        }
      },
      {
        text: "The shelter staff praised {userName}'s dedication and asked them to help train new young volunteers in proper animal care techniques.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The shelter staff praised {userName}'s dedication and asked them to help train new young volunteers in proper animal care techniques.",
          alternatives: ["Impressed by {userName}'s commitment, the shelter team requested their assistance in teaching proper animal care methods to incoming young volunteers."],
          optionalDetails: ["The training program was starting next month.", "{userName} would get a special volunteer leader badge.", "New volunteers needed to learn safety rules and animal behavior."]
        }
      },
      {
        text: "Teaching others about gentle animal handling and responsible pet care became {userName}'s favorite part of volunteering at the busy shelter.",
        pause: true,
        hook: "How will the animals benefit from more helpers?",
        microVariants: {
          text: "Teaching others about gentle animal handling and responsible pet care became {userName}'s favorite part of volunteering at the busy shelter.",
          alternatives: ["Educating fellow volunteers about compassionate animal care and responsible pet ownership evolved into {userName}'s most rewarding shelter activity."],
          optionalDetails: ["The lessons covered feeding schedules, exercise needs, and socialization.", "New volunteers learned to read animal body language.", "Everyone practiced the proper way to approach nervous animals."]
        }
      },
      {
        text: "More volunteers meant more animals could receive individual attention and have better chances of finding loving forever homes.",
        pause: false,
        hook: "",
        microVariants: {
          text: "More volunteers meant more animals could receive individual attention and have better chances of finding loving forever homes.",
          alternatives: ["The increased volunteer team enabled individual animal care and significantly improved each animal's prospects for permanent, loving adoption."],
          optionalDetails: ["Adoption rates increased as animals became more socialized.", "Families visited more often to meet well-cared-for pets.", "The shelter became known for having happy, healthy animals."]
        }
      },
      {
        text: "In the end, {userName} felt happy knowing the animals were loved and cared for while learning that helping others brings the greatest satisfaction.",
        pause: true,
        hook: "Which animal will need help next?",
        microVariants: {
          text: "In the end, {userName} felt happy knowing the animals were loved and cared for while learning that helping others brings the greatest satisfaction.",
          alternatives: ["Ultimately, {userName} experienced deep contentment from ensuring animal welfare while discovering that serving others provides life's most meaningful fulfillment."],
          optionalDetails: ["Many animals found homes thanks to {userName}'s care.", "The shelter recognized {userName} as volunteer of the month.", "Friends and family were proud of the compassionate work."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every Saturday morning, {userName} arrives at the shelter with {favoriteFood} treats and a heart full of love. The animals recognize their footsteps and gather eagerly, knowing that someone special cares deeply about their well-being and happiness.",
        microVariants: ["Each Saturday, {userName} brings {favoriteFood} treats to the shelter, where animals eagerly await their caring presence and loving attention."]
      },
      {
        type: 'silly',
        text: "The animals love {userName} so much that they start following them home! Soon {userName}'s house becomes a funny parade of dogs, cats, and even a {favoriteAnimal} who all want to live with their favorite volunteer. What a wonderfully chaotic situation!",
        microVariants: ["The shelter animals adore {userName} so much they follow them home, creating a hilarious parade of pets including a persistent {favoriteAnimal} wanting to move in!"]
      },
      {
        type: 'triumphant',
        text: "{userName} starts a youth volunteer program that spreads to shelters throughout the city. Their leadership helps hundreds of animals find homes while inspiring other young people to dedicate themselves to animal welfare and community service.",
        microVariants: ["{userName} establishes a city-wide youth volunteer program, helping hundreds of animals find homes while inspiring young people toward animal welfare service."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that caring for animals teaches us about unconditional love, patience, and responsibility. When we help creatures who cannot speak for themselves, we discover the most important parts of our own humanity and compassion.",
        microVariants: ["{userName} discovers that animal care teaches unconditional love and responsibility, revealing our most important human qualities of compassion and empathy."]
      }
    ],
    reuse: {
      swappableElements: {
        "care_activities": ["feeding", "grooming", "exercising", "socializing", "training"],
        "shelter_areas": ["kennels", "play yards", "grooming stations", "adoption rooms", "medical areas"],
        "volunteer_tasks": ["cleaning", "walking", "playing", "training", "organizing"]
      },
      weatherVariants: ["perfect volunteer morning", "busy shelter day", "quiet afternoon", "adoption event weekend"],
      settingVariants: ["animal shelter", "outdoor exercise area", "adoption center", "veterinary clinic"]
    }
  },

  // Template 6: Art Club Project (from extensions)
  {
    title: "The Creative Art Club",
    theme: "Creativity & Self-Expression",
    level: "Level 2",
    scenes: [
      {
        text: "When {userName} joined the art club, creating {favoriteColor} paintings became a passion that filled their afternoons with creativity and joy.",
        pause: true,
        hook: "What amazing art will {userName} create?",
        microVariants: {
          text: "When {userName} joined the art club, creating {favoriteColor} paintings became a passion that filled their afternoons with creativity and joy.",
          alternatives: ["Upon joining the art club, {userName} discovered that painting with {favoriteColor} became a passionate pursuit that brought afternoon hours of creative fulfillment."],
          optionalDetails: ["The art room smelled like paint and creativity.", "Brushes and canvases were organized on {favoriteColor} shelves.", "Other students were working on amazing projects."]
        }
      },
      {
        text: "Every week, they learned new techniques for drawing {favoriteAnimal} realistically while developing their artistic skills and confidence with each lesson.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Every week, they learned new techniques for drawing {favoriteAnimal} realistically while developing their artistic skills and confidence with each lesson.",
          alternatives: ["Weekly sessions introduced new methods for realistic {favoriteAnimal} illustration while steadily building {userName}'s artistic abilities and self-assurance."],
          optionalDetails: ["The art teacher demonstrated shading and proportion techniques.", "Each {favoriteAnimal} drawing looked more lifelike than the last.", "Practice sketches filled an entire {favoriteColor} notebook."]
        }
      },
      {
        text: "The art teacher showed how mixing colors creates beautiful {favoriteColor} shades while explaining the science behind pigments and paint composition.",
        pause: true,
        hook: "What masterpiece will emerge from the color mixing?",
        microVariants: {
          text: "The art teacher showed how mixing colors creates beautiful {favoriteColor} shades while explaining the science behind pigments and paint composition.",
          alternatives: ["The instructor demonstrated color mixing techniques that produced gorgeous {favoriteColor} hues while teaching the scientific principles of pigments and paint chemistry."],
          optionalDetails: ["Color wheels helped understand primary and secondary colors.", "Each mixture created surprising and beautiful new shades.", "The palette became a rainbow of possibilities."]
        }
      },
      {
        text: "At the art show, {userName}'s painting of a {favoriteAnimal} won first prize while family and friends admired the incredible artistic achievement.",
        pause: false,
        hook: "",
        microVariants: {
          text: "At the art show, {userName}'s painting of a {favoriteAnimal} won first prize while family and friends admired the incredible artistic achievement.",
          alternatives: ["During the art exhibition, {userName}'s {favoriteAnimal} painting earned first place recognition as family and friends marveled at the outstanding artistic accomplishment."],
          optionalDetails: ["The painting was displayed in the center of the gallery.", "A {favoriteColor} ribbon marked the first-place winner.", "People stopped to admire the lifelike details."]
        }
      },
      {
        text: "Everyone admired {userName}'s creativity and dedication to improving their skills through consistent practice and willingness to try new artistic techniques.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Everyone admired {userName}'s creativity and dedication to improving their skills through consistent practice and willingness to try new artistic techniques.",
          alternatives: ["Observers praised {userName}'s creative vision and commitment to skill development through regular practice and openness to experimenting with diverse artistic methods."],
          optionalDetails: ["The art teacher displayed the painting for other students to study.", "Younger students asked for painting advice and tips.", "The school newsletter featured {userName}'s artistic success."]
        }
      },
      {
        text: "The success inspired {userName} to start teaching basic art skills to younger students during lunch periods and after school sessions.",
        pause: true,
        hook: "How will teaching art help others discover creativity?",
        microVariants: {
          text: "The success inspired {userName} to start teaching basic art skills to younger students during lunch periods and after school sessions.",
          alternatives: ["The achievement motivated {userName} to begin instructing fundamental art techniques to younger students through lunchtime and after-school educational sessions."],
          optionalDetails: ["The lessons covered basic drawing, color theory, and painting techniques.", "Younger students were eager to learn from a peer.", "The art room became busy with enthusiastic beginning artists."]
        }
      },
      {
        text: "Creating a supportive environment where other children could explore their artistic abilities became {userName}'s favorite way to share their passion for art.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Creating a supportive environment where other children could explore their artistic abilities became {userName}'s favorite way to share their passion for art.",
          alternatives: ["Establishing an encouraging atmosphere for other children's artistic exploration evolved into {userName}'s preferred method of sharing their deep love for creative expression."],
          optionalDetails: ["Each student worked on projects featuring their own favorite animals.", "The room buzzed with creative energy and excitement.", "Everyone celebrated each other's artistic progress and achievements."]
        }
      },
      {
        text: "The art club grew larger as more students discovered their creative talents while learning that art is a wonderful way to express feelings and ideas.",
        pause: true,
        hook: "What masterpiece will they create next?",
        microVariants: {
          text: "The art club grew larger as more students discovered their creative talents while learning that art is a wonderful way to express feelings and ideas.",
          alternatives: ["The expanding art club welcomed more students who uncovered their creative abilities while understanding that artistic expression beautifully communicates emotions and concepts."],
          optionalDetails: ["New members brought fresh ideas and different artistic styles.", "The club planned a community art exhibition.", "Everyone felt proud to be part of the creative community."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every afternoon, {userName} sits in the quiet art room with {favoriteColor} paints, creating peaceful landscapes while soft music plays. The gentle brush strokes and creative flow bring a sense of calm happiness that lasts long after the painting session ends.",
        microVariants: ["Each afternoon, {userName} enjoys peaceful painting sessions in the quiet art room, creating {favoriteColor} landscapes with gentle brush strokes and calm happiness."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} paintings become so lifelike that real {favoriteAnimal}s start visiting the art room! Soon the space is filled with models posing for portraits while eating {favoriteFood}. What a delightfully chaotic art studio!",
        microVariants: ["The realistic {favoriteAnimal} paintings attract real animals who visit the art room, creating a wonderfully chaotic studio with models posing while eating {favoriteFood}!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s art program expands throughout the school district, bringing creative education to hundreds of students. Their leadership in arts education earns recognition from the state education department and inspires new funding for school art programs.",
        microVariants: ["{userName}'s art program spreads district-wide, bringing creative education to hundreds and earning state recognition that inspires new school art funding."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that art is more than creating beautiful pictures - it's about expressing our inner thoughts, connecting with others through shared creativity, and finding beauty in the world around us. Every brushstroke is a way of sharing our unique perspective.",
        microVariants: ["{userName} learns that art expresses inner thoughts and connects people through creativity, with every brushstroke sharing our unique perspective on life's beauty."]
      }
    ],
    reuse: {
      swappableElements: {
        "art_materials": ["paints", "brushes", "canvases", "pencils", "pastels"],
        "art_techniques": ["painting", "drawing", "sketching", "shading", "blending"],
        "art_subjects": ["animals", "landscapes", "portraits", "still life", "abstract"]
      },
      weatherVariants: ["creative afternoon", "inspiring morning", "peaceful evening", "artistic moment"],
      settingVariants: ["art classroom", "outdoor easel", "gallery space", "home studio"]
    }
  },

  // Template 7: New Neighborhood Club Template
  {
    title: "The Neighborhood Adventure Club",
    theme: "Community & Leadership",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} decided to start a neighborhood club for kids who love {hobbies} and wanted to bring children together for fun activities.",
        pause: true,
        hook: "Who will join the new club?",
        microVariants: {
          text: "{userName} decided to start a neighborhood club for kids who love {hobbies} and wanted to bring children together for fun activities.",
          alternatives: ["{userName} chose to establish a community club for children interested in {hobbies}, hoping to unite neighborhood kids through engaging group activities."],
          optionalDetails: ["The idea came during a lonely afternoon.", "Many kids in the area didn't know each other well.", "Parents were supportive of the community-building idea."]
        }
      },
      {
        text: "They created colorful {favoriteColor} posters and invited everyone to join the fun activities while explaining the club's mission and weekly schedule.",
        pause: false,
        hook: "",
        microVariants: {
          text: "They created colorful {favoriteColor} posters and invited everyone to join the fun activities while explaining the club's mission and weekly schedule.",
          alternatives: ["{userName} designed vibrant {favoriteColor} advertisements and welcomed all children to participate in enjoyable activities while outlining the organization's purpose and regular meetings."],
          optionalDetails: ["The posters featured drawings of {favoriteAnimal} and fun activities.", "Mom helped with poster design and placement around the neighborhood.", "The meeting time was perfect for after-school participation."]
        }
      },
      {
        text: "The first meeting was at the park, where they shared {favoriteFood} and told stories about their favorite {favoriteAnimal} while getting to know each other.",
        pause: true,
        hook: "Will the club members become good friends?",
        microVariants: {
          text: "The first meeting was at the park, where they shared {favoriteFood} and told stories about their favorite {favoriteAnimal} while getting to know each other.",
          alternatives: ["The inaugural gathering occurred at the local park, featuring {favoriteFood} sharing and {favoriteAnimal} storytelling as members introduced themselves and built connections."],
          optionalDetails: ["Everyone brought different types of {favoriteFood} to share.", "The stories were funny and heartwarming.", "Shy children gradually opened up and joined conversations."]
        }
      },
      {
        text: "Soon, twelve children joined the club and they planned weekly adventures together while learning about teamwork and friendship through shared experiences.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Soon, twelve children joined the club and they planned weekly adventures together while learning about teamwork and friendship through shared experiences.",
          alternatives: ["Before long, twelve neighborhood children became club members and organized weekly adventures while discovering teamwork principles and friendship development through collective activities."],
          optionalDetails: ["The group included children of different ages and interests.", "Everyone contributed ideas for club activities and adventures.", "Weekly planning meetings became as fun as the actual events."]
        }
      },
      {
        text: "Each adventure taught the club members something new about cooperation, problem-solving, and working together to achieve common goals and dreams.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Each adventure taught the club members something new about cooperation, problem-solving, and working together to achieve common goals and dreams.",
          alternatives: ["Every expedition provided club members with fresh lessons in collaboration, creative problem-solving, and collective effort toward shared objectives and aspirations."],
          optionalDetails: ["Some adventures involved treasure hunts requiring teamwork.", "Problem-solving challenges helped develop critical thinking skills.", "Group projects taught the value of different talents and perspectives."]
        }
      },
      {
        text: "The club organized community service projects like park cleanups and {favoriteAnimal} habitat restoration while making a positive impact on their neighborhood environment.",
        pause: true,
        hook: "How will the community respond to their good work?",
        microVariants: {
          text: "The club organized community service projects like park cleanups and {favoriteAnimal} habitat restoration while making a positive impact on their neighborhood environment.",
          alternatives: ["The organization coordinated community service initiatives including park maintenance and {favoriteAnimal} habitat conservation while creating beneficial environmental improvements in their local area."],
          optionalDetails: ["Adult volunteers helped supervise the environmental projects.", "The work made visible improvements to local green spaces.", "Other community groups began collaborating with the club."]
        }
      },
      {
        text: "Local families and community leaders praised the young people's initiative and offered support for future projects and club expansion efforts.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Local families and community leaders praised the young people's initiative and offered support for future projects and club expansion efforts.",
          alternatives: ["Neighborhood families and municipal leaders commended the youth organization's leadership while providing assistance for upcoming initiatives and organizational growth plans."],
          optionalDetails: ["The mayor visited to recognize their community service.", "Local businesses donated supplies for club activities.", "Parents volunteered to help with transportation and supervision."]
        }
      },
      {
        text: "The {favoriteAnimal} club became the most popular group in the neighborhood, bringing friends together through shared interests and community service.",
        pause: true,
        hook: "What adventure will they plan next?",
        microVariants: {
          text: "The {favoriteAnimal} club became the most popular group in the neighborhood, bringing friends together through shared interests and community service.",
          alternatives: ["The {favoriteAnimal}-themed organization evolved into the area's most beloved youth group, uniting friends through common interests and volunteer service activities."],
          optionalDetails: ["Other neighborhoods asked for help starting similar clubs.", "The waiting list for membership grew longer each month.", "Annual club events became neighborhood celebrations."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every evening after club meetings, {userName} sits in their room planning the next adventure while feeling grateful for all the wonderful friendships that grew from a simple idea. The club notebook filled with memories sits nearby, documenting a community brought together through kindness.",
        microVariants: ["Each evening, {userName} plans future adventures while treasuring the friendships that grew from their simple idea, with a memory-filled notebook documenting their united community."]
      },
      {
        type: 'silly',
        text: "The club becomes so popular that even the neighborhood {favoriteAnimal}s want to join! Soon the meetings include four-legged members who participate in activities and contribute their own unique ideas. What a wonderfully wild and inclusive club!",
        microVariants: ["The club attracts neighborhood {favoriteAnimal}s who want to join meetings and activities, creating a wonderfully wild and inclusive organization with four-legged members!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s club model spreads to communities across the region, with dozens of youth-led organizations following their example. Their leadership training program helps other young people start their own successful community groups.",
        microVariants: ["{userName}'s club model spreads regionally with dozens of youth organizations following their example, while their leadership program helps others start successful community groups."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that bringing people together requires courage to take the first step, but the rewards of friendship and community connection make every effort worthwhile. Small acts of leadership can create lasting positive change in the world around us.",
        microVariants: ["{userName} discovers that community building requires initial courage, but friendship and connection rewards make every effort worthwhile, with small leadership acts creating lasting positive change."]
      }
    ],
    reuse: {
      swappableElements: {
        "club_activities": ["games", "crafts", "sports", "reading", "exploring"],
        "community_projects": ["cleanups", "gardening", "fundraising", "helping", "organizing"],
        "leadership_skills": ["planning", "organizing", "communicating", "problem-solving", "inspiring"]
      },
      weatherVariants: ["perfect meeting day", "outdoor adventure weather", "cozy indoor gathering", "community event afternoon"],
      settingVariants: ["neighborhood park", "community center", "backyard meeting", "school playground"]
    }
  },

  // Template 8: Environmental Park Project (combining themes)
  {
    title: "The Park Restoration Project",
    theme: "Environment & Community Action",
    level: "Level 2",
    scenes: [
      {
        text: "{userName} noticed that the local park needed help with environmental cleanup and wildlife protection while walking through the neglected green space.",
        pause: true,
        hook: "How can {userName} help restore the park?",
        microVariants: {
          text: "{userName} noticed that the local park needed help with environmental cleanup and wildlife protection while walking through the neglected green space.",
          alternatives: ["During a walk through the overlooked green area, {userName} observed that the neighborhood park required environmental restoration and wildlife conservation assistance."],
          optionalDetails: ["Litter was scattered across the walking paths.", "The {favoriteAnimal} habitat looked damaged and overgrown.", "Once-beautiful areas had become unattractive and unwelcoming."]
        }
      },
      {
        text: "They researched different ways to make the park more friendly for {favoriteAnimal}s and other creatures while learning about local ecosystem needs.",
        pause: false,
        hook: "",
        microVariants: {
          text: "They researched different ways to make the park more friendly for {favoriteAnimal}s and other creatures while learning about local ecosystem needs.",
          alternatives: ["{userName} investigated various methods for creating a more hospitable environment for {favoriteAnimal}s and other wildlife while studying local ecosystem requirements."],
          optionalDetails: ["The library had books about native plants and animal habitats.", "Online resources provided information about pollution prevention.", "Local environmental groups offered helpful advice and guidance."]
        }
      },
      {
        text: "Working with neighbors, {userName} organized weekend volunteer sessions to plant {favoriteColor} flowers and remove litter while building community cooperation.",
        pause: true,
        hook: "Will the community support the restoration efforts?",
        microVariants: {
          text: "Working with neighbors, {userName} organized weekend volunteer sessions to plant {favoriteColor} flowers and remove litter while building community cooperation.",
          alternatives: ["Through neighborhood collaboration, {userName} coordinated weekend volunteer activities for planting {favoriteColor} flowers and debris removal while fostering community partnership."],
          optionalDetails: ["Families brought gardening tools and work gloves.", "Children and adults worked together on different restoration tasks.", "The work was hard but rewarding and fun."]
        }
      },
      {
        text: "The project attracted attention from the city council, who provided supplies and recognized their environmental leadership while promising ongoing support.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The project attracted attention from the city council, who provided supplies and recognized their environmental leadership while promising ongoing support.",
          alternatives: ["The initiative gained city council notice, resulting in supply donations and environmental leadership recognition along with commitments for continued assistance."],
          optionalDetails: ["The mayor visited to see the progress firsthand.", "Free mulch and plants were delivered to the park.", "Local news covered the community restoration story."]
        }
      },
      {
        text: "Each weekend brought more volunteers as word spread about the positive changes happening in the once-neglected neighborhood green space.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Each weekend brought more volunteers as word spread about the positive changes happening in the once-neglected neighborhood green space.",
          alternatives: ["Weekly volunteer numbers increased as community members learned about the positive transformations occurring in the previously overlooked neighborhood park."],
          optionalDetails: ["High school students earned community service hours.", "Families made the restoration work a weekly tradition.", "Even businesses began contributing materials and refreshments."]
        }
      },
      {
        text: "Wildlife began returning to the restored areas as native plants provided food and shelter for birds, butterflies, and small mammals including {favoriteAnimal}s.",
        pause: true,
        hook: "What other improvements will the park see?",
        microVariants: {
          text: "Wildlife began returning to the restored areas as native plants provided food and shelter for birds, butterflies, and small mammals including {favoriteAnimal}s.",
          alternatives: ["Animals started returning to the rehabilitated spaces where indigenous plants offered nourishment and protection for birds, butterflies, and small creatures like {favoriteAnimal}s."],
          optionalDetails: ["Bird songs filled the air during morning hours.", "Butterflies visited the new {favoriteColor} flower gardens.", "Children delighted in spotting returning wildlife."]
        }
      },
      {
        text: "The restoration success inspired other neighborhood parks to request similar environmental improvement projects and community volunteer coordination.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The restoration success inspired other neighborhood parks to request similar environmental improvement projects and community volunteer coordination.",
          alternatives: ["The rehabilitation achievement motivated other local parks to seek comparable environmental enhancement initiatives and community volunteer organization."],
          optionalDetails: ["Parks across the city wanted to replicate the success.", "{userName} was invited to speak at environmental conferences.", "The model became a template for community-led conservation."]
        }
      },
      {
        text: "After six months of hard work, the park became a beautiful habitat where {favoriteAnimal}s and families could enjoy nature together in harmony.",
        pause: true,
        hook: "What environmental project will they tackle next?",
        microVariants: {
          text: "After six months of hard work, the park became a beautiful habitat where {favoriteAnimal}s and families could enjoy nature together in harmony.",
          alternatives: ["Following six months of dedicated effort, the park transformed into a gorgeous natural habitat where {favoriteAnimal}s and families could peacefully enjoy nature together."],
          optionalDetails: ["The transformation was visible from the street.", "Property values in the area began to increase.", "The park became a model for sustainable community development."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every morning, {userName} walks through the restored park, watching {favoriteAnimal}s play among the {favoriteColor} flowers while families enjoy picnics on the clean grass. The peaceful sounds of nature and children's laughter create a perfect harmony of community and environment.",
        microVariants: ["Each morning, {userName} strolls through their restored park, watching {favoriteAnimal}s among {favoriteColor} flowers while families picnic, creating perfect harmony of community and nature."]
      },
      {
        type: 'silly',
        text: "The park becomes so beautiful that {favoriteAnimal}s from all over the city move in! Soon there's a housing shortage for all the new animal residents, and {userName} has to organize a wild animal real estate committee. What a wonderfully chaotic conservation success!",
        microVariants: ["The restored park attracts so many {favoriteAnimal}s that {userName} needs to organize an animal real estate committee for the new residents - a wonderfully chaotic conservation success!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s environmental leadership leads to a city-wide youth conservation program. Their restoration model is adopted by schools across the state, and they receive recognition from the governor for outstanding environmental stewardship.",
        microVariants: ["{userName}'s environmental leadership creates a city-wide youth conservation program, with their restoration model adopted statewide and earning gubernatorial recognition."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that caring for the environment means caring for all living things - plants, animals, and people alike. When we work together to heal the earth, we create healthier, happier communities for everyone to enjoy for generations to come.",
        microVariants: ["{userName} learns that environmental care means caring for all life, and working together to heal the earth creates healthier communities for future generations."]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_actions": ["planting", "cleaning", "restoring", "protecting", "conserving"],
        "wildlife_benefits": ["habitat", "food sources", "shelter", "nesting areas", "water access"],
        "community_outcomes": ["cooperation", "pride", "stewardship", "education", "inspiration"]
      },
      weatherVariants: ["perfect volunteer morning", "restoration work day", "community celebration", "wildlife observation afternoon"],
      settingVariants: ["neighborhood park", "community garden", "nature preserve", "urban green space"]
    }
  }
];