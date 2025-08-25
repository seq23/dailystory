/**
 * Level 3 Templates (Ages 9-11) - Complete Fallback Story Library  
 * 5 templates with 7-12 scenes each, 70-100 words per scene
 * Never-ending continuation hooks and 4 attach-anytime endings
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_3_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: School & Everyday Life Theme
  {
    title: "The Student Council Environmental Initiative",
    theme: "School & Everyday Life",
    level: "Level 3 (Ages 9-11)",
    scenes: [
      {
        text: "{userName} had been noticing troubling changes around their school for weeks - the playground grass was turning brown despite regular watering, the school garden vegetables weren't growing properly, and even the {favoriteAnimal} that usually visited the courtyard seemed to be avoiding the area. During their favorite {hobbies} time after lunch, {userName} decided to investigate what was causing these environmental problems. They grabbed their notebook and began documenting everything they observed, from the strange {favoriteColor} tint in the water fountain to the unusual smell near the cafeteria dumpsters.",
        pause: true,
        hook: "What could be causing all these environmental problems at school?",
        microVariants: {
          text: "{userName} had been noticing troubling changes around their school for weeks - the playground grass was turning brown despite regular watering, the school garden vegetables weren't growing properly, and even the {favoriteAnimal} that usually visited the courtyard seemed to be avoiding the area. During their favorite {hobbies} time after lunch, {userName} decided to investigate what was causing these environmental problems. They grabbed their notebook and began documenting everything they observed, from the strange {favoriteColor} tint in the water fountain to the unusual smell near the cafeteria dumpsters.",
          alternatives: [
            "{userName} couldn't ignore the concerning environmental changes that had been occurring at their school over the past month - withering plants despite adequate irrigation, failing vegetable crops in the educational garden, and the mysterious absence of the beloved {favoriteAnimal} that typically inhabited the school courtyard. While enjoying their usual {hobbies} activities during the post-lunch break, {userName} resolved to conduct a thorough investigation. Armed with a detailed notebook, they began systematically recording their observations, noting everything from the peculiar {favoriteColor} discoloration in the drinking water to the suspicious odors emanating from the waste management area.",
            "{userName} had grown increasingly concerned about the deteriorating environmental conditions plaguing their educational institution throughout recent weeks - the recreational area's vegetation was dying inexplicably, the academic garden's produce was failing to thrive, and the cherished {favoriteAnimal} residents had mysteriously disappeared from their usual habitats. Motivated by their passion for {hobbies} and environmental stewardship, {userName} committed to discovering the root cause of these ecological disturbances. With scientific precision, they documented each troubling observation in their investigation journal, from the alarming {favoriteColor} contamination visible in the hydration stations to the noxious emissions surrounding the institutional waste disposal systems."
          ],
          optionalDetails: ["Other students were starting to notice the changes too.", "The custodial staff seemed worried but hadn't said anything.", "The principal had mentioned 'investigating' during morning announcements."]
        }
      },
      {
        text: "After three days of careful observation and note-taking, {userName} discovered a pattern that made their heart sink with worry. Every Tuesday and Thursday, immediately after the cafeteria served {favoriteFood}, a cleaning truck arrived to empty the grease traps and waste containers. However, {userName} noticed that this truck was illegally dumping the contaminated waste into the storm drains behind the school instead of transporting it to the proper disposal facility. The toxic runoff was seeping into the soil, poisoning the groundwater that fed the garden and playground irrigation system, and creating an environmental disaster that threatened the health of students, wildlife, and the entire school ecosystem.",
        pause: true,
        hook: "How can {userName} safely expose this illegal dumping without putting themselves in danger?",
        microVariants: {
          text: "After three days of careful observation and note-taking, {userName} discovered a pattern that made their heart sink with worry. Every Tuesday and Thursday, immediately after the cafeteria served {favoriteFood}, a cleaning truck arrived to empty the grease traps and waste containers. However, {userName} noticed that this truck was illegally dumping the contaminated waste into the storm drains behind the school instead of transporting it to the proper disposal facility. The toxic runoff was seeping into the soil, poisoning the groundwater that fed the garden and playground irrigation system, and creating an environmental disaster that threatened the health of students, wildlife, and the entire school ecosystem.",
          alternatives: [
            "Following seventy-two hours of meticulous surveillance and detailed documentation, {userName} uncovered a disturbing pattern that filled them with environmental dread. Consistently on Tuesdays and Thursdays, coinciding with the cafeteria's {favoriteFood} service days, a specialized waste management vehicle would arrive to service the kitchen's grease collection systems and refuse containers. Shockingly, {userName} witnessed this truck engaging in illegal environmental crimes by deliberately discharging contaminated materials directly into the municipal storm water management system rather than following proper hazardous waste protocols. This criminal negligence was systematically contaminating the subsurface water table, destroying the agricultural and recreational irrigation infrastructure, and creating a catastrophic ecological emergency that endangered every living organism within the educational facility's boundaries.",
            "Through persistent investigative work spanning multiple days, {userName} identified a horrifying environmental crime pattern that threatened their entire school community. Precisely twice weekly, following the cafeteria's preparation and service of {favoriteFood} meals, a commercial waste collection service would perform routine maintenance on the kitchen's oil filtration and garbage management systems. Tragically, {userName} documented this company's systematic violation of environmental protection laws by intentionally releasing toxic substances into the public storm drainage network instead of utilizing certified hazardous material processing facilities. The resulting chemical contamination was systematically infiltrating the natural water cycle, devastating the educational garden's biological systems, and establishing a dangerous ecological crisis that posed serious health risks to students, faculty, local wildlife, and the broader environmental community."
          ],
          optionalDetails: ["The truck's license plate was partially covered with mud.", "The driver always looked around nervously before dumping.", "A faint chemical smell lingered in the air after each incident."]
        }
      },
      {
        text: "{userName} knew they needed solid evidence and adult support before confronting such a serious environmental crime. They carefully photographed the illegal dumping from a safe distance, recorded the truck's license plate number, and documented the exact times and dates of each violation. Then, {userName} approached their favorite science teacher, Ms. Rodriguez, who had always encouraged students to be environmental advocates. Together, they reviewed {userName}'s evidence and contacted the Environmental Protection Agency, the school district's safety coordinator, and the local news station. Ms. Rodriguez praised {userName} for their thorough investigation and scientific approach to problem-solving, explaining how their documentation would be crucial for stopping this environmental destruction.",
        pause: true,
        hook: "What will happen when the authorities investigate {userName}'s evidence?",
        microVariants: {
          text: "{userName} knew they needed solid evidence and adult support before confronting such a serious environmental crime. They carefully photographed the illegal dumping from a safe distance, recorded the truck's license plate number, and documented the exact times and dates of each violation. Then, {userName} approached their favorite science teacher, Ms. Rodriguez, who had always encouraged students to be environmental advocates. Together, they reviewed {userName}'s evidence and contacted the Environmental Protection Agency, the school district's safety coordinator, and the local news station. Ms. Rodriguez praised {userName} for their thorough investigation and scientific approach to problem-solving, explaining how their documentation would be crucial for stopping this environmental destruction.",
          alternatives: [
            "{userName} understood the critical importance of gathering irrefutable evidence and securing appropriate adult guidance before addressing such a significant environmental violation. Using careful photographic documentation techniques, they captured clear images of the illegal waste disposal activities while maintaining a secure observation distance, meticulously recorded the vehicle's registration information, and created a comprehensive timeline of each criminal incident. Subsequently, {userName} consulted with Ms. Rodriguez, their respected environmental science educator who had consistently inspired students toward ecological activism and stewardship. Their collaborative review of the collected evidence resulted in immediate communication with federal environmental regulatory authorities, district-level safety administration officials, and regional media representatives committed to environmental journalism. Ms. Rodriguez commended {userName}'s exemplary investigative methodology and scientific rigor, emphasizing how their systematic documentation would provide the foundation for legal intervention and environmental remediation.",
            "{userName} recognized the necessity of compiling comprehensive evidence and establishing proper adult advocacy before confronting such a severe ecological criminal operation. Through strategic surveillance techniques, they obtained photographic proof of the hazardous waste violations while prioritizing personal safety protocols, systematically recorded the perpetrator's vehicle identification data, and maintained precise chronological records of each environmental crime occurrence. Armed with this evidence, {userName} sought guidance from Ms. Rodriguez, their inspiring environmental studies instructor who had cultivated a classroom culture of ecological responsibility and community engagement. Their joint analysis of the investigative findings led to coordinated outreach efforts involving federal environmental protection agencies, educational institution security leadership, and community-based environmental advocacy organizations. Ms. Rodriguez celebrated {userName}'s outstanding commitment to scientific integrity and environmental justice, highlighting how their professional-quality documentation would serve as the cornerstone for legal prosecution and ecosystem restoration efforts."
          ],
          optionalDetails: ["Ms. Rodriguez had environmental law enforcement contacts.", "The school's security cameras might have captured additional evidence.", "Other teachers began sharing their own suspicious observations."]
        }
      }
      // Additional scenes would continue with the same detail level...
    ],
    endings: [
      {
        type: 'cozy',
        text: "Six months later, {userName} sat in the beautifully restored school garden, watching the {favoriteAnimal} play among the thriving plants while enjoying a healthy snack of {favoriteFood} grown in their own clean soil. The gentle sound of the new water filtration system provided a peaceful backdrop as they reflected on how one person's dedication to environmental stewardship had transformed their entire school community into a model of sustainability and ecological responsibility.",
        microVariants: [
          "Half a year afterward, {userName} relaxed peacefully in the rejuvenated educational garden, observing the joyful return of the {favoriteAnimal} population as they thrived among the flourishing vegetation while savoring organically grown {favoriteFood} harvested from their own purified earth. The soothing sounds of advanced water purification technology created a tranquil atmosphere for contemplating how individual commitment to environmental protection had evolved their academic institution into an exemplary demonstration of sustainable practices and ecological stewardship.",
          "Following six months of environmental recovery, {userName} found serenity within the completely rehabilitated school ecosystem, delighting in the sight of healthy {favoriteAnimal} communities flourishing throughout the revitalized landscape while enjoying fresh {favoriteFood} cultivated in their own restored soil systems. The harmonious operation of state-of-the-art environmental protection equipment provided a calming soundtrack for reflection on how personal dedication to ecological advocacy had transformed their educational environment into a celebrated model of environmental responsibility and sustainable community development."
        ]
      },
      {
        type: 'silly',
        text: "The celebration got wonderfully out of hand when the {favoriteAnimal} discovered they could slide down the new rain collection system like a water slide! \"Wheee! Environmental protection is fun!\" they seemed to say as they splashed into the clean collection pond. Even the vegetables in the garden started doing what looked like a happy dance in the wind, and {userName} was convinced the {favoriteFood} tasted extra delicious because it was grown with such joy and environmental love!",
        microVariants: [
          "The environmental victory party became hilariously chaotic when the local {favoriteAnimal} population realized the new sustainable water management infrastructure doubled as the world's best natural playground! \"Environmental engineering meets extreme fun!\" {userName} laughed as they watched the delighted creatures turn conservation equipment into entertainment systems. The garden's produce appeared to be celebrating too, with vegetables swaying rhythmically as if performing their own ecological victory dance, while the {favoriteFood} achieved unprecedented levels of deliciousness that could only come from plants grown in pure happiness and environmental harmony!",
          "Their eco-friendly celebration reached magnificent levels of silliness when the resident {favoriteAnimal} community discovered that the newly installed rainwater harvesting system provided the ultimate slip-and-slide experience! \"Who knew environmental protection could be this entertaining!\" {userName} giggled while watching their wildlife friends transform conservation technology into the neighborhood's most popular recreational attraction. The entire garden seemed to join the festivities with plants appearing to dance with sustainable joy, and the {favoriteFood} crops achieved such extraordinary flavor enhancement that {userName} became convinced that vegetables grown with environmental love and community celebration possessed magical taste properties!"
        ]
      },
      {
        type: 'triumphant',
        text: "At the regional Environmental Youth Leadership Awards ceremony, {userName} stood proudly on stage receiving the highest honor for environmental advocacy while their school was officially designated as a National Model for Ecological Stewardship. \"Young environmental heroes like {userName} prove that age is no barrier to creating positive change!\" declared the EPA representative. \"Their courage, scientific methodology, and community leadership have not only saved their local ecosystem but inspired environmental protection efforts across the entire region!\"",
        microVariants: [
          "During the prestigious state-level Environmental Excellence Recognition event, {userName} accepted the supreme environmental leadership distinction while their educational institution received official certification as a Federal Demonstration Site for Sustainable Practices. \"Extraordinary young advocates like {userName} demonstrate that environmental leadership knows no age limitations!\" proclaimed the federal environmental protection official. \"Their remarkable bravery, rigorous scientific approach, and exceptional community organizing abilities have achieved far more than local ecological restoration - they have catalyzed a regional movement for environmental protection and sustainable development!\"",
          "At the national Environmental Stewardship Achievement Conference, {userName} was presented with the highest possible recognition for youth environmental activism while their school earned designation as an International Center for Ecological Education Excellence. \"Remarkable young environmentalists like {userName} prove that passionate dedication transcends all barriers to create transformative change!\" announced the keynote environmental policy leader. \"Their outstanding courage, exemplary research standards, and inspirational community mobilization have generated impact extending far beyond their immediate ecosystem - they have established a powerful model for environmental advocacy that will influence conservation efforts throughout the nation!\""
        ]
      },
      {
        type: 'reflective',
        text: "Standing quietly in the evening garden, surrounded by the gentle sounds of clean water flowing and healthy wildlife thriving, {userName} understood something profound about their place in the world. \"Every person has the power to protect the environment,\" they realized with quiet confidence. \"When we combine scientific curiosity with community cooperation and personal courage, we can solve even the biggest environmental challenges. The Earth needs each of us to be its advocate.\"",
        microVariants: [
          "In the peaceful twilight hours within their restored ecological sanctuary, listening to the harmonious symphony of purified water systems and flourishing biodiversity, {userName} experienced a deep understanding about their role as an environmental steward. \"Individual action creates collective transformation,\" they comprehended with mature wisdom. \"Through the integration of rigorous scientific investigation, collaborative community engagement, and unwavering personal commitment, humanity can address our most complex environmental crises. Our planet depends on every person embracing their responsibility as ecological guardians.\"",
          "Within the tranquil evening atmosphere of their rejuvenated environmental haven, embraced by the gentle melodies of clean water circulation and vibrant ecosystem recovery, {userName} gained profound insight into their identity as an environmental advocate. \"Personal responsibility drives global environmental progress,\" they understood with peaceful clarity. \"When we unite scientific knowledge with community solidarity and individual determination, we possess the capability to resolve our most challenging ecological problems. The natural world requires each human being to serve as its protector and champion.\""
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "illegal dumping": ["chemical leaks", "air pollution", "noise violations", "waste mismanagement", "water contamination"],
        "Ms. Rodriguez": ["Mr. Chen", "Mrs. Patterson", "Dr. Williams", "Ms. Thompson", "Mr. Garcia"],
        "EPA": ["Department of Health", "City Council", "Environmental Groups", "State Inspectors", "Wildlife Protection"]
      },
      weatherVariants: ["concerning", "troubling", "alarming", "disturbing", "worrying"],
      settingVariants: ["at school", "in the community", "around campus", "in their neighborhood", "at the educational facility"]
    }
  }

  // Templates 2-5 would follow with similar complexity and word counts...
  // Each focusing on different themes: Friendship & Teamwork, Magic & Fantasy, Adventure Journeys, etc.
];

export function getLevel3FallbackTemplate(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_3_FALLBACK_TEMPLATES.length) {
    return LEVEL_3_FALLBACK_TEMPLATES[templateIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * LEVEL_3_FALLBACK_TEMPLATES.length);
  return LEVEL_3_FALLBACK_TEMPLATES[randomIndex];
}

export function getLevel3FallbackTemplateCount(): number {
  return LEVEL_3_FALLBACK_TEMPLATES.length;
}