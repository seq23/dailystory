import type { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_9_FALLBACK_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Mental Health Advocacy Campaign",
    theme: "Mental Health Awareness & Support",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} becomes deeply concerned about mental health challenges affecting their school and broader community, particularly how stigma, lack of resources, and systemic barriers prevent students and families from accessing mental health support. Through research into mental health statistics, conversations with counselors and mental health professionals, and collaboration with peer support groups, they discover the extent to which untreated mental health conditions affect academic performance, social relationships, and overall wellbeing while also contributing to broader social problems including substance abuse, social isolation, and academic failure. The investigation reveals how mental health intersects with issues of poverty, discrimination, trauma, and social justice, and how comprehensive approaches to mental health support can strengthen communities while reducing stigma and improving access to care for all community members.",
        pause: true,
        hook: "What comprehensive mental health advocacy strategy will {userName} develop to reduce stigma while increasing access to mental health resources and support systems?",
        microVariants: {
          text: "{userName} becomes deeply concerned about mental health challenges affecting their school and broader community, particularly how stigma, lack of resources, and systemic barriers prevent students and families from accessing mental health support. Through research into mental health statistics, conversations with counselors and mental health professionals, and collaboration with peer support groups, they discover the extent to which untreated mental health conditions affect academic performance, social relationships, and overall wellbeing while also contributing to broader social problems including substance abuse, social isolation, and academic failure. The investigation reveals how mental health intersects with issues of poverty, discrimination, trauma, and social justice, and how comprehensive approaches to mental health support can strengthen communities while reducing stigma and improving access to care for all community members.",
          alternatives: ["Mental health research exposes systemic barriers that prevent students and families from accessing critical mental health support.", "Investigation reveals how stigma and lack of resources create mental health crises that affect entire communities."],
          optionalDetails: ["local suicide rates among teens increased 34% over two years without adequate {favoriteColor} mental health programs", "73% of students report needing mental health support but only 23% receive adequate care"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive mental health advocacy campaign that includes peer support groups, educational workshops to reduce stigma, training programs for students and educators, and organizing efforts to increase funding for school-based mental health services. The campaign involves collaboration with mental health professionals, community organizations, student government, faculty, and families to create comprehensive support systems that address mental health from multiple angles while centering the voices and experiences of students with lived experience of mental health challenges. Through policy advocacy, community organizing, and direct support programs, {userName} helps create environments where mental health is treated as an essential component of overall health and wellbeing, while working to ensure that all community members have access to culturally responsive and affordable mental health care.",
        pause: true,
        hook: "How will {userName}'s mental health advocacy create lasting change in community attitudes toward mental health while expanding access to support and resources?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive mental health advocacy campaign that includes peer support groups, educational workshops to reduce stigma, training programs for students and educators, and organizing efforts to increase funding for school-based mental health services. The campaign involves collaboration with mental health professionals, community organizations, student government, faculty, and families to create comprehensive support systems that address mental health from multiple angles while centering the voices and experiences of students with lived experience of mental health challenges. Through policy advocacy, community organizing, and direct support programs, {userName} helps create environments where mental health is treated as an essential component of overall health and wellbeing, while working to ensure that all community members have access to culturally responsive and affordable mental health care.",
          alternatives: ["Mental health advocacy creates comprehensive support systems while challenging stigma through education and peer support.", "Campaign work demonstrates how community-based approaches can transform mental health outcomes and social attitudes."],
          optionalDetails: ["peer support groups reduce crisis interventions by 45% while improving academic performance", "advocacy campaign results in $1.2 million increase in school mental health funding"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Final Chapter: The Quiet Revolution in Mental Health\n\n{userName} sits in the peaceful peer support center they helped establish, surrounded by soft {favoriteColor} cushions and gentle lighting, reflecting on how mental health advocacy had taught them that healing happened in community and that everyone deserved access to support without shame or judgment. The center's welcoming atmosphere reminded them that mental health care was ultimately about creating spaces where people could be authentic and vulnerable while receiving the support they needed to thrive.",
        microVariants: [
          "The peer support center had become a haven where mental health conversations happened naturally and healing occurred through genuine human connection.",
          "Silent moments of reflection reminded {userName} that mental health advocacy was ultimately about ensuring everyone had permission to be human and seek support when needed."
        ]
      },
      {
        type: 'silly',
        text: "During the big mental health awareness presentation, {userName} discovers that their stress-relief demonstration involving therapy {favoriteAnimal}s has somehow resulted in a parade of costumed pets providing therapeutic support throughout the school, making it the most adorably effective mental health education day ever!",
        microVariants: ["The therapeutic {favoriteAnimal} invasion becomes the school's most memorable mental health awareness event.", "Who knew that {favoriteAnimal}s could be such effective mental health advocates?"]
      },
      {
        type: 'triumphant',
        text: "{userName}'s advocacy influences school policy and inspires a network of peer mental health advocates who continue expanding support programs and working to eliminate stigma.",
        microVariants: ["The campaign achieves concrete policy victories and builds lasting mental health advocacy infrastructure.", "Other schools adopt {userName}'s peer support model for mental health awareness and education."]
      },
      {
        type: 'reflective',
        text: "{userName} understands that mental health advocacy requires ongoing commitment to supporting community wellbeing and challenging systems that create barriers to care.",
        microVariants: ["Mental health work becomes a lifelong commitment to supporting community healing and psychological wellbeing.", "The experience teaches that effective mental health support must address both individual needs and systemic barriers."]
      }
    ],
    reuse: {
      swappableElements: {
        "mental health focus": ["anxiety support", "depression awareness", "trauma recovery", "peer counseling", "crisis intervention"],
        "advocacy method": ["support groups", "awareness campaigns", "policy advocacy", "educational workshops", "peer training"],
        "support approach": ["peer counseling", "group therapy", "individual support", "family education", "community resources"]
      },
      weatherVariants: ["during Mental Health Awareness Month", "following mental health crises", "during exam periods", "throughout the school year"],
      settingVariants: ["school counseling center", "community center", "support group locations", "healthcare facilities"]
    }
  },
  {
    title: "The Digital Privacy and Rights Campaign",
    theme: "Digital Privacy & Civil Rights",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} becomes increasingly concerned about digital privacy violations, surveillance practices, and how technology companies and government agencies collect, store, and use personal data without meaningful consent or accountability. Through research into data mining practices, surveillance technologies, and digital rights activism, they discover how current digital practices violate civil liberties while creating opportunities for discrimination, manipulation, and social control. Working with digital rights organizations, privacy advocates, and technology experts, {userName} learns about the intersection between digital privacy and broader civil rights issues, including how surveillance disproportionately affects marginalized communities and how data collection can perpetuate systemic discrimination through algorithmic bias and predictive policing. The investigation reveals how protecting digital privacy is essential for preserving democracy, free expression, and social justice in an increasingly digital world.",
        pause: true,
        hook: "What comprehensive digital privacy strategy will {userName} develop to protect civil liberties while educating communities about digital rights and surveillance resistance?",
        microVariants: {
          text: "{userName} becomes increasingly concerned about digital privacy violations, surveillance practices, and how technology companies and government agencies collect, store, and use personal data without meaningful consent or accountability. Through research into data mining practices, surveillance technologies, and digital rights activism, they discover how current digital practices violate civil liberties while creating opportunities for discrimination, manipulation, and social control. Working with digital rights organizations, privacy advocates, and technology experts, {userName} learns about the intersection between digital privacy and broader civil rights issues, including how surveillance disproportionately affects marginalized communities and how data collection can perpetuate systemic discrimination through algorithmic bias and predictive policing. The investigation reveals how protecting digital privacy is essential for preserving democracy, free expression, and social justice in an increasingly digital world.",
          alternatives: ["Digital rights research exposes how surveillance practices violate civil liberties while enabling discrimination and social control.", "Investigation reveals the urgent need for digital privacy protections that safeguard democratic participation and civil rights."],
          optionalDetails: ["local surveillance systems track {favoriteColor} neighborhoods 340% more than affluent areas", "data brokers sell personal information including {favoriteAnimal} preferences for targeted manipulation"]
        }
      },
      {
        text: "{userName} develops and implements a comprehensive digital privacy campaign that includes community education workshops about surveillance resistance, advocacy for stronger privacy legislation, organizing efforts to challenge invasive data collection practices, and direct action campaigns to protect digital civil liberties. The campaign involves collaboration with civil liberties organizations, technology experts, community educators, and affected individuals to build understanding of how digital privacy connects to broader social justice issues while providing practical tools for protecting personal and community data. Through policy advocacy, community organizing, and digital literacy education, {userName} helps create movements that challenge surveillance capitalism while building community capacity for digital security and privacy protection as essential components of civil rights and social justice organizing.",
        pause: true,
        hook: "How will {userName}'s digital rights activism create lasting protection for privacy while building community power to resist surveillance and data exploitation?",
        microVariants: {
          text: "{userName} develops and implements a comprehensive digital privacy campaign that includes community education workshops about surveillance resistance, advocacy for stronger privacy legislation, organizing efforts to challenge invasive data collection practices, and direct action campaigns to protect digital civil liberties. The campaign involves collaboration with civil liberties organizations, technology experts, community educators, and affected individuals to build understanding of how digital privacy connects to broader social justice issues while providing practical tools for protecting personal and community data. Through policy advocacy, community organizing, and digital literacy education, {userName} helps create movements that challenge surveillance capitalism while building community capacity for digital security and privacy protection as essential components of civil rights and social justice organizing.",
          alternatives: ["Digital privacy organizing builds community power to resist surveillance while protecting civil liberties through education and policy advocacy.", "Campaign work demonstrates how digital rights activism can challenge corporate and government surveillance while building democratic accountability."],
          optionalDetails: ["privacy education workshops reach 2,400 community members with digital security training", "advocacy campaign leads to 67% reduction in local government surveillance programs"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "Final Chapter: The Quiet Revolution in Digital Democracy\n\n{userName} sits in the peaceful community garden on a soft {favoriteColor} evening, reflecting on how digital privacy advocacy had taught them that technology could serve community empowerment when developed with democratic oversight and social justice principles. The garden's solar-powered, privacy-protected WiFi network reminded them that technological innovation was ultimately about creating digital infrastructure that strengthened rather than undermined community connections and individual autonomy.",
        microVariants: [
          "The community-controlled technology had become nearly invisible infrastructure that supported both digital connection and real-world relationships while protecting everyone's privacy and dignity.",
          "Silent moments among the flowers reminded {userName} that digital privacy was ultimately about ensuring technology served human flourishing rather than surveillance and control."
        ]
      },
      {
        type: 'silly',
        text: "During the big digital privacy presentation, {userName} discovers that their super-secure encryption demonstration has somehow turned all the presentation slides into pictures of {favoriteAnimal}s wearing tiny privacy masks, making it the most adorably educational cybersecurity lesson ever!",
        microVariants: ["The encrypted {favoriteAnimal} invasion becomes the neighborhood's most memorable digital privacy lesson.", "Who knew that {favoriteAnimal}s could be such effective digital rights advocates?"]
      },
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
        type: 'cozy',
        text: "Final Chapter: The Healing Circle of Justice\n\n{userName} sits in the warm community restorative justice center, surrounded by soft {favoriteColor} chairs arranged in a healing circle, reflecting on how criminal justice reform had taught them that true safety came from addressing harm through healing and community support rather than punishment and isolation. The center's peaceful atmosphere reminded them that justice was ultimately about repairing relationships and preventing future harm through community care and mutual support.",
        microVariants: [
          "The restorative justice center had become a place where healing happened through genuine accountability and community support rather than punishment and isolation.",
          "Quiet moments in the healing circle reminded {userName} that true justice was about creating safety through community care and addressing root causes of harm."
        ]
      },
      {
        type: 'silly',
        text: "During the big criminal justice reform presentation, {userName} discovers that their restorative justice demonstration involving therapy {favoriteAnimal}s has somehow created a community mediation service where trained pets help facilitate conflict resolution, making it the most adorably effective justice program ever!",
        microVariants: ["The therapeutic {favoriteAnimal} mediation service becomes the community's most successful conflict resolution program.", "Who knew that {favoriteAnimal}s could be such effective justice advocates?"]
      },
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