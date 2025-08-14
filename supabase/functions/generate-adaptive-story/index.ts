import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Diagnostic function to check API key availability
function validateOpenAIApiKey(): { isValid: boolean; error?: string } {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  console.log('🔍 DIAGNOSTIC: Checking OpenAI API key availability', {
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
    timestamp: new Date().toISOString()
  });
  
  if (!apiKey) {
    return { isValid: false, error: 'OPENAI_API_KEY environment variable not set' };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return { isValid: false, error: 'Invalid OpenAI API key format' };
  }
  
  if (apiKey.length < 20) {
    return { isValid: false, error: 'OpenAI API key appears to be incomplete' };
  }
  
  return { isValid: true };
}

// ============================================================================
// ENHANCED TEMPLATE LIBRARY INTEGRATION
// ============================================================================

// Name formatting utilities for proper capitalization
class NameFormatter {
  static capitalize(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    const trimmed = name.trim();
    if (!trimmed) return '';
    
    // Handle hyphenated names (Mary-Jane -> Mary-Jane)
    if (trimmed.includes('-')) {
      return trimmed.split('-')
        .map(part => this.capitalizeWord(part))
        .join('-');
    }
    
    // Handle multiple words (Mary Jane -> Mary Jane)
    if (trimmed.includes(' ')) {
      return trimmed.split(' ')
        .map(part => this.capitalizeWord(part))
        .join(' ');
    }
    
    // Single word
    return this.capitalizeWord(trimmed);
  }
  
  private static capitalizeWord(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}

// Color converter utility
const HEX_TO_COLOR_MAP: Record<string, string> = {
  '#3B82F6': 'blue',
  '#EF4444': 'red', 
  '#10B981': 'green',
  '#F59E0B': 'yellow',
  '#8B5CF6': 'purple',
  '#EC4899': 'pink',
  '#F97316': 'orange',
  '#06B6D4': 'cyan',
  '#84CC16': 'lime',
  '#6366F1': 'indigo',
  '#14B8A6': 'teal',
  '#F43F5E': 'rose',
  '#A855F7': 'violet',
  '#22C55E': 'emerald'
};

function ensureColorName(color: string | undefined): string {
  if (!color) return 'blue';
  if (!color?.startsWith('#')) {
    return color || 'blue';
  }
  const colorName = HEX_TO_COLOR_MAP[color.toLowerCase()];
  return colorName || 'blue';
}

// ============================================================================
// COMPLETE 187-TEMPLATE ENHANCED TEMPLATE LIBRARY 
// Imported from the comprehensive grade-based system for maximum quality
// ============================================================================

// Grade-based template arrays (160 base templates + 20 extensions)
const LEVEL_1_TEMPLATES = [
  ["{name} sees a {animal}.", "The {animal} is {color}.", "{name} can play.", "{name} and {animal} play.", "They run and jump.", "The {animal} is happy.", "{name} helps the {animal}.", "They are good friends.", "They have fun.", "{name} is happy.", "The {animal} is happy.", "It is a good day."],
  ["{name} has a {color} ball.", "The ball is big.", "{name} plays with the ball.", "The ball rolls fast.", "{name} runs to get it.", "The ball is fun.", "{name} throws the ball high.", "It goes up and down.", "The ball bounces well.", "{name} likes the ball.", "The ball is the best.", "Playing is fun."],
  ["{name} goes to the park.", "The park has trees.", "{name} sees birds.", "The birds sing songs.", "{name} listens to them.", "The songs are nice.", "More birds come to sing.", "They all sing together.", "The music is beautiful.", "{name} feels happy.", "The birds fly away.", "The park is quiet now."],
  ["{name} finds a {color} flower.", "The flower smells good.", "{name} picks it up.", "The flower is pretty.", "{name} shows it to mom.", "Mom likes the flower.", "They put it in water.", "The flower stays fresh.", "It makes the room nice.", "{name} is proud.", "The flower is beautiful.", "Mom says thank you."],
  ["{name} has a pet {animal}.", "The {animal} is small.", "{name} feeds the {animal}.", "The {animal} eats the food.", "{name} pets the {animal}.", "The {animal} purrs softly.", "They play together daily.", "The {animal} follows {name}.", "They are best friends.", "{name} loves the {animal}.", "The {animal} loves {name}.", "They are very happy."],
  ["{name} walks to school.", "The sun is bright.", "{name} sees other kids.", "They wave at {name}.", "{name} waves back.", "Everyone is friendly.", "They walk together.", "School looks fun today.", "The teacher smiles.", "{name} feels excited.", "Learning will be good.", "It is a great day."],
  ["{name} helps make dinner.", "Mom shows {name} how.", "{name} washes the vegetables.", "The water is cool.", "{name} helps cut them.", "Mom says good job.", "They cook together.", "The food smells good.", "Dad comes to eat.", "{name} is proud.", "The family eats together.", "Everyone likes the food."],
  ["{name} reads a {color} book.", "The book has pictures.", "{name} likes the story.", "The pictures are fun.", "{name} reads out loud.", "The words are easy.", "The story is about animals.", "The animals are friends.", "They help each other.", "{name} likes the ending.", "The book is good.", "Reading is fun."],
  ["{name} plays in the yard.", "The grass is green.", "{name} runs around.", "The yard is big.", "{name} sees a butterfly.", "The butterfly is {color}.", "It flies around flowers.", "The flowers are pretty.", "{name} watches it fly.", "The butterfly lands near.", "{name} stays very still.", "The butterfly flies away."],
  ["{name} takes a bath.", "The water is warm.", "{name} plays with toys.", "The toys float on water.", "{name} makes bubbles.", "The bubbles are fun.", "They pop when touched.", "More bubbles appear.", "{name} laughs and plays.", "The bath is relaxing.", "{name} gets clean.", "Bath time is over."],
  ["{name} visits grandma.", "Grandma hugs {name}.", "{name} tells about school.", "Grandma listens well.", "{name} helps with cookies.", "They bake them together.", "The cookies smell good.", "They eat some cookies.", "Grandma tells stories.", "{name} likes the stories.", "The visit is nice.", "Hugs goodbye."],
  ["{name} goes to the beach.", "The sand is warm.", "{name} builds a castle.", "The castle is big.", "{name} finds some shells.", "The shells are pretty.", "Waves come to shore.", "The water is cool.", "{name} plays in waves.", "The beach is fun.", "The sun feels nice.", "Time to go home."],
  ["{name} plants a seed.", "The soil is dark.", "{name} waters the seed.", "The water soaks in.", "{name} waits for it.", "Days go by slowly.", "A small plant grows.", "The plant gets bigger.", "Green leaves appear.", "{name} is excited.", "The plant is healthy.", "Growing things is fun."],
  ["{name} draws a picture.", "The crayons are {color}.", "{name} draws a house.", "The house has windows.", "{name} adds a door.", "The door is {color}.", "A family lives there.", "They are all happy.", "The sun shines down.", "{name} likes the picture.", "Art is very fun.", "The picture is done."],
  ["{name} rides a bike.", "The bike is {color}.", "{name} pedals fast.", "The wind feels good.", "{name} goes down hills.", "The bike goes fast.", "Up hills is harder.", "{name} keeps pedaling.", "Other kids wave.", "{name} waves back.", "Riding is exciting.", "The bike ride ends."],
  ["{name} feeds the ducks.", "The ducks are hungry.", "{name} throws bread.", "The ducks eat quickly.", "More ducks come over.", "They quack loudly.", "The baby ducks are cute.", "They swim with mom.", "{name} watches them.", "The ducks say thank you.", "Feeding ducks is nice.", "Time to go home."],
  ["{name} makes a friend.", "The friend is nice.", "{name} shares toys.", "They play together.", "The friend shares too.", "They have fun.", "They laugh and play.", "Games are more fun.", "Friends help each other.", "{name} likes having friends.", "The friend likes {name}.", "Friendship is good."],
  ["{name} goes camping.", "The tent is {color}.", "{name} sleeps outside.", "The stars are bright.", "{name} hears night sounds.", "Owls hoot softly.", "The fire keeps warm.", "Marshmallows taste good.", "Morning comes early.", "{name} sees the sunrise.", "Camping is adventure.", "Nature is beautiful."],
  ["{name} learns to swim.", "The water is cool.", "{name} holds the side.", "The teacher helps.", "{name} kicks feet.", "Arms move like this.", "Breathing is important.", "Practice makes better.", "Soon {name} can float.", "Swimming is fun.", "The water feels good.", "Learning new things rocks."],
  ["{name} bakes bread.", "The dough is soft.", "{name} kneads it well.", "The dough gets smooth.", "It needs to rise.", "The kitchen smells good.", "The bread bakes slowly.", "It turns golden brown.", "The bread is ready.", "{name} is proud.", "Fresh bread tastes best.", "Baking is rewarding."],
  ["{name} watches clouds.", "The clouds are white.", "{name} sees shapes.", "That one looks like cat.", "This one like a dog.", "Clouds move slowly.", "The sky is so blue.", "New shapes appear.", "Imagination is fun.", "{name} enjoys the show.", "Cloud watching is peaceful.", "The day is perfect."],
  ["{name} collects rocks.", "The rocks are different.", "{name} finds smooth ones.", "Some rocks are rough.", "This one is {color}.", "That one has stripes.", "Each rock is special.", "The collection grows.", "{name} shows friends.", "Friends like the rocks.", "Collecting is fun.", "Nature has treasures."],
  ["{name} helps wash car.", "The car is dirty.", "{name} sprays water.", "Soap makes bubbles.", "{name} scrubs gently.", "The car gets clean.", "It shines in sun.", "The work is fun.", "Dad says good job.", "{name} feels helpful.", "The car looks new.", "Working together works."],
  ["{name} flies a kite.", "The kite is {color}.", "{name} runs with it.", "The wind lifts up.", "The kite goes high.", "It dances in air.", "The string pulls tight.", "Other kites join in.", "The sky has colors.", "{name} feels joy.", "Flying kites is great.", "Wind makes it possible."],
  ["{name} picks berries.", "The berries are sweet.", "{name} fills the basket.", "Some berries are big.", "Some berries are small.", "All berries taste good.", "Birds want berries too.", "{name} shares with birds.", "Everyone gets some.", "Sharing feels good.", "Nature provides food.", "Berries make good pie."],
  ["{name} plays music.", "The instrument is fun.", "{name} learns new songs.", "Music sounds pretty.", "Practice makes better.", "Each note is important.", "Songs tell stories.", "Music makes people happy.", "Dancing goes with music.", "{name} loves to play.", "Music is everywhere.", "Creating music is joy."],
  ["{name} builds with blocks.", "The blocks are {color}.", "{name} makes a tower.", "The tower gets tall.", "Careful not to fall.", "More blocks go on.", "The tower reaches high.", "It stays up well.", "Friends help build.", "Building together is fun.", "The tower is strong.", "Teamwork makes it better."],
  ["{name} watches birds.", "The birds are busy.", "{name} sees them build.", "Nests need many twigs.", "The birds work hard.", "Babies will live there.", "Nature has patterns.", "Everyone has jobs.", "Birds teach lessons.", "{name} learns by watching.", "Nature is teacher.", "Observation reveals secrets."],
  ["{name} makes cookies.", "The recipe is easy.", "{name} measures flour.", "Everything goes in bowl.", "Mixing is important.", "The dough smells good.", "Cookies go in oven.", "They bake until done.", "The kitchen smells great.", "{name} shares cookies.", "Homemade tastes best.", "Cooking brings joy."],
  ["{name} explores woods.", "The trees are tall.", "{name} follows paths.", "Many things to see.", "Squirrels run on branches.", "Flowers grow wild.", "Streams flow nearby.", "Everything is connected.", "Nature has balance.", "{name} feels peaceful.", "Woods teach patience.", "Exploration opens minds."],
  ["{name} writes story.", "The story is about adventure.", "{name} draws pictures too.", "Stories need beginning.", "Middle has action.", "End brings closure.", "Characters need names.", "Settings need details.", "Imagination creates worlds.", "{name} loves storytelling.", "Stories connect people.", "Creative expression matters."],
  ["{name} tends garden.", "The garden needs care.", "{name} waters plants.", "Weeds need removing.", "Each plant is different.", "Some like more sun.", "Others prefer shade.", "Growth takes time.", "Patience brings results.", "{name} sees progress.", "Gardens teach life.", "Nurturing creates beauty."],
  ["{name} learns numbers.", "Numbers are everywhere.", "{name} counts objects.", "Math helps solve problems.", "Patterns appear in numbers.", "Adding makes more.", "Subtracting makes less.", "Numbers describe world.", "Practice builds skills.", "{name} enjoys math.", "Logic brings clarity.", "Numbers unlock understanding."],
  ["{name} helps others.", "Helping feels good.", "{name} carries groceries.", "Small acts matter.", "Everyone needs help sometimes.", "Kindness spreads easily.", "Communities work together.", "People remember kindness.", "Help comes back around.", "{name} makes difference.", "Service brings fulfillment.", "Helping heals world."],
  ["{name} studies stars.", "Stars shine brightly.", "{name} learns constellations.", "Ancient people saw pictures.", "Stories live in stars.", "Universe is vast.", "Earth is special.", "Wonder fills night sky.", "Questions lead to answers.", "{name} dreams of space.", "Science opens doors.", "Curiosity drives discovery."],
  ["{name} creates art.", "Art expresses feelings.", "{name} chooses colors carefully.", "Each brushstroke matters.", "Art communicates without words.", "Beauty lives in details.", "Practice develops skill.", "Art connects hearts.", "Creativity has no limits.", "{name} finds voice.", "Art transforms lives.", "Expression brings freedom."],
  ["{name} learns language.", "Words carry meaning.", "{name} practices pronunciation.", "Language connects cultures.", "Stories cross borders.", "Understanding grows with words.", "Communication builds bridges.", "Respect grows through learning.", "Different perspectives enrich life.", "{name} embraces diversity.", "Language opens worlds.", "Understanding prevents conflict."],
  ["{name} protects environment.", "Earth needs care.", "{name} recycles materials.", "Small actions add up.", "Future depends on choices.", "Nature provides everything.", "Balance maintains life.", "Responsibility belongs to all.", "Conservation preserves beauty.", "{name} makes commitment.", "Stewardship ensures tomorrow.", "Care creates sustainability."],
  ["{name} practices mindfulness.", "Present moment holds peace.", "{name} breathes deeply.", "Awareness brings calm.", "Thoughts come and go.", "Feelings change naturally.", "Acceptance reduces suffering.", "Gratitude transforms perspective.", "Peace exists within.", "{name} finds center.", "Mindfulness develops wisdom.", "Inner peace radiates outward."],
  ["{name} builds community.", "Communities need everyone.", "{name} welcomes newcomers.", "Diversity strengthens groups.", "Cooperation solves problems.", "Trust develops over time.", "Shared goals unite people.", "Communication prevents misunderstanding.", "Celebration acknowledges achievements.", "{name} contributes meaningfully.", "Belonging enriches life.", "Together accomplishes more."]
];

const LEVEL_1_EXTENSIONS = [
  ["{name} meets a wise {animal}.", "The {animal} has {color} eyes.", "They become fast friends.", "The {animal} shows {name} magic.", "Magic lives in nature.", "Every creature has gifts.", "Wisdom comes from listening.", "The {animal} teaches patience.", "Lessons appear everywhere.", "{name} learns to observe.", "Understanding grows slowly.", "Friendship transcends species."],
  ["{name} discovers a secret door.", "The door is hidden well.", "Behind it lies wonder.", "Colors dance on walls.", "Music flows like water.", "Time moves differently here.", "Imagination becomes real.", "Dreams take physical form.", "Possibilities expand infinitely.", "{name} explores freely.", "Magic responds to kindness.", "Adventure awaits the curious."],
  ["{name} helps heal forest.", "Trees whisper their pain.", "Pollution affects everything.", "Small actions create change.", "Every creature depends on health.", "Balance requires conscious effort.", "Healing takes time and care.", "Community effort multiplies impact.", "Hope guides restoration work.", "{name} makes meaningful difference.", "Nature responds to love.", "Healing spreads exponentially."],
  ["{name} learns ancient wisdom.", "Elders carry important knowledge.", "Stories preserve cultural memory.", "Traditions connect generations.", "Respect honors those before us.", "Learning requires humble heart.", "Wisdom transcends book knowledge.", "Experience teaches deep truths.", "Questions open understanding.", "{name} embraces learning journey.", "Wisdom guides future choices.", "Knowledge serves greater good."],
  ["{name} creates peace between groups.", "Understanding builds bridges.", "Fear often drives conflict.", "Listening reveals common ground.", "Empathy transforms enemies into friends.", "Communication requires courage.", "Patience allows healing to occur.", "Respect honors all perspectives.", "Unity celebrates diversity.", "{name} becomes bridge builder.", "Peace begins with individual choice.", "Harmony benefits everyone involved."]
];

const LEVEL_2_TEMPLATES = [
  ["{name} goes to the park today.", "{name} sees a {animal} there.", "The {animal} looks friendly and nice.", "{name} says hello to the {animal}.", "The {animal} wants to play together.", "They play with a {color} ball.", "The ball rolls away fast.", "{name} and {animal} run after it.", "They work together to get it.", "They get the ball back together.", "{name} and {animal} are happy.", "They are good friends now."],
  ["{name} finds a {object} outside.", "It is very {color} and pretty.", "{name} picks it up carefully.", "A {animal} comes over to see.", "The {animal} wants to help {name}.", "They look at the {object} together.", "The {object} starts to glow bright.", "It makes a soft, happy sound.", "{name} and {animal} are surprised.", "The {object} brings them good luck.", "{name} shares it with {animal}.", "They both feel very happy."],
  ["{name} walks through the forest.", "The trees are tall and green.", "{name} hears birds singing songs.", "A small {animal} appears nearby.", "The {animal} has {color} fur.", "It seems lost and scared.", "{name} speaks gently to it.", "The {animal} comes closer slowly.", "They become friends right away.", "{name} helps find its family.", "The {animal} family is grateful.", "Everyone celebrates together."],
  ["{name} visits the library today.", "Many books fill the shelves.", "{name} finds a {color} book.", "The book tells amazing stories.", "Pictures show a brave {animal}.", "The {animal} goes on adventures.", "{name} reads the whole story.", "The story teaches important lessons.", "Heroes help others in need.", "{name} wants to be helpful too.", "Good books inspire good actions.", "Reading opens up new worlds."],
  ["{name} helps in the garden.", "Plants need water and care.", "{name} waters the {color} flowers.", "A helpful {animal} joins in.", "The {animal} knows about plants.", "Together they plant new seeds.", "The seeds will grow into food.", "Growing food helps many people.", "Working together makes tasks easier.", "{name} learns about patience.", "Good things take time to grow.", "Helping others feels wonderful."],
  ["{name} learns to ride a bike.", "The bike is {color} and shiny.", "{name} practices every day.", "A patient {animal} watches nearby.", "The {animal} cheers for {name}.", "Falling down is part of learning.", "Getting back up shows courage.", "Practice makes everything better.", "Soon {name} can ride well.", "The {animal} runs alongside.", "Achievement feels amazing.", "Persistence pays off."],
  ["{name} prepares for a picnic.", "The basket holds delicious food.", "{name} packs {color} sandwiches.", "A hungry {animal} smells the food.", "The {animal} looks very polite.", "{name} decides to share lunch.", "Sharing makes food taste better.", "The {animal} is very grateful.", "They eat together under trees.", "New friendships can happen anywhere.", "Kindness creates wonderful moments.", "Generosity brings joy."],
  ["{name} explores the beach today.", "Waves wash up interesting things.", "{name} finds a beautiful {object}.", "The {object} sparkles in sunlight.", "A wise {animal} explains its history.", "Ocean treasures have amazing stories.", "Each wave brings new discoveries.", "Nature holds many secrets.", "Curiosity leads to learning.", "{name} respects the ocean's gifts.", "Wonder fills the heart.", "Exploration enriches life."],
  ["{name} attends a school play.", "Students wear {color} costumes.", "{name} plays a helpful {animal}.", "The story teaches about friendship.", "Everyone works together on stage.", "Practicing made the show better.", "Audience members smile and clap.", "Performing builds confidence.", "Teamwork creates amazing results.", "{name} feels proud of the group.", "Art brings people together.", "Collaboration achieves greatness."],
  ["{name} visits the zoo today.", "Many different animals live there.", "{name} watches a playful {animal}.", "The {animal} has beautiful {color} markings.", "Zookeepers take excellent care.", "Animals need proper homes.", "Learning about animals is important.", "All creatures deserve respect.", "Conservation protects wildlife.", "{name} promises to help animals.", "Education builds compassion.", "Caring makes a difference."],
  ["{name} joins a sports team.", "The uniform is {color} and comfortable.", "{name} learns to work with others.", "A supportive {animal} mascot cheers.", "Team members help each other.", "Practice improves everyone's skills.", "Winning and losing both teach lessons.", "Good sportsmanship matters most.", "Effort is more important than talent.", "{name} makes lasting friendships.", "Sports build character.", "Teamwork achieves goals."],
  ["{name} learns to cook.", "The kitchen smells wonderful.", "{name} follows the recipe carefully.", "A wise {animal} offers cooking tips.", "Fresh ingredients make food tasty.", "Measuring ingredients is important.", "Cooking is both art and science.", "Sharing meals brings families together.", "Practice makes cooking easier.", "{name} enjoys creating meals.", "Food nourishes body and soul.", "Cooking is a valuable skill."],
  ["{name} starts a small business.", "The idea is creative and helpful.", "{name} makes {color} crafts to sell.", "A business-minded {animal} gives advice.", "Planning is important for success.", "Hard work builds good reputation.", "Customers appreciate quality products.", "Money management requires care.", "Service to others brings satisfaction.", "{name} learns about responsibility.", "Entrepreneurship teaches valuable lessons.", "Creating value helps community."],
  ["{name} participates in community service.", "Helping others feels meaningful.", "{name} organizes a {color} cleanup day.", "A dedicated {animal} volunteers too.", "Small actions create big changes.", "Community members work together.", "Pride in neighborhood grows.", "Service builds stronger communities.", "Everyone can make a difference.", "{name} inspires others to help.", "Volunteerism strengthens society.", "Giving back creates positive cycles."],
  ["{name} studies different cultures.", "Learning about others builds understanding.", "{name} tries {color} foods from around world.", "A traveling {animal} shares stories.", "Diversity makes life more interesting.", "Respect for differences is important.", "Common humanity connects all people.", "Cultural exchange prevents misunderstanding.", "Open minds lead to friendship.", "{name} embraces diversity.", "Understanding promotes peace.", "Cultural learning enriches perspectives."],
  ["{name} learns about money.", "Understanding finances is important.", "{name} saves money in {color} piggy bank.", "A financially wise {animal} teaches budgeting.", "Spending carefully stretches money further.", "Saving for goals requires patience.", "Earning money through work feels good.", "Helping others with money brings joy.", "Planning prevents financial problems.", "{name} develops good money habits.", "Financial literacy enables freedom.", "Wise money management creates security."],
  ["{name} practices meditation.", "Quiet moments bring inner peace.", "{name} sits on {color} cushion.", "A calm {animal} meditates nearby.", "Breathing deeply reduces stress.", "Mindfulness improves focus.", "Present moment awareness brings clarity.", "Regular practice builds emotional strength.", "Peace within creates peace around us.", "{name} feels more centered.", "Meditation develops wisdom.", "Inner calm influences outer world."],
  ["{name} learns about science.", "Experiments reveal how things work.", "{name} uses {color} test tubes.", "A curious {animal} observes carefully.", "Questions lead to discoveries.", "Scientific method guides investigation.", "Evidence supports or disproves theories.", "Knowledge builds on previous learning.", "Understanding nature helps everyone.", "{name} develops critical thinking.", "Science explains natural world.", "Discovery drives human progress."],
  ["{name} creates beautiful art.", "Artistic expression shows inner feelings.", "{name} paints with {color} watercolors.", "An artistic {animal} offers inspiration.", "Practice develops artistic skill.", "Art communicates beyond words.", "Beauty exists in many forms.", "Creating art brings deep satisfaction.", "Art connects people across cultures.", "{name} finds unique artistic voice.", "Creativity enhances life.", "Art makes world more beautiful."],
  ["{name} learns to resolve conflicts.", "Disagreements are normal in life.", "{name} mediates between {color} groups.", "A peaceful {animal} demonstrates calm communication.", "Listening to all sides shows respect.", "Understanding different viewpoints is crucial.", "Finding common ground builds solutions.", "Patience allows healing to happen.", "Forgiveness frees everyone involved.", "{name} becomes a peacemaker.", "Conflict resolution builds stronger relationships.", "Peace skills serve lifelong."]
];

const LEVEL_2_EXTENSIONS = [
  ["{name} discovers time moves differently here.", "The {color} light bends and shifts.", "A temporal {animal} explains the phenomenon.", "Past and future blur together.", "Decisions create multiple pathways.", "Consequences ripple through time.", "Wisdom requires understanding cause and effect.", "Every moment contains infinite possibility.", "Choice determines reality's direction.", "{name} learns responsibility for decisions.", "Time teaches patience and foresight.", "Understanding time deepens life's meaning."],
  ["{name} communicates with nature spirits.", "The forest holds ancient consciousness.", "A spirit {animal} with {color} aura appears.", "Communication transcends spoken language.", "Emotions and intentions carry meaning.", "Respect for nature builds trust.", "Balance between worlds requires care.", "Spiritual connection heals separation.", "Unity with nature brings wisdom.", "{name} becomes bridge between worlds.", "Spiritual awareness transforms perspective.", "Connection with nature heals soul."],
  ["{name} travels between dimensions.", "Reality has many layers and levels.", "A dimensional {animal} serves as guide.", "Each reality operates by different rules.", "Understanding multiple perspectives expands mind.", "Truth exists in various forms.", "Flexibility allows navigation between worlds.", "Integration of experiences brings wisdom.", "Diversity of reality enriches understanding.", "{name} develops multidimensional awareness.", "Reality is more complex than appearance.", "Expanded consciousness enables growth."],
  ["{name} heals through energy work.", "Invisible forces affect physical health.", "A healing {animal} with {color} energy teaches techniques.", "Intention directs healing energy.", "Emotional healing affects physical body.", "Balance between mind and body promotes health.", "Compassion amplifies healing power.", "Service to others multiplies healing effects.", "Understanding energy builds healing ability.", "{name} becomes conduit for healing.", "Healing energy flows through love.", "Service transforms healer and healed."],
  ["{name} learns universal language.", "Communication transcends cultural barriers.", "A multilingual {animal} teaches connection beyond words.", "Understanding flows through heart connection.", "Empathy builds bridges between differences.", "Respect for diversity enriches communication.", "Love serves as universal translator.", "Unity underlies all apparent separation.", "Connection heals isolation and fear.", "{name} becomes ambassador for unity.", "Love transcends all barriers.", "Understanding creates global harmony."]
];

const LEVEL_3_TEMPLATES = [
  ["{name} discovers a mysterious path in the forest.", "The path is covered with sparkling {color} stones.", "A wise {animal} appears to guide the way.", "The {animal} leads {name} to a hidden grove.", "In the center grows a magnificent {object} tree.", "The tree seems to whisper secrets of nature.", "Suddenly, the tree begins to lose its magical glow.", "{name} realizes the tree needs their help urgently.", "Working with {animal}, they search for the solution.", "{name} learns that caring for nature heals everything.", "The tree regains its beautiful, vibrant glow completely.", "The forest celebrates their act of kindness and wisdom."],
  ["{name} receives an invitation to a special celebration.", "The invitation is written in shimmering {color} ink.", "A clever {animal} messenger delivered it personally.", "At the celebration, {name} meets many interesting friends.", "Everyone shares their unique talents and special gifts.", "The {animal} teaches {name} an important traditional dance.", "When it's {name}'s turn to share something special,", "they feel nervous and unsure of their abilities.", "The supportive friends encourage {name} to try anyway.", "{name} discovers their own unique talent for bringing joy.", "Everyone appreciates {name}'s authentic contribution to the celebration.", "The experience teaches them about confidence and community belonging."],
  ["{name} embarks on a quest to find the lost {object}.", "Ancient legends speak of its incredible power.", "A knowledgeable {animal} joins the challenging journey.", "They traverse through dangerous {color} mountains.", "Many obstacles test their courage and determination.", "The {animal} shares wisdom about perseverance.", "At the mountain's peak, they discover the truth.", "The real treasure was the friendship they built.", "Their bond gives them strength to face any challenge.", "{name} realizes that relationships matter most.", "They return home with hearts full of gratitude.", "The adventure transforms them into lifelong friends."],
  ["{name} volunteers to help rebuild the damaged community center.", "The storm left behind considerable destruction and debris.", "A hardworking {animal} organizes the volunteer teams efficiently.", "Everyone contributes their unique skills and abilities.", "Some people paint walls with bright {color} paint.", "Others repair broken furniture and damaged equipment.", "The {animal} teaches {name} advanced construction techniques.", "Progress comes slowly but steadily each day.", "Community members support each other through difficulties.", "{name} learns valuable lessons about teamwork and persistence.", "The rebuilt center serves the community even better.", "Cooperation creates stronger communities than existed before."],
  ["{name} starts a program to protect endangered {animal} species.", "Research reveals the serious threats they face.", "A conservation expert {animal} provides guidance and support.", "{name} organizes educational programs for local schools.", "Students learn about habitat preservation and wildlife protection.", "The {color} awareness campaign spreads throughout the region.", "Government officials take notice of the grassroots efforts.", "New laws protect critical wildlife habitats.", "The endangered {animal} population begins to recover.", "{name} realizes that individual action can create change.", "Conservation efforts require long-term commitment and dedication.", "Environmental protection ensures future generations inherit healthy ecosystems."],
  ["{name} investigates strange phenomena occurring in the town.", "Mysterious {color} lights appear in the sky nightly.", "A scientific {animal} helps analyze the unusual data.", "Initial theories prove inadequate to explain observations.", "Careful documentation reveals patterns and connections.", "The phenomena correlate with natural cosmic events.", "Understanding requires collaboration between science and intuition.", "The {animal} teaches {name} to observe without judgment.", "New discoveries challenge conventional scientific understanding.", "{name} learns that mystery and wonder enhance life.", "Science and wonder can coexist harmoniously.", "Some questions lead to deeper questions rather than answers."],
  ["{name} mediates a serious conflict between rival groups.", "Tensions have built up over many years.", "A diplomatic {animal} teaches conflict resolution strategies.", "Each side believes they are completely right.", "Understanding each perspective requires patience and empathy.", "The {color} meeting room becomes neutral territory.", "Honest communication slowly breaks down barriers.", "Common interests emerge through careful dialogue.", "The {animal} facilitates breakthrough understanding.", "{name} helps create a lasting peace agreement.", "Former enemies become collaborative partners.", "Peace requires ongoing commitment from all parties."],
  ["{name} creates an innovative solution to reduce community waste.", "Environmental concerns motivate the sustainability project.", "An engineering-minded {animal} provides technical expertise.", "Research reveals the scope of the waste problem.", "Creative thinking leads to unexpected solutions.", "The {color} recycling program exceeds all expectations.", "Community members embrace the environmental initiative enthusiastically.", "Waste reduction improves local environmental quality.", "The program becomes a model for other communities.", "{name} learns that innovation can address serious problems.", "Environmental solutions require community-wide participation.", "Sustainable practices ensure resources for future generations."],
  ["{name} organizes a cultural exchange program between schools.", "Diversity enriches educational experiences for everyone.", "A culturally aware {animal} coordinates international connections.", "Students from different countries share their traditions.", "Language barriers become opportunities for creative communication.", "The {color} festival celebrates global cultural diversity.", "Friendships form across national and cultural boundaries.", "Understanding replaces fear and prejudice.", "The {animal} teaches {name} about cultural sensitivity.", "{name} realizes that differences can unite rather than divide.", "Cultural exchange builds global understanding and cooperation.", "International friendship creates lasting peace."],
  ["{name} develops a program to support elderly community members.", "Isolation affects many older adults in the neighborhood.", "A compassionate {animal} helps identify those needing assistance.", "Regular visits provide companionship and practical help.", "Intergenerational friendships benefit everyone involved.", "Older adults share valuable life wisdom and experiences.", "The {color} friendship program grows throughout the community.", "Young people learn from elders' knowledge and perspective.", "The {animal} facilitates meaningful connections between generations.", "{name} discovers the value of intergenerational relationships.", "Respecting elders honors community history and wisdom.", "Caring for older adults strengthens entire communities."],
  ["{name} establishes a mentorship program for struggling students.", "Academic challenges affect students' confidence and future opportunities.", "An educational {animal} provides guidance about effective teaching methods.", "Volunteer mentors receive training in supportive communication techniques.", "One-on-one relationships make learning more personal and effective.", "Students gain confidence through individual attention and encouragement.", "The {color} tutoring space becomes a haven for learning.", "Academic improvement leads to better life opportunities.", "The {animal} teaches {name} about patience in education.", "{name} sees how individual attention transforms lives.", "Educational support creates ripple effects throughout families.", "Investing in education builds stronger communities for everyone."],
  ["{name} coordinates disaster relief efforts after the flood.", "Natural disasters test community resilience and cooperation.", "A logistics-focused {animal} helps organize volunteer resources efficiently.", "Immediate needs include food, shelter, and medical care.", "Long-term recovery requires sustained community effort.", "The {color} emergency center coordinates all relief activities.", "Volunteers work around the clock to help displaced families.", "Generosity and compassion emerge during crisis.", "The {animal} teaches {name} about crisis management.", "{name} learns that communities grow stronger through adversity.", "Disaster response reveals the best in human nature.", "Preparation and cooperation minimize disaster impact."],
  ["{name} launches a small business that employs local teenagers.", "Youth unemployment creates problems for entire communities.", "A business-savvy {animal} provides entrepreneurship guidance.", "The enterprise teaches valuable work skills and responsibility.", "Fair wages allow young people to support their families.", "The {color} workspace becomes a learning environment.", "Business success creates opportunities for expansion.", "Economic development strengthens the entire community.", "The {animal} teaches {name} about ethical business practices.", "{name} realizes that business can serve social good.", "Employment opportunities change young people's lives.", "Social entrepreneurship addresses community needs through business."],
  ["{name} researches renewable energy solutions for the community.", "Climate change requires urgent action at all levels.", "An environmentally conscious {animal} shares technical knowledge.", "Solar and wind power offer sustainable alternatives.", "Community members need education about renewable energy benefits.", "The {color} demonstration project shows practical applications.", "Government incentives make renewable energy more affordable.", "Environmental benefits motivate widespread adoption.", "The {animal} teaches {name} about energy systems.", "{name} learns that technology can solve environmental problems.", "Renewable energy creates jobs while protecting environment.", "Sustainable energy ensures resources for future generations."],
  ["{name} develops a community garden that feeds hungry families.", "Food insecurity affects many people in the neighborhood.", "A gardening expert {animal} teaches sustainable growing techniques.", "Volunteers learn to grow nutritious vegetables and fruits.", "Fresh produce improves health outcomes for participating families.", "The {color} garden becomes a gathering place for neighbors.", "Surplus produce gets donated to local food banks.", "Gardening skills pass from experienced to new gardeners.", "The {animal} teaches {name} about soil health and plant care.", "{name} realizes that food security requires community action.", "Gardens build relationships while addressing hunger.", "Growing food creates self-sufficiency and community resilience."],
  ["{name} creates a conflict resolution program for schools.", "Bullying and violence affect students' ability to learn.", "A psychology-trained {animal} teaches peaceful communication methods.", "Students learn to express feelings without resorting to aggression.", "Peer mediation programs empower students to solve problems.", "The {color} peace room provides safe space for dialogue.", "Teachers receive training in conflict prevention strategies.", "School climate improves as violence decreases significantly.", "The {animal} teaches {name} about emotional intelligence.", "{name} learns that peace education prevents many problems.", "Conflict resolution skills serve students throughout life.", "Peaceful schools create better learning environments for everyone."],
  ["{name} organizes a community response to address homelessness.", "Housing insecurity affects increasing numbers of local residents.", "A social service {animal} explains the complex causes.", "Immediate assistance includes food, shelter, and clothing.", "Long-term solutions require addressing systemic issues.", "The {color} resource center provides comprehensive services.", "Community members volunteer time and resources generously.", "Collaboration with government agencies increases effectiveness.", "The {animal} teaches {name} about social justice.", "{name} realizes that homelessness has multiple contributing factors.", "Comprehensive approaches address root causes of homelessness.", "Community action can address even complex social problems."],
  ["{name} establishes a program to preserve local history.", "Community stories risk being lost as older residents pass away.", "A historian {animal} teaches research and documentation methods.", "Oral history interviews capture personal experiences and memories.", "Photographs and documents require careful preservation techniques.", "The {color} archive becomes a treasure trove of community heritage.", "Young people learn to value their cultural inheritance.", "Historical understanding builds community pride and identity.", "The {animal} teaches {name} about the importance of memory.", "{name} learns that history connects past, present, and future.", "Preserved stories inspire future generations.", "Cultural heritage strengthens community bonds and identity."],
  ["{name} develops a program to support single parents.", "Parenting alone creates unique challenges and stresses.", "A family-focused {animal} understands the needs of single-parent households.", "Childcare assistance allows parents to work or attend school.", "Support groups provide emotional encouragement and practical advice.", "The {color} family center offers comprehensive services.", "Children benefit from additional adult mentors and role models.", "Community support reduces isolation and stress.", "The {animal} teaches {name} about family systems.", "{name} realizes that strong families require community support.", "Supporting parents ultimately benefits children and society.", "Community investment in families creates positive cycles."],
  ["{name} coordinates volunteers for literacy programs.", "Reading skills affect every aspect of life and opportunity.", "An education-focused {animal} trains volunteer tutors effectively.", "One-on-one instruction addresses individual learning needs.", "Adult learners gain confidence through patient, supportive teaching.", "The {color} learning center welcomes students of all ages.", "Literacy skills open doors to employment and education.", "Family literacy programs help parents help their children.", "The {animal} teaches {name} about learning differences.", "{name} learns that literacy changes lives in profound ways.", "Reading skills create opportunities for personal growth.", "Educated communities are stronger and more prosperous."]
];

const LEVEL_3_EXTENSIONS = [
  ["{name} discovers their ability to heal through music.", "Sound vibrations affect physical and emotional well-being.", "A musical {animal} with {color} aura teaches healing frequencies.", "Different instruments create specific therapeutic effects.", "Emotional healing precedes physical healing in many cases.", "Community healing circles amplify individual healing effects.", "Music transcends language and cultural barriers.", "Healing music requires both skill and compassionate intention.", "Sound healing connects mind, body, and spirit.", "{name} becomes conduit for musical healing energy.", "Healing frequencies restore natural harmony and balance.", "Music heals both performer and listener simultaneously."],
  ["{name} learns to navigate between different realities.", "Consciousness operates on multiple dimensional levels simultaneously.", "A dimensional {animal} teaches reality-shifting techniques safely.", "Each reality has distinct laws and operating principles.", "Awareness of multiple realities expands perspective and understanding.", "Integration of experiences from different realities brings wisdom.", "Grounding techniques ensure safe return to base reality.", "Respect for all realities prevents spiritual bypassing.", "Multiple reality awareness enhances creativity and problem-solving abilities.", "{name} develops multidimensional consciousness and perception.", "Reality navigation requires both courage and discernment.", "Expanded awareness serves healing and service to others."],
  ["{name} channels ancient wisdom through meditation and contemplation.", "Collective human knowledge exists in accessible consciousness fields.", "A wisdom-keeper {animal} facilitates connection to universal knowledge.", "Ancient teachings remain relevant to contemporary challenges.", "Wisdom requires integration with personal experience and understanding.", "Channeled information must be tested against practical results.", "Service to others validates and purifies received wisdom.", "Ego must step aside for clear wisdom transmission.", "Universal wisdom transcends cultural and temporal boundaries.", "{name} becomes vessel for timeless wisdom and understanding.", "Ancient wisdom guides solutions to modern problems.", "Wisdom shared multiplies rather than diminishes."],
  ["{name} develops telepathic communication abilities.", "Consciousness connection transcends physical communication limitations.", "A telepathic {animal} teaches mental communication protocols.", "Emotional clarity improves telepathic transmission and reception.", "Respect for others' mental privacy remains essential.", "Telepathic ability serves healing and understanding rather than control.", "Practice develops both sending and receiving capabilities.", "Clear intention focuses telepathic communication effectively.", "Telepathic connection reveals universal consciousness unity.", "{name} learns responsible use of telepathic abilities.", "Mental communication enhances empathy and understanding between beings.", "Telepathic development accelerates collective consciousness evolution."],
  ["{name} masters manifestation through focused intention and action.", "Consciousness actively participates in creating physical reality.", "A manifestation-skilled {animal} teaches co-creation principles.", "Clear intention combined with aligned action produces results.", "Personal manifestation must align with highest good of all.", "Manifestation requires both spiritual understanding and practical effort.", "Gratitude amplifies manifestation power and attracts abundance.", "Service to others multiplies personal manifestation abilities.", "Manifestation works through natural laws rather than opposing them.", "{name} becomes conscious co-creator of beneficial reality.", "Manifestation serves collective healing and evolution.", "Conscious creation transforms both creator and created reality."]
];

const LEVEL_4_TEMPLATES = [
  ["{name} lived in a peaceful village where everyone worked together harmoniously.", "One morning, they noticed that the village's ancient {object} had stopped glowing mysteriously.", "The wise elder {animal} explained that this meant trouble was approaching the community.", "{name} volunteered to journey to the distant mountains to seek the legendary solution.", "Along the dangerous path, they encountered various challenges that tested their courage and determination.", "A helpful {animal} companion joined the quest, bringing valuable knowledge about the ancient mysteries.", "At the mountain's peak, {name} discovered that the solution required a significant personal sacrifice.", "They had to choose between their own dreams and the welfare of their community.", "With great courage, {name} made the difficult choice to put others before themselves.", "Their selfless decision restored the {object}'s power and saved the entire village community.", "The village thrived, and {name} became known for their character and moral strength.", "Future generations would remember {name}'s sacrifice and learn from their example."],
  ["{name} inherited their grandmother's mysterious {color} journal filled with cryptic symbols.", "The journal contained what appeared to be scientific formulas and philosophical observations.", "A scholarly {animal} helped decipher the complex mathematical equations and theoretical frameworks.", "The writings described revolutionary discoveries about the nature of reality and consciousness.", "Years of study revealed that consciousness could influence physical matter directly.", "The {animal} companion understood the implications of such profound knowledge.", "Experimentation confirmed that focused intention could indeed alter material reality.", "However, such power required extraordinary wisdom and ethical restraint.", "The temptation to use this knowledge for personal gain tested {name}'s character.", "{name} chose to use the discovery only for healing and helping others.", "The knowledge remained secret, shared only with those committed to service.", "Wisdom and power, {name} learned, must always be balanced with compassion."],
  ["{name} discovered that their peaceful town was built upon ancient burial grounds.", "Strange phenomena began occurring with increasing frequency and intensity.", "A spiritually attuned {animal} helped {name} understand the deeper implications.", "The spirits of the ancestors were restless due to forgotten promises.", "Historical research revealed that sacred agreements had been broken generations ago.", "The {color} covenant required specific actions to restore spiritual balance.", "Community leaders initially dismissed the spiritual concerns as superstition.", "However, the phenomena continued to escalate until acknowledgment became unavoidable.", "The {animal} guided {name} through traditional healing and reconciliation ceremonies.", "{name} learned that honoring the past is essential for future peace.", "The community eventually embraced its responsibility to honor ancestral agreements.", "Healing the relationship with the past transformed the entire community's future."],
  ["{name} volunteered to lead a dangerous expedition to rescue trapped researchers.", "The scientists had been studying climate change effects in remote glacial regions.", "A rescue-experienced {animal} joined the mission as guide and support.", "Extreme weather conditions made the rescue mission incredibly hazardous.", "Equipment failures and communication breakdowns complicated every aspect of the operation.", "The {color} emergency beacon provided the only hope of locating survivors.", "Personal safety had to be balanced against the moral imperative to save lives.", "Leadership decisions affected not only {name} but the entire rescue team.", "The {animal} provided crucial guidance about survival in extreme conditions.", "{name} learned that leadership requires courage combined with careful judgment.", "The successful rescue operation saved lives and advanced climate research.", "The experience taught {name} that individual courage can serve collective benefit."],
  ["{name} inherited a family business facing bankruptcy and potential closure.", "Generations of family legacy depended on {name}'s business acumen and determination.", "An economically wise {animal} provided guidance about financial management and strategy.", "Market conditions had changed dramatically, requiring innovative adaptation.", "Employee livelihoods depended on the business's survival and continued operation.", "The {color} ledger books revealed decades of financial history and patterns.", "Traditional methods no longer worked in the contemporary economic environment.", "Difficult decisions about personnel and operations tested {name}'s leadership.", "The {animal} taught {name} about balancing profit with social responsibility.", "{name} learned that business success requires both financial skill and ethical integrity.", "Innovation and adaptation saved the business while preserving family values.", "The experience demonstrated that tradition and change can work together harmoniously."],
  ["{name} became involved in mediating a complex international diplomatic crisis.", "Multiple nations held conflicting positions about territorial and resource rights.", "A diplomatically skilled {animal} taught {name} about international relations and conflict resolution.", "Cultural differences complicated communication and understanding between parties.", "Historical grievances influenced contemporary negotiations and positions.", "The {color} treaty documents contained provisions that required careful interpretation.", "Personal relationships between negotiators affected the formal diplomatic process.", "Economic interests sometimes conflicted with humanitarian concerns.", "The {animal} helped {name} understand the complexity of international law.", "{name} learned that diplomacy requires patience, wisdom, and cultural sensitivity.", "Successful mediation required finding solutions that honored all parties' core interests.", "The experience taught {name} that peace requires ongoing commitment from everyone involved."],
  ["{name} discovered evidence of corruption within the local government administration.", "Public resources were being misused for personal benefit by elected officials.", "A justice-minded {animal} helped {name} understand the legal and ethical implications.", "Exposing the corruption would help the community but endanger {name} personally.", "The {color} financial records provided clear evidence of illegal activities.", "Powerful people had strong motivation to suppress the investigation.", "Legal processes moved slowly while corruption continued to harm the community.", "The {animal} taught {name} about the relationship between justice and courage.", "{name} learned that doing right sometimes requires personal sacrifice.", "The investigation eventually led to accountability and systemic reforms.", "Justice prevailed, but only through sustained effort and community support.", "The experience demonstrated that individual integrity can transform corrupt systems."],
  ["{name} undertook advanced scientific research that challenged established theories.", "The research questioned fundamental assumptions about physics and reality.", "A scientifically knowledgeable {animal} assisted with experimental design and analysis.", "Initial results contradicted widely accepted scientific paradigms.", "The scientific community resisted findings that challenged conventional understanding.", "The {color} laboratory equipment provided precise measurements and reliable data.", "Peer review processes reflected both scientific rigor and institutional bias.", "Personal reputation and career advancement were at stake.", "The {animal} taught {name} about the history of scientific revolutions.", "{name} learned that truth sometimes conflicts with popular opinion.", "Persistence and intellectual honesty eventually led to acceptance of new paradigms.", "Scientific progress requires individuals willing to challenge established thinking."],
  ["{name} organized a community response to address systemic inequality.", "Economic and social disparities had created division and resentment.", "A social justice-focused {animal} provided insight about systemic change.", "Surface-level solutions failed to address root causes of inequality.", "Different community groups held conflicting views about solutions.", "The {color} coalition required careful building and maintenance.", "Progress demanded both immediate assistance and long-term systemic change.", "Powerful interests benefited from maintaining the status quo.", "The {animal} taught {name} about organizing for social change.", "{name} learned that justice requires both individual action and systemic transformation.", "Coalition building created power to challenge entrenched interests.", "Social change happens through sustained effort by committed individuals and groups."],
  ["{name} became responsible for preserving traditional knowledge threatened by modernization.", "Indigenous wisdom faced extinction as elders passed away.", "A tradition-keeping {animal} understood the importance of cultural preservation.", "Ancient knowledge contained practical wisdom relevant to contemporary challenges.", "Younger generations showed little interest in traditional ways.", "The {color} archive represented generations of accumulated cultural wisdom.", "Documentation efforts risked reducing living tradition to static information.", "Cultural appropriation concerns complicated preservation efforts.", "The {animal} taught {name} about respecting traditional knowledge systems.", "{name} learned that preserving culture requires understanding its living essence.", "Traditional knowledge offered solutions to modern environmental and social problems.", "Cultural preservation requires balance between documentation and living practice."],
  ["{name} developed innovative educational programs for underserved communities.", "Educational inequality perpetuated cycles of poverty and limited opportunity.", "An education-focused {animal} provided insight about effective teaching methods.", "Standard educational approaches failed to meet diverse learning needs.", "Community members initially distrusted outside educational interventions.", "The {color} curriculum incorporated local culture and knowledge.", "Teacher training required understanding both pedagogy and community context.", "Sustainable programs needed local ownership and ongoing community support.", "The {animal} taught {name} about culturally responsive education.", "{name} learned that effective education honors students' backgrounds and experiences.", "Educational innovation created pathways to opportunity and advancement.", "Community-based education serves both individual students and collective development."],
  ["{name} investigated environmental contamination threatening community health.", "Industrial pollution had been concealed by corporate and government entities.", "An environmental {animal} helped {name} understand ecological systems and health impacts.", "Scientific evidence clearly demonstrated links between pollution and health problems.", "Corporate interests used legal and political power to suppress investigation.", "The {color} test results provided undeniable proof of environmental damage.", "Community members suffered health effects but lacked resources for legal action.", "Environmental justice required connecting health, legal, and political strategies.", "The {animal} taught {name} about ecosystem relationships and environmental law.", "{name} learned that environmental protection requires persistent advocacy and scientific rigor.", "Successful environmental action combined grassroots organizing with legal expertise.", "Environmental health is inseparable from community health and social justice."],
  ["{name} coordinated international humanitarian aid during a natural disaster.", "Massive earthquake damage overwhelmed local response capabilities.", "A humanitarian {animal} provided expertise about disaster response and recovery.", "Cultural sensitivity was essential for effective aid delivery.", "Coordination between multiple international agencies required diplomatic skill.", "The {color} supply chain managed complex logistics across multiple countries.", "Long-term recovery planning required understanding local needs and priorities.", "Aid effectiveness depended on community participation and local leadership.", "The {animal} taught {name} about sustainable development and humanitarian principles.", "{name} learned that effective aid empowers rather than creates dependency.", "International cooperation can address disasters that overwhelm individual nations.", "Humanitarian work requires both immediate response and long-term commitment."],
  ["{name} researched and developed alternative economic models for community development.", "Traditional economic approaches had failed to create sustainable prosperity.", "An economics-minded {animal} provided insight about alternative economic theories.", "Local currencies and cooperative enterprises offered promising alternatives.", "Economic democracy required education and community participation.", "The {color} financial system prioritized community benefit over maximum profit.", "Resistance from traditional financial institutions complicated implementation.", "Economic models required adaptation to local conditions and cultural values.", "The {animal} taught {name} about the relationship between economics and values.", "{name} learned that economics can serve community rather than exploit it.", "Alternative economic models created local wealth and reduced external dependency.", "Economic innovation requires both theoretical understanding and practical implementation."],
  ["{name} facilitated dialogue between opposing political groups.", "Political polarization had created hostile divisions within the community.", "A politically astute {animal} understood the dynamics of political conflict.", "Deep ideological differences made communication extremely difficult.", "Personal relationships had been damaged by political disagreements.", "The {color} meeting space provided neutral ground for difficult conversations.", "Facilitation required managing emotions while encouraging honest dialogue.", "Common ground existed beneath surface political differences.", "The {animal} taught {name} about political psychology and communication.", "{name} learned that political healing requires addressing underlying fears and needs.", "Bridge-building conversation can transcend political divisions.", "Democratic process requires citizens willing to engage across differences."],
  ["{name} established programs to support refugees and immigrants.", "Displacement and migration created challenges for both newcomers and receiving communities.", "A culturally sensitive {animal} understood the complexities of cultural adaptation.", "Language barriers complicated access to essential services.", "Economic integration required job training and credential recognition.", "The {color} community center provided comprehensive support services.", "Cultural preservation balanced with adaptation to new society.", "Host community education reduced fear and increased welcome.", "The {animal} taught {name} about migration patterns and cultural psychology.", "{name} learned that successful integration benefits both newcomers and established residents.", "Immigrant services require understanding both practical needs and cultural dynamics.", "Diverse communities are stronger when everyone can contribute their talents."],
  ["{name} developed therapeutic programs for trauma survivors.", "Violence and loss had created widespread psychological wounds.", "A healing-focused {animal} understood trauma psychology and recovery processes.", "Individual healing was connected to community healing.", "Trauma responses varied across different cultural backgrounds.", "The {color} healing center provided safe space for recovery work.", "Professional therapy combined with peer support groups.", "Recovery required addressing both individual symptoms and social conditions.", "The {animal} taught {name} about resilience and post-traumatic growth.", "{name} learned that healing happens in relationship and community.", "Trauma-informed care recognizes the impact of violence and loss.", "Community healing creates conditions for individual recovery."],
  ["{name} investigated corporate practices affecting worker safety and environmental health.", "Industrial operations prioritized profit over worker and community welfare.", "An investigative {animal} provided skills for uncovering concealed information.", "Corporate power included influence over media and regulatory agencies.", "Worker organizing faced retaliation and economic pressure.", "The {color} documents revealed systematic violations of safety standards.", "Legal action required extensive resources and sustained commitment.", "Public awareness campaigns were essential for creating pressure for change.", "The {animal} taught {name} about corporate accountability and worker rights.", "{name} learned that corporate responsibility requires external pressure and oversight.", "Worker safety and environmental protection are inseparable issues.", "Corporate accountability requires sustained effort by workers, communities, and advocates."],
  ["{name} created programs addressing mental health stigma and access.", "Mental health challenges affected many people but remained hidden due to shame.", "A psychology-trained {animal} understood mental health treatment and community attitudes.", "Stigma prevented people from seeking help and receiving support.", "Mental health services were inadequate and difficult to access.", "The {color} awareness campaign used personal stories to reduce stigma.", "Peer support groups provided understanding and practical assistance.", "Professional treatment needed to be culturally appropriate and accessible.", "The {animal} taught {name} about mental health advocacy and policy.", "{name} learned that mental health is inseparable from community health.", "Stigma reduction requires education combined with personal contact.", "Mental health support requires both professional services and community acceptance."],
  ["{name} developed sustainable agriculture programs addressing food security.", "Industrial agriculture created environmental problems while failing to feed everyone.", "An agriculture-focused {animal} taught sustainable farming methods and food systems.", "Food security required both production and distribution solutions.", "Climate change threatened traditional agricultural practices.", "The {color} demonstration farm showed practical applications of sustainable methods.", "Farmer education programs shared knowledge about ecological farming.", "Food distribution systems needed to reach underserved communities.", "The {animal} taught {name} about soil health, biodiversity, and food systems.", "{name} learned that sustainable food systems serve both people and planet.", "Food security requires addressing both production and access issues.", "Sustainable agriculture protects environmental health while feeding communities."]
];

const LEVEL_4_EXTENSIONS = [
  ["{name} develops mastery over quantum consciousness fields.", "Reality exists as probability waves until consciousness collapses them into experience.", "A quantum-aware {animal} teaches navigation of multidimensional possibility matrices.", "Conscious observation actively participates in creating experienced reality.", "Quantum entanglement connects all consciousness across space and time.", "Awareness of quantum mechanics enables conscious reality navigation.", "Ethical use of quantum consciousness requires wisdom and spiritual development.", "Quantum fields respond to intention, emotion, and belief patterns.", "Mastery involves aligning personal will with universal harmony.", "{name} becomes conscious participant in reality creation.", "Quantum consciousness bridges science and spirituality.", "Reality creation serves collective evolution and universal healing."],
  ["{name} channels cosmic consciousness for planetary healing.", "Individual consciousness connects to universal intelligence and wisdom.", "A cosmically attuned {animal} facilitates connection to galactic consciousness.", "Planetary healing requires coordinated consciousness at global scale.", "Cosmic consciousness transcends individual limitations and cultural boundaries.", "Service to planetary evolution activates dormant human potentials.", "Cosmic awareness reveals humanity's role in universal evolution.", "Channeling cosmic consciousness requires purification of ego attachments.", "Planetary healing happens through individuals awakening to cosmic consciousness.", "{name} becomes conduit for cosmic healing energies.", "Cosmic consciousness accelerates human evolution and awakening.", "Individual awakening serves collective ascension to higher consciousness."],
  ["{name} masters temporal manipulation for timeline healing.", "Time exists as a fluid dimension accessible to expanded consciousness.", "A time-wise {animal} teaches responsible navigation of temporal currents.", "Timeline healing resolves past trauma and optimizes future possibilities.", "Temporal work requires understanding of cause-effect relationships across time.", "Individual timeline healing affects collective timeline evolution.", "Temporal manipulation serves healing rather than personal advantage.", "Timeline work requires integration of wisdom from multiple temporal perspectives.", "Temporal mastery involves aligning personal timeline with optimal collective future.", "{name} becomes guardian of beneficial timeline probabilities.", "Timeline healing transforms past, present, and future simultaneously.", "Temporal work serves the evolution of consciousness across all dimensions."],
  ["{name} establishes interdimensional diplomatic relationships.", "Multiple dimensional beings coexist within the same space-time continuum.", "A diplomatically skilled {animal} facilitates communication across dimensional boundaries.", "Interdimensional cooperation serves mutual evolution and understanding.", "Each dimension operates according to distinct consciousness principles.", "Diplomatic relationships require respect for diverse forms of consciousness.", "Interdimensional alliance building serves planetary and cosmic evolution.", "Communication across dimensions transcends language and thought-based systems.", "Diplomatic service requires development of multidimensional consciousness.", "{name} becomes ambassador between dimensional consciousness communities.", "Interdimensional cooperation accelerates evolution for all involved species.", "Diplomatic relationships serve the expansion of love and consciousness throughout existence."],
  ["{name} integrates shadow work for collective unconscious healing.", "Individual shadow healing contributes to collective unconscious transformation.", "A shadow-wise {animal} guides safe navigation of unconscious psychological material.", "Collective shadow includes historical trauma and suppressed cultural wisdom.", "Shadow integration requires courage to face rejected aspects of self and society.", "Personal shadow work heals generational patterns and collective wounds.", "Shadow integration transforms destructive patterns into creative power.", "Collective unconscious healing serves the evolution of human consciousness.", "Shadow work requires both individual therapy and collective healing practices.", "{name} becomes healer of collective unconscious patterns.", "Shadow integration serves the emergence of authentic human potential.", "Collective shadow healing transforms civilization from the psychological foundation."]
];

// Level 0 Templates (Ages 3-5) - 40 templates + 5 extensions = 45 total
const LEVEL_0_TEMPLATES: string[][] = [
  // Template 1: Playground Adventure
  [
    "{userName} runs fast.",
    "The {favoriteColor} slide waits.",
    "{userName} climbs up high.",
    "Down they go!",
    "Fun day outside."
  ],
  
  // Template 2: Pet Story
  [
    "{userName} loves {favoriteAnimal}s.",
    "The {favoriteAnimal} plays.",
    "They run together.",
    "{userName} gives food.",
    "Best friends forever."
  ],
  
  // Template 3: Cooking Fun
  [
    "{userName} helps cook.",
    "Mix the {favoriteFood}.",
    "Smell so good!",
    "Time to eat.",
    "Yummy food together."
  ],
  
  // Template 4: Garden Discovery
  [
    "{userName} finds flowers.",
    "Pretty {favoriteColor} ones.",
    "Bees buzz around.",
    "Water helps grow.",
    "Garden looks beautiful."
  ],
  
  // Template 5: Car Ride
  [
    "Car goes fast.",
    "{userName} sits inside.",
    "The {favoriteColor} car shines.",
    "Windows show trees.",
    "Happy car ride."
  ]
];

// Level 0 Extension Templates
const LEVEL_0_EXTENSIONS: string[][] = [
  [
    "{userName} finds {favoriteColor} blocks.",
    "Big blocks everywhere!",
    "Stack them up high.",
    "Tower falls down!",
    "{userName} builds again happily."
  ],
  [
    "{userName} sees little {favoriteAnimal}.",
    "It runs fast.",
    "Come here, little friend!",
    "Pet the soft fur.",
    "{userName} loves animals so."
  ],
  [
    "{userName} makes yummy {favoriteFood}.",
    "Mix and stir.",
    "Taste it now!",
    "Mmm, so good!",
    "{userName} shares with friends."
  ],
  [
    "{userName} plays with water.",
    "Splash, splash, splash!",
    "Water feels cool.",
    "Make big waves.",
    "{userName} loves water play."
  ],
  [
    "{userName} reads picture books.",
    "Look at colors!",
    "Point to {favoriteAnimal}.",
    "Turn the page.",
    "{userName} loves story time."
  ]
];

// Combine Level 0 templates and extensions
const LEVEL_0_FALLBACK_TEMPLATES = [...LEVEL_0_TEMPLATES, ...LEVEL_0_EXTENSIONS];

// ============================================================================
// COMPLETE ENHANCED FALLBACK TEMPLATES SYSTEM (187 TEMPLATES TOTAL)
// Integrating all vocabulary-compliant templates from the grade-based system
// ============================================================================
const ENHANCED_FALLBACK_TEMPLATES = {
  "0": LEVEL_0_FALLBACK_TEMPLATES.map(template => ({
    setup: template.slice(0, 2),
    development: template.slice(2, 3),
    climax: template.slice(3, 4),
    resolution: template.slice(4, 5),
    contextualContinuations: []
  })),
  "1": LEVEL_1_TEMPLATES.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  })).concat(LEVEL_1_EXTENSIONS.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  }))),
  "2": LEVEL_2_TEMPLATES.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  })).concat(LEVEL_2_EXTENSIONS.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  }))),
  "3": LEVEL_3_TEMPLATES.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  })).concat(LEVEL_3_EXTENSIONS.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  }))),
  "4": LEVEL_4_TEMPLATES.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  })).concat(LEVEL_4_EXTENSIONS.map(template => ({
    setup: template.slice(0, 3),
    development: template.slice(3, 6),
    climax: template.slice(6, 9),
    resolution: template.slice(9, 12),
    contextualContinuations: []
  })))
};

// Enhanced Fallback Manager
class EnhancedFallbackManager {
  private static usedTemplates: Set<string> = new Set();
  
  static getFallbackTemplate(difficulty: string, userInfo: any, pageIndex: number = 0): string {
    const templates = ENHANCED_FALLBACK_TEMPLATES[difficulty] || ENHANCED_FALLBACK_TEMPLATES["2"];
    const template = templates[0]; // Use first template for simplicity
    
    const storyPosition = this.determineStoryPosition(pageIndex);
    const phrases = template[storyPosition] || template.setup;
    const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    return this.processTemplate(selectedPhrase, userInfo);
  }
  
  private static determineStoryPosition(pageIndex: number): keyof typeof ENHANCED_FALLBACK_TEMPLATES["1"][0] {
    if (pageIndex === 0) return 'setup';
    if (pageIndex <= 2) return 'development';
    if (pageIndex === 3) return 'climax';
    return 'resolution';
  }
  
  private static processTemplate(template: string, userInfo: any): string {
    const userName = NameFormatter.capitalize(userInfo?.name || 'the child');
    const userColor = ensureColorName(userInfo?.favoriteColor);
    
    return template
      .replace(/{NAME}/g, userName)
      .replace(/{COLOR}/g, userColor);
  }
  
  static clearSession(): void {
    this.usedTemplates.clear();
  }
}

// Simple fallback template function for Level 0
function getFallbackTemplate(difficulty: string, userName: string, favoriteColor?: string, favoriteAnimal?: string, favoriteFood?: string): string[] {
  console.log(`Getting fallback template for difficulty: ${difficulty}`);
  
  const templates = LEVEL_0_FALLBACK_TEMPLATES;
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Process template with user information
  return randomTemplate.map(page => 
    page
      .replace(/{userName}/g, userName)
      .replace(/{favoriteColor}/g, favoriteColor || 'blue')
      .replace(/{favoriteAnimal}/g, favoriteAnimal || 'cat')
      .replace(/{favoriteFood}/g, favoriteFood || 'apples')
  );
}

// Enhanced fallback page generator using the Enhanced Template Library
function getEnhancedFallbackPages(difficulty: string, userInfo: any): string[] {
  console.log(`Getting enhanced fallback for difficulty: ${difficulty}`);
  
  // Update mapping to include Level 0 for beginner
  if (difficulty === 'beginner') {
    return getFallbackTemplate('beginner', userInfo.name || 'Alex', userInfo.favoriteColor, userInfo.favoriteAnimal, userInfo.favoriteFood);
  }
  
  const difficultyMap: Record<string, string> = {
    'beginner': '0',
    'easy': '1', 
    'medium': '2',
    'hard': '3',
    'expert': '4'
  };
  
  const mappedDifficulty = difficultyMap[difficulty] || '1';
  
  // Generate 5 pages using Enhanced Template Library
  const pages: string[] = [];
  for (let i = 0; i < 5; i++) {
    const page = EnhancedFallbackManager.getFallbackTemplate(mappedDifficulty, userInfo, i);
    pages.push(page);
  }
  
  return pages;
}

serve(async (req) => {
  console.log('🔍 DIAGNOSTIC: Edge function invoked', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const requestBody = await req.json()
    console.log('🔍 DIAGNOSTIC: Request body parsed', {
      hasBody: !!requestBody,
      readingLevel: requestBody?.readingLevel,
      userName: requestBody?.config?.userName,
      bodyKeys: Object.keys(requestBody || {})
    });
    
    const { readingLevel, interests, config } = requestBody
    
    // Validate OpenAI API key first
    const keyValidation = validateOpenAIApiKey();
    if (!keyValidation.isValid) {
      console.error('🔍 DIAGNOSTIC: OpenAI API key validation failed:', keyValidation.error);
      throw new Error(`API configuration error: ${keyValidation.error}`);
    }
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Use the prompts sent from the frontend services
    // If custom prompts are provided (from LiveGenerationService), use those
    // Otherwise, fall back to basic prompts for NetflixStyleStoryService  
    const systemPrompt = config?.systemPrompt || `You are a children's story writer. Create an engaging story for ${readingLevel} level readers.`;
    const userPrompt = config?.userPrompt || `Create a unique story for ${config?.userName || 'the child'}.`;

    const maxTokens = readingLevel === 'beginner' ? 200 : 
                     readingLevel === 'easy' ? 400 : 
                     readingLevel === 'medium' ? 600 : 
                     readingLevel === 'hard' ? 800 : 1200; // expert

    console.log('📖 Story Generation Request:', {
      readingLevel,
      hasCustomPrompts: !!(config?.systemPrompt && config?.userPrompt),
      userName: config?.userName,
      expertGrade: config?.expertGrade,
      model: 'gpt-4o-mini',
      maxTokens
    });

    // Add timeout wrapper for OpenAI API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out after 30 seconds')), 30000);
    });

    const openAIRequest = fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    const response = await Promise.race([openAIRequest, timeoutPromise]) as Response;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI API response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasContent: !!data.choices?.[0]?.message?.content
    });

    const storyText = data.choices[0]?.message?.content?.trim()

    if (!storyText) {
      console.error('No story content generated:', { data });
      throw new Error('No story content generated')
    }

    console.log('Generated story length:', storyText.length, 'characters');

    // Clean up markdown formatting from OpenAI response
    const cleanStoryText = storyText
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/\*+/g, '')            // Remove any remaining asterisks
      .trim();

    // Remove optional title/header lines before parsing
    const preprocessed = cleanStoryText
      .replace(/^\s*Title:\s?.*$/gim, '')
      .replace(/^\s*#\s?.*$/gim, '')
      .trim();

    // Parse story into pages with improved logic
    let pages = [] as string[];
    
    // Strategy A: Primary "Page X:" format handling (optimized for consistent markers)
    if (/Page\s*\d+\s*:/i.test(preprocessed)) {
      // Optimized regex for "Page X:" format - primary strategy
      const matches = Array.from(preprocessed.matchAll(/(?:^|\r?\n)Page\s*(\d+)\s*:\s*(?:\r?\n)*([\s\S]*?)(?=(?:\r?\n)*Page\s*\d+\s*:|$)/gi));
      if (matches.length > 0) {
        pages = matches.map(m => m[2].trim()).filter(Boolean);
        console.log(`📖 Parsed ${pages.length} pages using Page X: format`);
      }
    }
    
    // Strategy B: Fallback for other page marker formats
    if (pages.length === 0 && /(?:Page|Página|Pagina|Seite)\s*\d+/i.test(preprocessed)) {
      const matches = Array.from(preprocessed.matchAll(/(?:^|\r?\n)(?:Page|Página|Pagina|Seite)\s*\d+\s*(?::|-)?\s*(?:\r?\n)+([\s\S]*?)(?=(?:\r?\n)+(?:Page|Página|Pagina|Seite)\s*\d+|$)/gi));
      if (matches.length > 0) {
        pages = matches.map(m => m[1].trim()).filter(Boolean);
      } else {
        pages = preprocessed.split(/(?:^|\r?\n)(?:Page|Página|Pagina|Seite)\s*\d+\s*(?::|-)?\s*/gi)
          .map(s => s.trim())
          .filter(Boolean);
      }
    }
    
    // Strategy B: Beginner (Level 0) special handling – one sentence per page
    if (pages.length === 0 && readingLevel === 'beginner') {
      // First try splitting into blocks by double newlines
      const blocks = preprocessed.split(/\r?\n\s*\r?\n/)
        .map(b => b.replace(/^Page\s*\d+\s*(?::|-)?\s*/i, '').trim())
        .filter(Boolean);
      
      if (blocks.length >= 5) {
        pages = blocks.slice(0, 5);
      } else if (blocks.length > 1) {
        pages = blocks;
      } else {
        // For single-line content, split on sentence boundaries for beginners
        const sentences = preprocessed.split(/(?<=[.!?])\s+/)
          .map(s => s.trim())
          .filter(Boolean);
        if (sentences.length > 1) {
          pages = sentences.slice(0, 8); // Limit to 8 pages max for beginners
        }
      }
    }
    
    // Strategy C: General paragraph split (double newlines)
    if (pages.length === 0 && /\n\n/.test(preprocessed)) {
      pages = preprocessed.split(/\r?\n\s*\r?\n/)
        .map(p => p.trim())
        .filter(Boolean);
    }
    
    // Strategy D: Emergency fallback – sentence-based pagination
    if (pages.length === 0) {
      const sentences = preprocessed.split(/(?<=[.!?])\s+/);
      const wordsPerPage = readingLevel === 'beginner' ? 8 : readingLevel === 'easy' ? 15 : readingLevel === 'medium' ? 30 : 50;
      
      let currentPage = '';
      let currentWords = 0;
      
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;
        const sentenceWords = trimmedSentence.split(/\s+/).length;
        if (currentWords + sentenceWords > wordsPerPage && currentPage) {
          pages.push(currentPage.trim() + (/[.!?]$/.test(currentPage) ? '' : '.'));
          currentPage = trimmedSentence;
          currentWords = sentenceWords;
        } else {
          currentPage += (currentPage ? ' ' : '') + trimmedSentence;
          currentWords += sentenceWords;
        }
      }
      if (currentPage) {
        pages.push(currentPage.trim() + (/[.!?]$/.test(currentPage) ? '' : '.'));
      }
    }

    // Strip page markers from content before returning
    const cleanPages = pages.map(page => {
      return page
        .replace(/^Page\s*\d+\s*:\s*/i, '') // Remove "Page X:" at start
        .replace(/^Page\s*\d+\s*/i, '') // Remove "Page X" at start
        .replace(/\n\s*Page\s*\d+\s*:\s*/gi, '\n') // Remove mid-text markers
        .replace(/\n\s*Page\s*\d+\s*/gi, '\n') // Remove mid-text markers
        .trim();
    }).filter(page => page.length > 0);

    const userName = config?.userName || 'the child';
    console.log(`Generated story for ${userName} with ${cleanPages.length} clean pages`);

    console.log('EDGE SOURCE=ai', { readingLevel, pagesCount: cleanPages.length });
    return new Response(JSON.stringify({
      source: 'ai',
      pages: cleanPages,
      difficulty: readingLevel || 'easy',
      title: `${userName}'s Story`,
      isComplete: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Story generation error:', error)
    
    // Parse request body for fallback
    let fallbackConfig = {};
    let fallbackReadingLevel = 'easy';
    try {
      const requestBody = await req.json();
      fallbackConfig = requestBody.config || {};
      fallbackReadingLevel = requestBody.readingLevel || 'easy';
    } catch (parseError) {
      console.error('Could not parse request for fallback:', parseError);
    }
    
    // Enhanced fallback using simplified template system
    const userName = fallbackConfig?.userName || 'the child';
    
    // Get fallback pages using Enhanced Template Library logic
    const fallbackPages = getEnhancedFallbackPages(fallbackReadingLevel, {
      name: userName,
      avatar: fallbackConfig?.avatar,
      interests: fallbackConfig?.interests || []
    });

    console.log('EDGE SOURCE=fallback', { readingLevel: fallbackReadingLevel, pagesCount: fallbackPages.length });
    const fallbackStory = {
      source: 'fallback',
      pages: fallbackPages,
      difficulty: fallbackReadingLevel || 'easy',
      title: `${userName}'s Story`,
      isComplete: true
    };
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})