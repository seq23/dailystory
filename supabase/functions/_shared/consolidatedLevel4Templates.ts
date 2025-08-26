// Consolidated Level 4 Templates - Ages 9-10, 4th-5th grade reading level
// Word count: 90-140 words per scene, 12 scenes per template
// Combines existing base templates with extension templates converted to StoryTemplate format

export interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
  };
}

export interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: {
    text: string;
    alternatives: string[];
    optionalDetails: string[];
  };
}

export interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

export const CONSOLIDATED_LEVEL_4_TEMPLATES: StoryTemplate[] = [
  // Template 1: Library Mystery Investigation (from extensions)
  {
    title: "The Historical Archive Mystery",
    theme: "Investigation & Cultural Heritage",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} had been looking forward to this mystery - investigating disappearing books from the library, but what started as a simple case of missing materials quickly evolved into a complex investigation involving rare historical documents, institutional preservation policies, and the intersection of cultural heritage with community access to information and educational resources.",
        pause: true,
        hook: "What clues will {userName} discover about the missing historical documents?",
        microVariants: {
          text: "{userName} had been looking forward to investigating disappearing library books, but the simple case evolved into a complex investigation involving rare documents, preservation policies, and cultural heritage access.",
          alternatives: ["While {userName} anticipated investigating missing library materials, the straightforward case developed into a sophisticated inquiry encompassing historical documents, institutional policies, and community information access."],
          optionalDetails: ["The missing books included irreplaceable local history collections dating back to the 1800s.", "Library security footage revealed suspicious patterns but no clear perpetrator.", "Staff members reported increasing concerns about institutional collection management and preservation protocols."]
        }
      },
      {
        text: "But then something unexpected happened: rare historical texts were vanishing systematically from collections, following patterns that suggested either inside knowledge of cataloging systems or sophisticated understanding of institutional preservation priorities and the relative value of different historical materials to researchers and community members.",
        pause: false,
        hook: "",
        microVariants: {
          text: "But then something unexpected happened: rare texts vanished systematically, suggesting either inside knowledge of cataloging systems or sophisticated understanding of preservation priorities and material value.",
          alternatives: ["However, an unexpected development emerged: historical texts disappeared according to patterns indicating either institutional system knowledge or advanced understanding of preservation priorities and research value."],
          optionalDetails: ["The theft pattern targeted first editions, unique manuscripts, and documents with significant local historical importance.", "Cataloging records showed access attempts from multiple user accounts during off-hours.", "Similar disappearances had occurred at three other regional libraries within the past eighteen months."]
        }
      },
      {
        text: "Of course, things didn't go smoothly when discovering hidden passages behind reference section shelves, revealing a complex network of tunnels and storage areas that library administrators had forgotten existed, along with evidence of unauthorized access to restricted collections and climate-controlled preservation facilities designed to protect culturally significant materials.",
        pause: true,
        hook: "What will {userName} find in the hidden passages and forgotten storage areas?",
        microVariants: {
          text: "Of course, things didn't go smoothly when discovering hidden passages behind shelves, revealing forgotten tunnels and evidence of unauthorized access to restricted preservation facilities.",
          alternatives: ["Naturally, complications arose upon finding concealed passages behind reference shelves, uncovering overlooked tunnel networks and signs of illicit entry to protected collection areas."],
          optionalDetails: ["The passages connected to the building's original 1920s architecture and prohibition-era modifications.", "Temperature and humidity logs indicated repeated breaches of climate-controlled storage environments.", "Hidden cameras had been installed to monitor access to the most valuable collection materials."]
        }
      },
      {
        text: "As usual, life was more complicated than anticipated when secret archives revealed centuries-old manuscripts, photographs, and documents that challenged accepted narratives about local history while raising important questions about who controls access to cultural heritage and how communities preserve and share their collective memory across generations.",
        pause: false,
        hook: "",
        microVariants: {
          text: "As usual, life was more complicated when secret archives revealed centuries-old materials challenging local history narratives while raising questions about cultural heritage access and collective memory preservation.",
          alternatives: ["Predictably, circumstances proved more complex as hidden archives contained historical materials that contested established narratives while prompting questions about heritage access and community memory preservation."],
          optionalDetails: ["The documents included Native American land treaties that contradicted official county records.", "Photographs documented immigrant communities and labor organizing activities that local history books had omitted.", "Personal letters revealed perspectives from women, children, and marginalized groups typically absent from traditional historical accounts."]
        }
      },
      {
        text: "Investigation reveals that the missing materials were being stolen by a private collector who intended to sell rare books and documents to wealthy buyers, demonstrating how cultural heritage can become a commodity divorced from its community context and educational value while highlighting the importance of public access to historical resources.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Investigation reveals the materials were stolen by a private collector selling to wealthy buyers, showing how cultural heritage becomes commodity divorced from community context and educational value.",
          alternatives: ["The inquiry uncovers theft by a private collector marketing rare materials to affluent purchasers, illustrating how cultural heritage transforms into commercial commodity removed from community educational context."],
          optionalDetails: ["The collector had established relationships with auction houses specializing in rare books and manuscripts.", "Prices for stolen materials ranged from hundreds to thousands of dollars per item.", "International buyers were particularly interested in documents related to early American settlement and indigenous history."]
        }
      },
      {
        text: "Working with library security, local law enforcement, and cultural preservation experts, {userName} helps design improved security protocols while advocating for digitization projects that can make historical materials more accessible to researchers, students, and community members without compromising the physical preservation of original documents.",
        pause: true,
        hook: "How will improved security and digitization protect cultural heritage while expanding access?",
        microVariants: {
          text: "Working with security, law enforcement, and preservation experts, {userName} helps design improved protocols while advocating for digitization projects that expand access without compromising preservation.",
          alternatives: ["Collaborating with security personnel, law enforcement, and cultural specialists, {userName} contributes to enhanced protection protocols while promoting digitization initiatives that broaden access while maintaining preservation."],
          optionalDetails: ["New security measures included motion sensors, improved lighting, and restricted access controls for valuable collections.", "Digitization grants from state and federal agencies would fund high-resolution scanning of fragile materials.", "Community advisory boards would help prioritize which collections should receive digitization attention first."]
        }
      },
      {
        text: "The recovered materials are restored to the library's collections with enhanced security measures, while {userName}'s research into the hidden archives leads to new exhibitions and educational programs that help community members understand the complexity and diversity of their local history and cultural heritage.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Recovered materials return to collections with enhanced security, while {userName}'s research leads to exhibitions and educational programs helping community members understand local history complexity and diversity.",
          alternatives: ["Restored materials rejoin library collections under improved security, as {userName}'s archival research generates exhibitions and educational initiatives that illuminate local history's complexity and cultural diversity."],
          optionalDetails: ["The exhibitions featured interactive displays allowing visitors to explore digitized documents and photographs.", "Educational programs included workshops for teachers, genealogy classes for families, and research seminars for students.", "Community response exceeded expectations, with attendance at history programs increasing by sixty percent."]
        }
      },
      {
        text: "University historians collaborate with the library to analyze the newly discovered materials, while {userName} contributes to academic publications that revise understanding of regional history and demonstrate how young people can make significant contributions to scholarly research and community heritage preservation efforts.",
        pause: false,
        hook: "",
        microVariants: {
          text: "University historians collaborate to analyze newly discovered materials, while {userName} contributes to publications revising regional history understanding and demonstrating youth contributions to scholarly research.",
          alternatives: ["Academic historians partner with the library for material analysis, as {userName} participates in scholarly publications that reshape regional historical understanding while showcasing youth research contributions."],
          optionalDetails: ["Three peer-reviewed articles acknowledged {userName}'s research contributions and investigative work.", "The collaboration model became a template for community-academic partnerships in historical research.", "Graduate students requested to work with {userName} on additional archive projects and community history initiatives."]
        }
      },
      {
        text: "Media attention brings national recognition to the library's collections and the importance of community-based historical preservation, while {userName}'s detective work inspires other young people to explore local archives and contribute to ongoing efforts to document and preserve cultural heritage for future generations.",
        pause: true,
        hook: "How will the national attention benefit historical preservation efforts?",
        microVariants: {
          text: "Media attention brings national recognition to library collections and community preservation importance, while {userName}'s work inspires other youth to explore archives and contribute to heritage documentation.",
          alternatives: ["National media coverage highlights the library's collections and community preservation significance, as {userName}'s investigative work motivates other young people toward archival exploration and heritage conservation."],
          optionalDetails: ["The Library of Congress expressed interest in creating backup copies of the most significant materials.", "Tourism increased as visitors came to see the historical collections and learn about local heritage.", "Four other communities requested assistance in establishing similar youth-led historical research programs."]
        }
      },
      {
        text: "The case establishes new legal precedents for prosecuting cultural heritage theft while raising awareness about the value of local historical collections and the need for adequate funding and security measures to protect irreplaceable materials that belong to entire communities rather than individual collectors.",
        pause: false,
        hook: "",
        microVariants: {
          text: "The case establishes legal precedents for cultural heritage theft prosecution while raising awareness about collection value and the need for funding and security to protect community materials.",
          alternatives: ["Legal proceedings create precedents for heritage theft prosecution while elevating awareness regarding collection significance and requirements for adequate funding and security protecting community-owned materials."],
          optionalDetails: ["The prosecution resulted in felony convictions and restitution payments to affected libraries.", "New legislation strengthened penalties for theft of cultural heritage materials.", "Professional library associations developed improved security guidelines and training programs."]
        }
      },
      {
        text: "Professional archivists and historians recognize {userName}'s contributions to the field of cultural preservation, while the investigation methods and community engagement strategies developed during the case are adopted by libraries and museums throughout the region as models for protecting and promoting access to historical materials.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Professional archivists recognize {userName}'s cultural preservation contributions, while investigation methods and engagement strategies are adopted by regional libraries and museums as protective models.",
          alternatives: ["Cultural preservation professionals acknowledge {userName}'s field contributions, as investigative approaches and community engagement methods become regional adoption models for libraries and museums protecting historical materials."],
          optionalDetails: ["The investigation techniques were documented in professional library science publications.", "Training workshops taught {userName}'s community engagement methods to librarians across five states.", "Museum security protocols incorporated lessons learned from the library theft case."]
        }
      },
      {
        text: "And {userName} learned that growing up means helping establish proper preservation systems for cultural heritage, understanding that protecting historical materials requires both technical expertise and community engagement to ensure that the stories and experiences of all people are preserved and accessible for future generations to study and learn from.",
        pause: true,
        hook: "What ancient secrets will they uncover next?",
        microVariants: {
          text: "And {userName} learned that growing up means helping establish preservation systems for cultural heritage, ensuring stories and experiences are preserved and accessible for future generations.",
          alternatives: ["{userName} discovered that maturity involves establishing cultural heritage preservation systems, guaranteeing that diverse stories and experiences remain available for future generational learning and study."],
          optionalDetails: ["The experience inspired {userName} to consider careers in library science, archival studies, or cultural preservation.", "College applications would highlight the research contributions and community leadership demonstrated during the investigation.", "Ongoing volunteer work at the library continued to support digitization and educational outreach efforts."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every quiet afternoon, {userName} sits in the restored library archives, carefully cataloging historical documents while surrounded by the gentle rustle of pages and the soft whisper of climate control systems preserving precious materials. The peaceful work of cultural stewardship brings deep satisfaction, knowing that these stories will be available for generations of learners to discover and cherish.",
        microVariants: ["Each peaceful afternoon, {userName} catalogs historical documents in the restored archives, finding satisfaction in cultural stewardship that preserves stories for future generations of learners."]
      },
      {
        type: 'silly',
        text: "The historical documents become so popular that past historical figures start appearing at the library for research consultations! Soon {userName} is helping George Washington with genealogy research, discussing agricultural techniques with Thomas Jefferson, and explaining modern cataloging systems to confused librarians from the 1800s. What a wonderfully chaotic historical research center!",
        microVariants: ["The documents attract past historical figures seeking research help, with {userName} assisting George Washington, Thomas Jefferson, and confused 1800s librarians - a delightfully chaotic historical center!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s investigation and preservation work leads to a career in cultural heritage protection, with their community-based research methods being adopted by the Smithsonian Institution and the National Archives. They receive the Presidential Medal for Young Historians and establish a foundation supporting youth involvement in cultural preservation nationwide.",
        microVariants: ["{userName}'s preservation work leads to a heritage protection career, with their methods adopted by the Smithsonian and National Archives, earning a Presidential Medal and establishing a youth foundation."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that cultural heritage belongs to entire communities, not individual collectors, and that preserving historical materials requires balancing access with protection. They learn that every document and photograph represents real people's lives and experiences, and that young people have both the curiosity and the responsibility to help preserve these stories for future generations to understand and learn from.",
        microVariants: ["{userName} learns that cultural heritage belongs to communities, requiring balanced access and protection, with every document representing real lives and youth having responsibility to preserve stories for future understanding."]
      }
    ],
    reuse: {
      swappableElements: {
        "historical_materials": ["manuscripts", "photographs", "letters", "maps", "newspapers"],
        "investigation_methods": ["forensics", "archival research", "interviews", "surveillance", "analysis"],
        "preservation_techniques": ["digitization", "climate control", "security systems", "cataloging", "restoration"]
      },
      weatherVariants: ["investigation morning", "archive research afternoon", "security planning session", "community presentation evening"],
      settingVariants: ["library archives", "hidden passages", "security office", "community exhibition hall"]
    }
  }

  // Continue with remaining 5 templates to reach 6 total...
];