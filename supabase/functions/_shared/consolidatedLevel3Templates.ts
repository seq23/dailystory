// Consolidated Level 3 Templates - Ages 8-9, 3rd-4th grade reading level
// Word count: 70-100 words per scene, 10 scenes per template
// Combines existing base templates with extension templates converted to StoryTemplate format

export interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
  };
}

export interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: {
    text: string;
    alternatives: string[];
    optionalDetails: string[];
  };
}

export interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

export const CONSOLIDATED_LEVEL_3_TEMPLATES: StoryTemplate[] = [
  // Template 1: Neighborhood Cleanup Campaign (from extensions)
  {
    title: "The Community Environmental Campaign",
    theme: "Environmental Leadership & Civic Engagement",
    level: "Level 3",
    scenes: [
      {
        text: "If you give {userName} a neighborhood cleanup opportunity, they will immediately start researching environmental issues affecting their community and discover surprising connections between pollution, public health, and social justice that motivate them to take meaningful action.",
        pause: true,
        hook: "What environmental challenges will {userName} uncover in their research?",
        microVariants: {
          text: "If you give {userName} a neighborhood cleanup opportunity, they will immediately start researching environmental issues affecting their community and discover surprising connections between pollution, public health, and social justice.",
          alternatives: ["When {userName} encounters a community cleanup opportunity, they begin investigating local environmental problems and uncover unexpected links between pollution, health impacts, and equity issues."],
          optionalDetails: ["The research revealed that low-income neighborhoods faced disproportionate pollution exposure.", "Air quality data showed concerning patterns near schools and playgrounds.", "Community health statistics correlated with environmental hazards in predictable ways."]
        }
      },
      {
        text: "That will remind them of their love for community and solving environmental problems, leading them to interview neighbors about their concerns and document the stories of families whose daily lives are affected by pollution, noise, and environmental hazards in their neighborhood.",
        pause: false,
        hook: "",
        microVariants: {
          text: "That will remind them of their love for community and solving environmental problems, leading them to interview neighbors about their concerns and document the stories of families affected by environmental hazards.",
          alternatives: ["This awakens their passion for community service and environmental problem-solving, inspiring them to conduct neighborhood interviews and record testimonies from families dealing with pollution impacts."],
          optionalDetails: ["Mrs. Rodriguez shared concerns about air quality affecting her children's asthma.", "The Johnson family discussed how traffic noise disrupted their sleep patterns.", "Community elders remembered when the neighborhood was cleaner and quieter."]
        }
      },
      {
        text: "So they will want to create {favoriteColor} posters featuring {favoriteAnimal} and distribute them enthusiastically throughout the neighborhood while organizing informational meetings to educate residents about environmental justice issues and practical solutions for improving local air and water quality.",
        pause: true,
        hook: "How will neighbors respond to the educational campaign?",
        microVariants: {
          text: "So they will want to create {favoriteColor} posters featuring {favoriteAnimal} and distribute them enthusiastically while organizing meetings to educate residents about environmental justice and practical solutions.",
          alternatives: ["This motivates them to design {favoriteColor} posters with {favoriteAnimal} imagery and organize educational sessions about environmental justice issues and actionable community improvement strategies."],
          optionalDetails: ["The posters included QR codes linking to air quality monitoring apps.", "Meeting locations rotated between community centers, libraries, and churches.", "Bilingual materials ensured all residents could participate in the educational initiative."]
        }
      },
      {
        text: "Which means they will need to organize dozens of neighbors working together for change, coordinating volunteer schedules, securing supplies, and establishing partnerships with local environmental organizations that can provide expertise, resources, and long-term support for sustainable community improvements.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Which means they will need to organize dozens of neighbors working together for change, coordinating schedules, securing supplies, and establishing partnerships with environmental organizations.",
          alternatives: ["This requires coordinating numerous neighbors for collective action, managing volunteer logistics, obtaining materials, and building partnerships with environmental groups for sustained support."],
          optionalDetails: ["The volunteer coordination spreadsheet tracked availability and skills of fifty-three participants.", "Local businesses donated cleaning supplies, tools, and refreshments for work days.", "Environmental groups provided training on proper disposal of hazardous materials."]
        }
      },
      {
        text: "The campaign gains momentum as media attention highlights the community's proactive approach to environmental challenges, inspiring other neighborhoods to adopt similar grassroots organizing strategies while city officials take notice of the residents' dedication and evidence-based advocacy efforts.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The campaign gains momentum as media attention highlights the community's proactive approach, inspiring other neighborhoods while city officials notice residents' dedication and advocacy.",
          alternatives: ["Media coverage amplifies the community's environmental initiative, motivating similar efforts in other areas while municipal leaders observe residents' commitment and well-researched advocacy."],
          optionalDetails: ["Three local TV stations featured the cleanup efforts during evening news broadcasts.", "The city council invited {userName} to present their research at next month's public meeting.", "Online fundraising exceeded expectations, raising money for additional environmental monitoring equipment."]
        }
      },
      {
        text: "Local government officials attend community meetings to hear residents' concerns and commit to policy changes that address environmental hazards, demonstrating how grassroots organizing can influence municipal decision-making and create lasting improvements in community health and environmental quality.",
        pause: true,
        hook: "What policy changes will result from the community advocacy?",
        microVariants: {
          text: "Local officials attend meetings to hear concerns and commit to policy changes addressing environmental hazards, showing how grassroots organizing influences municipal decisions and creates lasting improvements.",
          alternatives: ["Municipal leaders participate in community sessions, listening to resident concerns and pledging policy reforms that address environmental issues through responsive local governance."],
          optionalDetails: ["The city agreed to install additional air quality monitoring stations in three locations.", "New noise ordinances would better protect residential areas from industrial pollution.", "A community environmental advisory board was established with rotating neighborhood representation."]
        }
      },
      {
        text: "Environmental testing reveals measurable improvements in air and water quality after six months of sustained community action, while increased green spaces provide habitat for {favoriteAnimal} and other wildlife that contribute to neighborhood biodiversity and resident well-being through nature connection.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Environmental testing reveals measurable improvements in air and water quality after six months of sustained action, while green spaces provide {favoriteAnimal} habitat and resident well-being.",
          alternatives: ["Scientific measurements document significant environmental quality improvements following sustained community efforts, with new green spaces supporting {favoriteAnimal} populations and enhancing resident health."],
          optionalDetails: ["Particulate matter levels decreased by twenty-two percent in the most affected areas.", "Three previously vacant lots were transformed into community gardens with native plants.", "Bird species diversity increased as habitat restoration created nesting and feeding opportunities."]
        }
      },
      {
        text: "The success attracts researchers from the university who want to study the community's organizing model, while environmental justice organizations invite {userName} to speak at conferences about youth leadership in community-based environmental advocacy and the intersection of social equity with ecological health.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The success attracts university researchers studying the organizing model, while environmental organizations invite {userName} to speak at conferences about youth leadership and environmental justice.",
          alternatives: ["Academic researchers investigate the community's successful organizing approach, while environmental justice groups request {userName}'s participation in conferences about youth advocacy and ecological equity."],
          optionalDetails: ["The university partnership provided internship opportunities for interested high school students.", "Conference presentations reached audiences of environmental professionals, policy makers, and community organizers.", "The organizing model was documented in academic publications and practitioner resources."]
        }
      },
      {
        text: "Community health outcomes improve as residents report fewer respiratory problems and increased physical activity in the cleaner, safer neighborhood environment, while property values rise and local businesses benefit from the area's enhanced reputation as a healthy, engaged community that prioritizes environmental stewardship.",
        pause: true,
        hook: "How will the community sustain long-term environmental improvements?",
        microVariants: {
          text: "Community health improves as residents report fewer respiratory problems and increased activity in the cleaner environment, while property values rise and businesses benefit from enhanced reputation.",
          alternatives: ["Resident health outcomes advance with reduced respiratory issues and greater physical activity in the improved environment, alongside increased property values and business benefits from enhanced community reputation."],
          optionalDetails: ["Hospital emergency room visits for asthma decreased by thirty-five percent in the targeted area.", "Two new businesses opened, citing the community's environmental reputation as a deciding factor.", "The neighborhood association received recognition from the state environmental protection agency."]
        }
      },
      {
        text: "And chances are, they will want another community project - but what environmental challenge will they tackle next as their success demonstrates how young people can lead meaningful change that addresses both environmental degradation and social inequity through organized community action and evidence-based advocacy?",
        pause: true,
        hook: "What environmental challenge will they tackle next?",
        microVariants: {
          text: "And chances are, they will want another community project - but what environmental challenge will they tackle next as their success demonstrates youth leadership in addressing environmental and social issues?",
          alternatives: ["They will likely pursue additional community projects, considering which environmental challenge to address next, having proven that young people can lead meaningful change addressing both ecological and equity issues."],
          optionalDetails: ["Three neighboring communities requested help replicating the organizing model.", "Regional environmental groups offered funding for expanded advocacy efforts.", "Plans were developing for a city-wide youth environmental leadership network."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every evening, {userName} walks through the transformed neighborhood, breathing cleaner air and watching {favoriteAnimal} thrive in the restored green spaces. Neighbors wave from their front porches, and children play safely in areas that were once polluted. The community feels like home in a way it never did before, connected by shared purpose and environmental stewardship.",
        microVariants: ["Each evening, {userName} strolls through their transformed neighborhood, enjoying cleaner air and thriving {favoriteAnimal} while neighbors wave from porches and children play safely in restored areas."]
      },
      {
        type: 'silly',
        text: "The neighborhood becomes so clean and beautiful that {favoriteAnimal} from all over the city start moving in! Soon there's a traffic jam of migrating wildlife, and {userName} has to organize an animal welcome committee complete with {favoriteFood} refreshments and {favoriteColor} name tags. What a wonderfully chaotic conservation success story!",
        microVariants: ["The transformed neighborhood attracts so many {favoriteAnimal} that {userName} organizes an animal welcome committee with {favoriteFood} refreshments and {favoriteColor} name tags - a delightfully chaotic conservation triumph!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s environmental organizing model is adopted by communities across three states, with their youth leadership training program helping hundreds of young people start their own environmental justice campaigns. They receive recognition from the Environmental Protection Agency and are invited to address the United Nations Youth Climate Summit.",
        microVariants: ["{userName}'s organizing model spreads across three states, with their training program helping hundreds of youth start environmental campaigns, earning EPA recognition and UN Youth Climate Summit invitation."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that environmental justice means ensuring all communities have equal access to clean air, water, and green spaces regardless of income or background. They learn that young people have unique power to see problems clearly and organize for change, and that environmental health and social equity are inseparably connected in the fight for community well-being.",
        microVariants: ["{userName} learns that environmental justice ensures equal access to clean environments regardless of background, discovering youth power to organize for change and the connection between environmental health and social equity."]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_issues": ["air pollution", "water contamination", "noise pollution", "toxic waste", "urban heat"],
        "organizing_strategies": ["community meetings", "research campaigns", "media outreach", "policy advocacy", "coalition building"],
        "community_partners": ["environmental groups", "health organizations", "universities", "government agencies", "local businesses"]
      },
      weatherVariants: ["community organizing morning", "environmental testing day", "policy meeting afternoon", "celebration gathering"],
      settingVariants: ["neighborhood streets", "community center", "city hall", "environmental monitoring sites"]
    }
  },

  // Template 2: Wildlife Rescue (from extensions)
  {
    title: "The Wildlife Rehabilitation Journey",
    theme: "Conservation & Animal Care",
    level: "Level 3",
    scenes: [
      {
        text: "{userName} was not quite ready for wildlife rescue, but the injured {favoriteAnimal} needed help, and sometimes life presents us with challenges that require immediate compassion and action even when we feel unprepared for the responsibility of caring for wild creatures.",
        pause: true,
        hook: "How will {userName} learn to properly care for an injured wild animal?",
        microVariants: {
          text: "{userName} was not quite ready for wildlife rescue, but the injured {favoriteAnimal} needed help, and sometimes life presents challenges requiring immediate compassion even when we feel unprepared.",
          alternatives: ["Though {userName} felt unprepared for wildlife rescue, an injured {favoriteAnimal} required assistance, demonstrating how life demands immediate compassionate action despite our sense of readiness."],
          optionalDetails: ["The {favoriteAnimal} had a damaged wing and couldn't fly to safety.", "No adults were immediately available to handle the wildlife emergency.", "Time was critical for the animal's survival and recovery prospects."]
        }
      },
      {
        text: "But slowly, things began to change as they carefully provided {favoriteFood} and called professionals, learning that wildlife rehabilitation requires patience, scientific knowledge, and respect for the natural behaviors and needs of creatures who are fundamentally different from domestic pets.",
        pause: false,
        hook: "",
        microVariants: {
          text: "But slowly, things began to change as they carefully provided {favoriteFood} and called professionals, learning that wildlife rehabilitation requires patience, knowledge, and respect for natural behaviors.",
          alternatives: ["Gradually, circumstances evolved as {userName} cautiously offered {favoriteFood} and contacted experts, discovering that wildlife care demands patience, scientific understanding, and respect for natural animal behaviors."],
          optionalDetails: ["The wildlife rehabilitation center provided telephone guidance for emergency care.", "Proper nutrition for wild animals differs significantly from pet food requirements.", "Stress reduction techniques were crucial for the animal's physical and psychological recovery."]
        }
      },
      {
        text: "Sometimes the best things happen when you wait weeks for rehabilitation and recovery, observing the gradual healing process while learning about wildlife biology, animal behavior, and the complex ecosystems that support healthy populations of wild creatures in their natural habitats.",
        pause: true,
        hook: "What will {userName} discover about wildlife biology during the recovery process?",
        microVariants: {
          text: "Sometimes the best things happen when you wait weeks for rehabilitation and recovery, observing gradual healing while learning about wildlife biology and ecosystems supporting healthy populations.",
          alternatives: ["The most meaningful outcomes often require weeks of rehabilitation observation, providing opportunities to study wildlife biology, animal behavior, and ecosystem relationships that sustain wild populations."],
          optionalDetails: ["Daily observation logs documented the animal's behavioral changes and physical improvements.", "Research into the species' natural diet and habitat requirements deepened understanding.", "Veterinary professionals explained the healing process and long-term rehabilitation strategies."]
        }
      },
      {
        text: "Professional wildlife rehabilitators become mentors, teaching {userName} about proper animal handling techniques, nutritional requirements, and the legal regulations governing wildlife care while emphasizing the importance of minimizing human contact to preserve the animal's wild instincts and natural behaviors.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Professional rehabilitators become mentors, teaching proper handling techniques, nutrition, and legal regulations while emphasizing minimal human contact to preserve wild instincts.",
          alternatives: ["Wildlife rehabilitation experts serve as mentors, instructing {userName} in appropriate handling methods, dietary needs, and regulatory compliance while prioritizing preservation of natural behaviors."],
          optionalDetails: ["Federal permits are required for most wildlife rehabilitation activities.", "Improper human interaction can make wild animals unsuitable for release.", "Each species has specific dietary, housing, and medical care requirements."]
        }
      },
      {
        text: "The injured {favoriteAnimal} gradually regains strength and mobility through carefully designed physical therapy exercises and environmental enrichment activities that stimulate natural behaviors while preparing the animal for eventual release back into its appropriate wild habitat where it belongs.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The injured {favoriteAnimal} gradually regains strength through physical therapy exercises and enrichment activities that stimulate natural behaviors while preparing for wild release.",
          alternatives: ["The recovering {favoriteAnimal} slowly rebuilds strength via therapeutic exercises and environmental enrichment designed to stimulate instinctive behaviors and prepare for habitat reintegration."],
          optionalDetails: ["Flight conditioning exercises helped rebuild wing muscle strength and coordination.", "Foraging challenges encouraged natural feeding behaviors and problem-solving skills.", "Gradual introduction to outdoor environments reduced dependency on human care."]
        }
      },
      {
        text: "Medical examinations and health assessments conducted by licensed veterinarians specializing in wildlife medicine determine the animal's readiness for release while {userName} learns about the scientific methods used to evaluate wild animal health, fitness, and behavioral preparedness for independent survival.",
        pause: true,
        hook: "Will the {favoriteAnimal} be ready for release back to the wild?",
        microVariants: {
          text: "Medical examinations by wildlife veterinarians determine release readiness while {userName} learns about scientific methods for evaluating wild animal health and behavioral preparedness.",
          alternatives: ["Veterinary assessments by wildlife medicine specialists evaluate release readiness as {userName} studies scientific approaches to determining animal health, fitness, and survival preparedness."],
          optionalDetails: ["X-rays confirmed complete bone healing and normal joint function.", "Behavioral assessments evaluated fear responses and natural defensive behaviors.", "Weight and body condition scores indicated optimal health for wild survival."]
        }
      },
      {
        text: "Community education becomes part of the rehabilitation process as {userName} creates presentations about wildlife conservation, habitat protection, and the human activities that can harm or help wild animal populations while sharing the {favoriteAnimal}'s recovery story with classmates and neighbors.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Community education becomes part of rehabilitation as {userName} creates presentations about conservation, habitat protection, and human impacts while sharing the {favoriteAnimal}'s recovery story.",
          alternatives: ["Educational outreach develops as {userName} designs presentations about wildlife conservation and habitat protection, incorporating the {favoriteAnimal}'s rehabilitation journey to engage community audiences."],
          optionalDetails: ["School presentations reached over two hundred students across three grade levels.", "Community center workshops attracted families interested in wildlife-friendly landscaping.", "Social media documentation of the rescue inspired others to support rehabilitation centers."]
        }
      },
      {
        text: "That's when {userName} realized releasing the healthy {favoriteAnimal} felt like watching freedom soar, understanding that successful wildlife rehabilitation means returning animals to their natural lives while maintaining the wild instincts and behaviors essential for their survival and ecological contributions.",
        pause: false,
        hook: "",
        microVariants: {
          text: "That's when {userName} realized releasing the healthy {favoriteAnimal} felt like watching freedom soar, understanding that successful rehabilitation means returning animals to natural lives.",
          alternatives: ["{userName} discovered that releasing the rehabilitated {favoriteAnimal} resembled witnessing freedom itself, comprehending that effective wildlife care restores animals to their natural existence."],
          optionalDetails: ["The release location was carefully selected based on habitat quality and population density.", "Monitoring efforts would track the animal's successful reintegration into wild populations.", "The experience demonstrated the intersection of scientific knowledge and conservation ethics."]
        }
      },
      {
        text: "The rehabilitation center invites {userName} to volunteer regularly, recognizing their dedication and natural aptitude for wildlife care while providing opportunities to assist with other injured animals and contribute to important conservation research that benefits entire ecosystems and species populations.",
        pause: true,
        hook: "How will continued volunteer work advance wildlife conservation?",
        microVariants: {
          text: "The rehabilitation center invites {userName} to volunteer regularly, recognizing their dedication and aptitude while providing opportunities to assist other animals and contribute to conservation research.",
          alternatives: ["Wildlife rehabilitation staff recognize {userName}'s commitment and natural ability, offering regular volunteer opportunities to assist additional animals and support ecosystem conservation research."],
          optionalDetails: ["Volunteer training covered twenty-three different species commonly treated at the facility.", "Research projects included habitat assessment, population monitoring, and human-wildlife conflict mitigation.", "Advanced volunteers could assist with educational programs and community outreach initiatives."]
        }
      },
      {
        text: "And {userName} knew everything would be okay - helping wildlife happens one rescue at a time, building knowledge, compassion, and scientific understanding that contributes to broader conservation efforts protecting entire ecosystems and the intricate web of relationships that sustain all life on Earth.",
        pause: true,
        hook: "Which creature will need help next?",
        microVariants: {
          text: "And {userName} knew everything would be okay - helping wildlife happens one rescue at a time, building knowledge and compassion that contributes to conservation efforts protecting entire ecosystems.",
          alternatives: ["{userName} understood that wildlife assistance occurs through individual rescues that accumulate knowledge and compassion, supporting comprehensive conservation efforts that protect complete ecological systems."],
          optionalDetails: ["Each successful rehabilitation contributes data to scientific understanding of species recovery.", "Volunteer networks create community-wide awareness of wildlife conservation needs.", "Individual rescue experiences inspire lifelong commitments to environmental stewardship."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every weekend, {userName} visits the wildlife rehabilitation center, caring for injured animals while enjoying quiet moments of connection with the natural world. The gentle work of healing creates peaceful satisfaction, knowing that each recovered animal returns to contribute to the beautiful web of life that surrounds and sustains us all.",
        microVariants: ["Each weekend, {userName} tends to injured wildlife at the rehabilitation center, finding peaceful satisfaction in healing work that returns animals to the natural web of life."]
      },
      {
        type: 'silly',
        text: "So many recovered animals remember {userName}'s kindness that they start visiting the rehabilitation center for social calls! Soon there's a regular parade of healthy {favoriteAnimal}s, squirrels, and raccoons stopping by for {favoriteFood} and friendly check-ins. What a wonderfully chaotic wildlife reunion center!",
        microVariants: ["Recovered animals remember {userName}'s care and visit for social calls, creating a parade of healthy {favoriteAnimal}s and other creatures stopping by for {favoriteFood} - a chaotic wildlife reunion!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s wildlife conservation work expands into a youth education program that partners with schools across the region. Their rehabilitation center becomes a model facility, and they receive recognition from national wildlife organizations while inspiring hundreds of young people to pursue careers in conservation biology.",
        microVariants: ["{userName}'s conservation work grows into a regional youth education program, with their rehabilitation center becoming a model facility earning national recognition and inspiring conservation careers."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that every wild creature has intrinsic value and a vital role in maintaining healthy ecosystems. Wildlife rehabilitation teaches patience, respect, and scientific understanding while demonstrating how individual acts of compassion contribute to the larger work of environmental stewardship and conservation that protects all life on our shared planet.",
        microVariants: ["{userName} discovers that every wild creature has intrinsic value and ecosystem importance, with wildlife care teaching patience and scientific understanding that contributes to environmental stewardship protecting all planetary life."]
      }
    ],
    reuse: {
      swappableElements: {
        "wildlife_types": ["birds", "mammals", "reptiles", "amphibians", "marine animals"],
        "rehabilitation_activities": ["medical care", "nutrition", "physical therapy", "behavioral assessment", "release preparation"],
        "conservation_outcomes": ["habitat protection", "species recovery", "ecosystem health", "community education", "research advancement"]
      },
      weatherVariants: ["rehabilitation center morning", "release day celebration", "education program afternoon", "conservation research session"],
      settingVariants: ["wildlife rehabilitation center", "natural release habitat", "educational facility", "conservation research site"]
    }
  },

  // Template 3: Photography Hobby (from extensions)
  {
    title: "The Creative Photography Journey",
    theme: "Arts & Self-Expression",
    level: "Level 3",
    scenes: [
      {
        text: "One day, {userName} was thinking about capturing {favoriteColor} sunsets, and that's when photography became fascinating, opening up a whole new world of artistic expression and creative documentation that would transform how they saw and interacted with the world around them.",
        pause: true,
        hook: "What photographic subjects will capture {userName}'s artistic imagination?",
        microVariants: {
          text: "One day, {userName} was thinking about capturing {favoriteColor} sunsets, and that's when photography became fascinating, opening up a world of artistic expression and creative documentation.",
          alternatives: ["While contemplating {favoriteColor} sunset photography, {userName} discovered a fascinating artistic medium that transformed their perspective on visual storytelling and creative expression."],
          optionalDetails: ["The camera was a gift from their grandmother who had been a photographer.", "Digital photography allowed for immediate feedback and learning from mistakes.", "Online photography communities provided inspiration and technical guidance for beginners."]
        }
      },
      {
        text: "So {userName} explored different techniques for photographing {favoriteAnimal} in their natural habitat with patience, learning that wildlife photography requires understanding animal behavior, respecting natural environments, and developing technical skills with camera settings, lighting, and composition principles.",
        pause: false,
        hook: "",
        microVariants: {
          text: "So {userName} explored techniques for photographing {favoriteAnimal} in natural habitats with patience, learning that wildlife photography requires understanding behavior, environment respect, and technical skills.",
          alternatives: ["{userName} investigated wildlife photography methods for capturing {favoriteAnimal} in natural settings, discovering the need for behavioral knowledge, environmental sensitivity, and advanced technical abilities."],
          optionalDetails: ["Early morning and late afternoon provided the best natural lighting conditions.", "Telephoto lenses allowed for close-up shots without disturbing wildlife.", "Understanding seasonal patterns helped predict where animals would be most active."]
        }
      },
      {
        text: "Naturally, the camera captured amazing details of {favoriteAnimal} behavior that eyes often miss completely, revealing intricate patterns of movement, social interaction, and environmental adaptation that deepened {userName}'s appreciation for wildlife complexity and the interconnectedness of natural ecosystems.",
        pause: true,
        hook: "What hidden details of animal behavior will the camera reveal?",
        microVariants: {
          text: "Naturally, the camera captured amazing details of {favoriteAnimal} behavior that eyes often miss, revealing movement patterns, social interaction, and environmental adaptation that deepened wildlife appreciation.",
          alternatives: ["The camera naturally documented {favoriteAnimal} behavioral details invisible to casual observation, uncovering complex movement patterns and social dynamics that enhanced understanding of wildlife complexity."],
          optionalDetails: ["High-speed photography froze rapid wing movements and facial expressions.", "Sequential shots documented hunting techniques and parental care behaviors.", "Macro photography revealed intricate fur patterns and eye details."]
        }
      },
      {
        text: "Before long, a {favoriteColor} sunrise photo featuring a {favoriteAnimal} won the school contest beautifully, demonstrating how artistic vision combined with technical skill and patient observation can create images that communicate emotion, tell stories, and inspire others to notice and appreciate natural beauty.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Before long, a {favoriteColor} sunrise photo featuring a {favoriteAnimal} won the school contest beautifully, demonstrating how artistic vision, technical skill, and patient observation create inspiring images.",
          alternatives: ["Soon a stunning {favoriteColor} sunrise photograph featuring a {favoriteAnimal} earned school competition recognition, showcasing how creative vision and technical expertise combine to produce emotionally compelling imagery."],
          optionalDetails: ["The winning photo was displayed in the school's main hallway for the entire year.", "Local newspapers featured the photograph and interviewed {userName} about their photography journey.", "The prize included professional photography equipment and a workshop with a wildlife photographer."]
        }
      },
      {
        text: "Photography workshops and online communities provide mentorship opportunities where {userName} learns advanced techniques from experienced photographers while sharing their own unique perspective and artistic vision with others who appreciate the creative and technical aspects of visual storytelling through images.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Photography workshops and online communities provide mentorship where {userName} learns advanced techniques while sharing their unique perspective and artistic vision with other visual storytellers.",
          alternatives: ["Educational workshops and digital photography communities offer mentoring opportunities for {userName} to develop technical skills while contributing their distinctive creative vision to collaborative learning environments."],
          optionalDetails: ["Professional photographers volunteered time to teach composition and lighting techniques.", "Online critique sessions helped improve technical skills and artistic development.", "Photography challenges encouraged experimentation with different subjects and styles."]
        }
      },
      {
        text: "Community exhibitions and local art shows feature {userName}'s photography work, creating opportunities to share their artistic vision with broader audiences while building confidence in their creative abilities and establishing connections with other artists, photographers, and community members who appreciate visual arts.",
        pause: true,
        hook: "How will community recognition influence {userName}'s artistic development?",
        microVariants: {
          text: "Community exhibitions feature {userName}'s photography, creating opportunities to share artistic vision with broader audiences while building confidence and connecting with other artists and community members.",
          alternatives: ["Local art exhibitions showcase {userName}'s photographic work, providing platforms for artistic expression while fostering confidence and establishing relationships within the creative community."],
          optionalDetails: ["The community center hosted a solo exhibition of {userName}'s nature photography.", "Sales of framed prints helped fund photography equipment and workshop attendance.", "Collaboration with local environmental groups combined art with conservation messaging."]
        }
      },
      {
        text: "Environmental organizations invite {userName} to document conservation projects and wildlife habitat restoration efforts, demonstrating how photography can serve both artistic expression and environmental advocacy while contributing to important conservation education and public awareness campaigns.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Environmental organizations invite {userName} to document conservation projects, showing how photography serves artistic expression and environmental advocacy while contributing to education and awareness campaigns.",
          alternatives: ["Conservation groups request {userName}'s photographic documentation of restoration projects, illustrating how visual arts support both creative expression and environmental advocacy through educational outreach."],
          optionalDetails: ["Before-and-after photography documented the success of habitat restoration projects.", "Images were used in grant applications to secure funding for additional conservation work.", "Educational materials featuring the photographs reached thousands of students and community members."]
        }
      },
      {
        text: "Teaching photography skills to younger students becomes a natural extension of {userName}'s artistic development, as they discover that sharing knowledge and inspiring others' creative expression brings deep satisfaction while building leadership skills and contributing to community arts education programs.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Teaching photography to younger students becomes a natural extension of artistic development, as {userName} discovers that sharing knowledge and inspiring creativity brings satisfaction while building leadership skills.",
          alternatives: ["Photography instruction for younger students naturally develops from {userName}'s artistic growth, revealing how knowledge sharing and creative inspiration provide fulfillment while developing educational leadership abilities."],
          optionalDetails: ["After-school photography clubs attracted students from multiple grade levels.", "Student exhibitions showcased the diverse perspectives and creativity of young photographers.", "Partnerships with local camera shops provided equipment loans for students without access to cameras."]
        }
      },
      {
        text: "Professional photographers recognize {userName}'s talent and offer internship opportunities that provide real-world experience in commercial photography, photojournalism, and fine art photography while demonstrating career paths that combine artistic passion with professional skill development and community contribution.",
        pause: true,
        hook: "What professional photography opportunities will shape {userName}'s future?",
        microVariants: {
          text: "Professional photographers recognize {userName}'s talent and offer internships providing real-world experience in commercial photography, photojournalism, and fine art while demonstrating career paths combining passion with skill.",
          alternatives: ["Industry professionals acknowledge {userName}'s abilities and provide internship opportunities in various photography fields, illustrating how artistic passion can develop into meaningful career paths with community impact."],
          optionalDetails: ["Wedding photography internships taught business skills and client interaction.", "Newspaper internships provided experience in photojournalism and deadline pressure.", "Gallery internships offered insights into fine art photography and exhibition curation."]
        }
      },
      {
        text: "And wouldn't you know it - that photography hobby proved practice creates beautiful art, demonstrating how consistent dedication to creative expression, combined with technical skill development and community engagement, can transform a simple interest into a lifelong passion that enriches both personal growth and community cultural life.",
        pause: true,
        hook: "What stunning scene will they capture next?",
        microVariants: {
          text: "And wouldn't you know it - that photography hobby proved practice creates beautiful art, showing how dedication to creative expression combined with skill development can transform interest into lifelong passion.",
          alternatives: ["The photography journey demonstrated that consistent practice generates beautiful artwork, illustrating how creative dedication and technical development transform casual interest into profound lifelong artistic commitment."],
          optionalDetails: ["Portfolio development documented artistic growth and technical improvement over time.", "Awards and recognition validated the artistic vision and encouraged continued creative exploration.", "Photography became a lens through which {userName} viewed and appreciated the world's beauty."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every golden hour, {userName} walks quietly through natural spaces with their camera, capturing the gentle interplay of light and shadow while {favoriteAnimal} move peacefully through their habitat. The rhythmic click of the shutter and the patient waiting for perfect moments create a meditative practice that brings profound peace and connection with the natural world.",
        microVariants: ["Each golden hour, {userName} walks peacefully through nature with camera, capturing light and shadow while {favoriteAnimal} move through habitat, creating meditative practice bringing profound peace."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} become such enthusiastic photo models that they start posing automatically whenever they see {userName} approaching with the camera! Soon there's a waiting list of wildlife wanting portrait sessions, complete with {favoriteFood} payment and {favoriteColor} backdrop preferences. What a wonderfully vain wildlife photography studio!",
        microVariants: ["The {favoriteAnimal} become eager photo models, automatically posing for {userName}'s camera and creating a wildlife portrait studio with {favoriteFood} payments and {favoriteColor} backdrop preferences!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s photography career flourishes as their wildlife images appear in National Geographic and international conservation campaigns. Their work influences environmental policy and inspires a new generation of conservation photographers while earning recognition from the World Wildlife Photography Awards and establishing a scholarship fund for young photographers.",
        microVariants: ["{userName}'s photography career reaches National Geographic and international campaigns, influencing environmental policy and inspiring conservation photographers while earning World Wildlife Photography Awards recognition."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that photography is about more than capturing images - it's about seeing beauty in everyday moments, understanding the relationship between light and life, and sharing perspectives that help others appreciate the intricate wonder of the natural world. Through the camera lens, they discover that art is everywhere, waiting to be noticed and celebrated.",
        microVariants: ["{userName} discovers that photography reveals beauty in everyday moments and the relationship between light and life, sharing perspectives that help others appreciate natural wonder through artistic vision."]
      }
    ],
    reuse: {
      swappableElements: {
        "photography_subjects": ["wildlife", "landscapes", "portraits", "macro", "street"],
        "camera_techniques": ["composition", "lighting", "exposure", "focus", "timing"],
        "artistic_outcomes": ["exhibitions", "competitions", "publications", "education", "conservation"]
      },
      weatherVariants: ["golden hour shoot", "dramatic storm light", "soft morning mist", "perfect blue hour"],
      settingVariants: ["natural habitat", "urban environment", "studio space", "gallery exhibition"]
    }
  },

  // Template 4: Handmade Crafts Business (from extensions)
  {
    title: "The Young Entrepreneur's Craft Enterprise",
    theme: "Business & Creativity",
    level: "Level 3",
    scenes: [
      {
        text: "If you give {userName} a small business opportunity involving {favoriteColor} crafts, they will immediately start researching market demand, calculating production costs, and developing business plans that combine creative expression with entrepreneurial skills and financial literacy education.",
        pause: true,
        hook: "What creative products will {userName} design for their craft business?",
        microVariants: {
          text: "If you give {userName} a small business opportunity involving {favoriteColor} crafts, they will start researching market demand, calculating costs, and developing business plans combining creativity with entrepreneurship.",
          alternatives: ["When {userName} encounters a craft business opportunity featuring {favoriteColor} products, they begin investigating market needs, cost analysis, and business planning that integrates creative expression with entrepreneurial education."],
          optionalDetails: ["Market research involved surveying classmates, teachers, and community members about craft preferences.", "Cost calculations included materials, labor time, and overhead expenses like packaging and marketing.", "Business plan templates from the Small Business Administration provided structure and guidance."]
        }
      },
      {
        text: "That will remind them of their creativity with {favoriteAnimal}-themed friendship bracelets and painted bookmarks, leading them to develop a diverse product line that reflects personal artistic vision while meeting customer needs and preferences identified through market research and customer feedback analysis.",
        pause: false,
        hook: "",
        microVariants: {
          text: "That will remind them of their creativity with {favoriteAnimal}-themed friendship bracelets and painted bookmarks, leading to a diverse product line reflecting artistic vision while meeting customer needs.",
          alternatives: ["This awakens their creative abilities in {favoriteAnimal}-themed jewelry and painted bookmarks, inspiring product line development that balances personal artistic expression with customer preferences and market demands."],
          optionalDetails: ["Product prototypes were tested with focus groups of potential customers.", "Artistic themes included nature motifs, inspirational quotes, and personalized designs.", "Seasonal products capitalized on holidays and special events throughout the school year."]
        }
      },
      {
        text: "So they will want to calculate costs, set prices, and manage inventory of {favoriteFood}-scented candles carefully while learning about profit margins, customer service excellence, and the operational logistics required to run a successful small business venture.",
        pause: true,
        hook: "How will {userName} manage the business operations and customer relationships?",
        microVariants: {
          text: "So they will want to calculate costs, set prices, and manage inventory of {favoriteFood}-scented candles while learning about profit margins, customer service, and operational logistics for successful business.",
          alternatives: ["This motivates careful cost calculation, pricing strategy, and inventory management for {favoriteFood}-scented candles while mastering profit analysis, service excellence, and operational management essential for business success."],
          optionalDetails: ["Pricing strategies considered competitor analysis, cost-plus pricing, and value-based pricing approaches.", "Customer service training emphasized communication skills, problem-solving, and relationship building.", "Inventory management systems tracked raw materials, work-in-progress, and finished goods."]
        }
      },
      {
        text: "Which means they will need to appreciate quality while creating {specialRequest} inspired products for charities, understanding that business success requires balancing profitability with social responsibility and community contribution while maintaining high standards for craftsmanship and customer satisfaction.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Which means they will need to appreciate quality while creating {specialRequest} inspired products for charities, balancing profitability with social responsibility and community contribution while maintaining high craftsmanship standards.",
          alternatives: ["This requires quality appreciation while developing {specialRequest}-inspired charitable products, understanding that successful business balances profit with social responsibility and community impact while upholding superior craftsmanship."],
          optionalDetails: ["Charitable partnerships included local food banks, animal shelters, and environmental organizations.", "Quality control processes ensured consistent product standards and customer satisfaction.", "Social responsibility initiatives donated percentage of profits to community causes."]
        }
      },
      {
        text: "Business mentorship from local entrepreneurs provides guidance on marketing strategies, financial management, and customer relationship building while {userName} learns to navigate the challenges and opportunities of operating a creative enterprise that generates income while contributing to community economic development.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Business mentorship from local entrepreneurs provides guidance on marketing, financial management, and customer relationships while {userName} learns to navigate creative enterprise challenges and opportunities.",
          alternatives: ["Local entrepreneurial mentors offer instruction in marketing strategies, financial oversight, and customer development as {userName} masters the complexities of operating a creative business that generates revenue and supports community growth."],
          optionalDetails: ["SCORE mentors provided weekly business coaching and strategic planning assistance.", "Marketing strategies included social media, craft fairs, and word-of-mouth referral programs.", "Financial management covered cash flow, budgeting, and reinvestment strategies."]
        }
      },
      {
        text: "Online sales platforms and social media marketing expand the business reach beyond local markets while {userName} develops digital literacy skills, learns about e-commerce operations, and builds an online brand presence that authentically represents their creative vision and business values.",
        pause: true,
        hook: "How will online expansion change the business dynamics and growth potential?",
        microVariants: {
          text: "Online sales platforms and social media marketing expand business reach while {userName} develops digital literacy, e-commerce operations knowledge, and authentic online brand presence representing their vision.",
          alternatives: ["Digital sales platforms and social marketing broaden market reach as {userName} builds technology skills, e-commerce understanding, and online brand identity that genuinely reflects creative vision and business principles."],
          optionalDetails: ["E-commerce platforms included Etsy, Instagram Shopping, and a dedicated website with payment processing.", "Social media content featured behind-the-scenes crafting processes and customer testimonials.", "Brand identity development included logo design, color schemes, and consistent messaging across platforms."]
        }
      },
      {
        text: "Craft fair participation and community market events provide face-to-face customer interaction opportunities while {userName} develops public speaking skills, learns to present products effectively, and builds relationships with other local artisans and small business owners who share similar entrepreneurial experiences.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Craft fair participation and community markets provide face-to-face customer interaction while {userName} develops public speaking skills, effective presentation, and relationships with other local artisans.",
          alternatives: ["Community craft fairs and local markets offer direct customer engagement opportunities as {userName} builds presentation abilities, public communication skills, and connections with fellow artisans and entrepreneurs."],
          optionalDetails: ["Market booth design included attractive product displays and interactive demonstrations.", "Public speaking improved through customer interactions and product explanations.", "Artisan networks provided mutual support, collaboration opportunities, and industry knowledge sharing."]
        }
      },
      {
        text: "Financial literacy education through business operations teaches {userName} about budgeting, saving, investing, and money management while demonstrating how entrepreneurial activities can contribute to personal financial goals and long-term economic security through creative skill development and business acumen.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Financial literacy education through business operations teaches {userName} about budgeting, saving, investing, and money management while demonstrating how entrepreneurship contributes to personal financial goals.",
          alternatives: ["Business operations provide financial education in budgeting, savings, investment, and money management, illustrating how entrepreneurial activities support personal financial objectives and long-term economic stability through creative skills."],
          optionalDetails: ["Banking relationships included business checking accounts and merchant services for payment processing.", "Investment education covered reinvestment in business growth versus personal savings goals.", "Tax preparation introduced concepts of business deductions and income reporting."]
        }
      },
      {
        text: "Success metrics beyond profit include customer satisfaction, creative fulfillment, skill development, and community impact while {userName} learns to evaluate business performance using multiple criteria that reflect both financial success and personal values alignment with entrepreneurial activities and creative expression.",
        pause: true,
        hook: "What new business ventures will emerge from this entrepreneurial foundation?",
        microVariants: {
          text: "Success metrics beyond profit include customer satisfaction, creative fulfillment, skill development, and community impact while {userName} learns to evaluate business using multiple criteria reflecting values alignment.",
          alternatives: ["Performance evaluation encompasses customer satisfaction, creative fulfillment, skill advancement, and community benefit as {userName} develops comprehensive business assessment methods that balance financial success with personal value alignment."],
          optionalDetails: ["Customer feedback surveys measured satisfaction and suggested product improvements.", "Creative fulfillment was assessed through artistic growth and personal satisfaction with products.", "Community impact was tracked through charitable contributions and local economic participation."]
        }
      },
      {
        text: "And chances are, they will want another business venture - but what creative products will they design next as their entrepreneurial success demonstrates how young people can combine artistic talents with business skills to create meaningful work that generates income while contributing to community economic vitality and creative culture?",
        pause: true,
        hook: "What creative products will they design next?",
        microVariants: {
          text: "And chances are, they will want another business venture - what creative products will they design next as their success demonstrates how youth combine artistic talents with business skills for meaningful work?",
          alternatives: ["They will likely pursue additional business ventures, considering which creative products to develop next, having demonstrated how young entrepreneurs integrate artistic abilities with business expertise to create purposeful income-generating community contributions."],
          optionalDetails: ["Future business ideas included seasonal products, custom design services, and educational workshops.", "Expansion possibilities involved hiring other young artisans and developing wholesale relationships.", "Long-term goals included establishing a creative cooperative or mentoring other young entrepreneurs."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every quiet evening, {userName} sits at their crafting table surrounded by {favoriteColor} materials and the gentle tools of their trade, creating beautiful handmade items while soft music plays and the satisfaction of creative entrepreneurship fills their heart. The peaceful rhythm of making beautiful things that bring joy to others creates a perfect harmony of artistry and purpose.",
        microVariants: ["Each peaceful evening, {userName} crafts at their table surrounded by {favoriteColor} materials, creating handmade items while music plays and entrepreneurial satisfaction fills their heart with artistic purpose."]
      },
      {
        type: 'silly',
        text: "The craft business becomes so popular that {favoriteAnimal} start placing orders for custom accessories! Soon {userName} is designing tiny {favoriteColor} bow ties, miniature friendship bracelets, and fashionable pet beds while maintaining a waiting list of stylish animal customers. What a wonderfully fashionable menagerie of clients!",
        microVariants: ["The craft business attracts {favoriteAnimal} customers ordering custom accessories, with {userName} designing tiny {favoriteColor} bow ties and fashionable pet items for a stylish animal clientele!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s craft enterprise grows into a regional creative cooperative employing dozens of young artisans. Their business model is featured in entrepreneurship education programs nationwide, and they receive recognition from the National Young Entrepreneur Association while establishing scholarship funds for creative business development.",
        microVariants: ["{userName}'s craft business becomes a regional cooperative employing young artisans, with their model featured in national entrepreneurship programs and earning Young Entrepreneur Association recognition."]
      },
      {
        type: 'reflective',
        text: "{userName} discovers that entrepreneurship is about more than making money - it's about creating value for others, expressing creativity through purposeful work, and contributing to community prosperity while developing skills that will serve them throughout life. They learn that success includes both financial achievement and personal fulfillment through meaningful work.",
        microVariants: ["{userName} learns that entrepreneurship involves creating value, expressing creativity through purposeful work, and contributing to community prosperity while developing lifelong skills and finding fulfillment through meaningful achievement."]
      }
    ],
    reuse: {
      swappableElements: {
        "craft_products": ["jewelry", "candles", "bookmarks", "decorations", "accessories"],
        "business_skills": ["marketing", "finances", "customer service", "operations", "planning"],
        "success_measures": ["profit", "satisfaction", "growth", "impact", "creativity"]
      },
      weatherVariants: ["productive crafting morning", "busy market day", "planning session afternoon", "celebration evening"],
      settingVariants: ["home workshop", "craft fair booth", "online marketplace", "mentorship meeting"]
    }
  },

  // Template 5: Astronomy and Stargazing (from extensions)
  {
    title: "The Cosmic Discovery Adventure",
    theme: "Science & Wonder",
    level: "Level 3",
    scenes: [
      {
        text: "{userName} was not quite ready for complex science, but fascination with {favoriteColor} nebulae was calling, and sometimes the universe presents us with mysteries that demand exploration even when we feel unprepared for the vast complexity of cosmic phenomena and astronomical discovery.",
        pause: true,
        hook: "What cosmic wonders will capture {userName}'s scientific imagination?",
        microVariants: {
          text: "{userName} was not quite ready for complex science, but fascination with {favoriteColor} nebulae was calling, and sometimes the universe presents mysteries demanding exploration despite feeling unprepared.",
          alternatives: ["Though {userName} felt unprepared for advanced science, attraction to {favoriteColor} nebulae beckoned, demonstrating how cosmic mysteries compel exploration regardless of initial readiness for astronomical complexity."],
          optionalDetails: ["The first glimpse of nebulae came through a small telescope at a school science night.", "Online astronomy images revealed the spectacular colors and structures of deep space objects.", "Local astronomy clubs welcomed beginners and provided guidance for cosmic exploration."]
        }
      },
      {
        text: "But slowly, things began to change as they learned constellation names and imagined {favoriteAnimal} shapes in star patterns while developing understanding of celestial navigation, seasonal sky changes, and the cultural mythology that connects human civilizations across time through shared observation of astronomical phenomena.",
        pause: false,
        hook: "",
        microVariants: {
          text: "But slowly, things began to change as they learned constellation names and imagined {favoriteAnimal} shapes in star patterns while developing understanding of celestial navigation and cultural mythology.",
          alternatives: ["Gradually, circumstances evolved as {userName} mastered constellation identification and visualized {favoriteAnimal} forms in stellar arrangements while building knowledge of navigation and cross-cultural astronomical traditions."],
          optionalDetails: ["Star charts and mobile apps helped identify constellations visible from their geographic location.", "Cultural stories from different civilizations revealed diverse interpretations of the same star patterns.", "Seasonal observations documented how the night sky changes throughout the year."]
        }
      },
      {
        text: "Sometimes the best things happen when you witness unforgettable meteor shower spectacles while eating {favoriteFood}, creating magical moments that combine scientific wonder with personal experience and demonstrate how astronomical events connect individual observers to the vast cosmic processes occurring throughout the universe.",
        pause: true,
        hook: "What spectacular astronomical events will {userName} witness and document?",
        microVariants: {
          text: "Sometimes the best things happen when you witness unforgettable meteor shower spectacles while eating {favoriteFood}, creating magical moments combining scientific wonder with personal experience.",
          alternatives: ["The most meaningful experiences occur during spectacular meteor shower observations while enjoying {favoriteFood}, generating magical moments that blend scientific amazement with personal connection to cosmic phenomena."],
          optionalDetails: ["Peak meteor shower viewing required waking up before dawn and traveling to dark sky locations.", "Photography attempts captured some meteor streaks while teaching technical skills.", "Shared viewing experiences with family and friends created lasting memories."]
        }
      },
      {
        text: "That's when {userName} realized the telescope reveals countless invisible stars above their {hobbies} dreams, understanding that optical instruments open new dimensions of cosmic observation while demonstrating how technology extends human perception and enables scientific discovery beyond the limitations of unassisted vision.",
        pause: false,
        hook: "",
        microVariants: {
          text: "That's when {userName} realized the telescope reveals countless invisible stars above their {hobbies} dreams, understanding that optical instruments open new dimensions of cosmic observation beyond unassisted vision.",
          alternatives: ["{userName} discovered that telescopic observation unveils invisible stellar populations above their {hobbies} aspirations, comprehending how optical technology expands cosmic perception beyond natural visual limitations."],
          optionalDetails: ["Different telescope types revealed various cosmic objects from planets to galaxies.", "Light pollution reduction techniques improved observation quality in urban environments.", "Astronomical photography required specialized equipment and technical knowledge."]
        }
      },
      {
        text: "Astronomy club membership connects {userName} with experienced stargazers who share knowledge about telescope operation, astrophotography techniques, and cosmic phenomena identification while providing community support for ongoing learning and exploration of increasingly complex astronomical concepts and observational challenges.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Astronomy club membership connects {userName} with experienced stargazers sharing knowledge about telescopes, astrophotography, and cosmic phenomena while providing community support for ongoing learning.",
          alternatives: ["Club participation links {userName} with veteran astronomers who contribute expertise in telescope operation, cosmic photography, and celestial object identification while offering collaborative support for continued astronomical education."],
          optionalDetails: ["Club meetings featured guest speakers, equipment demonstrations, and group observing sessions.", "Mentorship relationships developed between experienced members and enthusiastic newcomers.", "Organized trips to dark sky sites provided optimal viewing conditions."]
        }
      },
      {
        text: "Scientific research projects emerge as {userName} contributes to citizen science initiatives that monitor variable stars, track asteroid movements, or document aurora activity while learning how amateur astronomers make meaningful contributions to professional astronomical research and cosmic understanding advancement.",
        pause: true,
        hook: "How will {userName}'s citizen science contributions advance astronomical knowledge?",
        microVariants: {
          text: "Scientific research projects emerge as {userName} contributes to citizen science monitoring variable stars, asteroids, or aurora activity while learning how amateurs contribute to professional research.",
          alternatives: ["Research initiatives develop as {userName} participates in citizen science programs tracking stellar variations, asteroid movements, or auroral phenomena while discovering amateur contributions to professional astronomical advancement."],
          optionalDetails: ["Variable star observations contributed data to international astronomical databases.", "Asteroid tracking helped refine orbital calculations and potential impact assessments.", "Aurora photography documented geomagnetic storm effects on upper atmospheric phenomena."]
        }
      },
      {
        text: "Educational outreach becomes a natural extension of astronomical passion as {userName} presents cosmic discoveries to younger students, demonstrates telescope operation at community events, and shares the wonder of astronomical observation while inspiring others to explore scientific inquiry and cosmic curiosity.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Educational outreach becomes a natural extension of astronomical passion as {userName} presents cosmic discoveries to students, demonstrates telescopes, and shares observation wonder while inspiring scientific inquiry.",
          alternatives: ["Community education naturally develops from astronomical enthusiasm as {userName} shares cosmic discoveries with younger students, provides telescope demonstrations, and promotes observational wonder while encouraging scientific exploration."],
          optionalDetails: ["School presentations included interactive demonstrations and hands-on telescope viewing.", "Community star parties attracted families interested in astronomical observation.", "Science fair projects helped younger students explore astronomical topics."]
        }
      },
      {
        text: "Advanced coursework in physics and mathematics becomes more meaningful as {userName} connects classroom learning with real astronomical phenomena, understanding how scientific principles govern cosmic processes and discovering potential career paths in astronomy, astrophysics, space science, or science education fields.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Advanced coursework in physics and mathematics becomes meaningful as {userName} connects classroom learning with astronomical phenomena, understanding scientific principles governing cosmic processes and discovering career paths.",
          alternatives: ["Academic studies in physics and mathematics gain relevance as {userName} relates classroom concepts to observable cosmic phenomena, comprehending scientific principles behind universal processes while exploring astronomical career possibilities."],
          optionalDetails: ["Calculus applications included orbital mechanics and gravitational force calculations.", "Physics concepts explained stellar fusion, electromagnetic radiation, and planetary motion.", "Career exploration included interviews with professional astronomers and astrophysicists."]
        }
      },
      {
        text: "International collaboration opportunities arise through global astronomy networks where {userName} contributes observations to worldwide research projects while developing cross-cultural connections with young astronomers from different countries who share similar cosmic curiosity and scientific dedication to understanding universal phenomena.",
        pause: true,
        hook: "What global astronomical discoveries will result from international collaboration?",
        microVariants: {
          text: "International collaboration opportunities arise through global astronomy networks where {userName} contributes observations to worldwide research while developing connections with young astronomers sharing cosmic curiosity.",
          alternatives: ["Global collaboration possibilities emerge through international astronomical networks as {userName} participates in worldwide research initiatives while building relationships with young astronomers worldwide who share universal scientific curiosity."],
          optionalDetails: ["International Space Station observation coordinated timing with global tracking networks.", "Exoplanet research contributed data to multinational discovery verification efforts.", "Cultural exchange programs connected young astronomers across continents."]
        }
      },
      {
        text: "And {userName} knew everything would be okay - dreams of space exploration grow one star at a time, demonstrating how individual curiosity and dedicated observation contribute to humanity's expanding understanding of cosmic phenomena while inspiring future generations to continue the eternal human quest to comprehend our place in the universe.",
        pause: true,
        hook: "What cosmic mystery will they explore next?",
        microVariants: {
          text: "And {userName} knew everything would be okay - dreams of space exploration grow one star at a time, showing how individual curiosity contributes to expanding cosmic understanding while inspiring future generations.",
          alternatives: ["{userName} understood that space exploration aspirations develop through individual stellar observations, illustrating how personal curiosity advances collective cosmic comprehension while motivating continued universal exploration by future generations."],
          optionalDetails: ["University astronomy programs offered pathways to professional careers in space science.", "Summer internships at observatories provided hands-on research experience.", "Space agency educational programs connected students with current space exploration missions."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every clear night, {userName} sets up their telescope in the quiet backyard, surrounded by the gentle sounds of evening while {favoriteColor} nebulae appear slowly through the eyepiece. The peaceful ritual of cosmic observation brings deep tranquility and connection to the infinite universe that surrounds and embraces all life on Earth.",
        microVariants: ["Each clear night, {userName} observes through their telescope in the peaceful backyard, watching {favoriteColor} nebulae appear while feeling deep tranquility and cosmic connection to the infinite universe."]
      },
      {
        type: 'silly',
        text: "The {favoriteAnimal} become such enthusiastic astronomy assistants that they start helping with telescope setup and constellation identification! Soon the backyard observatory includes specialized {favoriteAnimal} viewing platforms and a {favoriteFood} snack station for late-night cosmic observation sessions. What a wonderfully wild astronomical team!",
        microVariants: ["The {favoriteAnimal} become eager astronomy assistants, helping with telescope setup and creating a backyard observatory with specialized viewing platforms and {favoriteFood} snack stations for cosmic observations!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s astronomical discoveries contribute to a minor planet naming recognition, and their citizen science work leads to a NASA internship. Their educational outreach programs inspire hundreds of young people to pursue STEM careers while their astrophotography appears in national science magazines and educational materials.",
        microVariants: ["{userName}'s astronomical work earns minor planet naming recognition and NASA internship, with their educational programs inspiring STEM careers and astrophotography appearing in national science publications."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that astronomy teaches humility by revealing the vast scale of the universe while demonstrating humanity's remarkable ability to understand cosmic phenomena through careful observation and scientific inquiry. They discover that looking up at stars connects us to ancient human curiosity while inspiring future exploration of infinite cosmic possibilities.",
        microVariants: ["{userName} discovers that astronomy teaches humility about universal scale while demonstrating human capability to understand cosmic phenomena, connecting ancient curiosity with future exploration of infinite possibilities."]
      }
    ],
    reuse: {
      swappableElements: {
        "cosmic_objects": ["nebulae", "galaxies", "planets", "stars", "meteors"],
        "observation_methods": ["telescopes", "photography", "tracking", "measurement", "documentation"],
        "scientific_outcomes": ["discovery", "education", "research", "collaboration", "inspiration"]
      },
      weatherVariants: ["perfect stargazing night", "meteor shower peak", "planetary alignment", "aurora display evening"],
      settingVariants: ["backyard observatory", "dark sky site", "astronomy club", "science center"]
    }
  },

  // Template 6: Community Garden Project
  {
    title: "The Neighborhood Food Security Initiative",
    theme: "Sustainability & Community Building",
    level: "Level 3",
    scenes: [
      {
        text: "When {userName} noticed that many families in their neighborhood struggled with access to fresh, affordable produce, they began researching food deserts, agricultural solutions, and community organizing strategies that could address local food security challenges while building stronger neighborhood connections and environmental sustainability practices.",
        pause: true,
        hook: "How will {userName} organize the community to address food access challenges?",
        microVariants: {
          text: "When {userName} noticed neighborhood families struggling with fresh produce access, they researched food deserts, agricultural solutions, and organizing strategies addressing food security while building community connections.",
          alternatives: ["Upon observing local families' difficulties accessing affordable fresh produce, {userName} investigated food desert issues, agricultural alternatives, and community organizing approaches that could enhance food security and neighborhood cohesion."],
          optionalDetails: ["Food desert research revealed that the nearest full-service grocery store was over two miles away.", "Community surveys documented families' struggles with transportation and produce affordability.", "Municipal data showed the neighborhood qualified for federal food security improvement grants."]
        }
      },
      {
        text: "Community organizing begins with door-to-door conversations where {userName} listens to neighbors' experiences with food access, transportation challenges, and economic barriers while learning about diverse cultural food traditions and discovering shared interests in gardening, cooking, and community self-reliance that could support collaborative solutions.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Community organizing begins with door-to-door conversations where {userName} listens to neighbors' food access experiences, transportation challenges, and discovers shared interests in gardening and community self-reliance.",
          alternatives: ["Grassroots organization commences through neighborhood conversations as {userName} documents residents' food access struggles, mobility limitations, and uncovers common interests in agricultural self-sufficiency and collaborative problem-solving."],
          optionalDetails: ["Multilingual surveys ensured all community members could participate regardless of language barriers.", "Elderly residents shared knowledge about historical neighborhood food production.", "Young families expressed enthusiasm for involving children in food growing and preparation."]
        }
      },
      {
        text: "Vacant lot identification and property research reveal opportunities to establish community gardens on underutilized urban spaces while {userName} learns about land use policies, zoning regulations, property ownership patterns, and the bureaucratic processes required to transform neglected areas into productive community resources.",
        pause: true,
        hook: "What bureaucratic challenges will {userName} navigate to secure garden space?",
        microVariants: {
          text: "Vacant lot identification and property research reveal community garden opportunities on underutilized spaces while {userName} learns about land use policies, zoning, and bureaucratic processes for transformation.",
          alternatives: ["Available land research and property investigation uncover community garden potential in unused urban areas as {userName} studies municipal policies, regulatory requirements, and administrative procedures for space conversion."],
          optionalDetails: ["City planning department meetings provided information about land use applications.", "Environmental assessments were required to test soil quality and contamination levels.", "Legal documentation included liability insurance and community garden licensing requirements."]
        }
      },
      {
        text: "Soil testing and environmental assessment become essential steps as {userName} collaborates with university extension services and environmental organizations to evaluate growing conditions while learning about soil chemistry, contamination remediation, and sustainable gardening practices that can produce safe, nutritious food in urban environments.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Soil testing and environmental assessment become essential as {userName} collaborates with extension services and environmental groups to evaluate growing conditions and learn sustainable practices for urban food production.",
          alternatives: ["Environmental evaluation and soil analysis prove crucial as {userName} partners with academic extension programs and environmental organizations to assess cultivation potential while mastering sustainable urban agriculture techniques."],
          optionalDetails: ["Lead contamination testing was critical due to the neighborhood's proximity to former industrial sites.", "Compost creation workshops taught residents how to improve soil quality naturally.", "Raised bed construction provided solutions for areas with poor soil conditions."]
        }
      },
      {
        text: "Grant writing and fundraising efforts teach {userName} about nonprofit organization, project management, and resource development while building partnerships with local businesses, religious institutions, and community organizations that can provide financial support, volunteer labor, and ongoing program sustainability for the garden initiative.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Grant writing and fundraising teach {userName} about nonprofit organization, project management, and resource development while building partnerships providing financial support and volunteer labor for garden sustainability.",
          alternatives: ["Funding development and grant applications educate {userName} in nonprofit management, project coordination, and resource acquisition while establishing partnerships that contribute financial backing and volunteer support for long-term initiative sustainability."],
          optionalDetails: ["Foundation grants required detailed project proposals and community impact assessments.", "Local business partnerships provided tools, materials, and volunteer employee participation.", "Faith-based organizations contributed meeting spaces and volunteer coordination."]
        }
      },
      {
        text: "Educational programming development creates opportunities for {userName} to design workshops on gardening techniques, nutrition education, food preservation, and cooking skills while incorporating cultural food traditions and intergenerational knowledge sharing that strengthens community bonds and preserves traditional agricultural wisdom.",
        pause: true,
        hook: "How will educational programs build community knowledge and cultural connections?",
        microVariants: {
          text: "Educational programming creates opportunities for {userName} to design workshops on gardening, nutrition, food preservation, and cooking while incorporating cultural traditions and intergenerational knowledge sharing.",
          alternatives: ["Program development enables {userName} to create educational workshops covering agricultural techniques, nutritional awareness, preservation methods, and culinary skills while integrating cultural practices and cross-generational wisdom exchange."],
          optionalDetails: ["Seasonal workshops matched gardening activities with appropriate learning opportunities.", "Cultural cooking classes featured traditional recipes using garden produce.", "Children's programming included garden-based science lessons and environmental education."]
        }
      },
      {
        text: "Harvest distribution systems require {userName} to organize equitable food sharing protocols, coordinate volunteer schedules for garden maintenance, and establish systems for preserving surplus produce while learning about food safety regulations and community-supported agriculture models that ensure fair access to fresh food.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Harvest distribution systems require {userName} to organize equitable food sharing, coordinate volunteer schedules, and establish surplus preservation while learning food safety and community-supported agriculture models.",
          alternatives: ["Food distribution organization demands that {userName} develop fair sharing protocols, manage volunteer coordination, and create surplus preservation systems while studying food safety requirements and community agriculture approaches."],
          optionalDetails: ["Harvest shares were allocated based on family size and volunteer contributions to garden maintenance.", "Food preservation workshops taught canning, freezing, and dehydration techniques.", "Community kitchen access allowed for bulk food processing and meal preparation."]
        }
      },
      {
        text: "Policy advocacy emerges as {userName} testifies at city council meetings about urban agriculture ordinances, zoning changes that support community food production, and municipal policies that can address systemic food access issues while representing community voices in local government decision-making processes.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Policy advocacy emerges as {userName} testifies at city council meetings about urban agriculture ordinances and zoning changes supporting community food production while representing community voices in government.",
          alternatives: ["Municipal advocacy develops as {userName} addresses city council regarding agricultural ordinances, supportive zoning modifications, and food access policies while articulating community perspectives in local governmental decision-making."],
          optionalDetails: ["Public testimony required preparation of research data and community impact documentation.", "Zoning changes would permit food production in previously restricted residential areas.", "Policy recommendations included tax incentives for community food production initiatives."]
        }
      },
      {
        text: "Regional recognition and replication opportunities arise as {userName} presents the garden project at conferences, writes articles for community development publications, and mentors other young organizers who want to establish similar food security initiatives in their own neighborhoods and communities.",
        pause: true,
        hook: "How will the model expand to address food security in other communities?",
        microVariants: {
          text: "Regional recognition and replication opportunities arise as {userName} presents at conferences, writes publications, and mentors other organizers establishing similar food security initiatives in their communities.",
          alternatives: ["Broader acknowledgment and expansion possibilities develop as {userName} delivers conference presentations, contributes to community development literature, and guides emerging organizers implementing comparable food security programs regionally."],
          optionalDetails: ["Conference presentations reached urban planners, social workers, and community organizers.", "Published articles appeared in academic journals and practitioner publications.", "Mentorship relationships developed with high school students in neighboring communities."]
        }
      },
      {
        text: "Long-term sustainability planning ensures that {userName}'s food security initiative will continue serving the community for years to come while teaching valuable lessons about grassroots organizing, environmental stewardship, and the power of collective action to address systemic challenges through locally-controlled, culturally-appropriate solutions that strengthen community resilience.",
        pause: true,
        hook: "What other community challenges will this organizing experience help address?",
        microVariants: {
          text: "Long-term sustainability planning ensures {userName}'s initiative will continue serving the community while teaching lessons about grassroots organizing, environmental stewardship, and collective action addressing systemic challenges.",
          alternatives: ["Sustainable program planning guarantees {userName}'s food security project's continued community service while providing education in grassroots organization, environmental responsibility, and collaborative approaches to addressing structural problems through local solutions."],
          optionalDetails: ["Succession planning identified and trained community leaders to continue the program.", "Financial sustainability included diversified funding sources and revenue-generating activities.", "Evaluation metrics documented community health improvements and social cohesion benefits."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every harvest morning, {userName} walks through the thriving community garden while neighbors gather {favoriteColor} vegetables and children learn about growing their own food. The gentle sounds of conversation in multiple languages and the satisfaction of shared abundance create a peaceful sense of community cooperation and food security.",
        microVariants: ["Each harvest morning, {userName} strolls through the flourishing garden while neighbors collect {favoriteColor} vegetables and children learn food growing, creating peaceful community cooperation and food security."]
      },
      {
        type: 'silly',
        text: "The community garden becomes so productive that {favoriteAnimal} from the entire city start making pilgrimages to taste the amazing vegetables! Soon {userName} has to establish a special {favoriteAnimal} section with tiny garden plots and {favoriteFood} composting stations. What a wonderfully wild agricultural paradise!",
        microVariants: ["The garden attracts {favoriteAnimal} from across the city seeking amazing vegetables, requiring {userName} to create special animal garden plots with {favoriteFood} composting - a wild agricultural paradise!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s food security model is adopted by cities nationwide, and their organizing work leads to federal policy changes supporting urban agriculture. They receive recognition from the Department of Agriculture and establish a foundation funding community food security initiatives led by young organizers across the country.",
        microVariants: ["{userName}'s food security model spreads nationwide, leading to federal urban agriculture policies, Department of Agriculture recognition, and a foundation funding youth-led community food initiatives."]
      },
      {
        type: 'reflective',
        text: "{userName} learns that food security is about more than growing vegetables - it's about community self-determination, cultural preservation, and economic justice. They discover that when communities control their own food systems, they build power to address other challenges while creating healthier, more resilient neighborhoods where everyone can thrive.",
        microVariants: ["{userName} discovers that food security involves community self-determination, cultural preservation, and economic justice, with local food control building power to address challenges and create resilient thriving neighborhoods."]
      }
    ],
    reuse: {
      swappableElements: {
        "food_access_solutions": ["gardens", "markets", "cooperatives", "pantries", "kitchens"],
        "organizing_strategies": ["surveys", "meetings", "advocacy", "partnerships", "education"],
        "community_outcomes": ["nutrition", "cooperation", "empowerment", "sustainability", "resilience"]
      },
      weatherVariants: ["perfect planting morning", "harvest celebration day", "community meeting evening", "garden workday afternoon"],
      settingVariants: ["community garden", "neighborhood meetings", "city hall", "educational workshops"]
    }
  }

  // Continue with remaining 4 templates...
];