// Level 3 Template: Space Mission Adventure
export const template = {
  title: "The Junior Astronaut Space Mission",
  theme: "Space Exploration & Scientific Discovery",
  level: "Level 3", 
  scenes: [
    {
      text: "{userName} wins a contest to attend Space Camp, where they learn about rocket science, astronomy, and what it takes to be an astronaut. During the final week, their team is chosen for a special simulation mission to Mars using NASA's most advanced virtual reality technology. {userName} feels excited but nervous about being the mission's {favoriteColor} suit specialist.",
      pause: true,
      hook: "The simulation countdown begins in 3... 2... 1... but something's wrong with the computer systems!",
      microVariants: {
        text: "{userName} wins a contest to attend Space Camp and gets selected for an advanced Mars simulation mission.",
        alternatives: ["Space Camp culminates in {userName} being chosen for a realistic Mars mission simulation using cutting-edge technology."],
        optionalDetails: ["the VR technology creates such realistic sensations that trainees sometimes forget they're in a simulation, leading to panic attacks during emergency scenarios", "mission control monitors every heartbeat and brainwave through advanced biometric sensors, creating intense pressure as instructors debate whether each trainee can handle real space missions"]
      }
    },
    {
      text: "The simulation begins with {userName} and their team launching in a virtual spacecraft. As they travel through space, they encounter a real problem - the simulation's computer system starts malfunctioning, and the instructors realize the kids are trapped in a hyper-realistic virtual environment. {userName} must use their knowledge of {hobbies} and teamwork skills to help navigate both the simulated Mars mission and the real technical emergency.",
      pause: true,
      hook: "Emergency alarms blare as {userName} realizes they can't tell what's simulation and what's real anymore!",
      microVariants: {
        text: "A computer malfunction traps {userName} in a hyper-realistic simulation, requiring both virtual mission skills and real problem-solving.",
        alternatives: ["Technical difficulties blur the lines between simulation and reality as {userName} faces dual challenges."],
        optionalDetails: ["the virtual Mars environment becomes terrifyingly unpredictable with simulated asteroid storms and equipment failures that feel completely real, causing genuine fear and adrenaline", "real-world technicians work frantically outside the simulation chamber while {userName} can hear their worried voices through malfunctioning speakers, creating a surreal blend of virtual danger and real emergency"]
      }
    },
    {
      text: "On virtual Mars, {userName}'s team discovers what appears to be evidence of ancient life - tiny {favoriteColor} crystals that seem to pulse with energy. Meanwhile, in the real world, {userName} realizes the computer malfunction might be connected to their {favoriteAnimal}-shaped good luck charm, which contains a rare mineral that's interfering with the electronics. They face a difficult choice: remove the charm to fix the system, or keep it to maintain their confidence for the mission.",
      pause: true,
      hook: "The crystals start glowing brighter as {userName}'s charm heats up - coincidence or cosmic connection?",
      microVariants: {
        text: "{userName} discovers their good luck charm is causing the malfunction while their team finds mysterious crystals on virtual Mars.",
        alternatives: ["A difficult choice emerges between keeping personal confidence and fixing the technical crisis."],
        optionalDetails: ["the crystals pulse in perfect rhythm with {userName}'s heartbeat, creating an eerie synchronization that suggests the virtual discovery might be detecting something real through the charm's mineral composition", "team members notice {userName}'s hesitation and growing anxiety, with some beginning to panic as the simulation becomes more dangerous and their leader appears paralyzed by an impossible decision"]
      }
    },
    {
      text: "{userName} decides to use the charm's unusual properties to their advantage. By positioning it carefully near the computer sensors, they discover they can actually enhance the simulation's capabilities, making it more realistic and educational. The virtual Mars crystals turn out to be teaching tools that activate when exposed to the charm's mineral composition, creating an incredible learning experience about astrobiology and space exploration.",
      pause: true,
      hook: "Suddenly the virtual Mars crystals project holographic images of real alien life forms!",
      microVariants: {
        text: "Clever problem-solving transforms the malfunction into an enhanced learning opportunity about space science and astrobiology.",
        alternatives: ["{userName}'s creative thinking turns a technical crisis into an advanced educational experience for everyone."],
        optionalDetails: ["the enhanced simulation reveals classified details about actual Mars missions that weren't supposed to be in the training program, suggesting NASA has been hiding real discoveries", "other students abandon their own simulations to crowd around {userName}'s station as the virtual crystals begin transmitting what appears to be actual data from Mars rovers"]
      }
    },
    {
      text: "The NASA instructors are amazed by {userName}'s innovative problem-solving and invite them to participate in a real astronaut training program when they're older. The simulation concludes successfully with {userName}'s team 'landing' safely on virtual Mars and sharing their discoveries about the {favoriteColor} crystals with mission control. {userName} realizes that real space exploration requires both scientific knowledge and creative thinking.",
      pause: true,
      hook: "But wait - the emergency phone is ringing and Dr. Martinez is shouting: 'This isn't a simulation anymore!'",
      microVariants: {
        text: "NASA instructors recognize {userName}'s potential and offer future astronaut training opportunities after their successful problem-solving.",
        alternatives: ["The successful mission conclusion opens doors to advanced space program participation for talented {userName}."],
        optionalDetails: ["other international space agencies send urgent requests to study {userName}'s unique mineral detection abilities, suggesting their charm might be connected to actual Mars discoveries", "classified documents accidentally appear on computer screens showing that NASA has been monitoring similar mineral signatures from real Mars rovers for months"]
      }
    },
    {
      text: "Inspired by their success, {userName} returns to school with a mission to share their space exploration knowledge with classmates. They establish the Junior Space Scientists Club, where members learn about astronomy, engineering, and the importance of teamwork in scientific discovery. Their friend Alex joins as the club's first member, eager to explore how {hobbies} connects to space science and technology.",
      pause: true,
      hook: "The club's first meeting is interrupted when a mysterious package arrives addressed to {userName} - from NASA!",
      microVariants: {
        text: "The space camp experience motivates {userName} to establish a school club dedicated to space science education and collaborative learning.",
        alternatives: ["Returning to school, {userName} channels their space exploration passion into creating educational opportunities for curious classmates."],
        optionalDetails: ["they design model rockets using recycled materials and discover that some actually achieve surprising heights, attracting attention from local aerospace engineers who offer advanced building supplies", "the club meets in the library after hours to study constellation patterns using powerful telescopes borrowed from the community college, creating an atmosphere of secret scientific discovery"]
      }
    },
    {
      text: "The Junior Space Scientists Club grows tremendously as students become fascinated by space exploration and scientific methodology. {userName} teaches club members about problem-solving techniques learned at NASA, while different members contribute their unique talents. Maria excels at mathematical calculations, James designs creative spacecraft models, and everyone learns that diverse skills strengthen team capabilities in scientific endeavors.",
      pause: true,
      hook: "During their third meeting, the club receives an urgent video call from the International Space Station!",
      microVariants: {
        text: "Club expansion reveals how different students' unique talents contribute to collective scientific learning and space exploration understanding.",
        alternatives: ["The growing club demonstrates that successful space exploration requires diverse skills and collaborative teamwork approaches."],
        optionalDetails: ["parents volunteer to help with club activities and field trips, but some become concerned when their children start receiving mysterious emails from aerospace companies offering internship opportunities", "the principal notices increased interest in science throughout the school and discovers that test scores in physics and mathematics have dramatically improved among club members"]
      }
    },
    {
      text: "For their first major project, the club decides to organize a school-wide Space Exploration Fair where students can display models, experiments, and presentations about different aspects of space science. {userName} coordinates the event using organizational skills developed during space camp, while club members each focus on their areas of expertise and interest, including {favoriteColor} planet research and {favoriteAnimal} space adaptation studies.",
      pause: true,
      hook: "On the morning of the fair, {userName} discovers something shocking: their {favoriteAnimal} charm is beeping!",
      microVariants: {
        text: "The club's Space Exploration Fair becomes a school-wide celebration of scientific learning, curiosity, and collaborative achievement.",
        alternatives: ["Organizing a major science fair allows {userName} and club members to demonstrate leadership while inspiring broader school participation in space science."],
        optionalDetails: ["younger students create amazing artwork depicting space adventures that seem impossibly detailed and accurate, leading teachers to wonder where they got such specific information about Mars terrain", "local astronomers volunteer as judges and guest speakers, but they're surprised to find that some student projects contain data they've never seen published in scientific journals"]
      }
    },
    {
      text: "The Space Exploration Fair becomes an extraordinary success, attracting families, community members, and even representatives from local science museums. {userName} presents their space camp experience and problem-solving techniques to enthusiastic audiences, while realizing that their greatest achievement isn't personal recognition, but inspiring others to pursue scientific curiosity and collaborative learning. The fair establishes an annual tradition celebrating scientific exploration and community engagement.",
      pause: true,
      hook: "Just as {userName} finishes their presentation, a man in a NASA uniform approaches with an urgent expression!",
      microVariants: {
        text: "The successful fair demonstrates how {userName}'s individual space camp experience has grown into community-wide scientific inspiration and educational leadership.",
        alternatives: ["Personal achievement transforms into community impact as {userName} realizes that sharing scientific passion creates broader educational opportunities."],
        optionalDetails: ["the museum offers summer internships for interested students and provides cutting-edge equipment that rival university research labs, attracting graduate students who want to mentor ambitious young scientists", "other schools from across the country request guidance for organizing similar science fairs, leading to the creation of a national network of student-led space exploration programs"]
      }
    },
    {
      text: "Months later, when {userName} receives their acceptance letter to NASA's advanced youth astronaut program, they understand that their space journey began not with rockets or technology, but with curiosity and the willingness to solve problems creatively. The Junior Space Scientists Club continues to thrive, with new members conducting their own experiments and sharing their discoveries with the community. {userName} realizes that the most important space exploration happens right here on Earth, as young minds reach for the stars while keeping their feet firmly planted in helping others learn and grow.",
      pause: true,
      hook: "As {userName} opens the NASA acceptance letter, they notice something strange - it's written on the same type of paper as the mysterious documents from their charm experiment!",
      microVariants: {
        text: "Acceptance to NASA's youth program validates {userName}'s growth from curious student to scientific leader who inspires others to explore space and science.",
        alternatives: ["The journey from space camp to NASA acceptance demonstrates how curiosity, problem-solving, and community leadership create lasting impact beyond individual achievement."],
        optionalDetails: ["the club members organize a massive celebration party for {userName}'s acceptance with space-themed decorations and invite former NASA astronauts as guest speakers", "younger students from elementary schools create artwork and letters expressing their excitement about following {userName}'s inspiring path to space exploration and scientific leadership"]
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
    },
    {
      type: 'reflective',
      text: "{userName} realizes that the most important lesson from space camp wasn't about rockets or planets, but about perseverance, teamwork, and creative problem-solving. These skills help them approach every challenge with confidence and curiosity, whether exploring outer space or navigating daily life on Earth.",
      microVariants: ["Space camp teaches {userName} life skills about perseverance and teamwork that apply to every future challenge.", "The experience shows {userName} that scientific thinking and collaboration are valuable tools for solving any problem."]
    },
    {
      type: 'silly',
      text: "The space simulation becomes so popular that {userName} starts the world's first {favoriteColor} {favoriteAnimal} Space Academy! Students learn astronomy while caring for classroom pets that serve as 'space animal researchers,' and everyone enjoys {favoriteFood} space meals during their educational Mars missions.",
      microVariants: ["The wonderfully silly Space Academy combines animal care with astronomy education in the most entertaining way possible.", "Students learn serious space science while enjoying ridiculous space-themed activities with classroom animals and themed meals."]
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