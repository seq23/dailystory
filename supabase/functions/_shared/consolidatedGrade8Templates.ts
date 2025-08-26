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
  }
];