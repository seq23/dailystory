// Color-Based Story Voice Patterns for Never-Ending Stories
import type { DifficultyLevel, UserInfo } from "@/types";
import { resolveMicroPlaceholders } from "@/utils/placeholderResolver";

export interface ColorVoice {
  name: string;
  description: string;
  ageRange: string;
  patterns: {
    openings: string[];
    transitions: string[];
    closings: string[];
  };
  characteristics: string[];
  preferredThemes?: string[];
  styleSummary: string;
  sampleMicroLines: string[];
}

export const COLOR_VOICES: Record<string, ColorVoice> = {
  red: {
    name: "Red Voice",
    description: "Simple, rhythmic text with bright imagery and nature themes. Growth and transformation stories.",
    ageRange: "3-5",
    patterns: {
      openings: [
        "In the light of the moon, {userName} saw a little {animal}...",
        "On Monday, {userName} ate through one {food}...",
        "A small {animal} sat on a leaf...",
        "The very {adjective} {userName} was ready for adventure...",
        "Early in the morning, a {adjective} {animal} peeked out...",
        "Under a {color} sky, {userName} found something special...",
        "{userName} followed a colorful trail through the garden...",
        "One bright {object} led to another, and another..."
      ],
      transitions: [
        "But {pronoun} was still curious.",
        "The next day was Sunday again.",
        "Pop! Out came something wonderful...",
        "Now {pronoun} wasn't small anymore.",
        "Soon, the {animal} showed a new path.",
        "Step by step, everything changed colors.",
        "And then a friendly {animal} waved hello.",
        "Little by little, {userName} learned more.",
        "The sun painted new patterns on leaves.",
        "A gentle breeze carried sweet scents.",
        "Slowly, the world grew brighter around {pronoun}.",
        "Each step brought a new discovery.",
        "The garden seemed to whisper secrets.",
        "Colors danced before {userName}'s eyes.",
        "Something magical was about to happen.",
        "The earth felt warm beneath {pronoun} feet.",
        "A new season was beginning to bloom.",
        "Petals floated down like tiny wishes.",
        "The morning dew sparkled like diamonds.",
        "Every flower seemed to nod hello.",
        "Time moved as slowly as honey.",
        "Nature held {userName} in its gentle arms.",
        "The world pulsed with quiet life.",
        "Another wonderful day was unfolding.",
        "Peace settled over the growing garden.",
        "The cycle of life continued its dance.",
        "Everything felt perfectly in place.",
        "A new chapter was ready to begin.",
        "The rhythm of growth never stopped."
      ],
      closings: [
        "And {userName} was a beautiful {animal}!",
        "What a beautiful day {pronoun} had become!",
        "Now {pronoun} was no longer hungry.",
        "The end of a perfect day.",
        "The garden grew quiet as stars appeared.",
        "{userName} smiled at the gentle night sky.",
        "Everything felt bright and new.",
        "Tomorrow, {userName} would explore again."
      ]
    },
    characteristics: ["simple repetition", "nature themes", "transformation", "growth"],
    preferredThemes: ["nature", "growth", "curiosity", "discovery"],
    styleSummary: "Gentle, nature-focused voice with simple rhythmic patterns. Emphasizes growth, transformation, and curiosity through bright natural imagery.",
    sampleMicroLines: [
      "Step by step, everything changed colors.",
      "The garden seemed to whisper secrets.",
      "Pop! Out came something wonderful...",
      "Little by little, {userName} learned more."
    ]
  },

  yellow: {
    name: "Yellow Voice", 
    description: "Playful, rhyming stories with humor and charm, often featuring anthropomorphic animals.",
    ageRange: "3-5",
    patterns: {
      openings: [
        "Hippos go berserk! And so does {userName}!",
        "Moo, baa, la la la! {userName} loves to play!",
        "Oh my goodness! Oh my gosh! {userName} needs to dance!",
        "Dogs and cats and pigs, oh my! {userName} says hello!",
        "Time to wiggle, time to jiggle, {userName} starts the day!",
        "Barnyard animals everywhere! {userName} wants to join!",
        "Silly songs and silly dances, {userName} loves them all!",
        "But not {userName}. {userName} says 'Let's have fun!'"
      ],
      transitions: [
        "But wait! There's more fun to be had!",
        "Stomp stomp stomp goes {userName}!",
        "What a silly thing to do!",
        "Everybody dance! Even {userName}!",
        "Round and round and giggle around!",
        "Oink and moo and cock-a-doodle-doo!",
        "Time for snacks and silly snorts!",
        "More giggles, more wiggles!",
        "Bounce bounce bounce to the silly song!",
        "Wiggle your {body part}, shake your {body part}!",
        "Hip hip hooray for playtime!",
        "Tickle tickle goes the fuzzy {animal}!",
        "Zoom zoom zoom around the yard!",
        "Splish splash splash in the puddles!",
        "Clap clap clap with happy hands!",
        "Silly sounds and silly faces!",
        "Jump jump jump like a bouncy ball!",
        "Peek-a-boo! I see you too!",
        "Waddle like a happy duck!",
        "Giggle snorts and snorty giggles!",
        "Twirl and whirl and spin around!",
        "Fuzzy wuzzy wasn't fuzzy, was {pronoun}?",
        "Beep beep goes the busy bee!",
        "Silly silly silly billy!",
        "Dance party in the barnyard!",
        "Wobbly wobbly like jelly!",
        "Ring around the rosie time!",
        "Giggles echoed everywhere!",
        "What a wonderfully wacky day!"
      ],
      closings: [
        "The end! (But not really the end.)",
        "And {userName} was very, very happy.",
        "What a silly, wonderful day!",
        "Time for a snack and a nap!",
        "Good night, sleep tight, don't let the bed bugs bite!",
        "And everyone laughed until they cried!",
        "That's all folks! Time to say goodbye!",
        "Sweet dreams of dancing animals!"
      ]
    },
    characteristics: ["silly", "bouncy", "animals", "humor", "rhyming"],
    preferredThemes: ["animals", "friendship", "playfulness", "humor"],
    styleSummary: "Playful, bouncy voice with silly rhymes and humor. Features anthropomorphic animals and repetitive, joyful language.",
    sampleMicroLines: [
      "But wait! There's more fun to be had!",
      "Round and round and giggle around!",
      "Bounce bounce bounce to the silly song!",
      "What a wonderfully wacky day!"
    ]
  },

  green: {
    name: "Green Voice",
    description: "Minimalist dialogue, expressive illustrations, and humor that resonates with both kids and adults.",
    ageRange: "5-7",
    patterns: {
      openings: [
        "{userName} was having a really difficult day.",
        "'I do NOT want to!' said {userName}.",
        "{userName} had a very important question.",
        "There was a big problem today.",
        "{userName} found it hard to explain feelings.",
        "Today was going to be different.",
        "Something was not quite right.",
        "'Wait!' shouted {userName}. 'I have an idea!'"
      ],
      transitions: [
        "But then something important happened.",
        "'Wait!' shouted {userName}.",
        "That was not what {pronoun} expected at all.",
        "Sometimes the best ideas come when you least expect them.",
        "They took a deep breath and tried again.",
        "Maybe there was another way to think about this.",
        "'{userName},' said the wise friend, 'listen carefully.'",
        "And then... everything changed.",
        "Feelings are complicated sometimes.",
        "'{userName}, what do you think we should do?'",
        "That made {userName} stop and think.",
        "Maybe they could figure this out together.",
        "The big problem suddenly seemed smaller.",
        "'Oh!' said {userName}. 'I understand now!'",
        "Sometimes friends see things differently.",
        "That gave {userName} a new idea to try.",
        "'{userName},' said {friend}, 'I have an idea.'",
        "They looked at each other and smiled.",
        "The answer was simpler than they thought.",
        "Maybe the real problem was something else.",
        "'{userName}, can you help me understand?'",
        "That's when everything started to make sense.",
        "They decided to be brave together.",
        "The feeling in {pronoun} chest was getting better.",
        "Maybe being different wasn't so bad after all.",
        "'{userName}, you're really good at this!'",
        "And that's when {pronoun} realized something important.",
        "Friends make everything better, don't they?",
        "The hard part was almost over."
      ],
      closings: [
        "And they both laughed and laughed.",
        "That is what friendship is all about.",
        "Tomorrow would bring new adventures.",
        "Being different makes life special.",
        "They solved it with patience and kindness.",
        "Different ideas can still work together.",
        "They promised to listen first next time.",
        "And that felt like real friendship."
      ]
    },
    characteristics: ["emotional honesty", "friendship", "simple dialogue", "problem solving"],
    preferredThemes: ["friendship", "kindness", "empathy", "problem-solving"],
    styleSummary: "Emotionally honest voice with simple dialogue and problem-solving focus. Emphasizes friendship, feelings, and working through challenges together.",
    sampleMicroLines: [
      "But then something important happened.",
      "Maybe there was another way to think about this.",
      "And then... everything changed.",
      "Friends make everything better, don't they?"
    ]
  },

  purple: {
    name: "Purple Voice",
    description: "Gentle, whimsical tales with friendship and moral undertones.",
    ageRange: "5-7",
    patterns: {
      openings: [
        "{userName} and {friend} were the very best of friends.",
        "One spring morning, {userName} knocked on the door.",
        "{userName} was feeling quite lonely today.",
        "It was the kind of day when friends are most important.",
        "{userName} had been thinking about {friend} all morning.",
        "The seasons were changing, and so was {userName}.",
        "There are days when even good friends disagree.",
        "{userName} wanted to do something special for {friend}."
      ],
      transitions: [
        "But then {friend} had a wonderful idea.",
        "Together, they decided to try something new.",
        "Sometimes the best adventures are shared.",
        "That's when {userName} remembered something important.",
        "Friends can help each other in surprising ways.",
        "They discovered that working together was better.",
        "The two friends learned something valuable.",
        "And so they set off on their gentle adventure.",
        "The afternoon sun painted everything golden.",
        "They walked slowly, savoring each moment.",
        "A gentle breeze carried the scent of flowers.",
        "The season whispered promises of change.",
        "Hand in hand, they explored the quiet path.",
        "Time seemed to slow down just for them.",
        "Nature welcomed their peaceful friendship.",
        "They shared stories as soft as morning light.",
        "Each step brought a new small wonder.",
        "The world felt safe and full of kindness.",
        "Their friendship bloomed like spring flowers.",
        "Together they discovered hidden treasures.",
        "The forest held its breath in gentle reverence.",
        "They moved with the unhurried grace of seasons.",
        "Simple moments became precious memories.",
        "Their hearts were as light as autumn leaves.",
        "The path ahead sparkled with possibility.",
        "They learned the wisdom of going slowly.",
        "Peace settled around them like a warm blanket.",
        "The day unfolded like a gentle story."
      ],
      closings: [
        "And so their friendship grew even stronger.",
        "They spent the rest of the day enjoying each other's company.",
        "That evening, they felt grateful for their friendship.",
        "Some things are better when shared with a friend.",
        "And they lived happily, side by side.",
        "Their friendship was a gift they treasured.",
        "Together, they watched the sunset and smiled.",
        "The best days are the ones spent with good friends."
      ]
    },
    characteristics: ["gentle wisdom", "friendship", "seasonal themes", "quiet adventures"],
    preferredThemes: ["friendship", "nature", "seasons", "quiet wisdom"],
    styleSummary: "Gentle, whimsical voice with friendship and seasonal themes. Emphasizes quiet wisdom, shared adventures, and the beauty of simple moments.",
    sampleMicroLines: [
      "Together, they decided to try something new.",
      "The afternoon sun painted everything golden.",
      "Time seemed to slow down just for them.",
      "Simple moments became precious memories."
    ]
  },

  orange: {
    name: "Orange Voice",
    description: "Relatable everyday adventures, realistic dialogue, and themes of friendship, family, and school life.",
    ageRange: "7-9",
    patterns: {
      openings: [
        "{userName} had been looking forward to this day all week.",
        "It all started when {userName} decided to help with chores.",
        "Nobody understood {userName} the way family did.",
        "Things never went the way {userName} planned them.",
        "First period had already gone sideways.",
        "{userName} thought today would be simple—until it wasn't.",
        "It began with a tiny mistake and a big lesson.",
        "The plan looked perfect on paper, but real life was different."
      ],
      transitions: [
        "But then something unexpected happened.",
        "That's when {userName} got a brilliant idea.",
        "Of course, things didn't go smoothly.",
        "As usual, life was more complicated than expected.",
        "So {userName} made a quick change and kept going.",
        "Of course, {friend} had a different opinion.",
        "They had to ask for help—and that was okay.",
        "A clever solution saved the day.",
        "Mom called from the kitchen with perfect timing.",
        "The mess looked worse than it actually was.",
        "Somehow, the disaster turned into something better.",
        "{userName} remembered what Dad always said.",
        "The phone rang at exactly the right moment.",
        "It was one of those days when everything goes wrong.",
        "But {userName} had dealt with worse before.",
        "A quick text to {friend} changed everything.",
        "The homework could wait—this was more important.",
        "Sometimes the best plans are no plans at all.",
        "Family dinner conversations never go as expected.",
        "The real test was how {userName} handled it.",
        "Mom's advice from last week suddenly made sense.",
        "It was time to try a completely different approach.",
        "The clock on the wall seemed to tick louder.",
        "This was definitely going to be a good story later.",
        "At least it wasn't as bad as last Tuesday.",
        "The important thing was that everyone was okay.",
        "Some days you just have to laugh at the chaos.",
        "Tomorrow would definitely be a fresh start."
      ],
      closings: [
        "And {userName} learned that growing up means making mistakes.",
        "Sometimes the best adventures are the unexpected ones.",
        "Life with family is never boring.",
        "And {userName} couldn't wait for tomorrow's adventure.",
        "It wasn't perfect, but it was real.",
        "{userName} learned that being brave looks ordinary up close.",
        "Family jokes made the tough parts easier.",
        "Tomorrow had room for better choices and new adventures."
      ]
    },
    characteristics: ["realistic", "family life", "humor", "relatability", "everyday adventures"],
    preferredThemes: ["family", "school", "humor", "resilience", "growing up"],
    styleSummary: "Realistic, relatable voice focusing on everyday family and school adventures. Emphasizes humor, resilience, and the ordinary magic of growing up.",
    sampleMicroLines: [
      "Of course, things didn't go smoothly.",
      "As usual, life was more complicated than expected.",
      "Mom called from the kitchen with perfect timing.",
      "Tomorrow would definitely be a fresh start."
    ]
  },

  pink: {
    name: "Pink Voice",
    description: "Imaginative, often dark humor, quirky characters, and playful language.",
    ageRange: "7-9",
    patterns: {
      openings: [
        "{userName} had always been a rather extraordinary child.",
        "There was something decidedly peculiar about {userName}.",
        "Most grown-ups are beastly creatures, but {userName} was different.",
        "It was on a particularly dreary Tuesday that {userName} discovered...",
        "{userName} possessed a most unusual and wonderful secret.",
        "Now, you must understand that {userName} was no ordinary child.",
        "The grown-ups never suspected that {userName} could...",
        "It all began when {userName} found something absolutely impossible."
      ],
      transitions: [
        "But then, something absolutely extraordinary happened!",
        "Suddenly, {userName} realized {pronoun} had a magnificent power!",
        "The grown-ups were in for a tremendous surprise!",
        "That's when {userName} decided to teach them a lesson!",
        "Little did they know that {userName} was planning something spectacular!",
        "And then, with a tremendous whoosh and a crackle...",
        "The most wonderfully wicked idea popped into {userName}'s head!",
        "What happened next was simply astounding!",
        "The beastly grown-ups had no idea what was coming.",
        "Magic bubbled and fizzed in the most delicious way.",
        "'{userName},' whispered the secret voice, 'now is your chance!'",
        "The room began to shimmer with impossible possibilities.",
        "Even the furniture seemed to wink conspiratorially.",
        "This called for the most splendiferous revenge!",
        "The air crackled with mischievous energy.",
        "Suddenly, everything turned topsy-turvy!",
        "The grown-ups' eyes grew wide as saucers.",
        "Magic has a way of evening the score.",
        "And then came the most gloriously gobblefunk surprise!",
        "The world turned into a whizpopping adventure!",
        "'{userName} is extraordinary!' gasped the amazed adults.",
        "Power coursed through {pronoun} like liquid chocolate.",
        "The bullies found themselves in quite a pickle!",
        "Justice arrived with a magnificent BANG!",
        "Even the grumpiest grown-ups began to smile.",
        "The most wonderfully ridiculous thing happened next.",
        "Magic danced around {userName} like golden butterflies.",
        "And suddenly, being different felt absolutely perfect.",
        "The world needed more {userName}s, everyone agreed."
      ],
      closings: [
        "And from that day forward, {userName} was never underestimated again!",
        "The grown-ups learned to respect {userName}'s extraordinary abilities!",
        "What a gloriously magnificent adventure it had been!",
        "And {userName} lived mischievously ever after!",
        "The world was a much more interesting place with {userName} in it!",
        "And that, my dear friends, is how {userName} saved the day!",
        "From then on, life was absolutely splendiferous!",
        "And they all celebrated with the most delicious treats imaginable!"
      ]
    },
    characteristics: ["imaginative", "quirky", "playful language", "empowerment", "mischief"],
    preferredThemes: ["magic", "empowerment", "overcoming bullies", "imagination"],
    styleSummary: "Imaginative, mischievous voice with quirky characters and playful language. Emphasizes empowerment, magic, and turning the tables on bullies.",
    sampleMicroLines: [
      "But then, something absolutely extraordinary happened!",
      "The most wonderfully wicked idea popped into {userName}'s head!",
      "What happened next was simply astounding!",
      "And from that day forward, {userName} was never underestimated again!"
    ]
  },

  "navy-blue": {
    name: "Navy Blue Voice",
    description: "Fast-paced adventures with witty banter, quest structures, and mythological elements blended into modern settings.",
    ageRange: "9-11",
    patterns: {
      openings: [
        "{userName} had always known {pronoun} was different, but this was ridiculous.",
        "The day {userName} discovered {pronoun} could control water started like any other.",
        "Most kids worry about math tests. {userName} worried about monsters.",
        "It wasn't every day that {userName}'s teacher turned into a fury.",
        "{userName} should have known that field trip would end in disaster.",
        "The ancient prophecy had mentioned {userName} specifically, which was terrifying.",
        "When your {object} starts glowing, you know you're in trouble.",
        "{userName} thought {pronoun} was having a normal day until the {mythical creature} showed up."
      ],
      transitions: [
        "That's when {userName} realized this wasn't going to be easy.",
        "Suddenly, {userName}'s training kicked in.",
        "Time slowed down as {userName} focused {pronoun} power.",
        "The quest was only getting more dangerous.",
        "But {userName} had {friends} counting on {pronoun}.",
        "This was exactly what the prophecy had warned about.",
        "Drawing {pronoun} {weapon}, {userName} prepared for battle.",
        "The fate of both worlds hung in the balance.",
        "The monsters weren't giving up without a fight.",
        "Camp Half-Blood had prepared {userName} for this moment.",
        "The Oracle's words echoed in {pronoun} mind.",
        "Demigod powers weren't something you could fake.",
        "The gods were watching, and {userName} could feel it.",
        "Another challenge appeared on the horizon.",
        "The mythical beast circled, sizing up its opponent.",
        "Ancient grudges don't die easily.",
        "'{userName},' {friend} shouted, 'duck!'",
        "The celestial bronze gleamed in the afternoon sun.",
        "Iris messages couldn't reach them here.",
        "This wasn't covered in any mythology textbook.",
        "The mist was playing tricks on mortal eyes.",
        "Nectar and ambrosia couldn't fix everything.",
        "Zeus's thunder rumbled ominously overhead.",
        "The deadline was approaching faster than expected.",
        "Prophecies had a way of twisting the truth.",
        "The rift between worlds was growing wider.",
        "'{userName}, we need a plan. Now.'",
        "Divine interference was the last thing they needed.",
        "The Labyrinth had shifted again, of course.",
        "Sometimes being a hero really sucked."
      ],
      closings: [
        "And {userName} realized that being a hero isn't about being perfect.",
        "The adventure was over, but {userName} knew more challenges awaited.",
        "Sometimes saving the world is just another Tuesday.",
        "With great power comes great homework, {userName} thought wryly.",
        "The gods were pleased, and that was saying something.",
        "Camp would never be the same after {userName}'s quest.",
        "Not bad for a {age}-year-old demigod.",
        "The prophecy was fulfilled, but new mysteries had already begun."
      ]
    },
    characteristics: ["fast-paced", "heroic quests", "witty dialogue", "modern mythology", "coming of age"],
    preferredThemes: ["adventure", "mythology", "friendship", "courage", "identity"],
    styleSummary: "Fast-paced adventure voice with heroic quests and witty dialogue. Blends modern settings with mythological elements and coming-of-age themes.",
    sampleMicroLines: [
      "That's when {userName} realized this wasn't going to be easy.",
      "Time slowed down as {userName} focused {pronoun} power.",
      "The fate of both worlds hung in the balance.",
      "Sometimes saving the world is just another Tuesday."
    ]
  },

  copper: {
    name: "Copper Voice",
    description: "Richly imagined fantasy worlds, layered plots, and a balance of mystery, action, and character growth.",
    ageRange: "9-11",
    patterns: {
      openings: [
        "{userName} had always felt there was something different about {pronoun}, something magical.",
        "The letter arrived on {userName}'s birthday, changing everything forever.",
        "Strange things had been happening around {userName} lately.",
        "The old {object} in {userName}'s {setting} began to glow mysteriously.",
        "{userName} discovered that {pronoun} family had kept an enormous secret.",
        "It was on Platform {number} that {userName}'s real adventure began.",
        "The {magical creature} appeared just when {userName} needed help most.",
        "Professor {teacher} had been waiting for {userName} to discover {pronoun} true potential."
      ],
      transitions: [
        "But {userName} soon learned that magic came with great responsibility.",
        "The mystery deepened as {userName} uncovered ancient secrets.",
        "With {pronoun} wand in hand, {userName} felt {pronoun} power growing.",
        "The {antagonist} would not give up without a fight.",
        "Together with {friends}, {userName} devised a clever plan.",
        "The prophecy spoke of a chosen one, and {userName} was beginning to understand.",
        "Dark forces were gathering, but {userName} was not alone.",
        "The final confrontation would test everything {userName} had learned.",
        "Ancient magic hummed in the very stones of the castle.",
        "The portrait whispered secrets of ages past.",
        "Candlelight flickered across dusty spell books.",
        "Something stirred in the depths of the forbidden forest.",
        "The map revealed passages that shouldn't exist.",
        "A door appeared where none had been before.",
        "The mirror showed not reflection, but truth.",
        "Footsteps echoed in corridors that time forgot.",
        "The sorting hat murmured words of warning.",
        "Stars aligned in patterns that defied explanation.",
        "The wand chose its wizard, as wands often do.",
        "Legacy and destiny intertwined like golden threads.",
        "The library held more than books within its walls.",
        "Ghosts drifted through walls with urgent messages.",
        "The great hall fell silent as power awakened.",
        "Spells crackled through the air like captured lightning.",
        "The headmaster's eyes twinkled with hidden knowledge.",
        "Time itself seemed to bend around the ancient magic.",
        "The phoenix song carried hope on gilded wings.",
        "Courage and friendship proved stronger than dark magic."
      ],
      closings: [
        "And {userName} understood that the greatest magic of all was {love/friendship}.",
        "Hogwarts would always be home to {userName}.",
        "The battle was won, but {userName} knew the war against darkness continued.",
        "With {pronoun} friends by {pronoun} side, {userName} was ready for anything.",
        "The magical world was safe, thanks to {userName}'s courage.",
        "And so {userName}'s legend began to grow.",
        "The boy/girl who lived had become the {hero/heroine} who conquered.",
        "Magic, it seemed, was just the beginning of {userName}'s story."
      ]
    },
    characteristics: ["rich world-building", "mystery", "character growth", "magical realism", "friendship"],
    preferredThemes: ["magic", "friendship", "good vs evil", "identity", "courage"],
    styleSummary: "Rich, magical voice with layered mysteries and character growth. Emphasizes the balance between magic and friendship, with deep world-building elements.",
    sampleMicroLines: [
      "The mystery deepened as {userName} uncovered ancient secrets.",
      "Ancient magic hummed in the very stones of the castle.",
      "The wand chose its wizard, as wands often do.",
      "Courage and friendship proved stronger than dark magic."
    ]
  },

  "slate-gray": {
    name: "Slate Gray Voice",
    description: "Tense, action-driven narratives with high stakes and themes of survival, sacrifice, and societal conflict.",
    ageRange: "11-15",
    patterns: {
      openings: [
        "When {userName} volunteered, everything changed.",
        "The arena was designed to break spirits, but {userName} was different.",
        "Survival wasn't just about staying alive—it was about staying human.",
        "The rules of the game were simple: win or die.",
        "In District {number}, {userName} had learned that hope was dangerous.",
        "The Capitol had underestimated {userName}, and that would be their mistake.",
        "Freedom always comes at a price, and {userName} was willing to pay it.",
        "The revolution needed a symbol, and {userName} had become that symbol."
      ],
      transitions: [
        "But {userName} had learned to adapt, to survive.",
        "The stakes were higher than {userName} had ever imagined.",
        "Every decision could mean life or death for those {pronoun} loved.",
        "The gamemakers were changing the rules, but {userName} would not break.",
        "Alliance meant survival, but trust was a luxury {userName} couldn't afford.",
        "The line between right and wrong blurred in the arena of war.",
        "Sacrifice was the only currency that mattered now.",
        "The final battle would determine the fate of all the districts.",
        "The arena was a killing machine, but {userName} was still human.",
        "Resources were scarce, and time was running out.",
        "The Capitol's cruelty knew no bounds.",
        "Revolution demanded blood, but whose blood was the question.",
        "Fear was a weapon, and {userName} refused to wield it.",
        "The cameras captured everything, even {userName}'s defiance.",
        "Allies could become enemies with the change of wind.",
        "The resistance depended on {userName}'s next move.",
        "Death was always one heartbeat away.",
        "The price of freedom kept rising.",
        "Hunger games were never really about hunger.",
        "The districts were watching, waiting for a sign.",
        "Propaganda painted lies, but truth burned in {userName}'s eyes.",
        "The rebellion needed martyrs, not heroes.",
        "Survival meant choosing who lived and who died.",
        "The mockingjay pin carried more weight than any crown.",
        "War made monsters of children and children of monsters.",
        "Every breath was borrowed time in the arena.",
        "The real enemy wasn't in the arena—it was in the Capitol.",
        "Hope was the most dangerous weapon of all."
      ],
      closings: [
        "And {userName} realized that winning wasn't about defeating enemies—it was about saving souls.",
        "The games were over, but the real work of rebuilding had just begun.",
        "Freedom tasted like {food}, sweet and hard-earned.",
        "The nightmares would fade, but the courage would remain.",
        "A new world was possible, and {userName} had helped make it so.",
        "The mockingjay's song carried hope across all the districts.",
        "Peace was fragile, but {userName} would protect it.",
        "And the children would grow up free."
      ]
    },
    characteristics: ["high stakes", "survival themes", "social commentary", "complex morality", "coming of age"],
    preferredThemes: ["survival", "justice", "sacrifice", "rebellion", "hope"],
    styleSummary: "Intense, high-stakes voice with survival themes and complex morality. Emphasizes sacrifice, justice, and the cost of freedom in times of conflict.",
    sampleMicroLines: [
      "But {userName} had learned to adapt, to survive.",
      "The stakes were higher than {userName} had ever imagined.",
      "Sacrifice was the only currency that mattered now.",
      "And {userName} realized that winning wasn't about defeating enemies—it was about saving souls."
    ]
  },

  teal: {
    name: "Teal Voice",
    description: "Philosophical, imaginative stories blending science, faith, and coming-of-age themes.",
    ageRange: "11-15",
    patterns: {
      openings: [
        "It was a dark and stormy night when {userName} first felt the tesseract.",
        "The universe was vast and full of mystery, and {userName} was about to discover {pronoun} place in it.",
        "Love was the one force in the universe that could transcend time and space.",
        "Mrs. Who had told {userName} that the light was always stronger than the darkness.",
        "On the planet {planet}, {userName} learned that being different was a gift.",
        "The IT could control minds, but it could never touch the human heart.",
        "Mathematics and music, {userName} realized, were the languages of creation.",
        "Meg's faults were also her greatest strengths, as {userName} would learn."
      ],
      transitions: [
        "But {userName} was beginning to understand that love was indeed the answer.",
        "The journey through space and time had only just begun.",
        "Faith and science, {userName} discovered, were not enemies but allies.",
        "The darkness was real, but so was the light that {userName} carried within.",
        "Mrs. Whatsit's words echoed in {userName}'s mind: 'The foolishness of God is wiser than men.'",
        "Tessering required not just courage, but absolute trust in love.",
        "The battle between good and evil was fought in the human heart.",
        "And {userName} realized that {pronoun} was part of something infinitely larger.",
        "The universe spoke in frequencies only love could decode.",
        "Time folded like origami in the hands of {userName}'s growing wisdom.",
        "Charles Wallace's mind touched realms beyond ordinary thought.",
        "Mrs. Who quoted Shakespeare: 'We know what we are, but know not what we may be.'",
        "The winds of change carried whispers from distant galaxies.",
        "Mathematics revealed the hidden poetry of creation.",
        "Calvin's love became a beacon in the cosmic darkness.",
        "The IT could not comprehend the illogic of human compassion.",
        "Camazotz represented the danger of perfect conformity.",
        "The Black Thing spread its shadow across countless worlds.",
        "Mrs. Which reminded {userName} that {pronoun} was a warrior of light.",
        "Meg's faults became the very strengths that saved everything.",
        "The fifth dimension opened doors to impossible understanding.",
        "Aunt Beast taught {userName} about love beyond physical sight.",
        "The Happy Medium showed visions of hope across the universe.",
        "Even the smallest act of love could shift the cosmic balance.",
        "Father's imprisonment on Camazotz tested every belief.",
        "The centaurs spoke of ancient wisdom written in the stars.",
        "Mrs. Murry's equations hinted at realities beyond comprehension.",
        "Love transcended every barrier science could construct.",
        "The wrinkle in time revealed that all moments were eternal."
      ],
      closings: [
        "And {userName} understood that love was the fabric that held the universe together.",
        "The stars sang their eternal song, and {userName} was part of the chorus.",
        "Home was not a place but the people who loved you unconditionally.",
        "The wrinkle in time had taught {userName} that all moments were precious.",
        "With {pronoun} family reunited, {userName} felt the universe smile.",
        "And the light shone in the darkness, and the darkness could not overcome it.",
        "Mrs. Whatsit was right: there was such a thing as a happy ending.",
        "The adventure was over, but {userName}'s journey of growth had just begun."
      ]
    },
    characteristics: ["philosophical", "scientific", "spiritual", "cosmic scope", "deep themes"],
    preferredThemes: ["love", "science", "faith", "family", "cosmic adventure"],
    styleSummary: "Philosophical, cosmic voice blending science and spirituality. Emphasizes love as a universal force, deep themes, and the interconnectedness of all existence.",
    sampleMicroLines: [
      "The journey through space and time had only just begun.",
      "Faith and science, {userName} discovered, were not enemies but allies.",
      "Tessering required not just courage, but absolute trust in love.",
      "And {userName} understood that love was the fabric that held the universe together."
    ]
  }
};


// All available color voice keys for random selection
const ALL_COLOR_KEYS = Object.keys(COLOR_VOICES) as (keyof typeof COLOR_VOICES)[];

/**
 * Get appropriate color voice for user (now selects from all colors)
 * Age-appropriateness is handled by system prompts, not color restrictions
 */
export function getColorVoiceForUser(userInfo: UserInfo, difficulty: DifficultyLevel): ColorVoice {
  // Select random color from all available voices
  // System prompts will handle age-appropriate content adaptation
  const selectedColor = ALL_COLOR_KEYS[Math.floor(Math.random() * ALL_COLOR_KEYS.length)];
  
  return COLOR_VOICES[selectedColor];
}

/**
 * Get appropriate story style for difficulty level (now selects from all colors)
 * Content difficulty is handled by system prompts, not color restrictions
 */
export function getAuthorVoiceForDifficulty(difficulty: DifficultyLevel): ColorVoice {
  // Select random color from all available voices
  // System prompts will handle difficulty-appropriate content adaptation
  const selectedColor = ALL_COLOR_KEYS[Math.floor(Math.random() * ALL_COLOR_KEYS.length)];
  return COLOR_VOICES[selectedColor];
}

/**
 * Apply story style characteristics to content naturally
 */
export function applyAuthorVoice(
  content: string,
  voice: ColorVoice,
  position: 'opening' | 'transition' | 'closing',
  userInfo?: UserInfo,
  difficulty?: DifficultyLevel
): string {
  // Skip author voice entirely for beginner difficulty
  if (difficulty === 'beginner') {
    return content;
  }
  // If content is already author-voice styled or very short, return as is
  if (content.length < 20 || isAlreadyStyledContent(content, voice)) {
    return content;
  }

  const patterns = voice.patterns[position + 's' as keyof typeof voice.patterns];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Extract variables from content for pattern substitution
  const variables = extractContentVariables(content);
  const styledPattern = substitutePatternVariables(pattern, variables, content, userInfo);

  // Apply voice characteristics naturally based on position
  switch (position) {
    case 'opening':
      return enhanceOpeningWithVoice(content, styledPattern, voice);
    case 'closing':
      return enhanceClosingWithVoice(content, styledPattern, voice);
    case 'transition':
      return enhanceTransitionWithVoice(content, styledPattern, voice);
    default:
      return content;
  }
}

/**
 * Check if content already has story style styling
 */
function isAlreadyStyledContent(content: string, voice: ColorVoice): boolean {
  const voiceIndicators = [
    ...voice.patterns.openings,
    ...voice.patterns.transitions, 
    ...voice.patterns.closings
  ].flatMap(pattern => pattern.split(' ').filter(word => 
    !word.includes('{') && word.length > 3
  ));
  
  return voiceIndicators.some(indicator => 
    content.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Extract variables from existing content
 */
function extractContentVariables(content: string): Record<string, string> {
  // Simple extraction - can be enhanced based on content analysis
  const variables: Record<string, string> = {};
  
  // Extract potential names (capitalized words not at sentence start)
  const nameMatch = content.match(/\b[A-Z][a-z]+\b/g);
  if (nameMatch) {
    variables.name = nameMatch[0];
    variables.userName = nameMatch[0];
  }
  
  // Extract basic descriptors
  if (content.includes('beautiful')) variables.adjective = 'beautiful';
  if (content.includes('little')) variables.adjective = 'little';
  if (content.includes('big')) variables.adjective = 'big';
  
  return variables;
}

/**
 * Substitute pattern variables using resolver with safe fallbacks
 */
function substitutePatternVariables(
  pattern: string,
  variables: Record<string, string>,
  sourceContent?: string,
  userInfo?: UserInfo
): string {
  try {
    const microContext = { userInfo, seed: variables };
    return resolveMicroPlaceholders(pattern, microContext);
  } catch (error) {
    console.warn('Pattern substitution failed:', error);
    return pattern.replace(/\{[^}]+\}/g, '___');
  }
}

/**
 * Apply opening enhancement with voice characteristics
 */
function enhanceOpeningWithVoice(content: string, styledPattern: string, voice: ColorVoice): string {
  if (voice.characteristics.includes('rhythmic') || voice.characteristics.includes('repetition')) {
    return `${styledPattern} ${content}`;
  }
  return content.startsWith(styledPattern.split(' ')[0]) ? content : `${styledPattern} ${content}`;
}

/**
 * Apply closing enhancement with voice characteristics
 */
function enhanceClosingWithVoice(content: string, styledPattern: string, voice: ColorVoice): string {
  if (voice.characteristics.includes('gentle') || voice.characteristics.includes('wisdom')) {
    return `${content} ${styledPattern}`;
  }
  return content.endsWith('.') ? `${content} ${styledPattern}` : `${content}. ${styledPattern}`;
}

/**
 * Apply transition enhancement with voice characteristics
 */
function enhanceTransitionWithVoice(content: string, styledPattern: string, voice: ColorVoice): string {
  if (voice.characteristics.includes('fast-paced') || voice.characteristics.includes('action')) {
    return `${styledPattern} ${content}`;
  }
  return content;
}