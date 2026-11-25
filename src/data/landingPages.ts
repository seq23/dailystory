import heroDiverse from "@/assets/hero-image-diverse-clear.jpg";
import homeReading from "@/assets/carousel-2-home-reading.jpg";
import outdoorReading from "@/assets/carousel-3-outdoor-reading.jpg";
import { guidePages } from "./guidePages";
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
  variant?: "sightWords" | "readingLog";
  /** "guide" pages carry article sections and cited sources; collections do not. */
  kind?: "collection" | "guide";
  sections?: LandingSection[];
  /** Every figure on a guide page comes from one of these, fetched when written. */
  sources?: LandingSource[];
}

export interface LandingSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LandingSource {
  label: string;
  url: string;
}

const ageFaq = (age: string): LandingFaq => ({
  q: `Is Time-2-Read good for ${age}?`,
  a: `Yes. Time-2-Read adapts every story to your child's reading level — from pre-readers who listen along with built-in narration to confident readers who want a challenge. You set the level and the AI does the rest.`,
});

const freeFaq: LandingFaq = {
  q: "Is it really free to start?",
  a: "Yes. You can start reading instantly as a guest — no credit card required. Premium unlocks unlimited stories, saving to your library, and longer adventures.",
};

const collectionPages: LandingPageConfig[] = [
  {
    slug: "free-books-for-kindergarteners",
    title: "Free Books for Kindergarteners | Time-2-Read",
    metaDescription:
      "Free, personalized reading adventures for kindergarteners. Interactive stories with illustrations and read-aloud narration. Start reading instantly — no signup.",
    h1: "Free Books for Kindergarteners",
    navLabel: "Free books for kindergarteners",
    heroSubtitle:
      "Personalized, illustrated stories your kindergartener can start reading right now — completely free to try.",
    heroImage: heroDiverse,
    heroImageAlt: "Diverse kindergarteners reading an illustrated story together",
    intro: [
      "Finding free books for kindergarteners that actually hold their attention can be hard. Time-2-Read creates brand-new, fully illustrated stories made around your child's name, interests, and reading level — instantly, and free to start.",
      "Every story includes friendly illustrations on every page and built-in read-aloud narration, so even pre-readers can follow along and build confidence.",
    ],
    benefits: [
      { title: "Free to start", body: "Begin reading as a guest with no signup and no credit card." },
      { title: "A fresh story every time", body: "Stories are generated on demand, so your child never runs out of new adventures." },
      { title: "Built for ages 5–6", body: "Simple words, short pages, and pictures tuned to the kindergarten reading level." },
    ],
    sections: [
      {
        heading: "What do you get free, and what needs Premium?",
        paragraphs: [
          "A guest can start a kindergarten story with no account and no card. The free stories are complete: every page is illustrated, narration reads each page aloud, and the words are written at the Kindergarten level (about age 5), an emergent-reader level built on short sentences and sight words.",
          "Premium is for families who read every day: unlimited stories, a saved library your child can go back to, and longer adventures. Nothing in a free story is cut short to push an upgrade.",
        ],
      },
      {
        heading: "How do you make a free story feel like your kindergartener's own?",
        bullets: [
          "Type your child's first name so they are the hero on every page.",
          "Pick one thing they love right now (dinosaurs, a pet, the playground) as the story's subject.",
          "Choose the Kindergarten level, then read the first page together before letting narration take over.",
        ],
      },
    ],
    faqs: [freeFaq, ageFaq("kindergarten kids"), { q: "Do the books have pictures?", a: "Every page has its own AI-generated illustration that matches the story, keeping young readers engaged." }],
  },
  {
    slug: "kindergarten-sight-words",
    title: "Kindergarten Sight Words List + Practice | Time-2-Read",
    metaDescription:
      "Free kindergarten sight words list to practice at home. Time-2-Read's beginner stories are built on Dolch sight words, with your child as the hero.",
    h1: "Kindergarten Sight Words",
    navLabel: "Kindergarten sight words",
    heroSubtitle:
      "Master the must-know kindergarten sight words, then meet them again and again inside personalized, illustrated stories.",
    heroImage: homeReading,
    heroImageAlt: "Child practicing sight words while reading at home",
    intro: [
      "Sight words are the high-frequency words kids learn to recognize instantly, without sounding them out. Mastering them is one of the biggest early wins in learning to read.",
      "Below is a free kindergarten sight words list you can practice anywhere. Then put the words to work: Time-2-Read's beginner reading levels are written mostly with Dolch sight words, so your child keeps meeting them inside a personalized, illustrated story they actually want to read.",
    ],
    benefits: [
      { title: "Practice in context", body: "Seeing sight words inside a fun story helps them stick far better than flashcards alone." },
      { title: "Built on Dolch words", body: "Beginner levels lean on the Dolch pre-primer, primer and grade 1 sight word lists." },
      { title: "Repetition that's fun", body: "Common sight words come up again and again across every beginner story." },
    ],
    sections: [
      {
        heading: "How do you practise sight words at home?",
        bullets: [
          "Pick three or four words from the list a week, not the whole list at once.",
          "Say the word, spell it together, then find it in a story.",
          "Read a beginner-level Time-2-Read story and ask your child to point to each practice word they spot.",
          "Come back to last week's words before adding new ones.",
        ],
      },
    ],
    faqs: [
      { q: "What are kindergarten sight words?", a: "Sight words are common words like 'the', 'and', 'is', and 'you' that kids should recognize instantly. They make up a huge share of everyday reading." },
      { q: "Can I type my child's own sight words into a Time-2-Read story?", a: "Not at the moment. Choose a beginner reading level: those stories are written mostly with Dolch sight words. Keep practicing your class list with the printable list on this page." },
      freeFaq,
    ],
    variant: "sightWords",
  },
  {
    slug: "toddler-books",
    title: "Toddler Books — Interactive & Read-Aloud | Time-2-Read",
    metaDescription:
      "Gentle, illustrated toddler books with read-aloud narration. Personalized stories your little one can enjoy on any device. Free to start.",
    h1: "Toddler Books",
    navLabel: "Toddler books",
    heroSubtitle: "Soothing, colorful stories made for toddlers — with narration so they can listen and look along.",
    heroImage: homeReading,
    heroImageAlt: "Toddler enjoying a picture book at home",
    intro: [
      "Toddlers love repetition, bright pictures, and hearing a familiar voice. Time-2-Read creates simple, gentle toddler books with an illustration on every page and built-in read-aloud narration.",
      "Personalize each story with your toddler's name and favorite things to make story time feel truly their own.",
    ],
    benefits: [
      { title: "Read-aloud built in", body: "Narration lets pre-readers enjoy stories independently or alongside you." },
      { title: "Simple & soothing", body: "Short pages and gentle stories perfect for little attention spans." },
      { title: "Endlessly personalized", body: "Swap in their name, pets, and favorites for a story that's all theirs." },
    ],
    sections: [
      {
        heading: "Is there a toddler reading level?",
        paragraphs: [
          "No. Time-2-Read's youngest level is Pre-K, written for about age 4 as a read-aloud picture-book level. For a two- or three-year-old that works as a shared book: you hold the screen, the narration reads, and your toddler points at the picture on each page.",
          "Keep the session to one short story. Toddlers get more from hearing the same story twice than from three new ones, so save the stories they ask for and replay them.",
        ],
      },
      {
        heading: "What should a toddler story be about?",
        bullets: [
          "Their own day: bath time, the park, the car seat, a grandparent's visit.",
          "One animal or object they already name out loud.",
          "A tiny problem with a happy ending: a lost shoe found, a puppy who gets home.",
        ],
      },
    ],
    faqs: [ageFaq("toddlers"), freeFaq, { q: "Can my toddler use it without reading yet?", a: "Absolutely — the read-aloud narration and illustrations are designed for pre-readers to enjoy on their own." }],
  },
  {
    slug: "books-for-kindergarten",
    title: "Books for Kindergarten — Personalized Stories | Time-2-Read",
    metaDescription:
      "Engaging books for kindergarten, personalized to your child's level and interests. Illustrated, read-aloud stories that build reading confidence. Free to start.",
    h1: "Books for Kindergarten",
    navLabel: "Books for kindergarten",
    heroSubtitle: "Personalized, level-appropriate stories that make kindergarten reading practice feel like play.",
    heroImage: heroDiverse,
    heroImageAlt: "Kindergarten children reading personalized books",
    intro: [
      "The right books for kindergarten meet kids exactly where they are. Time-2-Read generates illustrated stories tuned to the kindergarten reading level, with words and sentence lengths that build confidence instead of frustration.",
      "Each story is personalized and paired with read-aloud narration, so every child can succeed at story time.",
    ],
    benefits: [
      { title: "Right reading level", body: "Stories calibrated for kindergarteners — not too easy, not too hard." },
      { title: "Personalized", body: "Your child becomes the star of every adventure." },
      { title: "Illustrated pages", body: "A picture on every page keeps young readers engaged." },
    ],
    sections: [
      {
        heading: "What reading level should a kindergartener pick?",
        paragraphs: [
          "Start at the Kindergarten level (about age 5). It is an emergent-reader level: short sentences, many repeated sight words and a picture that carries most of the meaning. If your child reads a whole page without help, try the next level up; if they stop on most words, step back to Pre-K and read together.",
          "A child who is working on sight words at school will meet the same high-frequency words in these stories, which is the practice the classroom asks for.",
        ],
      },
      {
        heading: "How long should a kindergarten reading session be?",
        paragraphs: [
          "One story at a time. A kindergarten story is a few short pages, so it fits before school, in the car or at bedtime. Ask one question at the end (what did the hero do first?) to turn listening into understanding.",
        ],
      },
    ],
    faqs: [ageFaq("kindergarteners"), freeFaq, { q: "Can I adjust the difficulty?", a: "Yes — you can set the reading level so stories grow with your child." }],
  },
  {
    slug: "first-grade-books",
    title: "First Grade Books — Personalized Reading | Time-2-Read",
    metaDescription:
      "Personalized first grade books that match your child's reading level. Illustrated, read-aloud stories to build fluency and confidence. Free to start.",
    h1: "First Grade Books",
    navLabel: "First grade books",
    heroSubtitle: "Level-perfect, personalized stories to help first graders build reading fluency and a love of books.",
    heroImage: outdoorReading,
    heroImageAlt: "First grader reading a book outdoors",
    intro: [
      "First graders are ready for slightly longer stories and richer vocabulary. Time-2-Read creates first grade books tuned to that level, with illustrations and optional narration for support.",
      "Personalize each adventure to keep motivation high as your child's reading skills take off.",
    ],
    benefits: [
      { title: "Builds fluency", body: "Just-right sentences help first graders read smoothly and confidently." },
      { title: "Grows with them", body: "Adjust the level any time as reading skills advance." },
      { title: "Personalized adventures", body: "Stories starring your child keep them coming back." },
    ],
    sections: [
      {
        heading: "What changes between kindergarten and first grade books?",
        paragraphs: [
          "First grade stories at Time-2-Read are written at an early-reader level (about age 6): more sentences on a page, more words a child has to decode rather than recognise on sight, and a plot that runs across several pages instead of one picture at a time.",
          "That is the year many children move from being read to into reading out loud themselves, so narration becomes the backup rather than the main voice.",
        ],
      },
      {
        heading: "How do you use narration without doing the reading for them?",
        bullets: [
          "Let your first grader read the page first, then play the narration to check.",
          "Play narration only for the sentence they are stuck on, not the whole page.",
          "When most pages go without help, move up to the 2nd grade level.",
        ],
      },
    ],
    faqs: [ageFaq("first graders"), freeFaq, { q: "Are the stories longer than kindergarten books?", a: "You control the length and level, so stories can grow right alongside your first grader." }],
  },
  {
    slug: "books-for-5-year-olds",
    title: "Books for 5 Year Olds — Personalized | Time-2-Read",
    metaDescription:
      "Fun, personalized books for 5 year olds with illustrations and read-aloud narration. Stories tuned to their level. Free to start, no signup needed.",
    h1: "Books for 5 Year Olds",
    navLabel: "Books for 5 year olds",
    heroSubtitle: "Bright, personalized stories made for 5 year olds — with narration for early and pre-readers alike.",
    heroImage: heroDiverse,
    heroImageAlt: "Five year old child reading an illustrated story",
    intro: [
      "Five year olds are bursting with curiosity. Time-2-Read turns that energy into illustrated, personalized stories sized just right for them.",
      "With read-aloud narration and a picture on every page, story time works whether your child is reading or listening along.",
    ],
    benefits: [
      { title: "Just-right level", body: "Simple words and short pages perfect for age five." },
      { title: "Listen or read", body: "Built-in narration supports early and pre-readers." },
      { title: "All about them", body: "Personalize the hero, setting, and favorite things." },
    ],
    sections: [
      {
        heading: "Can a 5 year old read on their own yet?",
        paragraphs: [
          "Some can and many cannot, and both are ordinary at five. Most five year olds are in kindergarten or about to start, so Time-2-Read's Kindergarten level (an emergent-reader level) fits most of them. A child who already reads simple books can move to the 1st grade level.",
          "For a five year old who is not reading yet, use narration as the reader and let them say the last word of each sentence. It turns listening into a first step at reading.",
        ],
      },
      {
        heading: "What story topics hold a 5 year old's attention?",
        bullets: [
          "A story where they solve the problem, not a grown-up.",
          "Silly situations: a pet that talks, a sandwich that will not be eaten.",
          "Something from this week: a first day at school, a loose tooth, a new sibling.",
        ],
      },
    ],
    faqs: [ageFaq("5 year olds"), freeFaq, { q: "Does my child need to read already?", a: "No — narration and illustrations make every story enjoyable for pre-readers too." }],
  },
  {
    slug: "books-for-4-year-olds",
    title: "Books for 4 Year Olds — Personalized | Time-2-Read",
    metaDescription:
      "Gentle, personalized books for 4 year olds with read-aloud narration and illustrations. Story time tuned to their level. Free to start.",
    h1: "Books for 4 Year Olds",
    navLabel: "Books for 4 year olds",
    heroSubtitle: "Simple, joyful stories for 4 year olds — narrated and illustrated for pre-readers.",
    heroImage: homeReading,
    heroImageAlt: "Four year old listening to an illustrated story",
    intro: [
      "At four, kids love being read to and seeing themselves in stories. Time-2-Read creates short, gentle books for 4 year olds, personalized and read aloud.",
      "Every page has an illustration to spark imagination and keep little ones engaged.",
    ],
    benefits: [
      { title: "Short & gentle", body: "Brief stories sized for a four year old's attention span." },
      { title: "Read-aloud narration", body: "Perfect for pre-readers to enjoy independently." },
      { title: "Personalized", body: "Make your child the star of every story." },
    ],
    sections: [
      {
        heading: "Which level is right for a 4 year old?",
        paragraphs: [
          "Pre-K. It is Time-2-Read's youngest level, written for about age 4 as a read-aloud picture-book level: a grown-up or the narration reads, and the child follows the pictures. Four year olds are not expected to read the words yet.",
          "If your four year old already knows some letters and a few words, keep Pre-K and point at those words as the narration says them.",
        ],
      },
      {
        heading: "How do you build pre-reading skills with a 4 year old?",
        bullets: [
          "Pause before the last word of a rhyme and let them fill it in.",
          "Ask what they think happens on the next page before you turn it.",
          "Let them choose the hero's name and pet; four year olds love being in charge of the story.",
        ],
      },
    ],
    faqs: [ageFaq("4 year olds"), freeFaq, { q: "Is this good for pre-readers?", a: "Yes — it's built for them, with narration and pictures on every page." }],
  },
  {
    slug: "books-for-6-year-olds",
    title: "Books for 6 Year Olds — Personalized | Time-2-Read",
    metaDescription:
      "Engaging, personalized books for 6 year olds tuned to their reading level. Illustrated, read-aloud stories that build confidence. Free to start.",
    h1: "Books for 6 Year Olds",
    navLabel: "Books for 6 year olds",
    heroSubtitle: "Personalized stories for 6 year olds that grow with their budding reading skills.",
    heroImage: libraryReading,
    heroImageAlt: "Six year old reading a book in a library",
    intro: [
      "Six year olds are often reading on their own and ready for more. Time-2-Read creates personalized books for 6 year olds at just the right level, with optional narration for tricky moments.",
      "Adjust the difficulty any time so stories keep pace with your child's growth.",
    ],
    benefits: [
      { title: "Right level", body: "Stories tuned for emerging readers around age six." },
      { title: "Adjustable difficulty", body: "Level up as your child's reading improves." },
      { title: "Personalized", body: "Your child stars in every adventure." },
    ],
    sections: [
      {
        heading: "What should a 6 year old be able to read?",
        paragraphs: [
          "At six most children are in first grade, where the 1st grade level (an early-reader level) fits. Children differ widely at this age: one six year old needs narration on every page, another is ready for 2nd grade stories with longer sentences. Both are normal.",
          "The level is not fixed by age. Change it whenever a story feels too easy or too hard; the next story follows the new level.",
        ],
      },
      {
        heading: "How do you keep a 6 year old reading every day?",
        bullets: [
          "Let them pick the topic; choice matters more than the level.",
          "Have them read one page aloud to you and let narration read the rest.",
          "Save the stories they like so they can reread them on their own.",
        ],
      },
    ],
    faqs: [ageFaq("6 year olds"), freeFaq, { q: "Can it challenge a strong reader?", a: "Yes — raise the reading level for more advanced vocabulary and longer stories." }],
  },
  {
    slug: "read-aloud-books-for-kindergarten",
    title: "Read Aloud Books for Kindergarten | Time-2-Read",
    metaDescription:
      "Read-aloud books for kindergarten with built-in narration and illustrations. Personalized stories kids can listen to and follow along. Free to start.",
    h1: "Read Aloud Books for Kindergarten",
    navLabel: "Read aloud books for kindergarten",
    heroSubtitle: "Personalized stories with natural read-aloud narration — perfect for kindergarten story time.",
    heroImage: outdoorReading,
    heroImageAlt: "Kindergartener following along with a read-aloud story",
    intro: [
      "Read-aloud books for kindergarten help kids connect spoken words to written ones. Time-2-Read narrates every personalized story with a clear, friendly voice while highlighting the page.",
      "It's perfect for the classroom carpet, the car, or bedtime — and free to start.",
    ],
    benefits: [
      { title: "Natural narration", body: "Clear text-to-speech reads every story aloud." },
      { title: "Follow along", body: "Kids connect spoken and written words as they listen." },
      { title: "Anywhere", body: "Great for circle time, the car, or winding down at night." },
    ],
    sections: [
      {
        heading: "Why read aloud to kindergarteners who are learning to read?",
        paragraphs: [
          "Because a kindergartener can understand far more words by ear than they can read on a page. Hearing a story read aloud builds the vocabulary and sense of story that their own reading will later use, while the text on screen shows that the spoken words are written down.",
          "In Time-2-Read every page has narration, so the same story works for listening first and for reading along on the second pass.",
        ],
      },
      {
        heading: "How do teachers use read-aloud stories in class?",
        bullets: [
          "Project the story and play the narration for carpet time.",
          "Make a class story: the class votes on the hero's name and adventure.",
          "Stop before the last page and ask the class to predict the ending.",
        ],
      },
    ],
    faqs: [ageFaq("kindergarten read-aloud time"), freeFaq, { q: "Can the class listen together?", a: "Yes — play the narration aloud so the whole class can follow along on screen." }],
  },
  {
    slug: "books-for-toddlers",
    title: "Books for Toddlers — Personalized & Narrated | Time-2-Read",
    metaDescription:
      "Gentle, personalized books for toddlers with read-aloud narration and illustrations on every page. Free to start, no signup needed.",
    h1: "Books for Toddlers",
    navLabel: "Books for toddlers",
    heroSubtitle: "Sweet, simple stories for toddlers — narrated and illustrated, personalized just for them.",
    heroImage: homeReading,
    heroImageAlt: "Toddler enjoying a personalized picture book",
    intro: [
      "Books for toddlers should be short, colorful, and comforting. Time-2-Read delivers exactly that — personalized stories with a picture on every page and gentle narration.",
      "Add your toddler's name and favorites to make every story feel familiar and special.",
    ],
    benefits: [
      { title: "Toddler-sized", body: "Short, simple stories that fit little attention spans." },
      { title: "Narrated", body: "Read-aloud audio lets pre-readers enjoy on their own." },
      { title: "Personalized", body: "Their name and favorites star in every story." },
    ],
    sections: [
      {
        heading: "How young can a child start with Time-2-Read?",
        paragraphs: [
          "The stories are written for ages 3 and up; the youngest level is Pre-K (about age 4), a read-aloud picture-book level. Under three, treat it as a book you share rather than an app your child uses alone: sit together, let the narration read and talk about the pictures.",
        ],
      },
      {
        heading: "How do you read with a toddler who will not sit still?",
        bullets: [
          "Read in short bursts: one page, a chat about the picture, then the next.",
          "Let them swipe to the next page; turning pages is part of the fun.",
          "Read at the same time each day, such as after the bath, so it becomes routine.",
          "Stop while it is still fun, even halfway through.",
        ],
      },
    ],
    faqs: [ageFaq("toddlers"), freeFaq, { q: "Are the stories calming for bedtime?", a: "Yes — gentle stories and soft narration make a cozy bedtime routine." }],
  },
  {
    slug: "books-for-preschoolers",
    title: "Books for Preschoolers — Personalized | Time-2-Read",
    metaDescription:
      "Fun, personalized books for preschoolers with illustrations and read-aloud narration. Stories tuned to early learners. Free to start.",
    h1: "Books for Preschoolers",
    navLabel: "Books for preschoolers",
    heroSubtitle: "Playful, personalized stories that get preschoolers excited about reading.",
    heroImage: heroDiverse,
    heroImageAlt: "Preschooler reading an illustrated personalized story",
    intro: [
      "Preschoolers are building the early skills that lead to reading. Time-2-Read makes books for preschoolers that are fun, simple, and personalized — with narration and illustrations to support them.",
      "Story time becomes a daily adventure your preschooler asks for again and again.",
    ],
    benefits: [
      { title: "Early-learner level", body: "Simple words and short pages built for preschoolers." },
      { title: "Narrated", body: "Read-aloud audio supports pre-readers." },
      { title: "Personalized", body: "Your child is the hero of every story." },
    ],
    sections: [
      {
        heading: "What early skills do preschool stories practise?",
        paragraphs: [
          "Preschoolers are not expected to read, but they are learning that print carries meaning, that words have sounds and that stories have a beginning, middle and end. Pre-K stories are written at a read-aloud picture-book level to give them all three: a clear plot, simple repeated phrases and a picture that matches every page.",
        ],
      },
      {
        heading: "How do you use one story to get ready for kindergarten?",
        bullets: [
          "Find the first letter of your child's name in the story text.",
          "Ask them to retell the story in their own words after the last page.",
          "Read the same story again tomorrow and let them tell you what comes next.",
        ],
      },
    ],
    faqs: [ageFaq("preschoolers"), freeFaq, { q: "Will it help prepare for kindergarten?", a: "Yes — daily story time builds vocabulary and print awareness that set kids up for kindergarten." }],
  },
  {
    slug: "leveled-readers",
    title: "Leveled Readers — Personalized & Adaptive | Time-2-Read",
    metaDescription:
      "Personalized leveled readers that adapt to your child's reading level — from pre-K to grade school. Illustrated, narrated stories. Free to start.",
    h1: "Leveled Readers",
    navLabel: "Leveled readers",
    heroSubtitle: "Adaptive, personalized leveled readers that grow with your child — set the level and go.",
    heroImage: libraryReading,
    heroImageAlt: "Child choosing a leveled reader in a library",
    intro: [
      "Leveled readers help kids practice at just the right difficulty. Time-2-Read generates personalized leveled readers across five reading levels, so every child gets a story that fits.",
      "As skills grow, simply raise the level — no need to buy a whole new set of books.",
    ],
    benefits: [
      { title: "Five reading levels", body: "From pre-readers to confident grade-schoolers." },
      { title: "Adapts instantly", body: "Change the level and the next story matches." },
      { title: "Personalized", body: "Engaging stories starring your child at every level." },
    ],
    sections: [
      {
        heading: "How do Time-2-Read's levels line up with school grades?",
        paragraphs: [
          "There are five reading levels (pre-reader, beginner, developing, independent and advanced), and each story is also written for a school grade from Pre-K to 10th grade. The grade sets the words and sentence length; the age you enter keeps the themes right for the reader, so an older child who reads below grade gets easier words without a babyish story.",
        ],
      },
      {
        heading: "How do you know when to change a level?",
        bullets: [
          "Too hard: your child stops on more than a few words a page, or loses the thread of the plot.",
          "Too easy: they read every page fluently and get bored before the end.",
          "Just right: a few new words a page, and they can tell you what happened.",
        ],
      },
    ],
    faqs: [
      { q: "What reading levels are available?", a: "Time-2-Read spans five levels from pre-K through grade school, so you can match your child precisely." },
      freeFaq,
      { q: "Can siblings at different levels use it?", a: "Yes — set up profiles at different levels and each child gets level-appropriate stories." },
    ],
  },
  {
    slug: "short-bedtime-stories-for-kids",
    title: "Short Bedtime Stories for Kids | Time-2-Read",
    metaDescription:
      "Personalized short bedtime stories for kids with gentle narration and illustrations. Calm, cozy stories on demand. Free to start, no signup needed.",
    h1: "Short Bedtime Stories for Kids",
    navLabel: "Short bedtime stories for kids",
    heroSubtitle: "Cozy, personalized short bedtime stories your kids will ask for night after night.",
    heroImage: homeReading,
    heroImageAlt: "Child listening to a short bedtime story before sleep",
    intro: [
      "A short bedtime story is the perfect way to wind down. Time-2-Read creates personalized, gentle bedtime stories on demand, with soft narration and soothing illustrations.",
      "Pick your child's favorite characters and themes for a calming routine that never repeats.",
    ],
    benefits: [
      { title: "Short & calming", body: "Just-right length to settle little ones for sleep." },
      { title: "Gentle narration", body: "Soft read-aloud audio for a cozy wind-down." },
      { title: "Personalized", body: "Your child stars in a new bedtime adventure every night." },
    ],
    sections: [
      {
        heading: "How short is a short bedtime story?",
        paragraphs: [
          "Short enough to finish before eyes close: a few pages for younger children, a little longer for older ones, set by the reading level you choose. A short story read every night does more for a bedtime routine than a long one read now and then.",
        ],
      },
      {
        heading: "What makes a bedtime story calming?",
        bullets: [
          "A quiet setting: a sleepy forest, a night sky, a cosy home.",
          "A small, safe problem that resolves gently; no chases or cliffhangers.",
          "An ending where the hero goes to sleep too.",
          "Narration played softly, with the screen brightness turned down.",
        ],
      },
    ],
    faqs: [ageFaq("bedtime story time"), freeFaq, { q: "Can I get a new story every night?", a: "Yes — stories are generated on demand, so bedtime never gets repetitive." }],
  },
];

export const landingPages: LandingPageConfig[] = [...guidePages, ...collectionPages];

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
