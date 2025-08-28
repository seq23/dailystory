// Level 3 Template: Magical Treehouse Adventure
export const template = {
  title: "The Magical Treehouse Adventure",
  theme: "Magic & Fantasy",
  level: "Level 3",
  scenes: [
    {
      text: "{userName} and their best friend stumbled upon an ancient-looking treehouse deep in the enchanted forest. As they climbed inside, they discovered a dusty old book with strange symbols. Suddenly, the treehouse began to shake, and they realized it was lifting off the ground!",
      pause: true,
      hook: "Where will the magical treehouse take them?",
      microVariants: {
        text: "{userName} and their friend, while exploring the enchanted forest, found a hidden treehouse. Inside, a mysterious book with glowing symbols caused the treehouse to magically float into the sky!",
        alternatives: ["{userName} and their friend were playing in the woods when they discovered a secret treehouse. A magical book inside made the treehouse fly!"],
        optionalDetails: ["The book whispered secrets.", "Strange lights flickered around them.", "The air crackled with energy."]
      }
    },
    {
      text: "The treehouse soared through the clouds, passing by floating islands and friendly dragons. {userName} looked through the book and found a spell to visit different worlds. They decided to visit the Land of Talking Animals first, hoping to meet a wise {favoriteAnimal} who could guide them.",
      pause: true,
      hook: "What adventures await them in the Land of Talking Animals?",
      microVariants: {
        text: "Flying through the sky, the treehouse passed floating islands and dragons. {userName} found a spell to visit the Land of Talking Animals, hoping to meet a wise {favoriteAnimal}.",
        alternatives: ["The treehouse flew past clouds and dragons. {userName} used a spell to go to the Land of Talking Animals, looking for a smart {favoriteAnimal}."],
        optionalDetails: ["The dragons waved hello.", "The islands had candy trees.", "The spell shimmered with rainbow colors."]
      }
    },
    {
      text: "In the Land of Talking Animals, they met a {favoriteAnimal} who told them about a hidden treasure that could grant any wish. The {favoriteAnimal} warned them that the treasure was guarded by a grumpy dragon who loved riddles. {userName} and their friend accepted the challenge and set off to find the treasure.",
      pause: true,
      hook: "Can they outsmart the grumpy dragon and get the treasure?",
      microVariants: {
        text: "A {favoriteAnimal} in the Land of Talking Animals told them about a treasure guarded by a grumpy dragon. The treasure could grant any wish, but the dragon loved riddles.",
        alternatives: ["They met a {favoriteAnimal} who said a treasure was hidden, guarded by a dragon who asked riddles. The treasure could grant wishes."],
        optionalDetails: ["The {favoriteAnimal} gave them a map.", "The dragon lived in a dark cave.", "The treasure sparkled with magic."]
      }
    },
    {
      text: "At the treasure cave, they met the grumpy dragon who wasn't actually mean, just lonely and bored. The dragon explained that guarding treasure was tedious work, and the riddles were their only entertainment. {userName} had a brilliant idea: instead of just answering riddles, they proposed a riddle exchange where everyone could share their favorite brain teasers.",
      pause: true,
      hook: "What happens when the dragon becomes their friend instead of their challenge?",
      microVariants: {
        text: "The dragon was just lonely and bored, so {userName} suggested a riddle exchange game instead of a challenge, making them friends.",
        alternatives: ["The dragon wasn't mean, just lonely. {userName}'s idea to share riddles instead of solve them created an unexpected friendship."],
        optionalDetails: ["The dragon had been alone for centuries.", "They knew thousands of riddles from different lands.", "The cave was full of books and puzzle games."]
      }
    },
    {
      text: "The treasure turned out to be something even more valuable than gold or jewels: a magical library containing every story ever told and every story yet to be written. The dragon explained that the real treasure was the knowledge and imagination contained in these infinite stories. {userName} and their friend realized they could make any wish come true by reading and learning from these tales.",
      pause: true,
      hook: "What amazing stories will they discover in the magical library?",
      microVariants: {
        text: "The treasure was a magical library with every story ever told and yet to be written, offering infinite adventures and knowledge to explore.",
        alternatives: ["Instead of gold, they found a library of infinite stories that could fulfill any wish through imagination and learning."],
        optionalDetails: ["Books floated and glowed on the shelves.", "Some stories came alive as they read them.", "The library was bigger inside than the cave."]
      }
    },
    {
      text: "As they explored the magnificent library, {userName} discovered books that responded to their interests in {hobbies}. When they opened a {favoriteColor} book about adventure, the pages showed moving pictures that demonstrated exactly what they were reading about. The dragon revealed that readers could actually enter these stories and experience adventures firsthand, learning important lessons through direct participation.",
      pause: true,
      hook: "Which story world will {userName} choose to enter first?",
      microVariants: {
        text: "Interactive books respond to {userName}'s interests, showing moving pictures and offering opportunities to enter story worlds directly.",
        alternatives: ["The library's magical books adapt to {userName}'s preferences, creating immersive learning experiences through story participation."],
        optionalDetails: ["characters from books wave hello from their pages", "the dragon has bookmarks made from rainbow scales"]
      }
    },
    {
      text: "{userName} and their friend decide to experience a story about environmental protection, finding themselves in a forest where talking animals need help cleaning up pollution. They work alongside a wise {favoriteAnimal} to organize a community cleanup, learning that cooperation and determination can solve enormous problems. The experience teaches them that heroic actions often involve working together rather than individual glory.",
      pause: true,
      hook: "How will this story experience prepare them for real-world challenges?",
      microVariants: {
        text: "The environmental story teaches {userName} about cooperation, community service, and solving problems through teamwork rather than individual heroics.",
        alternatives: ["Hands-on story participation shows {userName} that real heroism involves collaboration and environmental responsibility."],
        optionalDetails: ["forest animals celebrate their successful cleanup efforts", "the polluted stream becomes crystal clear again"]
      }
    },
    {
      text: "After experiencing several story adventures, {userName} realizes the dragon has been lonely for centuries, serving as the library's guardian with no one to share stories with. {userName} and their friend propose establishing regular visits where they can read together and discuss the lessons learned from different tales. The dragon gratefully accepts, explaining that sharing stories makes them even more meaningful and educational.",
      pause: true,
      hook: "What wonderful friendship will develop through their shared love of stories?",
      microVariants: {
        text: "The lonely dragon finds companionship through {userName}'s proposal for regular story-sharing sessions in the magical library.",
        alternatives: ["Friendship blossoms as {userName} recognizes the dragon's need for companionship and offers regular visits for shared reading."],
        optionalDetails: ["they establish a cozy reading corner with comfortable cushions", "the dragon prepares special {favoriteFood} treats for reading sessions"]
      }
    },
    {
      text: "When it's time to return home, the dragon gives {userName} and their friend each a special bookmark that glows whenever they're reading and truly understanding the lessons in their books. The treehouse safely returns them to their own forest, but now they know they can return to the library whenever they want to learn something new or share an adventure with their dragon friend.",
      pause: true,
      hook: "How will the magical bookmarks change {userName}'s approach to reading and learning?",
      microVariants: {
        text: "Special glowing bookmarks connect {userName} to the magical library, indicating when they're truly comprehending their reading material.",
        alternatives: ["The dragon's gift ensures {userName} maintains their connection to meaningful learning through the magical bookmarks."],
        optionalDetails: ["the bookmarks shimmer with {favoriteColor} light when learning occurs", "other children notice {userName}'s improved reading enthusiasm"]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "Back in their own backyard, {userName} and their friend built a small library for their neighborhood, filled with books from their adventure. They often read stories to the younger children, sharing the magic of reading and the importance of education.",
      microVariants: ["They built a neighborhood library with books from their adventure, sharing stories and the importance of education with younger children."]
    },
    {
      type: 'triumphant',
      text: "{userName} and their friend started a global campaign for education, inspiring people around the world to donate books and support schools. They received awards and recognition, but their greatest reward was seeing children everywhere learning and growing.",
      microVariants: ["They started a global education campaign, inspiring people to donate books and support schools. Their reward was seeing children learning and growing."]
    },
    {
      type: 'reflective',
      text: "{userName} realizes that the greatest adventures don't require magic treehouses - they happen whenever someone opens a book with curiosity and imagination. This understanding transforms their approach to learning, making every day an opportunity for discovery and growth through reading.",
      microVariants: ["Understanding that books provide endless adventures changes {userName}'s perspective on learning and daily opportunities for growth.", "The magical library experience teaches {userName} that curiosity and imagination transform ordinary reading into extraordinary adventures."]
    },
    {
      type: 'silly',
      text: "The dragon becomes so excited about having reading friends that they start a magical book delivery service! {userName} wakes up every morning to find new books floating through their window, along with {favoriteColor} notes from their dragon friend recommending the most entertaining stories.",
      microVariants: ["A magical book delivery service brings daily literary surprises from {userName}'s enthusiastic dragon friend.", "The dragon's excitement about friendship leads to wonderfully silly book delivery adventures through {userName}'s bedroom window."]
    }
  ],
  reuse: {
    swappableElements: {
      "forestType": ["enchanted", "dark", "sunny", "mysterious"],
      "animalType": ["owl", "fox", "bear", "squirrel"],
      "monsterType": ["goblin", "troll", "dragon", "giant"]
    },
    weatherVariants: ["sunny", "rainy", "cloudy", "stormy"],
    settingVariants: ["forest", "mountains", "beach", "desert"]
  }
};