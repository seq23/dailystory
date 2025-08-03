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
        "{name} wakes up early",
        "{pronoun} sees a {animal}",
        "The {animal} looks {color}",
        "{name} says hello nicely",
        "They become good friends",
        "{name} and {animal} play together",
        "They find some {food}",
        "{name} shares the {food}",
        "The {animal} is happy",
        "{name} smiles very happily"
      ],
      medium: [
        "{name} discovers a magical {setting} today",
        "A wise {animal} lives there happily",
        "The {animal} can talk to {name}",
        "It tells {name} some secret words",
        "A hidden {object} waits for discovery",
        "It has very special magical powers",
        "{name} must find it very quickly",
        "They search through the {color} forest",
        "Together they overcome all the challenges",
        "This magical adventure teaches {name} about friendship"
      ],
      hard: [
        "{name} lived peacefully in the beautiful {setting} with many friends",
        "One day something very strange and mysterious happened there",
        "The {animal}s started acting differently and seemed quite scared",
        "{name} noticed their fear and decided to help them",
        "{pronoun} bravely decided to investigate this very puzzling mystery",
        "With great courage {name} ventured into the unknown territory",
        "There {pronoun} discovered some {antagonist} creatures causing trouble everywhere",
        "{name} had to make a very difficult and important choice",
        "Using special {skill} abilities {name} found the perfect solution",
        "The {setting} became peaceful again and {name} grew much wiser"
      ],
      expert: [
        "{name} began exploring the fascinating world of science and discovery",
        "Complex questions about nature and the universe seemed increasingly interesting and important",
        "A mysterious wise {animal} appeared unexpectedly offering guidance through unknown realms",
        "Together they carefully explored ancient mysteries hidden within the natural world",
        "{name} faced an important choice between personal desires and helping others",
        "The long challenging journey gradually revealed amazing truths about friendship and courage",
        "Through deep thinking and reflection {name} finally found lasting inner peace",
        "This transformative character growth completely changed {pronoun_possessive} understanding of life's principles",
        "Essential principles of kindness and balance became crystal clear to {name}",
        "{name} achieved a deeper understanding of friendship and {pronoun_possessive} purpose in life"
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