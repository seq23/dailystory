// Grade 7 Template: Digital Citizenship Dilemma
export const template = {
  title: "The Digital Citizenship Dilemma",
  theme: "Ethics & Technology",
  level: "Grade 7",
  scenes: [
    {
      text: "{userName} witnessed something troubling during lunch when a group of students used social media to spread a false rumor about a classmate, watching as the story grew more exaggerated with each share and seeing how quickly online drama could impact someone's real-life friendships and emotional well-being, forcing {userName} to grapple with questions about bystander responsibility, digital ethics, and the power that young people wield when they participate in or stay silent about online behavior.",
      pause: true,
      hook: "What action will {userName} take regarding the harmful social media situation?",
      microVariants: {
        text: "{userName} witnessed harmful social media behavior targeting a classmate, confronting difficult questions about digital responsibility and the real-world impact of online actions.",
        alternatives: [
          "Observing how false rumors spread rapidly through social media and damaged a peer's reputation, {userName} faced challenging decisions about intervention and digital citizenship."
        ],
        optionalDetails: ["The rumors seemed to multiply exponentially online.", "The targeted student appeared increasingly isolated at school.", "Friends were choosing sides based on incomplete information."]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "By courageously speaking up and helping to organize a school-wide digital citizenship workshop, {userName} not only helped clear their classmate's reputation but also sparked important conversations about online responsibility that led to new school policies supporting both digital wellness and restorative justice approaches to technology-related conflicts.",
      microVariants: [
        "{userName}'s intervention in the digital bullying situation led to positive school policy changes and enhanced awareness about responsible technology use among students."
      ]
    }
  ],
  reuse: {
    swappableElements: {
      "digital_platforms": ["social media apps", "messaging groups", "online forums", "video platforms"],
      "ethical_dilemmas": ["cyberbullying intervention", "false information sharing", "privacy violations", "digital harassment"],
      "solutions": ["peer mediation", "adult intervention", "education programs", "policy changes"]
    },
    weatherVariants: ["lunch period", "after school", "weekend online activity"],
    settingVariants: ["school cafeteria", "computer lab", "guidance counselor office", "peer mediation room"]
  }
};