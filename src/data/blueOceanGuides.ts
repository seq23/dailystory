// Guide pages for the low-competition ("blue ocean") queries chosen on 25 Oct 2026 from
// Google autocomplete expansions, Search Console and the live top results for each query.
// The full ranked list, with evidence and the queries not yet built, lives in
// docs/search/blue-ocean-queries.md.
// Every figure here comes from a source listed on the same page, checked when written.
// No invented stats, no testimonials, no medical claims (ADHD / struggling-reader pages are
// supportive and never claim to treat or diagnose anything). These pages collect nothing:
// no form, no input, no email capture (COPPA).
import outdoorReading from "@/assets/carousel-3-outdoor-reading.jpg";
import homeReading from "@/assets/carousel-2-home-reading.jpg";
import libraryReading from "@/assets/carousel-4-library-reading.jpg";
import carReading from "@/assets/carousel-1-car-reading.jpg";
import heroDiverse from "@/assets/hero-image-diverse-clear.jpg";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import type { LandingPageConfig } from "./landingPages";

const pricingAnswer = `Your first ${FREE_STORY_LIMIT} stories are free. After that, Premium starts with a ${TRIAL_DAYS}-day free trial, then costs ${PLAN_PRICES.monthly.label}${PLAN_PRICES.monthly.period} or ${PLAN_PRICES.annual.label}${PLAN_PRICES.annual.period}.`;

const SOURCES = {
  anderson1988Eric: {
    label:
      "Anderson, Wilson & Fielding (1988), \"Growth in reading and how children spend their time outside of school\" (technical report on ERIC, ED275992, full text PDF; Table 3)",
    url: "https://files.eric.ed.gov/fulltext/ED275992.pdf",
  },
  lucid2023: {
    label: "LUCiD (University of Manchester research centre), \"Supporting daily reading for the reluctant reader\"",
    url: "https://lucid.ac.uk/seminars-news-events-blog/blogs/supporting-daily-reading-for-the-reluctant-reader",
  },
  understoodRefuse: {
    label: "Elizabeth Babbin, EdD, \"6 reasons why kids refuse to read\", Understood.org",
    url: "https://www.understood.org/en/articles/6-reasons-why-kids-refuse-to-read",
  },
  booktrustAdhd: {
    label: "Soli Lazarus, \"How to engage children with ADHD in reading\", BookTrust",
    url: "https://www.booktrust.org.uk/resources/find-resources/how-to-engage-children-with-adhd-in-reading/",
  },
  readingRocketsHiLo: {
    label: "Reading Rockets, \"High/Low Books for Children\"",
    url: "https://www.readingrockets.org/article/highlow-books-children",
  },
  readingRocketsFluency2: {
    label: "Reading Rockets, \"Fluency activities for your second grader\"",
    url: "https://www.readingrockets.org/reading-101-guide-parents/second-grade/fluency-activities-your-second-grader",
  },
  dolch: {
    label: "\"Dolch word list\", Wikipedia (Edward W. Dolch, 1936 and 1948)",
    url: "https://en.wikipedia.org/wiki/Dolch_word_list",
  },
  colorin: {
    label: "Colorín Colorado, \"Share 8 Great Reading Tips with Families (in 16 languages)\"",
    url: "https://www.colorincolorado.org/reading/",
  },
  kucirkova: {
    label: "Natalia Kucirkova's published research on personalised books and digital personalisation",
    url: "https://www.nataliakucirkova.com/early-personalisation",
  },
};

export const blueOceanGuides: LandingPageConfig[] = [
  {
    slug: "is-reading-20-minutes-a-day-enough",
    kind: "guide",
    title: "Is Reading 20 Minutes a Day Enough? The Research | Time2Read",
    metaDescription:
      "Where the \"20 minutes a day\" rule comes from, what the 1.8 million words figure means, how long kids should read by age, and how to make it stick.",
    h1: "Is Reading 20 Minutes a Day Enough?",
    navLabel: "Is 20 minutes of reading a day enough?",
    heroSubtitle:
      "The short answer: 20 minutes is a good daily goal, not a magic number. Here is where it comes from, what it adds up to, and how to make it happen.",
    heroImage: libraryReading,
    heroImageAlt: "Child reading a book in a library",
    intro: [
      "\"Read for 20 minutes every night\" is on homework sheets everywhere. Parents reasonably ask: is 20 minutes enough? Is it too much for a six-year-old? And is that famous \"1.8 million words a year\" chart real?",
      "This guide goes back to the study the chart's numbers come from, explains what they do and don't show, and gives a sensible, age-by-age way to think about daily reading time.",
    ],
    benefits: [
      { title: "A goal, not a test", body: "Researchers describe 20 minutes as a guide. Short days are fine; steady days matter most." },
      { title: "The numbers, checked", body: "We read the original 1988 study so you know what the 1.8 million figure actually measured." },
      { title: "A timer built in", body: "Every Time2Read story has a 20-minute reading timer, so the goal is visible and finite." },
    ],
    sections: [
      {
        heading: "Where the 1.8 million words figure comes from",
        paragraphs: [
          "The popular chart traces back to a 1988 study by Anderson, Wilson and Fielding. Fifth graders kept daily logs of how they spent their time outside school. In the study's Table 3, a child at the 90th percentile for book reading read books for about 21 minutes a day, which the authors estimated at about 1,823,000 words a year. The child at the 50th percentile read books for about 4.6 minutes a day, about 282,000 words a year.",
          "Two things are worth knowing. First, the words-per-year figures are estimates: the researchers multiplied minutes per day by reading speed and extrapolated to a full year. Second, the study found an association, not a guarantee. Time spent reading books was the best predictor of children's reading growth from second to fifth grade, but no single number of minutes promises a particular test score.",
        ],
      },
      {
        heading: "So is 20 minutes enough?",
        paragraphs: [
          "For most children, 20 minutes of real reading a day is a meaningful amount: in the 1988 study it would have put a child near the top tenth of their class for book reading. Researchers at LUCiD put it plainly: there isn't a clear consensus about where the specific figure of 20 minutes came from, it's a guide, and a day where you only manage 5 minutes is fine. They also warn that forcing children to read is likely to have the opposite effect.",
          "In other words, 20 minutes is long enough to matter and short enough to do every day. Consistency beats the exact number.",
        ],
      },
      {
        heading: "How long should a child read each day, by age?",
        paragraphs: ["There is no official age-by-age rule. These ranges are a practical starting point, not a standard:"],
        bullets: [
          "Ages 3 to 5: short, shared sessions. Being read to counts. Several 5-minute stories can add up to 20.",
          "Ages 6 to 7: 10 to 20 minutes, often split in two. Early readers tire fast; listening along helps.",
          "Ages 8 to 10: 20 minutes of independent reading is a common school goal, plus anything they choose for fun.",
          "Ages 11 to 15: 20 to 30 minutes, and let them choose what they read: graphic novels, sports writing and series all count.",
        ],
      },
      {
        heading: "How to make 20 minutes actually happen",
        bullets: [
          "Pick a fixed time, such as after dinner or before lights out, so it isn't negotiated every night.",
          "Use a visible timer so the end is clear. Kids resist open-ended tasks more than finite ones.",
          "Let them choose the topic. Interest does more for stamina than any reward chart.",
          "Track it. A simple log (try our free printable 20-minute reading log) makes streaks visible.",
          "If 20 minutes is a battle, start at 10 and build up. See our guide for parents whose child hates reading.",
        ],
      },
      {
        heading: "Where Time2Read fits",
        paragraphs: [
          "Time2Read writes an illustrated story around your child, at the reading level you set, with a 20-minute timer that starts when they begin. Tap any word to hear it read aloud. It's screen time, and we won't pretend otherwise: the point is that it's 20 minutes of screen time that's actually reading.",
        ],
      },
    ],
    sources: [SOURCES.anderson1988Eric, SOURCES.lucid2023],
    faqs: [
      {
        q: "Is reading 20 minutes a day enough for a child?",
        a: "For most children it's a good daily goal. It isn't a magic number: researchers describe it as a guide, and consistency matters more than hitting exactly 20 minutes every day.",
      },
      {
        q: "Is the \"1.8 million words a year\" statistic real?",
        a: "It comes from a 1988 study by Anderson, Wilson and Fielding. A fifth grader at the 90th percentile for book reading read about 21 minutes a day, which the authors estimated at about 1,823,000 words a year. It's an estimate built from reading speed and minutes, and it shows an association, not a guaranteed result.",
      },
      {
        q: "Does it count if I read to my child?",
        a: "For young children, being read to is an important part of daily reading. As they get older, aim for some of the time to be them reading on their own.",
      },
      {
        q: "What if my child can only manage 5 minutes?",
        a: "Start there. Reading researchers say a 5-minute day is fine and that forcing reading tends to backfire. Build up gradually and keep the time predictable.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "reading-app-with-timer-for-kids",
    kind: "guide",
    title: "Reading App With a Timer for Kids: 20-Minute Stories | Time2Read",
    metaDescription:
      "A kids' reading app with a built-in 20-minute timer: personalized illustrated stories at your child's level, tap-to-hear words. First 3 stories free.",
    h1: "A Reading App With a Built-In Timer for Kids",
    navLabel: "Reading app with a timer",
    heroSubtitle:
      "Most reading timers just count minutes. Time2Read gives your child something worth reading for those minutes: a new story where they're the main character.",
    heroImage: homeReading,
    heroImageAlt: "Child reading on a tablet at home",
    intro: [
      "If your child's school asks for 20 minutes of reading a night, you've probably tried a kitchen timer, a phone stopwatch or a reading-log app. They track time well. What they can't do is make the reading itself appealing.",
      "Time2Read puts the timer inside the story. Every story has a 20-minute reading timer, and the story is written around your child, at the reading level you choose.",
    ],
    benefits: [
      { title: "Timer in every story", body: "A 20-minute timer starts when reading starts. Pause it, end early, or keep going." },
      { title: "Stories worth the minutes", body: "Your child's name and interests drive the plot, with an illustration on every page." },
      { title: "Help on hard words", body: "Tap a word to hear it, or use phonics help to sound it out, so the session doesn't stall." },
    ],
    sections: [
      {
        heading: "Timer apps vs. a reading app with a timer",
        paragraphs: [
          "Standalone timers and reading trackers are good at logging minutes, and some fluency apps time a child reading a passage aloud to calculate words per minute. Those are useful tools. They answer a different question: how long did my child read? Time2Read is built around a second question: what will make my child want to read for those 20 minutes?",
        ],
        bullets: [
          "A countdown or log: great for accountability, but the reading material is up to you.",
          "A fluency timer: measures speed on short passages, useful for practice drills.",
          "Time2Read: the timer sits inside a personalized, illustrated story at the right level, so the minutes and the motivation come together.",
        ],
      },
      {
        heading: "How the 20-minute timer works",
        bullets: [
          "Open a story and the 20-minute timer starts.",
          "Pause it for dinner or a question, then pick up where you left off.",
          "End early on a hard day. A short session is better than a fight.",
          "Keep reading past 20 minutes if the story has them hooked.",
        ],
      },
      {
        heading: "Pair it with a paper log",
        paragraphs: [
          "Many teachers still want a signed log. Print our free 20-minute reading log, read with the timer, and fill in a row each day. If you're wondering whether 20 minutes is the right goal, see our guide on whether reading 20 minutes a day is enough.",
        ],
      },
    ],
    sources: [SOURCES.anderson1988Eric, SOURCES.lucid2023],
    faqs: [
      {
        q: "Does Time2Read have a reading timer?",
        a: "Yes. Every story has a built-in 20-minute reading timer that starts when your child starts reading. You can pause it, end early or keep reading.",
      },
      {
        q: "What ages is it for?",
        a: "Ages 3 to 15. Younger children can listen along with read-aloud narration; older children read on their own at the level you set.",
      },
      {
        q: "Can I use it for my child's school reading minutes?",
        a: "Many families use the timer alongside the school's reading log. Check with your child's teacher about what counts toward their reading minutes.",
      },
      {
        q: "Does the app work on phones and tablets?",
        a: "Yes. Time2Read runs in the browser on phones, tablets and computers.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "reading-app-for-kids-struggling-to-read",
    kind: "guide",
    title: "Reading App for Kids Struggling to Read: A Guide | Time2Read",
    metaDescription:
      "What to look for in a reading app for a struggling reader: the right level, help with hard words, short sessions, and when to ask the school for help.",
    h1: "A Reading App for Kids Who Are Struggling to Read",
    navLabel: "Reading app for struggling readers",
    heroSubtitle:
      "If your 7, 8 or 9 year old is finding reading hard, the right practice matters. Here's what to look for, and what an app can't do on its own.",
    heroImage: outdoorReading,
    heroImageAlt: "Child reading outdoors with a parent",
    intro: [
      "When a child struggles to read, every page can feel like a test. Parents often reach for an app, hoping practice will feel less like work. That can help, as long as the practice is at the right level and the child has support with words they can't yet read.",
      "This page covers what to look for in a reading app for a struggling reader, how Time2Read approaches it, and when to talk to your child's teacher. An app is practice, not a diagnosis or a treatment.",
    ],
    benefits: [
      { title: "Set the level yourself", body: "Choose a reading level your child can manage, then move it up as they grow." },
      { title: "Hard words don't end the story", body: "Tap any word to hear it, or use phonics help to sound it out." },
      { title: "About things they love", body: "A story starring your child, about their interests, is a different kind of ask." },
    ],
    sections: [
      {
        heading: "Why kids struggle, and why it matters for the app you choose",
        paragraphs: [
          "Elizabeth Babbin's article for Understood lists six common reasons children refuse to read, including that reading feels overwhelming, that they choose books that are too hard for them, and that they're struggling with basic reading skills. Each points to a different fix: easier text, more support, or more structured skills help.",
          "Reading Rockets suggests that for practice, a child should be able to read about 90 percent of the words in a text. Too many unknown words and practice turns into frustration.",
        ],
      },
      {
        heading: "What to look for in a reading app for a struggling reader",
        bullets: [
          "Level control: you, not an algorithm you can't see, should be able to set and change the reading level.",
          "Support on hard words: hearing a word read aloud, or getting phonics help, keeps a child moving.",
          "Short, finite sessions: a visible timer makes the task feel manageable.",
          "Interest: stories about what your child cares about help them push through effort.",
          "No pressure mechanics: avoid apps that make mistakes feel public or punishing.",
        ],
      },
      {
        heading: "How Time2Read helps",
        paragraphs: [
          "Time2Read writes an illustrated story around your child, with them as the main character, at the reading level you choose. Every word can be tapped to hear it read aloud, phonics help is built in, and a 20-minute timer keeps sessions a manageable size. Younger or less confident readers can listen to narration while they follow the words.",
        ],
      },
      {
        heading: "When to ask for more help",
        paragraphs: [
          "If your child is struggling with basic reading skills, or you're worried they're falling behind, talk to their teacher first. Ask where your child is with reading and what the school recommends. An app can add enjoyable practice at home; it does not replace an assessment or structured teaching when a child needs it.",
        ],
      },
    ],
    sources: [SOURCES.understoodRefuse, SOURCES.readingRocketsFluency2],
    faqs: [
      {
        q: "What's the best reading app for a struggling 8 year old?",
        a: "Look for an app that lets you set the reading level, helps with hard words (hearing them or sounding them out), keeps sessions short and is about things your child likes. If your child is struggling with basic skills, also ask their teacher what they recommend.",
      },
      {
        q: "How hard should practice reading be?",
        a: "Reading Rockets suggests a child should be able to read about 90 percent of the words in a practice text. If they're stopping on almost every line, the text is too hard for practice.",
      },
      {
        q: "Can an app fix a reading difficulty?",
        a: "No. An app can give enjoyable practice at the right level. If you think your child has a reading difficulty, talk to their teacher or school about an assessment.",
      },
      {
        q: "Does Time2Read read the story aloud?",
        a: "Yes. Your child can listen to narration and tap any word to hear it, which helps less confident readers keep going.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "high-interest-low-level-stories",
    kind: "guide",
    title: "Hi-Lo Stories: High Interest, Low Level Reading | Time2Read",
    metaDescription:
      "What high-interest, low-level (hi-lo) stories are, why they help reluctant readers, and how to get hi-lo stories about what your child loves.",
    h1: "High-Interest, Low-Level Stories for Kids",
    navLabel: "High-interest, low-level stories",
    heroSubtitle:
      "Grown-up-feeling topics, words your child can actually read. Hi-lo stories are how reluctant readers get back in the game.",
    heroImage: heroDiverse,
    heroImageAlt: "Children reading illustrated stories",
    intro: [
      "A 10-year-old who reads at a second-grade level doesn't want a story about a kitten finding its mittens. They want football, mysteries, space battles, horses or video games. High-interest, low-level books, often called hi-lo books, are written for exactly that gap.",
      "The catch is that hi-lo shelves are small, and they rarely cover your child's exact obsession. Time2Read writes a hi-lo story about whatever your child loves, starring them, at the level you set.",
    ],
    benefits: [
      { title: "Their interest, not a shelf's", body: "Any topic your child cares about, from skateboarding to sharks." },
      { title: "Your choice of level", body: "Set an easier reading level without making the story feel babyish." },
      { title: "Support built in", body: "Illustrations, tap-to-hear words and phonics help on every page." },
    ],
    sections: [
      {
        heading: "What are hi-lo (high-interest, low-level) stories?",
        paragraphs: [
          "Reading Rockets describes high/low books as offering highly engaging, age-appropriate subject matter at a low reading level for struggling readers. Their value is motivation: a reader can take part in the same kinds of topics their classmates are reading about.",
          "According to Reading Rockets, effective high/low books support readers with illustrations, carefully chosen vocabulary, simple sentences, compelling stories, and characters that interest the reader.",
        ],
      },
      {
        heading: "Who hi-lo stories help",
        bullets: [
          "Reluctant readers who can read but find books boring or babyish.",
          "Children reading below their grade level who still want age-appropriate topics.",
          "Children learning English who need simpler language but not younger themes.",
          "Older kids (11 to 15) rebuilding confidence after a hard year.",
        ],
      },
      {
        heading: "How Time2Read makes hi-lo stories",
        bullets: [
          "Pick the topic: your child's real interest, as specific as they like.",
          "Set the reading level separately from their age.",
          "Your child becomes the main character, with an illustration on every page.",
          "Tap any word to hear it, or use phonics help to sound it out.",
          "A 20-minute timer keeps each session a manageable size.",
        ],
      },
      {
        heading: "Hi-lo books and hi-lo stories work together",
        paragraphs: [
          "Your library's hi-lo collection and graphic novels are well worth exploring; ask a librarian for their high/low list. Time2Read adds an endless supply of stories on your child's exact topic, so there's always something new between library trips. If your child pushes books away entirely, read our guide for parents whose child hates reading.",
        ],
      },
    ],
    sources: [SOURCES.readingRocketsHiLo, SOURCES.understoodRefuse],
    faqs: [
      {
        q: "What does hi-lo mean in reading?",
        a: "Hi-lo means high interest, low reading level: age-appropriate, engaging topics written with simpler vocabulary and sentences, for readers who read below their age level.",
      },
      {
        q: "Are hi-lo stories only for struggling readers?",
        a: "They were designed for struggling and reluctant readers, but they also suit children learning English and any child who wants an easy, fun read.",
      },
      {
        q: "Can I get hi-lo stories about a specific topic?",
        a: "Yes. With Time2Read you choose the topic and the reading level separately, so a story can be about exactly what your child loves at a level they can read.",
      },
      {
        q: "What ages does Time2Read cover?",
        a: "Ages 3 to 15, with reading levels from pre-K up to 10th grade.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "bedtime-stories-about-your-childs-favorite-things",
    kind: "guide",
    title: "Bedtime Stories About Your Child's Favorite Things | Time2Read",
    metaDescription:
      "A bedtime story for the kid obsessed with dinosaurs, unicorns, trucks or football: personalized, illustrated, read-aloud stories starring your child.",
    h1: "Bedtime Stories About Your Child's Favorite Things",
    navLabel: "Bedtime stories about their favorite things",
    heroSubtitle:
      "Dinosaurs again? Perfect. A new bedtime story about exactly what your child loves, with them as the hero, read aloud if you like.",
    heroImage: carReading,
    heroImageAlt: "Child enjoying an illustrated story",
    intro: [
      "Every parent knows the request: \"Tell me a story about a dinosaur. No, a T. rex. Who plays football. And eats pasta.\" Making up a fresh story every night is hard work, and the same five books on the shelf wear thin.",
      "Time2Read writes a new illustrated story around your child and the thing they're obsessed with this month, at a level that suits them. Read it together, let them read it, or have it read aloud.",
    ],
    benefits: [
      { title: "Whatever they're into", body: "Dinosaurs, unicorns, diggers, space, horses, football, or all of them at once." },
      { title: "They're the hero", body: "Your child's first name (or a nickname) and their choices drive the story." },
      { title: "Read aloud, or read together", body: "Narration for tired nights; tap-to-hear words for new readers." },
    ],
    sections: [
      {
        heading: "Bedtime story ideas kids ask for most",
        bullets: [
          "A bedtime story about a dinosaur who is scared of the dark.",
          "A bedtime story about a unicorn who needs help finding home.",
          "A bedtime story about a digger, a fire truck or a train on a night shift.",
          "A bedtime story about a dog, a cat or a penguin who goes on an adventure.",
          "A bedtime story where your child plays in the big game, or explores space.",
        ],
        paragraphs: ["Any of these can star your child. Mix them together if they want: a dinosaur goalkeeper on the moon works fine."],
      },
      {
        heading: "How to make one tonight",
        bullets: [
          "Enter your child's first name or a nickname, and pick a look for their character.",
          "Choose the topic: their favorite animal, vehicle, sport or idea.",
          "Set the reading level. For little ones, use read-aloud narration.",
          "Read together with an illustration on every page. A 20-minute timer keeps bedtime on schedule.",
        ],
      },
      {
        heading: "Why a story about them works",
        paragraphs: [
          "Researchers have studied personalized children's books for more than a decade; Natalia Kucirkova's work is a good place to read about it. As a parent you'll notice something simpler: a child who is the hero of the story, about the thing they love, wants to know what happens next. For more on how it works, see stories where your child is the main character.",
        ],
      },
    ],
    sources: [SOURCES.kucirkova],
    faqs: [
      {
        q: "Can I get a bedtime story about my child's favorite thing?",
        a: "Yes. Time2Read writes a new illustrated story around whatever your child loves, with your child as the main character.",
      },
      {
        q: "Can the story be read aloud?",
        a: "Yes. Stories can be narrated, and any word can be tapped to hear it, which helps new readers follow along.",
      },
      {
        q: "What ages is it for?",
        a: "Ages 3 to 15. Pre-readers listen along; older children can read on their own at the level you set.",
      },
      {
        q: "Do I need to share personal details?",
        a: "A first name or nickname and the things your child likes are enough to make the story theirs.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "sight-word-story-generator",
    kind: "guide",
    title: "Sight Word Story Generator Built on Dolch Words | Time2Read",
    metaDescription:
      "Generate illustrated sight word stories for beginning readers. Time2Read's early levels use Dolch sight words, with your child as the main character.",
    h1: "A Sight Word Story Generator for Beginning Readers",
    navLabel: "Sight word story generator",
    heroSubtitle:
      "Flashcards teach the words. Stories make them stick. Time2Read writes new, illustrated beginner stories built on the most common sight words.",
    heroImage: homeReading,
    heroImageAlt: "Young child reading with a parent",
    intro: [
      "Sight words are the small, common words (the, and, is, you, said) that beginning readers learn to recognize at a glance. Flashcards help, but children also need to meet those words again and again in real sentences.",
      "Printable sight word stories run out fast. Time2Read generates new ones: early reading levels are written mostly with Dolch sight words, and each story stars your child.",
    ],
    benefits: [
      { title: "Built on Dolch words", body: "Beginner levels lean heavily on the Dolch pre-primer, primer and grade 1 lists." },
      { title: "Never the same story twice", body: "New stories whenever your child wants one, so reading practice doesn't get stale." },
      { title: "Help on every word", body: "Tap a word to hear it, so an unfamiliar word doesn't stop the story." },
    ],
    sections: [
      {
        heading: "What are Dolch sight words?",
        paragraphs: [
          "The Dolch list was compiled by Edward W. Dolch, first published in 1936 and later in his 1948 book Problems in Reading. It has 220 \"service words\" grouped into pre-primer, primer, first, second and third grade lists, plus a separate list of common nouns. Dolch estimated in 1936 that between 50% and 75% of the words used in schoolbooks of his day were from this basic sight vocabulary.",
        ],
      },
      {
        heading: "How Time2Read generates sight word stories",
        bullets: [
          "Choose a beginner reading level. Early levels are written mostly with Dolch sight words and short, simple sentences.",
          "Your child is the main character, so they want to keep reading.",
          "Every page has an illustration that supports the words.",
          "Tap any word to hear it. Phonics help is there for words to sound out.",
          "Move up a level as their sight vocabulary grows.",
        ],
      },
      {
        heading: "Make sight word practice stick",
        bullets: [
          "Before reading, pick three sight words and ask your child to spot them in the story.",
          "Reread yesterday's story first. Repetition builds speed and confidence.",
          "Keep it short: one story, or 10 to 20 minutes, is plenty for a beginner.",
          "For a printable list, see our kindergarten sight words page.",
        ],
      },
      {
        heading: "Sight word stories vs. decodable texts",
        paragraphs: [
          "Decodable texts are written so that almost every word follows phonics patterns a child has been taught. Sight word stories focus on high-frequency words. Most beginner readers benefit from both. Time2Read's beginner stories lean on sight words and simple words with phonics help; if your child's school uses a specific decodable sequence, keep using those books for that practice too.",
        ],
      },
    ],
    sources: [SOURCES.dolch],
    faqs: [
      {
        q: "Is there a sight word story generator?",
        a: "Yes. Time2Read generates new illustrated stories for beginning readers. Its early reading levels are written mostly with Dolch sight words, and your child is the main character.",
      },
      {
        q: "What are Dolch sight words?",
        a: "A list of 220 high-frequency \"service words\" plus common nouns, compiled by Edward W. Dolch and first published in 1936, grouped from pre-primer to third grade.",
      },
      {
        q: "Can I type in my child's own sight word list?",
        a: "Not at the moment. You choose the reading level, and beginner levels draw on the Dolch lists. Practice your class list with our printable kindergarten sight words alongside the stories.",
      },
      {
        q: "What age are sight word stories for?",
        a: "Usually ages 4 to 7 (pre-K to first grade), or any child at a beginning reading level.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "reading-for-kids-with-adhd",
    kind: "guide",
    title: "How to Make Reading Fun for Kids With ADHD | Time2Read",
    metaDescription:
      "Supportive ways to make reading easier and more fun for a child with ADHD: interest-led topics, short timed sessions, movement, choice and read-aloud.",
    h1: "How to Make Reading Fun for a Child With ADHD",
    navLabel: "Reading for kids with ADHD",
    heroSubtitle:
      "Short sessions, real interests, freedom to move. Ideas that help many children with ADHD enjoy reading more, and where a story app can fit.",
    heroImage: outdoorReading,
    heroImageAlt: "Child reading outdoors",
    intro: [
      "Many children with ADHD find long, quiet reading sessions hard, especially with a book they didn't choose. That doesn't mean they can't love reading. It usually means the format needs to change.",
      "This guide collects practical ideas from ADHD and literacy specialists. It isn't medical advice, and Time2Read doesn't treat ADHD; it's a set of ways to make reading time work better at home.",
    ],
    benefits: [
      { title: "Start with their passions", body: "Interest is the strongest hook. Let the topic come from them." },
      { title: "Keep it short and finite", body: "A visible timer makes the end clear. Short sessions beat long struggles." },
      { title: "Make it new", body: "Fresh, surprising material holds attention better than a repeat." },
    ],
    sections: [
      {
        heading: "Ideas from ADHD and reading specialists",
        paragraphs: [
          "Writing for BookTrust, ADHD consultant and former teacher Soli Lazarus suggests you start with their interests, what engages them, what are their passions. She notes that an ADHD brain will respond to what is new and motivating, and recommends making reading fun, a bit cheeky, full of purpose and interest.",
        ],
        bullets: [
          "Let them choose: format, genre, topic and device.",
          "Give reading a purpose: a recipe, the rules of a game, a story about their team.",
          "Try different formats: on-screen readers, large print, lists and short chunks.",
          "Keep sessions short and add breaks rather than pushing through.",
          "Let them move: reading lying down, standing, or after a burst of activity is fine.",
          "Celebrate streaks and effort, not just finished books.",
        ],
      },
      {
        heading: "Why the right difficulty matters",
        paragraphs: [
          "Understood's list of reasons children refuse to read includes reading feeling overwhelming and books that are too hard. For a child who already finds focus hard, text that's too difficult can end the session in minutes. Choose a level where they can read most words without help, and give support on the rest.",
        ],
      },
      {
        heading: "Where Time2Read can help",
        paragraphs: [
          "Time2Read writes a new illustrated story about whatever your child is into, with them as the main character, so there's always something new. You set the reading level. Any word can be tapped to hear it, phonics help is built in, and a 20-minute timer gives each session a clear finish; pause or end early whenever you need to.",
          "If you have concerns about attention or reading, talk to your child's teacher or doctor. An app is a reading tool, not a treatment.",
        ],
      },
    ],
    sources: [SOURCES.booktrustAdhd, SOURCES.understoodRefuse],
    faqs: [
      {
        q: "How do I make reading fun for a child with ADHD?",
        a: "Start with their interests, keep sessions short with a clear end, let them choose and move, use formats like read-aloud or short chunks, and pick a level that isn't too hard. Celebrate effort and streaks.",
      },
      {
        q: "How long should a child with ADHD read at a time?",
        a: "There's no fixed rule. Many families find short sessions with breaks work better than one long one. Start with what your child can manage and build up.",
      },
      {
        q: "Is Time2Read a treatment for ADHD?",
        a: "No. Time2Read is a reading app. It can make reading time more engaging with interest-led stories, short timed sessions and read-aloud help, but it doesn't treat or diagnose anything.",
      },
      {
        q: "Can my child listen instead of reading?",
        a: "Yes. Stories can be read aloud, and your child can tap any word to hear it while following along.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "reading-app-for-esl-kids",
    kind: "guide",
    title: "Reading App for ESL Kids: Easy English Stories | Time2Read",
    metaDescription:
      "Easy English reading practice for ESL kids: personalized illustrated stories at the right level, tap any word to hear it. First 3 stories free.",
    h1: "A Reading App for ESL Kids Learning English",
    navLabel: "Reading app for ESL kids",
    heroSubtitle:
      "Simple English, pictures on every page, and a voice that reads any word aloud. Reading practice for children learning English, starring them.",
    heroImage: heroDiverse,
    heroImageAlt: "Diverse children reading illustrated stories",
    intro: [
      "Children learning English need lots of reading at a level they can follow, with support for the words they don't know yet. Easy ESL story collections and worksheets help, but they run out, and they rarely feel like they're about your child.",
      "Time2Read writes new English stories at the reading level you choose, with an illustration on every page and narration you can turn on. Your child is the main character. Stories are in English.",
    ],
    benefits: [
      { title: "Easy English, your choice of level", body: "Set a simpler level without making the topic feel young." },
      { title: "Hear any word", body: "Tap a word to hear how it sounds, as often as needed." },
      { title: "Pictures that help", body: "An illustration on every page supports meaning while vocabulary grows." },
    ],
    sections: [
      {
        heading: "What helps English learners read at home",
        bullets: [
          "Reading at the right level: text where your child knows most of the words.",
          "Hearing the words: listening while following the text links sound and spelling.",
          "Pictures: illustrations help children work out new words from context.",
          "Repetition: rereading a favorite story builds speed and confidence.",
          "Topics they care about: interest keeps children reading through the hard parts.",
        ],
      },
      {
        heading: "Keep the home language strong",
        paragraphs: [
          "Colorín Colorado, a national resource for educators and families of English language learners, shares reading tips for families in 16 languages. They include talking with your child in your home language, the benefits of being bilingual, and sharing stories and songs from your culture. English reading practice works alongside your home language, not instead of it.",
        ],
      },
      {
        heading: "How Time2Read supports English learners",
        bullets: [
          "Choose a reading level from pre-K upward, separate from your child's age.",
          "Turn on narration to hear the story, or tap single words.",
          "Phonics help for sounding out new words.",
          "A 20-minute timer for a steady daily habit.",
          "High-interest topics at an easier level: see our page on high-interest, low-level stories.",
        ],
      },
    ],
    sources: [SOURCES.colorin, SOURCES.readingRocketsHiLo],
    faqs: [
      {
        q: "Is Time2Read good for ESL kids?",
        a: "It can be a helpful practice tool: you set an easier English reading level, every page has an illustration, and any word can be tapped to hear it read aloud.",
      },
      {
        q: "Are the stories available in other languages?",
        a: "Stories are currently in English. We recommend keeping your home language strong with books, songs and conversation alongside English reading.",
      },
      {
        q: "What ages is it for?",
        a: "Ages 3 to 15, with reading levels from pre-K up to 10th grade.",
      },
      {
        q: "Can older ESL kids use it without the stories feeling babyish?",
        a: "Yes. You choose the topic and the reading level separately, so a 12-year-old can read about their interests in simpler English.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
];
