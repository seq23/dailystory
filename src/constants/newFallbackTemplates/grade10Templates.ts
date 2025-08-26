/**
 * Grade 10 Templates - Complete Fallback Story Library
 * 3 templates, ~16 chapters each, 1200-1400 words total
 * Maximum complexity with sophisticated themes
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_10_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Political Science & Democracy
  {
    title: "The Participatory Democracy Experiment: Reimagining Civic Engagement",
    theme: "Political Science & Democracy",
    level: "Grade 10",
    scenes: [
      {
        text: "Chapter 1: The Democratic Deficit\n\n{userName} had dutifully participated in their high school's annual mock election exercises and student government campaigns, viewing them as adequate preparation for adult civic participation, until a tenth-grade advanced placement government course examining democratic theory and practice revealed the significant gaps between idealized democratic processes and actual political participation rates, voter disenfranchisement patterns, and systematic barriers that prevented many community members from meaningfully influencing policy decisions that directly affected their daily lives and long-term opportunities. This academic revelation coincided with {userName}'s observation that their own community struggled with persistent challenges including inadequate public transportation, limited affordable housing options, and insufficient mental health resources, despite these issues being consistently raised during candidate forums and town hall meetings, suggesting fundamental disconnects between electoral politics and responsive governance that traditional civic education approaches had failed to address comprehensively. Inspired by their passion for {hobbies} and motivated by historical examples of successful grassroots democratic innovations, {userName} began investigating participatory democracy models, community organizing strategies, and alternative governance structures that emphasized direct citizen involvement in policy development, resource allocation, and accountability mechanisms rather than relying exclusively on representative systems that often failed to reflect constituent priorities or respond effectively to community needs.",
        pause: true,
        hook: "How will {userName} develop new models of democratic participation that actually serve community needs?",
        microVariants: {
          text: "Chapter 1: The Democratic Deficit\n\n{userName} had dutifully participated in their high school's annual mock election exercises and student government campaigns, viewing them as adequate preparation for adult civic participation, until a tenth-grade advanced placement government course examining democratic theory and practice revealed the significant gaps between idealized democratic processes and actual political participation rates, voter disenfranchisement patterns, and systematic barriers that prevented many community members from meaningfully influencing policy decisions that directly affected their daily lives and long-term opportunities. This academic revelation coincided with {userName}'s observation that their own community struggled with persistent challenges including inadequate public transportation, limited affordable housing options, and insufficient mental health resources, despite these issues being consistently raised during candidate forums and town hall meetings, suggesting fundamental disconnects between electoral politics and responsive governance that traditional civic education approaches had failed to address comprehensively. Inspired by their passion for {hobbies} and motivated by historical examples of successful grassroots democratic innovations, {userName} began investigating participatory democracy models, community organizing strategies, and alternative governance structures that emphasized direct citizen involvement in policy development, resource allocation, and accountability mechanisms rather than relying exclusively on representative systems that often failed to reflect constituent priorities or respond effectively to community needs.",
          alternatives: [
            "Chapter 1: Analyzing Democratic Limitations\n\n{userName} had conscientiously engaged in their educational institution's yearly simulated electoral activities and student leadership initiatives, considering them sufficient groundwork for mature civic involvement, until tenth-grade accelerated governmental studies curriculum analyzing democratic principles and implementation exposed substantial disparities between theoretical democratic procedures and authentic political engagement statistics, electoral exclusion configurations, and institutional obstacles preventing numerous community participants from substantially influencing policy formulation processes that directly impacted their routine experiences and future possibilities. This scholastic discovery aligned with {userName}'s recognition that their residential community confronted ongoing difficulties including deficient public transit systems, constrained economical housing availability, and inadequate psychological wellness services, notwithstanding these concerns being systematically addressed throughout candidate presentations and municipal assemblies, indicating fundamental separations between electoral mechanisms and effective administration that conventional civic preparation methodologies had proven unsuccessful in resolving thoroughly. Energized by their dedication to {hobbies} and influenced by historical precedents of effective community-based democratic experimentation, {userName} commenced research into participatory governance frameworks, grassroots mobilization approaches, and alternative administrative structures that prioritized direct citizen engagement in policy creation, resource distribution, and oversight systems rather than depending solely on representative frameworks that frequently failed to accurately represent constituent concerns or respond adequately to neighborhood requirements."
          ],
          optionalDetails: [
            `Participation Data ${Math.floor(Math.random() * 100)}: Local voter turnout averaged 34% in municipal elections over the past decade.`,
            `Policy Gap ${Math.floor(Math.random() * 100)}: 73% of community survey priorities were not addressed in the current budget.`,
            `Representation Issue ${Math.floor(Math.random() * 100)}: City council demographics did not reflect the community's {favoriteColor} diversity statistics.`
          ]
        }
      },
      {
        text: "Chapter 2: Participatory Democracy Research\n\nDetermined to understand how democratic systems could be more responsive to community needs, {userName} researched participatory budgeting, citizen assemblies, and other democratic innovations while conducting interviews with community members about their experiences with local government and their ideas for improving civic engagement and accountability.",
        pause: true,
        hook: "What democratic innovations will {userName} discover that could transform local governance?",
        microVariants: {
          text: "Chapter 2: Democratic Innovation Research\n\n{userName} researched participatory budgeting and citizen assemblies while interviewing community members about local government experiences.",
          alternatives: ["Through systematic research into democratic innovations, {userName} explored participatory governance models while gathering community input on civic engagement needs."],
          optionalDetails: [`Research identified ${Math.floor(Math.random() * 25) + 15} communities with successful participatory democracy initiatives.`]
        }
      },
      {
        text: "Chapter 3: Community Organizing and Pilot Programs\n\nWorking with community organizations, civic groups, and local government officials, {userName} helped organize pilot programs in participatory democracy including neighborhood assemblies, youth policy councils, and collaborative budgeting processes that gave community members direct involvement in decisions affecting their daily lives and neighborhood development priorities.",
        pause: true,
        hook: "How will pilot programs demonstrate the effectiveness of participatory democracy?",
        microVariants: {
          text: "Chapter 3: Organizing and Pilots\n\nWith community organizations, {userName} organized participatory democracy pilots including neighborhood assemblies and collaborative budgeting processes.",
          alternatives: ["Through partnerships with civic groups, {userName} facilitated pilot programs in participatory governance that provided direct community involvement in local decision-making."],
          optionalDetails: [`Pilot programs engaged ${Math.floor(Math.random() * 400) + 300} community members in participatory decision-making processes.`]
        }
      },
      {
        text: "Chapter 4: Policy Implementation and Institutional Change\n\n{userName}'s participatory democracy work influenced municipal governance reforms, school district decision-making processes, and regional planning initiatives, demonstrating how student civic leadership could create systemic changes that made democratic institutions more responsive to community priorities and more inclusive of diverse voices and perspectives.",
        pause: true,
        hook: "What institutional changes will ensure lasting democratic reform and community empowerment?",
        microVariants: {
          text: "Chapter 4: Policy and Institutional Change\n\n{userName}'s participatory democracy work influenced municipal governance reforms and regional planning initiatives.",
          alternatives: ["Democratic organizing resulted in institutional reforms affecting municipal governance, educational decision-making, and regional planning processes."],
          optionalDetails: [`Reforms expanded participatory decision-making to ${Math.floor(Math.random() * 50) + 30}% of municipal budget allocations.`]
        }
      },
      {
        text: "Chapter 5: National Recognition and Democratic Leadership\n\nThe success of {userName}'s participatory democracy initiatives attracted attention from political scientists, democracy organizations, and civic engagement researchers who recognized that youth-led democratic innovation could revitalize American democracy by creating more inclusive, responsive, and effective approaches to community governance and citizen participation.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Chapter 5: National Recognition\n\nThe participatory democracy initiatives' success attracted attention from political scientists and democracy organizations.",
          alternatives: ["National recognition of the democratic innovation model led to widespread interest in youth-led approaches to civic engagement and community governance."],
          optionalDetails: [`The model influenced democratic reform initiatives in ${Math.floor(Math.random() * 25) + 20} municipalities nationwide.`]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Community Democracy Institute\n\nFour years after identifying the limitations of traditional democratic processes, {userName} had successfully established a community democracy institute that had facilitated the implementation of participatory budgeting processes in three municipalities, created citizen assemblies that developed policy recommendations on housing and transportation, and trained over 500 community members in facilitation skills, policy analysis, and collaborative decision-making techniques that strengthened democratic participation across age, racial, and socioeconomic lines. Their innovative approaches to civic engagement had attracted attention from political scientists, municipal governments, and democracy organizations nationwide, leading to consulting opportunities and research partnerships that documented how participatory democracy initiatives could increase political efficacy, improve policy outcomes, and rebuild trust in democratic institutions when community members were given meaningful opportunities to shape decisions affecting their lives. As {userName} prepared to pursue graduate studies in political science and public policy, they reflected on how their initial frustration with ineffective student government had evolved into sophisticated understanding of how democratic systems could be redesigned to prioritize community wisdom, shared power, and collective problem-solving, demonstrating that meaningful democratic reform requires both institutional innovation and sustained commitment to expanding opportunities for authentic civic participation that goes far beyond voting in periodic elections.",
        microVariants: [
          "Their democracy institute had facilitated $2.7 million in participatory budgeting decisions, created policy changes addressing 85% of community-identified priorities, and established replicable models for participatory democracy that were being adapted by municipalities in four states."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "participatory budgeting": ["citizen assemblies", "community forums", "policy juries", "neighborhood councils"],
        "student government": ["youth councils", "peer leadership", "democratic committees", "civic organizations"]
      },
      weatherVariants: ["systematically", "comprehensively", "methodically", "strategically"],
      settingVariants: ["throughout their community", "across municipal systems", "within democratic institutions", "among civic organizations"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 2: Philosophy & Ethics 
  {
    title: "The Ethics of Artificial Intelligence: Navigating Technological Transformation",
    theme: "Philosophy & Ethics",
    level: "Grade 10",
    scenes: [
      {
        text: "Chapter 1: The Algorithmic Dilemma\n\n{userName} had grown up using recommendation algorithms, search engines, and artificial intelligence applications as seamlessly integrated tools for entertainment, education, and social connection, accepting their presence as neutral technological conveniences that enhanced daily life experiences, until a tenth-grade philosophy course examining technology ethics revealed the profound moral complexities embedded within algorithmic decision-making systems that increasingly determined which job applications received consideration, which students qualified for educational opportunities, which communities received investment resources, and which individuals faced enhanced surveillance or criminal justice scrutiny. Through careful investigation of algorithmic bias research, {userName} discovered that artificial intelligence systems often perpetuated and amplified existing social inequalities, making discriminatory decisions based on historical data patterns that reflected centuries of systemic racism, gender discrimination, and economic exclusion, while their apparent objectivity and mathematical precision obscured these biases from users who trusted algorithmic recommendations without understanding their underlying assumptions and limitations. This troubling recognition intersected with {userName}'s interest in {hobbies} and emerging concerns about technological development trajectories that prioritized efficiency and profit maximization over equity, transparency, and human dignity, inspiring them to explore philosophical frameworks for evaluating technological progress and developing ethical principles that could guide artificial intelligence development toward outcomes that supported rather than undermined democratic values and social justice goals.",
        pause: true,
        hook: "What ethical frameworks will {userName} develop to ensure AI serves humanity rather than replacing human judgment?",
        microVariants: {
          text: "Chapter 1: The Algorithmic Dilemma\n\n{userName} had grown up using recommendation algorithms, search engines, and artificial intelligence applications as seamlessly integrated tools for entertainment, education, and social connection, accepting their presence as neutral technological conveniences that enhanced daily life experiences, until a tenth-grade philosophy course examining technology ethics revealed the profound moral complexities embedded within algorithmic decision-making systems that increasingly determined which job applications received consideration, which students qualified for educational opportunities, which communities received investment resources, and which individuals faced enhanced surveillance or criminal justice scrutiny. Through careful investigation of algorithmic bias research, {userName} discovered that artificial intelligence systems often perpetuated and amplified existing social inequalities, making discriminatory decisions based on historical data patterns that reflected centuries of systemic racism, gender discrimination, and economic exclusion, while their apparent objectivity and mathematical precision obscured these biases from users who trusted algorithmic recommendations without understanding their underlying assumptions and limitations. This troubling recognition intersected with {userName}'s interest in {hobbies} and emerging concerns about technological development trajectories that prioritized efficiency and profit maximization over equity, transparency, and human dignity, inspiring them to explore philosophical frameworks for evaluating technological progress and developing ethical principles that could guide artificial intelligence development toward outcomes that supported rather than undermined democratic values and social justice goals.",
          alternatives: [
            "Chapter 1: Confronting Technological Bias\n\n{userName} had developed utilizing recommendation systems, information retrieval platforms, and machine learning applications as naturally incorporated instruments for recreational activities, educational pursuits, and social interactions, acknowledging their existence as impartial technological amenities that improved routine life encounters, until tenth-grade philosophical studies curriculum examining technological ethics exposed the substantial moral intricacies embedded within computational decision-making frameworks that progressively influenced which employment submissions received evaluation, which students achieved qualification for educational pathways, which communities obtained investment funding, and which persons encountered increased monitoring or legal system examination. Through systematic investigation of algorithmic prejudice research literature, {userName} identified that machine intelligence frameworks frequently sustained and magnified current social disparities, generating discriminatory determinations derived from historical information configurations that embodied generations of institutional racism, gender-based discrimination, and financial marginalization, while their perceived neutrality and computational accuracy concealed these prejudices from users who relied upon algorithmic suggestions without comprehending their foundational presumptions and constraints. This concerning awareness intersected with {userName}'s engagement in {hobbies} and developing apprehensions regarding technological advancement directions that emphasized operational effectiveness and revenue optimization over fairness, accountability, and human worth, encouraging them to examine philosophical structures for assessing technological development and establishing ethical standards that could direct machine intelligence creation toward results that reinforced rather than compromised democratic principles and social equity objectives."
          ],
          optionalDetails: [
            `AI Bias Finding ${Math.floor(Math.random() * 100)}: Resume screening algorithms showed 40% bias against {favoriteColor}-associated names.`,
            `Surveillance Reality ${Math.floor(Math.random() * 100)}: Facial recognition accuracy dropped 35% for certain demographic groups.`,
            `Decision Impact ${Math.floor(Math.random() * 100)}: Algorithmic loan decisions affected 2.3 million applications annually in their state.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Final Chapter: The Center for Ethical Technology\n\nThree years after confronting the ethical complexities of artificial intelligence systems, {userName} had successfully established partnerships between local technology companies, community organizations, and academic researchers to create an ethical technology review process that evaluated algorithmic systems for bias, transparency, and community impact before implementation, while developing educational resources that helped community members understand and advocate for responsible technology policies that prioritized human welfare over technological efficiency. Their work had contributed to municipal algorithmic accountability ordinances, corporate diversity initiatives in technology development teams, and community input processes that ensured affected populations had meaningful participation in decisions about technological systems that would impact their lives, creating precedents for democratic governance of emerging technologies. As {userName} prepared to study philosophy and computer science in college, they reflected on how their initial shock at discovering algorithmic bias had evolved into a sophisticated framework for evaluating technological progress through ethical lenses that considered both intended and unintended consequences, community impacts, and long-term implications for democratic society, demonstrating that meaningful technology policy requires ongoing collaboration between technical experts, affected communities, and ethical philosophers who can help navigate the complex moral terrain of technological transformation while preserving human agency and social justice in an increasingly automated world.",
        microVariants: [
          "Their ethical technology center had reviewed 47 algorithmic systems, prevented implementation of 8 biased AI tools, and established community oversight processes that became models for ethical technology governance in universities and corporations nationwide."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "algorithmic bias": ["technological discrimination", "AI prejudice", "computational inequality", "digital bias"],
        "recommendation algorithms": ["content filtering", "automated decisions", "predictive systems", "machine learning tools"]
      },
      weatherVariants: ["systematically", "comprehensively", "methodically", "critically"],
      settingVariants: ["within technological systems", "across digital platforms", "throughout AI applications", "among algorithmic processes"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 3: Advanced Scientific Research & Innovation
  {
    title: "The Climate Solutions Laboratory: Advanced Research for Global Impact",
    theme: "Advanced Scientific Research & Innovation",
    level: "Grade 10", 
    scenes: [
      {
        text: "Chapter 1: The Research Question\n\n{userName} had participated in various science fair competitions and environmental club activities throughout high school, demonstrating consistent interest in sustainability and scientific methodology, but their approach to environmental research transformed significantly when a tenth-grade advanced placement environmental science course challenged students to design and implement original research projects addressing climate change adaptation or mitigation strategies using professional scientific protocols and community-based participatory research methods. Rather than conducting another literature review or simple data collection exercise, {userName} decided to investigate whether locally-adapted renewable energy microgrids could provide resilient power systems for their community while creating economic opportunities through community ownership models that had been successfully implemented in rural areas of Germany, Denmark, and Costa Rica but had received limited attention in suburban American contexts. This ambitious research project required {userName} to develop expertise in multiple disciplines including electrical engineering, economic analysis, community organizing, and policy research, while maintaining rigorous scientific standards for data collection, analysis, and peer review that would allow their findings to contribute meaningfully to academic literature and policy discussions. The intersection of their interest in {hobbies}, growing understanding of environmental justice issues, and commitment to scientific excellence motivated {userName} to approach this research with the seriousness and sophistication typically associated with graduate-level investigation, recognizing that addressing climate change effectively required both technical innovation and community engagement strategies that could bridge the gap between scientific knowledge and practical implementation.",
        pause: true,
        hook: "What groundbreaking solutions will {userName} discover through their advanced climate research?",
        microVariants: {
          text: "Chapter 1: The Research Question\n\n{userName} had participated in various science fair competitions and environmental club activities throughout high school, demonstrating consistent interest in sustainability and scientific methodology, but their approach to environmental research transformed significantly when a tenth-grade advanced placement environmental science course challenged students to design and implement original research projects addressing climate change adaptation or mitigation strategies using professional scientific protocols and community-based participatory research methods. Rather than conducting another literature review or simple data collection exercise, {userName} decided to investigate whether locally-adapted renewable energy microgrids could provide resilient power systems for their community while creating economic opportunities through community ownership models that had been successfully implemented in rural areas of Germany, Denmark, and Costa Rica but had received limited attention in suburban American contexts. This ambitious research project required {userName} to develop expertise in multiple disciplines including electrical engineering, economic analysis, community organizing, and policy research, while maintaining rigorous scientific standards for data collection, analysis, and peer review that would allow their findings to contribute meaningfully to academic literature and policy discussions. The intersection of their interest in {hobbies}, growing understanding of environmental justice issues, and commitment to scientific excellence motivated {userName} to approach this research with the seriousness and sophistication typically associated with graduate-level investigation, recognizing that addressing climate change effectively required both technical innovation and community engagement strategies that could bridge the gap between scientific knowledge and practical implementation.",
          alternatives: [
            "Chapter 1: Designing Advanced Research\n\n{userName} had engaged in numerous scientific competition events and environmental advocacy activities throughout secondary education, exhibiting persistent dedication to sustainability principles and research methodologies, however their environmental investigation approach underwent substantial transformation when tenth-grade accelerated environmental studies curriculum challenged students to develop and execute original research initiatives addressing climate modification adaptation or greenhouse gas reduction approaches utilizing professional scientific procedures and community-integrated participatory investigation techniques. Rather than completing additional academic literature analysis or basic information gathering activities, {userName} chose to examine whether regionally-customized renewable power distribution networks could deliver resilient electrical infrastructure for their community while generating financial opportunities through collective ownership frameworks that had achieved success in agricultural regions of Germany, Denmark, and Costa Rica but had obtained insufficient consideration in residential American environments. This comprehensive research undertaking demanded {userName} to cultivate proficiency across numerous academic areas including electrical systems engineering, financial evaluation, grassroots mobilization, and governmental policy analysis, while preserving strict scientific criteria for information collection, statistical analysis, and scholarly evaluation that would enable their discoveries to contribute substantially to academic publications and policy deliberations. The convergence of their engagement in {hobbies}, expanding comprehension of environmental equity concerns, and dedication to scientific rigor motivated {userName} to pursue this investigation with the gravity and complexity characteristically associated with advanced academic research, acknowledging that confronting climate transformation effectively necessitated both technological advancement and community participation approaches that could connect scientific understanding with practical application strategies."
          ],
          optionalDetails: [
            `Research Scope ${Math.floor(Math.random() * 100)}: Initial analysis covered energy consumption patterns for 847 households across 6 neighborhoods.`,
            `Technical Challenge ${Math.floor(Math.random() * 100)}: Microgrid integration required analyzing 15 different {favoriteColor} solar panel configurations.`,
            `Community Engagement ${Math.floor(Math.random() * 100)}: 78% of surveyed residents expressed interest in community-owned renewable energy options.`
          ]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The International Climate Innovation Network\n\nTwo years after beginning their microgrid research project, {userName} had successfully completed a comprehensive study that documented the technical feasibility, economic benefits, and community acceptance of renewable energy microgrids in suburban contexts, contributing original research to peer-reviewed academic journals while facilitating the implementation of three pilot projects that provided clean energy access to over 450 households and created 27 local jobs in renewable energy installation, maintenance, and community coordination. Their research had attracted international attention from climate scientists, policy researchers, and community development organizations, leading to speaking opportunities at environmental conferences, collaboration requests from universities in four countries, and inclusion in a United Nations youth climate research initiative that connected young scientists worldwide to accelerate climate solution development and implementation. As {userName} prepared to begin undergraduate studies in environmental engineering and sustainable development, they reflected on how their initial high school research question had evolved into a comprehensive understanding of how scientific research could drive both technological innovation and social change when conducted with community partnerships and commitment to environmental justice, demonstrating that young researchers could make meaningful contributions to global climate solutions while developing the interdisciplinary expertise necessary to address complex environmental challenges that require integration of technical knowledge, economic analysis, community organizing, and policy advocacy to achieve lasting impact.",
        microVariants: [
          "Their microgrid research had been cited in 23 academic publications, influenced renewable energy policy in 7 states, and established a replicable model for community-owned clean energy systems that was being implemented internationally through climate development partnerships."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "renewable energy": ["carbon sequestration", "sustainable agriculture", "green transportation", "ecological restoration"],
        "microgrids": ["energy storage", "efficiency systems", "distribution networks", "smart technologies"]
      },
      weatherVariants: ["systematically", "comprehensively", "methodically", "rigorously"],
      settingVariants: ["across communities", "throughout regions", "within energy systems", "among research networks"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  }
];

/**
 * Get a random Grade 10 template or specific template by index
 */
export function getGrade10FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_10_FALLBACK_TEMPLATES.length) {
    return GRADE_10_FALLBACK_TEMPLATES[templateIndex];
  }
  
  if (GRADE_10_FALLBACK_TEMPLATES.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * GRADE_10_FALLBACK_TEMPLATES.length);
  return GRADE_10_FALLBACK_TEMPLATES[randomIndex];
}

/**
 * Get the count of available Grade 10 templates
 */
export function getGrade10FallbackTemplateCount(): number {
  return GRADE_10_FALLBACK_TEMPLATES.length;
}