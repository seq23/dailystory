import type { UserInfo } from "@/components/UserInfoForm";

export type StoryLanguage = "English" | "Spanish" | "French" | "German" | "Italian" | "Portuguese" | "Chinese" | "Japanese";
export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface CulturalContext {
  characterNames: {
    boy: string[];
    girl: string[];
    friends: string[];
  };
  settings: string[];
  foods: string[];
  activities: string[];
  greetings: string[];
  expressions: string[];
}

// Cultural contexts for different languages
const culturalContexts: Record<StoryLanguage, CulturalContext> = {
  English: {
    characterNames: {
      boy: ["Alex", "Sam", "Jamie", "Riley", "Taylor", "Jordan", "Casey"],
      girl: ["Emma", "Sofia", "Aria", "Luna", "Zoe", "Maya", "Lily"],
      friends: ["buddy", "friend", "pal", "mate"]
    },
    settings: ["park", "playground", "backyard", "neighborhood", "school garden", "library"],
    foods: ["cookies", "apples", "sandwiches", "juice", "pizza", "ice cream"],
    activities: ["playing", "exploring", "reading", "building", "creating", "discovering"],
    greetings: ["Hello", "Hi there", "Good morning", "Hey"],
    expressions: ["Wow!", "Amazing!", "That's great!", "Fantastic!", "Cool!"]
  },
  Spanish: {
    characterNames: {
      boy: ["Diego", "Carlos", "Miguel", "Alejandro", "Rafael", "Sebastián"],
      girl: ["Isabella", "Sofía", "Camila", "Valentina", "Lucía", "Elena"],
      friends: ["amigo", "amiga", "compañero", "compañera"]
    },
    settings: ["parque", "patio de juegos", "jardín", "vecindario", "jardín escolar", "biblioteca"],
    foods: ["galletas", "manzanas", "sándwiches", "jugo", "pizza", "helado"],
    activities: ["jugando", "explorando", "leyendo", "construyendo", "creando", "descubriendo"],
    greetings: ["Hola", "¡Hola!", "Buenos días", "¡Oye!"],
    expressions: ["¡Guau!", "¡Increíble!", "¡Qué genial!", "¡Fantástico!", "¡Genial!"]
  },
  French: {
    characterNames: {
      boy: ["Antoine", "Louis", "Gabriel", "Théo", "Nathan", "Lucas"],
      girl: ["Camille", "Emma", "Léa", "Chloé", "Manon", "Sarah"],
      friends: ["ami", "amie", "copain", "copine"]
    },
    settings: ["parc", "aire de jeux", "jardin", "quartier", "jardin d'école", "bibliothèque"],
    foods: ["biscuits", "pommes", "sandwichs", "jus", "pizza", "glace"],
    activities: ["jouant", "explorant", "lisant", "construisant", "créant", "découvrant"],
    greetings: ["Bonjour", "Salut", "Coucou", "Bonsoir"],
    expressions: ["Ouah!", "Incroyable!", "C'est super!", "Fantastique!", "Cool!"]
  },
  German: {
    characterNames: {
      boy: ["Max", "Leon", "Paul", "Ben", "Luca", "Felix"],
      girl: ["Emma", "Hannah", "Sofia", "Lina", "Ella", "Mia"],
      friends: ["Freund", "Freundin", "Kumpel"]
    },
    settings: ["Park", "Spielplatz", "Garten", "Nachbarschaft", "Schulgarten", "Bibliothek"],
    foods: ["Kekse", "Äpfel", "Sandwiches", "Saft", "Pizza", "Eis"],
    activities: ["spielend", "erkundend", "lesend", "bauend", "erschaffend", "entdeckend"],
    greetings: ["Hallo", "Hi", "Guten Morgen", "Hey"],
    expressions: ["Wow!", "Unglaublich!", "Das ist toll!", "Fantastisch!", "Cool!"]
  },
  Italian: {
    characterNames: {
      boy: ["Marco", "Luca", "Andrea", "Matteo", "Alessandro", "Lorenzo"],
      girl: ["Sofia", "Giulia", "Alice", "Aurora", "Emma", "Giorgia"],
      friends: ["amico", "amica", "compagno", "compagna"]
    },
    settings: ["parco", "parco giochi", "giardino", "quartiere", "giardino della scuola", "biblioteca"],
    foods: ["biscotti", "mele", "panini", "succo", "pizza", "gelato"],
    activities: ["giocando", "esplorando", "leggendo", "costruendo", "creando", "scoprendo"],
    greetings: ["Ciao", "Salve", "Buongiorno", "Ehi"],
    expressions: ["Wow!", "Incredibile!", "Fantastico!", "Magnifico!", "Figata!"]
  },
  Portuguese: {
    characterNames: {
      boy: ["João", "Pedro", "Lucas", "Gabriel", "Rafael", "Miguel"],
      girl: ["Maria", "Ana", "Sofia", "Beatriz", "Carolina", "Valentina"],
      friends: ["amigo", "amiga", "colega"]
    },
    settings: ["parque", "playground", "jardim", "vizinhança", "jardim da escola", "biblioteca"],
    foods: ["biscoitos", "maçãs", "sanduíches", "suco", "pizza", "sorvete"],
    activities: ["brincando", "explorando", "lendo", "construindo", "criando", "descobrindo"],
    greetings: ["Olá", "Oi", "Bom dia", "Ei"],
    expressions: ["Uau!", "Incrível!", "Que legal!", "Fantástico!", "Legal!"]
  },
  Chinese: {
    characterNames: {
      boy: ["小明", "小华", "小强", "小龙", "小杰", "小宇"],
      girl: ["小红", "小丽", "小美", "小雪", "小月", "小花"],
      friends: ["朋友", "好友", "同伴"]
    },
    settings: ["公园", "游乐场", "花园", "社区", "学校花园", "图书馆"],
    foods: ["饼干", "苹果", "三明治", "果汁", "比萨", "冰淇淋"],
    activities: ["玩耍", "探索", "阅读", "建造", "创造", "发现"],
    greetings: ["你好", "嗨", "早上好", "喂"],
    expressions: ["哇!", "太棒了!", "很好!", "太神奇了!", "酷!"]
  },
  Japanese: {
    characterNames: {
      boy: ["たけし", "ひろし", "あきら", "ゆうき", "だいすけ", "りょう"],
      girl: ["さくら", "ゆみ", "あい", "みか", "えみ", "りな"],
      friends: ["友達", "仲間", "お友達"]
    },
    settings: ["公園", "遊び場", "庭", "近所", "学校の庭", "図書館"],
    foods: ["クッキー", "りんご", "サンドイッチ", "ジュース", "ピザ", "アイスクリーム"],
    activities: ["遊んで", "探検して", "読んで", "作って", "創造して", "発見して"],
    greetings: ["こんにちは", "やあ", "おはよう", "ねえ"],
    expressions: ["わあ!", "すごい!", "いいね!", "素晴らしい!", "クール!"]
  }
};

export class MultilingualStoryService {
  
  static getCulturalContext(language: StoryLanguage): CulturalContext {
    return culturalContexts[language] || culturalContexts.English;
  }

  static getLocalizedCharacterName(userInfo: UserInfo, language: StoryLanguage): string {
    // If user already has a name, use it
    if (userInfo.name) {
      return userInfo.name;
    }

    const context = this.getCulturalContext(language);
    const names = userInfo.avatar.type === "boy" ? context.characterNames.boy : context.characterNames.girl;
    return names[Math.floor(Math.random() * names.length)];
  }

  static async translateStoryContent(
    englishStory: string[], 
    targetLanguage: StoryLanguage,
    userInfo: UserInfo,
    difficulty: DifficultyLevel
  ): Promise<string[]> {
    if (targetLanguage === "English") {
      return englishStory;
    }

    const context = this.getCulturalContext(targetLanguage);
    
    // Create a translation prompt that includes cultural context
    const translationPrompt = `
Translate the following children's story from English to ${targetLanguage}. 

IMPORTANT REQUIREMENTS:
1. Maintain age-appropriate vocabulary for ${difficulty} reading level
2. Use culturally appropriate names and references for ${targetLanguage}-speaking regions
3. Keep the same story structure and emotions
4. Ensure natural, fluent ${targetLanguage} that children would understand
5. Replace character names with culturally appropriate ones: ${context.characterNames.boy.join(', ')} for boys, ${context.characterNames.girl.join(', ')} for girls
6. Use appropriate expressions and greetings: ${context.expressions.join(', ')}

${difficulty === "easy" ? "Use very simple words and short sentences." : 
  difficulty === "medium" ? "Use age-appropriate vocabulary with clear sentences." :
  difficulty === "hard" ? "Use more advanced vocabulary with complex sentences." :
  "Use sophisticated vocabulary with literary style."}

Story to translate:
${englishStory.map((paragraph, i) => `${i + 1}. ${paragraph}`).join('\n')}

Provide ONLY the translated story paragraphs, numbered the same way:`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert translator specializing in children's literature. You create culturally appropriate, age-appropriate translations that maintain the magic and wonder of the original story while making it feel native to the target language and culture.`
            },
            {
              role: 'user',
              content: translationPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      const data = await response.json();
      const translatedText = data.choices[0].message.content;
      
      // Parse the numbered paragraphs back into an array
      const translatedParagraphs = translatedText
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return translatedParagraphs.length > 0 ? translatedParagraphs : englishStory;
    } catch (error) {
      console.error('Translation failed:', error);
      // Return original English story as fallback
      return englishStory;
    }
  }

  static generateNativeStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    language: StoryLanguage,
    extensionNumber: number = 0
  ): string[] {
    const context = this.getCulturalContext(language);
    const characterName = this.getLocalizedCharacterName(userInfo, language);
    
    // Generate stories directly in the target language for better cultural authenticity
    switch (language) {
      case "Spanish":
        return this.generateSpanishStory(userInfo, difficulty, characterName, context, extensionNumber);
      case "French":
        return this.generateFrenchStory(userInfo, difficulty, characterName, context, extensionNumber);
      case "German":
        return this.generateGermanStory(userInfo, difficulty, characterName, context, extensionNumber);
      case "Italian":
        return this.generateItalianStory(userInfo, difficulty, characterName, context, extensionNumber);
      case "Portuguese":
        return this.generatePortugueseStory(userInfo, difficulty, characterName, context, extensionNumber);
      case "Chinese":
        return this.generateChineseStory(userInfo, difficulty, characterName, context, extensionNumber);
      case "Japanese":
        return this.generateJapaneseStory(userInfo, difficulty, characterName, context, extensionNumber);
      default:
        // For English or any other language, fall back to English
        return [];
    }
  }

  private static generateSpanishStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    name: string,
    context: CulturalContext,
    extensionNumber: number
  ): string[] {
    const hobbies = (userInfo.hobbies && Array.isArray(userInfo.hobbies)) ? userInfo.hobbies.join(', ') : 'jugar';
    const friend = context.characterNames.friends[0];
    
    if (difficulty === "easy") {
      return [
        `${name} se despierta muy feliz. ¡El sol brilla en el cielo!`,
        `"¿Qué voy a hacer hoy?" pregunta ${name}. "¡Creo que voy a ${hobbies}!"`,
        `Sale de casa y va al ${context.settings[0]}. ¡Qué divertido!`,
        `"¡Hola, pájaros! ¡Hola, flores!" dice ${name} con alegría.`,
        `${name} encuentra un ${friend} muy especial para jugar.`,
        `Juntos se divierten mucho con ${hobbies}.`,
        `Cuando llega la noche, ${name} dice: "¡Qué día tan hermoso!"`,
        `Las estrellas salen a decir buenas noches. ${name} duerme feliz.`
      ];
    } else if (difficulty === "medium") {
      return [
        `${name} despertó una mañana soleada con ganas de aventura. Después de desayunar ${context.foods[1]}, decidió salir a explorar.`,
        `En el ${context.settings[0]} del barrio, ${name} descubrió algo mágico: un árbol que brillaba con luces doradas.`,
        `"${context.expressions[1]}" exclamó ${name}. Una voz suave salió del árbol: "He estado esperando a alguien como tú."`,
        `El árbol le explicó que necesitaba ayuda para encontrar sus hojas perdidas, que se habían volado con el viento.`,
        `${name} usó su amor por ${hobbies} para crear un plan creativo y encontrar las hojas mágicas.`,
        `Cada hoja encontrada hacía que el árbol brillara más fuerte, llenando todo el ${context.settings[0]} de magia.`,
        `"${context.expressions[3]}" dijo el árbol. "Has salvado la magia de nuestro ${context.settings[0]}."`,
        `${name} regresó a casa sabiendo que había vivido una aventura verdaderamente especial.`
      ];
    }
    // Add more difficulty levels as needed
    return [];
  }

  private static generateFrenchStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    name: string,
    context: CulturalContext,
    extensionNumber: number
  ): string[] {
    const hobbies = (userInfo.hobbies && Array.isArray(userInfo.hobbies)) ? userInfo.hobbies.join(', ') : 'jouer';
    
    if (difficulty === "easy") {
      return [
        `${name} se réveille le matin. Le soleil brille !`,
        `"Que vais-je faire ?" demande ${name}. "Je vais ${hobbies} !"`,
        `${name} sort et va au ${context.settings[0]}. C'est amusant !`,
        `"${context.greetings[0]}, oiseaux ! ${context.greetings[0]}, fleurs !" dit ${name}.`,
        `${name} trouve un ${context.characterNames.friends[0]} pour jouer.`,
        `Ils s'amusent beaucoup avec ${hobbies}.`,
        `Le soir, ${name} dit : "${context.expressions[2]} !"`,
        `Les étoiles disent bonne nuit. ${name} dort heureux.`
      ];
    }
    // Add more difficulty levels as needed
    return [];
  }

  // Add similar methods for other languages...
  private static generateGermanStory(userInfo: UserInfo, difficulty: DifficultyLevel, name: string, context: CulturalContext, extensionNumber: number): string[] {
    // Implementation for German stories
    return [];
  }

  private static generateItalianStory(userInfo: UserInfo, difficulty: DifficultyLevel, name: string, context: CulturalContext, extensionNumber: number): string[] {
    // Implementation for Italian stories
    return [];
  }

  private static generatePortugueseStory(userInfo: UserInfo, difficulty: DifficultyLevel, name: string, context: CulturalContext, extensionNumber: number): string[] {
    // Implementation for Portuguese stories
    return [];
  }

  private static generateChineseStory(userInfo: UserInfo, difficulty: DifficultyLevel, name: string, context: CulturalContext, extensionNumber: number): string[] {
    // Implementation for Chinese stories
    return [];
  }

  private static generateJapaneseStory(userInfo: UserInfo, difficulty: DifficultyLevel, name: string, context: CulturalContext, extensionNumber: number): string[] {
    // Implementation for Japanese stories
    return [];
  }
}