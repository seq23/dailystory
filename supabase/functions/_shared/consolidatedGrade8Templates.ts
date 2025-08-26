// Grade 8 Templates (Ages 13-14) - Leadership & Social Responsibility  
export const CONSOLIDATED_GRADE_8_TEMPLATES = [
  {
    title: "The Environmental Justice Investigation",
    theme: "Environmental & Social Justice",
    level: "Grade 8", 
    scenes: [
      {
        text: "{userName} became increasingly concerned when they noticed that their school's environmental science class field trips always visited pristine parks and well-funded nature centers in affluent neighborhoods, while completely avoiding the industrial areas where many of their classmates actually lived - areas with factories, waste facilities, and significantly higher rates of asthma and other health problems that seemed mysteriously absent from their textbook's discussions of environmental issues and solutions.",
        pause: true,
        hook: "How will {userName} address these environmental inequities?",
        microVariants: {
          text: "{userName} noticed that environmental education focused on pristine areas while ignoring industrial neighborhoods where classmates lived, revealing environmental justice issues absent from standard curriculum.",
          alternatives: [
            "Environmental science field trips to wealthy areas contrasted sharply with the industrial neighborhoods where many students lived, leading {userName} to question environmental education priorities."
          ],
          optionalDetails: ["Air quality monitors showed different readings across neighborhoods.", "Health data revealed concerning patterns by zip code.", "Some families couldn't afford to move away from pollution sources."]
        }
      },
      {
        text: "Through research and community interviews, {userName} discovered that environmental racism was a well-documented phenomenon where communities of color and low-income neighborhoods disproportionately bore the burden of pollution, toxic waste facilities, and industrial development, while having less political power to resist these placements and fewer resources to relocate - leading {userName} to organize a presentation that would educate their classmates about environmental justice and inspire action toward more equitable environmental policies.",
        pause: true,
        hook: "What changes will {userName}'s research and advocacy efforts achieve?",
        microVariants: {
          text: "Research revealed systematic environmental racism affecting their community, inspiring {userName} to educate peers and advocate for environmental justice through organized presentations and community engagement.",
          alternatives: [
            "Investigating environmental inequities, {userName} uncovered patterns of environmental racism and developed plans to raise awareness and promote policy changes for environmental justice."
          ],
          optionalDetails: ["Community members shared personal stories of environmental health impacts.", "Historical maps showed deliberate placement of polluting facilities.", "Students began connecting environmental and social justice issues."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "{userName}'s presentation to the school board led to curriculum changes that included environmental justice education, community partnerships with affected neighborhoods, and student involvement in local environmental advocacy - demonstrating that young people could effectively challenge systemic inequalities and create meaningful change in their educational institutions and communities.",
        microVariants: [
          "School board approval of {userName}'s environmental justice curriculum proposal led to lasting educational changes and increased student engagement in community environmental advocacy efforts."
        ]
      },
      {
        type: 'reflective', 
        text: "Standing in the community garden that students had helped create in a previously polluted lot, {userName} reflected on how environmental issues were never just about nature, but about power, justice, and ensuring that all people have the right to clean air, water, and healthy communities. 'Real environmental protection means protecting all people,' they understood with new clarity, 'especially those who have been most harmed by environmental injustice.'",
        microVariants: [
          "Working in the community garden they'd helped establish, {userName} gained deep understanding of environmental justice as fundamentally about human rights and equitable protection for all communities."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_issues": ["air pollution", "water contamination", "toxic waste sites", "industrial emissions"],
        "affected_communities": ["low-income neighborhoods", "communities of color", "rural areas", "urban industrial zones"], 
        "advocacy_methods": ["research presentations", "community organizing", "policy proposals", "educational campaigns"]
      },
      weatherVariants: ["research phase", "community meetings", "presentation day", "action planning"],
      settingVariants: ["classroom", "community center", "school board meeting", "affected neighborhood"]
    }
  },
  {
    title: "The Food Justice Research Initiative",
    theme: "Community Health & Economic Equity",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} had always assumed that everyone had access to the same quality food until they began volunteering at a local food pantry and discovered that many families in their city lived in food deserts with limited access to fresh, affordable, nutritious options. Through conversations with food pantry clients, they learned that systemic issues like transportation barriers, income inequality, and the strategic placement of grocery stores created significant health disparities between different neighborhoods, with communities of color and low-income areas disproportionately affected by food insecurity and diet-related diseases.",
        pause: true,
        hook: "How will {userName} address the complex intersection of food access and social justice?",
        microVariants: {
          text: "{userName} discovered food deserts and health disparities through food pantry volunteering, learning how systemic barriers affect community nutrition and health outcomes.",
          alternatives: [
            "Volunteer work revealed how transportation, income, and store placement create unequal food access, particularly affecting communities of color and low-income neighborhoods."
          ],
          optionalDetails: ["Some families traveled over an hour for fresh produce.", "Corner stores charged premium prices for basic necessities.", "Medical clinics saw high rates of diabetes and hypertension in affected areas."]
        }
      },
      {
        text: "Determined to understand the scope of food injustice in their region, {userName} conducted comprehensive research mapping food access patterns, grocery store locations, public transportation routes, and health outcome data. They discovered that food apartheid was not accidental but resulted from decades of discriminatory policies including redlining, urban planning decisions that prioritized certain neighborhoods, and corporate strategies that targeted profitable areas while abandoning others. This research revealed that food justice was fundamentally connected to housing policy, transportation equity, and economic development patterns.",
        pause: true,
        hook: "What solutions will {userName} propose to address systematic food inequity?",
        microVariants: {
          text: "{userName} mapped food access patterns and discovered how historical discriminatory policies created systematic food apartheid affecting entire communities.",
          alternatives: [
            "Research revealed that food deserts resulted from deliberate policy choices including redlining and discriminatory urban planning rather than market forces alone."
          ],
          optionalDetails: ["Historical maps showed how segregation policies influenced food access.", "Transit routes often bypassed grocery stores in certain neighborhoods.", "Zoning laws made it difficult to open food businesses in some areas."]
        }
      },
      {
        text: "Working with community organizations, local farms, and policy advocates, {userName} developed a multi-pronged approach to food justice that included supporting mobile farmers markets, advocating for improved public transportation to grocery stores, and promoting policy changes that would incentivize grocery stores to open in underserved areas. They organized community meetings where residents could share their experiences and priorities, ensuring that solutions were developed with rather than for the affected communities. {userName} also researched successful food justice initiatives in other cities to identify replicable strategies.",
        pause: true,
        hook: "How will community members respond to {userName}'s collaborative approach to food justice?",
        microVariants: {
          text: "{userName} developed comprehensive food justice solutions through community collaboration, mobile markets, transit advocacy, and policy change initiatives.",
          alternatives: [
            "Partnering with communities, {userName} created multi-faceted approaches including farmers markets, transportation improvements, and policy advocacy for food equity."
          ],
          optionalDetails: ["Community members became co-researchers on food access issues.", "Local farmers were eager to expand market access.", "City council members attended community meetings."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Standing in the community garden that had been established on a previously vacant lot, {userName} watched neighbors harvest vegetables they had grown together while children played between the raised beds. The garden was more than a source of fresh food - it had become a gathering place where people shared recipes, stories, and strategies for community improvement. 'Food justice isn't just about groceries,' {userName} understood with deep clarity. 'It's about creating communities where everyone has the power to nourish themselves and each other with dignity and choice.'",
        microVariants: [
          "In the thriving community garden, {userName} recognized that food justice involved dignity, community power, and collective nourishment beyond individual nutrition."
        ]
      },
      {
        type: 'triumphant',
        text: "The comprehensive food justice campaign resulted in three new grocery stores opening in previously underserved areas, expanded bus routes connecting neighborhoods to existing stores, and the establishment of a permanent community-supported agriculture program that provided fresh, local produce at affordable prices. {userName}'s research and advocacy work contributed to new city policies that required food access impact assessments for all urban development projects, ensuring that future planning would prioritize equitable food distribution across all neighborhoods.",
        microVariants: [
          "{userName}'s food justice work achieved new grocery stores, improved transportation, community agriculture programs, and policy changes requiring food access considerations in development."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "food_barriers": ["transportation challenges", "price disparities", "store availability", "cultural food access"],
        "community_solutions": ["mobile markets", "community gardens", "food cooperatives", "policy advocacy"],
        "health_impacts": ["diabetes prevention", "nutrition education", "food security", "community wellness"]
      },
      weatherVariants: ["harvest season", "winter food security", "summer market season", "policy hearing period"],
      settingVariants: ["community garden", "food pantry", "city council chambers", "neighborhood meeting space"]
    }
  },
  {
    title: "The Digital Privacy Rights Campaign",
    theme: "Technology Ethics & Civil Liberties",
    level: "Grade 8",
    scenes: [
      {
        text: "{userName} had always casually clicked 'accept' on privacy policies and terms of service agreements until they learned in computer science class that many popular apps and websites were collecting vast amounts of personal data from teenagers and selling this information to advertisers, data brokers, and other third parties without meaningful consent. When they discovered that their own digital footprint included location tracking, purchasing patterns, private messages, and even biometric data that could be used to manipulate their emotions and decision-making, {userName} realized that digital privacy was a fundamental civil rights issue affecting their generation's autonomy and future opportunities.",
        pause: true,
        hook: "How can {userName} educate peers about digital privacy rights and protection strategies?",
        microVariants: {
          text: "{userName} learned that apps were collecting and selling teen data without meaningful consent, recognizing digital privacy as a civil rights issue affecting their generation.",
          alternatives: [
            "Computer science class revealed extensive data harvesting from teen users, inspiring {userName} to view digital privacy as essential to personal autonomy and rights."
          ],
          optionalDetails: ["Some apps tracked users even when not in use.", "Data brokers sold profiles including mental health inferences.", "Colleges and employers increasingly used social media for screening."]
        }
      },
      {
        text: "Through extensive research into data collection practices, {userName} discovered that the digital privacy landscape was deliberately confusing, with companies using legal and technical language to obscure the extent of their data harvesting. They learned about surveillance capitalism, algorithmic bias, and how personal data was being used to influence everything from purchasing decisions to political opinions. {userName} began documenting specific examples of how their classmates' data was being collected and used, creating clear, accessible explanations of complex privacy concepts that teenagers could understand and act upon.",
        pause: true,
        hook: "What strategies will {userName} develop to empower peers with digital privacy knowledge?",
        microVariants: {
          text: "{userName} researched surveillance capitalism and algorithmic bias, creating accessible explanations of how teen data collection affects decision-making and opportunities.",
          alternatives: [
            "Investigating digital surveillance practices, {userName} developed clear educational materials about data harvesting and its impacts on teenage autonomy and choices."
          ],
          optionalDetails: ["Terms of service documents were deliberately difficult to understand.", "Free apps generated revenue through extensive user surveillance.", "Predictive algorithms influenced content and advertising targeted at teens."]
        }
      },
      {
        text: "Collaborating with the school's technology department and local digital rights organizations, {userName} launched 'Privacy Power' workshops that taught students practical skills for protecting their digital privacy including secure browser configuration, privacy-focused app alternatives, and understanding the real implications of data sharing agreements. They created step-by-step guides for adjusting privacy settings, evaluated popular apps for data protection, and advocated for school policies that would protect student digital rights on campus. The workshops also addressed the broader implications of surveillance technology in society.",
        pause: true,
        hook: "How will {userName}'s digital privacy education impact their school community and beyond?",
        microVariants: {
          text: "{userName} launched 'Privacy Power' workshops teaching practical digital protection skills while advocating for school policies protecting student digital rights.",
          alternatives: [
            "Through workshops and policy advocacy, {userName} empowered peers with privacy protection tools while addressing broader surveillance implications in society."
          ],
          optionalDetails: ["Students learned to use encrypted messaging apps.", "The school updated its technology policies based on student input.", "Parents attended sessions about family digital privacy."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The Privacy Power campaign expanded beyond {userName}'s school to include partnerships with civil liberties organizations and youth advocacy groups across five states. Their educational materials were translated into multiple languages and distributed to schools serving diverse communities. When state legislators began drafting youth digital privacy legislation, {userName} was invited to testify about the real-world impacts of data collection on teenagers, helping to shape laws that would protect the digital rights of an entire generation.",
        microVariants: [
          "{userName}'s Privacy Power campaign influenced state legislation protecting youth digital rights and established multi-state partnerships for digital privacy education."
        ]
      },
      {
        type: 'reflective',
        text: "Looking at their own carefully configured devices and privacy-protective apps, {userName} reflected on how digital privacy work had taught them that technology was not neutral, but shaped by the values and priorities of those who create and control it. 'Every click, every swipe, every share is a choice about what kind of digital future we want,' they realized with growing conviction. 'When young people understand and exercise their digital rights, we're not just protecting our own privacy - we're building a foundation for a more equitable and democratic relationship with technology for everyone.'",
        microVariants: [
          "Using privacy-protective technology, {userName} understood that digital rights work was about shaping technology's role in society and building democratic digital futures."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "privacy_threats": ["location tracking", "behavioral profiling", "biometric collection", "content manipulation"],
        "protection_tools": ["encrypted messaging", "privacy browsers", "secure networks", "data minimization"],
        "advocacy_methods": ["education workshops", "policy research", "legislative testimony", "peer organizing"]
      },
      weatherVariants: ["digital awareness week", "privacy advocacy day", "tech policy hearing", "cybersecurity education"],
      settingVariants: ["computer lab", "privacy workshop space", "legislative hearing room", "digital rights organization"]
    }
  }
];