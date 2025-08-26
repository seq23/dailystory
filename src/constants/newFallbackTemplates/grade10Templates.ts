// Grade 10 Templates - Enhanced with proper word counts
// 7-8 sentences per page (160-180 words per scene)
// For ages 15-16, 10th grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_10_FALLBACK_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Climate Justice Leadership Initiative",
    theme: "Climate Change & Intergenerational Responsibility",
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} recognizes the urgent need for comprehensive climate action and begins developing a youth-led climate justice initiative that addresses both environmental sustainability and social equity concerns in their community. Through extensive research into climate science, environmental policy, and social justice frameworks, they discover how climate change disproportionately affects marginalized communities and how effective climate solutions must address these intersecting injustices. The initiative involves building coalitions with environmental organizations, social justice groups, youth activists, and community leaders to develop comprehensive policy proposals that prioritize both environmental protection and social equity. Working with climate scientists, policy experts, and community organizers, {userName} learns about the complex relationships between environmental degradation, economic inequality, and social justice. They study successful climate justice movements from around the world and develop strategies for creating locally relevant solutions that can be scaled to address global challenges while centering the voices and needs of affected communities.",
        pause: true,
        hook: "How will {userName} build a movement that addresses both climate change and social justice?",
        microVariants: {
          text: "{userName} recognizes the urgent need for comprehensive climate action and begins developing a youth-led climate justice initiative that addresses both environmental sustainability and social equity concerns in their community. Through extensive research into climate science, environmental policy, and social justice frameworks, they discover how climate change disproportionately affects marginalized communities and how effective climate solutions must address these intersecting injustices. The initiative involves building coalitions with environmental organizations, social justice groups, youth activists, and community leaders to develop comprehensive policy proposals that prioritize both environmental protection and social equity. Working with climate scientists, policy experts, and community organizers, {userName} learns about the complex relationships between environmental degradation, economic inequality, and social justice. They study successful climate justice movements from around the world and develop strategies for creating locally relevant solutions that can be scaled to address global challenges while centering the voices and needs of affected communities.",
          alternatives: ["Climate research reveals the intersection of environmental and social justice issues.", "{userName} discovers that effective climate action must address systemic inequalities."],
          optionalDetails: ["vulnerable communities face the greatest climate risks with the least resources for adaptation", "climate solutions must include economic justice and community empowerment components"]
        }
      },
      {
        text: "{userName} implements a multi-faceted climate justice campaign that includes policy advocacy, community education, direct action organizing, and the development of sustainable community-based solutions that address both environmental and economic challenges. The campaign involves organizing climate justice forums where community members can share their experiences with environmental impacts and participate in developing locally relevant solutions. Through collaboration with environmental justice organizations, renewable energy cooperatives, and sustainable agriculture initiatives, {userName} helps develop economic models that create green jobs while addressing environmental challenges. The work requires learning about renewable energy systems, sustainable agriculture, green infrastructure, environmental law, and community economic development strategies. As the initiative expands, {userName} discovers the importance of building intergenerational coalitions that respect both traditional ecological knowledge and cutting-edge climate science while ensuring that climate solutions create opportunities for economic justice and community empowerment rather than displacement or further marginalization.",
        pause: true,
        hook: "What lasting impact will {userName}'s climate justice initiative have on their community and beyond?",
        microVariants: {
          text: "{userName} implements a multi-faceted climate justice campaign that includes policy advocacy, community education, direct action organizing, and the development of sustainable community-based solutions that address both environmental and economic challenges. The campaign involves organizing climate justice forums where community members can share their experiences with environmental impacts and participate in developing locally relevant solutions. Through collaboration with environmental justice organizations, renewable energy cooperatives, and sustainable agriculture initiatives, {userName} helps develop economic models that create green jobs while addressing environmental challenges. The work requires learning about renewable energy systems, sustainable agriculture, green infrastructure, environmental law, and community economic development strategies. As the initiative expands, {userName} discovers the importance of building intergenerational coalitions that respect both traditional ecological knowledge and cutting-edge climate science while ensuring that climate solutions create opportunities for economic justice and community empowerment rather than displacement or further marginalization.",
          alternatives: ["Community-based solutions demonstrate that climate action can create economic opportunities.", "{userName}'s initiative proves that youth leadership can drive meaningful policy change."],
          optionalDetails: ["green jobs training programs provide pathways to economic stability", "traditional ecological knowledge informs innovative climate adaptation strategies"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s climate justice initiative influences regional climate policy and creates a replicable model for youth-led climate organizing that balances environmental protection with social and economic justice.",
        microVariants: ["The initiative catalyzes broader climate justice movements and achieves concrete policy victories.", "Other regions adopt {userName}'s model, creating a network of climate justice initiatives."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that addressing climate change requires long-term systemic transformation and that effective climate action must always center justice, equity, and community empowerment.",
        microVariants: ["The experience shapes {userName}'s understanding of interconnected social and environmental challenges.", "Climate justice organizing becomes {userName}'s foundation for lifelong advocacy and leadership."]
      }
    ],
    reuse: {
      swappableElements: {
        "climate solution": ["renewable energy", "sustainable agriculture", "green infrastructure", "carbon sequestration", "climate adaptation"],
        "organizing strategy": ["coalition building", "policy advocacy", "direct action", "community education", "voter mobilization"],
        "community benefit": ["green jobs", "energy democracy", "food security", "housing justice", "health equity"]
      },
      weatherVariants: ["during extreme weather events", "following climate policy announcements", "during Earth Week", "after environmental disasters"],
      settingVariants: ["community center", "environmental organization", "legislative building", "university campus", "neighborhood meeting"]
    }
  }
];

export function getGrade10FallbackTemplate(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_10_FALLBACK_TEMPLATES.length) {
    return GRADE_10_FALLBACK_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * GRADE_10_FALLBACK_TEMPLATES.length);
  return GRADE_10_FALLBACK_TEMPLATES[randomIndex];
}

export function getGrade10FallbackTemplateCount(): number {
  return GRADE_10_FALLBACK_TEMPLATES.length;
}