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
        "Once upon a time, there was a {character} named {name}. {name} lived in a {setting}.",
        "{name} loved to play with {objects}. Every day, {name} would go outside and have fun.",
        "One sunny day, {name} found a special {object}. It was the most beautiful {object} ever!",
        "{name} decided to share the {object} with all the {characters} in the {setting}.",
        "Everyone was so happy! They all played together until the sun went down.",
        "From that day on, {name} and the {characters} were the best of friends.",
        "They learned that sharing makes everything more fun and special.",
        "And they all lived happily ever after in their wonderful {setting}."
      ],
      medium: [
        "In a {setting} far away, there lived a curious {character} named {name}.",
        "{name} had always wondered about the mysterious {object} that appeared every {time}.",
        "One day, {name} decided to investigate and discover the secret of the {object}.",
        "The journey led {name} through {places} where {name} met helpful {characters}.",
        "Each {character} taught {name} something important about {theme}.",
        "Together, they solved puzzles and overcame challenges using {objects}.",
        "Finally, {name} understood that the real treasure was the {theme} found along the way.",
        "With new friends and wisdom, {name} returned home to share the wonderful discoveries."
      ],
      hard: [
        "Long ago, in the {setting}, an extraordinary {character} named {name} embarked on a quest.",
        "The {character} possessed a unique ability to {action} whenever {condition} occurred.",
        "This gift became crucial when the {setting} faced a terrible crisis involving {problem}.",
        "{name} gathered a diverse group of {characters}, each contributing their special {skills}.",
        "Their adventure took them through treacherous {places} where they encountered {obstacles}.",
        "Using {objects} and their combined wisdom, they devised an ingenious plan to {solution}.",
        "The resolution required great sacrifice and demonstrated the power of {moral_lesson}.",
        "Their success restored harmony to the {setting} and inspired future generations."
      ],
      expert: [
        "In an era where {setting} was governed by ancient laws of {principle}, {name} emerged as an unlikely {role}.",
        "The {character} discovered that {mysterious_element} held the key to understanding {complex_concept}.",
        "This revelation challenged everything the inhabitants of {setting} had believed about {belief_system}.",
        "As {name} delved deeper into the mysteries, {pronoun} uncovered a conspiracy involving {antagonists}.",
        "The truth demanded that {name} choose between {difficult_choice_1} and {difficult_choice_2}.",
        "With the fate of {setting} hanging in the balance, {name} utilized {advanced_tools} to {complex_action}.",
        "The climactic confrontation revealed that {profound_truth} was the ultimate resolution.",
        "Through courage, wisdom, and {character_growth}, {name} transformed not only {setting} but {self_discovery}."
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
        "Había una vez un {character} llamado {name} que vivía en {setting}.",
        "A {name} le encantaba jugar con {objects} todos los días.",
        "Un día soleado, {name} encontró un {object} muy especial.",
        "Decidió compartir el {object} con todos los {characters} del {setting}.",
        "¡Todos estaban muy felices! Jugaron juntos hasta que se puso el sol.",
        "Desde ese día, {name} y los {characters} fueron los mejores amigos.",
        "Aprendieron que compartir hace todo más divertido y especial.",
        "Y todos vivieron felices para siempre en su maravilloso {setting}."
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
        "Il était une fois un {character} nommé {name} qui vivait dans {setting}.",
        "{name} adorait jouer avec {objects} tous les jours.",
        "Un jour ensoleillé, {name} a trouvé un {object} très spécial.",
        "Il a décidé de partager le {object} avec tous les {characters} du {setting}.",
        "Tout le monde était si heureux! Ils ont tous joué ensemble jusqu'au coucher du soleil.",
        "À partir de ce jour, {name} et les {characters} étaient les meilleurs amis.",
        "Ils ont appris que partager rend tout plus amusant et spécial.",
        "Et ils vécurent tous heureux pour toujours dans leur merveilleux {setting}."
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