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