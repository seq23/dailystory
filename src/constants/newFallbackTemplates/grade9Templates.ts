/**
 * Grade 9 Templates - Complete Fallback Story Library
 * 3 templates, ~15 chapters each, 1100-1300 words total
 * Advanced complexity with mature themes
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_9_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Economic Justice & Systemic Change
  {
    title: "The Cooperative Economy Project: Reimagining Community Wealth",
    theme: "Economic Justice & Systemic Change", 
    level: "Grade 9",
    scenes: [
      {
        text: "Chapter 1: Understanding Economic Inequality\n\n{userName} had always understood that some families in their community struggled financially, but their perspective on economic systems fundamentally shifted during a ninth-grade social studies unit examining wealth distribution patterns when they discovered that the median household income in their zip code was forty percent below the state average, despite their community's proximity to prosperous suburban developments and thriving commercial districts. This statistical revelation prompted deeper investigation into local economic structures, leading {userName} to interview small business owners, community members, and local government officials about the challenges facing their neighborhood, ultimately uncovering how decades of disinvestment, limited access to business capital, and absence of community-controlled economic institutions had created persistent poverty cycles that traditional charity approaches had failed to address effectively. Motivated by their passion for {hobbies} and inspired by historical examples of successful community organizing efforts, {userName} began researching cooperative economics, community development finance, and other alternative economic models that prioritized community ownership and democratic decision-making over purely profit-driven approaches to local business development and wealth creation.",
        pause: true,
        hook: "What innovative economic solutions will {userName} develop to build community wealth?",
        microVariants: {
          text: "Chapter 1: Understanding Economic Inequality\n\n{userName} had always understood that some families in their community struggled financially, but their perspective on economic systems fundamentally shifted during a ninth-grade social studies unit examining wealth distribution patterns when they discovered that the median household income in their zip code was forty percent below the state average, despite their community's proximity to prosperous suburban developments and thriving commercial districts. This statistical revelation prompted deeper investigation into local economic structures, leading {userName} to interview small business owners, community members, and local government officials about the challenges facing their neighborhood, ultimately uncovering how decades of disinvestment, limited access to business capital, and absence of community-controlled economic institutions had created persistent poverty cycles that traditional charity approaches had failed to address effectively. Motivated by their passion for {hobbies} and inspired by historical examples of successful community organizing efforts, {userName} began researching cooperative economics, community development finance, and other alternative economic models that prioritized community ownership and democratic decision-making over purely profit-driven approaches to local business development and wealth creation.",
          alternatives: [
            "Chapter 1: Analyzing Economic Disparities\n\n{userName} had previously recognized that certain households within their residential area experienced financial hardships, however their understanding of economic frameworks underwent comprehensive transformation during ninth-grade social studies curriculum examining wealth allocation dynamics when they identified that average family income within their postal district measured forty percent beneath statewide medians, notwithstanding their community's geographical adjacency to affluent residential subdivisions and flourishing business centers. This numerical discovery initiated expanded research into regional economic infrastructures, motivating {userName} to conduct interviews with entrepreneurial leaders, community residents, and municipal administrative personnel regarding obstacles confronting their locality, eventually revealing how prolonged periods of reduced investment, constrained availability of commercial financing, and deficit of community-managed economic organizations had established enduring financial hardship patterns that conventional charitable interventions had proven inadequate to resolve successfully. Energized by their enthusiasm for {hobbies} and influenced by historical precedents of effective grassroots mobilization initiatives, {userName} commenced investigation of collaborative economic principles, neighborhood development funding mechanisms, and additional alternative financial frameworks that emphasized community control and participatory governance over exclusively profit-maximizing strategies for local enterprise advancement and prosperity generation."
          ],
          optionalDetails: [
            `Economic Data ${Math.floor(Math.random() * 100)}: 65% of local businesses were single-location, family-owned enterprises.`,
            `Historical Context ${Math.floor(Math.random() * 100)}: The community lost its largest employer 12 years ago.`,
            `Resource Gap ${Math.floor(Math.random() * 100)}: Nearest community development financial institution was 35 miles away.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Regional Cooperative Network\n\nFive years after beginning their research into community economics, {userName} had successfully facilitated the establishment of a thriving network of worker and community-owned cooperatives spanning eight neighborhoods, creating over 150 living-wage jobs while keeping an estimated $2.3 million annually in community wealth through locally-controlled enterprises including a credit union, grocery cooperative, renewable energy installation company, and community land trust that provided affordable housing options for working families. Their model had attracted national attention from community development organizations and policy researchers, leading to speaking opportunities at cooperative economy conferences and consultation requests from communities seeking to replicate their success in building democratic, sustainable local economies. As {userName} prepared to begin college studies in community economic development, they reflected on how their initial investigation of neighborhood income statistics had evolved into a comprehensive understanding of how communities could create economic systems that prioritized human needs and community well-being over profit extraction, demonstrating that alternative economic models weren't just theoretical concepts but practical tools for building more equitable and sustainable communities.",
        microVariants: [
          "Their cooperative network had prevented displacement of 85 families through community land ownership, while creating pathways for 40+ community members to develop business ownership skills through cooperative development training programs."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "cooperative economics": ["community development", "social enterprise", "participatory budgeting", "community ownership"],
        "credit union": ["community bank", "microloan fund", "investment cooperative", "development fund"]
      },
      weatherVariants: ["systematically", "comprehensively", "strategically", "methodically"],
      settingVariants: ["throughout their community", "across neighborhoods", "within their region", "among local networks"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 2: Global Citizenship & Cultural Exchange  
  {
    title: "The Cultural Bridge Initiative: Connecting Communities Across Borders",
    theme: "Global Citizenship & Cultural Exchange",
    level: "Grade 9", 
    scenes: [
      {
        text: "Chapter 1: The International Perspective\n\n{userName} had participated in their school's annual cultural diversity celebration for three consecutive years, appreciating the opportunity to learn about different traditions and sample various international cuisines, but their understanding of global interconnectedness deepened significantly when their ninth-grade world history teacher introduced them to a partner school in rural Guatemala through a sister cities program that emphasized authentic cultural exchange rather than surface-level cultural tourism. Through weekly video conferences with students their age who spoke limited English while {userName} possessed only basic Spanish language skills, they began to understand how educational opportunities, economic circumstances, and environmental challenges varied dramatically across different global contexts, despite their shared interests in {hobbies}, similar concerns about climate change, and comparable aspirations for their future educational and career goals. These meaningful cross-cultural conversations revealed not only fascinating differences in daily life experiences but also surprising similarities in teenage concerns about family expectations, academic pressures, and social justice issues, inspiring {userName} to develop more sophisticated approaches to international friendship building that moved beyond simple pen pal relationships toward collaborative problem-solving and mutual learning partnerships.",
        pause: true,
        hook: "How will {userName} create lasting partnerships that bridge cultural and economic divides?",
        microVariants: {
          text: "Chapter 1: The International Perspective\n\n{userName} had participated in their school's annual cultural diversity celebration for three consecutive years, appreciating the opportunity to learn about different traditions and sample various international cuisines, but their understanding of global interconnectedness deepened significantly when their ninth-grade world history teacher introduced them to a partner school in rural Guatemala through a sister cities program that emphasized authentic cultural exchange rather than surface-level cultural tourism. Through weekly video conferences with students their age who spoke limited English while {userName} possessed only basic Spanish language skills, they began to understand how educational opportunities, economic circumstances, and environmental challenges varied dramatically across different global contexts, despite their shared interests in {hobbies}, similar concerns about climate change, and comparable aspirations for their future educational and career goals. These meaningful cross-cultural conversations revealed not only fascinating differences in daily life experiences but also surprising similarities in teenage concerns about family expectations, academic pressures, and social justice issues, inspiring {userName} to develop more sophisticated approaches to international friendship building that moved beyond simple pen pal relationships toward collaborative problem-solving and mutual learning partnerships.",
          alternatives: [
            "Chapter 1: Expanding Global Awareness\n\n{userName} had engaged in their educational institution's annual multicultural appreciation events for three consecutive academic years, valuing opportunities to explore diverse cultural practices and experience various international culinary traditions, however their comprehension of worldwide interconnection expanded substantially when their ninth-grade global studies instructor connected them with a collaborative educational facility in remote Guatemalan regions through municipal partnership programs emphasizing genuine cultural collaboration rather than superficial cultural observation activities. Through weekly digital conferences with age-matched students possessing limited English proficiency while {userName} maintained only fundamental Spanish communication abilities, they developed understanding regarding how educational access, financial circumstances, and ecological obstacles differed substantially across various international environments, despite their mutual engagement in {hobbies}, comparable environmental preservation concerns, and similar expectations regarding future academic and professional objectives. These substantive intercultural dialogues illuminated not merely intriguing variations in routine lifestyle experiences but additionally unexpected commonalities in adolescent anxieties regarding familial expectations, scholastic demands, and social equity concerns, motivating {userName} to formulate more sophisticated methodologies for international relationship development that progressed beyond basic correspondence connections toward cooperative problem resolution and reciprocal educational collaborations."
          ],
          optionalDetails: [
            `Cultural Exchange Detail ${Math.floor(Math.random() * 100)}: Partner students attended school only 4 days per week due to resource constraints.`,
            `Communication Challenge ${Math.floor(Math.random() * 100)}: Internet connectivity issues limited video calls to 20 minutes weekly.`,
            `Shared Interest ${Math.floor(Math.random() * 100)}: Both groups expressed passion for {favoriteColor} art and creative expression.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Final Chapter: The Global Student Network\n\nFour years of dedicated cross-cultural relationship building had transformed {userName} from a curious cultural observer into a bridge-builder who had facilitated meaningful partnerships between student groups in seven different countries, creating collaborative projects that addressed shared challenges like educational resource access, environmental conservation, and youth leadership development while celebrating the rich diversity of perspectives and approaches that emerged from different cultural contexts. Their international network had produced tangible outcomes including student exchange programs, collaborative research projects on global issues, joint fundraising efforts for community development initiatives, and a digital platform that connected young activists worldwide to share strategies and support each other's local organizing efforts. As {userName} reflected on their global citizenship journey while preparing applications for international development studies programs, they recognized how their initial sister school partnership had evolved into a deep appreciation for both cultural diversity and universal human experiences, demonstrating that authentic international relationships require sustained commitment to understanding different perspectives while working together toward common goals of justice, sustainability, and mutual respect across cultural and national boundaries.",
        microVariants: [
          "Their global network had facilitated student exchanges for 25+ participants, collaborative environmental projects in five countries, and establishment of a sister school partnership fund that provided educational resources to underserved communities worldwide."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "Guatemala": ["Philippines", "Kenya", "Peru", "Bangladesh"],
        "cultural diversity": ["international cooperation", "global citizenship", "cross-cultural learning", "multicultural understanding"]
      },
      weatherVariants: ["significantly", "substantially", "meaningfully", "profoundly"],
      settingVariants: ["across borders", "between countries", "throughout global networks", "among international communities"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 3: Innovation & Technology Ethics
  {
    title: "The Digital Privacy Initiative: Protecting Rights in the Digital Age",
    theme: "Innovation & Technology Ethics",
    level: "Grade 9",
    scenes: [
      {
        text: "Chapter 1: The Privacy Paradox Discovery\n\n{userName} had always accepted that using social media platforms, shopping websites, and educational technology required sharing personal information, assuming that privacy policies and terms of service agreements provided adequate protection for user data, until a ninth-grade computer science project investigating data collection practices revealed the extensive scope of personal information that technology companies systematically gathered, analyzed, and monetized without meaningful user understanding or consent. Through careful analysis of their own digital footprint across multiple platforms and devices, {userName} discovered that their online activities, location patterns, communication networks, and behavioral preferences had been compiled into detailed psychological profiles that were sold to advertisers, political organizations, and data brokers, creating a surveillance economy that profited from personal information while potentially exposing users to manipulation, discrimination, and security risks. This unsettling recognition coincided with their growing interest in {hobbies} and technology design, inspiring {userName} to research digital rights frameworks, privacy-preserving technologies, and ethical approaches to innovation that prioritized user agency and community benefit over corporate data extraction and profit maximization.",
        pause: true,
        hook: "What strategies will {userName} develop to protect digital privacy while promoting technological innovation?",
        microVariants: {
          text: "Chapter 1: The Privacy Paradox Discovery\n\n{userName} had always accepted that using social media platforms, shopping websites, and educational technology required sharing personal information, assuming that privacy policies and terms of service agreements provided adequate protection for user data, until a ninth-grade computer science project investigating data collection practices revealed the extensive scope of personal information that technology companies systematically gathered, analyzed, and monetized without meaningful user understanding or consent. Through careful analysis of their own digital footprint across multiple platforms and devices, {userName} discovered that their online activities, location patterns, communication networks, and behavioral preferences had been compiled into detailed psychological profiles that were sold to advertisers, political organizations, and data brokers, creating a surveillance economy that profited from personal information while potentially exposing users to manipulation, discrimination, and security risks. This unsettling recognition coincided with their growing interest in {hobbies} and technology design, inspiring {userName} to research digital rights frameworks, privacy-preserving technologies, and ethical approaches to innovation that prioritized user agency and community benefit over corporate data extraction and profit maximization.",
          alternatives: [
            "Chapter 1: Understanding Digital Surveillance\n\n{userName} had previously accommodated requirements that utilizing social networking services, commercial websites, and educational technological tools necessitated providing personal details, presuming that privacy documentation and service agreements offered sufficient safeguards for user information, until ninth-grade computer studies coursework examining information collection methodologies exposed the comprehensive range of personal data that technology corporations systematically accumulated, processed, and commercialized without substantive user comprehension or authorization. Through methodical examination of their individual digital presence across numerous platforms and devices, {userName} identified that their internet behaviors, geographical movement patterns, social connection networks, and preference indicators had been assembled into comprehensive psychological assessments that were distributed to marketing organizations, political entities, and information intermediaries, establishing surveillance-based economic systems that generated revenue from personal details while potentially subjecting users to influence campaigns, discriminatory practices, and security vulnerabilities. This concerning realization aligned with their expanding engagement in {hobbies} and technological innovation, motivating {userName} to investigate digital civil liberties structures, privacy-protecting technologies, and ethical innovation approaches that emphasized user autonomy and community advancement over corporate information harvesting and revenue optimization."
          ],
          optionalDetails: [
            `Data Discovery ${Math.floor(Math.random() * 100)}: Their personal profile contained over 5,000 data points from 12 different sources.`,
            `Privacy Violation ${Math.floor(Math.random() * 100)}: Location data revealed their {favoriteColor} route to school was tracked 247 times.`,
            `Commercial Impact ${Math.floor(Math.random() * 100)}: Their data profile was estimated to be worth $47 annually to marketing companies.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Privacy Rights Network\n\nThree years after discovering the extent of digital surveillance in their daily life, {userName} had successfully co-founded a youth-led organization that had advocated for comprehensive digital privacy legislation in their state while developing educational resources that helped thousands of teenagers understand and protect their digital rights through practical privacy tools, secure communication practices, and critical evaluation of technology platforms before sharing personal information. Their advocacy work had contributed to passage of student digital privacy protections in their school district, establishment of youth representation on municipal technology policy committees, and creation of peer education programs that empowered young people to make informed decisions about their digital lives while maintaining access to beneficial technologies for learning, creativity, and social connection. As {userName} prepared to study technology ethics and policy in college, they reflected on how their initial shock at discovering their digital surveillance had evolved into sophisticated understanding of how technology systems could be designed to respect human dignity and democratic values, demonstrating that young people could effectively advocate for digital rights while contributing to innovations that served community needs rather than corporate surveillance objectives.",
        microVariants: [
          "Their privacy advocacy had resulted in policy changes protecting student data in 15 school districts, development of privacy-focused educational technology, and establishment of a youth digital rights network serving as a national model for peer privacy education."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "social media": ["educational apps", "gaming platforms", "communication tools", "shopping sites"],
        "data brokers": ["advertising networks", "analytics companies", "marketing firms", "surveillance corporations"]
      },
      weatherVariants: ["systematically", "comprehensively", "extensively", "methodically"],
      settingVariants: ["across digital platforms", "throughout online spaces", "within technological systems", "among digital communities"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  }
];

/**
 * Get a random Grade 9 template or specific template by index
 */
export function getGrade9FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_9_FALLBACK_TEMPLATES.length) {
    return GRADE_9_FALLBACK_TEMPLATES[templateIndex];
  }
  
  if (GRADE_9_FALLBACK_TEMPLATES.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * GRADE_9_FALLBACK_TEMPLATES.length);
  return GRADE_9_FALLBACK_TEMPLATES[randomIndex];
}

/**
 * Get the count of available Grade 9 templates
 */
export function getGrade9FallbackTemplateCount(): number {
  return GRADE_9_FALLBACK_TEMPLATES.length;
}