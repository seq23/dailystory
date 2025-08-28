// Grade 6 Template: Coding for Change Initiative
export const template = {
  title: "The Coding for Change Initiative",
  theme: "Technology & Social Impact",
  level: "Grade 6",
  scenes: [
    {
      text: "{userName} had always enjoyed playing video games and using apps, but it wasn't until they joined the after-school coding club that they realized technology could be a powerful tool for solving real-world problems in their community, especially after learning about their elderly neighbor Mrs. Chen who struggled with grocery shopping and keeping track of her medications since her children lived far away. Mr. Williams, the coding teacher, encouraged students to think about programming as a way to help people, not just entertain them.",
      pause: true,
      hook: "What kind of technological solution can {userName} create to help Mrs. Chen?",
      microVariants: {
        text: "{userName} discovered through coding club that technology could solve real community problems, particularly after learning about Mrs. Chen's daily challenges.",
        alternatives: [
          "Through the after-school coding club, {userName} discovered that programming skills could address real community needs, especially for elderly neighbors facing daily challenges."
        ],
        optionalDetails: ["The coding club met in the school's computer lab every Tuesday.", "Students worked on various community-focused projects.", "Mrs. Chen often waved from her garden when {userName} walked by."]
      }
    },
    {
      text: "Determined to help, {userName} approaches Mrs. Chen with a notebook full of questions about her daily routine and challenges. They discover she forgets to take her medications, struggles to reach high shelves at the grocery store, and feels isolated since her children moved across the country. Mrs. Chen is initially skeptical about technology but appreciates {userName}'s genuine concern. 'You remind me of my grandson,' she says warmly, offering them homemade cookies while they discuss her needs.",
      pause: true,
      hook: "How will {userName} design an app that truly meets Mrs. Chen's specific needs?",
      microVariants: {
        text: "{userName} interviews Mrs. Chen about her daily challenges, discovering medication reminders and social isolation are her biggest concerns.",
        alternatives: [
          "Through careful questioning, {userName} learns about Mrs. Chen's struggles with medication, shopping, and loneliness since her children moved away."
        ],
        optionalDetails: ["Mrs. Chen shows {userName} her seven different prescription bottles", "she has a photo wall with pictures of her children and grandchildren", "her arthritis makes opening jars and bottles difficult"]
      }
    },
    {
      text: "Back at coding club, {userName} shares Mrs. Chen's story with their teammate Jordan, and together they begin sketching out an app design. Mr. Williams teaches them about user-centered design, explaining that the best apps solve real problems for real people. They learn basic programming concepts like variables, loops, and functions while planning features like medication reminders, emergency contacts, and a simple way to request help from neighbors. The project feels more meaningful than any game they've ever played.",
      pause: true,
      hook: "What programming challenges will {userName} and Jordan face as beginners?",
      microVariants: {
        text: "{userName} and Jordan begin designing an app for Mrs. Chen, learning that user-centered design means solving real problems for real people.",
        alternatives: [
          "Working with teammate Jordan, {userName} discovers that creating meaningful apps requires understanding both programming and the people you're trying to help."
        ],
        optionalDetails: ["they use sticky notes to plan app features", "Mr. Williams shows them apps designed for seniors", "Jordan's grandmother also lives alone and faces similar challenges"]
      }
    },
    {
      text: "Learning to code proves more frustrating than {userName} expected. Their first attempts at creating a simple reminder system result in error messages they don't understand. Jordan gets discouraged when their login screen doesn't work, and they both spend an entire afternoon trying to figure out why their app crashes every time someone clicks a button. Mr. Williams reminds them that debugging is a crucial part of programming, and even professional developers spend lots of time fixing problems.",
      pause: true,
      hook: "How will {userName} and Jordan push through these coding challenges?",
      microVariants: {
        text: "{userName} and Jordan struggle with debugging and error messages, learning that programming requires patience and persistence.",
        alternatives: [
          "Early coding attempts result in frustrating crashes and error messages, teaching {userName} that software development requires perseverance."
        ],
        optionalDetails: ["they keep a 'bug journal' to track problems and solutions", "online coding forums provide helpful answers", "Mr. Williams pairs them with high school mentors"]
      }
    },
    {
      text: "Gradually, through trial and error and help from online tutorials, {userName} and Jordan create their first working prototype. It's simple - just a medication reminder with large, clear buttons - but when they show it to Mrs. Chen, her face lights up. She can actually use it! Her feedback is invaluable: the text needs to be bigger, the colors should be higher contrast, and she'd love a feature that lets her record voice messages for her family. {userName} realizes that user testing is as important as coding.",
      pause: true,
      hook: "What improvements will Mrs. Chen's feedback inspire in the app?",
      microVariants: {
        text: "{userName} and Jordan create their first working prototype and discover that Mrs. Chen's feedback is crucial for making the app truly useful.",
        alternatives: [
          "Testing their simple prototype with Mrs. Chen teaches {userName} that user feedback is essential for creating accessible, helpful technology."
        ],
        optionalDetails: ["Mrs. Chen tests the app with her reading glasses", "she suggests voice recordings for her grandchildren", "the app needs to work on her older smartphone"]
      }
    },
    {
      text: "Inspired by Mrs. Chen's enthusiasm, {userName} and Jordan expand their app to include a neighborhood helper network. They partner with other coding club members to create features that connect elderly residents with nearby volunteers for grocery runs, tech support, and friendly visits. {userName} interviews three more elderly neighbors, learning that many share similar challenges. The app evolves from a personal project into a community solution.",
      pause: true,
      hook: "How will the neighborhood helper network bring the community together?",
      microVariants: {
        text: "{userName} expands the app into a neighborhood helper network, connecting elderly residents with volunteers for various types of support.",
        alternatives: [
          "Realizing that Mrs. Chen's challenges are shared by many neighbors, {userName} transforms their personal app into a community-wide solution."
        ],
        optionalDetails: ["they create volunteer badges for different types of help", "the app includes a rating system for safety", "local businesses offer discounts for app users"]
      }
    },
    {
      text: "The coding club decides to present their community helper app at the school's technology showcase. {userName} feels nervous but excited as they prepare their presentation, creating slides that show Mrs. Chen using the app and testimonials from other elderly neighbors. Jordan handles the technical demonstration while {userName} explains how they identified community needs and designed solutions. Their parents beam with pride from the audience, and Mrs. Chen sits in the front row, nodding encouragingly.",
      pause: true,
      hook: "What response will {userName}'s presentation receive from the showcase audience?",
      microVariants: {
        text: "{userName} prepares to present their community helper app at the school technology showcase, with Mrs. Chen proudly attending as their honored guest.",
        alternatives: [
          "Presenting at the technology showcase, {userName} demonstrates both their coding skills and their commitment to solving real community problems."
        ],
        optionalDetails: ["they practice their presentation ten times", "Mrs. Chen wears her best dress to attend", "the local newspaper covers the technology showcase"]
      }
    },
    {
      text: "During the Q&A session, a local city councilwoman asks thoughtful questions about privacy and safety features in their app. {userName} confidently explains how they researched data protection and included security measures to keep users' personal information safe. A representative from the senior center expresses interest in piloting the app with their members. {userName} realizes their project has grown beyond a school assignment into something that could genuinely impact their community.",
      pause: true,
      hook: "What opportunities will emerge from this successful presentation?",
      microVariants: {
        text: "{userName} impresses city officials and senior center representatives with their app's privacy features and community impact potential.",
        alternatives: [
          "Professional questions about privacy and safety demonstrate that {userName}'s app addresses real-world concerns and has genuine community value."
        ],
        optionalDetails: ["the councilwoman takes notes about digital equity programs", "senior center members want to test the app", "a local tech company offers mentorship"]
      }
    },
    {
      text: "Over the summer, {userName} continues developing the app with support from a local tech company that offers mentorship and server space. They learn about databases, user authentication, and mobile app deployment while working with professional developers who volunteer their time. Mrs. Chen becomes their chief tester, enthusiastically trying new features and providing feedback. {userName} discovers that real software development is collaborative, requiring input from many different perspectives.",
      pause: true,
      hook: "How will this professional mentorship change {userName}'s understanding of technology careers?",
      microVariants: {
        text: "{userName} works with professional developers over the summer, learning advanced programming skills while Mrs. Chen serves as their enthusiastic chief tester.",
        alternatives: [
          "Summer mentorship from tech professionals teaches {userName} about real-world software development while deepening their community connections."
        ],
        optionalDetails: ["they attend weekly code reviews with professional developers", "Mrs. Chen learns to report bugs like a quality assurance tester", "the app gets featured in the company newsletter"]
      }
    },
    {
      text: "By fall, the Community Care App launches with twenty elderly residents and fifty volunteer helpers signed up. {userName} watches nervously as real people use their creation to request grocery help, medication reminders, and social visits. When Mrs. Chen successfully uses the app to get help moving furniture and connects with two new walking buddies, {userName} feels incredible pride. They've learned that technology's greatest power lies not in entertainment, but in strengthening human connections.",
      pause: true,
      hook: "What impact will the successful app launch have on {userName}'s community?",
      microVariants: {
        text: "{userName} watches proudly as the Community Care App launches with twenty elderly residents and fifty volunteers, successfully connecting neighbors in meaningful ways.",
        alternatives: [
          "The successful app launch demonstrates to {userName} that technology can strengthen human connections and build more caring communities."
        ],
        optionalDetails: ["Mrs. Chen hosts a launch party in her garden", "volunteers report feeling more connected to their neighbors", "the app facilitates over 100 helpful interactions in the first month"]
      }
    },
    {
      text: "As the school year begins, {userName} returns to coding club as a mentor for new students, sharing their experience and encouraging others to think about programming as a tool for community service. They've been invited to speak at other schools about youth civic engagement through technology. Mrs. Chen sends thank-you cards to the coding club, expressing how the app has improved her daily life and helped her feel less alone. {userName} understands now that the best technology doesn't replace human connections - it enhances them.",
      pause: true,
      hook: "What lasting impact will this project have on {userName}'s future and their community?",
      microVariants: {
        text: "{userName} becomes a mentor to new coding students, sharing how technology can enhance human connections rather than replace them.",
        alternatives: [
          "Returning as a coding club mentor, {userName} inspires other students to use programming for community service while continuing their own civic tech journey."
        ],
        optionalDetails: ["they create a 'coding for good' curriculum", "Mrs. Chen bakes cookies for the new coding club members", "three other schools want to implement similar programs"]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "Three months later, {userName} sat in Mrs. Chen's kitchen, sharing tea and homemade cookies while helping her test the final version of the 'Community Care App' they had developed together. The app connected Mrs. Chen with neighborhood volunteers for grocery runs and sent gentle medication reminders to her phone. 'You've given me such independence and peace of mind,' Mrs. Chen said warmly, patting {userName}'s hand. 'Technology isn't scary when it comes from the heart of someone who cares.'",
      microVariants: [
        "Sharing tea with Mrs. Chen, {userName} felt the deep satisfaction of using technology to create meaningful connections and provide practical help for community members in need."
      ]
    },
    {
      type: 'triumphant',
      text: "One year later, {userName} stands before the state technology conference, presenting the Community Care App to hundreds of developers, city planners, and social service professionals. The app now serves over 500 elderly residents across five cities, with {userName} as its youngest lead developer. When they announce that Mrs. Chen will be joining by video call, the audience erupts in applause as she waves from her kitchen, surrounded by new friends she met through the app. {userName} has learned that code can truly change the world.",
      microVariants: [
        "Presenting at the state technology conference, {userName} demonstrates how their Community Care App has grown to serve 500+ elderly residents across multiple cities.", "The standing ovation when Mrs. Chen appears by video call validates {userName}'s belief that technology should strengthen human connections and community care."]
    },
    {
      type: 'reflective',
      text: "Sitting at their computer late one evening, {userName} reads through dozens of thank-you messages from elderly app users and their families. Each story reminds them that behind every line of code are real people with real needs. 'Programming isn't just about making computers do things,' they reflect, thinking about Mrs. Chen's warm smile and Jordan's continued partnership. 'It's about understanding people deeply enough to create tools that truly help them flourish.' The screen glows softly as they begin sketching ideas for their next community-focused project.",
      microVariants: [
        "Reading heartfelt messages from app users, {userName} reflects on how programming is fundamentally about understanding and serving human needs.", "Late-night reflection reminds {userName} that successful technology comes from deep empathy and genuine care for the people it serves."]
    },
    {
      type: 'silly',
      text: "When {userName}'s younger cousin asks why they spend so much time 'talking to old people about phone apps,' they strike a superhero pose and declare, 'I am the Code Crusader, defender of the digitally challenged, vanquisher of forgotten passwords!' They demonstrate the app's large buttons with dramatic flair: 'Behold! Technology that actually makes sense!' Mrs. Chen watches from her window and chuckles - she's learned that {userName}'s silly sense of humor is just another way they show they care about making technology accessible for everyone.",
      microVariants: [
        "Playing up their role as 'Code Crusader,' {userName} uses humor to make technology less intimidating while genuinely caring about digital accessibility.", "Dramatic demonstrations of user-friendly design hide {userName}'s serious commitment to creating technology that serves people rather than frustrating them."]
    }
  ],
  reuse: {
    swappableElements: {
      "technologies": ["mobile apps", "websites", "databases", "automated systems"],
      "community_needs": ["elderly assistance", "environmental monitoring", "educational support", "accessibility tools"],
      "programming_languages": ["Scratch", "Python", "JavaScript", "HTML/CSS"]
    },
    weatherVariants: ["after-school sessions", "weekend hackathons", "community meetings"],
    settingVariants: ["computer lab", "community center", "neighbor's home", "coding club"]
  }
};