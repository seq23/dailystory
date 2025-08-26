// Grade 10 Templates (Ages 15-16) - Ethical Leadership & Global Perspective
export const CONSOLIDATED_GRADE_10_TEMPLATES = [
  {
    title: "The Global Climate Action Network",
    theme: "Global Citizenship & Environmental Leadership", 
    level: "Grade 10",
    scenes: [
      {
        text: "{userName} felt simultaneously inspired and overwhelmed while attending a virtual climate summit where teenage activists from six continents shared how climate change was already affecting their communities through rising sea levels, extreme weather events, droughts, and flooding - making {userName} realize that while their own community hadn't yet experienced dramatic climate impacts, their lifestyle choices and their generation's collective actions would determine whether millions of young people around the world would have sustainable futures or face displacement, food insecurity, and environmental catastrophe.",
        pause: true,
        hook: "How will {userName} translate global climate awareness into effective local action?", 
        microVariants: {
          text: "{userName} attended a virtual climate summit where global youth activists shared how climate change was already devastating their communities, inspiring urgent questions about intergenerational responsibility and effective action.",
          alternatives: [
            "Connecting with international youth climate activists online, {userName} confronted the stark reality that their generation's choices would determine whether peers worldwide faced environmental catastrophe or sustainable futures."
          ],
          optionalDetails: ["Activists shared photos of flooded homes and failed crops.", "Scientific projections showed accelerating climate impacts.", "The urgency of the crisis became personally meaningful through peer connections."]
        }
      },
      {
        text: "Rather than feeling paralyzed by the enormity of global climate challenges, {userName} channeled their concern into researching evidence-based solutions and discovering that effective climate action required both individual lifestyle changes and systematic policy advocacy - leading them to organize a comprehensive climate action network that connected their school with environmental organizations, elected officials, and international youth activists while implementing concrete projects like renewable energy installations, waste reduction programs, and community education initiatives that demonstrated how local action could contribute to global solutions.",
        pause: true,
        hook: "What lasting impact will {userName}'s climate leadership have on their community and beyond?",
        microVariants: {
          text: "Channeling climate concern into systematic action, {userName} organized comprehensive networks connecting local projects with global movements while implementing evidence-based environmental solutions.",
          alternatives: [
            "Transforming climate anxiety into effective leadership, {userName} developed multi-level action strategies that connected individual choices, community projects, and policy advocacy for systematic change."
          ],
          optionalDetails: ["Research revealed specific policy changes needed for climate action.", "Community partnerships provided resources for environmental projects.", "International connections offered models for successful youth climate organizing."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Two years later, {userName}'s climate action network had expanded to include fifty schools across three states, successfully lobbied for renewable energy policies in their city, and established sister relationships with youth environmental groups on four continents - demonstrating that young people could create meaningful change by combining passion with strategic thinking, local action with global perspective, and individual commitment with collective organizing power.",
        microVariants: [
          "{userName}'s climate network grew to encompass multiple states and international partnerships, achieving policy victories and demonstrating the power of strategic youth environmental organizing."
        ]
      },
      {
        type: 'reflective',
        text: "Standing before the solar panels that their advocacy had helped install on their school roof, {userName} reflected on how climate action had taught them that the most important leadership involved empowering others to discover their own capacity for change. 'The climate crisis requires all of us,' they understood with deep conviction. 'But when young people connect their idealism with strategic action, we can accomplish things that seemed impossible and create the sustainable world that all generations deserve.'",
        microVariants: [
          "Viewing the solar installation their advocacy had achieved, {userName} appreciated how climate leadership meant empowering others and connecting idealism with strategic action for systematic change."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "climate_impacts": ["rising sea levels", "extreme weather", "food insecurity", "forced migration", "ecosystem collapse"],
        "solutions": ["renewable energy", "sustainable transportation", "regenerative agriculture", "policy advocacy", "community resilience"],
        "organizing_tools": ["digital networks", "policy research", "community partnerships", "international connections", "educational campaigns"]
      },
      weatherVariants: ["virtual summit", "community meeting", "policy hearing", "action planning session"],
      settingVariants: ["school environmental lab", "city council chambers", "community center", "international online platform"]
    }
  }
];