// Guide pages for the three search angles chosen on 25 Oct 2026 from Search Console,
// Google autocomplete and live result pages: the 20-minute reading log / timer,
// reluctant readers ("my child hates reading"), and stories where the child is the
// main character. Every figure here comes from a source listed on the same page,
// fetched when the page was written. No invented stats, no testimonials.
// These pages collect nothing: no form, no input, no email capture (COPPA).
import outdoorReading from "@/assets/carousel-3-outdoor-reading.jpg";
import homeReading from "@/assets/carousel-2-home-reading.jpg";
import heroDiverse from "@/assets/hero-image-diverse-clear.jpg";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import type { LandingPageConfig } from "./landingPages";

const pricingAnswer = `Your first ${FREE_STORY_LIMIT} stories are free. After that, Premium starts with a ${TRIAL_DAYS}-day free trial, then costs ${PLAN_PRICES.monthly.label}${PLAN_PRICES.monthly.period} or ${PLAN_PRICES.annual.label}${PLAN_PRICES.annual.period}.`;

const SOURCES = {
  anderson1988: {
    label:
      "Anderson, Wilson & Fielding (1988), \"Growth in reading and how children spend their time outside of school\", Reading Research Quarterly (University of Illinois record)",
    url: "https://experts.illinois.edu/en/publications/growth-in-reading-and-how-children-spend-their-time-outside-of-sc",
  },
  anderson1988Eric: {
    label: "The same study's technical report on ERIC (ED275992, full text PDF)",
    url: "https://files.eric.ed.gov/fulltext/ED275992.pdf",
  },
  mcarthur2024: {
    label: "Genevieve McArthur (2024), \"What can you do if your child hates reading?\", The Conversation",
    url: "https://theconversation.com/what-can-you-do-if-your-child-hates-reading-236494",
  },
  nlt2023: {
    label: "National Literacy Trust (2023), \"Children and young people's reading in 2023\"",
    url: "https://literacytrust.org.uk/research-services/research-reports/children-and-young-peoples-reading-in-2023/",
  },
  kucirkova: {
    label: "Natalia Kucirkova's published research on personalised books and digital personalisation",
    url: "https://www.nataliakucirkova.com/early-personalisation",
  },
};

export const guidePages: LandingPageConfig[] = [
  {
    slug: "20-minute-reading-log",
    kind: "guide",
    variant: "readingLog",
    title: "Free Printable 20-Minute Reading Log + Reading Timer | Time2Read",
    metaDescription:
      "A free printable 20-minute reading log for kids, with a parent or teacher initials column. Plus a built-in 20-minute reading timer inside every Time2Read story.",
    h1: "Free Printable 20-Minute Reading Log",
    navLabel: "20-minute reading log (printable)",
    heroSubtitle:
      "Print the weekly log below, read for 20 minutes, fill in a row. When some of those minutes happen on a screen, make them minutes of real reading: every Time2Read story has a 20-minute timer built in.",
    heroImage: homeReading,
    heroImageAlt: "Child reading at home with a parent nearby",
    intro: [
      "Many classrooms send home a nightly reading goal, and 20 minutes is one of the most common. A reading log turns that goal into something a child can see: one row a day, one small win at a time.",
      "This page gives you a free weekly log to print (no email, no signup), tips for making the habit stick, and a version for teachers tracking independent reading minutes.",
    ],
    benefits: [
      { title: "Print it free", body: "One page, seven days, a column for minutes and a column for a grown-up's initials." },
      { title: "A timer that's already running", body: "Open a Time2Read story and a 20-minute timer starts. Pause it, end early, or keep reading." },
      { title: "Minutes of actual reading", body: "The 20 minutes of screen time that's actually reading: your child reads a story where they are the main character." },
    ],
    sections: [
      {
        heading: "Why track reading minutes at all?",
        paragraphs: [
          "In a well-known study, Anderson, Wilson and Fielding had 155 fifth graders write down, every day, how many minutes they spent on activities outside school, for 8 to 26 weeks. Of all the ways the children spent their time, reading books was the best predictor of their reading achievement, including how much they grew between second and fifth grade. The same study found that on most days, most children did little or no book reading.",
          "That is the case for a log: it makes the minutes visible, so a quiet day is noticed and a good streak is celebrated. It doesn't prove that exactly 20 minutes is the right number for every child. It's a goal that's long enough to matter and short enough to do every day.",
        ],
      },
      {
        heading: "How to use the log",
        bullets: [
          "Pick the same time each day (after dinner, before bed) so reading becomes part of the routine, not a negotiation.",
          "Let your child fill in the title and minutes. Writing it down is part of the reward.",
          "Count read-alouds. Listening to a story and following along still builds vocabulary, especially for children ages 3 to 6.",
          "Split the 20 minutes if you need to: 10 before school and 10 at bedtime still fills the row.",
          "Celebrate the streak, not the number of pages. A finished week is the win.",
        ],
      },
      {
        heading: "For teachers: an independent reading minutes tracker",
        paragraphs: [
          "The printable works as a take-home independent reading log: one sheet per student per week, with an initials column for a parent or guardian. Students who read on Time2Read can copy the minutes from the story timer onto the sheet. Whether screen reading counts toward a class goal is your call.",
        ],
      },
      {
        heading: "Where Time2Read fits",
        paragraphs: [
          "If your child is going to have some screen time tonight anyway, Time2Read makes it reading time. Each story is new, illustrated on every page, written at the reading level you choose, and stars your child as the main character. Tap any word to hear it, use phonics help for tricky ones, or turn on read-aloud narration. The 20-minute timer floats on the page, so your child can see how far they've come.",
        ],
      },
    ],
    sources: [SOURCES.anderson1988, SOURCES.anderson1988Eric],
    faqs: [
      {
        q: "Is 20 minutes of reading a day enough?",
        a: "Twenty minutes is a common school goal, not a magic number. What research does show is that time spent reading books is strongly linked to reading growth, and that many children read very little on most days. A steady daily habit matters more than any one long session.",
      },
      {
        q: "Do minutes read on Time2Read count on a reading log?",
        a: "Time2Read's timer shows exactly how many minutes your child read, so you can write them in. Whether screen reading counts toward a class goal is up to your child's teacher.",
      },
      {
        q: "Is the reading log really free? Do I have to sign up?",
        a: "Yes, it's free, and there's nothing to sign up for. Press Print on this page. We don't ask for an email to download it.",
      },
      {
        q: "What ages is this log for?",
        a: "It works for any child who can write a title or draw a picture in the box, and younger children can fill it in with a grown-up. Time2Read stories are written for ages 3 to 15.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "my-child-hates-reading",
    kind: "guide",
    title: "My Child Hates Reading: What Actually Helps | Time2Read",
    metaDescription:
      "If your child hates reading, start by finding out why. Practical steps from literacy research: follow their interests, set a real goal, pick the right difficulty, and when to ask for help.",
    h1: "My Child Hates Reading: What Actually Helps",
    navLabel: "My child hates reading",
    heroSubtitle:
      "It's common, it's fixable, and the first step isn't another book. It's finding out why. Here's what literacy researchers suggest, and where a story starring your child can help.",
    heroImage: outdoorReading,
    heroImageAlt: "Parent and child reading together outdoors",
    intro: [
      "If your child says they hate reading, you are far from alone. In the National Literacy Trust's 2023 survey of more than 71,000 children and young people in the UK, just 43.4% of 8- to 18-year-olds said they enjoyed reading in their free time, the lowest level since the charity started asking in 2005.",
      "The good news: reluctance usually has a cause you can work on. Below is a practical plan, drawn mainly from literacy researcher Genevieve McArthur's advice for parents.",
    ],
    benefits: [
      { title: "Find the why", body: "Struggling, worried, bored, or just more interested in something else? Each one needs a different fix." },
      { title: "Make it about them", body: "A story about their own interests, with them as the main character, is a different ask than a book they didn't choose." },
      { title: "Keep it finite", body: "\"Twenty minutes, then you're done\" is easier to agree to than \"go read\"." },
    ],
    sections: [
      {
        heading: "Step 1: Work out why your child dislikes reading",
        paragraphs: [
          "McArthur lists several common reasons children say they hate reading. They may feel they aren't as good at it as other children in class, which can make them worried or even afraid to read, especially in front of others, so they avoid it. Or they read fine but have other interests, or can't see the point.",
        ],
        bullets: [
          "Listen to what your child says about reading. Do they call themselves \"bad\" at it?",
          "Notice avoidance. Does reading make them anxious or switched off?",
          "Ask their teacher where your child sits in the class for reading, and whether they avoid it at school too.",
        ],
      },
      {
        heading: "Step 2: What to try at home",
        bullets: [
          "Follow their interests. Help them find books or articles on topics they genuinely care about, and let them choose.",
          "Give reading a goal that means something to them: finishing a series, or learning how to fix a bike.",
          "Protect their confidence. Avoid showing disappointment if progress is slow, and take an interest in what they're learning.",
          "Get the difficulty right. Too easy is boring and too hard is demoralising. If a book is too hard, offer to read every second page together.",
        ],
      },
      {
        heading: "Reluctant readers by age",
        bullets: [
          "Ages 3 to 5: keep it short and shared. Read aloud, let them turn pages, and point at words as you go.",
          "Ages 6 to 8: this is when decoding is hard work. Short books, read-aloud support for tricky words, and lots of praise for effort.",
          "Ages 9 to 12: choice matters most. Comics, series, facts about their hobby: all of it is reading.",
          "Ages 13 to 15: respect their taste. Graphic novels, sports writing, game lore and audiobooks alongside the text all build the habit.",
        ],
      },
      {
        heading: "Where Time2Read can help",
        paragraphs: [
          "Time2Read writes a brand-new story around what your child is into (dinosaurs, football, space, horses), with your child as the main character and an illustration on every page. You set the reading level, so the story is neither too easy nor too hard. Tap any word to hear it read aloud, or use phonics help to sound it out, so a hard word doesn't end the session. A 20-minute timer makes the goal clear and finite.",
          "It's screen time, and we won't pretend otherwise. The point is that it's the 20 minutes of screen time that's actually reading.",
        ],
      },
      {
        heading: "When to ask for more help",
        paragraphs: [
          "If you suspect your child is struggling rather than just uninterested, talk to their teacher first. If you see a reading specialist, McArthur suggests asking whether they will assess your child's confidence, engagement and feelings about reading as well as their skills, and whether they will recommend next steps, not just give you a score.",
        ],
      },
    ],
    sources: [SOURCES.mcarthur2024, SOURCES.nlt2023],
    faqs: [
      {
        q: "Is it normal for a child to hate reading?",
        a: "It's very common. In the National Literacy Trust's 2023 UK survey, fewer than half of 8- to 18-year-olds (43.4%) said they enjoyed reading in their free time. Disliking reading is a signal to find the cause, not a fixed trait.",
      },
      {
        q: "Should I make my child read if they hate it?",
        a: "Practice matters, so letting reading drop entirely doesn't help in the long run. But forcing the same unwanted book rarely works either. Change what they read (their interests), why they read (a goal they care about), and how hard it is, and keep the daily amount short and predictable.",
      },
      {
        q: "What if my child hates reading because it's hard for them?",
        a: "Talk to their teacher about where your child is with reading. If you go to a reading specialist, ask them to look at confidence and feelings about reading as well as skills, and to give you clear next steps.",
      },
      {
        q: "Will a reading app fix a reluctant reader?",
        a: "No app fixes reluctance on its own. Time2Read can help by putting your child at the center of a story about their interests, matching the reading level, and giving read-aloud and phonics help for tricky words. The habit still comes from you.",
      },
      { q: "How much does Time2Read cost?", a: pricingAnswer },
    ],
  },
  {
    slug: "stories-where-your-child-is-the-main-character",
    kind: "guide",
    title: "Stories Where Your Child Is the Main Character | Time2Read",
    metaDescription:
      "Personalized stories where your child is the hero: their name, their interests, their reading level, a new illustrated story every time, with read-aloud and phonics help. Ages 3 to 15.",
    h1: "Stories Where Your Child Is the Main Character",
    navLabel: "Stories starring your child",
    heroSubtitle:
      "Your child's name, their favorite things, their reading level, and a brand-new illustrated adventure every time they open the app.",
    heroImage: heroDiverse,
    heroImageAlt: "Children reading a personalized illustrated story",
    intro: [
      "Kids light up when they see themselves in a story. Personalized books have been around for years, usually as a printed book with your child's name dropped into a fixed plot. Time2Read takes the idea further: it writes a new story, around your child, every time.",
      "Tell it your child's first name (a nickname is fine), what they love and how well they read. Time2Read writes an illustrated story where they're the hero, at a level they can actually read.",
    ],
    benefits: [
      { title: "They're the hero", body: "Your child's name and interests drive the plot, not just the cover." },
      { title: "A new story every time", body: "Not one book on a shelf: a fresh adventure whenever they want one." },
      { title: "Matched to their level", body: "From pre-readers listening along to confident readers up to age 15." },
    ],
    sections: [
      {
        heading: "How it works",
        bullets: [
          "Choose your child's first name or a nickname, and pick a look for their character.",
          "Pick what the story is about: their favorite animal, sport, place or idea.",
          "Set the reading level. Younger children can listen with read-aloud narration, older ones read on their own.",
          "Read together or let them read alone. Every page has an illustration, tricky words can be tapped to hear them, and a 20-minute timer keeps the session a manageable size.",
        ],
      },
      {
        heading: "Printed personalized books vs. personalized story apps",
        paragraphs: [
          "A printed personalized book is a lovely keepsake: one story, made to order and shipped to your door. A story app like Time2Read is better for daily reading practice: the stories keep coming, the level can grow with your child, and help with hard words is built in. Many families find a place for both.",
        ],
      },
      {
        heading: "Why seeing themselves in the story matters",
        paragraphs: [
          "Researchers have studied children's personalized books and digital personalization in reading for more than a decade. Natalia Kucirkova's work is a good place to start if you want to read the research yourself. As a parent, you'll likely notice something simpler: a child who is the hero of the story wants to know what happens next.",
        ],
      },
      {
        heading: "Good for reluctant readers, too",
        paragraphs: [
          "If your child usually pushes books away, a story about their own interests, starring them, at a level they can manage, is a different kind of ask. See our guide for parents whose child hates reading.",
        ],
      },
    ],
    sources: [SOURCES.kucirkova],
    faqs: [
      {
        q: "Can my child really be the main character?",
        a: "Yes. Time2Read builds each story around your child's first name (or a nickname) and their interests, and they are the hero of the plot, with an illustration on every page.",
      },
      {
        q: "What ages are the personalized stories for?",
        a: "Ages 3 to 15. Pre-readers can listen with read-aloud narration while older children read at the level you set.",
      },
      {
        q: "Is it a printed book?",
        a: "No. Time2Read stories are read on a phone, tablet or computer, and a new story can be made whenever your child wants one.",
      },
      {
        q: "What do I need to share about my child?",
        a: "A first name or nickname and the things they like are enough to make the story theirs. You can use a nickname if you prefer.",
      },
      { q: "How much does it cost?", a: pricingAnswer },
    ],
  },
];
