import { LanguageStoryConfig } from "@/types/multilingual";

export const STORY_LANGUAGES: Record<string, LanguageStoryConfig> = {
  en: {
    language: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    enabled: true,
    templateSets: {
      easy: [
        "{name} wakes up on a beautiful sunny morning and decides to explore the colorful garden outside where wonderful adventures await.",
        "{name} discovers a magical {object} hidden beneath the big oak tree and realizes it has special powers that make everything sparkle.",
        "The friendly {character} approaches {name} with a warm smile and invites them to join in a fun game of hide and seek.",
        "{name} loves spending time with the amazing {object} because it brings so much joy and happiness to every single day.",
        "They see a wonderful {character} dancing merrily in the meadow and decide to learn the special steps together with great enthusiasm.",
        "{name} helps the kind {character} by sharing toys and snacks, creating a beautiful friendship that will last for many years to come.",
        "Everyone plays together happily in the sunshine, laughing and singing songs while enjoying the most wonderful day of the entire week.",
        "They become the very best friends forever, promising to always help each other and share many more exciting adventures in the future."
      ],
      medium: [
        "In a {setting} far away from the bustling city, there lived a very curious and adventurous {character} named {name} who loved exploring new places every day.",
        "{name} had always wondered about the mysterious and enchanting {object} that appeared magically every {time} when the stars began to twinkle in the dark sky above.",
        "One bright and sunny day, {name} decided to investigate carefully and discover the amazing secret of the {object} that had puzzled everyone for many years.",
        "The exciting journey led {name} through beautiful {places} where {name} met many helpful and kind {characters} who shared their wisdom and knowledge.",
        "Each wise {character} taught {name} something very important and valuable about {theme}, helping to understand the deeper meaning of life and friendship.",
        "Together, they solved difficult puzzles and overcame challenging obstacles using special {objects} and their combined intelligence, creativity, and determination to succeed.",
        "Finally, after many adventures and discoveries, {name} understood that the real treasure was not gold or jewels, but the {theme} found along the way.",
        "With new friends and valuable wisdom gained from the journey, {name} returned home safely to share the wonderful discoveries with family and loved ones."
      ],
      hard: [
        "Long ago, in the magnificent and mystical {setting} where ancient magic still flows through every stone and tree, an extraordinary {character} named {name} embarked on a dangerous but important quest to save their homeland.",
        "The brave {character} possessed a unique and powerful ability to {action} whenever the special {condition} occurred during the most challenging moments, making them the perfect hero for this important mission.",
        "This incredible gift became absolutely crucial when the peaceful {setting} faced a terrible and threatening crisis involving the dangerous {problem} that could destroy everything they held dear and sacred.",
        "{name} gathered a diverse and skilled group of {characters} from different lands, each contributing their special {skills}, knowledge, and experience to help solve this enormous challenge.",
        "Their perilous adventure took them through treacherous and mysterious {places} where they encountered frightening {obstacles}, solved complex riddles, and faced their deepest fears with courage and determination.",
        "Using magical {objects} and their combined wisdom, intelligence, and teamwork, they carefully devised an ingenious and clever plan to {solution} and restore peace to their beloved homeland.",
        "The final resolution required great sacrifice, tremendous courage, and unwavering faith, ultimately demonstrating the incredible power of {moral_lesson} and the strength found in working together as one united team.",
        "Their remarkable success restored harmony and joy to the {setting} and inspired future generations to always believe in themselves and the power of friendship, kindness, and perseverance."
      ],
      expert: [
        "In an era where the ancient and sophisticated {setting} was governed by complex laws of {principle} that had been established over countless centuries, {name} emerged as an unlikely but destined {role} who would change the course of history forever.",
        "The brilliant {character} discovered that the enigmatic {mysterious_element} held the key to understanding the profound {complex_concept} that had puzzled scholars, philosophers, and scientists for generations of intellectual pursuit and research.",
        "This groundbreaking revelation challenged everything the inhabitants of {setting} had believed about {belief_system}, forcing them to question their fundamental assumptions, values, and understanding of reality itself and their place within the universe.",
        "As {name} delved deeper into the intricate mysteries using advanced research methods and careful analysis, {pronoun} uncovered a complex conspiracy involving powerful {antagonists} who sought to control knowledge and manipulate truth for their own selfish purposes.",
        "The shocking truth demanded that {name} choose between {difficult_choice_1} and {difficult_choice_2}, knowing that either decision would have far-reaching consequences that could affect the lives of countless innocent people and future generations.",
        "With the fate of {setting} hanging precariously in the balance, {name} utilized sophisticated {advanced_tools} and innovative thinking to {complex_action}, combining science, wisdom, and intuition in unprecedented ways to find a solution.",
        "The climactic confrontation revealed that {profound_truth} was the ultimate resolution, demonstrating that knowledge, compassion, and understanding are more powerful than force, deception, or the pursuit of personal gain at others' expense.",
        "Through remarkable courage, hard-earned wisdom, and significant {character_growth}, {name} transformed not only {setting} but also achieved profound {self_discovery}, inspiring others to seek truth, embrace change, and work together for the greater good."
      ]
    },
    culturalAdaptations: {
      characterNames: ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Morgan'],
      settings: ['magical forest', 'cozy village', 'bustling city', 'peaceful meadow', 'mysterious castle'],
      activities: ['exploring', 'learning', 'helping others', 'solving puzzles', 'making friends']
    }
  },
  es: {
    language: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    enabled: false, // Will be enabled in future phases
    templateSets: {
      easy: [
        "{name} juega afuera.",
        "{name} encuentra un {object}.",
        "El {character} está feliz.",
        "{name} ama el {object}.",
        "Ellos ven un {character}.",
        "{name} ayuda al {character}.",
        "Todos juegan juntos.",
        "Son mejores amigos."
      ],
      medium: [
        "En un {setting} lejano, vivía un {character} curioso llamado {name}.",
        "{name} siempre se había preguntado sobre el misterioso {object} que aparecía cada {time}.",
        "Un día, {name} decidió investigar y descubrir el secreto del {object}.",
        "El viaje llevó a {name} a través de {places} donde conoció a {characters} útiles.",
        "Cada {character} le enseñó a {name} algo importante sobre {theme}.",
        "Juntos, resolvieron acertijos y superaron desafíos usando {objects}.",
        "Finalmente, {name} entendió que el verdadero tesoro era {theme} encontrado en el camino.",
        "Con nuevos amigos y sabiduría, {name} regresó a casa para compartir los maravillosos descubrimientos."
      ],
      hard: [
        "Hace mucho tiempo, en el {setting}, un {character} extraordinario llamado {name} emprendió una misión.",
        "El {character} poseía una habilidad única para {action} cuando {condition} ocurría.",
        "Este don se volvió crucial cuando el {setting} enfrentó una terrible crisis que involucraba {problem}.",
        "{name} reunió un grupo diverso de {characters}, cada uno contribuyendo con sus {skills} especiales.",
        "Su aventura los llevó a través de {places} traicioneros donde encontraron {obstacles}.",
        "Usando {objects} y su sabiduría combinada, idearon un plan ingenioso para {solution}.",
        "La resolución requirió gran sacrificio y demostró el poder de {moral_lesson}.",
        "Su éxito restauró la armonía al {setting} e inspiró a las generaciones futuras."
      ],
      expert: [
        "En una era donde {setting} se regía por las leyes antiguas de {principle}, {name} surgió como un {role} improbable.",
        "El {character} descubrió que {mysterious_element} tenía la clave para entender {complex_concept}.",
        "Esta revelación desafió todo lo que los habitantes de {setting} habían creído sobre {belief_system}.",
        "Mientras {name} profundizaba en los misterios, {pronoun} descubrió una conspiración que involucraba {antagonists}.",
        "La verdad exigía que {name} eligiera entre {difficult_choice_1} y {difficult_choice_2}.",
        "Con el destino de {setting} en la balanza, {name} utilizó {advanced_tools} para {complex_action}.",
        "La confrontación climática reveló que {profound_truth} era la resolución definitiva.",
        "A través del coraje, la sabiduría y {character_growth}, {name} transformó no solo {setting} sino {self_discovery}."
      ]
    },
    culturalAdaptations: {
      characterNames: ['Ana', 'Carlos', 'María', 'José', 'Sofía', 'Diego', 'Luna', 'Mateo'],
      settings: ['bosque mágico', 'pueblo acogedor', 'ciudad bulliciosa', 'prado pacífico'],
      activities: ['explorar', 'aprender', 'ayudar a otros', 'resolver enigmas', 'hacer amigos']
    }
  },
  fr: {
    language: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    enabled: false,
    templateSets: {
      easy: [
        "{name} joue dehors.",
        "{name} trouve un {object}.",
        "Le {character} est content.",
        "{name} aime le {object}.",
        "Ils voient un {character}.",
        "{name} aide le {character}.",
        "Tous jouent ensemble.",
        "Ils sont meilleurs amis."
      ],
      medium: [
        "Dans un {setting} lointain, vivait un {character} curieux nommé {name}.",
        "{name} s'était toujours demandé à propos du mystérieux {object} qui apparaissait chaque {time}.",
        "Un jour, {name} décida d'enquêter et de découvrir le secret de l'{object}.",
        "Le voyage mena {name} à travers {places} où {name} rencontra des {characters} serviables.",
        "Chaque {character} enseigna à {name} quelque chose d'important sur {theme}.",
        "Ensemble, ils résolurent des énigmes et surmontèrent des défis en utilisant {objects}.",
        "Finalement, {name} comprit que le vrai trésor était {theme} trouvé en chemin.",
        "Avec de nouveaux amis et de la sagesse, {name} rentra chez lui pour partager les merveilleuses découvertes."
      ],
      hard: [
        "Il y a longtemps, dans le {setting}, un {character} extraordinaire nommé {name} entreprit une quête.",
        "Le {character} possédait une capacité unique à {action} chaque fois que {condition} se produisait.",
        "Ce don devint crucial quand le {setting} fit face à une terrible crise impliquant {problem}.",
        "{name} rassembla un groupe diversifié de {characters}, chacun contribuant avec ses {skills} spéciaux.",
        "Leur aventure les mena à travers des {places} traîtres où ils rencontrèrent {obstacles}.",
        "Utilisant {objects} et leur sagesse combinée, ils conçurent un plan ingénieux pour {solution}.",
        "La résolution nécessita un grand sacrifice et démontra le pouvoir de {moral_lesson}.",
        "Leur succès restaura l'harmonie au {setting} et inspira les générations futures."
      ],
      expert: [
        "À une époque où {setting} était gouverné par les lois anciennes de {principle}, {name} émergea comme un {role} improbable.",
        "Le {character} découvrit que {mysterious_element} détenait la clé pour comprendre {complex_concept}.",
        "Cette révélation défia tout ce que les habitants de {setting} avaient cru sur {belief_system}.",
        "Alors que {name} plongeait plus profondément dans les mystères, {pronoun} découvrit une conspiration impliquant {antagonists}.",
        "La vérité exigeait que {name} choisisse entre {difficult_choice_1} et {difficult_choice_2}.",
        "Avec le sort de {setting} en jeu, {name} utilisa {advanced_tools} pour {complex_action}.",
        "La confrontation culminante révéla que {profound_truth} était la résolution ultime.",
        "À travers le courage, la sagesse et {character_growth}, {name} transforma non seulement {setting} mais {self_discovery}."
      ]
    },
    culturalAdaptations: {
      characterNames: ['Pierre', 'Marie', 'Jean', 'Claire', 'Luc', 'Sophie', 'Antoine', 'Camille'],
      settings: ['forêt magique', 'village coquet', 'ville animée', 'prairie paisible'],
      activities: ['explorer', 'apprendre', 'aider les autres', 'résoudre des énigmes', 'se faire des amis']
    }
  }
};

export const getLanguageConfig = (language: string): LanguageStoryConfig | null => {
  return STORY_LANGUAGES[language] || null;
};

export const getEnabledLanguages = (): LanguageStoryConfig[] => {
  return Object.values(STORY_LANGUAGES).filter(lang => lang.enabled);
};

export const getLanguageTemplates = (language: string, difficulty: string): string[] => {
  const config = getLanguageConfig(language);
  if (!config) return [];
  
  return config.templateSets[difficulty as keyof typeof config.templateSets] || [];
};