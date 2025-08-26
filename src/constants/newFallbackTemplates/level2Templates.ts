// Level 2 Templates - Enhanced with proper word counts  
// 3-4 sentences per page (60-80 words per scene)
// For ages 7-9, 3rd-4th grade reading level

export const LEVEL_2_TEMPLATES: string[][] = [
  [
    "{userName} joins the school science club and discovers they have a talent for experiments. The teacher, Mrs. Johnson, shows them how to create colorful chemical reactions using safe household ingredients.",
    "For their first project, {userName} decides to build a volcano that actually erupts. They carefully mix baking soda, vinegar, and {favoriteColor} food coloring while following the scientific method.",
    "The day of the science fair arrives, and {userName} feels nervous but excited. Their volcano demonstration works perfectly, impressing the judges and earning cheers from classmates and parents.",
    "Other students ask {userName} to teach them about volcanoes and chemical reactions. They discover that sharing knowledge with friends makes learning even more fun and rewarding.",
    "{userName} wins second place in the science fair and decides to pursue more experiments. They plan to study geology and become a scientist who helps people understand our amazing planet."
  ],
  [
    "{userName} discovers an old journal in their great-grandfather's attic filled with stories about adventures around the world. Each page contains detailed drawings of exotic animals, foreign foods, and mysterious landmarks from distant countries.",
    "Inspired by the journal, {userName} decides to research different cultures and countries at the library. They learn about traditions, languages, and customs while imagining themselves traveling to these fascinating places.",
    "With help from their family, {userName} creates a presentation about world cultures for their class. They dress in traditional clothing, prepare {favoriteFood} from different countries, and share interesting facts.",
    "The presentation is such a success that other classes ask {userName} to present to them too. Teachers praise their research skills and cultural awareness, making {userName} feel proud and confident.",
    "{userName} starts a world cultures club at school where students share stories about their heritage. They realize that learning about different cultures helps everyone understand and appreciate diversity."
  ],
  [
    "{userName} volunteers at the local animal shelter every weekend, helping to care for cats, dogs, and small animals. They learn how to properly feed the animals, clean their spaces, and provide comfort to scared pets.",
    "One day, {userName} meets a shy {favoriteAnimal} that has been at the shelter for months without finding a home. They spend extra time with the animal, teaching it to trust humans again through patience and kindness.",
    "Through their dedication and gentle care, the {favoriteAnimal} becomes more social and playful. {userName} helps create an adoption poster highlighting the pet's wonderful personality and special qualities.",
    "A loving family visits the shelter and immediately connects with the {favoriteAnimal} that {userName} has been helping. The adoption process goes smoothly, and the pet finds its perfect forever home.",
    "{userName} feels incredible joy knowing they helped an animal find happiness and safety. They continue volunteering, understanding that small acts of kindness can make a huge difference in the world."
  ],
  [
    "{userName} starts a neighborhood newspaper to keep everyone informed about local events and interesting stories. They interview neighbors, write articles about community happenings, and learn about journalism and communication skills.",
    "The first issue includes articles about the new playground, Mrs. Garcia's award-winning garden, and tips for keeping pets safe. {userName} also adds a section featuring {favoriteColor} artwork from local children.",
    "Neighbors love reading the newspaper and start submitting their own stories and pictures. The newspaper becomes a way for the community to stay connected and celebrate each other's achievements.",
    "Local businesses ask to advertise in the newspaper, helping {userName} earn money for better printing and supplies. They learn about business, budgeting, and the importance of providing quality service to customers.",
    "{userName} realizes that communication brings people together and creates stronger communities. They dream of becoming a professional journalist who tells important stories that help make the world better."
  ],
  [
    "{userName} joins the school's environmental protection club and learns about recycling, conservation, and taking care of nature. They organize cleanup days, plant trees, and teach younger students about protecting the environment.",
    "The club decides to create a school garden where students can grow vegetables and learn about sustainable farming. {userName} helps design the garden layout, choose appropriate plants, and create a watering schedule.",
    "Working in the garden teaches {userName} about responsibility, teamwork, and the connection between healthy soil and nutritious food. They enjoy eating fresh {favoriteFood} that they helped grow from tiny seeds.",
    "The garden project becomes so successful that other schools visit to learn about their methods. {userName} gives tours and explains how students can start their own environmental projects.",
    "{userName} develops a lifelong passion for environmental protection and sustainable living. They understand that taking care of our planet is everyone's responsibility and that young people can make a real difference."
  ]
];

export function getLevel2Template(templateIndex?: number): string[] {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_2_TEMPLATES.length) {
    return [...LEVEL_2_TEMPLATES[templateIndex]];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_2_TEMPLATES.length);
  return [...LEVEL_2_TEMPLATES[randomIndex]];
}

export function getLevel2TemplateCount(): number {
  return LEVEL_2_TEMPLATES.length;
}