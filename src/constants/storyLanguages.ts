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
        "{name} plays outside",
        "{name} finds {object}",
        "{character} is happy",
        "{name} loves {object}",
        "They see {character}",
        "{name} helps {character}",
        "Everyone plays together",
        "They are friends"
      ],
      medium: [
        "{name} discovers magical {setting} today",
        "{name} wondered about mysterious {object}",
        "One day {name} decided to investigate",
        "Journey led {name} through wonderful {places}",
        "Each {character} taught {name} about {theme}",
        "Together they solved puzzles using {objects}",
        "{name} understood that real treasure was",
        "With friends and wisdom {name} returned"
      ],
      hard: [
        "Long ago in {setting} extraordinary {character} named {name}",
        "The {character} possessed unique ability to {action} when",
        "This gift became crucial when {setting} faced terrible crisis",
        "{name} gathered diverse group of {characters} each contributing skills",
        "Their adventure took them through treacherous {places} where encountered",
        "Using {objects} and combined wisdom they devised ingenious plan",
        "Resolution required great sacrifice and demonstrated power of {moral_lesson}",
        "Success restored harmony to {setting} and inspired future"
      ],
      expert: [
        "In era where {setting} governed by ancient laws {name} emerged",
        "The {character} discovered that {mysterious_element} held key to understanding",
        "This revelation challenged everything inhabitants of {setting} believed about existence",
        "As {name} delved deeper into mysteries uncovered conspiracy involving {antagonists}",
        "Truth demanded that {name} choose between {difficult_choice_1} and {difficult_choice_2}",
        "With fate of {setting} hanging in balance {name} utilized tools",
        "Climactic confrontation revealed that {profound_truth} was ultimate resolution bringing peace",
        "Through courage wisdom and {character_growth} {name} transformed not only world"
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