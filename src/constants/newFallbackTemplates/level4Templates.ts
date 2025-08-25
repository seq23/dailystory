/**
 * Level 4 Templates (Ages 11-13) - Complete Fallback Story Library
 * 5 templates with 8-15 scenes each, 90-140 words per scene  
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_4_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Social Justice Advocacy Theme
  {
    title: "The Digital Divide Initiative", 
    theme: "Social Justice Advocacy",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always taken their high-speed internet connection and modern laptop for granted until they began tutoring elementary students at the community center and discovered a disturbing reality that challenged their understanding of educational equity. While helping with homework assignments, they noticed that several bright students were struggling not because they lacked intelligence or motivation, but because they had no reliable internet access at home and were trying to complete digital assignments on outdated smartphones with cracked screens. The inequality became starkly apparent when {userName} realized that their own passion for {hobbies} had been nurtured through countless online resources, educational videos, and virtual communities that these students simply could not access, creating a technological barrier that was directly impacting their academic success and future opportunities.",
        pause: true,
        hook: "How can {userName} address this technological inequality that's affecting their students' education?",
        microVariants: {
          text: "{userName} had always taken their high-speed internet connection and modern laptop for granted until they began tutoring elementary students at the community center and discovered a disturbing reality that challenged their understanding of educational equity. While helping with homework assignments, they noticed that several bright students were struggling not because they lacked intelligence or motivation, but because they had no reliable internet access at home and were trying to complete digital assignments on outdated smartphones with cracked screens. The inequality became starkly apparent when {userName} realized that their own passion for {hobbies} had been nurtured through countless online resources, educational videos, and virtual communities that these students simply could not access, creating a technological barrier that was directly impacting their academic success and future opportunities.",
          alternatives: [
            "{userName} experienced a profound awakening regarding digital inequality when they commenced volunteer tutoring services at the local community educational facility and encountered educational disparities that fundamentally challenged their assumptions about academic accessibility. During collaborative homework sessions, they observed that numerous academically gifted students were experiencing significant challenges not due to intellectual limitations or insufficient dedication, but rather because they lacked consistent broadband internet connectivity in their residential environments and were attempting to complete technology-dependent academic assignments using obsolete mobile devices with compromised functionality."
          ],
          optionalDetails: ["The community center's WiFi was unreliable and often overloaded.", "Some families couldn't afford internet bills along with other necessities.", "Teachers were assigning more digital work without considering home technology access."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Two years later, {userName} sat in the renovated community center, now bustling with students using high-speed internet and modern computers to explore their dreams and complete their assignments. The soft hum of technology working in harmony with human potential filled the space as they watched a young student discover their passion for {hobbies} through the same online resources that had once been beyond their reach. {userName} smiled peacefully, understanding that true social justice work creates ripples of opportunity that extend far beyond any single initiative, touching lives and opening futures in ways that continue to unfold for generations.",
        microVariants: [
          "Following twenty-four months of sustained advocacy efforts, {userName} found tranquil satisfaction within the completely transformed community learning facility, now vibrating with educational energy as students utilized advanced internet connectivity and contemporary computing equipment to investigate their academic and professional aspirations."
        ]
      },
      {
        type: 'silly',
        text: "The celebration got wonderfully chaotic when the new high-speed internet was so fast that it seemed to make everything in the community center move at super-speed too! Students were typing so quickly their fingers became blurs, the {favoriteAnimal} mascot they'd adopted for the center started doing victory laps around the computers, and even the {favoriteFood} in the snack area seemed to be bouncing with excitement! \"Technology celebration overload!\" {userName} laughed as confetti somehow started shooting out of the printers and everyone began doing the \"Digital Equality Dance\" that had absolutely no choreography but maximum enthusiasm!",
        microVariants: [
          "The victory party reached hilariously absurd proportions when the newly installed ultra-high-speed internet connectivity appeared to accelerate everything within the community center to comically supernatural velocities!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the National Youth Social Justice Awards ceremony, {userName} stood before hundreds of advocates and policy makers as they received the highest honor for educational equity activism. \"Young leaders like {userName} demonstrate that age is no barrier to creating systemic change!\" declared the keynote speaker. \"Their comprehensive approach to addressing digital inequality has not only transformed their local community but has become a national model for bridging the digital divide.\"",
        microVariants: [
          "During the prestigious National Conference on Educational Justice and Social Change, {userName} accepted the supreme recognition for youth leadership in equity advocacy while addressing an audience of hundreds of social justice professionals and governmental policy architects."
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly in the evening light of the community center, surrounded by the gentle hum of technology serving human potential, {userName} understood something profound about justice, equity, and the responsibility that comes with privilege. \"True social justice isn't about charity,\" they realized with deep wisdom. \"It's about recognizing that everyone deserves equal opportunities to reach their potential, and when we have advantages that others don't, we have a responsibility to use those advantages to level the playing field for everyone.\"",
        microVariants: [
          "Resting peacefully within the evening illumination of the community center, surrounded by gentle sounds of technology serving human development, {userName} comprehended something profound about justice, equity, and responsibility accompanying privilege."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "tech_resources": ["laptops", "internet access", "educational software", "online courses", "digital libraries"],
        "advocacy_tools": ["community organizing", "policy research", "fundraising", "awareness campaigns", "coalition building"],
        "stakeholders": ["students", "families", "teachers", "community leaders", "technology companies"]
      },
      weatherVariants: ["focused work session", "community meeting evening", "advocacy event afternoon", "celebration day"],
      settingVariants: ["community center", "school computer lab", "public library", "advocacy headquarters"]
    }
  },

  // Template 2: Mystery & Problem-Solving Theme
  {
    title: "The Vanishing Art Investigation", 
    theme: "Mystery & Problem-Solving",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always been drawn to mysteries and puzzles, often spending their free time practicing {hobbies} while reading detective novels and solving logic problems that challenged their analytical thinking skills. But they never expected to find themselves in the middle of a real mystery that would test every deductive reasoning ability they had developed. It all started when their art teacher, Ms. Valdez, discovered that three valuable student paintings had mysteriously disappeared from the locked display case in the school hallway overnight, with no signs of forced entry and no obvious clues about how someone could have accessed the secured area. The missing artworks included a stunning {favoriteColor} landscape by their friend Maya, a portrait series by Alex, and most troubling of all, the collaborative mural that {userName}'s entire class had worked on for months as their contribution to the upcoming district art exhibition. \"This doesn't make sense,\" {userName} observed while carefully examining the crime scene with the methodical approach they had learned from their favorite mystery novels. \"Whoever did this had to know the display case's security code, the school's after-hours schedule, and exactly which pieces would cause the most disruption to our exhibition plans. This feels less like random theft and more like sabotage with a very specific target in mind.\"",
        pause: true,
        hook: "What clues will {userName} uncover to solve this puzzling art theft mystery?",
        microVariants: {
          text: "{userName} had always been drawn to mysteries and puzzles, often spending their free time practicing {hobbies} while reading detective novels and solving logic problems that challenged their analytical thinking skills. But they never expected to find themselves in the middle of a real mystery that would test every deductive reasoning ability they had developed. It all started when their art teacher, Ms. Valdez, discovered that three valuable student paintings had mysteriously disappeared from the locked display case in the school hallway overnight, with no signs of forced entry and no obvious clues about how someone could have accessed the secured area. The missing artworks included a stunning {favoriteColor} landscape by their friend Maya, a portrait series by Alex, and most troubling of all, the collaborative mural that {userName}'s entire class had worked on for months as their contribution to the upcoming district art exhibition. \"This doesn't make sense,\" {userName} observed while carefully examining the crime scene with the methodical approach they had learned from their favorite mystery novels. \"Whoever did this had to know the display case's security code, the school's after-hours schedule, and exactly which pieces would cause the most disruption to our exhibition plans. This feels less like random theft and more like sabotage with a very specific target in mind.\"",
          alternatives: [
            "{userName} had consistently maintained attraction to mysteries and intellectual puzzles, frequently dedicating leisure time to practicing {hobbies} while consuming detective literature and resolving logic challenges that stimulated their analytical reasoning capabilities. However, they never anticipated discovering themselves positioned within an authentic mystery that would evaluate every deductive reasoning skill they had cultivated."
          ],
          optionalDetails: ["The security cameras had mysteriously malfunctioned during the theft window.", "Only certain staff members and trusted students knew the display case code.", "The timing coincided with preparations for the competitive district art exhibition."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Three months later, {userName} sat peacefully in the school's newly enhanced art gallery, watching students and visitors admire the recovered masterpieces that now hung in a state-of-the-art security display system. The mystery had been solved through their careful detective work, leading to the artwork's recovery and the implementation of better security measures that protected student creativity without dampening artistic expression. As they practiced their {hobbies} surrounded by the {favoriteColor} walls adorned with inspiring art from students across all grade levels, {userName} felt deep satisfaction knowing that their analytical skills and determination had preserved their classmates' artistic achievements and strengthened their school's commitment to supporting young artists and their creative dreams.",
        microVariants: [
          "Following three months, {userName} discovered tranquil satisfaction within the school's newly enhanced art gallery environment, observing students and visitors appreciating the recovered masterpieces now displayed within state-of-the-art security presentation systems."
        ]
      },
      {
        type: 'silly', 
        text: "The art mystery celebration got wonderfully out of control when the recovered paintings were so happy to be back that they seemed to start celebrating on their own! The {favoriteColor} landscape began shimmering with extra brightness, the portrait series appeared to wink at everyone who walked by, and the collaborative mural somehow started playing what sounded suspiciously like victory music every time someone admired it! \"This is what happens when art gets excited about being properly protected!\" {userName} laughed as the security system got into the celebratory mood by flashing cheerful lights!",
        microVariants: [
          "The art mystery celebration escalated to magnificent levels of controlled chaos when the recovered paintings demonstrated such joy at their return that they appeared to initiate independent celebratory activities!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the National Young Detectives Recognition Ceremony, {userName} stood before hundreds of law enforcement professionals, mystery writers, and criminal justice experts as they received the highest honor for analytical thinking and investigative excellence. \"This remarkable young detective has demonstrated that age is no barrier to exceptional deductive reasoning and systematic problem-solving,\" declared the FBI's Youth Development Director. \"Their methodical approach to evidence collection, logical analysis of complex clues, and persistence in pursuing justice have not only recovered valuable artwork but have also inspired a new generation of young people to pursue careers in criminal justice, forensic science, and investigative analysis!\"",
        microVariants: [
          "During the National Young Detectives Recognition Ceremony, {userName} addressed hundreds of law enforcement professionals, mystery literature authors, and criminal justice experts while receiving the supreme honor for analytical thinking and investigative excellence."
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly in the evening light of the art gallery, surrounded by the creative expressions of their fellow students, {userName} understood something profound about justice, truth, and the power of careful observation. \"Every mystery teaches us that truth can be discovered when we're willing to look closely, think systematically, and never give up on finding answers,\" they realized with deep insight. \"But the most important thing I learned is that solving mysteries isn't just about being clever - it's about caring enough about others to fight for what's right and protecting the things that matter to our community.\"",
        microVariants: [
          "Standing peacefully within the evening illumination of the art gallery, surrounded by the creative expressions of their fellow students, {userName} comprehended something profound about justice, truth, and the power of systematic observation."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "mystery_elements": ["missing artworks", "stolen artifacts", "vanishing exhibits", "mysterious disappearances", "puzzling thefts"],
        "investigation_tools": ["fingerprint analysis", "evidence documentation", "witness interviews", "timeline reconstruction", "clue correlation"],
        "suspects": ["rival schools", "disgruntled former students", "competitive artists", "security personnel", "art dealers"]
      },
      weatherVariants: ["overcast morning", "bright afternoon", "evening shadows", "misty dawn"],
      settingVariants: ["school art gallery", "community center", "local museum", "art exhibition hall"]
    }
  },

  // Template 3: Animals & Nature Theme
  {
    title: "The Wildlife Rescue Network",
    theme: "Animals & Nature", 
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always felt a deep connection to wildlife and nature conservation, often spending weekends practicing {hobbies} in the local nature preserve while documenting the behavior patterns of various animal species for their personal research project. But their peaceful nature observations took on urgent importance when they discovered that the city's rapid development expansion was threatening the critical habitat corridor that connected the preserve to the larger forest ecosystem, potentially isolating wildlife populations and disrupting migration patterns that had existed for thousands of years. The situation became even more concerning when {userName} found an injured {favoriteAnimal} family that had become trapped when construction crews blocked their traditional path to the river, leaving them cut off from their essential water source and food supply. \"This isn't just about one family of animals,\" {userName} realized with growing environmental awareness and determination. \"If we don't act quickly to establish safe wildlife corridors and protect these migration routes, dozens of species could face population decline or local extinction. I need to find a way to help these animals immediately while also addressing the larger conservation crisis that threatens this entire ecosystem.\"",
        pause: true,
        hook: "How will {userName} rescue the trapped animals and convince the community to protect wildlife habitats?",
        microVariants: {
          text: "{userName} had always felt a deep connection to wildlife and nature conservation, often spending weekends practicing {hobbies} in the local nature preserve while documenting the behavior patterns of various animal species for their personal research project. But their peaceful nature observations took on urgent importance when they discovered that the city's rapid development expansion was threatening the critical habitat corridor that connected the preserve to the larger forest ecosystem, potentially isolating wildlife populations and disrupting migration patterns that had existed for thousands of years. The situation became even more concerning when {userName} found an injured {favoriteAnimal} family that had become trapped when construction crews blocked their traditional path to the river, leaving them cut off from their essential water source and food supply. \"This isn't just about one family of animals,\" {userName} realized with growing environmental awareness and determination. \"If we don't act quickly to establish safe wildlife corridors and protect these migration routes, dozens of species could face population decline or local extinction. I need to find a way to help these animals immediately while also addressing the larger conservation crisis that threatens this entire ecosystem.\"",
          alternatives: [
            "{userName} had consistently maintained profound connections to wildlife and nature conservation principles, frequently dedicating weekend periods to practicing {hobbies} within the local nature preserve while systematically documenting behavioral patterns of diverse animal species for their personal scientific research initiative."
          ],
          optionalDetails: ["Local environmental groups had been monitoring the development's impact.", "The {favoriteFood} sources in the area had also been affected by construction.", "Wildlife rehabilitation centers were already operating at full capacity."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Two years later, {userName} sat peacefully on a bench in the newly created Wildlife Heritage Park, watching the {favoriteAnimal} families thrive in their protected habitat while visitors enjoyed the network of eco-friendly walking trails that had become the community's pride and joy. The innovative development model they had helped establish had attracted national attention as an example of how human progress and environmental conservation could work in harmony. As they practiced their {hobbies} surrounded by the sounds of healthy wildlife and happy families enjoying nature together, {userName} felt deep contentment knowing that their advocacy had created a legacy of coexistence that would benefit both animals and humans for generations to come.",
        microVariants: [
          "Following two years, {userName} discovered tranquil satisfaction on a seating area within the newly established Wildlife Heritage Park, observing the {favoriteAnimal} families flourishing in their protected habitat while visitors appreciated the network of eco-friendly walking trail systems."
        ]
      },
      {
        type: 'silly',
        text: "The wildlife park's grand opening celebration became wonderfully chaotic when all the animals decided to participate in the ribbon-cutting ceremony! The {favoriteAnimal} families insisted on posing for photos with the mayor, a group of squirrels somehow managed to untangle and re-tie all the ceremonial ribbons into an elaborate obstacle course, and the local birds created such an enthusiastic singing chorus that the park's sound system couldn't compete! \"This is exactly the kind of community participation we were hoping for!\" {userName} laughed as park visitors shared their {favoriteFood} picnic treats with surprisingly well-behaved wildlife neighbors!",
        microVariants: [
          "The wildlife park's inaugural celebration escalated to magnificent levels of delightful chaos when all animal residents collectively decided to participate in the ceremonial ribbon-cutting activities!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the National Environmental Leadership Awards, {userName} stood before hundreds of conservation professionals, government officials, and environmental advocates as they received the highest honor for youth environmental advocacy and innovative conservation solutions. \"This extraordinary young conservationist has proven that effective environmental protection requires not just passion, but also strategic thinking, community engagement, and the ability to find solutions that benefit both human development and wildlife preservation,\" declared the Secretary of the Interior.",
        microVariants: [
          "During the National Environmental Leadership Awards ceremony, {userName} addressed hundreds of conservation professionals, governmental representatives, and environmental advocacy specialists while receiving the supreme recognition for youth environmental advocacy and innovative conservation solutions."
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly at the edge of the protected wilderness area as the sun set over the thriving ecosystem, listening to the evening calls of healthy wildlife populations, {userName} understood something profound about the interconnection of all living things. \"True conservation isn't about choosing between human needs and wildlife protection,\" they realized with deep wisdom. \"It's about recognizing that we're all part of the same ecosystem, and when we care for the natural world, we're also caring for ourselves and future generations.\"",
        microVariants: [
          "Standing peacefully at the boundary of the protected wilderness area as solar illumination descended over the flourishing ecosystem, listening to evening vocalizations of healthy wildlife populations, {userName} comprehended something profound about the interconnection of all living organisms."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "wildlife_species": ["bird families", "mammal groups", "reptile communities", "insect populations", "aquatic life"],
        "conservation_methods": ["habitat corridors", "wildlife bridges", "protected zones", "rehabilitation centers", "monitoring programs"],
        "community_partners": ["environmental lawyers", "wildlife biologists", "city planners", "local businesses", "conservation groups"]
      },
      weatherVariants: ["sunny morning", "misty dawn", "golden afternoon", "peaceful evening"],
      settingVariants: ["nature preserve", "wildlife corridor", "forest ecosystem", "urban green space"]
    }
  },

  // Template 4: Magic & Fantasy Theme
  {
    title: "The Guardian of Seasonal Balance",
    theme: "Magic & Fantasy",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always noticed subtle changes in their environment that others seemed to overlook - the way flowers bloomed slightly earlier each year, how winter storms arrived with unusual intensity, and the peculiar behavior of local wildlife during seasonal transitions. But their observations took on profound significance when they discovered an ancient {favoriteColor} crystal hidden beneath the roots of the oldest oak tree in their neighborhood park, a mystical artifact that pulsed with warm energy and seemed to respond to their touch with gentle, melodic vibrations. The moment {userName} lifted the crystal, they experienced an overwhelming flood of knowledge and responsibility: they had been chosen as the new Guardian of Seasonal Balance, tasked with maintaining the delicate harmony between the four seasons that kept their world's natural cycles functioning properly. \"The previous guardian has grown too old to continue this sacred duty,\" whispered a voice that seemed to come from the wind itself, \"and the seasons have begun to drift out of alignment, threatening to disrupt the natural order that sustains all life. You must master the ancient arts of seasonal magic and restore balance before the eternal chaos of perpetual winter or endless summer destroys everything your community depends upon for survival.\"",
        pause: true,
        hook: "What magical abilities will {userName} develop to master seasonal balance and save their world's natural harmony?",
        microVariants: {
          text: "{userName} had always noticed subtle changes in their environment that others seemed to overlook - the way flowers bloomed slightly earlier each year, how winter storms arrived with unusual intensity, and the peculiar behavior of local wildlife during seasonal transitions. But their observations took on profound significance when they discovered an ancient {favoriteColor} crystal hidden beneath the roots of the oldest oak tree in their neighborhood park, a mystical artifact that pulsed with warm energy and seemed to respond to their touch with gentle, melodic vibrations. The moment {userName} lifted the crystal, they experienced an overwhelming flood of knowledge and responsibility: they had been chosen as the new Guardian of Seasonal Balance, tasked with maintaining the delicate harmony between the four seasons that kept their world's natural cycles functioning properly. \"The previous guardian has grown too old to continue this sacred duty,\" whispered a voice that seemed to come from the wind itself, \"and the seasons have begun to drift out of alignment, threatening to disrupt the natural order that sustains all life. You must master the ancient arts of seasonal magic and restore balance before the eternal chaos of perpetual winter or endless summer destroys everything your community depends upon for survival.\"",
          alternatives: [
            "{userName} had consistently observed subtle environmental modifications that others appeared to disregard - the manner in which flowering plants initiated blooming cycles progressively earlier annually, how winter weather systems arrived with extraordinary intensity, and the unusual behavioral patterns of local wildlife during seasonal transition periods."
          ],
          optionalDetails: ["Strange weather patterns had been reported across the entire region.", "Local {favoriteAnimal} populations had been migrating at unusual times.", "The {favoriteFood} crops had been experiencing unpredictable growing seasons."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Five years later, {userName} had become a master of seasonal magic, peacefully tending their mystical garden where spring flowers bloomed alongside summer vegetables, autumn leaves danced with winter snow, and all seasons coexisted in perfect harmony. The {favoriteColor} crystal had become a cherished friend and advisor, its gentle warmth providing comfort during their evening meditations while they practiced {hobbies} surrounded by the magical symphony of balanced natural cycles.",
        microVariants: [
          "Following five years, {userName} had achieved mastery of seasonal magical arts, peacefully nurturing their mystical garden environment where spring flowering plants flourished alongside summer vegetable crops, autumn foliage performed harmonious movements with winter snow, and all seasons maintained coexistence in perfect equilibrium."
        ]
      },
      {
        type: 'silly',
        text: "The celebration of restored seasonal balance got wonderfully out of hand when all four seasons decided to throw a simultaneous party in the town square! Spring flowers started dancing with autumn leaves, summer sunshine played tag with winter snowflakes, and the confused but delighted {favoriteAnimal} didn't know whether to migrate, hibernate, or start building nests all at the same time! \"This is what happens when seasons get too excited about being balanced!\" {userName} laughed as the {favoriteColor} crystal began conducting what could only be described as a meteorological orchestra!",
        microVariants: [
          "The celebration of restored seasonal balance escalated to magnificent proportions when all four seasons collectively decided to organize a simultaneous festival within the town square!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the Council of Elemental Guardians, {userName} stood among the world's most powerful magical protectors as they received the Crystal of Eternal Harmony for their exceptional service in restoring seasonal balance and defeating the Shadow of Eternal Winter. \"This young guardian has demonstrated extraordinary wisdom, courage, and understanding of the delicate balance that sustains all natural magic,\" declared the High Elemental.",
        microVariants: [
          "During the Council of Elemental Guardians assembly, {userName} stood among the world's most powerful magical protectors while receiving the Crystal of Eternal Harmony recognition for their exceptional service in restoring seasonal balance."
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly in the center of their balanced garden as twilight painted the sky in all the colors of every season, surrounded by the gentle magic of natural harmony, {userName} understood something profound about balance, change, and the cycles of life. \"Every season has its own beauty and purpose,\" they realized with deep magical wisdom. \"Winter's rest prepares for spring's growth, summer's abundance feeds autumn's harvest, and the cycle continues eternally because each phase supports and enhances the others.\"",
        microVariants: [
          "Standing peacefully within the center of their balanced garden as twilight illuminated the sky with all seasonal colors, surrounded by gentle magic of natural harmony, {userName} comprehended something profound about balance, transformation, and life cycles."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "seasonal_magic": ["spring growth spells", "summer vitality magic", "autumn harvest power", "winter reflection energy"],
        "magical_creatures": ["seasonal spirits", "elemental guardians", "nature familiars", "crystal companions"],
        "magical_challenges": ["shadow forces", "elemental imbalances", "seasonal disruptions", "magical storms"]
      },
      weatherVariants: ["magical aurora", "enchanted mist", "mystical twilight", "seasonal harmony"],
      settingVariants: ["ancient oak grove", "mystical garden", "seasonal shrine", "elemental sanctuary"]
    }
  },

  // Template 5: Adventure Journeys Theme
  {
    title: "The Lost Civilization Expedition", 
    theme: "Adventure Journeys",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always been captivated by archaeology and ancient history, spending countless hours practicing {hobbies} while studying maps, artifacts, and historical accounts of lost civilizations that once thrived in remote corners of the world. But their academic interest became a real-world adventure when their history teacher, Professor Martinez, invited them to join a legitimate archaeological expedition to investigate recently discovered satellite imagery that revealed geometric patterns hidden beneath centuries of jungle growth in a previously unexplored region. The expedition team included experienced archaeologists, local guides with intimate knowledge of the terrain, and advanced ground-penetrating radar equipment that could map underground structures without disturbing the delicate ecosystem above. \"These satellite images suggest we may have found evidence of a completely unknown civilization,\" Professor Martinez explained as they prepared for the journey, \"one that could revolutionize our understanding of pre-Columbian societies and their sophisticated knowledge of mathematics, astronomy, and sustainable agriculture. Your sharp observational skills and passion for historical investigation make you an valuable addition to our research team, but this expedition will test every aspect of your problem-solving abilities and determination.\"",
        pause: true,
        hook: "What incredible archaeological discoveries and challenging obstacles will {userName} encounter in the unexplored jungle?",
        microVariants: {
          text: "{userName} had always been captivated by archaeology and ancient history, spending countless hours practicing {hobbies} while studying maps, artifacts, and historical accounts of lost civilizations that once thrived in remote corners of the world. But their academic interest became a real-world adventure when their history teacher, Professor Martinez, invited them to join a legitimate archaeological expedition to investigate recently discovered satellite imagery that revealed geometric patterns hidden beneath centuries of jungle growth in a previously unexplored region. The expedition team included experienced archaeologists, local guides with intimate knowledge of the terrain, and advanced ground-penetrating radar equipment that could map underground structures without disturbing the delicate ecosystem above. \"These satellite images suggest we may have found evidence of a completely unknown civilization,\" Professor Martinez explained as they prepared for the journey, \"one that could revolutionize our understanding of pre-Columbian societies and their sophisticated knowledge of mathematics, astronomy, and sustainable agriculture. Your sharp observational skills and passion for historical investigation make you an valuable addition to our research team, but this expedition will test every aspect of your problem-solving abilities and determination.\"",
          alternatives: [
            "{userName} had consistently maintained fascination with archaeological sciences and ancient historical studies, dedicating extensive periods to practicing {hobbies} while examining cartographic materials, artifact collections, and historical documentation of lost civilizations that previously flourished in remote global locations."
          ],
          optionalDetails: ["The satellite images showed {favoriteColor} mineral deposits that might indicate ancient mining.", "Local legends spoke of a lost city where the ancestors perfected growing {favoriteFood}.", "The expedition's {favoriteAnimal} pack guides had an uncanny ability to navigate difficult terrain."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Two years later, {userName} sat peacefully in their home study, surrounded by maps, photographs, and artifacts from their extraordinary expedition, while corresponding with Professor Martinez and their archaeological colleagues about the ongoing research and preservation efforts for the ancient site. The lost civilization's calendar system had been successfully decoded and was being studied by astronomers and mathematicians around the world, while sustainable agriculture experts were implementing the ancient farming techniques to improve modern crop yields.",
        microVariants: [
          "Following two years, {userName} discovered peaceful contentment within their home study environment, surrounded by cartographic materials, photographic documentation, and artifacts from their extraordinary expedition, while maintaining correspondence with Professor Martinez and archaeological colleagues."
        ]
      },
      {
        type: 'silly',
        text: "The archaeological conference presenting their findings turned wonderfully chaotic when the ancient calendar system they had discovered somehow synchronized with the conference room's modern technology and started predicting everything from coffee break timing to the exact moment when Professor Martinez would lose his presentation slides! \"Who knew ancient civilizations were so good at party planning?\" {userName} laughed as the {favoriteColor} projection system created the most spectacular light show!",
        microVariants: [
          "The archaeological conference presenting their discoveries escalated to magnificent proportions when the ancient calendar system they had identified somehow achieved synchronization with the conference room's modern technological equipment."
        ]
      },
      {
        type: 'triumphant',
        text: "At the International Archaeological Society's Annual Awards Ceremony, {userName} stood before the world's leading archaeologists, historians, and researchers as the youngest person ever to receive the Gold Medal for Outstanding Contribution to Archaeological Discovery. \"This remarkable young explorer has not only uncovered evidence of a previously unknown advanced civilization but has also demonstrated the importance of fresh perspectives, careful observation, and interdisciplinary thinking in archaeological research,\" declared the Society's president.",
        microVariants: [
          "During the International Archaeological Society's Annual Awards Ceremony, {userName} addressed the world's premier archaeologists, historians, and researchers as the historically youngest recipient of the Gold Medal for Outstanding Contribution to Archaeological Discovery."
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly at the preserved archaeological site during a peaceful evening, watching the stars align exactly as the ancient calendar had predicted they would thousands of years ago, {userName} understood something profound about human curiosity, discovery, and our connection to the past. \"Every civilization, no matter how ancient, was filled with people who looked at the same stars we see and asked the same questions about the universe that we still ask today,\" they realized with deep reverence.",
        microVariants: [
          "Standing peacefully at the preserved archaeological site during a tranquil evening, observing stellar alignments occurring exactly as the ancient calendar had predicted they would millennia ago, {userName} comprehended something profound about human curiosity, discovery, and our connection to historical periods."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "archaeological_elements": ["stone calendars", "underground chambers", "ancient observatories", "buried temples", "ceremonial sites"],
        "scientific_discoveries": ["astronomical alignments", "mathematical systems", "agricultural techniques", "engineering methods", "artistic traditions"],
        "expedition_challenges": ["jungle navigation", "river crossings", "equipment protection", "weather delays", "terrain mapping"]
      },
      weatherVariants: ["humid jungle morning", "tropical afternoon rain", "clear starlit night", "misty dawn"],
      settingVariants: ["dense rainforest", "ancient ruins", "archaeological camp", "remote expedition site"]
    }
  }
];

/**
 * Get a random Level 4 template
 */
export function getLevel4FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (LEVEL_4_FALLBACK_TEMPLATES.length === 0) return null;
  
  const index = templateIndex !== undefined 
    ? Math.min(templateIndex, LEVEL_4_FALLBACK_TEMPLATES.length - 1)
    : Math.floor(Math.random() * LEVEL_4_FALLBACK_TEMPLATES.length);
  
  return LEVEL_4_FALLBACK_TEMPLATES[index];
}

/**
 * Get the count of Level 4 templates
 */
export function getLevel4FallbackTemplateCount(): number {
  return LEVEL_4_FALLBACK_TEMPLATES.length;
}