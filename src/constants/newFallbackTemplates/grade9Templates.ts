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