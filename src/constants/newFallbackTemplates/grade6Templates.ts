/**
 * Grade 6 Templates - Complete Fallback Story Library
 * 3 templates, ~12 pages each, 800-900 words total
 * Random seed variation for unique experiences
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_6_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Scientific Discovery & Environmental Stewardship
  {
    title: "The Biosphere Project: Discovering Life's Hidden Connections",
    theme: "Science & Environmental Discovery", 
    level: "Grade 6",
    scenes: [
      {
        text: "Chapter 1: The Discovery\n\n{userName} had always been fascinated by the intricate relationships that existed within natural ecosystems, but their passion for {hobbies} had never prepared them for the extraordinary discovery they were about to make during their sixth-grade environmental science project. While investigating the biodiversity of their local watershed for a presentation on ecological interconnections, they noticed something that made their scientific curiosity intensify dramatically. The {favoriteColor} algae formations in the stream weren't behaving according to any patterns they had studied in their textbooks or observed in previous field research. Instead of following predictable seasonal cycles, these microorganisms seemed to be responding to environmental factors in ways that suggested a level of communication and coordination that challenged everything {userName} thought they understood about biological systems.",
        pause: true,
        hook: "What could be causing these algae to behave so unusually, and what might this discovery reveal about the hidden connections in nature?",
        microVariants: {
          text: "Chapter 1: The Discovery\n\n{userName} had always been fascinated by the intricate relationships that existed within natural ecosystems, but their passion for {hobbies} had never prepared them for the extraordinary discovery they were about to make during their sixth-grade environmental science project. While investigating the biodiversity of their local watershed for a presentation on ecological interconnections, they noticed something that made their scientific curiosity intensify dramatically. The {favoriteColor} algae formations in the stream weren't behaving according to any patterns they had studied in their textbooks or observed in previous field research. Instead of following predictable seasonal cycles, these microorganisms seemed to be responding to environmental factors in ways that suggested a level of communication and coordination that challenged everything {userName} thought they understood about biological systems.",
          alternatives: [
            "Chapter 1: The Unexpected Observation\n\n{userName} possessed an inherent fascination with the complex interdependencies that characterized natural ecological systems, yet their dedication to {hobbies} provided no preparation for the remarkable scientific revelation they would encounter during their sixth-grade environmental research initiative. Throughout their systematic investigation of local watershed biodiversity patterns as part of an academic presentation focusing on ecological interconnectedness, they observed phenomena that dramatically intensified their scientific inquiry instincts."
          ],
          optionalDetails: [
            `Random Element ${Math.floor(Math.random() * 100)}: The water temperature fluctuated in unusual patterns.`,
            `Random Element ${Math.floor(Math.random() * 100)}: Nearby industrial activity had recently changed.`,
            `Random Element ${Math.floor(Math.random() * 100)}: The algae seemed to pulse with bioluminescent properties.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Final Chapter: The Living Laboratory\n\nTen years later, Dr. {userName} sat peacefully in their research laboratory, now recognized as one of the world's leading experts in microbial communication systems. The discovery they had made as a sixth-grader had evolved into groundbreaking research that was helping scientists understand how ecosystems adapt to climate change. Through their office window, they could see the restored watershed where it all began, now protected as a research preserve where students from around the world came to study the remarkable {favoriteColor} algae colonies.",
        microVariants: [
          "Final Chapter: The Legacy of Discovery\n\nA decade afterward, Professor {userName} found tranquil satisfaction within their advanced research facility, having achieved international recognition as a pioneering authority in microbial ecosystem communication research."
        ]
      },
      {
        type: 'silly',
        text: "Final Chapter: The Algae Appreciation Society\n\nThe international scientific conference celebrating {userName}'s discovery turned into the most wonderfully chaotic academic event in history when the {favoriteColor} algae samples they had brought for demonstration suddenly began exhibiting their most spectacular synchronized swimming patterns right in the middle of their keynote presentation! \"Ladies and gentlemen,\" {userName} announced with a grin, \"I present to you the world's first algae dance party!\"",
        microVariants: [
          "Final Chapter: The Great Algae Extravaganza\n\nThe prestigious international symposium honoring {userName}'s groundbreaking research transformed into the most delightfully absurd scientific gathering in academic history when their {favoriteColor} algae demonstration specimens spontaneously initiated their most extraordinary synchronized performance exhibition!"
        ]
      },
      {
        type: 'triumphant',
        text: "Final Chapter: The Scientific Revolution\n\nStanding before the United Nations Environmental Council as the youngest recipient of the Global Environmental Discovery Award, {userName} felt the weight of history as they prepared to address world leaders about their groundbreaking research. \"Ten years ago, as a curious sixth-grader studying algae in a local stream, I discovered that life on Earth is far more connected and intelligent than we ever imagined,\" they began.",
        microVariants: [
          "Final Chapter: The Global Impact\n\nAddressing the assembled representatives of the International Scientific Community as the most distinguished young recipient of the Planetary Environmental Innovation Recognition, {userName} experienced the profound significance of this historical moment."
        ]
      },
      {
        type: 'reflective',
        text: "Final Chapter: The Circle of Understanding\n\nStanding quietly by the preserved research site where their journey had begun, watching the {favoriteColor} algae continue their mysterious communications in the gentle current, {userName} understood something profound about science, discovery, and humanity's relationship with the natural world. \"Science isn't just about finding answers,\" they reflected with deep wisdom. \"It's about learning to ask better questions and remaining humble before the incredible complexity and beauty of life itself.\"",
        microVariants: [
          "Final Chapter: The Philosophy of Discovery\n\nResting peacefully beside the conserved research location where their scientific journey had commenced, observing the {favoriteColor} algae maintaining their enigmatic communications within the gentle water flow, {userName} comprehended something profound about science, discovery, and humanity's relationship with natural world systems."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "scientific_equipment": ["microscopes", "water testing kits", "data loggers", "sample containers", "measurement tools"],
        "research_findings": ["communication patterns", "chemical signals", "behavioral adaptations", "environmental responses", "ecosystem connections"],
        "career_paths": ["marine biology", "environmental science", "microbiology", "ecology research", "conservation biology"]
      },
      weatherVariants: ["clear research day", "overcast field work", "sunny data collection", "misty morning observations"],
      settingVariants: ["stream ecosystem", "university laboratory", "research field station", "environmental preserve"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 2: Adventure/Mystery Theme
  {
    title: "The Digital Detective: Solving the School's Greatest Mystery",
    theme: "Adventure & Mystery Investigation",
    level: "Grade 6", 
    scenes: [
      {
        text: "Chapter 1: The Impossible Disappearance\n\n{userName} had always been fascinated by technology and problem-solving, often spending their time practicing {hobbies} while helping classmates troubleshoot computer problems and learning advanced programming techniques from online tutorials. But their technical skills became the foundation for an extraordinary mystery when they discovered that their school's entire digital archive - containing decades of student records, historical documents, and irreplaceable yearbook collections - had somehow vanished from the supposedly secure server system without triggering any security alerts or leaving obvious traces of unauthorized access. The disappearance was particularly puzzling because the digital files hadn't been deleted or corrupted; they had simply ceased to exist in any detectable form, as if they had never been stored in the system at all. \"This isn't a typical data breach or system failure,\" {userName} realized while examining the server logs with the systematic approach they had developed through years of debugging complex programs. \"Someone with extremely sophisticated technical knowledge has found a way to completely erase digital information without leaving conventional evidence, and if we can't recover those files, our school will lose decades of institutional memory and thousands of students' academic records permanently.\"",
        pause: true,
        hook: "What advanced digital forensics techniques will {userName} use to solve this unprecedented cyber mystery?",
        microVariants: {
          text: "Chapter 1: The Impossible Disappearance\n\n{userName} had always been fascinated by technology and problem-solving, often spending their time practicing {hobbies} while helping classmates troubleshoot computer problems and learning advanced programming techniques from online tutorials. But their technical skills became the foundation for an extraordinary mystery when they discovered that their school's entire digital archive - containing decades of student records, historical documents, and irreplaceable yearbook collections - had somehow vanished from the supposedly secure server system without triggering any security alerts or leaving obvious traces of unauthorized access. The disappearance was particularly puzzling because the digital files hadn't been deleted or corrupted; they had simply ceased to exist in any detectable form, as if they had never been stored in the system at all. \"This isn't a typical data breach or system failure,\" {userName} realized while examining the server logs with the systematic approach they had developed through years of debugging complex programs. \"Someone with extremely sophisticated technical knowledge has found a way to completely erase digital information without leaving conventional evidence, and if we can't recover those files, our school will lose decades of institutional memory and thousands of students' academic records permanently.\"",
          alternatives: [
            "Chapter 1: The Digital Enigma\n\n{userName} had consistently maintained deep fascination with technological systems and analytical problem-solving methodologies, frequently dedicating periods to practicing {hobbies} while providing technical assistance to classmates experiencing computer difficulties and acquiring advanced programming competencies through comprehensive online educational resources."
          ],
          optionalDetails: [
            `Random Seed ${Math.floor(Math.random() * 1000)}: The server room had unusual {favoriteColor} indicator lights that seemed to pulse in patterns.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: The school's {favoriteAnimal} mascot statue had been mysteriously moved near the computer lab.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: Strange electromagnetic readings were detected during the cafeteria's {favoriteFood} preparation times.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Final Chapter: The Digital Guardian\n\nTwo years after solving the school's greatest technological mystery, {userName} had established themselves as the institution's unofficial Chief Digital Security Officer, spending peaceful afternoons in the upgraded computer lab while mentoring younger students in cybersecurity principles and digital forensics techniques. The advanced security systems they had designed and implemented had become a model for schools throughout the district, while their innovative approach to data protection had earned recognition from cybersecurity professionals nationwide.",
        microVariants: [
          "Final Chapter: The Technology Mentor\n\nFollowing two years after resolving the educational institution's most significant technological mystery, {userName} had achieved recognition as the school's unofficial Chief Digital Security Officer, dedicating tranquil afternoon periods within the enhanced computer laboratory."
        ]
      },
      {
        type: 'silly',
        text: "Final Chapter: The Great Digital Dance Party\n\nThe school's cybersecurity celebration reached maximum silliness when the newly secured server system became so excited about being properly protected that it started playing everyone's favorite music and turning the computer lab into an impromptu dance floor! \"This is what happens when computers get happy about good security!\" {userName} laughed as students and teachers alike discovered that debugging code was infinitely more fun when accompanied by an epic soundtrack!",
        microVariants: [
          "Final Chapter: The Cybersecurity Celebration Chaos\n\nThe educational institution's cybersecurity celebration achieved magnificent levels of technological silliness when the newly secured server infrastructure became so enthusiastic about proper protection that it commenced playing everyone's preferred musical selections!"
        ]
      },
      {
        type: 'triumphant',
        text: "Final Chapter: The National Recognition\n\nStanding before the National Cybersecurity Education Council as the youngest recipient of the Excellence in Digital Security Award, {userName} addressed hundreds of technology professionals, educators, and policy makers about their groundbreaking work in educational cybersecurity. \"This remarkable young technologist has not only solved one of the most sophisticated digital crimes ever attempted against an educational institution but has also developed innovative security protocols that are revolutionizing how schools protect student data nationwide,\" declared the Council's director.",
        microVariants: [
          "Final Chapter: The Technology Leadership Summit\n\nAddressing the National Cybersecurity Education Council as the historically youngest recipient of the Excellence in Digital Security Award, {userName} presented to hundreds of technology professionals, educational administrators, and policy development specialists."
        ]
      },
      {
        type: 'reflective',
        text: "Final Chapter: The Digital Philosophy\n\nSitting quietly in the school's computer lab during the peaceful evening hours, surrounded by the gentle humming of secure servers and the soft {favoriteColor} glow of monitoring systems, {userName} contemplated the profound responsibility that comes with technological knowledge and digital citizenship. \"Technology is like any powerful tool,\" they reflected with deep understanding. \"It can be used to create or destroy, to help or harm, to bring people together or drive them apart.\"",
        microVariants: [
          "Final Chapter: The Ethics of Digital Citizenship\n\nResting peacefully within the school's computer laboratory during tranquil evening periods, surrounded by gentle operational sounds of secure servers and soft {favoriteColor} illumination from monitoring systems, {userName} contemplated the profound responsibility accompanying technological knowledge."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "tech_elements": ["server systems", "security protocols", "digital forensics", "data recovery", "cybersecurity"],
        "investigation_tools": ["system logs", "network analysis", "code examination", "digital evidence", "security audits"],
        "tech_challenges": ["encrypted data", "system vulnerabilities", "network intrusions", "data corruption", "security breaches"]
      },
      weatherVariants: ["quiet morning lab session", "focused afternoon work", "late evening analysis", "weekend investigation time"],
      settingVariants: ["computer laboratory", "server room", "digital forensics workspace", "cybersecurity command center"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 3: Friendship/School Theme
  {
    title: "The International Student Exchange Revolution",
    theme: "Friendship & School Community",
    level: "Grade 6",
    scenes: [
      {
        text: "Chapter 1: The Connection Across Continents\n\n{userName} had always been curious about different cultures and global perspectives, often spending their free time practicing {hobbies} while researching international customs, languages, and educational systems through online cultural exchange programs and virtual classroom connections. But their interest in global citizenship became a transformative reality when their social studies teacher, Ms. Chen, announced that their class had been selected to participate in an innovative digital exchange program with students from five different continents, including a school in rural Kenya where students learned under solar-powered technology, a mountain village school in Peru where classes were conducted in both Spanish and Quechua, and an urban academy in Singapore where students specialized in sustainable engineering projects. The program's mission was ambitious: to create collaborative solutions to real-world problems affecting young people globally, from climate change adaptation to educational resource inequality, while building meaningful friendships that transcended geographical boundaries and cultural differences. \"This isn't just about learning from textbooks anymore,\" {userName} realized with growing excitement as they prepared for their first international video conference. \"We're going to work directly with students our age who face completely different challenges and opportunities, and together we might actually develop ideas that could make a real difference in communities around the world while discovering that friendship and collaboration can happen anywhere when people share common goals and genuine curiosity about each other's experiences.\"",
        pause: true,
        hook: "What incredible global friendships and collaborative projects will {userName} develop through this international exchange program?",
        microVariants: {
          text: "Chapter 1: The Connection Across Continents\n\n{userName} had always been curious about different cultures and global perspectives, often spending their free time practicing {hobbies} while researching international customs, languages, and educational systems through online cultural exchange programs and virtual classroom connections. But their interest in global citizenship became a transformative reality when their social studies teacher, Ms. Chen, announced that their class had been selected to participate in an innovative digital exchange program with students from five different continents, including a school in rural Kenya where students learned under solar-powered technology, a mountain village school in Peru where classes were conducted in both Spanish and Quechua, and an urban academy in Singapore where students specialized in sustainable engineering projects. The program's mission was ambitious: to create collaborative solutions to real-world problems affecting young people globally, from climate change adaptation to educational resource inequality, while building meaningful friendships that transcended geographical boundaries and cultural differences. \"This isn't just about learning from textbooks anymore,\" {userName} realized with growing excitement as they prepared for their first international video conference. \"We're going to work directly with students our age who face completely different challenges and opportunities, and together we might actually develop ideas that could make a real difference in communities around the world while discovering that friendship and collaboration can happen anywhere when people share common goals and genuine curiosity about each other's experiences.\"",
          alternatives: [
            "Chapter 1: The Global Classroom Initiative\n\n{userName} had consistently maintained curiosity regarding diverse cultural perspectives and global viewpoints, frequently dedicating leisure periods to practicing {hobbies} while investigating international customs, linguistic systems, and educational methodologies through online cultural exchange programs."
          ],
          optionalDetails: [
            `Random Seed ${Math.floor(Math.random() * 1000)}: The exchange program included sharing traditional {favoriteFood} recipes from each participating culture.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: Students from Kenya sent photos of local {favoriteAnimal} wildlife that became project inspiration.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: The video conferences featured {favoriteColor} cultural decorations from each participating school.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Final Chapter: The Global Family\n\nThree years later, {userName} sat peacefully in their room, surrounded by {favoriteColor} decorations and gifts from friends around the world, while video-chatting with their international classmates who had become like family members separated only by geography but united by shared experiences and mutual support. Their collaborative projects had evolved into lasting initiatives that continued to benefit communities across multiple continents, while the friendships they had built through patient communication, cultural exchange, and genuine care had proven that distance means nothing when people choose to understand and support each other.",
        microVariants: [
          "Final Chapter: The International Network\n\nFollowing three years, {userName} discovered peaceful contentment within their room, surrounded by {favoriteColor} decorations and gifts from friends worldwide, while participating in video communication with their international classmates who had evolved into family members."
        ]
      },
      {
        type: 'silly',
        text: "Final Chapter: The International Celebration Chaos\n\nThe global reunion celebration got wonderfully out of control when all five schools decided to throw a simultaneous virtual party that somehow synchronized their time zones through pure enthusiasm and resulted in the most epic international dance-off in educational history! \"This is what happens when friendship goes global!\" {userName} laughed as the {favoriteColor} decorations from all five schools created a rainbow effect on screen!",
        microVariants: [
          "Final Chapter: The Global Party Phenomenon\n\nThe international reunion celebration escalated to magnificent proportions when all five educational institutions collectively decided to organize simultaneous virtual festivities that somehow achieved time zone synchronization through pure enthusiasm!"
        ]
      },
      {
        type: 'triumphant',
        text: "Final Chapter: The United Nations Recognition\n\nStanding before the United Nations Youth Assembly as representatives of their groundbreaking international collaboration program, {userName} and their global classmates received the highest honor for educational innovation and cross-cultural cooperation from delegates representing every continent. \"These remarkable young global citizens have demonstrated that education transcends borders when students are empowered to learn from each other, solve problems together, and build friendships that span the entire world,\" declared the UN Secretary-General for Educational Development.",
        microVariants: [
          "Final Chapter: The Global Education Summit\n\nAddressing the United Nations Youth Assembly as representatives of their revolutionary international collaboration program, {userName} and their global classmates received supreme recognition for educational innovation and cross-cultural cooperation."
        ]
      },
      {
        type: 'reflective',
        text: "Final Chapter: The Wisdom of Global Connection\n\nSitting quietly by their window as the sun set, holding a handwritten letter from their friend in Kenya while looking at photographs from Peru, Singapore, and around the world, {userName} understood something beautiful about human connection, empathy, and the true meaning of global citizenship. \"Every person, no matter where they live or what language they speak, has dreams, challenges, and stories that matter,\" they reflected with deep understanding. \"When we take the time to really listen to each other and work together toward common goals, we discover that the things that unite us as human beings are so much stronger than anything that might divide us.\"",
        microVariants: [
          "Final Chapter: The Philosophy of Global Understanding\n\nResting peacefully beside their window as solar illumination descended, holding handwritten correspondence from their friend in Kenya while observing photographs from Peru, Singapore, and worldwide locations, {userName} comprehended something profound about human connection and empathy."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "global_elements": ["cultural exchange", "international collaboration", "virtual conferences", "cross-cultural projects", "global friendships"],
        "project_themes": ["climate solutions", "educational equity", "cultural preservation", "community development", "technological innovation"],
        "participating_schools": ["Kenya solar school", "Peru mountain village", "Singapore urban academy", "Arctic research station", "Australian outback classroom"]
      },
      weatherVariants: ["morning video calls", "afternoon project sessions", "evening cultural exchanges", "weekend international meetups"],
      settingVariants: ["virtual classroom", "international conference room", "cultural exchange center", "global collaboration space"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  }
];

/**
 * Get a random Grade 6 template
 */
export function getGrade6FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (GRADE_6_FALLBACK_TEMPLATES.length === 0) return null;
  
  const index = templateIndex !== undefined 
    ? Math.min(templateIndex, GRADE_6_FALLBACK_TEMPLATES.length - 1)
    : Math.floor(Math.random() * GRADE_6_FALLBACK_TEMPLATES.length);
  
  return GRADE_6_FALLBACK_TEMPLATES[index];
}

/**
 * Get the count of Grade 6 templates
 */
export function getGrade6FallbackTemplateCount(): number {
  return GRADE_6_FALLBACK_TEMPLATES.length;
}