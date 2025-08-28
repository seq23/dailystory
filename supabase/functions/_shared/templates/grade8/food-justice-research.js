// Grade 8 Template: Food Justice Research Initiative
export const template = {
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
};