// Level 2 Template: Drama Club Adventure  
export const template = {
  title: "The Amazing School Play Adventure",
  theme: "Creativity & Performance",
  level: "Level 2", 
  scenes: [
    {
      text: "{userName} feels nervous about joining the school drama club, but their friend Maya convinces them to audition for the spring play. When they arrive at the auditorium, they discover the play is about a magical {favoriteColor} kingdom where {favoriteAnimal} characters go on exciting adventures to save their friends.",
      pause: true,
      hook: "What role will {userName} get in the magical kingdom play?",
      microVariants: {
        text: "{userName} feels nervous about joining the school drama club, but their friend Maya convinces them to audition for the spring play. When they arrive at the auditorium, they discover the play is about a magical {favoriteColor} kingdom where {favoriteAnimal} characters go on exciting adventures to save their friends.",
        alternatives: ["Maya helps nervous {userName} try out for a play about magical adventures.", "The drama club's new play features a {favoriteColor} kingdom that excites {userName}."],
        optionalDetails: ["the auditorium feels huge and intimidating", "other students practice lines while waiting"]
      }
    },
    {
      text: "During auditions, {userName} discovers they're naturally good at voice acting and expressing emotions. Ms. Rodriguez, the drama teacher, is impressed when {userName} performs a scene about a character who loves {hobbies} and uses that skill to help friends in trouble. Maya cheers from the audience, making {userName} feel confident and supported.",
      pause: true,
      hook: "How will {userName}'s unique talents help them in the play?",
      microVariants: {
        text: "During auditions, {userName} discovers they're naturally good at voice acting and expressing emotions. Ms. Rodriguez, the drama teacher, is impressed when {userName} performs a scene about a character who loves {hobbies} and uses that skill to help friends in trouble. Maya cheers from the audience, making {userName} feel confident and supported.",
        alternatives: ["Auditions reveal {userName}'s natural acting abilities and emotional expression.", "Ms. Rodriguez notices how {userName} connects their hobbies to character development."],
        optionalDetails: ["their voice carries clearly across the auditorium", "facial expressions perfectly match the character's feelings"]
      }
    },
    {
      text: "When the cast list is posted, {userName} discovers they've been chosen for the lead role! They feel excited but also worried about memorizing all those lines. Maya, who got the role of the wise mentor character, offers to help them practice every day after school. Together, they work on scenes while eating {favoriteFood} snacks in the drama room.",
      pause: true,
      hook: "Will {userName} and Maya be ready for opening night?",
      microVariants: {
        text: "When the cast list is posted, {userName} discovers they've been chosen for the lead role! They feel excited but also worried about memorizing all those lines. Maya, who got the role of the wise mentor character, offers to help them practice every day after school. Together, they work on scenes while eating {favoriteFood} snacks in the drama room.",
        alternatives: ["Getting the lead role excites and terrifies {userName}, but Maya offers supportive help.", "Daily practice sessions with Maya help {userName} prepare for their big acting challenge."],
        optionalDetails: ["the script has over fifty lines to memorize", "Maya makes up funny voices to help with line practice"]
      }
    },
    {
      text: "As opening night approaches, {userName} feels ready but nervous. Their family and friends fill the front row, holding {favoriteColor} flowers to give after the show. When the curtain rises and the stage lights shine bright, {userName} takes a deep breath and begins their first line. The audience is immediately captivated by their natural performance.",
      pause: true,
      hook: "How will the audience react to {userName}'s performance?",
      microVariants: {
        text: "As opening night approaches, {userName} feels ready but nervous. Their family and friends fill the front row, holding {favoriteColor} flowers to give after the show. When the curtain rises and the stage lights shine bright, {userName} takes a deep breath and begins their first line. The audience is immediately captivated by their natural performance.",
        alternatives: ["Opening night nerves fade as {userName} delivers their lines to a supportive audience.", "Stage lights and family support give {userName} confidence to perform beautifully."],
        optionalDetails: ["the costume fits perfectly and feels magical", "Maya gives encouraging thumbs up from backstage"]
      }
    },
    {
      text: "The play is a huge success! {userName} and Maya work together perfectly on stage, their friendship making their character interactions feel real and touching. During the final scene where they save the magical kingdom, the audience gives them a standing ovation. Ms. Rodriguez congratulates the entire cast and suggests they consider performing in the regional drama festival.",
      pause: true,
      hook: "What new opportunities will this success create for {userName}?",
      microVariants: {
        text: "The play is a huge success! {userName} and Maya work together perfectly on stage, their friendship making their character interactions feel real and touching. During the final scene where they save the magical kingdom, the audience gives them a standing ovation. Ms. Rodriguez congratulates the entire cast and suggests they consider performing in the regional drama festival.",
        alternatives: ["Perfect partnership with Maya creates touching performances that earn standing ovations.", "Success on stage opens doors to regional drama opportunities for {userName} and Maya."],
        optionalDetails: ["several audience members wipe away happy tears", "the local newspaper wants to interview the cast"]
      }
    },
    {
      text: "After their success, a local theater director named Mr. Kim visits the school to watch {userName} and Maya perform scenes from their play. He tells them about a summer theater camp where young actors can learn advanced skills like stage combat, singing, and even writing their own scripts about topics they love, like {hobbies}.",
      pause: true,
      hook: "Will {userName} and Maya decide to audition for theater camp?",
      microVariants: {
        text: "After their success, a local theater director named Mr. Kim visits the school to watch {userName} and Maya perform scenes from their play. He tells them about a summer theater camp where young actors can learn advanced skills like stage combat, singing, and even writing their own scripts about topics they love, like {hobbies}.",
        alternatives: ["A visiting theater director offers {userName} and Maya the chance to develop their acting skills at summer camp.", "Mr. Kim's theater camp invitation could help {userName} and Maya become even better performers."],
        optionalDetails: ["the camp teaches sword fighting and dance moves", "students get to work with professional costume designers"]
      }
    },
    {
      text: "{userName} feels excited but nervous about auditioning for theater camp. Maya suggests they practice together using their favorite {favoriteFood} as props in silly comedy scenes. Their friendship grows stronger as they help each other prepare, and they discover that working as a team makes everything more fun and less scary.",
      pause: true,
      hook: "How will their teamwork help them at the audition?",
      microVariants: {
        text: "{userName} feels excited but nervous about auditioning for theater camp. Maya suggests they practice together using their favorite {favoriteFood} as props in silly comedy scenes. Their friendship grows stronger as they help each other prepare, and they discover that working as a team makes everything more fun and less scary.",
        alternatives: ["Audition nerves disappear when {userName} and Maya practice together using creative and silly methods.", "The friends discover that preparing together makes challenging things feel easier and more enjoyable."],
        optionalDetails: ["they use {favoriteFood} to practice emotional expressions", "their practice sessions become hilarious and memorable"]
      }
    },
    {
      text: "At the theater camp audition, {userName} and Maya perform a scene they created together about two friends who use the power of {favoriteColor} magic and their shared love of {hobbies} to solve problems in their community. The audition panel is impressed by their creativity, teamwork, and natural chemistry as scene partners.",
      pause: true,
      hook: "Will their original scene be enough to get them into theater camp?",
      microVariants: {
        text: "At the theater camp audition, {userName} and Maya perform a scene they created together about two friends who use the power of {favoriteColor} magic and their shared love of {hobbies} to solve problems in their community. The audition panel is impressed by their creativity, teamwork, and natural chemistry as scene partners.",
        alternatives: ["Their original audition scene showcases both individual talent and incredible partnership chemistry.", "The creative audition performance demonstrates {userName} and Maya's skills in writing, acting, and collaboration."],
        optionalDetails: ["the panel takes notes throughout their entire performance", "other auditioning students watch with admiration and respect"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName} and Maya continue acting together through high school, eventually founding a youth theater company that helps shy kids discover confidence through performing arts.",
      microVariants: ["Their theater company becomes known for helping nervous children find their voices through drama.", "Years of partnership culminate in creating opportunities for other young performers."]
    },
    {
      type: 'cozy', 
      text: "{userName} may not become a professional actor, but they never lose their love of storytelling and creative expression, using drama techniques to help them {hobbies} and connect with others throughout their life.",
      microVariants: ["Acting skills enhance {userName}'s hobbies and help them express themselves more confidently.", "The drama experience gives {userName} tools for creativity and communication they use forever."]
    },
    {
      type: 'reflective',
      text: "Years later, {userName} realizes that the most important thing they learned in drama club wasn't about acting - it was about friendship, teamwork, and finding the courage to be themselves. These lessons help them in everything they do, from {hobbies} to making new friends.",
      microVariants: ["The drama club teaches {userName} life lessons about courage, friendship, and authenticity that last forever.", "Acting skills become secondary to the confidence and social skills {userName} develops through theater."]
    },
    {
      type: 'silly',
      text: "{userName} and Maya become famous for creating the world's first {favoriteColor} {favoriteAnimal} musical, where all the characters speak in rhyme and eat {favoriteFood} during every song! Their silly creativity brings joy to audiences everywhere.",
      microVariants: ["Their wonderfully ridiculous {favoriteAnimal} musical becomes a beloved comedy that makes everyone laugh.", "The friends discover that the silliest ideas often create the most memorable and joyful performances."]
    }
  ],
  reuse: {
    swappableElements: {
      "play_themes": ["magical kingdoms", "space adventures", "historical stories", "fairy tale retellings"],
      "performance_skills": ["voice acting", "dancing", "singing", "costume design"],
      "drama_teacher": ["Ms. Rodriguez", "Mr. Chen", "Mrs. Johnson", "Dr. Kim"]
    },
    weatherVariants: ["during spring semester", "for the winter showcase", "at the summer camp", "during drama week"],
    settingVariants: ["school auditorium", "community theater", "outdoor amphitheater", "drama classroom"]
  }
};