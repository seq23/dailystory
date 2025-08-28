export const template = {
  title: "The Perfect Beach Day",
  theme: "enjoying simple pleasures",
  level: "level1",
  scenes: [{
    text: "[userName] packed their [favoriteColor] bag and headed to the beach.",
    pause: true,
    hook: "What adventures awaited?",
    microVariants: { text: "[userName] packed their [favoriteColor] bag and headed to the beach.", alternatives: [], optionalDetails: [] }
  }],
  endings: [{ type: "cozy", text: "It was the perfect beach day ever.", microVariants: [] }],
  reuse: { swappableElements: { "[userName]": ["the child"], "[favoriteColor]": ["blue"] }, weatherVariants: ["sunny"], settingVariants: ["beach"] }
};
export default template;