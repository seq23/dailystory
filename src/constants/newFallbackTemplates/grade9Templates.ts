// Grade 9 Templates - Enhanced with proper word counts
// 7-8 sentences per page (160-180 words per scene)
// For ages 14-15, 9th grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_9_FALLBACK_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Digital Privacy Rights Campaign",
    theme: "Technology Ethics & Civil Liberties",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} becomes increasingly concerned about digital privacy and surveillance after learning about data collection practices through a computer science class project on algorithmic bias and digital rights. Through research into major technology companies, government surveillance programs, and data broker operations, they discover the extensive ways that personal information is collected, analyzed, and used without explicit consent. The investigation reveals how digital surveillance disproportionately affects marginalized communities and how data collection practices can reinforce existing social inequalities. Working with privacy advocates, digital rights organizations, and technology experts, {userName} begins to understand the complex intersection of technology, privacy, civil liberties, and social justice. They learn about the history of surveillance, the legal frameworks that govern data collection, and the ongoing struggles to balance security concerns with fundamental rights to privacy and freedom of expression.",
        pause: true,
        hook: "How will {userName} educate their community about digital privacy rights and surveillance?",
        microVariants: {
          text: "{userName} becomes increasingly concerned about digital privacy and surveillance after learning about data collection practices through a computer science class project on algorithmic bias and digital rights. Through research into major technology companies, government surveillance programs, and data broker operations, they discover the extensive ways that personal information is collected, analyzed, and used without explicit consent. The investigation reveals how digital surveillance disproportionately affects marginalized communities and how data collection practices can reinforce existing social inequalities. Working with privacy advocates, digital rights organizations, and technology experts, {userName} begins to understand the complex intersection of technology, privacy, civil liberties, and social justice. They learn about the history of surveillance, the legal frameworks that govern data collection, and the ongoing struggles to balance security concerns with fundamental rights to privacy and freedom of expression.",
          alternatives: ["A computer science project opens {userName}'s eyes to digital surveillance.", "Research reveals the hidden world of data collection and privacy violations."],
          optionalDetails: ["algorithms can perpetuate discrimination and bias", "surveillance technology is often tested on marginalized communities first"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive digital privacy education campaign that includes workshops for community members, policy advocacy for stronger privacy protections, and the creation of practical tools and resources to help people protect their digital rights. The campaign involves collaborating with civil liberties organizations, privacy researchers, and affected community members to develop culturally relevant and accessible educational materials. Through organizing community forums, conducting privacy audits, and teaching digital security workshops, {userName} helps people understand their rights and learn practical skills for protecting their privacy online. The work requires learning about encryption, secure communication tools, privacy-focused technologies, and the legal and policy frameworks that govern digital rights. As the campaign grows, {userName} discovers the importance of making privacy education accessible to diverse communities with varying levels of technological literacy and different cultural perspectives on privacy and security.",
        pause: true,
        hook: "What impact will {userName}'s digital privacy campaign have on policy and community awareness?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive digital privacy education campaign that includes workshops for community members, policy advocacy for stronger privacy protections, and the creation of practical tools and resources to help people protect their digital rights. The campaign involves collaborating with civil liberties organizations, privacy researchers, and affected community members to develop culturally relevant and accessible educational materials. Through organizing community forums, conducting privacy audits, and teaching digital security workshops, {userName} helps people understand their rights and learn practical skills for protecting their privacy online. The work requires learning about encryption, secure communication tools, privacy-focused technologies, and the legal and policy frameworks that govern digital rights. As the campaign grows, {userName} discovers the importance of making privacy education accessible to diverse communities with varying levels of technological literacy and different cultural perspectives on privacy and security.",
          alternatives: ["Educational workshops empower community members with privacy knowledge.", "{userName} creates accessible tools for digital self-defense and privacy protection."],
          optionalDetails: ["workshops are offered in multiple languages", "practical demonstrations help people understand abstract privacy concepts"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s campaign influences local privacy legislation and inspires a network of digital rights advocates who continue expanding privacy education and policy advocacy.",
        microVariants: ["The campaign achieves concrete policy victories and builds lasting advocacy infrastructure.", "Other communities adopt {userName}'s educational model for digital privacy awareness."]
      },
      {
        type: 'reflective',
        text: "{userName} recognizes that protecting digital privacy requires ongoing vigilance and that technology policy must center human rights and social justice principles.",
        microVariants: ["The experience teaches {userName} about the long-term nature of civil rights advocacy.", "Digital privacy becomes {userName}'s focus for future academic and career pursuits."]
      }
    ],
    reuse: {
      swappableElements: {
        "privacy concern": ["data mining", "facial recognition", "location tracking", "behavioral profiling", "algorithmic discrimination"],
        "education method": ["workshop", "seminar", "forum", "training session", "community meeting"],
        "privacy tool": ["encrypted messaging", "VPN services", "secure browsers", "privacy-focused apps", "digital security practices"]
      },
      weatherVariants: ["during Digital Privacy Week", "following a major data breach", "after new surveillance policies are announced", "during a technology conference"],
      settingVariants: ["community center", "library", "high school", "online platform", "civic organization"]
    }
  },
  {
    title: "The Criminal Justice Reform Campaign",
    theme: "Criminal Justice Reform & Community Safety",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} becomes aware of systemic problems in the criminal justice system after researching how incarceration rates, sentencing disparities, and policing practices disproportionately affect marginalized communities while failing to create genuine public safety or address root causes of crime. Through investigation into criminal justice statistics, policy research, and collaboration with formerly incarcerated individuals, family members, and criminal justice reform organizations, they discover how the current system perpetuates cycles of trauma and poverty while failing to provide rehabilitation, healing, or community restoration. The research reveals how mass incarceration intersects with issues of racial justice, economic inequality, education access, and mental health, and how alternative approaches to community safety can address harm while promoting healing and preventing future crime through investment in education, mental health services, economic opportunities, and restorative justice practices.",
        pause: true,
        hook: "What comprehensive criminal justice reform strategy will {userName} develop to promote community safety through healing and prevention rather than punishment?",
        microVariants: {
          text: "{userName} becomes aware of systemic problems in the criminal justice system after researching how incarceration rates, sentencing disparities, and policing practices disproportionately affect marginalized communities while failing to create genuine public safety or address root causes of crime. Through investigation into criminal justice statistics, policy research, and collaboration with formerly incarcerated individuals, family members, and criminal justice reform organizations, they discover how the current system perpetuates cycles of trauma and poverty while failing to provide rehabilitation, healing, or community restoration. The research reveals how mass incarceration intersects with issues of racial justice, economic inequality, education access, and mental health, and how alternative approaches to community safety can address harm while promoting healing and preventing future crime through investment in education, mental health services, economic opportunities, and restorative justice practices.",
          alternatives: ["Criminal justice research exposes how punitive approaches fail to create safety while perpetuating inequality.", "Investigation reveals the need for community-based alternatives to incarceration and punitive justice."],
          optionalDetails: ["local incarceration rates show 73% recidivism without {favoriteColor} community programs", "restorative justice circles reduce reoffending by 45% compared to traditional sentencing"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive criminal justice reform campaign that includes policy advocacy for sentencing reform, support for restorative justice programs, community education about alternatives to incarceration, and organizing efforts to redirect funding from prisons toward education, mental health services, and community development programs. The campaign involves building coalitions with criminal justice reform organizations, formerly incarcerated individuals, family members, faith communities, and community leaders to advocate for policies that prioritize rehabilitation, healing, and community safety through prevention and intervention rather than punishment and incarceration. Through legislative advocacy, community organizing, and public education campaigns, {userName} helps promote understanding of how effective public safety requires addressing root causes of crime through investment in communities rather than expansion of carceral systems.",
        pause: true,
        hook: "How will {userName}'s criminal justice reform advocacy create lasting changes in policy and community approaches to safety and healing?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive criminal justice reform campaign that includes policy advocacy for sentencing reform, support for restorative justice programs, community education about alternatives to incarceration, and organizing efforts to redirect funding from prisons toward education, mental health services, and community development programs. The campaign involves building coalitions with criminal justice reform organizations, formerly incarcerated individuals, family members, faith communities, and community leaders to advocate for policies that prioritize rehabilitation, healing, and community safety through prevention and intervention rather than punishment and incarceration. Through legislative advocacy, community organizing, and public education campaigns, {userName} helps promote understanding of how effective public safety requires addressing root causes of crime through investment in communities rather than expansion of carceral systems.",
          alternatives: ["Reform advocacy builds coalitions that center affected communities in criminal justice policy change.", "Campaign work demonstrates how community investment creates more effective public safety than punishment."],
          optionalDetails: ["coalition advocacy leads to 23% reduction in local incarceration rates", "community programs receive $2.1 million in redirected corrections funding"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s criminal justice reform work contributes to significant policy changes that reduce incarceration rates while increasing investment in community-based safety programs.",
        microVariants: ["Reform advocacy achieves concrete policy victories that transform approaches to community safety and healing.", "The campaign model influences statewide criminal justice reform initiatives and policy development."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that criminal justice reform requires long-term commitment to addressing root causes of harm while building community capacity for healing and restoration.",
        microVariants: ["Criminal justice advocacy becomes a lifelong commitment to community healing and restorative approaches to safety.", "The experience teaches that effective reform must center affected communities and address systemic inequalities."]
      }
    ],
    reuse: {
      swappableElements: {
        "reform focus": ["sentencing disparities", "prison conditions", "police accountability", "reentry support", "restorative justice"],
        "advocacy strategy": ["policy research", "coalition building", "legislative advocacy", "community education", "direct action"],
        "alternative approach": ["restorative justice", "community programs", "mental health services", "education investment", "trauma healing"]
      },
      weatherVariants: ["during legislative sessions", "following police violence incidents", "during Criminal Justice Reform Week", "throughout advocacy campaigns"],
      settingVariants: ["legislative buildings", "community centers", "criminal justice organizations", "faith communities"]
    }
  },
  {
    title: "The Food Justice and Agricultural Reform Initiative",
    theme: "Food Systems & Agricultural Justice",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} recognizes the interconnected problems within industrial food systems and begins investigating how corporate agriculture, food deserts, farmworker exploitation, and environmental degradation create barriers to healthy food access while perpetuating inequality and ecological damage. Through research into food policy, agricultural practices, and food justice movements, they discover how the current food system prioritizes profit over people and planet, creating situations where healthy food is inaccessible to many communities while industrial agriculture depletes soil, contaminates water, and contributes to climate change. Working with food justice organizers, sustainable farmers, nutrition educators, and affected communities, {userName} learns about alternative approaches to food production and distribution that can provide healthy, affordable food while supporting farmworkers, protecting the environment, and building community food sovereignty through cooperative and sustainable agricultural practices.",
        pause: true,
        hook: "What comprehensive food justice strategy will {userName} develop to transform food systems toward sustainability, equity, and community control?",
        microVariants: {
          text: "{userName} recognizes the interconnected problems within industrial food systems and begins investigating how corporate agriculture, food deserts, farmworker exploitation, and environmental degradation create barriers to healthy food access while perpetuating inequality and ecological damage. Through research into food policy, agricultural practices, and food justice movements, they discover how the current food system prioritizes profit over people and planet, creating situations where healthy food is inaccessible to many communities while industrial agriculture depletes soil, contaminates water, and contributes to climate change. Working with food justice organizers, sustainable farmers, nutrition educators, and affected communities, {userName} learns about alternative approaches to food production and distribution that can provide healthy, affordable food while supporting farmworkers, protecting the environment, and building community food sovereignty through cooperative and sustainable agricultural practices.",
          alternatives: ["Food systems research reveals how industrial agriculture creates inequality while damaging environmental and community health.", "Investigation exposes the need for community-controlled food systems that prioritize people and planet over profit."],
          optionalDetails: ["{favoriteColor} neighborhood stores lack fresh produce access within 2 miles", "industrial farms using {favoriteAnimal} confinement create 67% more pollution than sustainable alternatives"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive food justice initiative that includes supporting community-controlled food production, advocating for farmworker rights and fair wages, organizing against food apartheid through cooperative grocery stores and community kitchens, and promoting policy changes that prioritize sustainable agriculture and equitable food distribution. The initiative involves collaboration with urban farmers, rural agricultural cooperatives, food access organizations, environmental justice groups, and community members to create food systems that provide healthy food while supporting local economies and sustainable environmental practices. Through community organizing, policy advocacy, and direct action campaigns, {userName} helps build food sovereignty movements that ensure communities have control over their food systems while supporting farmers who use sustainable practices and treat workers fairly.",
        pause: true,
        hook: "How will {userName}'s food justice work create lasting transformation in food access, agricultural practices, and community food sovereignty?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive food justice initiative that includes supporting community-controlled food production, advocating for farmworker rights and fair wages, organizing against food apartheid through cooperative grocery stores and community kitchens, and promoting policy changes that prioritize sustainable agriculture and equitable food distribution. The initiative involves collaboration with urban farmers, rural agricultural cooperatives, food access organizations, environmental justice groups, and community members to create food systems that provide healthy food while supporting local economies and sustainable environmental practices. Through community organizing, policy advocacy, and direct action campaigns, {userName} helps build food sovereignty movements that ensure communities have control over their food systems while supporting farmers who use sustainable practices and treat workers fairly.",
          alternatives: ["Food justice organizing creates community-controlled alternatives to corporate food systems.", "Comprehensive initiatives demonstrate how sustainable agriculture can provide food security while supporting workers and environment."],
          optionalDetails: ["cooperative grocery stores provide 340% more fresh produce access in underserved areas", "sustainable farming initiatives increase local food production by 156% over three years"]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s food justice work influences policy changes that support sustainable agriculture and community food sovereignty while improving food access and farmworker conditions.",
        microVariants: ["Food justice advocacy achieves policy victories that transform agricultural practices and community food access.", "The initiative model influences national food policy and sustainable agriculture development."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that food justice requires ongoing commitment to supporting sustainable agriculture and ensuring communities have control over their food systems.",
        microVariants: ["Food justice work becomes a lifelong commitment to sustainable agriculture and community food sovereignty.", "The experience teaches that effective food systems must prioritize people, workers, and planet over profit."]
      }
    ],
    reuse: {
      swappableElements: {
        "food justice focus": ["food deserts", "farmworker rights", "sustainable agriculture", "community gardens", "cooperative stores"],
        "organizing strategy": ["community gardens", "cooperative development", "policy advocacy", "direct action", "education campaigns"],
        "systemic change": ["food sovereignty", "sustainable farming", "worker rights", "environmental protection", "community control"]
      },
      weatherVariants: ["during harvest seasons", "following farm labor disputes", "during Food Justice Month", "throughout growing seasons"],
      settingVariants: ["community gardens", "farms", "grocery cooperatives", "policy advocacy offices"]
    }
  }
];

export function getGrade9FallbackTemplate(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_9_FALLBACK_TEMPLATES.length) {
    return GRADE_9_FALLBACK_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * GRADE_9_FALLBACK_TEMPLATES.length);
  return GRADE_9_FALLBACK_TEMPLATES[randomIndex];
}

export function getGrade9FallbackTemplateCount(): number {
  return GRADE_9_FALLBACK_TEMPLATES.length;
}