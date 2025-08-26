/**
 * Grade 8 Templates - Complete Fallback Story Library
 * 3 templates, ~14 chapters each, 1000-1200 words total
 * Enhanced complexity with deeper themes
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_8_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Social Justice & Community Organizing
  {
    title: "The Digital Equity Campaign: From Inequality to Innovation",
    theme: "Social Justice & Community Organizing",
    level: "Grade 8",
    scenes: [
      {
        text: "Chapter 1: The Discovery of Digital Divides\n\n{userName} had always taken reliable internet access and modern computing devices for granted until they volunteered to tutor younger students at the community center and witnessed firsthand how digital inequality was systematically limiting educational opportunities for families in their neighborhood. During what began as a routine homework help session, {userName} discovered that Maria, a brilliant fourth-grader who consistently excelled in math and science, couldn't complete online assignments because her family's shared smartphone was their only internet-connected device, creating a barrier that threatened to undermine her academic potential despite her exceptional talent and dedication. This eye-opening experience catalyzed {userName}'s understanding that the digital divide wasn't just about technology access but represented a fundamental equity issue that perpetuated educational and economic disadvantages across generational lines, inspiring them to transform their initial frustration into systematic community action.",
        pause: true,
        hook: "How will {userName} mobilize their community to address systemic digital inequality?",
        microVariants: {
          text: "Chapter 1: The Discovery of Digital Divides\n\n{userName} had always taken reliable internet access and modern computing devices for granted until they volunteered to tutor younger students at the community center and witnessed firsthand how digital inequality was systematically limiting educational opportunities for families in their neighborhood. During what began as a routine homework help session, {userName} discovered that Maria, a brilliant fourth-grader who consistently excelled in math and science, couldn't complete online assignments because her family's shared smartphone was their only internet-connected device, creating a barrier that threatened to undermine her academic potential despite her exceptional talent and dedication. This eye-opening experience catalyzed {userName}'s understanding that the digital divide wasn't just about technology access but represented a fundamental equity issue that perpetuated educational and economic disadvantages across generational lines, inspiring them to transform their initial frustration into systematic community action.",
          alternatives: [
            "Chapter 1: Understanding Digital Inequality\n\n{userName} had previously assumed universal internet connectivity and contemporary technological resources until their volunteer tutoring commitment at the neighborhood community center revealed how digital disparities were methodically constraining academic advancement opportunities for local families. Throughout what initially appeared to be standard educational assistance activities, {userName} identified that Maria, an exceptionally gifted fourth-grade student demonstrating consistent excellence in mathematical and scientific disciplines, faced completion barriers for internet-based assignments due to her household's dependence on a single shared mobile device as their exclusive digital connection point, establishing obstacles that risked compromising her scholastic advancement despite her remarkable intellectual capabilities and academic commitment. This revelatory encounter facilitated {userName}'s recognition that technological access gaps transcended simple device availability, representing instead comprehensive equity challenges that sustained educational and economic disparities across multiple generations, motivating their evolution from individual concern toward organized community intervention strategies."
          ],
          optionalDetails: [
            `Research Discovery ${Math.floor(Math.random() * 100)}: 35% of local families lacked reliable broadband internet.`,
            `Community Finding ${Math.floor(Math.random() * 100)}: The nearest library closed at 6 PM, limiting after-school access.`,
            `Statistical Reality ${Math.floor(Math.random() * 100)}: Digital homework was assigned 4 days per week across grade levels.`
          ]
        }
      },
      {
        text: "Chapter 2: Research and Coalition Building\n\nRecognizing that individual tutoring couldn't address systemic digital inequality, {userName} began researching successful digital equity initiatives in other communities while building relationships with local organizations, schools, and community leaders who shared concerns about technology access barriers affecting educational and economic opportunities.",
        pause: true,
        hook: "What collaborative strategies will {userName} develop to address digital equity comprehensively?",
        microVariants: {
          text: "Chapter 2: Research and Coalition Building\n\nRecognizing individual tutoring couldn't address systemic inequality, {userName} researched successful digital equity initiatives while building coalitions with local organizations and leaders.",
          alternatives: ["Understanding the need for systemic solutions, {userName} investigated digital equity models while establishing partnerships with community organizations and educational leaders."],
          optionalDetails: [`Research identified ${Math.floor(Math.random() * 20) + 10} successful community technology programs nationwide.`]
        }
      },
      {
        text: "Chapter 3: Program Development and Implementation\n\nWorking with coalition partners, {userName} helped establish comprehensive digital equity programming that included device lending libraries, internet access advocacy, digital literacy training, and technical support services designed to eliminate barriers preventing community members from accessing online educational, employment, and civic participation opportunities.",
        pause: true,
        hook: "How will comprehensive programming address multiple aspects of digital inequality?",
        microVariants: {
          text: "Chapter 3: Program Development\n\nWith coalition partners, {userName} established comprehensive digital equity programming including device lending, internet advocacy, and digital literacy training.",
          alternatives: ["Through collaborative partnerships, {userName} developed multifaceted digital equity services addressing device access, connectivity, skills training, and technical support."],
          optionalDetails: [`Programs served ${Math.floor(Math.random() * 300) + 200} families in the first year of operation.`]
        }
      },
      {
        text: "Chapter 4: Policy Impact and Systemic Change\n\n{userName}'s digital equity work influenced municipal broadband policy, school district technology planning, and corporate community investment priorities, demonstrating how student-led organizing could create systemic changes that addressed root causes of digital inequality rather than providing temporary individual solutions.",
        pause: true,
        hook: "What long-term policy changes will ensure sustainable digital equity for all community members?",
        microVariants: {
          text: "Chapter 4: Policy Impact\n\n{userName}'s digital equity work influenced municipal broadband policy, school technology planning, and corporate investment priorities.",
          alternatives: ["Digital equity advocacy resulted in policy changes affecting municipal broadband access, educational technology funding, and community investment strategies."],
          optionalDetails: [`Policy changes expanded broadband access to ${Math.floor(Math.random() * 5000) + 2000} additional households.`]
        }
      },
      {
        text: "Chapter 5: Regional Recognition and Replication\n\nThe success of {userName}'s digital equity model attracted regional attention, leading to replication in other communities and recognition from technology companies, educational organizations, and policy makers who acknowledged that community-led digital equity initiatives were more effective than top-down technology distribution programs.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Chapter 5: Regional Recognition\n\nThe digital equity model's success attracted regional attention, leading to replication and recognition from technology companies and policy makers.",
          alternatives: ["Regional recognition of the community digital equity model led to widespread replication and acknowledgment of community-led technology programming effectiveness."],
          optionalDetails: [`The model was replicated in ${Math.floor(Math.random() * 15) + 10} communities across three states.`]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Regional Digital Equity Network\n\nTwo years after discovering the digital divide at their community center, {userName} had successfully established a regional network of student-led digital equity initiatives spanning fifteen school districts, directly providing internet access and device support to over 2,000 families while creating sustainable funding mechanisms through corporate partnerships and municipal policy advocacy. Their innovative model—combining peer tutoring, technology redistribution, and community organizing—had been featured in national education journals and adapted by youth organizations across three states, demonstrating how young activists could create systemic solutions to complex social problems. As {userName} prepared to present their research on digital equity at the National Student Leadership Conference, they reflected on how one tutoring session had evolved into a movement proving that the most effective social justice work emerges when passionate individuals combine direct service with strategic advocacy to address root causes of inequality rather than merely treating symptoms.",
        microVariants: [
          "Their digital equity network had eliminated homework completion gaps for 95% of participating students while creating pathways for 200+ families to access affordable long-term internet solutions through community-negotiated group purchasing programs."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "digital divide": ["educational inequality", "resource disparity", "technology barriers", "access gaps"],
        "community center": ["local library", "neighborhood school", "civic organization", "youth program"]
      },
      weatherVariants: ["systematically", "methodically", "comprehensively", "strategically"],
      settingVariants: ["in their community", "throughout their district", "across their region", "within their network"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 2: Environmental Science & Innovation
  {
    title: "The Urban Microclimate Project: Data-Driven Environmental Solutions",
    theme: "Environmental Science & Innovation",
    level: "Grade 8",
    scenes: [
      {
        text: "Chapter 1: The Heat Island Hypothesis\n\n{userName} first noticed the dramatic temperature differences between their neighborhood and downtown area during their daily bike commute to school, but their casual observation transformed into serious scientific investigation when their eighth-grade environmental science teacher challenged students to identify and study a local environmental phenomenon using authentic research methodologies. Armed with digital thermometers, humidity sensors, and a commitment to rigorous data collection protocols, {userName} began documenting microclimatic variations across different urban zones, discovering that surface temperatures in heavily paved commercial areas consistently measured 8-12 degrees higher than in residential neighborhoods with mature tree canopy, a finding that connected directly to their growing interest in {hobbies} and environmental sustainability. This systematic documentation revealed not just fascinating temperature patterns but also critical connections between urban planning decisions, community health outcomes, and environmental justice concerns that would ultimately inspire {userName} to propose innovative solutions addressing both climate adaptation and social equity through evidence-based environmental action.",
        pause: true,
        hook: "What innovative solutions will {userName} develop to combat urban heat islands?",
        microVariants: {
          text: "Chapter 1: The Heat Island Hypothesis\n\n{userName} first noticed the dramatic temperature differences between their neighborhood and downtown area during their daily bike commute to school, but their casual observation transformed into serious scientific investigation when their eighth-grade environmental science teacher challenged students to identify and study a local environmental phenomenon using authentic research methodologies. Armed with digital thermometers, humidity sensors, and a commitment to rigorous data collection protocols, {userName} began documenting microclimatic variations across different urban zones, discovering that surface temperatures in heavily paved commercial areas consistently measured 8-12 degrees higher than in residential neighborhoods with mature tree canopy, a finding that connected directly to their growing interest in {hobbies} and environmental sustainability. This systematic documentation revealed not just fascinating temperature patterns but also critical connections between urban planning decisions, community health outcomes, and environmental justice concerns that would ultimately inspire {userName} to propose innovative solutions addressing both climate adaptation and social equity through evidence-based environmental action.",
          alternatives: [
            "Chapter 1: Investigating Urban Temperature Variations\n\n{userName} initially observed significant thermal differences between residential and commercial zones during regular cycling routes to educational facilities, however their informal observations evolved into comprehensive scientific analysis when their eighth-grade environmental studies instructor encouraged students to examine and research local environmental phenomena utilizing professional investigative approaches. Equipped with precision temperature measurement devices, atmospheric humidity monitoring equipment, and dedication to systematic data acquisition procedures, {userName} commenced documenting microclimate fluctuations throughout various metropolitan sectors, identifying that ground-level temperatures in extensively asphalted business districts consistently registered 8-12 degrees elevated compared to residential areas featuring established arboreal coverage, discoveries that aligned with their developing passion for {hobbies} and ecological sustainability principles. This methodical investigation process illuminated not merely intriguing thermal distribution patterns but additionally revealed crucial relationships between municipal development policies, public health implications, and environmental equity issues that would subsequently motivate {userName} to formulate groundbreaking approaches addressing climate resilience and social justice through scientific evidence-based environmental initiatives."
          ],
          optionalDetails: [
            `Temperature Data Point ${Math.floor(Math.random() * 100)}: Peak difference reached 15°F on sunny afternoons.`,
            `Research Finding ${Math.floor(Math.random() * 100)}: {favoriteColor} rooftops showed the highest heat retention.`,
            `Health Connection ${Math.floor(Math.random() * 100)}: Elderly residents reported more heat-related fatigue in high-temperature zones.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Final Chapter: The Community Climate Resilience Initiative\n\nThree years of dedicated environmental research had transformed {userName} from a curious student observer into a recognized young climate scientist whose urban microclimate studies now informed municipal policy decisions and community planning initiatives across their metropolitan region. Their comprehensive data collection had documented not only temperature variations but also correlations between heat exposure, air quality, and community health outcomes, creating an evidence base that supported the implementation of green infrastructure projects including community gardens, reflective surface installations, and strategic tree planting programs in previously underserved neighborhoods. As {userName} reviewed their research portfolio while preparing college applications, they recognized how their initial bike commute observations had evolved into a systematic approach to environmental problem-solving that combined rigorous scientific methodology with deep community engagement, demonstrating that meaningful environmental change requires both technical expertise and sustained commitment to understanding how environmental challenges disproportionately affect different communities within the same geographic area.",
        microVariants: [
          "Their microclimate research had contributed to three major policy changes including green roof requirements for new construction, increased urban forestry funding, and establishment of cooling centers in high-heat neighborhoods."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "heat islands": ["air quality zones", "noise pollution patterns", "biodiversity corridors", "water quality variations"],
        "bike commute": ["walking route", "public transit journey", "family car trips", "neighborhood exploration"]
      },
      weatherVariants: ["consistently", "systematically", "methodically", "reliably"],
      settingVariants: ["throughout the city", "across urban zones", "between neighborhoods", "within their region"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 3: Leadership & Civic Engagement
  {
    title: "The Student Voice Initiative: Transforming School Governance",
    theme: "Leadership & Civic Engagement",
    level: "Grade 8",
    scenes: [
      {
        text: "Chapter 1: The Representation Gap\n\n{userName} had served as their eighth-grade class representative for two months when they realized that student government meetings consistently addressed surface-level concerns like dress codes and cafeteria menus while avoiding substantive issues that significantly impacted student learning experiences, such as equitable access to advanced coursework, mental health support resources, and academic accommodations for students with diverse learning needs. This frustrating recognition coincided with their discovery that the current student government structure had remained unchanged for over fifteen years, operating more as a symbolic gesture toward student input rather than a genuine mechanism for meaningful participation in educational decision-making processes that affected their daily academic lives. Inspired by their interest in {hobbies} and motivated by conversations with classmates who felt systematically excluded from school leadership opportunities, {userName} began researching effective models of youth civic engagement and democratic participation, ultimately developing a comprehensive proposal for restructuring student government to create authentic opportunities for peer advocacy, policy development, and collaborative problem-solving between students, educators, and administrators.",
        pause: true,
        hook: "How will {userName} transform student government into a platform for real change?",
        microVariants: {
          text: "Chapter 1: The Representation Gap\n\n{userName} had served as their eighth-grade class representative for two months when they realized that student government meetings consistently addressed surface-level concerns like dress codes and cafeteria menus while avoiding substantive issues that significantly impacted student learning experiences, such as equitable access to advanced coursework, mental health support resources, and academic accommodations for students with diverse learning needs. This frustrating recognition coincided with their discovery that the current student government structure had remained unchanged for over fifteen years, operating more as a symbolic gesture toward student input rather than a genuine mechanism for meaningful participation in educational decision-making processes that affected their daily academic lives. Inspired by their interest in {hobbies} and motivated by conversations with classmates who felt systematically excluded from school leadership opportunities, {userName} began researching effective models of youth civic engagement and democratic participation, ultimately developing a comprehensive proposal for restructuring student government to create authentic opportunities for peer advocacy, policy development, and collaborative problem-solving between students, educators, and administrators.",
          alternatives: [
            "Chapter 1: Recognizing Democratic Deficits\n\n{userName} had functioned as their eighth-grade cohort delegate for two months when they identified that student governance assemblies systematically focused on superficial administrative topics including uniform regulations and dining facility options while systematically avoiding substantial concerns significantly influencing educational experiences, including equitable availability of accelerated academic programs, psychological wellness support systems, and instructional modifications for students representing diverse learning approaches. This concerning observation aligned with their identification that existing student governmental frameworks had persisted unmodified for more than fifteen years, functioning primarily as ceremonial acknowledgment of student perspectives rather than substantive channels for authentic engagement in educational policy formulation processes directly affecting their scholastic experiences. Energized by their involvement in {hobbies} and encouraged through discussions with peers who experienced systematic marginalization from institutional leadership pathways, {userName} initiated investigation of successful youth civic participation models and democratic engagement strategies, eventually formulating detailed recommendations for restructuring student governance systems to establish legitimate platforms for peer advocacy initiatives, policy development processes, and collaborative resolution approaches connecting students, educational professionals, and administrative leadership."
          ],
          optionalDetails: [
            `Historical Context ${Math.floor(Math.random() * 100)}: Student government structure established in 2008 without major updates.`,
            `Representation Issue ${Math.floor(Math.random() * 100)}: Only 12% of student body had ever participated in governance activities.`,
            `Policy Limitation ${Math.floor(Math.random() * 100)}: Students had no formal input on academic scheduling or curriculum decisions.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Democratic School Movement\n\nFour years after identifying the limitations of traditional student government, {userName} had successfully piloted and implemented a revolutionary student governance model that had been adopted by twelve schools across their state, creating authentic mechanisms for student participation in educational policy development while maintaining productive collaborative relationships with administrative leadership and teaching staff. Their innovative framework—incorporating student policy committees, peer mediation systems, and regular community forums—had resulted in measurable improvements in school climate surveys, increased student engagement in academic planning processes, and successful advocacy for mental health resources that had directly benefited hundreds of their peers. As {userName} prepared to present their research on democratic education at the National Student Leadership Summit, they reflected on how their initial frustration with ineffective representation had evolved into a comprehensive understanding of how young people could create sustainable institutional change through strategic organizing, evidence-based advocacy, and persistent commitment to expanding democratic participation within educational communities.",
        microVariants: [
          "Their democratic governance model had facilitated student-led policy changes including flexible scheduling options, peer tutoring programs, and establishment of student wellness centers that served as national models for youth-centered educational reform."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "student government": ["peer mediation", "leadership council", "advocacy committee", "democratic forum"],
        "dress codes": ["technology policies", "attendance rules", "hall pass systems", "extracurricular requirements"]
      },
      weatherVariants: ["systematically", "consistently", "methodically", "regularly"],
      settingVariants: ["in their school", "across their district", "throughout their state", "within educational systems"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  }
];

/**
 * Get a random Grade 8 template or specific template by index
 */
export function getGrade8FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_8_FALLBACK_TEMPLATES.length) {
    return GRADE_8_FALLBACK_TEMPLATES[templateIndex];
  }
  
  if (GRADE_8_FALLBACK_TEMPLATES.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * GRADE_8_FALLBACK_TEMPLATES.length);
  return GRADE_8_FALLBACK_TEMPLATES[randomIndex];
}

/**
 * Get the count of available Grade 8 templates
 */
export function getGrade8FallbackTemplateCount(): number {
  return GRADE_8_FALLBACK_TEMPLATES.length;
}