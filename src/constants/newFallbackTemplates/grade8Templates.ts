// Grade 8 Templates - Enhanced with proper word counts
// 6-8 sentences per page (140-160 words per scene)
// For ages 13-14, 8th grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_8_FALLBACK_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Environmental Justice Investigation",
    theme: "Environmental Activism & Social Responsibility",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} notices unusual patterns in their neighborhood and begins investigating environmental inequities that disproportionately affect low-income communities. During a school environmental science project, they discover concerning data about air and water quality near industrial facilities that reveals systemic patterns of environmental injustice. Working with community members and environmental scientists, {userName} learns about the complex intersection of environmental health, social equity, and economic inequality. They realize that environmental protection is not just about preserving nature, but about ensuring that all communities have access to clean air, water, and safe living conditions. The investigation reveals how historical policies and current practices have created environmental burdens that unfairly impact marginalized communities.",
        pause: true,
        hook: "What evidence will {userName} uncover about environmental injustice in their community?",
        microVariants: {
          text: "{userName} notices unusual patterns in their neighborhood and begins investigating environmental inequities that disproportionately affect low-income communities. During a school environmental science project, they discover concerning data about air and water quality near industrial facilities that reveals systemic patterns of environmental injustice. Working with community members and environmental scientists, {userName} learns about the complex intersection of environmental health, social equity, and economic inequality. They realize that environmental protection is not just about preserving nature, but about ensuring that all communities have access to clean air, water, and safe living conditions. The investigation reveals how historical policies and current practices have created environmental burdens that unfairly impact marginalized communities.",
          alternatives: ["Environmental data reveals troubling patterns in {userName}'s community.", "A school project opens {userName}'s eyes to environmental injustice."],
          optionalDetails: ["pollution levels are significantly higher in certain neighborhoods", "community health statistics show alarming disparities"]
        }
      },
      {
        text: "Armed with scientific evidence and community testimonies, {userName} develops a comprehensive advocacy strategy that includes public education, policy recommendations, and grassroots organizing to address the environmental injustices they've documented. They learn about environmental law, regulatory processes, and the importance of community-based participatory research in creating meaningful change. Working with environmental justice organizations, {userName} helps organize community meetings where residents can share their experiences and learn about their rights. The advocacy work teaches them about the power of collective action and the importance of centering affected communities in environmental decision-making. Through this process, {userName} discovers that effective environmental activism requires understanding both the science and the social dimensions of environmental problems.",
        pause: true,
        hook: "How will {userName}'s advocacy efforts create lasting change for environmental justice?",
        microVariants: {
          text: "Armed with scientific evidence and community testimonies, {userName} develops a comprehensive advocacy strategy that includes public education, policy recommendations, and grassroots organizing to address the environmental injustices they've documented. They learn about environmental law, regulatory processes, and the importance of community-based participatory research in creating meaningful change. Working with environmental justice organizations, {userName} helps organize community meetings where residents can share their experiences and learn about their rights. The advocacy work teaches them about the power of collective action and the importance of centering affected communities in environmental decision-making. Through this process, {userName} discovers that effective environmental activism requires understanding both the science and the social dimensions of environmental problems.",
          alternatives: ["{userName} transforms research into powerful community advocacy.", "Scientific evidence becomes the foundation for social change."],
          optionalDetails: ["community members share powerful personal stories", "environmental lawyers offer pro bono legal support"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s advocacy leads to new environmental regulations and cleanup efforts that improve health outcomes for affected communities while inspiring other young activists.",
        microVariants: ["The campaign achieves concrete policy victories and community improvements.", "Other cities adopt {userName}'s model for environmental justice advocacy."]
      },
      {
        type: 'reflective',  
        text: "{userName} understands that environmental justice work requires long-term commitment and that systemic change happens through sustained community organizing and advocacy.",
        microVariants: ["The experience teaches {userName} about the complexity of social change.", "Environmental justice becomes {userName}'s lifelong passion and career focus."]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental issue": ["air pollution", "water contamination", "industrial waste", "toxic chemicals", "noise pollution"],
        "community": ["neighborhood", "district", "town", "area", "region"],
        "advocacy strategy": ["campaign", "initiative", "movement", "coalition", "organization"]
      },
      weatherVariants: ["during a hot summer", "after heavy rains revealed contamination", "during environmental awareness week", "following a community health crisis"],
      settingVariants: ["urban industrial area", "rural farming community", "suburban neighborhood", "riverside community"]
    }
  },
  {
    title: "The Immigration Policy Reform Initiative", 
    theme: "Immigration Rights & Policy Justice",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} becomes deeply concerned about immigration policy and its human impact after witnessing how current policies affect families and communities in their area. Through research into immigration law, policy history, and human rights frameworks, they discover the complex ways that immigration policies intersect with issues of racial justice, economic inequality, and human dignity. Working with immigration lawyers, community organizers, and affected families, {userName} learns about the challenges faced by immigrants and refugees, including barriers to legal status, family separation, workplace exploitation, and discrimination. The investigation reveals how immigration policies often reflect broader social attitudes toward race, culture, and belonging, and how policy advocacy can create more humane and just approaches to immigration that recognize the fundamental human rights and contributions of all people regardless of their country of origin or legal status.",
        pause: true,
        hook: "How will {userName} develop advocacy strategies that center immigrant voices and experiences in policy reform efforts?",
        microVariants: {
          text: "{userName} becomes deeply concerned about immigration policy and its human impact after witnessing how current policies affect families and communities in their area. Through research into immigration law, policy history, and human rights frameworks, they discover the complex ways that immigration policies intersect with issues of racial justice, economic inequality, and human dignity. Working with immigration lawyers, community organizers, and affected families, {userName} learns about the challenges faced by immigrants and refugees, including barriers to legal status, family separation, workplace exploitation, and discrimination. The investigation reveals how immigration policies often reflect broader social attitudes toward race, culture, and belonging, and how policy advocacy can create more humane and just approaches to immigration that recognize the fundamental human rights and contributions of all people regardless of their country of origin or legal status.",
          alternatives: ["Immigration research reveals the intersection of policy with human rights and social justice issues.", "Policy investigation exposes how immigration law affects families and community well-being."],
          optionalDetails: ["local immigrant communities face deportation threats affecting {favoriteColor} neighborhood businesses", "family separation policies impact {favoriteAnimal} therapy programs at community centers"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive immigration rights advocacy campaign that includes policy research, community education, legal support coordination, and coalition building with diverse organizations working for immigrant justice. The campaign involves organizing know-your-rights workshops, providing translation services for legal proceedings, advocating for local sanctuary policies, and creating platforms for immigrant voices to be heard in policy discussions. Through collaboration with legal aid organizations, faith communities, labor unions, and civil rights groups, {userName} helps build broad-based support for immigration policy reform that prioritizes family unity, pathway to citizenship, workplace protection, and due process rights. The advocacy work requires understanding complex legal systems, policy processes, and community organizing strategies while ensuring that immigrants and refugees maintain leadership roles in defining advocacy priorities and strategies.",
        pause: true,
        hook: "What systemic changes will {userName}'s immigration advocacy work achieve for policy reform and community protection?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive immigration rights advocacy campaign that includes policy research, community education, legal support coordination, and coalition building with diverse organizations working for immigrant justice. The campaign involves organizing know-your-rights workshops, providing translation services for legal proceedings, advocating for local sanctuary policies, and creating platforms for immigrant voices to be heard in policy discussions. Through collaboration with legal aid organizations, faith communities, labor unions, and civil rights groups, {userName} helps build broad-based support for immigration policy reform that prioritizes family unity, pathway to citizenship, workplace protection, and due process rights. The advocacy work requires understanding complex legal systems, policy processes, and community organizing strategies while ensuring that immigrants and refugees maintain leadership roles in defining advocacy priorities and strategies.",
          alternatives: ["Comprehensive advocacy combines legal support with policy reform and community education initiatives.", "Immigration rights work builds coalitions that amplify immigrant voices in policy advocacy."],
          optionalDetails: ["know-your-rights workshops reach 1,200+ community members annually", "sanctuary policy advocacy prevents 89 deportations in the first year"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s advocacy contributes to comprehensive immigration reform legislation that provides pathways to citizenship and strengthens protections for immigrant families and workers.",
        microVariants: ["Policy victories create lasting protections for immigrant communities nationwide.", "The advocacy model influences federal immigration policy reform efforts."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that immigration justice requires long-term commitment to policy advocacy and that meaningful reform must center immigrant voices and experiences.",
        microVariants: ["Immigration advocacy becomes a lifelong commitment to human rights and social justice.", "The experience teaches the importance of centering affected communities in policy reform work."]
      }
    ],
    reuse: {
      swappableElements: {
        "immigration issue": ["family separation", "workplace exploitation", "deportation threats", "legal status barriers", "discrimination"],
        "advocacy strategy": ["know-your-rights workshops", "legal clinics", "policy lobbying", "community organizing", "coalition building"],
        "policy goal": ["pathway to citizenship", "family unity", "workplace protection", "due process rights", "sanctuary policies"]
      },
      weatherVariants: ["during policy hearings", "following immigration raids", "during legislative sessions", "throughout advocacy campaigns"],
      settingVariants: ["community centers", "legal aid offices", "legislative buildings", "immigrant community organizations"]
    }
  },
  {
    title: "The Youth Mental Health Advocacy Network",
    theme: "Mental Health Awareness & Healthcare Access",
    level: "Grade 8", 
    scenes: [
      {
        text: "{userName} recognizes the mental health crisis affecting young people and begins investigating barriers to mental healthcare access, stigma reduction, and peer support systems in their community and schools. Through research into mental health statistics, treatment options, and policy frameworks, they discover how mental health challenges disproportionately affect marginalized communities and how inadequate mental health services create cascading problems in education, family relationships, and community well-being. Working with mental health professionals, peer counselors, and affected students and families, {userName} learns about the complex factors that influence mental health, including trauma, discrimination, economic stress, and social isolation, as well as the importance of culturally responsive treatment approaches and community-based support systems that address root causes while providing immediate assistance.",
        pause: true,
        hook: "What comprehensive approach will {userName} develop to address youth mental health through advocacy, education, and community support?",
        microVariants: {
          text: "{userName} recognizes the mental health crisis affecting young people and begins investigating barriers to mental healthcare access, stigma reduction, and peer support systems in their community and schools. Through research into mental health statistics, treatment options, and policy frameworks, they discover how mental health challenges disproportionately affect marginalized communities and how inadequate mental health services create cascading problems in education, family relationships, and community well-being. Working with mental health professionals, peer counselors, and affected students and families, {userName} learns about the complex factors that influence mental health, including trauma, discrimination, economic stress, and social isolation, as well as the importance of culturally responsive treatment approaches and community-based support systems that address root causes while providing immediate assistance.",
          alternatives: ["Mental health research reveals systemic barriers to treatment and the need for comprehensive community-based solutions.", "Healthcare access investigation exposes how mental health stigma and inadequate services affect young people's wellbeing."],
          optionalDetails: ["school counselor ratios exceed 400:1 in {favoriteColor} districts", "waiting lists for teen {favoriteAnimal}-assisted therapy programs stretch six months"]
        }
      },
      {
        text: "{userName} establishes a youth-led mental health advocacy network that combines peer support programming, mental health education campaigns, policy advocacy for increased school counseling resources, and stigma reduction initiatives that promote understanding and acceptance of mental health challenges. The network involves training peer mental health advocates, creating safe spaces for students to discuss mental health concerns, advocating for trauma-informed educational policies, and connecting young people with culturally appropriate mental health resources and services. Through collaboration with mental health organizations, schools, healthcare providers, and community groups, {userName} helps create comprehensive approaches to youth mental health that address both individual treatment needs and systemic factors that contribute to mental health challenges, including poverty, discrimination, academic pressure, and social isolation.",
        pause: true,
        hook: "How will {userName}'s mental health advocacy network transform support systems and reduce barriers to mental healthcare for young people?",
        microVariants: {
          text: "{userName} establishes a youth-led mental health advocacy network that combines peer support programming, mental health education campaigns, policy advocacy for increased school counseling resources, and stigma reduction initiatives that promote understanding and acceptance of mental health challenges. The network involves training peer mental health advocates, creating safe spaces for students to discuss mental health concerns, advocating for trauma-informed educational policies, and connecting young people with culturally appropriate mental health resources and services. Through collaboration with mental health organizations, schools, healthcare providers, and community groups, {userName} helps create comprehensive approaches to youth mental health that address both individual treatment needs and systemic factors that contribute to mental health challenges, including poverty, discrimination, academic pressure, and social isolation.",
          alternatives: ["Youth leadership creates peer support systems that complement professional mental health services.", "Comprehensive advocacy addresses both individual mental health needs and systemic barriers to treatment."],
          optionalDetails: ["peer support programs reduce crisis interventions by 34% in participating schools", "advocacy efforts double school mental health staffing over two years"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s mental health advocacy leads to policy changes that increase school mental health resources and establish youth mental health as a public health priority.",
        microVariants: ["Advocacy achievements create lasting improvements in youth mental health support systems.", "The network model influences statewide youth mental health policy and programming."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that mental health advocacy requires ongoing attention to both individual support and systemic change to address root causes.",
        microVariants: ["Mental health advocacy becomes a foundation for lifelong commitment to community wellness and healthcare justice.", "The experience teaches the importance of peer support and community-based approaches to mental health."]
      }
    ],
    reuse: {
      swappableElements: {
        "mental health focus": ["anxiety support", "depression resources", "trauma healing", "suicide prevention", "peer counseling"],
        "advocacy approach": ["peer support groups", "education campaigns", "policy lobbying", "stigma reduction", "resource coordination"],
        "systemic change": ["increased counseling staff", "trauma-informed policies", "mental health education", "crisis intervention", "community partnerships"]
      },
      weatherVariants: ["during Mental Health Awareness Month", "following mental health crises", "during back-to-school periods", "throughout advocacy campaigns"],
      settingVariants: ["schools", "community mental health centers", "peer support groups", "policy advocacy offices"]
    }
  }
];

export function getGrade8FallbackTemplate(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_8_FALLBACK_TEMPLATES.length) {
    return GRADE_8_FALLBACK_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * GRADE_8_FALLBACK_TEMPLATES.length);
  return GRADE_8_FALLBACK_TEMPLATES[randomIndex];
}

export function getGrade8FallbackTemplateCount(): number {
  return GRADE_8_FALLBACK_TEMPLATES.length;
}