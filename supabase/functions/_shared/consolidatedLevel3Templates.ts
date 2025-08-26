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
  }

  // Continue with remaining 4 templates...
];