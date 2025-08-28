// Level 4 Template: Social Media Justice League
export const template = {
  title: "Social Media Justice League",
  theme: "Digital Activism & Information Ethics",
  level: "Level 4",
  scenes: [
    {
      text: "{userName} witnesses their classmate Jordan become the target of a coordinated online harassment campaign after posting about {favoriteAnimal} rights. The attackers use fake accounts, manipulated images, and disinformation to destroy Jordan's reputation, forcing them to delete all social media and transfer schools. {userName} realizes that online cruelty has real-world consequences that adults don't fully understand.",
      pause: true,
      hook: "How can one teenager fight against organized digital harassment and disinformation?",
      microVariants: {
        text: "{userName} watches a coordinated online attack destroy their classmate's life, revealing the dangerous real-world impact of digital harassment.",
        alternatives: ["Jordan's experience with online harassment opens {userName}'s eyes to how digital cruelty can devastate real lives and communities."],
        optionalDetails: ["the harassment spreads across multiple platforms within hours", "fake evidence makes Jordan appear guilty of things they never did"]
      }
    },
    {
      text: "Determined to understand how the attack worked, {userName} teams up with Maya, a computer science student, and Alex, who excels at {hobbies}. They discover the harassment was orchestrated by a group that targets young activists, using sophisticated psychological manipulation and algorithmic amplification to silence voices advocating for social change.",
      pause: true,
      hook: "Should they expose the harassment network at the risk of becoming targets themselves?",
      microVariants: {
        text: "Investigating the harassment reveals a sophisticated network designed to silence young activists through psychological manipulation and algorithmic abuse.",
        alternatives: ["The team's research uncovers organized efforts to weaponize social media algorithms against teenage advocates for social justice."],
        optionalDetails: ["the network has successfully silenced dozens of young activists", "they use advanced psychological profiles to customize attacks"]
      }
    },
    {
      text: "The team faces their first ethical dilemma when they discover they could use the same tactics to fight back - creating fake accounts, spreading counter-narratives, and manipulating algorithms to amplify their message. Alex argues it's justified self-defense, while Maya worries they'll become the very thing they're fighting against.",
      pause: true,
      hook: "When fighting digital injustice, does using unethical methods make you part of the problem?",
      microVariants: {
        text: "The temptation to use the harassers' own tactics creates moral conflict about whether fighting injustice justifies unethical methods.",
        alternatives: ["Discovering the power to fight back with the same unethical tactics forces the team to grapple with questions about digital justice and moral compromise."],
        optionalDetails: ["fake accounts could quickly spread their counter-message", "algorithmic manipulation could work in their favor"]
      }
    },
    {
      text: "{userName} proposes a different approach: instead of fighting deception with deception, they'll create a transparency platform that exposes harassment networks while teaching people to identify and resist digital manipulation. Using skills from {hobbies}, they design a system that makes online harassment visible and traceable without violating anyone's legitimate privacy.",
      pause: true,
      hook: "Can transparency and education be more powerful weapons than manipulation and deception?",
      microVariants: {
        text: "Creative problem-solving through {hobbies} leads to innovative approaches that expose harassment while protecting legitimate privacy and promoting digital literacy.",
        alternatives: ["{userName}'s insight creates a path forward that fights injustice through transparency rather than replicating unethical tactics."],
        optionalDetails: ["the platform could help people recognize manipulation techniques", "transparency tools might deter harassers without violating privacy"]
      }
    },
    {
      text: "Launching their 'Digital Justice Platform' attracts both praise and criticism. Some activists argue that {userName}'s approach is too slow and gentle for fighting organized harassment, while others worry that any form of counter-surveillance creates dangerous precedents. Meanwhile, the harassment network begins targeting the platform itself, testing {userName}'s commitment to ethical methods.",
      pause: true,
      hook: "How do you maintain ethical standards when unethical opponents attack your work?",
      microVariants: {
        text: "The platform's launch brings both support and criticism while attracting attacks that test {userName}'s commitment to ethical digital activism.",
        alternatives: ["Success brings new challenges as both allies and opponents question whether ethical approaches can effectively combat organized digital harassment."],
        optionalDetails: ["some activists want more aggressive counter-attacks", "the harassment network adapts its tactics to avoid detection"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName}'s Digital Justice Platform becomes a global tool for identifying and stopping online harassment while educating users about digital literacy, proving that ethical innovation can be more powerful than unethical retaliation.",
      microVariants: ["The platform's success demonstrates that transparency and education create lasting solutions to digital harassment.", "Global adoption of ethical digital activism tools validates {userName}'s belief in positive rather than punitive approaches."]
    },
    {
      type: 'reflective',
      text: "{userName} continues developing digital justice tools while understanding that fighting online injustice requires not just technical solutions, but a commitment to modeling the ethical behavior we want to see in digital spaces.",
      microVariants: ["Ongoing digital activism teaches {userName} that lasting change requires demonstrating better ways rather than simply opposing bad ones.", "The work reveals that digital justice movements succeed by embodying the values they want to promote online."]
    }
  ],
  reuse: {
    swappableElements: {
      "harassment_tactics": ["coordinated attacks", "fake evidence", "algorithmic manipulation", "psychological targeting"],
      "activist_causes": ["animal rights", "climate action", "social justice", "educational equity"],
      "ethical_dilemmas": ["fighting fire with fire", "privacy versus transparency", "speed versus ethics", "individual versus collective security"],
      "justice_tools": ["transparency platforms", "harassment detection", "digital literacy education", "community accountability systems"]
    },
    weatherVariants: ["during social media storms", "in online activism periods", "at digital rights conferences", "during platform development"],
    settingVariants: ["high school computer labs", "social media platforms", "digital rights organizations", "online communities"],
    randomSeed: 210
  }
};