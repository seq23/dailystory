// Level 0 Extension Templates - Migrated from Old System (7 templates)
// Enhanced templates following the improved Level 0 prompt specifications

// Universal Level 0 extension templates using enhanced prompt features:
// - Full personalization: {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies}, {specialRequest}
// - Complex scenarios and extended stories
// - Picture book focus with vivid imagery
// - 70% Enhanced Level 0 vocabulary compliance
// Each extension is a complete 6-page story template
export const LEVEL_0_EXTENSIONS: string[][] = [
  ["{userName} helps mommy.", "Clean up toys.", "Put in box.", "All done now.", "Good helper.", "Mommy happy."],
  ["{userName} goes shopping.", "Push the cart.", "Get some {favoriteFood}.", "Pay at store.", "Bags to car.", "Shopping done."],
  ["{userName} visits doctor.", "Check ears and mouth.", "All healthy.", "Get sticker.", "Doctor nice.", "Feel good."],
  ["{userName} goes to library.", "Look at books.", "Story time fun.", "Whisper quiet.", "Check out book.", "Read at home."],
  ["{userName} rides bus.", "Find empty seat.", "Look out window.", "See many things.", "Bus stops here.", "Time to go."],
  ["{userName} plants garden.", "Dig small holes.", "Put seeds in.", "Water every day.", "Watch them grow.", "Pretty flowers."],
  ["{userName} bakes cookies.", "Mix the dough.", "Use cookie cutters.", "Bake in oven.", "Cookies smell good.", "Share with friends."]
];

export function getLevel0Extension(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_0_EXTENSIONS.length);
  return LEVEL_0_EXTENSIONS[randomIndex];
}

export function getLevel0ExtensionCount(): number {
  return LEVEL_0_EXTENSIONS.length;
}

export function getAllLevel0Extensions(): string[][] {
  return LEVEL_0_EXTENSIONS;
}