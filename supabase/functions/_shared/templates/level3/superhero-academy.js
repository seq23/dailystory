// Level 3 Template: Superhero Academy Adventure
export const template = {
  title: "The Secret Superhero Academy",
  theme: "Heroism & Personal Growth",
  level: "Level 3",
  scenes: [
    {
      text: "{userName} has always felt different from other kids, especially when it comes to their unusual talent related to {hobbies}. One day, a mysterious woman in a {favoriteColor} coat approaches them after school and hands them an invitation to 'Heroic Hearts Academy - Where Differences Become Strengths.' The invitation shimmers and reveals a hidden address that only {userName} can see.",
      pause: true,
      hook: "What kind of special academy could this be, and why was {userName} chosen?",
      microVariants: {
        text: "{userName} receives a mysterious invitation to a secret academy that recognizes their unique talents related to {hobbies}.",
        alternatives: ["A special academy invitation appears after {userName} demonstrates their unusual abilities with {hobbies}."],
        optionalDetails: ["the invitation feels warm and seems to glow", "other students walk by without noticing anything unusual"]
      }
    },
    {
      text: "Following the address leads {userName} to what looks like an ordinary community center, but when they touch the door handle, it transforms into an incredible academy filled with students practicing amazing abilities. {userName} meets Alex, who can communicate with any {favoriteAnimal}, and Sam, who has super-strength but is afraid of hurting others. A kind teacher, Ms. Powers, explains that the academy helps young people learn to use their special gifts responsibly.",
      pause: true,
      hook: "What unique power will {userName} discover they have?",
      microVariants: {
        text: "The academy reveals itself as a place where students with special abilities learn to use their powers responsibly and helpfully.",
        alternatives: ["{userName} discovers a hidden school where their differences are valued and other students have amazing abilities too."],
        optionalDetails: ["students practice powers safely in special training rooms", "the academy feels warm and welcoming"]
      }
    },
    {
      text: "During their first training session, {userName} discovers their power is the ability to enhance other people's natural talents when they focus on {hobbies}. When they concentrate while near Alex, Alex can suddenly understand and speak to all animals, not just {favoriteAnimal}. When they help Sam, Sam gains perfect control over their strength. Ms. Powers explains that {userName} has one of the rarest gifts - the power to help others reach their full potential.",
      pause: true,
      hook: "How will {userName} learn to use their power to help others?",
      microVariants: {
        text: "{userName}'s unique power enhances other people's abilities, making them better versions of themselves when focused through {hobbies}.",
        alternatives: ["The discovery that {userName} can amplify others' talents makes them realize their special role in helping classmates succeed."],
        optionalDetails: ["other students are amazed by the enhancement effect", "Ms. Powers has never seen this exact power before"]
      }
    },
    {
      text: "The academy faces its first crisis when a group of older students starts using their powers selfishly, causing problems in the nearby community. {userName}, Alex, and Sam must work together to stop them, but {userName} realizes their power only works when they genuinely care about helping others, not when they're trying to show off or win fights. They need to find a way to help the older students remember why they came to the academy in the first place.",
      pause: true,
      hook: "Can {userName} help the older students rediscover their heroic hearts?",
      microVariants: {
        text: "{userName} learns that their power only works with genuine caring, not for showing off or fighting, while facing their first hero challenge.",
        alternatives: ["A crisis with selfish older students teaches {userName} that true heroism comes from caring about others, not seeking glory."],
        optionalDetails: ["the older students are causing minor accidents and scaring people", "the community is starting to notice unusual incidents"]
      }
    },
    {
      text: "Instead of fighting, {userName} uses their power to enhance the older students' ability to remember their original dreams of helping people. When the older students recall why they wanted to be heroes, they stop their selfish behavior and apologize to the community. {userName} realizes that sometimes the most heroic thing is helping others find their better selves, just like the academy helped them discover their own special gift.",
      pause: true,
      hook: "What kind of hero will {userName} become now that they understand their true purpose?",
      microVariants: {
        text: "Helping older students remember their heroic dreams proves that {userName}'s greatest power is inspiring others to be their best selves.",
        alternatives: ["The crisis resolution shows {userName} that true heroism means helping others discover their own capacity for good."],
        optionalDetails: ["the older students become mentors for newer students", "the community gains trust in the academy's mission"]
      }
    },
    {
      text: "Following this success, {userName} proposes establishing a mentorship program where older students guide newer ones in understanding their abilities responsibly. Alex volunteers to help students who struggle with animal communication, while Sam offers strength training that emphasizes self-control and protection rather than intimidation. {userName} coordinates the program, using their enhancement abilities to help mentors and students work together more effectively.",
      pause: true,
      hook: "How will the mentorship program strengthen the entire academy community?",
      microVariants: {
        text: "The mentorship program creates stronger academy bonds as {userName} helps older and newer students support each other's heroic development.",
        alternatives: ["Coordinating peer mentoring allows {userName} to enhance collaborative relationships throughout the academy community."],
        optionalDetails: ["mentorship pairs practice together in specialized training rooms", "Ms. Powers notices improved cooperation and confidence among all students"]
      }
    },
    {
      text: "As the mentorship program flourishes, {userName} discovers their power grows stronger when used to help others succeed rather than to solve problems independently. They learn to enhance not just individual abilities, but team dynamics, helping entire groups of students coordinate their diverse powers for community service projects. The academy becomes known for its extraordinary teamwork and positive impact on the surrounding neighborhoods.",
      pause: true,
      hook: "What community challenges will the academy students tackle together?",
      microVariants: {
        text: "{userName}'s enhancement abilities help academy teams coordinate their diverse powers for increasingly effective community service initiatives.",
        alternatives: ["Enhanced teamwork allows academy students to address complex community problems through collaborative superhero efforts."],
        optionalDetails: ["they organize neighborhood safety patrols and environmental cleanup efforts", "local government officials request academy assistance with community challenges"]
      }
    },
    {
      text: "During their most ambitious project, the academy teams work together to help rebuild a community center damaged by a storm. {userName} enhances the construction team's coordination while Alex communicates with local wildlife to ensure safe building practices. Sam provides careful structural support, and other students contribute their unique abilities. The project demonstrates that heroism involves building and nurturing communities rather than simply fighting villains.",
      pause: true,
      hook: "How does this collaborative rebuilding project change {userName}'s understanding of heroism?",
      microVariants: {
        text: "The community rebuilding project teaches {userName} that constructive collaboration creates more lasting heroic impact than individual dramatic interventions.",
        alternatives: ["Working together on community construction shows {userName} that heroism means building and supporting rather than just protecting and rescuing."],
        optionalDetails: ["community members work alongside students, sharing skills and appreciation", "the rebuilt center includes spaces designed specifically for ongoing academy-community partnerships"]
      }
    },
    {
      text: "At the academy's annual Heroes Day celebration, {userName} addresses the entire school and community about their journey from feeling different and isolated to becoming a leader who helps others discover their potential. They explain that their enhancement power taught them that everyone has heroic qualities that can be strengthened through support, encouragement, and collaborative effort. The celebration becomes a recognition of how individual gifts contribute to collective community strength.",
      pause: true,
      hook: "What lasting impact will {userName}'s leadership and philosophy have on future academy students?",
      microVariants: {
        text: "Heroes Day becomes a celebration of {userName}'s philosophy that individual differences strengthen communities when nurtured through collaborative support.",
        alternatives: ["The annual celebration establishes {userName}'s legacy of transforming personal differences into community strengths through enhanced collaboration."],
        optionalDetails: ["younger students eagerly anticipate their own opportunities to contribute to academy traditions", "the celebration attracts visitors from other superhero academies seeking similar collaborative approaches"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName} becomes a celebrated hero known not for flashy powers, but for inspiring others to use their abilities to help their communities. They establish junior academies around the world where young people learn that everyone has heroic potential.",
      microVariants: ["Global junior academies spread {userName}'s message that heroism comes from helping others discover their potential.", "{userName}'s legacy creates a worldwide network of young heroes focused on community service and mutual support."]
    },
    {
      type: 'cozy',
      text: "{userName} continues at the academy, quietly helping classmates discover and develop their abilities while learning that the greatest superpower is the ability to make others feel valued and confident in their unique gifts.",
      microVariants: ["Daily life at the academy revolves around {userName} helping others discover their special talents and build confidence.", "The academy becomes a place where {userName} learns that making others feel special is the most heroic power of all."]
    },
    {
      type: 'reflective',
      text: "{userName} realizes that being different isn't a problem to solve, but a strength to celebrate. Their journey teaches them that true heroism comes from helping others embrace their uniqueness and use their individual gifts to strengthen their communities and relationships.",
      microVariants: ["The academy experience teaches {userName} that differences are strengths and that heroism means celebrating uniqueness in others.", "Understanding that individual uniqueness strengthens communities becomes {userName}'s most important lesson about heroism and leadership."]
    },
    {
      type: 'silly',
      text: "{userName} establishes the world's first {favoriteColor} {favoriteAnimal} Superhero Academy, where students develop their powers through ridiculous but effective training methods like interpretive dance flying lessons and {favoriteFood} strength-building competitions that somehow produce the most capable and confident heroes ever!",
      microVariants: ["The wonderfully absurd training methods at {userName}'s silly superhero academy produce surprisingly excellent and happy heroes.", "Ridiculous training techniques create the most effective and joy-filled superhero education program in history."]
    }
  ],
  reuse: {
    swappableElements: {
      "powers": ["telepathy", "super strength", "invisibility", "flying"],
      "academy_subjects": ["ethics", "power control", "community service", "teamwork"],
      "hero_challenges": ["natural disasters", "community problems", "interpersonal conflicts", "environmental issues"]
    },
    weatherVariants: ["during power training sessions", "on heroic mission days", "during ethics classes", "at graduation ceremonies"],
    settingVariants: ["hidden academy", "community center", "training grounds", "neighborhood streets"]
  }
};