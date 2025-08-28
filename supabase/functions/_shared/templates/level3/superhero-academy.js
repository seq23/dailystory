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