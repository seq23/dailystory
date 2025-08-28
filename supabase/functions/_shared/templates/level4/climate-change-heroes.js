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