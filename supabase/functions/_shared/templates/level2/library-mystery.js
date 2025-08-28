// Level 2 Template: Library Mystery
export const template = {
  title: "The Mystery of the Missing Library Books",
  theme: "Mystery & Problem-Solving",
  level: "Level 2",
  scenes: [
    {
      text: "{userName} loves reading mystery books and spending time at the school library. Mrs. Chen, the librarian, notices that several popular books have mysteriously disappeared from the shelves. She asks {userName} to help solve this puzzling case because of their sharp detective skills.",
      pause: true,
      hook: "What clues will {userName} find to solve the library mystery?",
      microVariants: {
        text: "{userName} loves reading mystery books and spending time at the school library. Mrs. Chen, the librarian, notices that several popular books have mysteriously disappeared from the shelves. She asks {userName} to help solve this puzzling case because of their sharp detective skills.",
        alternatives: ["Detective {userName} receives their first real mystery case from the worried librarian.", "The school library needs {userName}'s help when books start vanishing without explanation."],
        optionalDetails: ["the missing books are all {favoriteColor} covered", "students keep asking for the disappeared books"]
      }
    },
    {
      text: "{userName} begins their investigation by interviewing students and teachers who use the library regularly. They create a detective notebook to track clues and discover that the missing books all have one thing in common. Every disappeared book was about animals, especially stories featuring {favoriteAnimal} characters.",
      pause: true,
      hook: "Why would someone take only animal books?",
      microVariants: {
        text: "{userName} begins their investigation by interviewing students and teachers who use the library regularly. They create a detective notebook to track clues and discover that the missing books all have one thing in common. Every disappeared book was about animals, especially stories featuring {favoriteAnimal} characters.",
        alternatives: ["Careful detective work reveals a pattern in the missing books that points to an animal-loving culprit.", "The investigation notebook fills with clues that all point toward someone who adores animal stories."],
        optionalDetails: ["interviews reveal nervous behavior from some students", "the pattern becomes clear after checking library records"]
      }
    },
    {
      text: "Following the clues, {userName} discovers a secret reading fort built under the library stairs. Inside, they find all the missing books and a shy first-grader named Tommy who was too embarrassed to check out books properly. Tommy explains he was afraid other kids would laugh at him for reading baby animal books.",
      pause: true,
      hook: "How will {userName} help Tommy feel comfortable about reading?",
      microVariants: {
        text: "Following the clues, {userName} discovers a secret reading fort built under the library stairs. Inside, they find all the missing books and a shy first-grader named Tommy who was too embarrassed to check out books properly. Tommy explains he was afraid other kids would laugh at him for reading baby animal books.",
        alternatives: ["The mystery leads to a cozy reading hideout where a scared young reader has been hiding with the books.", "Under the stairs, {userName} finds not a thief, but a lonely child who just wanted to read without judgment."],
        optionalDetails: ["the fort is decorated with drawings of animals", "Tommy has been sharing {favoriteFood} crackers with book characters"]
      }
    },
    {
      text: "Instead of getting Tommy in trouble, {userName} sits with him and shares their own love of animal stories. They explain that reading any book is wonderful and that being kind to animals shows a good heart. {userName} helps Tommy learn how to check out books properly and promises to read with him sometimes.",
      pause: true,
      hook: "What positive changes will come from {userName}'s kindness?",
      microVariants: {
        text: "Instead of getting Tommy in trouble, {userName} sits with him and shares their own love of animal stories. They explain that reading any book is wonderful and that being kind to animals shows a good heart. {userName} helps Tommy learn how to check out books properly and promises to read with him sometimes.",
        alternatives: ["Compassionate detective work turns into friendship as {userName} helps Tommy feel proud of his reading choices.", "The case closes with kindness as {userName} becomes Tommy's reading mentor and friend."],
        optionalDetails: ["they return the books together to Mrs. Chen", "Tommy's face lights up with relief and happiness"]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "{userName} and Tommy become best reading friends, spending every lunch period discovering new animal adventures together in their favorite library corner.",
      microVariants: ["The library corner becomes their special place for sharing stories and snacks.", "Every day brings new books and deeper friendship between the detective and their first case."]
    },
    {
      type: 'triumphant',
      text: "{userName} solves many more school mysteries with kindness, eventually becoming the school's official Student Problem Solver, helping everyone feel included and understood.",
      microVariants: ["The Reading Buddy detective becomes legendary for solving problems with heart and wisdom.", "Other schools invite {userName} to help them create kindness-based problem-solving programs."]
    }
  ],
  reuse: {
    swappableElements: {
      "missing items": ["books", "supplies", "toys", "equipment"],
      "location": ["library", "classroom", "playground", "cafeteria"],
      "helper": ["librarian", "teacher", "principal", "counselor"]
    },
    weatherVariants: ["during library time", "after school", "during lunch break", "on a quiet afternoon"],
    settingVariants: ["school library", "public library", "classroom", "reading room"]
  }
};