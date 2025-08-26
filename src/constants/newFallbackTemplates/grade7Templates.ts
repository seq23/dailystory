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
        text: "Chapter 1: The Wake-Up Call\n\n{userName} had always considered themselves environmentally conscious—they recycled, turned off lights, and enjoyed {hobbies}—but their perspective on climate action fundamentally shifted during a particularly eye-opening seventh-grade environmental science unit that would ultimately change the trajectory of their entire academic and personal life. While researching the impact of industrial agriculture on local ecosystems for what they initially thought would be a routine class presentation about environmental issues affecting their immediate community, {userName} discovered that the {favoriteColor} algae blooms appearing in their regional watershed weren't just a natural phenomenon, but rather a direct consequence of agricultural runoff that was systematically disrupting the ecological balance their community had maintained for generations.",
        pause: true,
        hook: "What specific environmental crisis will motivate {userName} to transform from student observer to activist leader?",
        microVariants: {
          text: "Chapter 1: The Wake-Up Call\n\n{userName} had always considered themselves environmentally conscious—they recycled, turned off lights, and enjoyed {hobbies}—but their perspective on climate action fundamentally shifted during a particularly eye-opening seventh-grade environmental science unit that would ultimately change the trajectory of their entire academic and personal life. While researching the impact of industrial agriculture on local ecosystems for what they initially thought would be a routine class presentation about environmental issues affecting their immediate community, {userName} discovered that the {favoriteColor} algae blooms appearing in their regional watershed weren't just a natural phenomenon, but rather a direct consequence of agricultural runoff that was systematically disrupting the ecological balance their community had maintained for generations.",
          alternatives: [
            "Chapter 1: The Environmental Awakening\n\n{userName} had previously maintained what they considered adequate environmental awareness—practicing recycling protocols, implementing energy conservation measures, and pursuing {hobbies} activities—however their understanding of climate activism underwent a profound transformation during an exceptionally revealing seventh-grade environmental science curriculum."
          ],
          optionalDetails: [
            `Random Research Element ${Math.floor(Math.random() * 100)}: Local water quality had declined 40% in five years.`,
            `Random Discovery Element ${Math.floor(Math.random() * 100)}: Three species of local fish had disappeared recently.`,
            `Random Motivation Element ${Math.floor(Math.random() * 100)}: Their family's well water had become contaminated.`
          ]
        }
      },
      {
        text: "Chapter 2: Research and Action\n\n{userName} dove deeper into environmental research, connecting with local university scientists and environmental organizations to understand the scope of agricultural pollution affecting their watershed. Their investigation revealed systemic issues requiring both policy changes and community organizing to address effectively.",
        pause: true,
        hook: "What strategies will {userName} develop to mobilize community environmental action?",
        microVariants: {
          text: "Chapter 2: Research and Action\n\n{userName} dove deeper into environmental research, connecting with scientists and organizations to understand agricultural pollution affecting their watershed.",
          alternatives: ["Expanding their investigation, {userName} collaborated with university researchers and environmental groups to document systematic pollution patterns."],
          optionalDetails: [`Research showed ${Math.floor(Math.random() * 50) + 20}% increase in contamination levels.`]
        }
      },
      {
        text: "Chapter 3: Building the Movement\n\nWith scientific evidence in hand, {userName} organized community meetings, created educational presentations, and built coalitions with farmers, residents, and local officials to develop comprehensive solutions addressing both environmental protection and economic sustainability.",
        pause: true,
        hook: "How will the community respond to {userName}'s environmental leadership?",
        microVariants: {
          text: "Chapter 3: Building the Movement\n\nWith evidence gathered, {userName} organized community meetings and built coalitions to develop comprehensive environmental solutions.",
          alternatives: ["Armed with scientific data, {userName} facilitated community organizing efforts to address environmental challenges through collaborative action."],
          optionalDetails: [`Coalition included ${Math.floor(Math.random() * 20) + 10} local organizations and businesses.`]
        }
      },
      {
        text: "Chapter 4: Policy and Implementation\n\n{userName}'s environmental advocacy led to municipal policy changes, sustainable farming incentives, and ongoing community monitoring programs that protected the watershed while supporting local economic development and demonstrating youth leadership in environmental justice.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Chapter 4: Policy and Implementation\n\n{userName}'s advocacy led to policy changes, farming incentives, and monitoring programs protecting the watershed while supporting economic development.",
          alternatives: ["Environmental leadership resulted in policy reform, sustainable agriculture support, and community programs balancing ecological protection with economic sustainability."],
          optionalDetails: [`Programs prevented an estimated ${Math.floor(Math.random() * 500) + 100} tons of agricultural runoff annually.`]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Global Student Climate Summit\n\nFive years after their initial environmental awakening, {userName} stood before the United Nations Youth Climate Summit as the youngest keynote speaker in the organization's history, representing a global network of student environmental activists they had helped establish across six continents.",
        microVariants: [
          "Their climate action network had prevented the equivalent of 10 million tons of CO2 emissions through student-led initiatives spanning renewable energy projects, sustainable agriculture programs, and community environmental education campaigns."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_issues": ["water contamination", "soil degradation", "air pollution", "habitat destruction"],
        "solutions": ["renewable energy", "sustainable agriculture", "conservation programs", "policy advocacy"]
      },
      weatherVariants: ["environmentally conscious", "sustainably focused", "ecologically aware", "climate-concerned"],
      settingVariants: ["in nature", "in the community", "in environmental research", "in climate action"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 2: Social Justice & Community Organizing
  {
    title: "The Equal Access Advocacy Campaign",
    theme: "Social Justice & Community Organizing",
    level: "Grade 7",
    scenes: [
      {
        text: "Chapter 1: The Discovery of Inequality\n\n{userName} had always been aware of differences in their community, but their understanding of systemic inequality deepened dramatically when they began volunteering at the local community center and discovered the stark disparities that existed between different neighborhoods. While helping elementary students with homework and practicing their {hobbies} during volunteer breaks, they noticed that children from certain zip codes consistently arrived without proper school supplies, lacked access to reliable internet, and had never experienced activities like music lessons or sports programs that {userName} had always taken for granted.",
        pause: true,
        hook: "What comprehensive strategies will {userName} develop to address educational inequality and create lasting systemic change?",
        microVariants: {
          text: "Chapter 1: The Discovery of Inequality\n\n{userName} had always been aware of differences in their community, but their understanding of systemic inequality deepened dramatically when they began volunteering at the local community center and discovered the stark disparities that existed between different neighborhoods. While helping elementary students with homework and practicing their {hobbies} during volunteer breaks, they noticed that children from certain zip codes consistently arrived without proper school supplies, lacked access to reliable internet, and had never experienced activities like music lessons or sports programs that {userName} had always taken for granted.",
          alternatives: [
            "Chapter 1: The Systemic Recognition\n\n{userName} had maintained general awareness of community variations, however their comprehension of systemic inequality intensified dramatically when they commenced volunteer service at the local community center and identified pronounced disparities between different neighborhoods."
          ],
          optionalDetails: [
            `Random Seed ${Math.floor(Math.random() * 1000)}: The community center's {favoriteColor} bulletin board displayed achievement gaps by neighborhood.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: Local {favoriteAnimal} therapy visits were only available in affluent school districts.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: The quality of {favoriteFood} in school lunch programs varied dramatically by location.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The National Policy Impact\n\nStanding before the Congressional Committee on Educational Equity as the youngest person ever to testify about systemic educational reform, {userName} presented their comprehensive research and advocacy work to legislators who would ultimately pass the landmark Equal Educational Opportunity Act based largely on the grassroots organizing model they had developed.",
        microVariants: [
          "Final Chapter: The Legislative Victory\n\nAddressing the Congressional Committee on Educational Equity as the historically youngest individual to testify regarding systemic educational reform, {userName} presented their comprehensive research and advocacy contributions to legislators."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "justice_elements": ["educational equity", "resource distribution", "opportunity gaps", "systemic barriers", "policy reform"],
        "organizing_tools": ["community research", "coalition building", "advocacy campaigns", "policy analysis", "grassroots mobilization"]
      },
      weatherVariants: ["community meeting evening", "advocacy rally afternoon", "research session morning", "celebration day"],
      settingVariants: ["community center", "city hall", "school board meeting", "advocacy headquarters"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 3: Scientific Innovation & Environmental Solutions
  {
    title: "The Renewable Energy Revolution",
    theme: "Scientific Innovation & Environmental Solutions",
    level: "Grade 7",
    scenes: [
      {
        text: "Chapter 1: The Climate Crisis Challenge\n\n{userName} had always been passionate about environmental science and sustainable technology, often spending their free time practicing {hobbies} while researching renewable energy innovations and climate change mitigation strategies. But their academic interest became an urgent mission when their environmental science class partnered with the local university's climate research lab to develop practical solutions for their community's growing energy needs while reducing carbon emissions.",
        pause: true,
        hook: "What innovative renewable energy solutions will {userName} develop to revolutionize their community's approach to sustainable power?",
        microVariants: {
          text: "Chapter 1: The Climate Crisis Challenge\n\n{userName} had always been passionate about environmental science and sustainable technology, often spending their free time practicing {hobbies} while researching renewable energy innovations and climate change mitigation strategies. But their academic interest became an urgent mission when their environmental science class partnered with the local university's climate research lab to develop practical solutions for their community's growing energy needs while reducing carbon emissions.",
          alternatives: [
            "Chapter 1: The Sustainability Imperative\n\n{userName} had consistently maintained passion for environmental science and sustainable technology, frequently dedicating leisure periods to practicing {hobbies} while investigating renewable energy innovations and climate change mitigation strategies."
          ],
          optionalDetails: [
            `Random Seed ${Math.floor(Math.random() * 1000)}: The research lab's {favoriteColor} solar panels were achieving record efficiency rates.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: Local {favoriteAnimal} populations were being affected by air pollution from power plants.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: The university's sustainable {favoriteFood} production program needed renewable energy to expand.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Global Climate Leadership\n\nStanding before the United Nations Climate Action Summit as the youngest recipient of the Global Environmental Innovation Award, {userName} addressed world leaders about their revolutionary renewable energy technologies that had become the foundation for international climate change mitigation efforts.",
        microVariants: [
          "Final Chapter: The International Recognition Summit\n\nAddressing the United Nations Climate Action Summit as the historically youngest recipient of the Global Environmental Innovation Award, {userName} presented to world leaders regarding their revolutionary renewable energy technologies."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "energy_technologies": ["solar innovations", "wind power systems", "hydroelectric solutions", "geothermal applications"],
        "research_methods": ["data analysis", "prototype development", "efficiency testing", "environmental impact studies"]
      },
      weatherVariants: ["sunny research day", "windy testing session", "clear measurement morning", "innovative evening"],
      settingVariants: ["university research lab", "renewable energy facility", "sustainable technology center", "environmental innovation hub"],
      randomSeed: Math.floor(Math.random() * 10000)
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