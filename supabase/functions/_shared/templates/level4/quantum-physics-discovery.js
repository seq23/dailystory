// Level 4 Template: Quantum Physics Discovery
export const template = {
  title: "Quantum Physics Discovery",
  theme: "Scientific Discovery & Ethical Innovation",
  level: "Level 4",
  scenes: [
    {
      text: "{userName} participates in their high school's quantum physics research program, working with Dr. Chen to study particle behavior. During an experiment with {favoriteColor} light wavelengths, they accidentally create what appears to be a stable quantum entanglement between two {favoriteAnimal}-shaped objects that maintains connection across impossible distances.",
      pause: true,
      hook: "What could this breakthrough in quantum physics mean for science and humanity?",
      microVariants: {
        text: "{userName} accidentally achieves a major breakthrough in quantum entanglement during a high school physics experiment.",
        alternatives: ["Experimental work with quantum particles leads {userName} to an unexpected scientific discovery with global implications."],
        optionalDetails: ["the entangled objects respond to each other instantaneously", "the effect seems stable unlike previous quantum experiments"]
      }
    },
    {
      text: "The discovery attracts attention from universities and tech companies worldwide. {userName} learns that stable quantum entanglement could revolutionize communication, making unhackable networks possible, but it could also enable surveillance technologies that eliminate all privacy. Dr. Chen warns that major corporations are already trying to replicate {userName}'s accidental breakthrough.",
      pause: true,
      hook: "Should revolutionary scientific discoveries be shared freely or protected from misuse?",
      microVariants: {
        text: "The quantum breakthrough attracts global attention while raising concerns about potential surveillance applications.",
        alternatives: ["Scientific achievement brings both opportunities and ethical dilemmas about technology's impact on privacy and security."],
        optionalDetails: ["government agencies want access to the research", "privacy advocates warn about surveillance implications"]
      }
    },
    {
      text: "Working with their research partner Maya and using insights from {hobbies}, {userName} realizes their breakthrough isn't just about quantum physics - it seems to tap into fundamental principles about connection and information that could reshape understanding of consciousness itself. However, their follow-up experiments produce inconsistent results that frustrate the adults involved.",
      pause: true,
      hook: "Why do the quantum effects work sometimes but not others, and what does this mean?",
      microVariants: {
        text: "Further research reveals that the quantum breakthrough may connect to consciousness studies while producing puzzling inconsistent results.",
        alternatives: ["{userName}'s insights from {hobbies} help uncover connections between quantum physics and consciousness that complicate their discovery."],
        optionalDetails: ["results seem connected to the researchers' emotional states", "traditional physics models don't explain the consciousness connection"]
      }
    },
    {
      text: "{userName} discovers that the quantum entanglement only works when they and Maya collaborate with genuine mutual respect and shared curiosity. When adults try to pressure them for consistent results or when corporate researchers attempt to replicate the work without understanding the collaboration element, the quantum effect fails completely.",
      pause: true,
      hook: "What does it mean if consciousness and human connection are necessary for advanced quantum effects?",
      microVariants: {
        text: "The quantum effect requires genuine collaboration and mutual respect between researchers, failing when driven by external pressure or competition.",
        alternatives: ["Understanding that consciousness and authentic partnership are essential components changes the entire nature of the scientific discovery."],
        optionalDetails: ["corporate labs cannot replicate results despite identical equipment", "the effect strengthens when researchers share personal goals"]
      }
    },
    {
      text: "Faced with increasing pressure to commercialize their discovery, {userName} and Maya must decide whether to patent their breakthrough, share it freely with the scientific community, or protect it until humanity develops better wisdom about using consciousness-based technologies responsibly. The decision will affect not just their futures, but the future of human technological development.",
      pause: true,
      hook: "How should young scientists handle discoveries that could change the world?",
      microVariants: {
        text: "The decision about sharing or protecting consciousness-based quantum technology becomes a choice about humanity's technological future.",
        alternatives: ["Young scientists must balance scientific openness with responsibility for technologies that require wisdom and collaboration to work properly."],
        optionalDetails: ["the discovery could revolutionize communication or create unprecedented surveillance", "traditional patent systems don't address consciousness-required technologies"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName} and Maya establish the Collaborative Science Institute, where breakthrough discoveries are developed only by teams committed to ethical applications and mutual respect, proving that consciousness is indeed essential for humanity's most advanced technologies.",
      microVariants: ["The institute becomes a model for consciousness-based scientific development with built-in ethical safeguards.", "Their approach revolutionizes scientific research by demonstrating that collaboration and consciousness enhance technological breakthroughs."]
    },
    {
      type: 'reflective',
      text: "{userName} continues studying quantum physics while understanding that the most important discoveries happen not just in laboratories, but in the connections between curious minds working together with respect and shared purpose.",
      microVariants: ["Ongoing research reinforces that scientific breakthroughs emerge from authentic human connections rather than just technical knowledge.", "The quantum discovery becomes a metaphor for how consciousness and collaboration create possibilities beyond individual achievement."]
    }
  ],
  reuse: {
    swappableElements: {
      "quantum_phenomena": ["entanglement", "superposition", "wave-particle duality", "quantum tunneling"],
      "consciousness_connections": ["collaborative requirements", "emotional state dependencies", "mutual respect necessities", "shared purpose effects"],
      "ethical_dilemmas": ["privacy versus security", "open science versus protection", "individual patents versus collaborative ownership", "technological power versus wisdom"],
      "scientific_applications": ["unhackable communication", "consciousness-based computing", "collaborative research tools", "empathy-enhanced technology"]
    },
    weatherVariants: ["during late-night lab sessions", "at scientific conferences", "in collaborative research periods", "during ethical decision meetings"],
    settingVariants: ["high school physics labs", "university research centers", "corporate development facilities", "collaborative science institutes"],
    randomSeed: 168
  }
};