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
    },
    {
      text: "{userName} and Tommy work together to return all the books to Mrs. Chen, who is so happy to see the missing books that she doesn't get upset about the hiding. Instead, she thanks {userName} for solving the mystery with kindness and suggests they start a weekly reading club for students who love animal stories.",
      pause: true,
      hook: "Who else might join their new reading club?",
      microVariants: {
        text: "{userName} and Tommy work together to return all the books to Mrs. Chen, who is so happy to see the missing books that she doesn't get upset about the hiding. Instead, she thanks {userName} for solving the mystery with kindness and suggests they start a weekly reading club for students who love animal stories.",
        alternatives: ["Mrs. Chen's relief turns into excitement as she helps {userName} and Tommy create something positive from the situation.", "The mystery's solution leads to a wonderful new opportunity for students who share the same reading interests."],
        optionalDetails: ["Mrs. Chen has many more animal books to share", "other shy students need reading friends too"]
      }
    },
    {
      text: "The first meeting of the Animal Story Reading Club brings five students together in the library corner. {userName} helps each new member feel welcome by sharing how they solved their first mystery and learned that everyone loves different kinds of books. Tommy feels proud to help other students find their favorite {favoriteColor} animal stories.",
      pause: true,
      hook: "How will the reading club grow and change?",
      microVariants: {
        text: "The first meeting of the Animal Story Reading Club brings five students together in the library corner. {userName} helps each new member feel welcome by sharing how they solved their first mystery and learned that everyone loves different kinds of books. Tommy feels proud to help other students find their favorite {favoriteColor} animal stories.",
        alternatives: ["The reading club creates a welcoming space where {userName} and Tommy help other students discover their love of books.", "Five students begin a friendship through shared stories, with {userName} as their encouraging leader."],
        optionalDetails: ["each student brings their favorite snack to share", "they vote on which {favoriteAnimal} story to read first"]
      }
    },
    {
      text: "After three successful club meetings, {userName} notices that Tommy has grown more confident and now helps newer members find books they'll enjoy. The quiet boy who once hid under the stairs now eagerly recommends his favorite {favoriteAnimal} stories to anyone who will listen. Mrs. Chen smiles watching Tommy help a kindergartner sound out difficult words.",
      pause: true,
      hook: "How has Tommy's transformation inspired other shy students?",
      microVariants: {
        text: "After three successful club meetings, {userName} notices that Tommy has grown more confident and now helps newer members find books they'll enjoy. The quiet boy who once hid under the stairs now eagerly recommends his favorite {favoriteAnimal} stories to anyone who will listen. Mrs. Chen smiles watching Tommy help a kindergartner sound out difficult words.",
        alternatives: ["Tommy's confidence blossoms as he becomes a reading mentor to other students who need encouragement.", "The shy book hider transforms into an enthusiastic reading guide, helping others discover the joy of animal stories."],
        optionalDetails: ["Tommy wears a {favoriteColor} reading buddy badge with pride", "other students specifically ask for Tommy's book recommendations"]
      }
    },
    {
      text: "As the club grows bigger each week, {userName} realizes that solving mysteries isn't just about finding missing things - it's about helping people feel understood and included. The reading club becomes so popular that Mrs. Chen asks {userName} to help start similar clubs for students with other interests like {hobbies}.",
      pause: true,
      hook: "What other mysteries might {userName} solve through kindness and understanding?",
      microVariants: {
        text: "As the club grows bigger each week, {userName} realizes that solving mysteries isn't just about finding missing things - it's about helping people feel understood and included. The reading club becomes so popular that Mrs. Chen asks {userName} to help start similar clubs for students with other interests like {hobbies}.",
        alternatives: ["The club's success teaches {userName} that the best detective work involves understanding people's feelings and needs.", "Growing popularity of the reading club inspires {userName} to create more inclusive spaces for different student interests."],
        optionalDetails: ["new students ask to join every week", "the library corner becomes the most popular spot in school"]
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
    },
    {
      type: 'reflective',
      text: "{userName} learns that being a good detective means listening with your heart, not just looking with your eyes. This lesson helps them make friends and solve problems throughout their life by understanding what people really need.",
      microVariants: ["The mystery teaches {userName} that understanding feelings is more important than finding clues.", "Detective skills become life skills as {userName} learns to help others by truly listening and caring."]
    },
    {
      type: 'silly',
      text: "The Animal Story Reading Club becomes so popular that even the school principal's {favoriteAnimal} wants to join! {userName} creates tiny {favoriteColor} library cards for pets, and the library becomes famous for its four-legged book club members.",
      microVariants: ["The reading club welcomes furry members with their own special library cards and reading spots.", "Even animals want to join {userName}'s inclusive reading club, making the library the friendliest place in town."]
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