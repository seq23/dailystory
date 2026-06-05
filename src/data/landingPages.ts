import heroDiverse from "@/assets/hero-image-diverse-clear.jpg";
import homeReading from "@/assets/carousel-2-home-reading.jpg";
import outdoorReading from "@/assets/carousel-3-outdoor-reading.jpg";
import libraryReading from "@/assets/carousel-4-library-reading.jpg";

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingBenefit {
  title: string;
  body: string;
}

export interface LandingPageConfig {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  navLabel: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageAlt: string;
  intro: string[];
  benefits: LandingBenefit[];
  faqs: LandingFaq[];
  variant?: "sightWords";
}

const ageFaq = (age: string): LandingFaq => ({
  q: `Is Time2Read good for ${age}?`,
  a: `Yes. Time2Read adapts every story to your child's reading level — from pre-readers who listen along with built-in narration to confident readers who want a challenge. You set the level and the AI does the rest.`,
});

const freeFaq: LandingFaq = {
  q: "Is it really free to start?",
  a: "Yes. You can start reading instantly as a guest — no credit card required. Premium unlocks unlimited stories, saving to your library, and longer adventures.",
};

export const landingPages: LandingPageConfig[] = [
  {
    slug: "free-books-for-kindergarteners",
    title: "Free Books for Kindergarteners | Time2Read",
    metaDescription:
      "Free, personalized reading adventures for kindergarteners. Interactive stories with illustrations and read-aloud narration. Start reading instantly — no signup.",
    h1: "Free Books for Kindergarteners",
    navLabel: "Free books for kindergarteners",
    heroSubtitle:
      "Personalized, illustrated stories your kindergartener can start reading right now — completely free to try.",
    heroImage: heroDiverse,
    heroImageAlt: "Diverse kindergarteners reading an illustrated story together",
    intro: [
      "Finding free books for kindergarteners that actually hold their attention can be hard. Time2Read creates brand-new, fully illustrated stories tailored to your child's name, interests, and reading level — instantly, and free to start.",
      "Every story includes friendly illustrations on every page and built-in read-aloud narration, so even pre-readers can follow along and build confidence.",
    ],
    benefits: [
      { title: "Free to start", body: "Begin reading as a guest with no signup and no credit card." },
      { title: "A fresh story every time", body: "Stories are generated on demand, so your child never runs out of new adventures." },
      { title: "Built for ages 5–6", body: "Simple words, short pages, and pictures tuned to the kindergarten reading level." },
    ],
    faqs: [freeFaq, ageFaq("kindergarten kids"), { q: "Do the books have pictures?", a: "Every page has its own AI-generated illustration that matches the story, keeping young readers engaged." }],
  },
  {
    slug: "kindergarten-sight-words",
    title: "Kindergarten Sight Words List + Practice | Time2Read",
    metaDescription:
      "Free kindergarten sight words list to practice at home. Plus: add your child's sight words to Time2Read and our AI weaves them into personalized illustrated stories.",
    h1: "Kindergarten Sight Words",
    navLabel: "Kindergarten sight words",
    heroSubtitle:
      "Master the must-know kindergarten sight words — then watch them come to life inside personalized, AI-generated stories.",
    heroImage: homeReading,
    heroImageAlt: "Child practicing sight words while reading at home",
    intro: [
      "Sight words are the high-frequency words kids learn to recognize instantly, without sounding them out. Mastering them is one of the biggest early wins in learning to read.",
      "Below is a free kindergarten sight words list you can practice anywhere. The best part: with Time2Read you can drop your child's sight words right into the story generator, and our AI weaves those exact words into a personalized, illustrated adventure — turning flashcard practice into a story they actually want to read.",
    ],
    benefits: [
      { title: "Practice in context", body: "Seeing sight words inside a fun story helps them stick far better than flashcards alone." },
      { title: "Add your own words", body: "Type in the words your child is working on and the AI builds the story around them." },
      { title: "Repetition that's fun", body: "Each target word naturally repeats across the story for confident recognition." },
    ],
    faqs: [
      { q: "What are kindergarten sight words?", a: "Sight words are common words like 'the', 'and', 'is', and 'you' that kids should recognize instantly. They make up a huge share of everyday reading." },
      { q: "How do I add sight words to a Time2Read story?", a: "When you create a story, you can enter custom words your child is learning. The AI then weaves those exact words throughout the personalized story." },
      freeFaq,
    ],
    variant: "sightWords",
  },
  {
    slug: "toddler-books",
    title: "Toddler Books — Interactive & Read-Aloud | Time2Read",
    metaDescription:
      "Gentle, illustrated toddler books with read-aloud narration. Personalized stories your little one can enjoy on any device. Free to start.",
    h1: "Toddler Books",
    navLabel: "Toddler books",
    heroSubtitle: "Soothing, colorful stories made for toddlers — with narration so they can listen and look along.",
    heroImage: homeReading,
    heroImageAlt: "Toddler enjoying a picture book at home",
    intro: [
      "Toddlers love repetition, bright pictures, and hearing a familiar voice. Time2Read creates simple, gentle toddler books with an illustration on every page and built-in read-aloud narration.",
      "Personalize each story with your toddler's name and favorite things to make story time feel truly their own.",
    ],
    benefits: [
      { title: "Read-aloud built in", body: "Narration lets pre-readers enjoy stories independently or alongside you." },
      { title: "Simple & soothing", body: "Short pages and gentle stories perfect for little attention spans." },
      { title: "Endlessly personalized", body: "Swap in their name, pets, and favorites for a story that's all theirs." },
    ],
    faqs: [ageFaq("toddlers"), freeFaq, { q: "Can my toddler use it without reading yet?", a: "Absolutely — the read-aloud narration and illustrations are designed for pre-readers to enjoy on their own." }],
  },
  {
    slug: "books-for-kindergarten",
    title: "Books for Kindergarten — Personalized Stories | Time2Read",
    metaDescription:
      "Engaging books for kindergarten, personalized to your child's level and interests. Illustrated, read-aloud stories that build reading confidence. Free to start.",
    h1: "Books for Kindergarten",
    navLabel: "Books for kindergarten",
    heroSubtitle: "Personalized, level-appropriate stories that make kindergarten reading practice feel like play.",
    heroImage: heroDiverse,
    heroImageAlt: "Kindergarten children reading personalized books",
    intro: [
      "The right books for kindergarten meet kids exactly where they are. Time2Read generates illustrated stories tuned to the kindergarten reading level, with words and sentence lengths that build confidence instead of frustration.",
      "Each story is personalized and paired with read-aloud narration, so every child can succeed at story time.",
    ],
    benefits: [
      { title: "Right reading level", body: "Stories calibrated for kindergarteners — not too easy, not too hard." },
      { title: "Personalized", body: "Your child becomes the star of every adventure." },
      { title: "Illustrated pages", body: "A picture on every page keeps young readers engaged." },
    ],
    faqs: [ageFaq("kindergarteners"), freeFaq, { q: "Can I adjust the difficulty?", a: "Yes — you can set the reading level so stories grow with your child." }],
  },
  {
    slug: "first-grade-books",
    title: "First Grade Books — Personalized Reading | Time2Read",
    metaDescription:
      "Personalized first grade books that match your child's reading level. Illustrated, read-aloud stories to build fluency and confidence. Free to start.",
    h1: "First Grade Books",
    navLabel: "First grade books",
    heroSubtitle: "Level-perfect, personalized stories to help first graders build reading fluency and a love of books.",
    heroImage: outdoorReading,
    heroImageAlt: "First grader reading a book outdoors",
    intro: [
      "First graders are ready for slightly longer stories and richer vocabulary. Time2Read creates first grade books tuned to that level, with illustrations and optional narration for support.",
      "Personalize each adventure to keep motivation high as your child's reading skills take off.",
    ],
    benefits: [
      { title: "Builds fluency", body: "Just-right sentences help first graders read smoothly and confidently." },
      { title: "Grows with them", body: "Adjust the level any time as reading skills advance." },
      { title: "Personalized adventures", body: "Stories starring your child keep them coming back." },
    ],
    faqs: [ageFaq("first graders"), freeFaq, { q: "Are the stories longer than kindergarten books?", a: "You control the length and level, so stories can grow right alongside your first grader." }],
  },
  {
    slug: "books-for-5-year-olds",
    title: "Books for 5 Year Olds — Personalized | Time2Read",
    metaDescription:
      "Fun, personalized books for 5 year olds with illustrations and read-aloud narration. Stories tuned to their level. Free to start, no signup needed.",
    h1: "Books for 5 Year Olds",
    navLabel: "Books for 5 year olds",
    heroSubtitle: "Bright, personalized stories made for 5 year olds — with narration for early and pre-readers alike.",
    heroImage: heroDiverse,
    heroImageAlt: "Five year old child reading an illustrated story",
    intro: [
      "Five year olds are bursting with curiosity. Time2Read turns that energy into illustrated, personalized stories sized just right for them.",
      "With read-aloud narration and a picture on every page, story time works whether your child is reading or listening along.",
    ],
    benefits: [
      { title: "Just-right level", body: "Simple words and short pages perfect for age five." },
      { title: "Listen or read", body: "Built-in narration supports early and pre-readers." },
      { title: "All about them", body: "Personalize the hero, setting, and favorite things." },
    ],
    faqs: [ageFaq("5 year olds"), freeFaq, { q: "Does my child need to read already?", a: "No — narration and illustrations make every story enjoyable for pre-readers too." }],
  },
  {
    slug: "books-for-4-year-olds",
    title: "Books for 4 Year Olds — Personalized | Time2Read",
    metaDescription:
      "Gentle, personalized books for 4 year olds with read-aloud narration and illustrations. Story time tuned to their level. Free to start.",
    h1: "Books for 4 Year Olds",
    navLabel: "Books for 4 year olds",
    heroSubtitle: "Simple, joyful stories for 4 year olds — narrated and illustrated for pre-readers.",
    heroImage: homeReading,
    heroImageAlt: "Four year old listening to an illustrated story",
    intro: [
      "At four, kids love being read to and seeing themselves in stories. Time2Read creates short, gentle books for 4 year olds, personalized and read aloud.",
      "Every page has an illustration to spark imagination and keep little ones engaged.",
    ],
    benefits: [
      { title: "Short & gentle", body: "Brief stories sized for a four year old's attention span." },
      { title: "Read-aloud narration", body: "Perfect for pre-readers to enjoy independently." },
      { title: "Personalized", body: "Make your child the star of every story." },
    ],
    faqs: [ageFaq("4 year olds"), freeFaq, { q: "Is this good for pre-readers?", a: "Yes — it's built for them, with narration and pictures on every page." }],
  },
  {
    slug: "books-for-6-year-olds",
    title: "Books for 6 Year Olds — Personalized | Time2Read",
    metaDescription:
      "Engaging, personalized books for 6 year olds tuned to their reading level. Illustrated, read-aloud stories that build confidence. Free to start.",
    h1: "Books for 6 Year Olds",
    navLabel: "Books for 6 year olds",
    heroSubtitle: "Personalized stories for 6 year olds that grow with their budding reading skills.",
    heroImage: libraryReading,
    heroImageAlt: "Six year old reading a book in a library",
    intro: [
      "Six year olds are often reading on their own and ready for more. Time2Read creates personalized books for 6 year olds at just the right level, with optional narration for tricky moments.",
      "Adjust the difficulty any time so stories keep pace with your child's growth.",
    ],
    benefits: [
      { title: "Right level", body: "Stories tuned for emerging readers around age six." },
      { title: "Adjustable difficulty", body: "Level up as your child's reading improves." },
      { title: "Personalized", body: "Your child stars in every adventure." },
    ],
    faqs: [ageFaq("6 year olds"), freeFaq, { q: "Can it challenge a strong reader?", a: "Yes — raise the reading level for more advanced vocabulary and longer stories." }],
  },
  {
    slug: "read-aloud-books-for-kindergarten",
    title: "Read Aloud Books for Kindergarten | Time2Read",
    metaDescription:
      "Read-aloud books for kindergarten with built-in narration and illustrations. Personalized stories kids can listen to and follow along. Free to start.",
    h1: "Read Aloud Books for Kindergarten",
    navLabel: "Read aloud books for kindergarten",
    heroSubtitle: "Personalized stories with natural read-aloud narration — perfect for kindergarten story time.",
    heroImage: outdoorReading,
    heroImageAlt: "Kindergartener following along with a read-aloud story",
    intro: [
      "Read-aloud books for kindergarten help kids connect spoken words to written ones. Time2Read narrates every personalized story with a clear, friendly voice while highlighting the page.",
      "It's perfect for the classroom carpet, the car, or bedtime — and free to start.",
    ],
    benefits: [
      { title: "Natural narration", body: "Clear text-to-speech reads every story aloud." },
      { title: "Follow along", body: "Kids connect spoken and written words as they listen." },
      { title: "Anywhere", body: "Great for circle time, the car, or winding down at night." },
    ],
    faqs: [ageFaq("kindergarten read-aloud time"), freeFaq, { q: "Can the class listen together?", a: "Yes — play the narration aloud so the whole class can follow along on screen." }],
  },
  {
    slug: "books-for-toddlers",
    title: "Books for Toddlers — Personalized & Narrated | Time2Read",
    metaDescription:
      "Gentle, personalized books for toddlers with read-aloud narration and illustrations on every page. Free to start, no signup needed.",
    h1: "Books for Toddlers",
    navLabel: "Books for toddlers",
    heroSubtitle: "Sweet, simple stories for toddlers — narrated and illustrated, personalized just for them.",
    heroImage: homeReading,
    heroImageAlt: "Toddler enjoying a personalized picture book",
    intro: [
      "Books for toddlers should be short, colorful, and comforting. Time2Read delivers exactly that — personalized stories with a picture on every page and gentle narration.",
      "Add your toddler's name and favorites to make every story feel familiar and special.",
    ],
    benefits: [
      { title: "Toddler-sized", body: "Short, simple stories that fit little attention spans." },
      { title: "Narrated", body: "Read-aloud audio lets pre-readers enjoy on their own." },
      { title: "Personalized", body: "Their name and favorites star in every story." },
    ],
    faqs: [ageFaq("toddlers"), freeFaq, { q: "Are the stories calming for bedtime?", a: "Yes — gentle stories and soft narration make a cozy bedtime routine." }],
  },
  {
    slug: "books-for-preschoolers",
    title: "Books for Preschoolers — Personalized | Time2Read",
    metaDescription:
      "Fun, personalized books for preschoolers with illustrations and read-aloud narration. Stories tuned to early learners. Free to start.",
    h1: "Books for Preschoolers",
    navLabel: "Books for preschoolers",
    heroSubtitle: "Playful, personalized stories that get preschoolers excited about reading.",
    heroImage: heroDiverse,
    heroImageAlt: "Preschooler reading an illustrated personalized story",
    intro: [
      "Preschoolers are building the early skills that lead to reading. Time2Read makes books for preschoolers that are fun, simple, and personalized — with narration and illustrations to support them.",
      "Story time becomes a daily adventure your preschooler asks for again and again.",
    ],
    benefits: [
      { title: "Early-learner level", body: "Simple words and short pages built for preschoolers." },
      { title: "Narrated", body: "Read-aloud audio supports pre-readers." },
      { title: "Personalized", body: "Your child is the hero of every story." },
    ],
    faqs: [ageFaq("preschoolers"), freeFaq, { q: "Will it help prepare for kindergarten?", a: "Yes — daily story time builds vocabulary and print awareness that set kids up for kindergarten." }],
  },
  {
    slug: "leveled-readers",
    title: "Leveled Readers — Personalized & Adaptive | Time2Read",
    metaDescription:
      "Personalized leveled readers that adapt to your child's reading level — from pre-K to grade school. Illustrated, narrated stories. Free to start.",
    h1: "Leveled Readers",
    navLabel: "Leveled readers",
    heroSubtitle: "Adaptive, personalized leveled readers that grow with your child — set the level and go.",
    heroImage: libraryReading,
    heroImageAlt: "Child choosing a leveled reader in a library",
    intro: [
      "Leveled readers help kids practice at just the right difficulty. Time2Read generates personalized leveled readers across five reading levels, so every child gets a story that fits.",
      "As skills grow, simply raise the level — no need to buy a whole new set of books.",
    ],
    benefits: [
      { title: "Five reading levels", body: "From pre-readers to confident grade-schoolers." },
      { title: "Adapts instantly", body: "Change the level and the next story matches." },
      { title: "Personalized", body: "Engaging stories starring your child at every level." },
    ],
    faqs: [
      { q: "What reading levels are available?", a: "Time2Read spans five levels from pre-K through grade school, so you can match your child precisely." },
      freeFaq,
      { q: "Can siblings at different levels use it?", a: "Yes — set up profiles at different levels and each child gets level-appropriate stories." },
    ],
  },
  {
    slug: "short-bedtime-stories-for-kids",
    title: "Short Bedtime Stories for Kids | Time2Read",
    metaDescription:
      "Personalized short bedtime stories for kids with gentle narration and illustrations. Calm, cozy stories on demand. Free to start, no signup needed.",
    h1: "Short Bedtime Stories for Kids",
    navLabel: "Short bedtime stories for kids",
    heroSubtitle: "Cozy, personalized short bedtime stories your kids will ask for night after night.",
    heroImage: homeReading,
    heroImageAlt: "Child listening to a short bedtime story before sleep",
    intro: [
      "A short bedtime story is the perfect way to wind down. Time2Read creates personalized, gentle bedtime stories on demand, with soft narration and soothing illustrations.",
      "Pick your child's favorite characters and themes for a calming routine that never repeats.",
    ],
    benefits: [
      { title: "Short & calming", body: "Just-right length to settle little ones for sleep." },
      { title: "Gentle narration", body: "Soft read-aloud audio for a cozy wind-down." },
      { title: "Personalized", body: "Your child stars in a new bedtime adventure every night." },
    ],
    faqs: [ageFaq("bedtime story time"), freeFaq, { q: "Can I get a new story every night?", a: "Yes — stories are generated on demand, so bedtime never gets repetitive." }],
  },
];

export const landingPagesBySlug: Record<string, LandingPageConfig> = Object.fromEntries(
  landingPages.map((p) => [p.slug, p]),
);

export const kindergartenSightWords: string[] = [
  "all", "am", "are", "at", "ate", "be", "black", "brown", "but", "came",
  "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
  "must", "new", "no", "now", "on", "our", "out", "please", "pretty", "ran",
  "ride", "saw", "say", "she", "so", "soon", "that", "there", "they", "this",
  "too", "under", "want", "was", "well", "went", "what", "white", "who", "will",
  "with", "yes",
];
