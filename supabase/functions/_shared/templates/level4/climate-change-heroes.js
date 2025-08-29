// Level 4 Template: Climate Change Heroes
export const template = {
  title: "Climate Change Heroes",
  theme: "Environmental Activism & Global Responsibility",
  level: "Level 4",
  scenes: [
    {
      text: "{userName} lives in a coastal town where rising sea levels have already flooded three neighborhoods in the past year. When their school announces a climate action competition, {userName} teams up with Maya, whose family immigrated after drought destroyed their farm, and Alex, whose {favoriteAnimal} rescue center keeps receiving animals displaced by extreme weather.",
      pause: true,
      hook: "How can three teenagers tackle a global crisis that adults have failed to solve?",
      microVariants: {
        text: "{userName} witnesses climate impacts firsthand and joins classmates whose families have been directly affected by environmental changes.",
        alternatives: ["Personal experience with climate change motivates {userName} to collaborate with peers facing similar environmental challenges."],
        optionalDetails: ["flood barriers protect the school but not all homes", "drought refugees arrive weekly in their community"]
      }
    },
    {
      text: "Researching solutions, the team discovers that their town sits on one of the world's largest underground {favoriteColor} mineral deposits, which could be mined to create advanced solar panels. However, the mining would destroy the local ecosystem that's already stressed from climate change, including the habitat where Alex's rescued {favoriteAnimal} are being rehabilitated.",
      pause: true,
      hook: "Should they sacrifice local environment to create technology that could help global climate change?",
      microVariants: {
        text: "The team faces a complex dilemma between local environmental protection and global climate solutions.",
        alternatives: ["Mining valuable minerals for clean energy technology conflicts with protecting their already damaged local ecosystem."],
        optionalDetails: ["the mining would employ displaced families but destroy wildlife habitats", "solar panel production could help reduce global emissions"]
      }
    },
    {
      text: "The team's research catches the attention of Dr. Patel, a climate scientist who reveals that their community has been chosen as a test site for 'climate adaptation versus mitigation' strategies. Half the town supports mining for global solar panel production, while the other half wants to focus on protecting and restoring local ecosystems as carbon sinks.",
      pause: true,
      hook: "How can a divided community make decisions that affect both local and global environments?",
      microVariants: {
        text: "Community division over climate strategies forces the team to navigate complex local politics while addressing global environmental concerns.",
        alternatives: ["Scientific attention brings both opportunities and political pressure as the town becomes a climate policy battleground."],
        optionalDetails: ["town hall meetings become heated debates", "national media starts covering their local controversy"]
      }
    },
    {
      text: "Maya's experience with {hobbies} gives her an idea: what if they could create a hybrid solution that mines the minerals using new techniques that actually improve soil quality for ecosystem restoration? Working with Dr. Patel, the team designs a proposal for 'regenerative mining' that could produce solar materials while creating better habitats for Alex's animals.",
      pause: true,
      hook: "Can innovative thinking find solutions that serve both local and global environmental needs?",
      microVariants: {
        text: "Creative problem-solving through {hobbies} skills leads to innovative approaches that address multiple environmental challenges simultaneously.",
        alternatives: ["Maya's unique perspective helps develop breakthrough solutions that could satisfy both community factions and environmental needs."]  ,
        optionalDetails: ["the technique could be replicated worldwide", "early tests show promise for soil restoration"]
      }
    },
    {
      text: "The team's presentation to the town council draws national attention when their regenerative mining proposal is endorsed by both environmental groups and clean energy advocates. However, {userName} struggles with the pressure of being seen as a 'climate hero' when they know that systemic change requires more than individual innovation - it needs global cooperation and policy changes.",
      pause: true,
      hook: "How do young environmental leaders balance personal recognition with the need for collective action?",
      microVariants: {
        text: "National recognition for their innovative solution brings pressure as {userName} realizes individual achievements can't solve systemic global problems.",
        alternatives: ["Success creates new challenges as {userName} learns that being labeled a 'climate hero' comes with complex responsibilities and expectations."],
        optionalDetails: ["media attention brings both supporters and critics", "other communities request similar solutions"]
      }
    },
    {
      text: "The regenerative mining project attracts international investment, but {userName} discovers that scaling their local solution globally requires navigating complex international politics, economic systems, and cultural differences. Working with their team and Dr. Patel, they learn that environmental solutions must address social justice issues to be truly sustainable.",
      pause: true,
      hook: "How can environmental innovations address both climate change and social inequality simultaneously?",
      microVariants: {
        text: "Global scaling of environmental solutions reveals interconnections between climate action and social justice that require comprehensive approaches.",
        alternatives: ["International expansion teaches {userName} that effective environmental action must simultaneously address economic inequality and cultural differences."],
        optionalDetails: ["mining communities need economic transitions that protect both workers and environments", "different regions require culturally appropriate adaptations of the technology"]
      }
    },
    {
      text: "Maya's insights from {hobbies} help the team develop community-ownership models where local populations control and benefit from environmental technologies rather than being displaced by them. They establish partnerships with other youth climate activists worldwide to ensure that environmental solutions strengthen rather than exploit vulnerable communities.",
      pause: true,
      hook: "How can environmental technology empower rather than displace the communities it's meant to help?",
      microVariants: {
        text: "Community ownership models ensure that environmental technologies serve local populations while advancing global climate goals.",
        alternatives: ["International youth partnerships demonstrate how environmental justice requires economic empowerment alongside technological innovation."],
        optionalDetails: ["local communities receive training and ownership shares in environmental technology projects", "youth climate networks share successful community-empowerment strategies globally"]
      }
    },
    {
      text: "The team faces opposition from both traditional extractive industries and some environmental groups who argue that any mining, even regenerative, compromises ecosystem integrity. {userName} must learn to navigate criticism while maintaining commitment to solutions that balance environmental protection with economic realities faced by displaced climate refugees.",
      pause: true,
      hook: "How do climate activists address legitimate concerns while advancing imperfect but necessary solutions?",
      microVariants: {
        text: "Opposition from multiple directions requires {userName} to defend nuanced solutions that acknowledge environmental protection and economic justice complexities.",
        alternatives: ["Criticism from both industry and environmental groups teaches {userName} about the challenges of advocating for pragmatic approaches to climate action."],
        optionalDetails: ["some environmental purists oppose any form of mining regardless of its regenerative potential", "industry groups attempt to co-opt the regenerative mining concept for traditional extraction"]
      }
    },
    {
      text: "Dr. Patel helps the team understand that climate activism requires building coalitions across different perspectives and interests. {userName} learns to facilitate conversations between environmental advocates, displaced communities, traditional workers, and indigenous groups to develop solutions that address everyone's concerns while prioritizing planetary survival.",
      pause: true,
      hook: "What leadership skills help climate activists build coalitions across different communities and interests?",
      microVariants: {
        text: "Coalition building across diverse groups teaches {userName} essential skills for effective climate leadership and inclusive environmental advocacy.",
        alternatives: ["Learning to facilitate multi-stakeholder conversations prepares {userName} for the complex collaborative work that climate solutions require."],
        optionalDetails: ["indigenous communities share traditional knowledge that enhances regenerative mining approaches", "displaced workers contribute practical insights about economic transition needs"]
      }
    },
    {
      text: "As their regenerative mining model spreads globally, {userName} and their team establish the International Youth Climate Justice Network, connecting young environmental leaders who prioritize both planetary health and social equity. They discover that the most effective climate action emerges from diverse perspectives working together across cultural and economic differences.",
      pause: true,
      hook: "How can global youth climate movements maintain local relevance while building international solidarity?",
      microVariants: {
        text: "Global youth climate organizing teaches {userName} about maintaining cultural relevance while building international environmental justice movements.",
        alternatives: ["International climate justice work demonstrates how local environmental solutions contribute to global movements while respecting diverse community needs."],
        optionalDetails: ["the network facilitates technology sharing between communities facing similar environmental challenges", "youth climate leaders develop culturally specific approaches to environmental activism"]
      }
    },
    {
      text: "Two years into running the International Youth Climate Justice Network, {userName} faces the challenge of maintaining momentum as initial enthusiasm wanes and the daily work of environmental organizing becomes routine. Some regional coordinators burn out from the pressure, while others struggle with limited funding for community projects. {userName} learns that sustainable activism requires building systems that support long-term commitment rather than relying on short-term inspiration.",
      pause: true,
      hook: "How do environmental movements sustain themselves beyond initial enthusiasm and media attention?",
      microVariants: {
        text: "Long-term network management teaches {userName} about the practical challenges of sustaining global environmental movements through ordinary work periods.",  
        alternatives: ["The reality of ongoing climate organization reveals how successful movements must evolve beyond initial excitement to support sustained community engagement."],
        optionalDetails: ["regional groups develop different approaches to maintaining volunteer energy", "funding challenges require innovative resource-sharing between communities"]
      }
    },
    {
      text: "Three years after their initial presentation, {userName} reflects on how their local regenerative mining project has evolved into a global movement for community-controlled environmental technology. They understand that climate heroism isn't about individual recognition, but about creating systems that empower communities to develop their own environmental solutions.",
      pause: true,
      hook: "What lasting impact do young environmental leaders create when they prioritize community empowerment over personal recognition?",
      microVariants: {
        text: "Long-term impact assessment reveals how community empowerment approaches create sustainable environmental movements that outlast individual leadership.",
        alternatives: ["The evolution from local project to global movement demonstrates how effective climate activism builds capacity for ongoing community-led environmental action."],
        optionalDetails: ["communities worldwide adapt regenerative technologies to their specific environmental and cultural contexts", "the movement continues expanding as local communities train and support each other"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName}, Maya, and Alex establish the Global Youth Climate Innovation Network, connecting young environmental leaders worldwide to develop community-specific solutions while advocating for systemic policy changes.",
      microVariants: ["The network becomes a model for youth-led environmental innovation and global cooperation.", "Their local success scales into international climate action led by young people with diverse expertise."]
    },
    {
      type: 'reflective',
      text: "{userName} continues working on climate solutions while understanding that environmental heroism isn't about individual glory - it's about persistent collaboration, innovation, and the courage to keep working on problems bigger than any one person can solve.",
      microVariants: ["Daily environmental work teaches {userName} that heroism comes from sustained effort rather than dramatic moments.", "The ongoing nature of climate work helps {userName} find purpose in contribution rather than recognition."]
    },
    {
      type: 'cozy',
      text: "{userName} returns to their coastal community regularly to work with local environmental projects, finding joy in hands-on conservation work and mentoring younger students while maintaining global connections through the climate justice network.",
      microVariants: ["Local environmental work provides grounding and purpose while maintaining connections to global climate action.", "Mentoring younger environmental activists helps {userName} share practical skills while continuing their own learning."]
    },
    {
      type: 'silly',
      text: "{userName}'s regenerative mining technique works so well that {favoriteAnimal} populations start helping with the mining process! The world's first {favoriteColor} Animal-Human Mining Cooperative becomes a model for environmental technology that makes both conservation and energy production wonderfully fun.",
      microVariants: ["Interspecies cooperation in environmental technology creates surprisingly effective and joyful conservation partnerships.", "The most successful environmental solutions combine serious innovation with delightfully unexpected {favoriteAnimal} collaboration."]
    }
  ],
  reuse: {
    swappableElements: {
      "climate_impacts": ["flooding", "drought", "extreme storms", "heat waves"],
      "environmental_solutions": ["renewable energy", "ecosystem restoration", "carbon capture", "sustainable agriculture"],
      "community_conflicts": ["economic versus environmental priorities", "local versus global benefits", "traditional versus innovative approaches", "short-term versus long-term thinking"],
      "youth_innovations": ["regenerative mining", "community solar", "habitat corridors", "climate adaptation technology"]
    },
    weatherVariants: ["during climate adaptation planning", "after extreme weather events", "during community decision meetings", "at innovation showcases"],
    settingVariants: ["coastal communities", "drought-affected regions", "climate research centers", "town council chambers"],
    randomSeed: 126
  }
};