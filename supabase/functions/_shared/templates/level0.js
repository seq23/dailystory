/**
 * Level 0 Templates (Ages 3-5) - 100 Templates with Mixed Sentence Lengths
 * 6-page stories for early readers using 2-6 word sentences
 * Optimized for 75-80% sight word compliance using Dolch Pre-Primer vocabulary
 */

// Template metadata for smart selection
export const LEVEL_0_METADATA = [
  // Daily Life Templates (1-20)
  { title: "Morning Routine", theme: "daily life" },
  { title: "Bedtime Story", theme: "daily life" },
  { title: "Meal Time", theme: "daily life" },
  { title: "Getting Dressed", theme: "daily life" },
  { title: "Cleaning Up", theme: "daily life" },
  { title: "Bath Time", theme: "daily life" },
  { title: "Cooking Together", theme: "daily life" },
  { title: "Family Time", theme: "daily life" },
  { title: "Chores", theme: "daily life" },
  { title: "Shopping", theme: "daily life" },
  { title: "Phone Call", theme: "daily life" },
  { title: "Reading Time", theme: "daily life" },
  { title: "Snack Time", theme: "daily life" },
  { title: "Waking Up", theme: "daily life" },
  { title: "House Work", theme: "daily life" },
  { title: "Getting Ready", theme: "daily life" },
  { title: "Dinner Time", theme: "daily life" },
  { title: "Quiet Time", theme: "daily life" },
  { title: "Helper", theme: "daily life" },
  { title: "Going to Bed", theme: "daily life" },
  
  // Healthcare Templates (21-30)
  { title: "Doctor Visit", theme: "health" },
  { title: "Dentist Visit", theme: "health" },
  { title: "Feeling Sick", theme: "health" },
  { title: "Taking Medicine", theme: "health" },
  { title: "Checkup", theme: "health" },
  { title: "Washing Hands", theme: "health" },
  { title: "Eating Healthy", theme: "health" },
  { title: "Exercise", theme: "health" },
  { title: "Bandage", theme: "health" },
  { title: "Sleep Well", theme: "health" },
  
  // Educational Templates (31-45)
  { title: "School Day", theme: "learning" },
  { title: "Reading Book", theme: "learning" },
  { title: "Writing", theme: "learning" },
  { title: "Counting", theme: "learning" },
  { title: "Library Visit", theme: "learning" },
  { title: "Art Time", theme: "learning" },
  { title: "Music Class", theme: "learning" },
  { title: "Learning Colors", theme: "learning" },
  { title: "Show and Tell", theme: "learning" },
  { title: "Science Fun", theme: "learning" },
  { title: "Puzzle Time", theme: "learning" },
  { title: "Computer Time", theme: "learning" },
  { title: "Alphabet", theme: "learning" },
  { title: "Math Fun", theme: "learning" },
  { title: "Learning Shapes", theme: "learning" },
  
  // Play & Recreation Templates (46-60)
  { title: "Playground Fun", theme: "play" },
  { title: "Ball Game", theme: "play" },
  { title: "Hide and Seek", theme: "play" },
  { title: "Bike Ride", theme: "play" },
  { title: "Swimming", theme: "play" },
  { title: "Tag Game", theme: "play" },
  { title: "Toy Cars", theme: "play" },
  { title: "Building Blocks", theme: "play" },
  { title: "Dancing", theme: "play" },
  { title: "Jump Rope", theme: "play" },
  { title: "Sandbox", theme: "play" },
  { title: "Slide Fun", theme: "play" },
  { title: "Tricycle", theme: "play" },
  { title: "Hopscotch", theme: "play" },
  { title: "Seesaw", theme: "play" },
  
  // Community Templates (61-70)
  { title: "Store Visit", theme: "community" },
  { title: "Fire Station", theme: "community" },
  { title: "Police Officer", theme: "community" },
  { title: "Post Office", theme: "community" },
  { title: "Library Visit", theme: "community" },
  { title: "Park Day", theme: "community" },
  { title: "Bus Ride", theme: "community" },
  { title: "Restaurant", theme: "community" },
  { title: "Zoo Trip", theme: "community" },
  { title: "Museum", theme: "community" },
  
  // Transportation Templates (71-80)
  { title: "Car Ride", theme: "transportation" },
  { title: "Train Journey", theme: "transportation" },
  { title: "Airplane", theme: "transportation" },
  { title: "Boat Trip", theme: "transportation" },
  { title: "Walking", theme: "transportation" },
  { title: "School Bus", theme: "transportation" },
  { title: "Skateboard", theme: "transportation" },
  { title: "Scooter", theme: "transportation" },
  { title: "Taxi Ride", theme: "transportation" },
  { title: "Subway", theme: "transportation" },
  
  // Animals & Pets Templates (81-90)
  { title: "Pet Dog", theme: "animals" },
  { title: "Pet Cat", theme: "animals" },
  { title: "Fish Tank", theme: "animals" },
  { title: "Bird Watching", theme: "animals" },
  { title: "Farm Animals", theme: "animals" },
  { title: "Pet Rabbit", theme: "animals" },
  { title: "Hamster", theme: "animals" },
  { title: "Horse Riding", theme: "animals" },
  { title: "Butterfly", theme: "animals" },
  { title: "Ant Farm", theme: "animals" },
  
  // Nature & Weather Templates (91-100)
  { title: "Sunny Day", theme: "nature" },
  { title: "Rainy Day", theme: "nature" },
  { title: "Snow Day", theme: "nature" },
  { title: "Garden", theme: "nature" },
  { title: "Flowers", theme: "nature" },
  { title: "Rainbow", theme: "nature" },
  { title: "Windy Day", theme: "nature" },
  { title: "Beach Day", theme: "nature" },
  { title: "Forest Walk", theme: "nature" },
  { title: "Star Night", theme: "nature" }
];

export const LEVEL_0_TEMPLATES = [
  // Daily Life Templates (1-20)
  
  // Template 1: Morning Routine  
  [
    "{userName} wakes up.", 
    "The sun is up.", 
    "{userName} eats {favoriteFood}.", 
    "{userName} does {hobbies}.", 
    "Get up now.", 
    "{userName} is ready."
  ],
  
  // Template 2: Bedtime Story
  [
    "Time for bed.", 
    "{userName} goes to bed.", 
    "The {favoriteColor} bed is soft.", 
    "{userName} likes {favoriteFood}.", 
    "Good night.", 
    "{userName} sleeps well."
  ],
  
  // Template 3: Meal Time
  [
    "Time to eat.", 
    "{userName} sees {favoriteFood}.", 
    "The {favoriteFood} is {favoriteColor}.", 
    "{userName} eats it up.", 
    "So good.", 
    "{userName} is full."
  ],
  
  // Template 4: Getting Dressed
  [
    "Time to dress.", 
    "{userName} puts on clothes.", 
    "The {favoriteColor} shirt is pretty.", 
    "{userName} does {hobbies}.", 
    "All done.", 
    "{userName} looks pretty."
  ],
  
  // Template 5: Cleaning Up
  [
    "{userName} cleans up.", 
    "{userName} puts toys away.", 
    "The room gets clean.", 
    "{userName} likes {favoriteColor} toys.", 
    "Good job.", 
    "{userName} likes clean."
  ],
  
  // Template 6: Bath Time
  [
    "Time for bath.", 
    "{userName} gets in water.", 
    "The water is warm.", 
    "{userName} plays in water.", 
    "So fun.", 
    "{userName} is clean."
  ],
  
  // Template 7: Cooking Together
  [
    "{userName} helps cook.", 
    "{userName} makes {favoriteFood}.", 
    "We make good food.", 
    "{userName} likes {hobbies}.", 
    "It smells good.", 
    "{userName} eats together."
  ],
  
  // Template 8: Family Time
  [
    "{userName} loves family.", 
    "{userName} plays together.", 
    "{userName} does {hobbies}.", 
    "{userName} eats {favoriteFood}.", 
    "So happy.", 
    "{userName} loves them."
  ],
  
  // Template 9: Chores
  [
    "{userName} helps out.", 
    "{userName} makes the bed.", 
    "The {favoriteColor} bed looks good.", 
    "{userName} does {hobbies}.", 
    "Good helper.", 
    "{userName} likes helping."
  ],
  
  // Template 10: Shopping
  [
    "{userName} goes shopping.", 
    "{userName} sees {favoriteFood}.", 
    "We get good food.", 
    "{userName} picks {favoriteColor} things.", 
    "Fill the cart.", 
    "{userName} loves shopping."
  ],
  
  // Template 11: Phone Call
  [
    "{userName} calls friend.", 
    "{userName} talks and talks.", 
    "{userName} says hello first.", 
    "{userName} likes {hobbies}.", 
    "So fun.", 
    "{userName} likes talking."
  ],
  
  // Template 12: Reading Time
  [
    "{userName} likes books.", 
    "{userName} gets a book.", 
    "The {favoriteColor} book is pretty.", 
    "{userName} reads while doing {hobbies}.", 
    "{userName} reads it.", 
    "{userName} loves books."
  ],
  
  // Template 13: Snack Time
  [
    "Time for snack.", 
    "{userName} gets {favoriteFood}.", 
    "{userName} is hungry.", 
    "The {favoriteColor} snack is good.", 
    "{userName} eats up.", 
    "{userName} is happy."
  ],
  
  // Template 14: Waking Up
  [
    "{userName} wakes up.", 
    "Time to get up.", 
    "{userName} starts the day.", 
    "{userName} does {hobbies}.", 
    "Good morning.", 
    "{userName} feels good."
  ],
  
  // Template 15: House Work
  [
    "Time to work.", 
    "{userName} helps work.", 
    "{userName} does good work.", 
    "{userName} likes {favoriteColor} tools.", 
    "Work hard.", 
    "{userName} likes working."
  ],
  
  // Template 16: Getting Ready
  [
    "{userName} gets ready.", 
    "{userName} puts on shoes.", 
    "The {favoriteColor} shoes are nice.", 
    "{userName} does {hobbies}.", 
    "All set.", 
    "{userName} goes now."
  ],
  
  // Template 17: Dinner Time
  [
    "Time for dinner.", 
    "{userName} sits at table.", 
    "{userName} eats {favoriteFood}.", 
    "The dinner is good.", 
    "So good.", 
    "{userName} eats together."
  ],
  
  // Template 18: Quiet Time
  [
    "Time to rest.", 
    "{userName} sits and rests.", 
    "{userName} is quiet.", 
    "{userName} likes {favoriteColor} pillows.", 
    "So quiet.", 
    "{userName} feels calm."
  ],
  
  // Template 19: Helper
  [
    "{userName} is helper.", 
    "{userName} helps work.", 
    "{userName} does {hobbies}.", 
    "The work gets done.", 
    "Good helper.", 
    "{userName} likes helping."
  ],
  
  // Template 20: Going to Bed
  [
    "Time for bed.", 
    "{userName} goes to bed.", 
    "{userName} sleeps all night.", 
    "The {favoriteColor} bed is warm.", 
    "Sleep well.", 
    "{userName} has sweet dreams."
  ],
  
  // Healthcare Templates (21-30)
  
  // Template 21: Doctor Visit
  [
    "{userName} sees the doctor.", 
    "Go to doctor today.", 
    "The doctor helps {userName}.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Feel good.", 
    "{userName} feels better."
  ],
  
  // Template 22: Dentist Visit
  [
    "{userName} sees the dentist.", 
    "Open mouth for dentist.", 
    "The dentist cleans teeth.", 
    "{userName} likes {favoriteColor} toothbrush.", 
    "Good teeth.", 
    "{userName}'s teeth shine."
  ],
  
  // Template 23: Feeling Sick
  [
    "{userName} feels sick.", 
    "{userName} needs to rest.", 
    "{userName} gets well soon.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Rest time.", 
    "{userName} is well."
  ],
  
  // Template 24: Taking Medicine
  [
    "{userName} takes medicine.", 
    "Medicine helps {userName}.", 
    "{userName} takes it now.", 
    "The medicine is {favoriteColor}.", 
    "Feel good.", 
    "{userName} feels good."
  ],
  
  // Template 25: Checkup
  [
    "{userName} gets checkup.", 
    "Go see doctor today.", 
    "The doctor looks at {userName}.", 
    "{userName} does {hobbies}.", 
    "All good.", 
    "{userName} is strong."
  ],
  
  // Template 26: Washing Hands
  [
    "{userName} washes hands.", 
    "Use water and soap.", 
    "{userName} cleans hands well.", 
    "The {favoriteColor} soap smells nice.", 
    "All clean.", 
    "{userName} has clean hands."
  ],
  
  // Template 27: Eating Healthy
  [
    "{userName} eats good food.", 
    "Good food helps {userName}.", 
    "{userName} eats it up.", 
    "{userName} likes {favoriteAnimal}s.", 
    "Stay strong.", 
    "{userName} feels strong."
  ],
  
  // Template 28: Exercise
  [
    "{userName} moves body.", 
    "Run and jump today.", 
    "{userName} does {hobbies}.", 
    "The play makes {userName} strong.", 
    "Feel strong.", 
    "{userName} is strong."
  ],
  
  // Template 29: Bandage
  [
    "{userName} needs bandage.", 
    "Put it on cut.", 
    "The {favoriteColor} bandage helps.", 
    "{userName} feels good now.", 
    "All better.", 
    "{userName} is better."
  ],
  
  // Template 30: Sleep Well
  [
    "{userName} sleeps good.", 
    "Sleep helps {userName} grow.", 
    "{userName} sleeps all night.", 
    "{userName} dreams of {favoriteAnimal}s.", 
    "Rest well.", 
    "{userName} feels good."
  ],
  
  // Educational Templates (31-45)
  
  // Template 31: School Day
  [
    "{userName} goes to school.", 
    "See new things today.", 
    "{userName} learns at school.", 
    "{userName} eats {favoriteFood}.", 
    "Learn lots.", 
    "{userName} loves school."
  ],
  
  // Template 32: Reading Book
  [
    "{userName} reads books.", 
    "Look at the words.", 
    "{userName} reads this book.", 
    "The {favoriteColor} book is good.", 
    "Good words.", 
    "{userName} loves reading."
  ],
  
  // Template 33: Writing
  [
    "{userName} writes words.", 
    "Make letters on paper.", 
    "{userName} writes name.", 
    "{userName} does {hobbies}.", 
    "Write more.", 
    "{userName} likes writing."
  ],
  
  // Template 34: Counting
  [
    "{userName} counts things.", 
    "One, two, three, four.", 
    "{userName} can count high.", 
    "{userName} likes {favoriteColor} numbers.", 
    "Count high.", 
    "{userName} loves counting."
  ],
  
  // Template 35: Library Visit
  [
    "{userName} goes to library.", 
    "Get books to read.", 
    "{userName} finds good books.", 
    "{userName} eats {favoriteFood}.", 
    "Pick books.", 
    "{userName} loves books."
  ],
  
  // Template 36: Art Time
  [
    "{userName} makes art.", 
    "Use {favoriteColor} paint today.", 
    "{userName} makes pretty art.", 
    "{userName} does {hobbies}.", 
    "So pretty.", 
    "{userName} loves art."
  ],
  
  // Template 37: Music Class
  [
    "{userName} makes music.", 
    "Sing a good song.", 
    "{userName} does {hobbies}.", 
    "The {favoriteColor} music is fun.", 
    "Sing loud.", 
    "{userName} loves music."
  ],
  
  // Template 38: Learning Colors
  [
    "{userName} sees colors.", 
    "{favoriteColor} is pretty.", 
    "{userName} can see all colors.", 
    "{userName} eats {favoriteFood}.", 
    "Pretty colors.", 
    "{userName} loves colors."
  ],
  
  // Template 39: Show and Tell
  [
    "{userName} shows things.", 
    "Tell about the toy.", 
    "{userName} shows this today.", 
    "The {favoriteColor} toy is fun.", 
    "Look here.", 
    "{userName} loves sharing."
  ],
  
  // Template 40: Science Fun
  [
    "{userName} learns science.", 
    "Look at how things work.", 
    "{userName} tries new things.", 
    "{userName} does {hobbies}.", 
    "Try this.", 
    "{userName} loves science."
  ],
  
  // Template 41: Puzzle Time
  [
    "{userName} does puzzles.", 
    "Put pieces together.", 
    "{userName} makes it work.", 
    "The {favoriteColor} puzzle is fun.", 
    "Fits good.", 
    "{userName} loves puzzles."
  ],
  
  // Template 42: Computer Time
  [
    "{userName} uses computer.", 
    "Look at the screen.", 
    "{userName} learns on computer.", 
    "{userName} does {hobbies}.", 
    "Type words.", 
    "{userName} loves computers."
  ],
  
  // Template 43: Alphabet
  [
    "{userName} learns letters.", 
    "A, B, C come first.", 
    "{userName} knows all letters.", 
    "The {favoriteColor} letters are fun.", 
    "Say letters.", 
    "{userName} loves letters."
  ],
  
  // Template 44: Math Fun
  [
    "{userName} does math.", 
    "Add one and one.", 
    "{userName} can add numbers.", 
    "{userName} eats {favoriteFood}.", 
    "Count up.", 
    "{userName} loves math."
  ],
  
  // Template 45: Learning Shapes
  [
    "{userName} sees shapes.", 
    "Circle, square, triangle here.", 
    "{userName} finds all shapes.", 
    "The {favoriteColor} shapes are fun.", 
    "Point out.", 
    "{userName} loves shapes."
  ],

  // Play & Recreation Templates (46-60)
  
  // Template 46: Playground Fun
  [
    "{userName} goes to playground.", 
    "Swing high on swing.", 
    "{userName} sees a {favoriteAnimal}.", 
    "{userName} does {hobbies}.", 
    "Play more.", 
    "{userName} loves playing."
  ],
  
  // Template 47: Ball Game
  [
    "{userName} plays ball.", 
    "Throw the {favoriteColor} ball.", 
    "{userName} catches the ball.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Catch it.", 
    "{userName} loves ball games."
  ],
  
  // Template 48: Hide and Seek
  [
    "{userName} plays hide.", 
    "Hide from friend now.", 
    "{userName} finds a spot.", 
    "{userName} does {hobbies}.", 
    "Find me.", 
    "{userName} loves hiding."
  ],
  
  // Template 49: Bike Ride
  [
    "{userName} rides bike.", 
    "Go fast on bike.", 
    "{userName} rides to park.", 
    "The {favoriteColor} bike is fast.", 
    "Go fast.", 
    "{userName} loves bikes."
  ],
  
  // Template 50: Swimming
  [
    "{userName} goes swimming.", 
    "Jump in water now.", 
    "{userName} splashes and plays.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Splash more.", 
    "{userName} loves water."
  ],
  
  // Template 51: Tag Game
  [
    "{userName} plays tag.", 
    "Run fast from friend.", 
    "{userName} runs and runs.", 
    "{userName} does {hobbies}.", 
    "Run fast.", 
    "{userName} loves running."
  ],
  
  // Template 52: Toy Cars
  [
    "{userName} plays with cars.", 
    "The {favoriteColor} car is fast.", 
    "{userName} makes car sounds.", 
    "{userName} likes {favoriteAnimal}s.", 
    "Vroom vroom.", 
    "{userName} loves cars."
  ],
  
  // Template 53: Building Blocks
  [
    "{userName} builds things.", 
    "Make tall tower today.", 
    "{userName} builds it high.", 
    "The {favoriteColor} blocks are fun.", 
    "Stack up.", 
    "{userName} loves building."
  ],
  
  // Template 54: Dancing
  [
    "{userName} dances now.", 
    "Move to good music.", 
    "{userName} does {hobbies}.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Spin around.", 
    "{userName} loves dancing."
  ],
  
  // Template 55: Jump Rope
  [
    "{userName} jumps rope.", 
    "Jump up and down.", 
    "{userName} jumps high.", 
    "The {favoriteColor} rope is fun.", 
    "Jump high.", 
    "{userName} loves jumping."
  ],
  
  // Template 56: Sandbox
  [
    "{userName} plays in sand.", 
    "Make sand castle.", 
    "{userName} digs in sand.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Dig more.", 
    "{userName} loves sand."
  ],
  
  // Template 57: Slide Fun
  [
    "{userName} goes on slide.", 
    "Climb up big slide.", 
    "{userName} goes down fast.", 
    "The {favoriteColor} slide is fun.", 
    "Slide down.", 
    "{userName} loves slides."
  ],
  
  // Template 58: Tricycle
  [
    "{userName} rides tricycle.", 
    "Go around big yard.", 
    "{userName} pedals fast.", 
    "{userName} does {hobbies}.", 
    "Pedal fast.", 
    "{userName} loves tricycles."
  ],
  
  // Template 59: Hopscotch
  [
    "{userName} plays hopscotch.", 
    "Hop on one foot.", 
    "{userName} hops and jumps.", 
    "The {favoriteColor} squares are fun.", 
    "Hop more.", 
    "{userName} loves hopscotch."
  ],
  
  // Template 60: Seesaw
  [
    "{userName} uses seesaw.", 
    "Go up and down.", 
    "{userName} sits with friend.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Up down.", 
    "{userName} loves seesaws."
  ],
  
  // Community Templates (61-70)
  
  // Template 61: Store Visit
  [
    "{userName} goes to store.", 
    "Buy {favoriteFood} at store.", 
    "{userName} helps friend shop.", 
    "{userName} does {hobbies}.", 
    "Pick out.", 
    "{userName} loves shopping."
  ],
  
  // Template 62: Fire Station
  [
    "{userName} sees firefighters.", 
    "The {favoriteColor} fire truck.", 
    "{userName} meets firefighters.", 
    "{userName} eats {favoriteFood}.", 
    "Help people.", 
    "{userName} loves firefighters."
  ],
  
  // Template 63: Police Officer
  [
    "{userName} meets police.", 
    "The police help stay safe.", 
    "{userName} waves to police.", 
    "{userName} does {hobbies}.", 
    "Stay safe.", 
    "{userName} loves police."
  ],
  
  // Template 64: Post Office
  [
    "{userName} mails letters.", 
    "Go to post office.", 
    "{userName} sends letter.", 
    "The {favoriteColor} mail goes far.", 
    "Send mail.", 
    "{userName} loves mail."
  ],
  
  // Template 65: Library
  [
    "{userName} visits library.", 
    "Get books to read.", 
    "{userName} finds good books.", 
    "{userName} eats {favoriteFood}.", 
    "Read lots.", 
    "{userName} loves libraries."
  ],
  
  // Template 66: Bank Visit
  [
    "{userName} goes to bank.", 
    "See where money lives.", 
    "{userName} learns about money.", 
    "The {favoriteColor} bank is big.", 
    "Save money.", 
    "{userName} loves banks."
  ],
  
  // Template 67: Barber Shop
  [
    "{userName} gets haircut.", 
    "Go get hair cut.", 
    "{userName} sits very still.", 
    "{userName} does {hobbies}.", 
    "Look good.", 
    "{userName} looks good."
  ],
  
  // Template 68: Restaurant
  [
    "{userName} eats out.", 
    "Go eat at restaurant.", 
    "{userName} orders {favoriteFood}.", 
    "The restaurant has good food.", 
    "Order food.", 
    "{userName} loves eating out."
  ],
  
  // Template 69: Park Walk
  [
    "{userName} walks in park.", 
    "See pretty flowers.", 
    "{userName} walks with friend.", 
    "The {favoriteColor} park is pretty.", 
    "Walk more.", 
    "{userName} loves parks."
  ],
  
  // Template 70: Grocery Store
  [
    "{userName} buys food.", 
    "Get {favoriteFood} from store.", 
    "{userName} helps pick food.", 
    "{userName} does {hobbies}.", 
    "Fill cart.", 
    "{userName} loves food shopping."
  ],
  
  // Transportation Templates (71-78)
  
  // Template 71: Car Ride
  [
    "{userName} rides in car.", 
    "Go fast in car.", 
    "{userName} sits in car.", 
    "The {favoriteColor} car is fast.", 
    "Go fast.", 
    "{userName} loves cars."
  ],
  
  // Template 72: Bus Trip
  [
    "{userName} rides bus.", 
    "The big bus comes.", 
    "{userName} gets on bus.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Get on.", 
    "{userName} loves buses."
  ],
  
  // Template 73: Train Ride
  [
    "{userName} rides train.", 
    "The long train goes.", 
    "{userName} sits on train.", 
    "{userName} does {hobbies}.", 
    "Go far.", 
    "{userName} loves trains."
  ],
  
  // Template 74: Walking
  [
    "{userName} walks there.", 
    "Use feet to go.", 
    "{userName} walks to park.", 
    "The {favoriteColor} shoes are good.", 
    "Walk fast.", 
    "{userName} loves walking."
  ],
  
  // Template 75: Airplane
  [
    "{userName} flies in airplane.", 
    "The big plane goes.", 
    "{userName} flies in sky.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Up high.", 
    "{userName} loves flying."
  ],
  
  // Template 76: Boat Ride
  [
    "{userName} rides boat.", 
    "The boat goes on water.", 
    "{userName} sails on water.", 
    "The {favoriteColor} boat is nice.", 
    "Sail away.", 
    "{userName} loves boats."
  ],
  
  // Template 77: Bicycle
  [
    "{userName} rides bicycle.", 
    "Pedal fast to go.", 
    "{userName} rides bicycle.", 
    "{userName} does {hobbies}.", 
    "Pedal fast.", 
    "{userName} loves bikes."
  ],
  
  // Template 78: Scooter
  [
    "{userName} rides scooter.", 
    "Push with foot.", 
    "{userName} rides fast scooter.", 
    "The {favoriteColor} scooter is fast.", 
    "Push fast.", 
    "{userName} loves scooters."
  ],
  
  // Special Occasions Templates (79-90)
  
  // Template 79: Birthday Party
  [
    "It's {userName}'s birthday.", 
    "{userName} is older.", 
    "The cake has {favoriteFood}.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Make wish.", 
    "{userName} is happy."
  ],
  
  // Template 80: Holiday Fun
  [
    "It's holiday time.", 
    "The family comes over.", 
    "{userName} helps make {favoriteFood}.", 
    "{userName} does {hobbies}.", 
    "Have fun.", 
    "{userName} loves holidays."
  ],
  
  // Template 81: Gift Giving
  [
    "{userName} gives gifts.", 
    "{userName} has gift.", 
    "The gift makes friend happy.", 
    "{userName} likes {favoriteAnimal}s.", 
    "Give more.", 
    "{userName} loves giving."
  ],
  
  // Template 82: New Year
  [
    "The new year is here.", 
    "The old year is done.", 
    "{userName} tries new things.", 
    "{userName} eats {favoriteFood}.", 
    "Start new.", 
    "{userName} is excited."
  ],
  
  // Template 83: Valentine's Day
  [
    "It's Valentine's Day.", 
    "{userName} loves family.", 
    "The day is about love.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Show love.", 
    "{userName} feels love."
  ],
  
  // Template 84: Halloween Fun
  [
    "It's Halloween time.", 
    "Put on fun costume.", 
    "{userName} dresses up.", 
    "{userName} does {hobbies}.", 
    "Look fun.", 
    "{userName} loves Halloween."
  ],
  
  // Template 85: Thanksgiving
  [
    "{userName} gives thanks.", 
    "{userName} is happy.", 
    "The family eats {favoriteFood}.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Feel happy.", 
    "{userName} is thankful."
  ],
  
  // Template 86: First Day
  [
    "It's {userName}'s first day.", 
    "Today is first day.", 
    "{userName} tries to do well.", 
    "{userName} does {hobbies}.", 
    "Do well.", 
    "{userName} feels good."
  ],
  
  // Template 87: Graduation
  [
    "{userName}'s graduation day.", 
    "{userName} did well.", 
    "The graduation makes {userName} happy.", 
    "{userName} eats {favoriteFood}.", 
    "Feel proud.", 
    "{userName} is proud."
  ],
  
  // Template 88: Summer Fun
  [
    "It's summer time.", 
    "The sun is out.", 
    "{userName} plays outside.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Play outside.", 
    "{userName} loves summer."
  ],
  
  // Template 89: Winter Fun
  [
    "It's winter time.", 
    "The snow is here.", 
    "{userName} plays in snow.", 
    "{userName} does {hobbies}.", 
    "Play in snow.", 
    "{userName} loves winter."
  ],
  
  // Template 90: Spring Time
  [
    "It's spring time.", 
    "The flowers come out.", 
    "{userName} sees flowers.", 
    "{userName} likes {favoriteAnimal}s.", 
    "See flowers.", 
    "{userName} loves flowers."
  ],
  
  // Nature & Animals Templates (91-100)
  
  // Template 91: Pet Care
  [
    "{userName} feeds pet.", 
    "The {favoriteAnimal} needs food.", 
    "{userName} gives pet water.", 
    "{userName} does {hobbies}.", 
    "Pet is happy.", 
    "{userName} loves pets."
  ],
  
  // Template 92: Garden Time
  [
    "{userName} plants flowers.", 
    "Put seeds in dirt.", 
    "{userName} waters flowers.", 
    "The {favoriteColor} flowers grow.", 
    "Grow big.", 
    "{userName} loves gardens."
  ],
  
  // Template 93: Bird Watching
  [
    "{userName} watches birds.", 
    "The {favoriteAnimal} flies up.", 
    "{userName} looks for birds.", 
    "{userName} does {hobbies}.", 
    "Hear songs.", 
    "{userName} loves birds."
  ],
  
  // Template 94: Nature Walk
  [
    "{userName} walks outside.", 
    "See pretty trees.", 
    "{userName} looks at nature.", 
    "The {favoriteColor} trees are tall.", 
    "Look around.", 
    "{userName} loves nature."
  ],
  
  // Template 95: Rain Day
  [
    "The rain falls.", 
    "Water comes from sky.", 
    "{userName} watches rain.", 
    "{userName} sees a {favoriteAnimal}.", 
    "Watch rain.", 
    "{userName} likes rain."
  ],
  
  // Template 96: Sunny Day
  [
    "The sun shines.", 
    "The sun is up.", 
    "{userName} plays in sun.", 
    "The {favoriteColor} sun is warm.", 
    "Feel warm.", 
    "{userName} loves sunshine."
  ],
  
  // Template 97: Animal Friends
  [
    "{userName} sees animals.", 
    "The {favoriteAnimal} runs fast.", 
    "{userName} watches animals.", 
    "{userName} does {hobbies}.", 
    "Animals play.", 
    "{userName} loves animals."
  ],
  
  // Template 98: Beach Day
  [
    "{userName} goes to beach.", 
    "The sand is warm.", 
    "{userName} plays in sand.", 
    "The {favoriteColor} sand is fun.", 
    "Dig sand.", 
    "{userName} loves beaches."
  ],
  
  // Template 99: Forest Walk
  [
    "{userName} walks in forest.", 
    "The tall trees grow.", 
    "{userName} sees trees.", 
    "{userName} likes {favoriteAnimal}s.", 
    "Big trees.", 
    "{userName} loves trees."
  ],
  
  // Template 100: Star Night
  [
    "{userName} sees stars.", 
    "The stars shine up.", 
    "{userName} looks at stars.", 
    "{userName} does {hobbies}.", 
    "Look up.", 
    "{userName} loves stars."
  ]
];

/**
 * Get a random Level 0 template
 * @param templateIndex Optional specific index, otherwise random
 * @returns Array of 6 sentences
 */
export function getLevel0Template(templateIndex) {
  if (templateIndex >= 0 && templateIndex < LEVEL_0_TEMPLATES.length) {
    return LEVEL_0_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_0_TEMPLATES.length);
  return LEVEL_0_TEMPLATES[randomIndex];
}

/**
 * Get the total count of Level 0 templates
 * @returns Number of templates (100)
 */
export function getLevel0TemplateCount() {
  return LEVEL_0_TEMPLATES.length;
}

/**
 * Get Level 0 template metadata for smart selection
 * @returns Array of metadata objects with title and theme
 */
export function getLevel0TemplateMetadata() {
  return LEVEL_0_METADATA;
}