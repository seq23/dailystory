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
    },
    {
      text: "Mrs. Chen rewards the Mystery Club with homemade cookies and asks if they would help her create a neighborhood pet safety program. She wants to make sure all the pets stay safe while still having fun exploring. {userName} suggests they make {favoriteColor} identification tags and a map showing which yards are pet-friendly.",
      pause: true,
      hook: "How will the pet safety program help the neighborhood?",
      microVariants: {
        text: "Mrs. Chen rewards the Mystery Club with homemade cookies and asks if they would help her create a neighborhood pet safety program. She wants to make sure all the pets stay safe while still having fun exploring. {userName} suggests they make {favoriteColor} identification tags and a map showing which yards are pet-friendly.",
        alternatives: ["Cookie rewards lead to an important new project helping pets stay safe during their neighborhood adventures.", "The successful mystery solving expands into a community service project that protects local pets."],
        optionalDetails: ["the cookies are still warm and smell amazing", "other neighbors offer to help with the safety program"]
      }
    },
    {
      text: "The friends work together to visit every house on their street, talking to neighbors about pet safety and creating a neighborhood directory. Mr. Rodriguez offers to help by building safe feeding stations, and other neighbors volunteer to share their yards with pets who need more space to play and exercise.",
      pause: true,
      hook: "What other neighborhood improvements will their teamwork inspire?",
      microVariants: {
        text: "The friends work together to visit every house on their street, talking to neighbors about pet safety and creating a neighborhood directory. Mr. Rodriguez offers to help by building safe feeding stations, and other neighbors volunteer to share their yards with pets who need more space to play and exercise.",
        alternatives: ["Door-to-door visits build community connections as neighbors join the pet safety initiative.", "The Mystery Club discovers that solving one problem leads to neighbors working together on many improvements."],
        optionalDetails: ["they create a detailed map with photos and contact information", "some neighbors offer special treats for visiting pets"]
      }
    },
    {
      text: "During their final neighborhood meeting, the Mystery Club presents their complete pet safety plan to everyone. {userName} feels proud as neighbors congratulate their team for bringing the community together. Even Snowball and the raccoon family attend the meeting, peacefully sharing {favoriteFood} snacks in Mrs. Chen's backyard.",
      pause: true,
      hook: "How has solving mysteries changed {userName} and their friends?",
      microVariants: {
        text: "During their final neighborhood meeting, the Mystery Club presents their complete pet safety plan to everyone. {userName} feels proud as neighbors congratulate their team for bringing the community together. Even Snowball and the raccoon family attend the meeting, peacefully sharing {favoriteFood} snacks in Mrs. Chen's backyard.",
        alternatives: ["The presentation showcases how detective work has brought the entire neighborhood together for a common cause.", "Animals and humans gather peacefully to celebrate the Mystery Club's success in creating community cooperation."],
        optionalDetails: ["neighbors applaud the professional presentation", "the raccoons keep a respectful distance but seem curious about the meeting"]
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
    },
    {
      type: 'reflective',
      text: "{userName} realizes that the best mysteries aren't about finding clues - they're about bringing people together and making everyone feel cared for. The detective skills help them understand that community problems need community solutions.",
      microVariants: ["Mystery solving teaches {userName} that cooperation and caring are more valuable than individual detective work.", "The club's success shows {userName} how working together makes neighborhoods stronger and friendlier."]
    },
    {
      type: 'silly',
      text: "The Mystery Club becomes so good at solving animal mysteries that they're hired by the local zoo! {userName} and friends spend their weekends helping zookeepers understand why the {favoriteAnimal} keeps rearranging its habitat into {favoriteColor} patterns.",
      microVariants: ["Zoo animals create their own mysteries that only {userName}'s experienced Mystery Club can solve.", "Professional animal detective work becomes the friends' favorite weekend activity at the local zoo."]
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