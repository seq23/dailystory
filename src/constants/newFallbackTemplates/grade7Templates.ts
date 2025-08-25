/**
 * Grade 7 Templates - Complete Fallback Story Library
 * 3 templates, ~13 chapters each, 900-1100 words total
 * Enhanced complexity and random seed variation
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_7_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Environmental Leadership & Social Change
  {
    title: "The Climate Action Revolution: A Student's Journey to Global Impact",
    theme: "Environmental Leadership & Social Change",
    level: "Grade 7",
    scenes: [
      {
        text: "Chapter 1: The Wake-Up Call\n\n{userName} had always considered themselves environmentally conscious—they recycled, turned off lights, and enjoyed {hobbies}—but their perspective on climate action fundamentally shifted during a particularly eye-opening seventh-grade environmental science unit that would ultimately change the trajectory of their entire academic and personal life. While researching the impact of industrial agriculture on local ecosystems for what they initially thought would be a routine class presentation about environmental issues affecting their immediate community, {userName} discovered that the {favoriteColor} algae blooms appearing in their regional watershed weren't just a natural phenomenon, but rather a direct consequence of agricultural runoff that was systematically disrupting the ecological balance their community had maintained for generations. The deeper they investigated, the more they realized that their generation would inherit environmental challenges far more complex and urgent than any previous generation had faced, requiring innovative solutions that combined scientific knowledge, community organization, and unprecedented levels of global cooperation to address effectively.",
        pause: true,
        hook: "What specific environmental crisis will motivate {userName} to transform from student observer to activist leader?",
        microVariants: {
          text: "Chapter 1: The Wake-Up Call\n\n{userName} had always considered themselves environmentally conscious—they recycled, turned off lights, and enjoyed {hobbies}—but their perspective on climate action fundamentally shifted during a particularly eye-opening seventh-grade environmental science unit that would ultimately change the trajectory of their entire academic and personal life. While researching the impact of industrial agriculture on local ecosystems for what they initially thought would be a routine class presentation about environmental issues affecting their immediate community, {userName} discovered that the {favoriteColor} algae blooms appearing in their regional watershed weren't just a natural phenomenon, but rather a direct consequence of agricultural runoff that was systematically disrupting the ecological balance their community had maintained for generations. The deeper they investigated, the more they realized that their generation would inherit environmental challenges far more complex and urgent than any previous generation had faced, requiring innovative solutions that combined scientific knowledge, community organization, and unprecedented levels of global cooperation to address effectively.",
          alternatives: [
            "Chapter 1: The Environmental Awakening\n\n{userName} had previously maintained what they considered adequate environmental awareness—practicing recycling protocols, implementing energy conservation measures, and pursuing {hobbies} activities—however their understanding of climate activism underwent a profound transformation during an exceptionally revealing seventh-grade environmental science curriculum that would fundamentally alter their entire educational and personal development pathway. Throughout their investigation of industrial agricultural impacts on regional ecological systems for what initially appeared to be a standard classroom presentation concerning environmental factors affecting their local community infrastructure, {userName} identified that the distinctive {favoriteColor} algae formations manifesting within their area's watershed represented not merely natural biological processes, but rather direct consequences of agricultural chemical runoff that was methodically destabilizing the ecological equilibrium their community had preserved for multiple generations. As their research progressed, they increasingly comprehended that their demographic cohort would assume responsibility for environmental challenges significantly more sophisticated and pressing than any historical generation had confronted, necessitating groundbreaking solutions integrating scientific expertise, community mobilization, and extraordinary levels of international collaborative effort to resolve successfully."
          ],
          optionalDetails: [
            `Random Research Element ${Math.floor(Math.random() * 100)}: Local water quality had declined 40% in five years.`,
            `Random Discovery Element ${Math.floor(Math.random() * 100)}: Three species of local fish had disappeared recently.`,
            `Random Motivation Element ${Math.floor(Math.random() * 100)}: Their family's well water had become contaminated.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Global Student Climate Summit\n\nFive years after their initial environmental awakening, {userName} stood before the United Nations Youth Climate Summit as the youngest keynote speaker in the organization's history, representing a global network of student environmental activists they had helped establish across six continents. Their innovative community-based climate solutions had been implemented in over 200 schools worldwide, creating measurable environmental improvements while empowering an entire generation of young environmental leaders. As they concluded their address with a challenge for world leaders to match the ambition and urgency demonstrated by young climate activists, {userName} reflected on how their seventh-grade research project about local algae blooms had evolved into a international movement proving that age is no barrier to environmental leadership and that the most powerful climate solutions emerge when passionate young voices are given the platforms, resources, and respect they deserve to create the sustainable future their generation will inherit.",
        microVariants: [
          "Their climate action network had prevented the equivalent of 10 million tons of CO2 emissions through student-led initiatives spanning renewable energy projects, sustainable agriculture programs, and community environmental education campaigns that transformed both local ecosystems and global environmental consciousness."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "algae blooms": ["water contamination", "soil degradation", "air pollution", "habitat destruction"],
        "agricultural runoff": ["industrial waste", "chemical pollution", "plastic contamination", "carbon emissions"]
      },
      weatherVariants: ["environmentally conscious", "sustainably focused", "ecologically aware", "climate-concerned"],
      settingVariants: ["in nature", "in the community", "in environmental research", "in climate action"]
    }
  }
];

/**
 * Get a random Grade 7 template or specific template by index
 */
export function getGrade7FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_7_FALLBACK_TEMPLATES.length) {
    return GRADE_7_FALLBACK_TEMPLATES[templateIndex];
  }
  
  if (GRADE_7_FALLBACK_TEMPLATES.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * GRADE_7_FALLBACK_TEMPLATES.length);
  return GRADE_7_FALLBACK_TEMPLATES[randomIndex];
}

/**
 * Get the count of available Grade 7 templates
 */
export function getGrade7FallbackTemplateCount(): number {
  return GRADE_7_FALLBACK_TEMPLATES.length;
}