# Blue-ocean queries for time-2-read.com

Researched 25 Oct 2026, $0 spent (no paid APIs, no OpenSEO credits). Read by the weekly
search checklist run: build the next unbuilt rows from the top, mark them built here, and
re-check the evidence column before building (results move).

## Method

- **Google autocomplete** (`suggestqueries.google.com`, `client=firefox`, `hl=en&gl=us`): 106
  modifier seeds (age N, grade N, boys/girls, ESL/bilingual, dyslexia, autism/ADHD, homeschool,
  summer, road trip, bedtime, "with my child's name", Spanish, phonics, Lexile, sight words,
  "reads aloud", free, printable), then a-z expansion of 30 promising stems (810 calls), giving
  about 2,800 unique suggestions. "AC" below means the phrase (or a close variant) appeared.
- **Search Console** (service account, 20 Jul to 23 Oct 2026): only 21 queries with
  impressions, mostly brand. Non-brand signals: `sight word generator` (pos 56),
  `kindergarten sight words` (56), `personalized books for 2 year olds` (54, outside our 3-15
  range), `very short bedtime stories` (97).
- **Competition**: live top results fetched for each query. "Weak" = forums, school-district
  pages, PDFs, app-store listings, thin or mirror/spam pages, product pages, no strong domain
  answering the question directly.
- **Honest fit**: no "no screens" or anti-AI framing; no medical claims (ADHD, struggling
  readers and dyslexia pages are supportive only). Stories are English-only today (Spanish is
  `enabled: false` in `src/constants/storyLanguages.ts`), and there is no custom sight-word
  input, so no page claims either.

## Ranked list

| # | Query (plus AC variants) | Evidence: AC / what ranks now / why beatable | Page | Status |
|---|---|---|---|---|
| 1 | is reading 20 minutes a day enough (does reading 20 minutes a day help, why is reading 20 minutes a day important, what happens if you read 20 minutes a day, reading 20 minutes a day statistics) | AC: about 30 variants on the 20-minute stem. Ranks: Help Me Grow Utah blog, Scholastic blog, a k12.sd.us page, a PDF, an ebookfriendly infographic, school district pages. Nobody traces the 1.8M-words figure to Anderson et al. 1988 Table 3; we do. | /is-reading-20-minutes-a-day-enough | BUILT |
| 2 | reading app with timer for kids (reading timer app for kids, reading app with timer, reading time tracker app) | AC: yes. Ranks: rainbowresource product pages, a 2013 eSchool News post, App Store listings, MIT App Inventor slides. No page answers it; exact product feature. | /reading-app-with-timer-for-kids | BUILT |
| 3 | reading app for struggling 8 year old (reading apps for kids struggling to read, best reading app for struggling kids) | AC: yes. Ranks: a homeschool forum thread, a 2012 educatorstechnology post, Understood video page, spam mirror domains. Very weak. | /reading-app-for-kids-struggling-to-read | BUILT |
| 4 | high interest low level stories for kids (hi lo books for kids, high interest low level books for 2nd/3rd/4th grade, for esl students) | AC: dozens of hi-lo variants. Ranks: Reading Rockets article, library catalogue lists, eBay, PDFs, publisher shop pages. No one offers hi-lo on the child's exact topic. | /high-interest-low-level-stories | BUILT |
| 5 | bedtime story about [a dinosaur / a unicorn / a dog...] for my kid (autocomplete: "write a bedtime story for my kid who's obsessed with dinosaurs and pasta") | AC: the literal prompt-style phrase, plus "bedtime story about a dinosaur/dog/unicorn/penguin". Ranks: only books for sale and audiobook listings. | /bedtime-stories-about-your-childs-favorite-things | BUILT |
| 6 | sight word story generator (create a story using sight words, sight words in a story, decodable story generator free) | AC: yes. GSC: `sight word generator` impression at pos 56. Ranks: mirror/spam pages ("Sight Word Stories Printable" on unrelated domains) and PDFs. Fit: beginner levels are Dolch-based. | /sight-word-story-generator | BUILT |
| 7 | how to make reading fun for kids with adhd (reading apps for kids with adhd, best reading app for adhd kids) | AC: yes. Ranks: news24, BookTrust, PsychCentral, ADDitude, Joon app blog, monstermath blog. Mixed; the app-intent variant is weak (vendor blogs). Supportive framing only. | /reading-for-kids-with-adhd | BUILT |
| 8 | reading app for esl kids (reading apps for esl students, easy stories for esl kids) | AC: yes. Ranks: a Gumroad listing, App Store listings, TeachThought roundups, bookriot 2019. Weak. Stories are English; page says so. | /reading-app-for-esl-kids | BUILT |
| 9 | how many minutes should a child read a day (by age) | AC: yes. Ranks: k12.sd.us page, Storypod blog, Reading Eggs support article, LeapFrog tip, a forum. No authoritative age table. Covered as a section of #1; a dedicated page could follow if #1 earns impressions. | (section of #1) | partly covered |
| 10 | my 8 year old doesn't want to read (my 8/9 year old refuses to read, my son refuses to read, why does my child refuse to read) | AC: yes, many. Ranks: Understood (strong), PTA blog, Scottish Book Trust PDF, Scary Mommy, GreatSchools, LeapFrog forum. Medium. Overlaps /my-child-hates-reading: add an age-by-age "refuses to read" section there rather than a new page. | /my-child-hates-reading (extend) | next |
| 11 | how to help a 2nd grader with reading fluency (how can i help my second grader read better) | AC: yes. Ranks: Reading Rockets (strong), a thesis, PDFs, Think Academy blog. Medium. | new: /help-second-grader-read-better | next |
| 12 | summer reading 20 minutes a day app (summer reading tracker app, summer reading log for kids printable) | AC: yes. Ranks: library pages pointing at Beanstack/READsquared, school flyers. Seasonal: build by April 2027 as a summer variant of the reading log. | new: /summer-reading-log | next (seasonal) |
| 13 | ai story generator with pictures for kids (with reading level) | AC: yes. Ranks: beehiiv/stork.ai directory pages, App Store, Product Hunt, hackathon pages. Weak but crowded with apps. | new: /ai-story-generator-for-kids | next |
| 14 | bedtime story with my child's name (personalized bedtime stories for kids) | AC: yes. Ranks: App Store and Product Hunt listings only. Overlaps #5 and /stories-where-your-child-is-the-main-character; add a FAQ there first. | existing pages (extend) | next |
| 15 | reading apps for kids with autism (best reading app for autistic kids, how to teach an autistic child to read) | AC: yes. Ranks: App Store, mind.org.my, Frontiers PDF, pastory.app, smiletutor. Weak, but needs very careful supportive framing and a real source (e.g. a peer-reviewed review). | new: /reading-for-autistic-kids | later |
| 16 | dyslexia friendly stories for 7 year olds (dyslexia friendly books for 8/10/12 year olds) | AC: yes, by age. Ranks: BookTrust, Barrington Stoke retailers, Bookshop.org lists (strong, UK). The product has no dyslexia font or font-size control yet; build only if that ships. | blocked on product fit | later |
| 17 | reading log with parent signature (weekly / daily / pdf) | AC: yes, many. Our /20-minute-reading-log already has an initials column: retitle a section and FAQ to the exact phrase. | /20-minute-reading-log (extend) | next |
| 18 | if you read 20 minutes a day how many books | AC: yes. Ranks: blogs and infographics. Answer as a FAQ on #1. | (FAQ on #1) | next |
| 19 | reading app for homeschool (best reading app for homeschool) | AC: yes. Ranks: homeschool blogs and listicles. Medium. | new: /reading-app-for-homeschool | later |
| 20 | high interest low level books for esl students | AC: yes. Ranks: teacher blogs, library lists. Covered by #4 and #8 together. | (#4 + #8) | covered |
| 21 | free reading app for kids no subscription | AC: yes. Weak SERP, but our model is 3 free stories then a subscription: honest fit is poor. Do not build. | none | rejected |
| 22 | books for reluctant boy readers age 8 (and other ages) | AC: yes, by age and gender. Intent is book lists (titles to buy); we are not a book list. Do not build. | none | rejected |
| 23 | reading app in spanish / bilingual stories for kids | AC: yes. Stories are English-only today. Build only when Spanish stories ship. | blocked on product | later |

## Notes for the next run

- Sources that block bots (Reading Rockets returns 403 to fetchers) were checked through the
  search tool's live extract; re-check the wording by hand if a page is edited.
- The kindergarten sight words page used to claim parents could type in their own sight
  words. That feature does not exist; the copy was corrected in the same PR as these pages.
