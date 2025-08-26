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

  // Template 3: Environmental Science & Innovation
  {
    title: "The Urban Ecosystem Restoration Project",
    theme: "Environmental Science & Innovation",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} had always enjoyed spending time outdoors and was passionate about {hobbies}, but their interest in environmental science became a mission when they discovered that their neighborhood's ecosystem was in serious trouble. While helping with a community garden project, they noticed that the soil seemed unhealthy, very few birds visited the area, and the creek that ran through their community had an unusual {favoriteColor} tint that didn't look natural.",
        pause: true,
        hook: "What environmental problems will {userName} discover in their investigation?",
        microVariants: {
          text: "{userName} had always enjoyed spending time outdoors and was passionate about {hobbies}, but their interest in environmental science became a mission when they discovered that their neighborhood's ecosystem was in serious trouble.",
          alternatives: ["While {userName} loved nature and enjoyed {hobbies}, they became concerned when they realized their local environment needed help.", "Environmental science fascinated {userName}, especially combined with their love of {hobbies}, but local ecosystem problems demanded immediate attention."],
          optionalDetails: ["The community garden plants weren't growing properly despite good care.", "Local wildlife seemed to be avoiding the area.", "Neighbors had mentioned strange smells near the creek."]
        }
      },
      {
        text: "Working with their science teacher and a local environmental group, {userName} learned how to test water quality, measure soil contamination, and survey wildlife populations. Their investigation revealed that runoff from a nearby industrial site was carrying harmful chemicals into their neighborhood's natural areas, affecting everything from the plants in people's gardens to the insects that local birds depended on for food.",
        pause: true,
        hook: "How will {userName} address this environmental contamination?",
        microVariants: {
          text: "Working with their science teacher and a local environmental group, {userName} learned how to test water quality, measure soil contamination, and survey wildlife populations.",
          alternatives: ["With help from experts, {userName} discovered how to measure environmental damage and track its effects.", "Scientific training helped {userName} understand the scope of environmental problems in their community."],
          optionalDetails: ["Water tests showed chemicals that shouldn't be there.", "Soil samples revealed contamination levels above safe limits.", "Bird counting showed a 60% decline over five years."]
        }
      },
      {
        text: "The data {userName} collected painted a clear picture: their community was experiencing environmental injustice, where polluting industries were located near neighborhoods with less political power to resist them. This wasn't just about science—it was about fairness and community health. {userName} realized that solving environmental problems required both scientific knowledge and community organizing skills.",
        pause: true,
        hook: "What strategies will {userName} use to fight environmental injustice?",
        microVariants: {
          text: "The data {userName} collected painted a clear picture: their community was experiencing environmental injustice, where polluting industries were located near neighborhoods with less political power.",
          alternatives: ["Research revealed environmental injustice: pollution was concentrated in communities with fewer resources to fight back.", "{userName}'s investigation showed a pattern of environmental racism affecting their neighborhood."],
          optionalDetails: ["Wealthier neighborhoods had cleaner air and water.", "The industrial site had been operating without proper oversight.", "Community members had complained for years without results."]
        }
      },
      {
        text: "At the town hall meeting, {userName} presented their research with charts, photographs, and testimonials from affected neighbors. They spoke confidently about parts per million, biodiversity indicators, and environmental justice principles. The mayor and industrial representatives couldn't ignore the scientific evidence or dismiss the community's concerns when presented so professionally.",
        pause: true,
        hook: "How will the community and officials respond to this evidence?",
        microVariants: {
          text: "At the town hall meeting, {userName} presented their research with charts, photographs, and testimonials from affected neighbors.",
          alternatives: ["The community presentation included compelling visual evidence and personal stories that couldn't be ignored.", "{userName}'s professional presentation combined hard data with human stories of environmental harm."],
          optionalDetails: ["The photographs showed dramatic changes over time.", "Neighbors shared stories of health problems and property damage.", "Local media covered the presentation extensively."]
        }
      },
      {
        text: "The victory came through persistence and collaboration. The industrial company agreed to install better pollution controls and fund a community environmental monitoring program. {userName} helped design a citizen science initiative where community members could regularly test air and water quality, creating an early warning system for future environmental problems.",
        pause: true,
        hook: "What long-term changes will this create for environmental protection?",
        microVariants: {
          text: "The victory came through persistence and collaboration. The industrial company agreed to install better pollution controls and fund a community environmental monitoring program.",
          alternatives: ["Success required sustained pressure: the company agreed to reduce pollution and support ongoing community monitoring.", "Community organizing worked: pollution controls were installed and residents gained monitoring tools."],
          optionalDetails: ["New equipment would reduce emissions by 70%.", "Monthly community meetings would review environmental data.", "Other neighborhoods requested help starting similar programs."]
        }
      },
      {
        text: "Within eighteen months, the changes were visible. Plants in the community garden grew more vibrantly, the creek ran clearer, and bird species that hadn't been seen in years began returning to the area. {userName} had learned that environmental science wasn't just about studying nature—it was about protecting communities and ensuring that everyone had the right to a healthy environment.",
        pause: true,
        hook: "How will this experience shape {userName}'s future environmental work?",
        microVariants: {
          text: "Within eighteen months, the changes were visible. Plants in the community garden grew more vibrantly, the creek ran clearer, and bird species that hadn't been seen in years began returning.",
          alternatives: ["Environmental recovery was remarkable: healthier plants, cleaner water, and returning wildlife showed the success of their efforts.", "The restoration proved that community action could reverse environmental damage and protect public health."],
          optionalDetails: ["Air quality measurements showed significant improvement.", "Property values in the neighborhood began increasing.", "Children could safely play near the creek for the first time in years."]
        }
      },
      {
        text: "Local universities began partnering with {userName}'s community monitoring program, providing scientific equipment and research opportunities for students. The model they had developed—combining rigorous environmental science with community organizing and advocacy—was being replicated in other neighborhoods facing similar environmental justice challenges.",
        pause: true,
        hook: "What broader impact will this model have on environmental justice?",
        microVariants: {
          text: "Local universities began partnering with {userName}'s community monitoring program, providing scientific equipment and research opportunities for students.",
          alternatives: ["Academic partnerships strengthened the program with advanced equipment and research opportunities for community members.", "University collaboration provided scientific credibility and resources for ongoing environmental monitoring."],
          optionalDetails: ["Graduate students conducted research projects with community members.", "Federal grants funded expansion of the monitoring program.", "The model was featured in environmental justice conferences."]
        }
      },
      {
        text: "Regional environmental organizations recognized {userName}'s leadership by inviting them to serve on a youth advisory board for environmental policy development. Their experience had demonstrated that young people could be effective environmental advocates when they combined scientific literacy with community organizing skills and a commitment to environmental justice.",
        pause: true,
        hook: "How will {userName} influence environmental policy at the regional level?",
        microVariants: {
          text: "Regional environmental organizations recognized {userName}'s leadership by inviting them to serve on a youth advisory board for environmental policy development.",
          alternatives: ["Environmental leadership opportunities emerged as {userName} was invited to influence policy development at the regional level.", "Recognition for effective advocacy led to policy influence opportunities with major environmental organizations."],
          optionalDetails: ["The advisory board influenced state environmental regulations.", "Youth perspectives changed how environmental policies were developed.", "Other young activists sought mentorship from {userName}."]
        }
      },
      {
        text: "The state environmental agency adopted {userName}'s community monitoring model as official policy, requiring industrial facilities to fund citizen science programs in affected communities. This policy change meant that environmental protection would no longer depend solely on government oversight but would include trained community members as environmental watchdogs.",
        pause: true,
        hook: "What legacy will this create for future environmental protection?",
        microVariants: {
          text: "The state environmental agency adopted {userName}'s community monitoring model as official policy, requiring industrial facilities to fund citizen science programs in affected communities.",
          alternatives: ["Policy adoption at the state level required industries to support community environmental monitoring as standard practice.", "Government recognition of community monitoring transformed environmental protection from top-down oversight to collaborative partnership."],
          optionalDetails: ["The policy applied to all industrial facilities statewide.", "Training programs prepared community monitors throughout the region.", "Environmental justice became integrated into regulatory processes."]
        }
      },
      {
        text: "National environmental conferences began featuring {userName}'s work as a model for youth-led environmental justice initiatives. Their presentation about combining rigorous science with community organizing inspired environmental educators and activists across the country to develop similar programs that empowered communities to protect their own environmental health.",
        pause: true,
        hook: "How will this influence the national environmental movement?",
        microVariants: {
          text: "National environmental conferences began featuring {userName}'s work as a model for youth-led environmental justice initiatives.",
          alternatives: ["National recognition established {userName}'s model as a template for youth environmental leadership across the country.", "Environmental conferences showcased how community science could advance environmental justice nationwide."],
          optionalDetails: ["The presentation was viewed by thousands of environmental professionals.", "Funding organizations prioritized community-led environmental monitoring.", "Environmental education curricula incorporated community organizing components."]
        }
      },
      {
        text: "International environmental organizations invited {userName} to share their model with communities facing similar environmental justice challenges in other countries. Their local project had demonstrated universal principles: environmental protection requires both scientific knowledge and community empowerment, and young people can be effective leaders when they are supported with proper training and resources.",
        pause: true,
        hook: "What global impact will this approach have on environmental justice?",
        microVariants: {
          text: "International environmental organizations invited {userName} to share their model with communities facing similar environmental justice challenges in other countries.",
          alternatives: ["Global recognition led to international opportunities to replicate community environmental monitoring programs worldwide.", "International environmental networks adopted {userName}'s model for addressing environmental injustice across different cultural contexts."],
          optionalDetails: ["The model was adapted for communities in six different countries.", "United Nations environmental programs incorporated community monitoring principles.", "Global youth environmental networks used {userName}'s approach as a training template."]
        }
      },
      {
        text: "And {userName} learned that protecting the environment means protecting communities, especially those that have been overlooked or undervalued by traditional environmental approaches. They discovered that the most effective environmental science combines rigorous research methods with deep community engagement, ensuring that environmental protection serves both ecological health and social justice. Through their leadership, they had proven that young environmental advocates can create lasting change when they understand that environmental issues are ultimately about ensuring that all people have the right to clean air, clean water, and healthy communities where they can thrive.",
        pause: false,
        hook: "",
        microVariants: {
          text: "And {userName} learned that protecting the environment means protecting communities, especially those that have been overlooked by traditional environmental approaches.",
          alternatives: ["Environmental protection became about community protection, ensuring environmental justice for all people regardless of economic status.", "The most effective environmental work combined scientific rigor with community empowerment and social justice advocacy."],
          optionalDetails: ["Their work influenced environmental policy for decades to come.", "Community members gained skills and confidence for ongoing environmental advocacy.", "The model proved that environmental protection and social justice were inseparable."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every morning, {userName} walks through their restored neighborhood, breathing clean air and listening to the birds that have returned to nest in the community trees. The monitoring station they helped establish hums quietly, continuing to protect their community's environmental health. The peaceful satisfaction of knowing their home is safe and healthy brings daily joy.",
        microVariants: ["Daily walks through the restored neighborhood reveal the success of environmental justice work, with clean air, returning wildlife, and ongoing community protection."]
      },
      {
        type: 'silly',
        text: "The creek became so healthy that fish started jumping out to thank {userName} personally! Soon the community garden was producing vegetables so large they needed cranes to harvest them, and the birds formed a chorus that sang environmental justice songs every morning. What a wonderfully restored ecosystem!",
        microVariants: ["Environmental restoration became so successful that nature itself seemed to celebrate, with overjoyed fish, giant vegetables, and a bird chorus singing about environmental justice!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s environmental justice work leads to a career in environmental policy, eventually becoming the youngest person ever appointed to the Environmental Protection Agency's Environmental Justice Advisory Council. Their community monitoring model becomes standard practice nationwide, protecting millions of people from environmental harm.",
        microVariants: ["{userName}'s environmental justice advocacy leads to national policy influence, with their community monitoring model protecting millions from environmental harm nationwide."]
      },
      {
        type: 'reflective',
        text: "Standing by the clear, flowing creek where their environmental journey began, {userName} understands that environmental protection is really about community protection and social justice. They learned that the most powerful environmental science combines rigorous research with deep care for the people who call a place home, ensuring that everyone has the right to a healthy environment.",
        microVariants: ["Reflecting by the restored creek, {userName} understands that environmental protection requires both scientific rigor and social justice, ensuring healthy environments for all communities."]
      }
    ],
    reuse: {
      swappableElements: {
        "industrial_site": ["factory", "chemical plant", "waste facility", "manufacturing center"],
        "contamination": ["pollution", "toxic chemicals", "harmful runoff", "environmental damage"],
        "monitoring": ["testing", "measurement", "assessment", "surveillance"]
      },
      weatherVariants: ["clear research day", "environmental sampling morning", "community meeting evening", "restoration monitoring session"],
      settingVariants: ["community garden", "creek ecosystem", "town hall", "environmental monitoring station"]
    }
  },

  // Template 4: Arts & Cultural Expression
  {
    title: "The Community Arts Revolution",
    theme: "Arts & Cultural Expression",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} had always loved creating art and practicing {hobbies}, but they became frustrated when their school's arts programs were cut due to budget constraints, leaving many students without opportunities to explore creative expression. The situation became more concerning when {userName} realized that the arts cuts disproportionately affected students from lower-income families who couldn't afford private lessons or expensive supplies.",
        pause: true,
        hook: "How will {userName} bring arts opportunities back to their community?",
        microVariants: {
          text: "{userName} had always loved creating art and practicing {hobbies}, but they became frustrated when their school's arts programs were cut due to budget constraints.",
          alternatives: ["Creative expression through art and {hobbies} was {userName}'s passion, but budget cuts eliminated school arts programs for all students.", "Arts education meant everything to {userName}, making the elimination of school creative programs particularly devastating."],
          optionalDetails: ["The music room was converted to storage space.", "Art supplies were redistributed to other schools.", "Drama productions were cancelled indefinitely."]
        }
      },
      {
        text: "Instead of accepting this loss, {userName} organized a group of student artists, musicians, and performers to create an underground arts movement. They transformed empty classrooms, unused corners of the school, and community spaces into impromptu studios, galleries, and performance venues, proving that creativity could flourish even without official institutional support.",
        pause: true,
        hook: "What creative spaces will emerge from this student-led arts movement?",
        microVariants: {
          text: "Instead of accepting this loss, {userName} organized a group of student artists, musicians, and performers to create an underground arts movement.",
          alternatives: ["Rather than giving up, {userName} rallied creative students to establish an independent arts community throughout the school.", "Student organizing transformed disappointment into action as {userName} created alternative spaces for artistic expression."],
          optionalDetails: ["Hallway walls became gallery spaces for student artwork.", "Stairwells were used for impromptu musical performances.", "Empty classrooms hosted poetry readings and theatrical rehearsals."]
        }
      },
      {
        text: "The underground arts movement caught the attention of professional artists, musicians, and performers in the community who offered to volunteer their time as mentors and instructors. Local businesses donated supplies and space, while community members provided encouragement and audiences for student performances and exhibitions.",
        pause: true,
        hook: "How will professional mentorship transform the student arts movement?",
        microVariants: {
          text: "The underground arts movement caught the attention of professional artists, musicians, and performers in the community who offered to volunteer as mentors.",
          alternatives: ["Professional artists discovered the student movement and volunteered expertise to support creative development.", "Community artists stepped forward to provide mentorship and resources for the independent arts programs."],
          optionalDetails: ["A retired orchestra conductor began teaching music theory.", "Local gallery owners displayed student artwork.", "Theater professionals helped with directing and stage design."]
        }
      },
      {
        text: "What began as a response to budget cuts evolved into something much more powerful: a community arts center that provided free creative programming not just for students but for community members of all ages. {userName} helped coordinate classes in painting, music, creative writing, and digital media, creating opportunities for intergenerational artistic collaboration.",
        pause: true,
        hook: "What impact will the community arts center have on neighborhood creativity?",
        microVariants: {
          text: "What began as a response to budget cuts evolved into something much more powerful: a community arts center that provided free creative programming for all ages.",
          alternatives: ["The student initiative grew into a comprehensive community arts center serving residents across all age groups.", "Budget cut resistance transformed into community-wide creative programming accessible to everyone."],
          optionalDetails: ["Senior citizens learned digital photography alongside teenagers.", "Parent-child art classes built family connections.", "Evening programs served working adults seeking creative outlets."]
        }
      },
      {
        text: "The community arts center became a catalyst for neighborhood revitalization, attracting visitors, supporting local businesses, and creating a sense of pride and identity that had been missing from the area. {userName} documented how arts programming could strengthen communities by providing spaces for creative expression, cultural celebration, and social connection.",
        pause: true,
        hook: "How will arts programming continue to strengthen community connections?",
        microVariants: {
          text: "The community arts center became a catalyst for neighborhood revitalization, attracting visitors and creating community pride.",
          alternatives: ["Arts programming revitalized the neighborhood by creating cultural attractions and strengthening community identity.", "Creative programming transformed the area into a destination that attracted visitors and supported local economic development."],
          optionalDetails: ["Monthly art walks brought hundreds of visitors to local businesses.", "Community murals displayed neighborhood history and values.", "Cultural festivals celebrated the diversity of local traditions."]
        }
      },
      {
        text: "Local politicians and school board members began visiting the community arts center to understand how creative programming could address educational and social challenges. {userName} presented research showing that arts education improved academic performance, reduced behavioral problems, and increased community engagement among participants of all ages.",
        pause: true,
        hook: "How will this evidence influence education policy decisions?",
        microVariants: {
          text: "Local politicians and school board members began visiting the community arts center to understand how creative programming could address educational challenges.",
          alternatives: ["Educational and political leaders studied the arts center to understand its impact on academic and social outcomes.", "Policy makers investigated how community arts programming addressed educational challenges more effectively than traditional approaches."],
          optionalDetails: ["Test scores improved among students participating in arts programs.", "Disciplinary incidents decreased significantly at schools near the arts center.", "Community members reported increased civic engagement and neighborhood pride."]
        }
      },
      {
        text: "The success of {userName}'s community arts center inspired similar initiatives in neighboring communities, creating a network of creative spaces that shared resources, coordinated events, and advocated for arts education funding at the district and state levels. Their model demonstrated that community-led arts programming could be more effective and sustainable than traditional institutional approaches.",
        pause: true,
        hook: "What regional impact will this network have on arts education policy?",
        microVariants: {
          text: "The success of {userName}'s community arts center inspired similar initiatives in neighboring communities, creating a network of creative spaces.",
          alternatives: ["Community arts success replicated across multiple neighborhoods, establishing a regional network of creative programming.", "The model spread to other areas, creating collaborative networks that strengthened arts education advocacy."],
          optionalDetails: ["Seven additional community arts centers opened within two years.", "Regional arts festivals showcased work from all network locations.", "Collaborative funding applications increased available resources for all centers."]
        }
      },
      {
        text: "State education officials invited {userName} to serve on a committee developing new standards for community-based arts education. Their experience had shown that effective arts programming required community partnership, intergenerational participation, and integration with social and economic development initiatives rather than being treated as separate cultural activities.",
        pause: true,
        hook: "How will state-level policy changes support community arts education?",
        microVariants: {
          text: "State education officials invited {userName} to serve on a committee developing new standards for community-based arts education.",
          alternatives: ["Policy influence expanded as {userName} helped develop state standards for integrating community arts with educational programming.", "Educational policy development included {userName}'s insights about effective community-based creative programming."],
          optionalDetails: ["New state funding prioritized community-school arts partnerships.", "Teacher preparation programs included community engagement training.", "Arts education standards emphasized cultural responsiveness and community connection."]
        }
      },
      {
        text: "National arts education organizations featured {userName}'s community model in conferences and publications, demonstrating how young people could lead effective advocacy for creative programming that served both individual artistic development and community building goals. Their work showed that arts education was most powerful when it connected personal creativity with community engagement and social justice.",
        pause: true,
        hook: "What national influence will this model have on arts education approaches?",
        microVariants: {
          text: "National arts education organizations featured {userName}'s community model in conferences and publications, demonstrating youth leadership in arts advocacy.",
          alternatives: ["National recognition established {userName}'s model as a template for community-based arts education nationwide.", "Arts education conferences showcased how student leadership could create sustainable community creative programming."],
          optionalDetails: ["The model was replicated in 15 different states.", "Arts education research incorporated community engagement metrics.", "Federal grant programs prioritized community-led creative initiatives."]
        }
      },
      {
        text: "International cultural organizations invited {userName} to share their approach with communities worldwide seeking to develop grassroots arts programming that could survive budget cuts and political changes. Their model had proven that sustainable arts education required community ownership, intergenerational participation, and integration with community development rather than dependence on institutional funding alone.",
        pause: true,
        hook: "How will this approach influence global arts education development?",
        microVariants: {
          text: "International cultural organizations invited {userName} to share their approach with communities worldwide seeking to develop grassroots arts programming.",
          alternatives: ["Global recognition led to international opportunities to develop community-controlled arts education in different cultural contexts.", "International arts networks adopted {userName}'s model for creating sustainable creative programming independent of institutional funding."],
          optionalDetails: ["The approach was adapted for communities in twelve different countries.", "UNESCO arts education guidelines incorporated community leadership principles.", "Global youth arts networks used {userName}'s model for program development."]
        }
      },
      {
        text: "University art education programs began partnering with {userName}'s community network to provide student teaching experiences that emphasized community engagement alongside traditional artistic training. This partnership created a pipeline of arts educators who understood that effective creative programming must be responsive to community needs and cultural values rather than imposing external artistic standards.",
        pause: true,
        hook: "How will this reshape the preparation of future arts educators?",
        microVariants: {
          text: "University art education programs began partnering with {userName}'s community network to provide student teaching experiences emphasizing community engagement.",
          alternatives: ["Academic partnerships transformed arts educator preparation to include community organizing and cultural responsiveness skills.", "University collaborations created new models for training arts educators in community-based creative programming."],
          optionalDetails: ["Art education students completed community organizing internships.", "Teacher preparation emphasized cultural responsiveness and social justice.", "Graduate programs in community arts development were established at several universities."]
        }
      },
      {
        text: "And {userName} learned that arts education is most powerful when it serves both individual creative development and community building, creating opportunities for people to express their experiences, celebrate their cultures, and imagine new possibilities for their neighborhoods and society. Through their leadership, they discovered that creative expression could be a tool for social justice, community organizing, and building connections across differences of age, race, and economic background, proving that the arts are not luxury activities but essential components of healthy, thriving communities where all people can develop their full potential.",
        pause: false,
        hook: "",
        microVariants: {
          text: "And {userName} learned that arts education is most powerful when it serves both individual creative development and community building.",
          alternatives: ["Creative programming proved most effective when it combined personal artistic growth with community development and social justice goals.", "Arts education became a tool for building inclusive communities where creativity flourished alongside social connection and cultural celebration."],
          optionalDetails: ["Their model influenced arts education policy for generations.", "Community members gained confidence and leadership skills through creative programming.", "The approach demonstrated that arts education and community organizing were mutually reinforcing."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every evening, {userName} walks through the community arts center, hearing music lessons, seeing paintings in progress, and watching people of all ages discover their creative potential. The gentle hum of artistic activity and the joy on participants' faces create a peaceful atmosphere of shared creativity and community connection.",
        microVariants: ["Evening visits to the community arts center reveal the ongoing success of creative programming, with participants of all ages engaged in artistic discovery and community building."]
      },
      {
        type: 'silly',
        text: "The community arts center became so popular that the paintings started applauding themselves, the musical instruments began playing concerts independently, and the poetry started writing itself! Soon {userName} had to mediate between overly enthusiastic art supplies that all wanted to be part of the next community masterpiece!",
        microVariants: ["Creative energy at the arts center reached such heights that the art supplies themselves became enthusiastically artistic, requiring {userName} to coordinate increasingly animated creative materials!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s community arts advocacy leads to a career in cultural policy, eventually establishing a national foundation that supports community-led creative programming. Their model becomes standard practice for arts education, ensuring that creative opportunities are available in every community regardless of economic resources.",
        microVariants: ["{userName}'s arts advocacy creates national impact through policy work, establishing community-led creative programming as standard practice for equitable arts education."]
      },
      {
        type: 'reflective',
        text: "Standing in the community arts center surrounded by the creative work of neighbors of all ages, {userName} understands that arts education is really about community building and social justice. They learned that creative expression is most powerful when it brings people together across differences and provides opportunities for everyone to contribute their unique talents to community life.",
        microVariants: ["Reflecting in the community arts center, {userName} understands that creative programming builds inclusive communities where everyone's artistic contributions strengthen social connections and cultural celebration."]
      }
    ],
    reuse: {
      swappableElements: {
        "arts_programs": ["music classes", "visual arts", "theater productions", "creative writing"],
        "creative_spaces": ["studios", "galleries", "performance venues", "workshop areas"],
        "community_impact": ["revitalization", "pride", "connection", "cultural celebration"]
      },
      weatherVariants: ["creative workshop afternoon", "community performance evening", "artistic collaboration session", "cultural celebration day"],
      settingVariants: ["community arts center", "neighborhood gallery", "performance space", "creative workshop"]
    }
  },

  // Template 5: Technology & Digital Innovation
  {
    title: "The Digital Equity Innovation Lab",
    theme: "Technology & Digital Innovation",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} had always been interested in technology and enjoyed {hobbies}, but they became concerned about digital inequality when they tutored younger students and discovered that many families lacked reliable internet access or modern devices needed for online learning. This digital divide was creating educational disadvantages that could affect students' future opportunities and economic success.",
        pause: true,
        hook: "What innovative solutions will {userName} develop to address digital inequality?",
        microVariants: {
          text: "{userName} had always been interested in technology and enjoyed {hobbies}, but they became concerned about digital inequality when they discovered many families lacked reliable internet access.",
          alternatives: ["Technology fascinated {userName}, especially combined with {hobbies}, but digital inequality concerns emerged while tutoring students without adequate internet access.", "Combining technology interests with {hobbies}, {userName} discovered that digital divides were creating educational barriers for many students."],
          optionalDetails: ["Some students completed homework on smartphones because they had no computer.", "Internet outages meant missed assignment deadlines and lower grades.", "Families chose between internet bills and other essential expenses."]
        }
      },
      {
        text: "Rather than just complaining about the problem, {userName} researched successful digital equity initiatives and learned about community technology programs, device refurbishment projects, and innovative approaches to internet access. They discovered that addressing digital inequality required both technical solutions and community organizing to advocate for policy changes and corporate accountability.",
        pause: true,
        hook: "How will {userName} combine technical innovation with community organizing?",
        microVariants: {
          text: "Rather than just complaining about the problem, {userName} researched successful digital equity initiatives and learned about community technology programs.",
          alternatives: ["Instead of accepting digital inequality, {userName} investigated community technology solutions and policy advocacy approaches.", "Research revealed that digital equity required both technical innovation and community organizing for policy change."],
          optionalDetails: ["Other communities had created successful device lending programs.", "Municipal broadband projects had reduced internet costs significantly.", "Corporate partnerships could provide discounted services with proper advocacy."]
        }
      },
      {
        text: "Working with the local library and community center, {userName} established a digital equity lab that provided device repair services, technology training classes, and advocacy workshops. They trained community members to refurbish donated computers, taught digital literacy skills to people of all ages, and organized campaigns for affordable internet access.",
        pause: true,
        hook: "What impact will the digital equity lab have on community technology access?",
        microVariants: {
          text: "Working with the local library and community center, {userName} established a digital equity lab that provided device repair services and technology training.",
          alternatives: ["Partnership with community organizations created a comprehensive digital equity program offering repair services and skills training.", "The digital equity lab combined technical services with educational programming and policy advocacy."],
          optionalDetails: ["Volunteers learned to repair laptops, tablets, and smartphones.", "Senior citizens attended weekly classes on internet safety and online services.", "Family workshops taught parents how to support children's online learning."]
        }
      },
      {
        text: "The success of the digital equity lab attracted attention from local businesses, which donated old equipment, and from internet service providers, which offered discounted rates for program participants. {userName} negotiated partnerships that provided refurbished devices at affordable prices and internet access programs that families could actually afford.",
        pause: true,
        hook: "How will these partnerships expand digital access throughout the community?",
        microVariants: {
          text: "The success of the digital equity lab attracted attention from local businesses and internet service providers, leading to equipment donations and discounted services.",
          alternatives: ["Community partnerships provided donated equipment and negotiated affordable internet rates for program participants.", "Business engagement created sustainable funding and equipment sources for ongoing digital equity programming."],
          optionalDetails: ["Refurbished laptops were available for $50 instead of $500.", "Internet costs decreased from $80 to $25 monthly for qualifying families.", "Technical support was provided in multiple languages."]
        }
      },
      {
        text: "Community members who had gained technical skills through the program began volunteering as instructors and advocates, creating a sustainable model where people who had been helped could help others. {userName} documented how digital equity programming could build community capacity while addressing technology access barriers that affected education, employment, and civic participation.",
        pause: true,
        hook: "What leadership development will emerge from this community technology program?",
        microVariants: {
          text: "Community members who had gained technical skills through the program began volunteering as instructors and advocates, creating a sustainable model.",
          alternatives: ["Program participants became volunteer leaders, creating sustainable community capacity for ongoing digital equity work.", "Skills development led to community leadership as participants became instructors and advocates for others."],
          optionalDetails: ["Former students taught device repair classes to newcomers.", "Parents who learned digital skills advocated for school technology improvements.", "Community members testified at city council meetings about internet access needs."]
        }
      },
      {
        text: "School district officials recognized that the digital equity lab was addressing problems that affected student academic success, leading to formal partnerships that provided additional resources and integrated community technology programming with school-based learning support. This collaboration ensured that digital equity work supported both individual skill development and educational system improvement.",
        pause: true,
        hook: "How will school partnerships expand the impact of digital equity programming?",
        microVariants: {
          text: "School district officials recognized that the digital equity lab was addressing problems affecting student academic success, leading to formal partnerships.",
          alternatives: ["Educational partnerships integrated community technology programming with school learning support systems.", "School district collaboration provided additional resources while ensuring digital equity supported academic achievement."],
          optionalDetails: ["Teachers referred students with technology needs to the community lab.", "School-provided devices could be repaired at the community facility.", "Digital literacy curricula were coordinated between schools and community programs."]
        }
      },
      {
        text: "Regional technology companies began hiring program participants for entry-level technical positions, recognizing that the practical skills and community engagement experience provided valuable preparation for technology careers. {userName} had created not just a service program but a pathway for economic opportunity that connected community development with individual career advancement.",
        pause: true,
        hook: "What career pathways will emerge from community technology programming?",
        microVariants: {
          text: "Regional technology companies began hiring program participants for entry-level technical positions, recognizing the valuable skills and community experience.",
          alternatives: ["Technology employers recognized community program participants as well-prepared candidates for technical careers.", "Employment opportunities emerged as companies valued the practical skills and community engagement experience from the program."],
          optionalDetails: ["Program graduates were hired as technical support specialists.", "Community organizing skills prepared participants for project management roles.", "Bilingual participants became valuable assets for companies serving diverse communities."]
        }
      },
      {
        text: "State officials invited {userName} to serve on a digital equity task force developing policy recommendations for addressing technology access barriers throughout the region. Their experience had demonstrated that effective digital equity initiatives required coordination between community programs, educational institutions, and technology industry partnerships rather than relying on individual solutions alone.",
        pause: true,
        hook: "How will policy influence expand digital equity programming statewide?",
        microVariants: {
          text: "State officials invited {userName} to serve on a digital equity task force developing policy recommendations for addressing technology access barriers.",
          alternatives: ["Policy influence expanded as {userName} helped develop statewide strategies for coordinated digital equity programming.", "Digital equity task force participation allowed {userName} to influence regional technology access policy development."],
          optionalDetails: ["State funding prioritized community-based digital equity programs.", "Internet service provider regulations included affordability requirements.", "Educational technology policies emphasized community partnership approaches."]
        }
      },
      {
        text: "National technology organizations featured {userName}'s community model in conferences and publications, demonstrating how young people could lead effective digital equity initiatives that combined technical innovation with community organizing and policy advocacy. Their work showed that addressing technology inequality required understanding both technical systems and social justice principles.",
        pause: true,
        hook: "What national influence will this model have on digital equity approaches?",
        microVariants: {
          text: "National technology organizations featured {userName}'s community model, demonstrating youth leadership in digital equity initiatives combining technical innovation with community organizing.",
          alternatives: ["National recognition established {userName}'s model as a template for community-based digital equity programming nationwide.", "Technology conferences showcased how student leadership could address digital inequality through comprehensive community programming."],
          optionalDetails: ["The model was replicated in 20 different metropolitan areas.", "Digital equity research incorporated community organizing metrics.", "Federal broadband funding prioritized community-led technology initiatives."]
        }
      },
      {
        text: "International development organizations invited {userName} to consult on technology access projects in communities worldwide facing similar digital divide challenges. Their model had proven that sustainable digital equity required community ownership, skills development, and policy advocacy rather than simply providing devices or internet access without ongoing support systems.",
        pause: true,
        hook: "How will this approach influence global digital equity development?",
        microVariants: {
          text: "International development organizations invited {userName} to consult on technology access projects in communities worldwide facing digital divide challenges.",
          alternatives: ["Global recognition led to international opportunities to develop community-controlled digital equity programming in different contexts.", "International technology networks adopted {userName}'s model for creating sustainable community technology programs."],
          optionalDetails: ["The approach was adapted for communities in eight different countries.", "United Nations digital development guidelines incorporated community leadership principles.", "Global youth technology networks used {userName}'s model for program development."]
        }
      },
      {
        text: "University computer science programs began partnering with {userName}'s community network to provide service learning experiences that emphasized social justice alongside technical training. These partnerships created a pipeline of technology professionals who understood that effective technical solutions must be responsive to community needs and accessible to people regardless of economic background or previous technical experience.",
        pause: true,
        hook: "How will this reshape the preparation of future technology professionals?",
        microVariants: {
          text: "University computer science programs began partnering with {userName}'s community network to provide service learning experiences emphasizing social justice alongside technical training.",
          alternatives: ["Academic partnerships transformed computer science education to include community engagement and digital equity skills.", "University collaborations created new models for training technology professionals in community-responsive technical development."],
          optionalDetails: ["Computer science students completed digital equity internships.", "Technical training emphasized accessibility and community engagement.", "Graduate programs in community technology development were established at several universities."]
        }
      },
      {
        text: "And {userName} learned that technology is most powerful when it serves community empowerment and social justice rather than simply providing convenient tools for people who already have advantages. Through their leadership, they discovered that addressing digital inequality required combining technical innovation with community organizing, policy advocacy, and recognition that technology access is a social justice issue that affects education, employment, healthcare, and civic participation, proving that effective technology solutions must be designed with and controlled by the communities they claim to serve rather than imposed by external experts or corporations.",
        pause: false,
        hook: "",
        microVariants: {
          text: "And {userName} learned that technology is most powerful when it serves community empowerment and social justice rather than simply providing convenient tools for advantaged users.",
          alternatives: ["Technology became most effective when it combined innovation with community control, ensuring digital equity served social justice goals.", "Effective technology solutions required community ownership and control rather than external expert or corporate imposition."],
          optionalDetails: ["Their model influenced technology policy for decades to come.", "Community members gained technical skills and leadership confidence through program participation.", "The approach demonstrated that digital equity and community organizing were mutually reinforcing."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every afternoon, {userName} visits the bustling digital equity lab, where community members of all ages are learning new technical skills, repairing devices, and teaching each other. The gentle clicking of keyboards and warm conversations create a peaceful atmosphere of shared learning and community empowerment through technology.",
        microVariants: ["Daily visits to the digital equity lab reveal ongoing success of community technology programming, with participants of all ages engaged in learning and mutual support."]
      },
      {
        type: 'silly',
        text: "The refurbished computers became so grateful for their second chance that they started volunteering to help other devices! Soon the digital equity lab had self-repairing laptops, tablets teaching internet safety classes, and smartphones organizing their own tech support groups. What wonderfully community-minded technology!",
        microVariants: ["Refurbished devices became so enthusiastic about community service that they began helping each other and organizing their own technical support networks!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s digital equity work leads to a career in technology policy, eventually founding a national organization that ensures equitable technology access for all communities. Their model becomes standard practice for community technology programs, eliminating digital divides nationwide.",
        microVariants: ["{userName}'s digital equity advocacy creates national impact through policy work, establishing community-controlled technology programming as standard practice for equitable access."]
      },
      {
        type: 'reflective',
        text: "Standing in the digital equity lab surrounded by community members learning and teaching technology skills, {userName} understands that technology access is really about community empowerment and social justice. They learned that the most effective technical solutions combine innovation with community organizing to ensure that technology serves everyone, not just those who already have advantages.",
        microVariants: ["Reflecting in the digital equity lab, {userName} understands that technology access requires community empowerment, ensuring technical solutions serve social justice rather than existing privilege."]
      }
    ],
    reuse: {
      swappableElements: {
        "digital_divide": ["technology inequality", "access barriers", "equipment gaps", "connectivity challenges"],
        "device_repair": ["computer refurbishment", "technical training", "equipment maintenance", "technical support"],
        "community_organizing": ["policy advocacy", "partnership development", "leadership training", "social justice work"]
      },
      weatherVariants: ["productive workshop morning", "community training afternoon", "policy advocacy evening", "collaborative planning session"],
      settingVariants: ["digital equity lab", "community technology center", "device repair workshop", "policy advocacy meeting"]
    }
  },

  // Template 6: Health & Wellness Leadership  
  {
    title: "The Community Wellness Initiative",
    theme: "Health & Wellness Leadership",
    level: "Level 4",
    scenes: [
      {
        text: "{userName} had always been interested in health and fitness through their enjoyment of {hobbies}, but they became concerned about community wellness when they noticed that many of their neighbors lacked access to healthy food options, safe places to exercise, and basic health education. Their awareness grew when they learned that their zip code had significantly higher rates of diabetes, heart disease, and other preventable health conditions compared to wealthier areas nearby.",
        pause: true,
        hook: "What comprehensive wellness strategies will {userName} develop to address health inequities?",
        microVariants: {
          text: "{userName} had always been interested in health and fitness through {hobbies}, but became concerned about community wellness when they noticed neighbors lacked access to healthy options.",
          alternatives: ["Health awareness from {hobbies} led {userName} to recognize community wellness disparities affecting their neighbors.", "Combining fitness interests with {hobbies}, {userName} discovered significant health inequities in their community."],
          optionalDetails: ["The nearest grocery store with fresh produce was 3 miles away.", "Local parks had broken equipment and poor lighting.", "Many families couldn't afford gym memberships or healthy food."]
        }
      },
      {
        text: "Research revealed that health disparities weren't just about individual choices but resulted from systemic barriers including food deserts, lack of safe recreational spaces, and insufficient healthcare access. {userName} learned that addressing community health required combining direct service with policy advocacy to create environments where healthy choices were accessible and affordable for everyone.",
        pause: true,
        hook: "How will {userName} address both immediate needs and systemic health barriers?",
        microVariants: {
          text: "Research revealed health disparities resulted from systemic barriers including food deserts, unsafe recreational spaces, and insufficient healthcare access.",
          alternatives: ["Investigation showed that community health challenges stemmed from environmental factors rather than individual choices alone.", "Analysis revealed that health inequities reflected systemic barriers to healthy living options."],
          optionalDetails: ["Healthy food cost 40% more in their neighborhood than in suburban areas.", "Public transportation to healthcare facilities was limited.", "Community centers lacked wellness programming."]
        }
      },
      {
        text: "Working with community health organizations, local clinics, and school nutrition programs, {userName} helped establish a comprehensive wellness initiative that included community gardens, walking groups, health education workshops, and advocacy for policy changes that would improve food access and recreational opportunities throughout their neighborhood.",
        pause: true,
        hook: "What impact will community-led wellness programming have on neighborhood health?",
        microVariants: {
          text: "Working with health organizations and clinics, {userName} helped establish comprehensive wellness programming including gardens, walking groups, and health education.",
          alternatives: ["Partnership with health providers created multifaceted wellness initiatives combining direct services with educational programming.", "Collaboration with medical professionals developed community health programs addressing multiple wellness factors."],
          optionalDetails: ["Community gardens provided fresh vegetables for 50+ families.", "Walking groups met in three different neighborhood locations.", "Health screenings were offered in multiple languages."]
        }
      },
      {
        text: "The community wellness initiative attracted volunteer health professionals who provided free screenings, nutrition counseling, and fitness classes in neighborhood locations that were accessible and culturally appropriate. {userName} helped coordinate programming that respected community traditions while introducing evidence-based health practices that could prevent chronic diseases and improve quality of life.",
        pause: true,
        hook: "How will professional partnerships expand community health services?",
        microVariants: {
          text: "Volunteer health professionals provided free screenings, nutrition counseling, and fitness classes in accessible neighborhood locations.",
          alternatives: ["Healthcare partnerships brought professional services directly to community members in culturally appropriate settings.", "Medical volunteers offered comprehensive health services within familiar neighborhood environments."],
          optionalDetails: ["Diabetes prevention programs reduced risk factors by 30% among participants.", "Nutrition workshops incorporated traditional foods and cooking methods.", "Exercise programs accommodated different fitness levels and physical abilities."]
        }
      },
      {
        text: "Community members who participated in wellness programs began serving as peer health educators and advocates, creating sustainable leadership that could continue addressing health needs even as specific programs evolved. {userName} documented how community-controlled health programming could be more effective than external interventions because it built on existing social networks and cultural strengths.",
        pause: true,
        hook: "What leadership development will emerge from community wellness programming?",
        microVariants: {
          text: "Program participants became peer health educators and advocates, creating sustainable community leadership for ongoing wellness work.",
          alternatives: ["Wellness participants developed into community health leaders, ensuring program sustainability through peer education and advocacy.", "Community members gained health leadership skills, creating ongoing capacity for neighborhood wellness initiatives."],
          optionalDetails: ["Peer educators conducted home visits for elderly neighbors.", "Community advocates testified at city council meetings about health policy needs.", "Local residents became certified in CPR and first aid through the program."]
        }
      },
      {
        text: "School district officials recognized that community wellness programming was supporting student academic success by addressing health factors that affected learning, leading to partnerships that integrated community health resources with school-based wellness education and family engagement initiatives.",
        pause: true,
        hook: "How will school partnerships expand health education and family wellness?",
        microVariants: {
          text: "School partnerships integrated community health resources with educational wellness programming and family engagement initiatives.",
          alternatives: ["Educational collaboration connected community wellness with school health programming, supporting both student learning and family wellness.", "School district partnerships expanded health education by incorporating community wellness resources and family programming."],
          optionalDetails: ["Student academic performance improved in areas with active wellness programming.", "Family wellness nights were held monthly at neighborhood schools.", "School gardens connected to community food access initiatives."]
        }
      },
      {
        text: "Healthcare systems began partnering with {userName}'s community wellness network to provide preventive care and chronic disease management in neighborhood settings, recognizing that community-based health programming could reduce emergency room visits and improve health outcomes more effectively than clinic-only approaches.",
        pause: true,
        hook: "How will healthcare system partnerships transform community health delivery?",
        microVariants: {
          text: "Healthcare systems partnered with community wellness networks to provide preventive care and chronic disease management in neighborhood settings.",
          alternatives: ["Medical system partnerships brought preventive healthcare directly to community locations, improving health outcomes through neighborhood-based services.", "Healthcare collaboration provided comprehensive medical services within community wellness programming, reducing barriers to care access."],
          optionalDetails: ["Emergency room visits decreased 25% in areas with community health programming.", "Chronic disease management improved significantly with neighborhood-based support.", "Preventive care utilization increased among previously underserved populations."]
        }
      },
      {
        text: "Municipal officials invited {userName} to serve on a community health advisory board developing policy recommendations for addressing health disparities through environmental and social determinants approaches rather than relying solely on individual behavior change interventions.",
        pause: true,
        hook: "How will policy influence address structural barriers to community health?",
        microVariants: {
          text: "Municipal officials invited {userName} to serve on a health advisory board developing policy recommendations for addressing health disparities through environmental approaches.",
          alternatives: ["Policy influence expanded as {userName} helped develop municipal strategies for addressing health disparities through structural and environmental changes.", "Community health advisory board participation allowed {userName} to influence policy addressing social determinants of health."],
          optionalDetails: ["Zoning policies were changed to increase healthy food access.", "Parks and recreation funding prioritized underserved neighborhoods.", "Public transportation routes were improved to connect residents with healthcare facilities."]
        }
      },
      {
        text: "Regional health organizations featured {userName}'s community model in conferences and publications, demonstrating how young people could lead effective health equity initiatives that combined direct service with policy advocacy and community organizing to address root causes of health disparities rather than treating symptoms alone.",
        pause: true,
        hook: "What regional influence will this model have on health equity approaches?",
        microVariants: {
          text: "Regional health organizations featured {userName}'s community model, demonstrating youth leadership in health equity initiatives combining service with policy advocacy.",
          alternatives: ["Regional recognition established {userName}'s model as a template for comprehensive community health programming addressing health disparities.", "Health conferences showcased how student leadership could address health inequities through community organizing and policy advocacy."],
          optionalDetails: ["The model was replicated in 12 different communities across the region.", "Health equity research incorporated community organizing metrics.", "Foundation funding prioritized community-led health initiatives."]
        }
      },
      {
        text: "National public health organizations invited {userName} to consult on community wellness projects addressing health disparities in communities nationwide, recognizing that their model had proven that sustainable health improvement required community ownership, peer leadership, and policy changes that addressed social determinants of health rather than individual behavior modification alone.",
        pause: true,
        hook: "How will this approach influence national health equity development?",
        microVariants: {
          text: "National public health organizations invited {userName} to consult on community wellness projects addressing health disparities nationwide.",
          alternatives: ["National recognition led to opportunities to develop community-controlled health programming addressing health disparities in different contexts.", "Public health networks adopted {userName}'s model for creating sustainable community wellness programs addressing social determinants of health."],
          optionalDetails: ["The approach was adapted for communities in 18 different states.", "CDC community health guidelines incorporated peer leadership principles.", "National health organizations used {userName}'s model for program development training."]
        }
      },
      {
        text: "Medical schools began partnering with {userName}'s community network to provide clinical training experiences that emphasized community health and health equity alongside traditional medical education, creating a pipeline of healthcare professionals who understood that effective healthcare must address social and environmental factors affecting community wellness.",
        pause: true,
        hook: "How will this reshape the preparation of future healthcare professionals?",
        microVariants: {
          text: "Medical schools partnered with {userName}'s community network to provide clinical training emphasizing community health and health equity alongside traditional medical education.",
          alternatives: ["Academic medical partnerships transformed healthcare education to include community health and social determinants training.", "Medical education collaborations created new models for training healthcare professionals in community-responsive health approaches."],
          optionalDetails: ["Medical students completed community health internships in neighborhood settings.", "Healthcare training emphasized cultural responsiveness and health equity.", "Graduate programs in community health leadership were established at several medical schools."]
        }
      },
      {
        text: "And {userName} learned that health is not just about individual medical care but about creating communities where everyone has access to the resources they need to live healthy lives, including nutritious food, safe places to be active, healthcare services, and social connections that support wellness. Through their leadership, they discovered that the most effective health programming combines direct service with community organizing and policy advocacy to address the root causes of health disparities, proving that sustainable wellness requires both individual support and systemic change to ensure that healthy choices are accessible and affordable for all community members regardless of their economic background or zip code.",
        pause: false,
        hook: "",
        microVariants: {
          text: "And {userName} learned that health is about creating communities where everyone has access to resources for healthy living, not just individual medical care.",
          alternatives: ["Health became about community environments supporting wellness for all residents, combining individual support with systemic change.", "Effectively wellness programming required both personal health services and policy changes addressing social determinants of health equity."],
          optionalDetails: ["Their model influenced public health policy for decades to come.", "Community members gained health leadership skills and improved health outcomes through program participation.", "The approach demonstrated that health equity and community organizing were mutually reinforcing."]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Every morning, {userName} walks through their neighborhood, seeing community gardens thriving, neighbors walking together for exercise, and children playing safely in well-maintained parks. The peaceful knowledge that their community has the resources for healthy living brings daily satisfaction and hope for continued wellness.",
        microVariants: ["Daily walks reveal the success of community wellness programming, with thriving gardens, active neighbors, and safe recreational spaces supporting community health and well-being."]
      },
      {
        type: 'silly',
        text: "The community gardens became so healthy that vegetables started doing their own exercise routines! Soon the walking groups had to make room for jogging tomatoes, stretching carrots, and yoga-practicing broccoli. What wonderfully fit and active community produce!",
        microVariants: ["Community wellness became so successful that even the garden vegetables began exercising, with produce joining walking groups and practicing healthy lifestyle habits!"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s community wellness work leads to a career in public health policy, eventually directing a national initiative that ensures health equity for all communities. Their neighborhood model becomes standard practice for community-based health programming, eliminating health disparities nationwide.",
        microVariants: ["{userName}'s wellness advocacy creates national impact through public health policy, establishing community-led health programming as standard practice for health equity."]
      },
      {
        type: 'reflective',
        text: "Standing in the community wellness center surrounded by neighbors of all ages supporting each other's health journeys, {userName} understands that true wellness is about community environments that support healthy living for everyone. They learned that the most effective health work combines individual care with community organizing to ensure that everyone has access to the resources they need to thrive.",
        microVariants: ["Reflecting in the community wellness center, {userName} understands that health equity requires supportive community environments and systemic changes ensuring wellness resources for all residents."]
      }
    ],
    reuse: {
      swappableElements: {
        "health_disparities": ["wellness gaps", "health inequities", "medical access barriers", "nutrition challenges"],
        "community_gardens": ["fitness programs", "wellness centers", "health clinics", "nutrition programs"],
        "policy_advocacy": ["community organizing", "health education", "system change", "equity initiatives"]
      },
      weatherVariants: ["community health fair morning", "wellness workshop afternoon", "policy advocacy evening", "neighborhood exercise session"],
      settingVariants: ["community wellness center", "neighborhood park", "health clinic", "policy meeting"]
    }
  }
];