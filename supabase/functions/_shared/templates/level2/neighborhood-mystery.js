// Level 2 Template: Neighborhood Mystery
export const template = {
  title: "The Neighborhood Mystery Club",
  theme: "Teamwork & Investigation", 
  level: "Level 2",
  scenes: [
    {
      text: "{userName} and their friends Alex and Emma discover that several neighbors have been reporting strange things happening in their yards. Mrs. Chen's garden gnomes keep moving positions overnight, and Mr. Rodriguez's bird feeder is mysteriously empty every morning despite being full the day before.",
      pause: true,
      hook: "What mysterious force is causing these neighborhood puzzles?",
      microVariants: {
        text: "{userName} and their friends Alex and Emma discover that several neighbors have been reporting strange things happening in their yards. Mrs. Chen's garden gnomes keep moving positions overnight, and Mr. Rodriguez's bird feeder is mysteriously empty every morning despite being full the day before.",
        alternatives: ["Strange neighborhood happenings catch the attention of {userName} and their detective friends.", "Garden gnomes and empty bird feeders create mysteries that {userName}'s group wants to solve."],
        optionalDetails: ["the gnomes appear in different spots each morning", "bird seed disappears completely overnight"]
      }
    },
    {
      text: "The three friends decide to form the Neighborhood Mystery Club and create a plan to solve these puzzling cases. They make observation schedules, design detective notebooks, and even create {favoriteColor} detective badges. {userName} suggests they start by watching Mr. Rodriguez's bird feeder from Emma's bedroom window, which has a perfect view.",
      pause: true,
      hook: "What will their nighttime surveillance reveal?",
      microVariants: {
        text: "The three friends decide to form the Neighborhood Mystery Club and create a plan to solve these puzzling cases. They make observation schedules, design detective notebooks, and even create {favoriteColor} detective badges. {userName} suggests they start by watching Mr. Rodriguez's bird feeder from Emma's bedroom window, which has a perfect view.",
        alternatives: ["Forming an official mystery club gives {userName} and friends structure for their investigation.", "Detective badges and notebooks make {userName}'s team feel like real investigators ready to solve neighborhood mysteries."],
        optionalDetails: ["they practice writing in code", "each friend gets assigned different observation times"]
      }
    },
    {
      text: "During their midnight surveillance, the friends discover a family of raccoons working together to reach the bird feeder. The clever {favoriteAnimal}-sized bandits have figured out how to climb the pole and knock seeds to the ground for their babies. The friends watch in amazement as the raccoon parents teach their young ones how to share the food safely.",
      pause: true,
      hook: "How will the Mystery Club handle this discovery about the neighborhood wildlife?",
      microVariants: {
        text: "During their midnight surveillance, the friends discover a family of raccoons working together to reach the bird feeder. The clever {favoriteAnimal}-sized bandits have figured out how to climb the pole and knock seeds to the ground for their babies. The friends watch in amazement as the raccoon parents teach their young ones how to share the food safely.",
        alternatives: ["Nighttime watching reveals that hungry raccoons are the mysterious bird feeder thieves.", "The friends discover a raccoon family that has learned to work together to get food for their babies."],
        optionalDetails: ["baby raccoons learn by copying their parents", "the raccoons are very gentle and organized"]
      }
    },
    {
      text: "The next mystery leads them to Mrs. Chen's garden, where they use {hobbies} skills to track tiny footprints around the gnomes. Following the trail, they discover that Mrs. Chen's escaped pet {favoriteAnimal}, Snowball, has been moving the gnomes while exploring the garden at night. Snowball seems to be playing a game, arranging the gnomes in different patterns.",
      pause: true,
      hook: "How can they reunite Snowball with Mrs. Chen without getting in trouble?",
      microVariants: {
        text: "The next mystery leads them to Mrs. Chen's garden, where they use {hobbies} skills to track tiny footprints around the gnomes. Following the trail, they discover that Mrs. Chen's escaped pet {favoriteAnimal}, Snowball, has been moving the gnomes while exploring the garden at night. Snowball seems to be playing a game, arranging the gnomes in different patterns.",
        alternatives: ["Detective skills help {userName}'s team track footprints to find the gnome-moving culprit.", "Tiny paw prints lead to Snowball, who has been playing with garden decorations during nighttime adventures."],
        optionalDetails: ["Snowball appears to be creating patterns with the gnomes", "the pet has been missing for three days"]
      }
    },
    {
      text: "{userName} and friends approach Mrs. Chen with their findings, worried she might be upset about Snowball's garden games. Instead, Mrs. Chen is overjoyed to learn that her beloved pet is safe and has been playing nearby. She laughs about the gnome mystery and thanks the Mystery Club for their excellent detective work.",
      pause: true,
      hook: "What reward will the successful detectives receive?",
      microVariants: {
        text: "{userName} and friends approach Mrs. Chen with their findings, worried she might be upset about Snowball's garden games. Instead, Mrs. Chen is overjoyed to learn that her beloved pet is safe and has been playing nearby. She laughs about the gnome mystery and thanks the Mystery Club for their excellent detective work.",
        alternatives: ["Mrs. Chen's relief and gratitude surprise the worried detectives with an unexpectedly positive reaction.", "The Mystery Club's success brings joy to Mrs. Chen, who had been very worried about her missing pet."],
        optionalDetails: ["Mrs. Chen had been posting missing pet signs everywhere", "Snowball runs into Mrs. Chen's arms when called"]
      }
    }
  ],
  endings: [
    {
      type: 'cozy', 
      text: "The Neighborhood Mystery Club becomes the official problem-solvers for their street, helping neighbors with everything from finding lost pets to organizing community gardens. They meet every week in Emma's backyard fort.",
      microVariants: ["Weekly meetings in the backyard fort become the highlight of neighborhood problem-solving.", "The Mystery Club creates a network of neighbors who help each other with daily challenges."]
    },
    {
      type: 'triumphant',
      text: "{userName} and their friends expand the Mystery Club to include kids from other neighborhoods, creating a city-wide network of young problem-solvers who help communities stay connected and safe.",
      microVariants: ["The successful model spreads throughout the city as other children start their own Mystery Clubs.", "Young detectives across the city work together to solve problems and build stronger communities."]
    }
  ],
  reuse: {
    swappableElements: {
      "mysteries": ["missing items", "strange sounds", "moving objects", "mysterious visitors"],
      "locations": ["gardens", "backyards", "porches", "driveways"],
      "neighbors": ["Mrs. Chen", "Mr. Rodriguez", "Ms. Johnson", "Dr. Kim"]
    },
    weatherVariants: ["during summer evenings", "on quiet weekends", "after school hours", "during neighborhood walks"],
    settingVariants: ["suburban neighborhood", "apartment complex", "small town street", "friendly community"]
  }
};