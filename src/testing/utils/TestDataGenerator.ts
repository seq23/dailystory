// Test Data Generator Utility
import type { UserInfo } from '../../types';

export class TestDataGenerator {
  private readonly names = [
    'Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Morgan', 'Avery',
    'Luna', 'Nova', 'Phoenix', 'River', 'Sage', 'Sky', 'Storm', 'Wren',
    'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia',
    'Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas',
    'José', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Diego', 'Sofia',
    'Ahmed', 'Fatima', 'Omar', 'Aisha', 'Hassan', 'Zara', 'Khalid', 'Laila'
  ];

  private readonly grades = ['PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th+'];
  
  private readonly languages = ['en', 'es', 'fr', 'ar', 'zh', 'hi', 'pt'];
  
  private readonly goals = [
    'improve-english-reading',
    'learn-new-vocabulary',
    'develop-reading-habits',
    'reading-comprehension',
    'phonics-practice',
    'fun-storytelling'
  ];

  private readonly colors = [
    'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange', 'teal'
  ];

  private readonly animals = [
    'cat', 'dog', 'rabbit', 'hamster', 'bird', 'fish', 'turtle', 'butterfly',
    'lion', 'elephant', 'giraffe', 'monkey', 'panda', 'dolphin', 'whale', 'shark'
  ];

  private readonly hobbies = [
    'painting', 'dancing', 'singing', 'reading', 'sports', 'cooking',
    'gardening', 'building', 'exploring', 'crafting', 'music', 'games'
  ];

  private readonly foods = [
    'pizza', 'pasta', 'tacos', 'sushi', 'ice cream', 'cookies', 'fruit',
    'sandwiches', 'soup', 'rice', 'noodles', 'burgers', 'salad', 'cake'
  ];

  private readonly avatarTypes = ['boy', 'girl'] as const;
  private readonly skinTones = ['pale', 'light', 'medium', 'olive', 'dark'] as const;

  generateRandomUser(): UserInfo {
    const age = this.randomInt(3, 18);
    const grade = this.getGradeForAge(age);

    return {
      name: this.randomChoice(this.names),
      age,
      grade: grade as any,
      nativeLanguage: this.randomChoice(this.languages) as any,
      learningGoal: this.randomChoice(this.goals) as any,
      avatar: {
        type: this.randomChoice(this.avatarTypes),
        skinTone: this.randomChoice(this.skinTones)
      },
      favoriteColor: this.randomChoice(this.colors),
      favoriteAnimal: this.randomChoice(this.animals),
      hobbies: this.randomChoice(this.hobbies),
      favoriteFood: this.randomChoice(this.foods),
      specialRequest: this.generateSpecialRequest()
    };
  }

  generateEdgeCaseUser(): UserInfo {
    const edgeCases = [
      {
        name: '🚀 Rocket Kid',
        age: 3,
        grade: 'PreK' as const,
        specialRequest: 'I want stories about space adventures with robots and aliens!'
      },
      {
        name: 'A',
        age: 18,
        grade: '6th+' as const,
        specialRequest: ''
      },
      {
        name: 'María José Gonzalez-Smith',
        age: 10,
        grade: '4th' as const,
        specialRequest: 'Stories about family traditions and celebrations'
      },
      {
        name: 'Alexander Montgomery Fitzgerald III',
        age: 8,
        grade: '2nd' as const,
        specialRequest: 'I like mysteries and detective stories with puzzles to solve'
      }
    ];

    const baseCase = this.randomChoice(edgeCases);
    
    return {
      ...this.generateRandomUser(),
      ...baseCase
    };
  }

  generateInvalidUser(): Partial<UserInfo> {
    const invalidCases = [
      { name: '', age: 8 }, // Empty name
      { name: 'Valid Name', age: 2 }, // Too young
      { name: 'Valid Name', age: 25 }, // Too old
      { name: 'Valid Name', age: -5 }, // Negative age
      { name: 'Valid Name', age: 'eight' as any }, // Non-numeric age
      { name: 'A'.repeat(100), age: 8 }, // Name too long
      { name: 'Valid Name', age: 8, grade: 'Invalid Grade' as any }, // Invalid grade
    ];

    return this.randomChoice(invalidCases);
  }

  generateBatchUsers(count: number): UserInfo[] {
    return Array.from({ length: count }, () => this.generateRandomUser());
  }

  generateMultilingualUsers(): UserInfo[] {
    return this.languages.map(lang => ({
      ...this.generateRandomUser(),
      nativeLanguage: lang as any,
      name: this.getNameForLanguage(lang)
    }));
  }

  private randomChoice<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getGradeForAge(age: number): string {
    if (age <= 4) return 'PreK';
    if (age === 5) return 'K';
    if (age === 6) return '1st';
    if (age === 7) return '2nd';
    if (age === 8) return '3rd';
    if (age === 9) return '4th';
    if (age === 10) return '5th';
    return '6th+';
  }

  private generateSpecialRequest(): string {
    const requests = [
      'I love adventures with brave heroes',
      'Stories about friendship and kindness',
      'I want to learn about different countries',
      'Stories with animals that can talk',
      'Adventures in magical forests',
      'Stories about solving problems together',
      'I like stories about inventors and discoveries',
      'Adventures under the sea',
      'Stories about helping others',
      'I want stories about space exploration',
      ''
    ];

    return this.randomChoice(requests);
  }

  private getNameForLanguage(language: string): string {
    const namesByLanguage: Record<string, string[]> = {
      en: ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver'],
      es: ['María', 'José', 'Carmen', 'Carlos', 'Ana', 'Luis'],
      fr: ['Marie', 'Pierre', 'Claire', 'Jean', 'Sophie', 'Antoine'],
      ar: ['Fatima', 'Ahmed', 'Aisha', 'Omar', 'Zara', 'Hassan'],
      zh: ['Wei', 'Li', 'Ming', 'Hua', 'Jun', 'Mei'],
      hi: ['Priya', 'Arjun', 'Anjali', 'Rohan', 'Kavya', 'Aditya'],
      pt: ['Ana', 'João', 'Maria', 'Pedro', 'Sofia', 'Miguel']
    };

    const names = namesByLanguage[language] || namesByLanguage.en;
    return this.randomChoice(names);
  }

  // Stress testing helpers
  generateStressTestData(count: number = 1000): {
    users: UserInfo[];
    edgeCases: Partial<UserInfo>[];
    invalidUsers: Partial<UserInfo>[];
  } {
    return {
      users: this.generateBatchUsers(count * 0.7),
      edgeCases: Array.from({ length: Math.floor(count * 0.2) }, () => this.generateEdgeCaseUser()),
      invalidUsers: Array.from({ length: Math.floor(count * 0.1) }, () => this.generateInvalidUser())
    };
  }
}