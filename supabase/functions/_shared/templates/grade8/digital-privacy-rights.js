// Grade 8 Template: Digital Privacy Rights Campaign
export const template = {
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
    settingVariants: ["computer lab", "community center", "legislative chamber", "digital rights organization"]
  }
};