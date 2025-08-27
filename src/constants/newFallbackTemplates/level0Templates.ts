// Level 0 Templates (Ages 3-5) - Enhanced with improved personalization and picture book focus
// Generated with enhanced prompt including hobbies, special requests, and 70% vocabulary flexibility

export const LEVEL_0_TEMPLATES: string[][] = [
  ["{userName} runs fast.", "The {favoriteColor} slide waits.", "{userName} climbs up high.", "Down they go!", "Fun day outside."],
  ["{userName} sees {favoriteColor} car.", "Zoom zoom!", "Fast car goes.", "Beep beep!", "{userName} waves goodbye."],
  ["{userName} finds {favoriteAnimal}.", "Pet the soft fur.", "{favoriteAnimal} purrs loud.", "So warm and nice.", "Best friends now."],
  ["{userName} eats {favoriteFood}.", "Yummy in tummy.", "More please!", "All done now.", "Happy belly."],
  ["{userName} plays ball.", "{favoriteColor} ball rolls.", "Kick it far.", "Run get ball.", "Play again!"],
  ["{userName} sees bird.", "Bird flies high.", "Tweet tweet song.", "Pretty feathers.", "Bye bye bird."],
  ["{userName} hugs {favoriteAnimal}.", "Soft and warm.", "Love you lots.", "Snuggle time.", "Best friends."],
  ["{userName} paints picture.", "{favoriteColor} paint drips.", "Make nice art.", "Show to mom.", "Pretty picture."],
  ["{userName} rides bike.", "Pedal fast.", "{favoriteColor} wheels spin.", "Feel the wind.", "Fun ride."],
  ["{userName} builds tower.", "Stack blocks high.", "{favoriteColor} on top.", "So very tall.", "Great job!"],
  ["{userName} reads book.", "Look at pictures.", "Words tell story.", "Turn the page.", "Books are fun."],
  ["{userName} helps cook.", "Stir the pot.", "Smells so good.", "Taste a bit.", "Yummy food."],
  ["{userName} waters flowers.", "Pretty {favoriteColor} blooms.", "Grow big and tall.", "Bees buzz by.", "Garden nice."],
  ["{userName} feeds {favoriteAnimal}.", "Hungry pet waits.", "Chomp chomp food.", "Full belly now.", "Happy pet."],
  ["{userName} swims in pool.", "Splash splash water.", "{favoriteColor} floaties help.", "Kick feet fast.", "Swimming fun."],
  ["{userName} picks berries.", "Red ones taste sweet.", "Fill up basket.", "Share with friends.", "Yummy treats."],
  ["{userName} flies kite.", "{favoriteColor} kite soars.", "Wind lifts it up.", "String pulls tight.", "Sky dancing."],
  ["{userName} makes music.", "Drum goes boom boom.", "Sing happy song.", "Dance and move.", "Music magic."],
  ["{userName} blows bubbles.", "Round and shiny.", "Pop pop pop.", "More bubbles float.", "Bubble magic."],
  ["{userName} counts stars.", "One two three four.", "Twinkle bright lights.", "Make a wish.", "Night sky pretty."],
  ["{userName} jumps puddles.", "Splash in water.", "{favoriteColor} boots keep dry.", "Jump jump hop.", "Rainy day fun."],
  ["{userName} picks apples.", "Red ones hang low.", "Fill up bag full.", "Share with family.", "Apple treats."],
  ["{userName} makes sandcastles.", "Dig in warm sand.", "{favoriteColor} bucket helps.", "Build up high.", "Beach castle."],
  ["{userName} catches butterflies.", "Pretty wings flutter.", "Gentle in hands.", "Let them fly free.", "Butterfly friends."],
  ["{userName} slides down hill.", "Faster and faster.", "{favoriteColor} sled goes zoom.", "Snow flies by.", "Winter fun."],
  ["{userName} plants seeds.", "Dig small holes.", "Water every day.", "Watch them grow.", "Garden helpers."],
  ["{userName} makes soup.", "Chop up vegetables.", "Stir in big pot.", "Smells so good.", "Warm soup ready."],
  ["{userName} builds snowman.", "Roll big snowballs.", "{favoriteColor} hat on top.", "Carrot nose smile.", "Snow friend."],
  ["{userName} picks flowers.", "Pretty {favoriteColor} petals.", "Make nice bouquet.", "Give to mom.", "Flower love."],
  ["{userName} rides swing.", "Push feet to sky.", "Higher and higher.", "Feel like flying.", "Swing fun."],
  ["{userName} makes pancakes.", "Mix batter smooth.", "Pour on hot pan.", "Flip when ready.", "Breakfast yummy."],
  ["{userName} chases fireflies.", "Blink blink lights.", "Gentle in jar.", "Let them go free.", "Night magic."],
  ["{userName} rakes leaves.", "Big pile grows.", "Jump in middle.", "Leaves fly everywhere.", "Autumn fun."],
  ["{userName} feeds ducks.", "Bread crumbs float.", "Ducks swim over.", "Quack quack thanks.", "Pond friends."],
  ["{userName} makes cookies.", "Mix and stir.", "{favoriteColor} sprinkles on top.", "Bake until done.", "Sweet treats."],
  ["{userName} climbs tree.", "Branch by branch.", "See far away.", "{favoriteAnimal} visits too.", "Tree adventure."],
  ["{userName} makes fort.", "Blankets make walls.", "{favoriteColor} pillows inside.", "Secret hideout.", "Fort fun."],
  ["{userName} catches rain.", "Drops on tongue.", "Cool and fresh.", "Puddles form below.", "Rain dance."],
  ["{userName} makes pizza.", "Roll dough flat.", "{favoriteFood} on top.", "Cheese melts down.", "Pizza party."],
  ["{userName} watches clouds.", "Shapes change slow.", "That one looks like {favoriteAnimal}.", "Sky art show.", "Dream time."],
  ["{userName} makes ice cream.", "Mix and freeze.", "{favoriteColor} flavor best.", "Cold and sweet.", "Summer treat."],
  ["{userName} builds bridge.", "Sticks across water.", "Ants march over.", "Strong and steady.", "Bridge builder."],
  ["{userName} makes wind chimes.", "{favoriteColor} shells hang.", "Breeze makes music.", "Tinkle soft sounds.", "Wind songs."]
];

export function getLevel0Template(): string[] {
  const randomIndex = Math.floor(Math.random() * LEVEL_0_TEMPLATES.length);
  return LEVEL_0_TEMPLATES[randomIndex];
}

export function getLevel0TemplateCount(): number {
  return LEVEL_0_TEMPLATES.length;
}