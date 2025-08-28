/**
 * Grade 6 Template: Biosphere Research Project
 * Theme: Environmental Science & Research
 * Individual template file for on-demand loading
 */

export default {
  title: "Biosphere Research Project",
  theme: "Environmental Science & Research",
  level: "Grade 6",
  scenes: [
    {
      text: "{userName} receives an exciting assignment to design a self-sustaining biosphere for their science class. The project requires them to understand how plants, animals, and environmental factors work together in perfect balance.",
      pause: true,
      hook: "What ecosystems will {userName} study for inspiration?",
      microVariants: {
        text: "{userName} receives an exciting assignment to design a self-sustaining biosphere for their science class. The project requires them to understand how plants, animals, and environmental factors work together in perfect balance.",
        alternatives: ["The science teacher challenges {userName} to create a miniature ecosystem that functions independently.", "A complex biosphere project pushes {userName} to explore ecological relationships and environmental balance."],
        optionalDetails: ["the assignment includes building a physical model", "research must cover multiple climate zones"]
      }
    },
    {
      text: "{userName} begins extensive research, discovering fascinating connections between decomposers, primary producers, and apex predators. They learn how energy flows through food webs and how disrupting one species affects the entire system.",
      pause: true,
      hook: "What surprising ecological relationships will {userName} uncover?",
      microVariants: {
        text: "{userName} begins extensive research, discovering fascinating connections between decomposers, primary producers, and apex predators. They learn how energy flows through food webs and how disrupting one species affects the entire system.",
        alternatives: ["Deep research reveals the intricate web of relationships that maintain ecological balance for {userName}.", "Studying ecosystem dynamics, {userName} uncovers the delicate interdependence of all living organisms."],
        optionalDetails: ["mycorrhizal networks connect forest trees", "keystone species have disproportionate environmental impact"]
      }
    },
    {
      text: "Working with their lab partner, {userName} designs a closed-loop system incorporating nitrogen-fixing bacteria, photosynthetic algae, and carefully selected invertebrates. They calculate oxygen production rates and waste decomposition cycles.",
      pause: true,
      hook: "How will {userName} ensure their biosphere maintains perfect balance?",
      microVariants: {
        text: "Working with their lab partner, {userName} designs a closed-loop system incorporating nitrogen-fixing bacteria, photosynthetic algae, and carefully selected invertebrates. They calculate oxygen production rates and waste decomposition cycles.",
        alternatives: ["Collaborative design work challenges {userName} to integrate multiple biological systems into one functioning unit.", "Mathematical calculations help {userName} balance resource production and consumption in their miniature world."],
        optionalDetails: ["pH levels must remain stable", "carbon dioxide and oxygen cycles need precise calibration"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "{userName}'s biosphere thrives for months, earning recognition at the district science fair and inspiring them to pursue environmental science.",
      microVariants: ["The successful project opens doors to advanced ecology courses and research opportunities.", "Recognition at science competitions validates {userName}'s passion for environmental conservation."]
    }
  ],
  reuse: {
    swappableElements: {
      "biosphere": ["terrarium", "aquatic ecosystem", "desert habitat", "rainforest model"],
      "research": ["field study", "literature review", "data analysis", "experimental design"]
    },
    weatherVariants: ["during Earth Week", "in spring semester", "for environmental awareness month"],
    settingVariants: ["advanced biology lab", "environmental science classroom", "school greenhouse"]
  }
};