// Level 3 Template: Space Mission Adventure
export const template = {
  title: "The Junior Astronaut Space Mission",
  theme: "Space Exploration & Scientific Discovery",
  level: "Level 3", 
  scenes: [
    {
      text: "{userName} wins a contest to attend Space Camp, where they learn about rocket science, astronomy, and what it takes to be an astronaut. During the final week, their team is chosen for a special simulation mission to Mars using NASA's most advanced virtual reality technology. {userName} feels excited but nervous about being the mission's {favoriteColor} suit specialist.",
      pause: true,
      hook: "What challenges will {userName} face during their simulated Mars mission?",
      microVariants: {
        text: "{userName} wins a contest to attend Space Camp and gets selected for an advanced Mars simulation mission.",
        alternatives: ["Space Camp culminates in {userName} being chosen for a realistic Mars mission simulation using cutting-edge technology."],
        optionalDetails: ["the VR technology feels incredibly realistic", "mission control monitors every decision they make"]
      }
    },
    {
      text: "The simulation begins with {userName} and their team launching in a virtual spacecraft. As they travel through space, they encounter a real problem - the simulation's computer system starts malfunctioning, and the instructors realize the kids are trapped in a hyper-realistic virtual environment. {userName} must use their knowledge of {hobbies} and teamwork skills to help navigate both the simulated Mars mission and the real technical emergency.",
      pause: true,
      hook: "How can {userName} solve problems in both virtual and real worlds simultaneously?",
      microVariants: {
        text: "A computer malfunction traps {userName} in a hyper-realistic simulation, requiring both virtual mission skills and real problem-solving.",
        alternatives: ["Technical difficulties blur the lines between simulation and reality as {userName} faces dual challenges."],
        optionalDetails: ["the virtual Mars environment becomes unpredictable", "real-world technicians work frantically outside"]
      }
    },
    {
      text: "On virtual Mars, {userName}'s team discovers what appears to be evidence of ancient life - tiny {favoriteColor} crystals that seem to pulse with energy. Meanwhile, in the real world, {userName} realizes the computer malfunction might be connected to their {favoriteAnimal}-shaped good luck charm, which contains a rare mineral that's interfering with the electronics. They face a difficult choice: remove the charm to fix the system, or keep it to maintain their confidence for the mission.",
      pause: true,
      hook: "Should {userName} sacrifice their good luck charm to save the mission?",
      microVariants: {
        text: "{userName} discovers their good luck charm is causing the malfunction while their team finds mysterious crystals on virtual Mars.",
        alternatives: ["A difficult choice emerges between keeping personal confidence and fixing the technical crisis."],
        optionalDetails: ["the crystals seem to respond to the charm somehow", "team members are counting on {userName}'s leadership"]
      }
    },
    {
      text: "{userName} decides to use the charm's unusual properties to their advantage. By positioning it carefully near the computer sensors, they discover they can actually enhance the simulation's capabilities, making it more realistic and educational. The virtual Mars crystals turn out to be teaching tools that activate when exposed to the charm's mineral composition, creating an incredible learning experience about astrobiology and space exploration.",
      pause: true,
      hook: "What amazing discoveries will this enhanced simulation reveal?",
      microVariants: {
        text: "Clever problem-solving transforms the malfunction into an enhanced learning opportunity about space science and astrobiology.",
        alternatives: ["{userName}'s creative thinking turns a technical crisis into an advanced educational experience for everyone."],
        optionalDetails: ["the enhanced simulation reveals details about real Mars missions", "other students gather to observe the breakthrough"]
      }
    },
    {
      text: "The NASA instructors are amazed by {userName}'s innovative problem-solving and invite them to participate in a real astronaut training program when they're older. The simulation concludes successfully with {userName}'s team 'landing' safely on virtual Mars and sharing their discoveries about the {favoriteColor} crystals with mission control. {userName} realizes that real space exploration requires both scientific knowledge and creative thinking.",
      pause: true,
      hook: "How will this space camp experience inspire {userName}'s future career dreams?",
      microVariants: {
        text: "NASA instructors recognize {userName}'s potential and offer future astronaut training opportunities after their successful problem-solving.",
        alternatives: ["The successful mission conclusion opens doors to advanced space program participation for talented {userName}."],
        optionalDetails: ["other space agencies hear about the innovative simulation", "local media interviews {userName} about their experience"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName} becomes the youngest person ever accepted into NASA's junior astronaut program, eventually becoming a real space explorer who discovers new worlds and shares their knowledge with students around the globe.",
      microVariants: ["NASA junior astronaut program acceptance leads to {userName} becoming a real space explorer and educator.", "{userName}'s space career inspires a new generation of young scientists and explorers worldwide."]
    },
    {
      type: 'cozy',
      text: "{userName} returns home with a deep love of astronomy and science, starting a space club at school where they teach other kids about planets, stars, and the importance of creative problem-solving in scientific exploration.",
      microVariants: ["The space club becomes a place where {userName} shares their passion for astronomy and creative thinking.", "Teaching others about space exploration helps {userName} continue their learning while inspiring classmates."]
    }
  ],
  reuse: {
    swappableElements: {
      "space_destinations": ["Mars", "the Moon", "Jupiter's moons", "asteroid belt"],
      "space_discoveries": ["ancient crystals", "water ice", "unusual minerals", "signs of life"],
      "astronaut_roles": ["mission specialist", "pilot", "engineer", "scientist"]
    },
    weatherVariants: ["during summer space camp", "in the advanced simulation lab", "during mission training", "at graduation ceremony"],
    settingVariants: ["NASA space center", "virtual reality lab", "mission control room", "astronaut training facility"]
  }
};