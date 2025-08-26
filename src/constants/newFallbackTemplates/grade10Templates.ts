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
  },
  {
    title: "The Healthcare Access and Equity Campaign",
    theme: "Healthcare Justice & Universal Access",
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} recognizes that healthcare access remains a fundamental human rights issue and begins comprehensive research into how the current healthcare system creates barriers to care while perpetuating health disparities based on race, class, geography, and other factors that determine people's ability to access quality medical treatment. Through investigation into healthcare policy, insurance systems, medical debt, and health outcomes data, they discover how the commodification of healthcare creates situations where people's health and survival depend on their ability to pay rather than their medical needs, while structural racism and discrimination within healthcare systems create additional barriers for marginalized communities. Working with healthcare advocates, medical professionals, patients' rights organizations, and affected community members, {userName} learns about alternative healthcare models that prioritize universal access, preventive care, community health, and health equity while addressing social determinants of health including housing, food security, environmental conditions, and economic stability.",
        pause: true,
        hook: "What comprehensive healthcare justice strategy will {userName} develop to ensure healthcare access as a human right rather than a market commodity?",
        microVariants: {
          text: "{userName} recognizes that healthcare access remains a fundamental human rights issue and begins comprehensive research into how the current healthcare system creates barriers to care while perpetuating health disparities based on race, class, geography, and other factors that determine people's ability to access quality medical treatment. Through investigation into healthcare policy, insurance systems, medical debt, and health outcomes data, they discover how the commodification of healthcare creates situations where people's health and survival depend on their ability to pay rather than their medical needs, while structural racism and discrimination within healthcare systems create additional barriers for marginalized communities. Working with healthcare advocates, medical professionals, patients' rights organizations, and affected community members, {userName} learns about alternative healthcare models that prioritize universal access, preventive care, community health, and health equity while addressing social determinants of health including housing, food security, environmental conditions, and economic stability.",
          alternatives: ["Healthcare research reveals how market-based systems create barriers to care while perpetuating health inequities.", "Investigation exposes the need for healthcare systems that prioritize human rights over profit."],
          optionalDetails: ["medical debt affects 43% of families in {favoriteColor} neighborhoods", "nearest {favoriteAnimal}-assisted therapy clinic is 67 miles away from rural communities"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive healthcare justice campaign that includes advocacy for universal healthcare coverage, support for community health centers and preventive care programs, organizing against medical debt and insurance discrimination, and promoting policies that address social determinants of health through housing, nutrition, environmental, and economic justice initiatives. The campaign involves building coalitions with healthcare workers, patients' rights organizations, community health advocates, and affected individuals and families to advocate for healthcare systems that prioritize people's health over pharmaceutical and insurance company profits. Through legislative advocacy, community organizing, direct action campaigns, and public education efforts, {userName} helps advance understanding of healthcare as a human right while promoting policies that ensure everyone has access to quality care regardless of their ability to pay, immigration status, race, gender, or geographic location.",
        pause: true,
        hook: "How will {userName}'s healthcare justice advocacy create systemic changes that establish healthcare access as a guaranteed human right?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive healthcare justice campaign that includes advocacy for universal healthcare coverage, support for community health centers and preventive care programs, organizing against medical debt and insurance discrimination, and promoting policies that address social determinants of health through housing, nutrition, environmental, and economic justice initiatives. The campaign involves building coalitions with healthcare workers, patients' rights organizations, community health advocates, and affected individuals and families to advocate for healthcare systems that prioritize people's health over pharmaceutical and insurance company profits. Through legislative advocacy, community organizing, direct action campaigns, and public education efforts, {userName} helps advance understanding of healthcare as a human right while promoting policies that ensure everyone has access to quality care regardless of their ability to pay, immigration status, race, gender, or geographic location.",
          alternatives: ["Healthcare advocacy builds coalitions that center patient voices in healthcare policy reform.", "Campaign work demonstrates how universal healthcare can create better health outcomes while reducing costs."],
          optionalDetails: ["coalition advocacy leads to 34% increase in community health center funding", "universal healthcare pilot programs reduce emergency room visits by 28% while improving preventive care"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s healthcare justice work contributes to landmark legislation establishing universal healthcare coverage and eliminating medical debt as a barrier to care.",
        microVariants: ["Healthcare advocacy achieves comprehensive policy victories that establish healthcare access as a guaranteed human right.", "The campaign model influences national healthcare policy reform and universal coverage initiatives."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that healthcare justice requires ongoing commitment to addressing both healthcare access and the social conditions that determine community health outcomes.",
        microVariants: ["Healthcare advocacy becomes a lifelong commitment to health equity and universal access to care.", "The experience teaches that effective healthcare systems must address social determinants of health and prioritize prevention."]
      }
    ],
    reuse: {
      swappableElements: {
        "healthcare focus": ["universal coverage", "prescription drug costs", "mental health access", "reproductive rights", "disability justice"],
        "advocacy strategy": ["legislative campaigns", "coalition building", "direct action", "community education", "policy research"],
        "systemic change": ["universal healthcare", "community health centers", "preventive care", "health equity", "social determinants"]
      },
      weatherVariants: ["during legislative sessions", "following healthcare crises", "during Healthcare Justice Week", "throughout advocacy campaigns"],
      settingVariants: ["healthcare facilities", "legislative buildings", "community health centers", "patients' rights organizations"]
    }
  },
  {
    title: "The Democracy and Voting Rights Protection Initiative", 
    theme: "Democratic Participation & Voting Rights",
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} becomes deeply concerned about threats to democratic participation and voting rights after researching how voter suppression, gerrymandering, campaign finance inequality, and electoral systems create barriers to fair representation while undermining the principle that every person's voice should count equally in democratic decision-making. Through investigation into voting rights history, electoral policy, and civic participation data, they discover how systematic efforts to restrict voting access disproportionately affect communities of color, young people, people with disabilities, and low-income communities, while wealthy interests use campaign contributions and lobbying to influence policy outcomes in ways that contradict majority public opinion. Working with voting rights organizations, democracy reform advocates, community organizers, and affected community members, {userName} learns about strategies for protecting and expanding voting access, promoting fair representation, and ensuring that democratic institutions serve the interests of all people rather than concentrating political power among wealthy elites.",
        pause: true,
        hook: "What comprehensive democracy protection strategy will {userName} develop to ensure fair representation and equal access to democratic participation?",
        microVariants: {
          text: "{userName} becomes deeply concerned about threats to democratic participation and voting rights after researching how voter suppression, gerrymandering, campaign finance inequality, and electoral systems create barriers to fair representation while undermining the principle that every person's voice should count equally in democratic decision-making. Through investigation into voting rights history, electoral policy, and civic participation data, they discover how systematic efforts to restrict voting access disproportionately affect communities of color, young people, people with disabilities, and low-income communities, while wealthy interests use campaign contributions and lobbying to influence policy outcomes in ways that contradict majority public opinion. Working with voting rights organizations, democracy reform advocates, community organizers, and affected community members, {userName} learns about strategies for protecting and expanding voting access, promoting fair representation, and ensuring that democratic institutions serve the interests of all people rather than concentrating political power among wealthy elites.",
          alternatives: ["Democracy research reveals how voter suppression and money in politics undermine fair representation.", "Investigation exposes systematic barriers to democratic participation that require comprehensive reform."],
          optionalDetails: ["voter registration in {favoriteColor} districts drops 34% after new restrictions", "corporate {favoriteAnimal} industry contributions influence 67% of environmental policy votes"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive democracy protection campaign that includes voter registration and education drives, advocacy for voting rights restoration and expansion, organizing against gerrymandering and voter suppression, and promoting campaign finance reform to reduce the influence of wealthy interests in elections and policy-making. The campaign involves building coalitions with voting rights organizations, youth advocacy groups, community organizations, and democracy reform movements to advocate for policies that ensure fair elections, equal representation, and meaningful democratic participation for all eligible voters. Through voter education programs, legislative advocacy, litigation support, and grassroots organizing efforts, {userName} helps advance understanding of democratic principles while promoting reforms that strengthen voting access, fair representation, and government accountability to the people rather than special interests.",
        pause: true,
        hook: "How will {userName}'s democracy protection work create lasting reforms that ensure fair representation and equal access to democratic participation?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive democracy protection campaign that includes voter registration and education drives, advocacy for voting rights restoration and expansion, organizing against gerrymandering and voter suppression, and promoting campaign finance reform to reduce the influence of wealthy interests in elections and policy-making. The campaign involves building coalitions with voting rights organizations, youth advocacy groups, community organizations, and democracy reform movements to advocate for policies that ensure fair elections, equal representation, and meaningful democratic participation for all eligible voters. Through voter education programs, legislative advocacy, litigation support, and grassroots organizing efforts, {userName} helps advance understanding of democratic principles while promoting reforms that strengthen voting access, fair representation, and government accountability to the people rather than special interests.",
          alternatives: ["Democracy advocacy builds coalitions that center affected communities in voting rights protection efforts.", "Campaign work demonstrates how voting access and fair representation strengthen democratic institutions."],
          optionalDetails: ["voter registration drives register 12,000+ new voters before elections", "gerrymandering reform advocacy leads to fair redistricting that increases competitive elections by 23%"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s democracy protection work contributes to significant voting rights legislation and electoral reforms that expand access while reducing the influence of money in politics.",
        microVariants: ["Democracy advocacy achieves comprehensive reforms that strengthen voting rights and fair representation.", "The campaign model influences national voting rights protection and democracy reform initiatives."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that protecting democracy requires ongoing vigilance and organizing to ensure that democratic institutions serve all people rather than concentrated wealth and power.",
        microVariants: ["Democracy protection work becomes a lifelong commitment to voting rights and fair representation.", "The experience teaches that effective democracy requires both protecting existing rights and expanding access to participation."]
      }
    ],
    reuse: {
      swappableElements: {
        "democracy issue": ["voter suppression", "gerrymandering", "campaign finance", "electoral systems", "civic education"],
        "advocacy strategy": ["voter registration", "policy lobbying", "litigation support", "grassroots organizing", "civic education"],
        "reform goal": ["voting access", "fair representation", "campaign finance reform", "electoral integrity", "civic participation"]
      },
      weatherVariants: ["during election seasons", "following voting rights challenges", "during Democracy Week", "throughout legislative sessions"],
      settingVariants: ["voting locations", "legislative buildings", "community centers", "democracy advocacy organizations"]
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