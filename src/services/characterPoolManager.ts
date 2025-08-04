import { UserInfo, DifficultyLevel } from '../types';

export interface Character {
  id: string;
  name: string;
  type: 'main' | 'family' | 'friend' | 'animal' | 'helper' | 'mentor' | 'antagonist';
  personality: string[];
  appearance: string;
  relationship: string;
  backstory?: string;
  favoriteThings?: string[];
  skills?: string[];
  catchphrase?: string;
}

export interface CharacterPool {
  main: Character;
  family: Character[];
  friends: Character[];
  animals: Character[];
  helpers: Character[];
  mentors: Character[];
  antagonists: Character[];
}

export class CharacterPoolManager {
  private static characterPools = new Map<string, CharacterPool>();

  static getCharacterHierarchy(difficulty: DifficultyLevel): {
    maxCharacters: number;
    requiredTypes: string[];
    optionalTypes: string[];
  } {
    switch (difficulty) {
      case 'easy':
        return {
          maxCharacters: 3,
          requiredTypes: ['main', 'family', 'animal'],
          optionalTypes: []
        };
      case 'medium':
        return {
          maxCharacters: 5,
          requiredTypes: ['main', 'family', 'friend', 'animal'],
          optionalTypes: ['helper']
        };
      case 'hard':
        return {
          maxCharacters: 6,
          requiredTypes: ['main', 'family', 'friend', 'animal', 'helper'],
          optionalTypes: ['mentor']
        };
      case 'expert':
        return {
          maxCharacters: 7,
          requiredTypes: ['main', 'family', 'friend', 'animal', 'helper', 'mentor'],
          optionalTypes: ['antagonist']
        };
      default:
        return {
          maxCharacters: 3,
          requiredTypes: ['main', 'family', 'animal'],
          optionalTypes: []
        };
    }
  }

  static generateCharacterPool(userInfo: UserInfo, difficulty: DifficultyLevel): CharacterPool {
    const userId = `${userInfo.name}_${userInfo.age}_${userInfo.nativeLanguage}`;
    
    // Check if character pool already exists
    if (this.characterPools.has(userId)) {
      return this.characterPools.get(userId)!;
    }

    const hierarchy = this.getCharacterHierarchy(difficulty);
    const pool: CharacterPool = {
      main: this.generateMainCharacter(userInfo),
      family: [],
      friends: [],
      animals: [],
      helpers: [],
      mentors: [],
      antagonists: []
    };

    // Generate required characters
    hierarchy.requiredTypes.forEach(type => {
      if (type !== 'main') {
        const characters = this.generateCharacterByType(type, userInfo, pool);
        (pool as any)[type] = characters;
      }
    });

    // Generate optional characters based on difficulty
    hierarchy.optionalTypes.forEach(type => {
      if (Math.random() > 0.3) { // 70% chance to include optional characters
        const characters = this.generateCharacterByType(type, userInfo, pool);
        (pool as any)[type] = characters;
      }
    });

    this.characterPools.set(userId, pool);
    return pool;
  }

  private static generateMainCharacter(userInfo: UserInfo): Character {
    const pronouns = this.getPronounsFromUserInfo(userInfo);
    
    return {
      id: 'main_character',
      name: userInfo.name,
      type: 'main',
      personality: this.generatePersonalityFromUserInfo(userInfo),
      appearance: this.generateAppearanceFromAvatar(userInfo),
      relationship: 'protagonist',
      backstory: `${userInfo.name} is a curious ${userInfo.age}-year-old who loves ${userInfo.favoriteAnimal}s and ${userInfo.hobbies}.`,
      favoriteThings: [userInfo.favoriteAnimal, userInfo.favoriteFood, userInfo.favoriteColor],
      skills: this.extractSkillsFromHobbies(userInfo.hobbies),
      catchphrase: this.generateCatchphrase(userInfo)
    };
  }

  private static generateCharacterByType(type: string, userInfo: UserInfo, existingPool: CharacterPool): Character[] {
    switch (type) {
      case 'family':
        return [this.generateFamilyMember(userInfo)];
      case 'friend':
        return [this.generateFriend(userInfo)];
      case 'animal':
        return [this.generateAnimalCompanion(userInfo)];
      case 'helper':
        return [this.generateHelper(userInfo)];
      case 'mentor':
        return [this.generateMentor(userInfo)];
      case 'antagonist':
        return [this.generateAntagonist(userInfo)];
      default:
        return [];
    }
  }

  private static generateFamilyMember(userInfo: UserInfo): Character {
    const familyNames = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Sister', 'Brother'];
    const randomName = familyNames[Math.floor(Math.random() * familyNames.length)];
    
    return {
      id: `family_${randomName.toLowerCase()}`,
      name: randomName,
      type: 'family',
      personality: ['loving', 'supportive', 'wise'],
      appearance: 'warm and caring',
      relationship: `${userInfo.name}'s ${randomName.toLowerCase()}`,
      favoriteThings: [userInfo.favoriteFood, 'family time'],
      skills: ['cooking', 'storytelling', 'hugging']
    };
  }

  private static generateFriend(userInfo: UserInfo): Character {
    const friendNames = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan'];
    const randomName = friendNames[Math.floor(Math.random() * friendNames.length)];
    
    return {
      id: `friend_${randomName.toLowerCase()}`,
      name: randomName,
      type: 'friend',
      personality: ['friendly', 'adventurous', 'loyal'],
      appearance: 'energetic and bright-eyed',
      relationship: `${userInfo.name}'s best friend`,
      favoriteThings: [userInfo.hobbies, 'playing games'],
      skills: ['making friends', 'solving puzzles', 'being brave']
    };
  }

  private static generateAnimalCompanion(userInfo: UserInfo): Character {
    const animalNames = ['Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Oliver'];
    const randomName = animalNames[Math.floor(Math.random() * animalNames.length)];
    const animal = userInfo.favoriteAnimal || 'dog';
    
    return {
      id: `animal_${randomName.toLowerCase()}`,
      name: randomName,
      type: 'animal',
      personality: ['playful', 'loyal', 'protective'],
      appearance: `a friendly ${animal}`,
      relationship: `${userInfo.name}'s ${animal} companion`,
      favoriteThings: [userInfo.favoriteFood, 'playing', 'adventures'],
      skills: ['finding things', 'being brave', 'making everyone happy'],
      catchphrase: animal === 'dog' ? 'Woof!' : animal === 'cat' ? 'Meow!' : 'Hello!'
    };
  }

  private static generateHelper(userInfo: UserInfo): Character {
    const helperTypes = ['teacher', 'librarian', 'neighbor', 'coach'];
    const helperType = helperTypes[Math.floor(Math.random() * helperTypes.length)];
    const helperNames = ['Mr. Peterson', 'Ms. Johnson', 'Mrs. Garcia', 'Mr. Chen'];
    const randomName = helperNames[Math.floor(Math.random() * helperNames.length)];
    
    return {
      id: `helper_${helperType}`,
      name: randomName,
      type: 'helper',
      personality: ['helpful', 'kind', 'encouraging'],
      appearance: 'friendly and approachable',
      relationship: `the ${helperType} who helps ${userInfo.name}`,
      favoriteThings: ['helping others', 'learning', 'sharing knowledge'],
      skills: ['teaching', 'problem-solving', 'encouraging others']
    };
  }

  private static generateMentor(userInfo: UserInfo): Character {
    const mentorTypes = ['wise owl', 'old wizard', 'experienced explorer', 'magical fairy'];
    const mentorType = mentorTypes[Math.floor(Math.random() * mentorTypes.length)];
    const mentorNames = ['Emma', 'Merlin', 'Explorer Joe', 'Fairy Sparkle'];
    const randomName = mentorNames[Math.floor(Math.random() * mentorNames.length)];
    
    return {
      id: `mentor_${mentorType.replace(' ', '_')}`,
      name: randomName,
      type: 'mentor',
      personality: ['wise', 'patient', 'mysterious'],
      appearance: `a ${mentorType}`,
      relationship: `${userInfo.name}'s guide and mentor`,
      favoriteThings: ['sharing wisdom', 'helping others grow', 'ancient knowledge'],
      skills: ['magic', 'wisdom', 'guidance', 'seeing the future'],
      catchphrase: 'Remember, young one...'
    };
  }

  private static generateAntagonist(userInfo: UserInfo): Character {
    const antagonistTypes = ['mischievous goblin', 'grumpy troll', 'tricky fox', 'confused dragon'];
    const antagonistType = antagonistTypes[Math.floor(Math.random() * antagonistTypes.length)];
    const antagonistNames = ['Grumble', 'Sneaky', 'Tricky', 'Confused Carl'];
    const randomName = antagonistNames[Math.floor(Math.random() * antagonistNames.length)];
    
    return {
      id: `antagonist_${antagonistType.replace(' ', '_')}`,
      name: randomName,
      type: 'antagonist',
      personality: ['mischievous', 'misunderstood', 'redeemable'],
      appearance: `a ${antagonistType}`,
      relationship: `the challenge ${userInfo.name} must overcome`,
      favoriteThings: ['causing harmless trouble', 'being understood', 'making friends'],
      skills: ['creating puzzles', 'hiding things', 'being tricky'],
      catchphrase: "You'll never figure this out!"
    };
  }

  private static generatePersonalityFromUserInfo(userInfo: UserInfo): string[] {
    const personalities = ['curious', 'brave', 'kind', 'creative'];
    const hobbiesMap: { [key: string]: string[] } = {
      'reading': ['intelligent', 'thoughtful'],
      'sports': ['active', 'determined'],
      'art': ['creative', 'imaginative'],
      'music': ['rhythmic', 'expressive'],
      'games': ['strategic', 'fun-loving']
    };

    const basePersonality = [...personalities];
    const hobbies = userInfo.hobbies.toLowerCase();
    
    Object.keys(hobbiesMap).forEach(hobby => {
      if (hobbies.includes(hobby)) {
        basePersonality.push(...hobbiesMap[hobby]);
      }
    });

    return [...new Set(basePersonality)].slice(0, 4);
  }

  private static generateAppearanceFromAvatar(userInfo: UserInfo): string {
    const { type, skinTone } = userInfo.avatar;
    return `a ${type} with ${skinTone} skin and bright, curious eyes`;
  }

  private static extractSkillsFromHobbies(hobbies: string): string[] {
    const skills = [];
    const hobbiesLower = hobbies.toLowerCase();
    
    if (hobbiesLower.includes('reading')) skills.push('reading');
    if (hobbiesLower.includes('sports') || hobbiesLower.includes('soccer') || hobbiesLower.includes('basketball')) skills.push('being athletic');
    if (hobbiesLower.includes('art') || hobbiesLower.includes('drawing') || hobbiesLower.includes('painting')) skills.push('creating art');
    if (hobbiesLower.includes('music') || hobbiesLower.includes('singing')) skills.push('making music');
    if (hobbiesLower.includes('games') || hobbiesLower.includes('puzzles')) skills.push('solving problems');
    
    return skills.length > 0 ? skills : ['being curious', 'learning new things'];
  }

  private static generateCatchphrase(userInfo: UserInfo): string {
    const catchphrases = [
      "Let's explore!",
      "I can do this!",
      "What an adventure!",
      "Time to discover!",
      "This is exciting!"
    ];
    return catchphrases[Math.floor(Math.random() * catchphrases.length)];
  }

  private static getPronounsFromUserInfo(userInfo: UserInfo): { subject: string; object: string; possessive: string } {
    switch (userInfo.avatar.type) {
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }

  static getCharacterPool(userInfo: UserInfo): CharacterPool | null {
    const userId = `${userInfo.name}_${userInfo.age}_${userInfo.nativeLanguage}`;
    return this.characterPools.get(userId) || null;
  }

  static resetCharacterPool(userInfo: UserInfo): void {
    const userId = `${userInfo.name}_${userInfo.age}_${userInfo.nativeLanguage}`;
    this.characterPools.delete(userId);
  }
}