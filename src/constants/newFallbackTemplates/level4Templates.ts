/**
 * Level 4 Templates (Ages 11-13) - Complete Fallback Story Library
 * 5 templates with 8-15 scenes each, 90-140 words per scene  
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_4_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Social Justice & Advocacy Theme
  {
    title: "The Digital Divide Initiative", 
    theme: "Social Justice Advocacy",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always taken their reliable internet and modern laptop for granted until they began tutoring elementary students at the community center and discovered a disturbing reality about educational inequality. While helping with homework, they noticed bright students struggling not because they lacked intelligence, but because they had no reliable internet access at home and were completing digital assignments on outdated smartphones with cracked screens. This technological barrier was directly impacting academic success and future opportunities.",
        pause: true,
        hook: "How can {userName} address this technological inequality affecting their students?",
        microVariants: {
          text: "{userName} discovered digital inequality while tutoring at the community center, seeing bright students struggle with assignments due to lack of internet access at home.",
          alternatives: [
            "Through tutoring work, {userName} witnessed how technological barriers were limiting student potential and academic achievement."
          ],
          optionalDetails: ["The community center's WiFi was unreliable.", "Some families couldn't afford internet bills.", "Teachers assigned digital work without considering home access."]
        }
      },
      {
        text: "Determined to make a difference, {userName} began researching digital equity initiatives and discovered successful programs in other cities. They learned about mobile hotspot lending programs, device donation drives, and partnerships with internet providers. {userName} realized that solving this problem would require collaboration between schools, community organizations, and local government. They decided to start by surveying families to understand the scope of the digital divide in their neighborhood.",
        pause: true,
        hook: "What will the survey reveal about internet access in their community?",
        microVariants: {
          text: "{userName} researched digital equity programs and planned a community survey to understand local internet access challenges.",
          alternatives: [
            "Through research, {userName} learned about successful digital equity initiatives and decided to survey their community's needs."
          ],
          optionalDetails: ["They found case studies from similar communities.", "Local libraries offered some computer access.", "The survey needed to be available in multiple languages."]
        }
      },
      {
        text: "The survey results were more extensive than {userName} had imagined. Nearly forty percent of families in their neighborhood lacked reliable broadband internet, and many students were sharing a single device among multiple siblings. Some families were using expensive cellular data for homework, creating financial strain. {userName} presented these findings to the school board and proposed a comprehensive digital equity plan that included device lending, internet subsidies, and technology training for parents.",
        pause: true,
        hook: "How will the school board respond to {userName}'s proposal?",
        microVariants: {
          text: "The survey revealed that 40% of local families lacked reliable internet, prompting {userName} to propose a comprehensive digital equity plan to the school board.",
          alternatives: [
            "Survey results showed widespread internet inequality, leading {userName} to present solutions to educational leaders."
          ],
          optionalDetails: ["Students often did homework in parking lots with free WiFi.", "Some families chose between internet and other necessities.", "Parents wanted to help but lacked technical knowledge."]
        }
      },
      {
        text: "The school board was initially skeptical about the costs and logistics of {userName}'s proposal. However, when {userName} presented research showing how digital equity improved academic outcomes and brought along three students to share their experiences, the atmosphere in the room shifted. One board member was particularly moved when a student described doing math homework by the light of a streetlamp because they had to use a neighbor's WiFi outdoors. The board voted to form a digital equity committee with {userName} as the student representative.",
        pause: true,
        hook: "What initiatives will the digital equity committee implement first?",
        microVariants: {
          text: "Though initially skeptical, the school board was moved by student testimonies and voted to create a digital equity committee with {userName} as student representative.",
          alternatives: [
            "Student stories about doing homework by streetlights convinced the school board to support {userName}'s digital equity initiative."
          ],
          optionalDetails: ["The superintendent promised additional funding research.", "Local news covered the student presentations.", "Community members volunteered to help."]
        }
      },
      {
        text: "Working with the committee, {userName} helped launch the district's first Device Lending Library, where students could check out tablets and laptops just like library books. They also secured partnerships with local internet providers to offer reduced-cost internet plans for families in need. {userName} organized technology training sessions where students taught parents and grandparents how to use devices and access educational resources. The program's success attracted attention from neighboring school districts.",
        pause: true,
        hook: "How will {userName} help other communities implement similar programs?",
        microVariants: {
          text: "{userName} launched a Device Lending Library and secured low-cost internet partnerships, with students teaching technology skills to family members.",
          alternatives: [
            "The committee created device lending programs and internet partnerships, while {userName} organized family technology training sessions."
          ],
          optionalDetails: ["The lending library had a 98% return rate.", "Grandparents became enthusiastic learners.", "Students felt proud teaching adults."]
        }
      },
      {
        text: "Recognizing the broader impact of their work, {userName} created a Digital Equity Toolkit that other student advocates could use to address similar challenges in their communities. They documented every step of their process, from conducting surveys to building partnerships, and made it freely available online. {userName} began receiving emails from students across the country who were using the toolkit to launch their own digital equity initiatives. Their work had grown from solving a local problem to creating a national movement.",
        pause: true,
        hook: "What new challenges will arise as the movement spreads nationwide?",
        microVariants: {
          text: "{userName} created a Digital Equity Toolkit that students nationwide began using to address internet inequality in their own communities.",
          alternatives: [
            "By documenting their process in an online toolkit, {userName} enabled students across the country to replicate their digital equity success."
          ],
          optionalDetails: ["The toolkit was translated into Spanish and other languages.", "Universities began studying their model.", "Corporate sponsors offered technology donations."]
        }
      },
      {
        text: "As their digital equity work gained national recognition, {userName} was invited to speak at educational conferences and policy forums. They testified before a congressional subcommittee about the impact of the digital divide on student achievement and proposed federal legislation to support local digital equity initiatives. Despite the attention and accolades, {userName} remained focused on the students they tutored at the community center, knowing that sustainable change happens when communities are empowered to solve their own challenges.",
        pause: true,
        hook: "How will {userName} balance national advocacy with local community needs?",
        microVariants: {
          text: "While speaking at national conferences and testifying before Congress, {userName} stayed grounded in local community work and direct student support.",
          alternatives: [
            "Despite national recognition and policy influence, {userName} prioritized local tutoring and community-centered solutions."
          ],
          optionalDetails: ["The congressional testimony was broadcast live.", "Students from their original tutoring group attended the hearing.", "Local media covered their community's transformation."]
        }
      },
      {
        text: "Reflecting on their journey from concerned tutor to national advocate, {userName} realized that the most important lesson they'd learned was that young people don't have to wait for adults to solve problems they care about. Their digital equity initiative had not only connected hundreds of students to educational opportunities but had also demonstrated that thoughtful research, community collaboration, and persistent advocacy could create lasting systemic change. As they prepared for their next chapter, whether in college or continued activism, {userName} knew that their commitment to educational equity would remain central to their purpose.",
        pause: true,
        hook: "What new educational challenges will {userName} tackle next?",
        microVariants: {
          text: "Looking back on their journey, {userName} understood that young advocates can create lasting change through research, collaboration, and persistence in addressing educational inequality.",
          alternatives: [
            "The experience taught {userName} that youth don't need to wait for permission to solve important problems, and their work would continue inspiring educational equity."
          ],
          optionalDetails: ["College recruiters were impressed by their advocacy experience.", "The community center was renamed in their honor.", "Their story inspired a documentary about youth activism."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Two years later, {userName} sat in the renovated community center, now bustling with students using high-speed internet and modern computers to explore their dreams. The soft hum of technology working in harmony filled the space as they watched a young student discover their passion for {hobbies} through the same online resources that had once been beyond reach. {userName} smiled peacefully, understanding that true social justice work creates ripples of opportunity that extend far beyond any single initiative.",
        microVariants: [
          "After two years, {userName} found peaceful satisfaction seeing the transformed community center buzzing with students accessing educational opportunities that were once impossible."
        ]
      },
      {
        type: 'silly',
        text: "The celebration got wonderfully chaotic when the new high-speed internet was so fast that everything seemed to move at super-speed! Students typed so quickly their fingers became blurs, the {favoriteAnimal} mascot started doing victory laps around computers, and even the {favoriteFood} in the snack area seemed to bounce with excitement! \"Technology celebration overload!\" {userName} laughed as confetti shot out of printers and everyone did the \"Digital Equality Dance\" with zero choreography but maximum enthusiasm!",
        microVariants: [
          "The victory party reached hilariously absurd proportions when the newly installed ultra-high-speed internet seemed to accelerate everything to comically supernatural velocities!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the National Youth Social Justice Awards ceremony, {userName} stood before hundreds of advocates and policy makers as they received the highest honor for educational equity activism. \"Young leaders like {userName} demonstrate that age is no barrier to creating systemic change!\" declared the keynote speaker. \"Their comprehensive approach to addressing digital inequality has become a national model for bridging the digital divide.\"",
        microVariants: [
          "During the prestigious National Conference on Educational Justice, {userName} accepted supreme recognition for youth leadership while addressing hundreds of social justice professionals."
        ]
      },
      {
        type: 'reflective',
        text: "Years later, as {userName} studied education policy in college, they often thought about the simple moment when they first noticed a student struggling with homework on a cracked phone. That small observation had grown into a movement that changed thousands of lives. {userName} learned that the most powerful advocacy begins with noticing inequality and refusing to accept it as normal. Every policy paper they wrote, every research project they completed, carried the voices of those students forward into rooms where decisions about educational justice were made.",
        microVariants: [
          "Studying education policy in college, {userName} reflected on how noticing one student's struggle had grown into a movement that transformed educational access for thousands."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        'digitalBarrier': ['internet access', 'computer availability', 'technology skills', 'device sharing'],
        'advocacyAction': ['surveys', 'presentations', 'partnerships', 'training programs'],
        'communityResponse': ['school board support', 'parent engagement', 'student leadership', 'local donations']
      },
      weatherVariants: [
        'During a snowy winter when staying indoors highlighted internet needs',
        'On a sunny spring day when outdoor learning required mobile access',
        'During a rainy season when home connectivity became crucial'
      ],
      settingVariants: [
        'urban community center with diverse populations',
        'suburban library with limited resources',
        'rural area with geographic connectivity challenges'
      ],
      randomSeed: 2847
    }
  },

  // Template 2: Environmental Science & Innovation
  {
    title: "The Microplastics Research Project",
    theme: "Environmental Science & Innovation", 
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always enjoyed eating {favoriteFood} at the beach until the day they noticed tiny plastic fragments mixed in with the sand and realized they might have been unknowingly consuming microplastics in their favorite seafood. This disturbing discovery launched them into extensive research about plastic pollution in marine ecosystems, where they learned that microplastics are found in everything from fish to sea salt, potentially affecting human health in ways scientists are still discovering.",
        pause: true,
        hook: "How will {userName} investigate the extent of microplastic contamination in their local environment?",
        microVariants: {
          text: "{userName} discovered microplastics at their favorite beach, realizing these tiny fragments might be contaminating their food and affecting marine ecosystems.",
          alternatives: [
            "A beach discovery of plastic fragments in sand sparked {userName}'s investigation into microplastic pollution in marine environments."
          ],
          optionalDetails: ["The sand looked different under magnification.", "Local fish showed signs of plastic ingestion.", "Restaurant menus didn't mention contamination risks."]
        }
      },
      {
        text: "Working with their science teacher, {userName} designed a comprehensive study to test water and seafood samples from multiple locations along their coastline. They learned proper sampling techniques, microscopy methods, and data analysis protocols. The initial results were shocking – every single sample contained microplastics, with concentrations varying dramatically based on proximity to urban areas, storm drains, and plastic manufacturing facilities.",
        pause: true,
        hook: "What patterns will emerge as {userName} expands their research?",
        microVariants: {
          text: "{userName} conducted scientific sampling of water and seafood, discovering microplastics in every single sample with concentrations varying by location.",
          alternatives: [
            "Through systematic testing of coastal samples, {userName} documented widespread microplastic contamination across their region."
          ],
          optionalDetails: ["Tourist areas had higher contamination levels.", "Storm water carried massive amounts of plastic debris.", "Fish near plastic factories showed extreme pollution."]
        }
      },
      {
        text: "The data painted a clear picture: microplastic pollution was not just an environmental issue but a public health crisis hiding in plain sight. {userName} mapped contamination patterns and discovered that areas with poor waste management infrastructure and high tourism had the most severe pollution. They presented their findings to local health officials, environmental agencies, and fishing industry representatives, proposing immediate action to protect both marine life and human health.",
        pause: true,
        hook: "How will different stakeholders respond to {userName}'s alarming research findings?",
        microVariants: {
          text: "{userName} mapped pollution patterns linking poor waste management to contamination levels, then presented urgent findings to health and environmental officials.",
          alternatives: [
            "The research revealed connections between waste infrastructure and pollution severity, prompting {userName} to alert public health authorities."
          ],
          optionalDetails: ["Tourism boards initially resisted the findings.", "Fishing communities were deeply concerned.", "Health officials requested additional testing."]
        }
      },
      {
        text: "While some officials were receptive to the research, others questioned whether a young person could produce scientifically valid results. {userName} invited a university marine biology professor to verify their methodology and findings. The professor was impressed by the rigor of the research and offered to collaborate on expanding the study. Together, they published their results in a peer-reviewed environmental science journal, making {userName} one of the youngest co-authors in the publication's history.",
        pause: true,
        hook: "How will scientific publication change the impact of {userName}'s environmental work?", 
        microVariants: {
          text: "Despite initial skepticism, {userName} collaborated with a university professor to verify their research and co-authored a peer-reviewed scientific publication.",
          alternatives: [
            "University collaboration validated {userName}'s research methods, leading to publication in a prestigious environmental science journal."
          ],
          optionalDetails: ["The peer review process took six months.", "Media outlets covered the unusual young co-author.", "Environmental groups cited their research."]
        }
      },
      {
        text: "The published research attracted international attention to microplastic pollution in their region. Environmental organizations used {userName}'s data to advocate for stricter plastic waste regulations, and several restaurants began testing their seafood and posting contamination information for customers. {userName} was invited to speak at environmental conferences and began working with policy makers to develop microplastic monitoring standards for coastal communities.",
        pause: true,
        hook: "What new challenges will arise as {userName}'s research influences policy and industry practices?",
        microVariants: {
          text: "{userName}'s published research influenced environmental policy, restaurant practices, and industry standards for microplastic monitoring.",
          alternatives: [
            "International recognition of their research led to policy changes, industry improvements, and invitations to environmental conferences."
          ],
          optionalDetails: ["Plastic industry representatives challenged their findings.", "Seafood sales declined in contaminated areas.", "New testing protocols were expensive to implement."]
        }
      },
      {
        text: "Realizing that research alone wouldn't solve the plastic pollution crisis, {userName} began developing innovative solutions. They experimented with biodegradable alternatives to single-use plastics and designed filtration systems to capture microplastics before they entered marine environments. Their work caught the attention of environmental engineering companies, leading to internship opportunities and potential patent applications for their innovations.",
        pause: true,
        hook: "How will {userName} balance innovation with environmental advocacy and academic pursuits?",
        microVariants: {
          text: "{userName} shifted from research to innovation, developing biodegradable plastic alternatives and filtration systems that attracted industry attention.",
          alternatives: [
            "Beyond documentation, {userName} created solutions including plastic alternatives and filtration technology that impressed environmental engineers."
          ],
          optionalDetails: ["The biodegradable materials performed better than expected.", "Filtration prototypes were tested in local harbors.", "Patent lawyers offered pro bono assistance."]
        }
      },
      {
        text: "As college applications approached, {userName} reflected on how a simple beach observation had evolved into a comprehensive understanding of environmental science, policy advocacy, and technological innovation. Their research had not only documented a critical environmental problem but had also contributed to solutions that could benefit coastal communities worldwide. University admissions officers were impressed by the depth and impact of their environmental work, leading to scholarship offers from top environmental science programs.",
        pause: true,
        hook: "What environmental challenges will {userName} tackle during their university studies and beyond?",
        microVariants: {
          text: "Looking toward college, {userName} reflected on their journey from beach observer to environmental researcher and innovator, earning recognition from university programs.",
          alternatives: [
            "As university opportunities emerged, {userName} considered how their environmental research and innovation work would shape their academic and career future."
          ],
          optionalDetails: ["Environmental law schools also showed interest.", "Research mentors offered continued collaboration.", "International exchange programs focused on sustainability."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Five years later, {userName} walked along the same beach where their environmental journey began, now equipped with a marine biology degree and working for a coastal conservation organization. The water was cleaner thanks to the filtration systems they'd helped design, and local restaurants proudly displayed certifications showing their seafood met the microplastic standards {userName} had helped establish. Watching children play safely in the waves, they felt a deep sense of satisfaction knowing their teenage curiosity had grown into lasting environmental protection.",
        microVariants: [
          "Years later, returning to their original beach as a marine biologist, {userName} witnessed the positive environmental changes their research and innovations had created."
        ]
      },
      {
        type: 'silly',
        text: "The environmental celebration got delightfully absurd when {userName}'s biodegradable plastic alternatives worked so well that they started decomposing during the award ceremony! The trophy began sprouting tiny flowers, the microphone grew {favoriteColor} moss, and even the {favoriteFood} at the reception was served on plates that were turning into mulch! \"I think we made them a little TOO biodegradable!\" {userName} laughed as guests watched their chairs slowly transform into garden compost while they were still sitting on them!",
        microVariants: [
          "The scientific conference became hilariously chaotic when {userName}'s ultra-biodegradable inventions began decomposing immediately upon contact with air!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the International Young Environmental Scientists Summit, {userName} received the Global Innovation Award for their microplastics research and filtration technology. \"Their work represents the best of scientific rigor combined with practical solutions,\" announced the director of the United Nations Environment Programme. \"{userName} has shown that young people can lead breakthrough research that changes how we understand and address environmental challenges.\"",
        microVariants: [
          "The United Nations Environment Programme recognized {userName}'s groundbreaking research with the highest honor for young environmental scientists."
        ]
      },
      {
        type: 'reflective',
        text: "During graduate school, as {userName} mentored younger students beginning their own environmental research projects, they often shared the story of that first day at the beach when they noticed plastic in the sand. The lesson they emphasized was that environmental science begins with careful observation of the world around us and asking questions about what we see. Every research paper they published, every innovation they developed, carried forward that initial moment of curiosity and concern that had launched their career in environmental protection.",
        microVariants: [
          "As a graduate student and mentor, {userName} taught others that environmental science starts with curious observation and questioning of our surroundings."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        'pollutant': ['microplastics', 'chemical runoff', 'heavy metals', 'pharmaceutical residues'],
        'environment': ['coastal waters', 'freshwater lakes', 'urban streams', 'agricultural areas'],
        'solution': ['filtration systems', 'biodegradable alternatives', 'cleanup technologies', 'prevention strategies']
      },
      weatherVariants: [
        'After a major storm revealed increased pollution levels',
        'During calm weather perfect for water sampling',
        'Following seasonal changes in contamination patterns'
      ],
      settingVariants: [
        'coastal community with tourism and fishing industries',
        'urban area with industrial pollution sources',
        'rural region with agricultural contamination'
      ],
      randomSeed: 5293
    }
  },

  // Template 3: Cozy Bedtime Theme (MISSING THEME ADDED)
  {
    title: "The Dream Library Keeper",
    theme: "Cozy Bedtime",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "Every night before sleep, {userName} had always wondered where dreams come from, but they never expected to discover that dreams are actually carefully catalogued and organized in a vast, magical library that exists between waking and sleeping. On a particularly restful evening, while enjoying their favorite {favoriteFood} and preparing for bed, {userName} found themselves transported to this ethereal library where thousands of glowing books contained dreams waiting to be delivered to sleeping minds around the world.",
        pause: true,
        hook: "What magical role will {userName} play in this dream library?",
        microVariants: {
          text: "{userName} discovered a magical dream library where glowing books contained dreams waiting to be delivered to sleeping minds worldwide.",
          alternatives: [
            "Between waking and sleeping, {userName} found themselves in an ethereal library where dreams were organized like books on endless shelves."
          ],
          optionalDetails: ["The books hummed with gentle, peaceful energy.", "Soft {favoriteColor} light illuminated the endless shelves.", "The air smelled like {favoriteFood} and lavender."]
        }
      },
      {
        text: "The Head Librarian, a wise figure with eyes that sparkled like stars, explained that {userName} had been chosen as an apprentice Dream Keeper because of their natural ability to understand what brings peace and comfort to others. Their first assignment was to help organize the section of sweet dreams for children who had difficulty sleeping, ensuring each dream contained elements that would bring joy and tranquility based on the child's interests and needs.",
        pause: true,
        hook: "How will {userName} create the perfect peaceful dreams for troubled sleepers?",
        microVariants: {
          text: "As an apprentice Dream Keeper, {userName} was tasked with organizing peaceful dreams for children who struggled with sleep.",
          alternatives: [
            "The star-eyed Librarian chose {userName} to help create comforting dreams for young people who needed restful sleep."
          ],
          optionalDetails: ["The dream books rearranged themselves based on sleepers' needs.", "Peaceful music drifted from the successful dreams.", "Nightmare books were kept in a separate, secure section."]
        }
      },
      {
        text: "Working through the peaceful library nights, {userName} learned to weave together elements that created perfect comfort dreams: cozy scenes with favorite {favoriteAnimal} companions, gentle adventures involving {hobbies}, and warm family moments centered around sharing {favoriteFood}. They discovered that the most effective peaceful dreams included familiar comforts while introducing just enough gentle wonder to spark curiosity without causing anxiety or excitement that might interrupt sleep.",
        pause: true,
        hook: "What happens when {userName} encounters a child whose dreams are persistently troubled?",
        microVariants: {
          text: "{userName} learned to craft comfort dreams using familiar elements like {favoriteAnimal} companions and gentle {hobbies} adventures.",
          alternatives: [
            "Through practice, {userName} mastered blending cozy familiarity with gentle wonder to create perfectly peaceful dreams."
          ],
          optionalDetails: ["The most successful dreams included soft {favoriteColor} lighting.", "Familiar scents like {favoriteFood} enhanced dream comfort.", "Background sounds were always gentle and soothing."]
        }
      },
      {
        text: "One particularly challenging case involved a young artist who experienced recurring anxious dreams about their creative work not being good enough. {userName} spent extra time researching this sleeper's interests and fears, ultimately creating a dream sequence where the child met famous artists who shared stories about their own creative struggles and victories. The dream included a magical art studio where mistakes transformed into beautiful, unexpected masterpieces.",
        pause: true,
        hook: "How will this success with difficult dreams change {userName}'s responsibilities in the library?",
        microVariants: {
          text: "{userName} helped an anxious young artist by creating dreams where famous artists shared struggles and mistakes became beautiful masterpieces.",
          alternatives: [
            "For a troubled creative child, {userName} designed dreams featuring supportive artists and a magical studio where errors became art."
          ],
          optionalDetails: ["The dream studio had {favoriteColor} paint that never ran out.", "Famous artists from history offered encouraging advice.", "Every 'mistake' sparkled as it transformed into beauty."]
        }
      },
      {
        text: "Impressed by {userName}'s intuitive understanding of what brings comfort to different personalities, the Head Librarian promoted them to Senior Dream Keeper, responsible for training new apprentices and developing innovative approaches to dream creation. {userName} established a special workshop focused on creating dreams that helped people process difficult emotions in gentle, healing ways, always ensuring that dreamers woke feeling more peaceful than when they fell asleep.",
        pause: true,
        hook: "What new challenges arise when {userName} begins training other dream keepers?",
        microVariants: {
          text: "Promoted to Senior Dream Keeper, {userName} trained apprentices and developed healing dreams that helped process emotions peacefully.",
          alternatives: [
            "As a Senior Keeper, {userName} taught others to create therapeutic dreams that promoted emotional healing and peaceful awakening."
          ],
          optionalDetails: ["New apprentices came from all over the dream realm.", "Healing dreams required special {favoriteColor} energy.", "Each dreamer woke with a sense of gentle resolution."]
        }
      },
      {
        text: "As their expertise grew, {userName} began collaborating with the library's Research Division to study how dreams affect waking life happiness and emotional well-being. They discovered that people who regularly experienced comfort dreams were more resilient during difficult times and more creative in solving daily challenges. This research led to the development of specialized dream programs for healthcare workers, students during exam periods, and anyone facing major life transitions.",
        pause: true,
        hook: "How will {userName}'s dream research influence both the sleeping and waking worlds?",
        microVariants: {
          text: "{userName} researched how comfort dreams improved waking life resilience and creativity, leading to specialized programs for people facing challenges.",
          alternatives: [
            "Through research collaboration, {userName} discovered that peaceful dreams enhanced real-world problem-solving and emotional strength."
          ],
          optionalDetails: ["Healthcare workers reported reduced stress after dream programs.", "Students performed better academically with dream support.", "Life transitions became smoother with therapeutic dreams."]
        }
      },
      {
        text: "On their final night as an apprentice before returning to the waking world, {userName} was honored with the Golden Dream Crystal, awarded to keepers who demonstrate exceptional compassion and skill. The Head Librarian explained that {userName} would retain the ability to influence their own dreams and occasionally help others find peaceful sleep through their natural empathy and understanding. Their time in the Dream Library had taught them that rest and comfort are not luxuries but essential foundations for a meaningful, creative life.",
        pause: true,
        hook: "How will {userName} use their dream-keeping abilities in the waking world?",
        microVariants: {
          text: "Honored with the Golden Dream Crystal, {userName} returned to waking life with the ability to create peaceful dreams and help others find restful sleep.",
          alternatives: [
            "Receiving the highest honor for compassionate dream keeping, {userName} gained permanent abilities to promote peaceful rest in both worlds."
          ],
          optionalDetails: ["The crystal glowed softly with {favoriteColor} light.", "Other keepers celebrated with a feast of {favoriteFood}.", "The ability would strengthen with practice and use."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Years later, as {userName} tucked their own children into bed, they would softly whisper suggestions for peaceful dreams, watching as gentle smiles crossed sleeping faces. Their bedroom was filled with soft {favoriteColor} lights and the comforting scent of {favoriteFood} from evening snacks. Every night, they felt grateful for their time in the Dream Library, knowing that the gift of creating comfort and peace was something they could share throughout their entire life, making bedtime a magical experience for everyone they loved.",
        microVariants: [
          "As a parent, {userName} created magical bedtime experiences for their children, using dream-keeping skills to ensure peaceful, restorative sleep for the whole family."
        ]
      },
      {
        type: 'silly',
        text: "The dream delivery system had a delightfully chaotic malfunction when all the cozy dreams got mixed up with the adventure dreams! Children around the world woke up reporting dreams where they had tea parties with dragons, built blanket forts on pirate ships, and rode {favoriteAnimal} into battles armed with pillows and {favoriteFood}! \"Oops, I think I crossed some wires in the dream mixing machine!\" {userName} laughed as the Head Librarian tried to sort out dreams of pajama-wearing astronauts having dance parties in space!",
        microVariants: [
          "A hilarious dream delivery mix-up resulted in perfectly cozy adventures where comfort and excitement blended in wonderfully absurd ways!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the International Sleep Research Conference, leading scientists presented {userName}'s Dream Library findings as breakthrough research in sleep therapy and emotional healing. \"This young person's work has revolutionized our understanding of how intentional dream experiences can improve mental health and life satisfaction,\" announced the keynote speaker. \"Their innovative approach to therapeutic dreaming has opened entirely new fields of study in sleep medicine and psychological wellness.\"",
        microVariants: [
          "World-renowned sleep researchers credited {userName}'s dream work with revolutionizing therapeutic approaches to sleep medicine and mental health treatment."
        ]
      },
      {
        type: 'reflective',
        text: "In quiet moments before sleep, {userName} often reflected on the profound lesson they learned in the Dream Library: that rest is not the absence of activity but the presence of peace. Their work helping others find comfort in dreams had taught them that true healing happens when we feel safe enough to be vulnerable, whether in sleep or in waking life. Every peaceful dream they facilitated, every restful night they helped create, was a reminder that sometimes the most important gift we can offer others is simply the space to feel calm and cared for.",
        microVariants: [
          "Reflecting on their dream work, {userName} understood that creating peace for others—whether in dreams or daily life—was one of the most meaningful contributions anyone could make."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        'dreamType': ['comfort dreams', 'healing dreams', 'creative dreams', 'peaceful adventures'],
        'sleepers': ['anxious children', 'stressed adults', 'creative minds', 'those facing transitions'],
        'dreamElements': ['familiar pets', 'cozy places', 'favorite foods', 'gentle activities']
      },
      weatherVariants: [
        'During peaceful snow nights perfect for cozy dreams',
        'On warm summer evenings with gentle breezes',
        'During spring rains that create soothing sleeping sounds'
      ],
      settingVariants: [
        'ethereal library with endless glowing bookshelves',
        'floating dream workshop among soft clouds',
        'cozy cottage where dreams are woven like blankets'
      ],
      randomSeed: 7418
    }
  },

  // Template 4: Silly & Humorous Theme (MISSING THEME ADDED)
  {
    title: "The Great {favoriteFood} Festival Fiasco",
    theme: "Silly & Humorous",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had volunteered to help organize their town's first annual {favoriteFood} Festival, expecting a simple community gathering where people would share recipes and enjoy good food together. However, things took an unexpectedly chaotic turn when the festival's centerpiece - a giant {favoriteFood} sculpture designed by an overly enthusiastic art student - began exhibiting peculiar behavior. The sculpture seemed to be growing larger every hour, and even more bizarrely, it appeared to be attracting every {favoriteAnimal} within a fifty-mile radius, all of whom were inexplicably drawn to investigate this massive food monument.",
        pause: true,
        hook: "What will happen when the {favoriteFood} sculpture continues growing and attracting more {favoriteAnimal}s?",
        microVariants: {
          text: "{userName} volunteered for their town's {favoriteFood} Festival, but the centerpiece sculpture began growing mysteriously and attracting hordes of curious {favoriteAnimal}s.",
          alternatives: [
            "At the {favoriteFood} Festival, {userName} discovered that the giant food sculpture was growing uncontrollably and drawing {favoriteAnimal}s from everywhere."
          ],
          optionalDetails: ["The sculpture was made from actual {favoriteFood} mixed with experimental preservatives.", "Local {favoriteAnimal}s formed orderly lines to investigate.", "The art student had used glow-in-the-dark {favoriteColor} paint."]
        }
      },
      {
        text: "By the second day of the festival, the {favoriteFood} sculpture had doubled in size and the {favoriteAnimal} situation had evolved from curious to absolutely ridiculous. The animals had apparently organized themselves into what looked like a {favoriteAnimal} marching band, complete with synchronized movements and rhythmic sounds that somehow harmonized beautifully. Meanwhile, the sculpture began emitting a {favoriteColor} glow that pulsed in time with the {favoriteAnimal} performances, creating the most bizarre but oddly entertaining spectacle the town had ever witnessed.",
        pause: true,
        hook: "How will {userName} manage this increasingly absurd festival situation?",
        microVariants: {
          text: "The sculpture doubled in size while {favoriteAnimal}s formed a marching band, creating a bizarrely entertaining spectacle with {favoriteColor} glowing effects.",
          alternatives: [
            "As the {favoriteFood} sculpture grew larger, organized {favoriteAnimal}s performed synchronized shows that somehow perfectly matched the sculpture's {favoriteColor} pulsing glow."
          ],
          optionalDetails: ["News crews arrived to document the phenomenon.", "Tourists began traveling from other states to see the spectacle.", "Local musicians tried to join the {favoriteAnimal} band."]
        }
      },
      {
        text: "Realizing that the festival had transformed into something completely unprecedented, {userName} decided to embrace the chaos rather than fight it. They quickly organized {favoriteAnimal} viewing areas, set up {favoriteFood} tastings that complemented the sculpture's growing flavors (apparently the sculpture was now producing different taste variations every hour), and established a makeshift dance floor where humans could attempt to learn the {favoriteAnimal} marching band choreography. The mayor, initially panicked, declared it the most successful tourism event in the town's history.",
        pause: true,
        hook: "What new complications arise as the festival gains national attention?",
        microVariants: {
          text: "{userName} embraced the chaos, organizing {favoriteAnimal} viewing areas and dance floors where humans learned the animals' choreography.",
          alternatives: [
            "Instead of fighting the absurdity, {userName} created structured activities around the {favoriteAnimal} performances and growing {favoriteFood} sculpture."
          ],
          optionalDetails: ["The sculpture produced hourly flavor changes that amazed food critics.", "Professional choreographers studied the {favoriteAnimal} movements.", "The dance floor became a cross-species cultural exchange."]
        }
      },
      {
        text: "National news networks arrived to cover what reporters dubbed \"The Great {favoriteFood} Phenomenon,\" but their presence only amplified the ridiculous situation. The sculpture, now three stories tall and glowing bright {favoriteColor}, seemed to react to the camera lights by producing musical tones that perfectly harmonized with the {favoriteAnimal} marching band. Even more absurdly, the news anchors found themselves unconsciously swaying to the rhythm, and several reporters accidentally joined the {favoriteAnimal} parade while trying to conduct serious interviews.",
        pause: true,
        hook: "How will {userName} handle the media circus while managing the increasingly musical festival?",
        microVariants: {
          text: "National news coverage intensified the chaos as the three-story sculpture produced musical tones, causing reporters to unconsciously join the {favoriteAnimal} performances.",
          alternatives: [
            "Media attention amplified the absurdity when the massive glowing sculpture began making music that hypnotically drew news reporters into the {favoriteAnimal} parade."
          ],
          optionalDetails: ["One anchor forgot to stop broadcasting while dancing.", "The sculpture's music was automatically trending on social media.", "Weather reporters included {favoriteAnimal} migration patterns in forecasts."]
        }
      },
      {
        text: "Scientists arrived to study what they initially assumed was a bizarre biological or chemical phenomenon, but they quickly became part of the entertainment when their serious research equipment began beeping in rhythm with the {favoriteAnimal} band. Dr. Henderson, a renowned food chemist, discovered that the sculpture was somehow converting {favoriteFood} into a substance that generated perfect harmonic frequencies. Meanwhile, Dr. Martinez, an animal behaviorist, found that the {favoriteAnimal}s were demonstrating previously unknown musical intelligence, creating compositions that rivaled professional orchestras.",
        pause: true,
        hook: "What happens when the scientific community becomes part of the musical mayhem?",
        microVariants: {
          text: "Scientists studying the phenomenon became part of the show when their equipment joined the rhythm, revealing the sculpture's harmonic properties and {favoriteAnimal} musical intelligence.",
          alternatives: [
            "Research teams discovered the sculpture's scientific properties while accidentally contributing to the musical performance with their beeping, clicking equipment."
          ],
          optionalDetails: ["Research instruments formed an electronic percussion section.", "The chemical analysis revealed impossible flavor combinations.", "Animal intelligence tests turned into musical aptitude evaluations."]
        }
      },
      {
        text: "As the festival entered its final week (originally planned for three days), {userName} had become an international celebrity as the \"Festival Harmony Coordinator,\" helping orchestrate daily performances featuring the {favoriteAnimal} band, the musical sculpture, news reporters, scientific equipment, and increasingly elaborate human dance numbers. The town had transformed into a destination for musicians, scientists, animal enthusiasts, and people who simply wanted to experience the most joyfully absurd cultural phenomenon of the decade.",
        pause: true,
        hook: "How will {userName} bring this magnificent chaos to a memorable conclusion?",
        microVariants: {
          text: "As \"Festival Harmony Coordinator,\" {userName} orchestrated international performances featuring {favoriteAnimal}s, scientists, reporters, and the musical sculpture.",
          alternatives: [
            "The week-long festival made {userName} famous for coordinating the world's most absurd musical collaboration between animals, humans, and a sentient food sculpture."
          ],
          optionalDetails: ["Hotels were booked solid with curious visitors.", "Local restaurants created {favoriteFood} dishes inspired by the sculpture.", "Musicians composed symphonies based on {favoriteAnimal} performances."]
        }
      },
      {
        text: "For the grand finale, {userName} organized the most wonderfully ridiculous closing ceremony in festival history: a massive collaborative performance where humans, {favoriteAnimal}s, the glowing sculpture, scientific equipment, news cameras, and even the town's traffic lights (which had somehow synchronized with the rhythm) created a harmonious musical celebration that could be heard for miles. As the performance reached its crescendo, the sculpture slowly began shrinking back to normal size, the {favoriteAnimal}s took their final bows, and everyone agreed this had been the most gloriously absurd week of their lives.",
        pause: true,
        hook: "What lasting impact will this ridiculous festival have on the community and beyond?",
        microVariants: {
          text: "The grand finale featured humans, {favoriteAnimal}s, the sculpture, and even traffic lights in a harmonious performance before everything returned to normal.",
          alternatives: [
            "A massive collaborative closing ceremony involved every element of the chaos in perfect harmony before the sculpture shrunk and {favoriteAnimal}s took their final bows."
          ],
          optionalDetails: ["The performance was broadcast live internationally.", "Sheet music was frantically transcribed by composers.", "The {favoriteAnimal}s received keys to the city."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Months later, {userName} smiled peacefully as they sat in the town's new \"{favoriteAnimal} Memorial Garden\" where a small, normal-sized {favoriteFood} sculpture served as a gentle reminder of their wonderful week of chaos. Local {favoriteAnimal}s still occasionally gathered there for impromptu performances, and the town had developed a lovely tradition of evening concerts where humans and animals collaborated in much more manageable but equally joyful musical celebrations. The festival had taught everyone that sometimes the most beautiful experiences come from embracing the unexpected with humor and creativity.",
        microVariants: [
          "The peaceful memorial garden became a place where {userName} enjoyed quiet moments remembering the joyful chaos that had brought their community together."
        ]
      },
      {
        type: 'silly',
        text: "The annual reunion festival was even more ridiculous because the {favoriteAnimal}s had spent the year practicing more complex choreography and arrived wearing tiny {favoriteColor} uniforms they had somehow acquired! The sculpture, now permanently normal-sized but still occasionally musical, began harmonizing with the town's new {favoriteAnimal} philharmonic orchestra, while {userName} conducted wearing a cape made entirely of {favoriteFood} wrappers! \"I think they've been taking music lessons!\" {userName} laughed as a particularly talented {favoriteAnimal} performed what appeared to be an interpretive dance about the joys of {favoriteFood}!",
        microVariants: [
          "The reunion featured even more absurd musical performances with uniformed {favoriteAnimal}s and {userName} conducting in a {favoriteFood} wrapper cape!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the International Festival Management Awards, {userName} received the highest honor for \"Most Creative Crisis Management in Cultural Events.\" \"Their ability to transform complete chaos into the world's most beloved musical phenomenon demonstrates exceptional leadership and vision,\" announced the awards committee. \"The {favoriteFood} Festival has become a model for how communities can celebrate the unexpected and find joy in the most absurd circumstances.\"",
        microVariants: [
          "International recognition celebrated {userName}'s transformation of festival chaos into a beloved global phenomenon that redefined community celebration."
        ]
      },
      {
        type: 'reflective',
        text: "Years later, working as a community event coordinator, {userName} often shared the story of the {favoriteFood} Festival with colleagues facing their own event challenges. The lesson they emphasized was that sometimes the most meaningful experiences come not from perfect planning but from remaining flexible and finding humor in unexpected situations. Every festival they organized carried forward the spirit of joyful collaboration they had discovered that chaotic week when humans, {favoriteAnimal}s, and a musical sculpture taught their entire community to dance together.",
        microVariants: [
          "As a professional coordinator, {userName} taught others that the best events embrace chaos with humor and create space for unexpected collaboration."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        'festival': ['{favoriteFood} Festival', 'Art and Music Fair', 'Community Celebration', 'Cultural Heritage Event'],
        'chaosElement': ['growing sculpture', 'musical phenomenon', 'animal coordination', 'unexpected entertainment'],
        'participants': ['{favoriteAnimal}s', 'local musicians', 'visiting artists', 'community members']
      },
      weatherVariants: [
        'During perfect sunny weather that enhanced the outdoor chaos',
        'Through unexpected rain that created even more interesting musical effects',
        'During a gentle snowfall that made the performances magical'
      ],
      settingVariants: [
        'small town square with fountain centerpiece',
        'community park with natural amphitheater',
        'festival grounds near the town lake'
      ],
      randomSeed: 9264
    }
  },

  // Template 5: Seasonal & Cultural Theme (MISSING THEME ADDED)
  {
    title: "The International Holiday Exchange",
    theme: "Seasonal & Cultural",
    level: "Level 4 (Ages 11-13)",
    scenes: [
      {
        text: "{userName} had always celebrated their family's traditional winter holiday the same way every year until their social studies teacher announced an ambitious project: students would research and experience holiday celebrations from cultures around the world, then create an International Holiday Exchange where families could learn about and participate in diverse cultural traditions. What began as a simple research assignment evolved into a community-wide celebration that would teach {userName} profound lessons about cultural appreciation, family traditions, and the universal human desire to gather, share, and celebrate during special times of year.",
        pause: true,
        hook: "What cultural traditions will {userName} discover in their research?",
        microVariants: {
          text: "{userName}'s social studies project evolved from simple holiday research into a community International Holiday Exchange celebrating diverse cultural traditions.",
          alternatives: [
            "A school assignment about world holidays grew into {userName}'s plan for a community celebration showcasing cultural diversity and universal celebration traditions."
          ],
          optionalDetails: ["The project required interviewing people from different cultural backgrounds.", "Research revealed surprising connections between distant traditions.", "Some students had never learned about their own family's cultural heritage."]
        }
      },
      {
        text: "Working with classmates from twelve different cultural backgrounds, {userName} discovered fascinating connections and differences in how people mark significant times of year. Maria shared Mexican Posadas traditions involving {favoriteFood} and community processions, while Ahmad described Pakistani Eid celebrations with elaborate family gatherings and gift exchanges. Krishna explained Indian Diwali festivals with beautiful {favoriteColor} lights and sweets, and Elena described Russian Orthodox Christmas traditions with unique timing and customs. Each tradition reflected deep values about family, community, gratitude, and hope.",
        pause: true,
        hook: "How will {userName} help their community experience these diverse cultural celebrations?",
        microVariants: {
          text: "{userName} learned about diverse holiday traditions from classmates, discovering connections between cultures in how people celebrate community, family, and gratitude.",
          alternatives: [
            "Through collaboration with culturally diverse classmates, {userName} explored how different communities use celebrations to strengthen family bonds and express cultural values."
          ],
          optionalDetails: ["Each tradition involved special foods that brought families together.", "Many cultures used {favoriteColor} decorations with spiritual significance.", "Stories and music were central to most celebrations."]
        }
      },
      {
        text: "The International Holiday Exchange required months of careful planning to ensure cultural authenticity and respectful representation. {userName} worked with community cultural organizations, religious leaders, and immigrant families to create authentic experiences while avoiding cultural appropriation. They organized workshops where community members could learn traditional crafts, cooking techniques, and the historical significance behind different celebrations. The goal was not to replace anyone's traditions but to expand understanding of how diverse cultures express similar values through celebration.",
        pause: true,
        hook: "What challenges arise when planning culturally sensitive community celebrations?",
        microVariants: {
          text: "{userName} collaborated with cultural leaders to create authentic, respectful experiences that expanded understanding without replacing anyone's traditions.",
          alternatives: [
            "Months of planning with community cultural organizations ensured the Exchange would educate and celebrate while respecting the authenticity of each tradition."
          ],
          optionalDetails: ["Some traditions required specific ingredients that had to be special-ordered.", "Religious leaders offered guidance on appropriate participation levels.", "Language barriers required creative communication solutions."]
        }
      },
      {
        text: "The first International Holiday Exchange exceeded everyone's expectations, transforming the community center into a vibrant cultural journey through different celebration traditions. Families moved through stations experiencing Kwanzaa principles, Swedish Lucia processions, Chinese New Year traditions, Hindu Holi colors, Jewish Hanukkah ceremonies, and many others. {userName} watched with joy as children taught adults how to fold origami stars, elderly community members shared migration stories, and families discovered connections between their own traditions and those of their neighbors.",
        pause: true,
        hook: "How does the successful exchange change relationships within the community?",
        microVariants: {
          text: "The Exchange transformed the community center into a cultural journey where children taught adults, elderly residents shared stories, and families discovered connections.",
          alternatives: [
            "The celebration created intergenerational and cross-cultural learning opportunities that revealed unexpected connections between community members."
          ],
          optionalDetails: ["Food stations featured traditional {favoriteFood} from multiple cultures.", "Children became cultural ambassadors for their families' traditions.", "Photography documented the beautiful diversity of celebration."]
        }
      },
      {
        text: "Following the Exchange's success, several remarkable developments emerged in the community. Neighbors began inviting each other to their actual cultural celebrations, creating genuine cross-cultural friendships and understanding. The local elementary school integrated cultural celebration education into their curriculum, and the city council designated December as \"Community Cultural Heritage Month.\" {userName} realized that their project had not just shared information but had built bridges between community members who had lived near each other for years without truly connecting.",
        pause: true,
        hook: "What new opportunities will emerge from these strengthened community connections?",
        microVariants: {
          text: "The Exchange created lasting friendships, influenced school curriculum, and led to official recognition of cultural heritage, building genuine community connections.",
          alternatives: [
            "Success brought lasting changes: cross-cultural friendships, educational integration, and official cultural recognition that strengthened community bonds."
          ],
          optionalDetails: ["Interfaith dialogue groups formed organically.", "Local restaurants added traditional dishes from Exchange cultures.", "Children began learning languages from neighbors."]
        }
      },
      {
        text: "Recognizing the broader potential of cultural celebration as community building, {userName} developed a Cultural Bridge Program that connected their community with sister cities in other countries. Students began pen pal relationships, families participated in virtual celebration exchanges, and local businesses supported cultural education initiatives. {userName} learned that cultural celebration is not just about preserving traditions but about creating opportunities for people to share their heritage while discovering common human experiences of joy, gratitude, and community.",
        pause: true,
        hook: "How will {userName}'s cultural bridge building influence their future educational and career goals?",
        microVariants: {
          text: "{userName} expanded the program internationally, creating pen pal relationships and virtual exchanges that demonstrated celebration as universal human connection.",
          alternatives: [
            "The Cultural Bridge Program grew to connect communities globally, showing {userName} how celebration transcends borders and creates universal understanding."
          ],
          optionalDetails: ["Sister city partnerships included seasonal celebration exchanges.", "Virtual cooking classes connected families across continents.", "Language exchange programs emerged naturally from cultural connections."]
        }
      },
      {
        text: "As college application season approached, {userName} reflected on how a simple school project had evolved into a deep understanding of cultural anthropology, community organizing, and international relations. Their portfolio included documentation of cultural exchanges, testimonials from community members whose relationships had been transformed, and research on how celebration traditions adapt and evolve in multicultural communities. Universities were impressed not just by the project's scope but by {userName}'s demonstrated commitment to cultural understanding and community building.",
        pause: true,
        hook: "What cultural understanding work will {userName} pursue in their higher education and beyond?",
        microVariants: {
          text: "College applications showcased {userName}'s evolution from student researcher to community cultural bridge-builder, impressing universities with their demonstrated cultural leadership.",
          alternatives: [
            "Universities recognized {userName}'s growth from academic project manager to cultural understanding advocate with real community impact and international perspective."
          ],
          optionalDetails: ["Anthropology programs offered specialized scholarships.", "International relations schools highlighted their community organizing experience.", "Cultural studies departments invited them to present their findings."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Years later, as {userName} prepared for their own family's holiday celebration, they looked around at the beautifully diverse traditions that had become part of their annual customs. The menorah Maria had taught them to appreciate sat alongside the {favoriteColor} Diwali lights Krishna had shared, while the table was set with dishes representing the cultural exchange friendships they had nurtured over the years. Their children grew up understanding that celebration is a universal language, and that honoring diverse traditions makes every holiday richer and more meaningful.",
        microVariants: [
          "As a parent, {userName} created holiday celebrations that honored the diverse cultural traditions they had learned to appreciate, teaching their children that diversity enriches celebration."
        ]
      },
      {
        type: 'silly',
        text: "The fifth annual International Holiday Exchange became hilariously complicated when all the cultural traditions got wonderfully mixed up! Children were doing traditional Swedish dances while wearing {favoriteColor} Holi colors, elderly Polish grandmothers were teaching {favoriteAnimal} origami techniques, and everyone was trying to sing \"Jingle Bells\" in twelve different languages simultaneously while eating {favoriteFood} fusion dishes that somehow combined flavors from every culture represented! \"I think we accidentally created the world's first truly international celebration chaos!\" {userName} laughed as the community's new multicultural holiday became even more beloved than any individual tradition!",
        microVariants: [
          "The annual celebration became delightfully chaotic when cultural traditions blended into wonderfully absurd but deeply meaningful multicultural fusion!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the UNESCO International Youth Cultural Understanding Awards, {userName} received recognition for their Cultural Bridge Program, which had expanded to connect communities in seventeen countries. \"Their work demonstrates how young people can build cultural understanding through celebration and shared experience,\" announced the UNESCO director. \"The program has become a model for international cultural education and community building that preserves heritage while creating new connections.\"",
        microVariants: [
          "UNESCO recognized {userName}'s Cultural Bridge Program as an international model for youth-led cultural understanding and community building through celebration."
        ]
      },
      {
        type: 'reflective',
        text: "Working as a cultural anthropologist and community organizer, {userName} often reflected on the simple but profound lesson learned from that first Holiday Exchange: that celebration is humanity's way of marking what matters most, and that sharing our traditions doesn't diminish them but multiplies their impact. Every cultural bridge they built, every community connection they facilitated, carried forward the understanding that diversity in celebration reflects the beautiful complexity of human experience, and that learning about others' traditions helps us appreciate our own heritage more deeply.",
        microVariants: [
          "As a professional cultural anthropologist, {userName} understood that sharing traditions amplifies their meaning and that diversity in celebration reflects the beauty of human experience."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        'celebrations': ['winter holidays', 'harvest festivals', 'coming-of-age ceremonies', 'seasonal transitions'],
        'culturalElements': ['traditional foods', 'ceremonial objects', 'musical instruments', 'storytelling traditions'],
        'communityActivities': ['cooking workshops', 'craft sessions', 'storytelling circles', 'musical performances']
      },
      weatherVariants: [
        'During winter season when many cultures celebrate light and warmth',
        'In spring when cultures celebrate renewal and growth',
        'During autumn harvest time when gratitude traditions are honored'
      ],
      settingVariants: [
        'diverse community center with multiple cultural spaces',
        'school gymnasium transformed into cultural celebration areas',
        'outdoor festival grounds adapted for weather and cultural needs'
      ],
      randomSeed: 1847
    }
  }
];

export function getLevel4FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (LEVEL_4_FALLBACK_TEMPLATES.length === 0) {
    return null;
  }
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_4_FALLBACK_TEMPLATES.length) {
    return LEVEL_4_FALLBACK_TEMPLATES[templateIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_4_FALLBACK_TEMPLATES.length);
  return LEVEL_4_FALLBACK_TEMPLATES[randomIndex];
}

export function getLevel4FallbackTemplateCount(): number {
  return LEVEL_4_FALLBACK_TEMPLATES.length;
}