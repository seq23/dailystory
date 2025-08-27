/**
 * Grade 7 Templates - Complete Fallback Story Library
 * 3 templates, ~13 chapters each, 900-1100 words total
 * Enhanced complexity and random seed variation
 */

import { StoryTemplate } from '../storyTemplateTypes';

export const GRADE_7_FALLBACK_TEMPLATES: StoryTemplate[] = [
  // Template 1: Environmental Leadership & Social Change
  {
    title: "The Climate Action Revolution: A Student's Journey to Global Impact",
    theme: "Environmental Leadership & Social Change",
    level: "Grade 7",
    scenes: [
      {
        text: "Chapter 1: The Wake-Up Call\n\n{userName} had always considered themselves environmentally conscious—they recycled, turned off lights, and enjoyed {hobbies}—but their perspective on climate action fundamentally shifted during a particularly eye-opening seventh-grade environmental science unit that would ultimately change the trajectory of their entire academic and personal life. While researching the impact of industrial agriculture on local ecosystems for what they initially thought would be a routine class presentation about environmental issues affecting their immediate community, {userName} discovered that the {favoriteColor} algae blooms appearing in their regional watershed weren't just a natural phenomenon, but rather a direct consequence of agricultural runoff that was systematically disrupting the ecological balance their community had maintained for generations.",
        pause: true,
        hook: "What specific environmental crisis will motivate {userName} to transform from student observer to activist leader?",
        microVariants: {
          text: "Chapter 1: The Wake-Up Call\n\n{userName} had always considered themselves environmentally conscious—they recycled, turned off lights, and enjoyed {hobbies}—but their perspective on climate action fundamentally shifted during a particularly eye-opening seventh-grade environmental science unit that would ultimately change the trajectory of their entire academic and personal life. While researching the impact of industrial agriculture on local ecosystems for what they initially thought would be a routine class presentation about environmental issues affecting their immediate community, {userName} discovered that the {favoriteColor} algae blooms appearing in their regional watershed weren't just a natural phenomenon, but rather a direct consequence of agricultural runoff that was systematically disrupting the ecological balance their community had maintained for generations.",
          alternatives: [
            "Chapter 1: The Environmental Awakening\n\n{userName} had previously maintained what they considered adequate environmental awareness—practicing recycling protocols, implementing energy conservation measures, and pursuing {hobbies} activities—however their understanding of climate activism underwent a profound transformation during an exceptionally revealing seventh-grade environmental science curriculum."
          ],
          optionalDetails: [
            `Random Research Element ${Math.floor(Math.random() * 100)}: Local water quality had declined 40% in five years.`,
            `Random Discovery Element ${Math.floor(Math.random() * 100)}: Three species of local fish had disappeared recently.`,
            `Random Motivation Element ${Math.floor(Math.random() * 100)}: Their family's well water had become contaminated.`
          ]
        }
      },
      {
        text: "Chapter 2: Research and Action\n\n{userName} dove deeper into environmental research, connecting with local university scientists and environmental organizations to understand the scope of agricultural pollution affecting their watershed. Their investigation revealed systemic issues requiring both policy changes and community organizing to address effectively.",
        pause: true,
        hook: "What strategies will {userName} develop to mobilize community environmental action?",
        microVariants: {
          text: "Chapter 2: Research and Action\n\n{userName} dove deeper into environmental research, connecting with scientists and organizations to understand agricultural pollution affecting their watershed.",
          alternatives: ["Expanding their investigation, {userName} collaborated with university researchers and environmental groups to document systematic pollution patterns."],
          optionalDetails: [`Research showed ${Math.floor(Math.random() * 50) + 20}% increase in contamination levels.`]
        }
      },
      {
        text: "Chapter 3: Building the Movement\n\nWith scientific evidence in hand, {userName} organized community meetings, created educational presentations, and built coalitions with farmers, residents, and local officials to develop comprehensive solutions addressing both environmental protection and economic sustainability.",
        pause: true,
        hook: "How will the community respond to {userName}'s environmental leadership?",
        microVariants: {
          text: "Chapter 3: Building the Movement\n\nWith evidence gathered, {userName} organized community meetings and built coalitions to develop comprehensive environmental solutions.",
          alternatives: ["Armed with scientific data, {userName} facilitated community organizing efforts to address environmental challenges through collaborative action."],
          optionalDetails: [`Coalition included ${Math.floor(Math.random() * 20) + 10} local organizations and businesses.`]
        }
      },
      {
        text: "Chapter 4: Direct Action and Advocacy\n\n{userName} learned that meaningful environmental change required direct action and sustained advocacy beyond research and education. They organized protests at municipal buildings, participated in watershed restoration projects, and collaborated with regional environmental justice organizations to amplify community voices in policy discussions. Through this work, {userName} discovered the power of youth activism while building relationships with experienced organizers who taught them about strategic communication, media engagement, and coalition building across diverse stakeholder groups.",
        pause: true,
        hook: "How will {userName}'s direct action approach influence policy makers and community members?",
        microVariants: {
          text: "Chapter 4: Direct Action and Advocacy\n\n{userName} learned that meaningful environmental change required direct action and sustained advocacy beyond research and education.",
          alternatives: ["Environmental organizing required combining research with strategic action and policy advocacy."],
          optionalDetails: [`Direct actions drew ${Math.floor(Math.random() * 200) + 50} participants from across the region.`]
        }
      },
      {
        text: "Chapter 5: Media and Public Education\n\nRecognizing the importance of public awareness, {userName} developed a comprehensive media strategy that included social media campaigns, local newspaper articles, and community presentations to educate residents about environmental issues and policy solutions. They learned to translate complex scientific information into accessible language while creating compelling narratives that connected environmental protection to economic opportunity and community health. Their media work attracted regional and eventually national attention, positioning them as a youth environmental leader.",
        pause: true,
        hook: "What impact will {userName}'s media strategy have on regional environmental awareness?",
        microVariants: {
          text: "Chapter 5: Media and Public Education\n\nRecognizing the importance of public awareness, {userName} developed a comprehensive media strategy including campaigns and presentations.",
          alternatives: ["Media outreach connected environmental science to community interests and policy solutions."],
          optionalDetails: [`Social media campaigns reached ${Math.floor(Math.random() * 5000) + 1000} people monthly.`]
        }
      },
      {
        text: "Chapter 6: Policy Implementation\n\n{userName}'s environmental advocacy led to municipal policy changes, sustainable farming incentives, and ongoing community monitoring programs that protected the watershed while supporting local economic development and demonstrating youth leadership in environmental justice. The policy victories included new water quality standards, agricultural best practices requirements, and community oversight mechanisms that ensured ongoing environmental protection while providing economic support for farmers transitioning to sustainable practices.",
        pause: true,
        hook: "How will these policy victories create lasting environmental and economic benefits?",
        microVariants: {
          text: "Chapter 6: Policy Implementation\n\n{userName}'s advocacy led to policy changes, farming incentives, and monitoring programs protecting the watershed while supporting economic development.",
          alternatives: ["Environmental leadership resulted in policy reform, sustainable agriculture support, and community programs balancing ecological protection with economic sustainability."],
          optionalDetails: [`Programs prevented an estimated ${Math.floor(Math.random() * 500) + 100} tons of agricultural runoff annually.`]
        }
      },
      {
        text: "Chapter 7: Regional Network Building\n\nThe success of {userName}'s local environmental work led to invitations from regional environmental organizations to help establish a network of youth environmental advocates across multiple communities. They traveled to conferences, participated in training sessions, and mentored other young activists while learning about the broader environmental justice movement. This regional work taught {userName} about scaling local solutions and building movements that could address environmental challenges at multiple levels.",
        pause: true,
        hook: "What impact will {userName}'s regional networking have on the broader environmental movement?",
        microVariants: {
          text: "Chapter 7: Regional Network Building\n\nThe success of local environmental work led to invitations for regional youth environmental advocacy.",
          alternatives: ["Regional organizing scaled local successes into broader environmental justice movement participation."],
          optionalDetails: [`Youth network included ${Math.floor(Math.random() * 50) + 20} activists across six states.`]
        }
      },
      {
        text: "Chapter 8: Educational Innovation\n\n{userName} partnered with environmental education organizations to develop curriculum materials that connected environmental science to social justice and community organizing, creating resources that helped other students understand the intersection of environmental issues and civic engagement. These educational innovations were piloted in schools across their region, providing students with both scientific knowledge and practical organizing skills while demonstrating how environmental education could promote both academic achievement and community leadership.",
        pause: true,
        hook: "How will {userName}'s educational innovations inspire environmental leadership in other students?",
        microVariants: {
          text: "Chapter 8: Educational Innovation\n\n{userName} partnered with organizations to develop curriculum connecting environmental science to social justice and organizing.",
          alternatives: ["Educational materials helped students understand environmental issues through community organizing frameworks."],
          optionalDetails: [`Curriculum reached ${Math.floor(Math.random() * 3000) + 500} students in 15 school districts.`]
        }
      },
      {
        text: "Chapter 9: Economic Development Integration\n\nAs their environmental work matured, {userName} focused on developing economic models that created green jobs while addressing environmental challenges, working with local businesses, renewable energy companies, and sustainable agriculture initiatives to demonstrate that environmental protection could drive economic opportunity. They helped coordinate the development of community-owned renewable energy projects, sustainable food systems, and environmental restoration programs that provided employment while improving environmental conditions.",
        pause: true,
        hook: "What sustainable economic models will {userName} help create in their community?",
        microVariants: {
          text: "Chapter 9: Economic Development Integration\n\nEnvironmental work focused on developing economic models creating green jobs while addressing environmental challenges.",
          alternatives: ["Green economic development demonstrated that environmental protection could drive community prosperity."],
          optionalDetails: [`Green initiatives created ${Math.floor(Math.random() * 200) + 50} local jobs in renewable energy and restoration.`]
        }
      },
      {
        text: "Chapter 10: College and Career Preparation\n\nAs {userName} prepared for college applications and future career decisions, they reflected on how environmental advocacy had shaped their understanding of science, policy, and community organizing as interconnected approaches to social change. Their environmental work had provided them with research experience, leadership skills, and a network of mentors while demonstrating their commitment to environmental justice and community empowerment. The experience guided their choice of college programs and career paths that would allow them to continue environmental advocacy at larger scales.",
        pause: true,
        hook: "How will environmental advocacy experience shape {userName}'s future academic and career choices?",
        microVariants: {
          text: "Chapter 10: College and Career Preparation\n\nEnvironmental advocacy shaped understanding of science, policy, and organizing as interconnected approaches to change.",
          alternatives: ["College preparation integrated environmental experience with academic interests and career planning."],
          optionalDetails: [`College applications emphasized ${Math.floor(Math.random() * 5) + 3} years of environmental leadership and policy work.`]
        }
      },
      {
        text: "Chapter 11: Mentorship and Leadership Development\n\n{userName} began mentoring younger students who were interested in environmental issues, sharing their knowledge about research methods, organizing strategies, and policy advocacy while helping to establish environmental clubs and programs in local schools. This mentorship work taught them about leadership development and the importance of building sustainable movements that could continue growing without depending on individual leaders. They discovered that teaching others about environmental advocacy strengthened their own understanding while building collective capacity for ongoing environmental work.",
        pause: true,
        hook: "How will mentorship work ensure the continuity of environmental advocacy in {userName}'s community?",
        microVariants: {
          text: "Chapter 11: Mentorship and Leadership Development\n\n{userName} began mentoring younger students interested in environmental issues and organizing.",
          alternatives: ["Youth mentorship built sustainable environmental advocacy capacity beyond individual leadership."],
          optionalDetails: [`Mentorship programs trained ${Math.floor(Math.random() * 30) + 10} new environmental advocates annually.`]
        }
      },
      {
        text: "Chapter 12: Long-term Impact Assessment\n\nReflecting on several years of environmental advocacy, {userName} documented the concrete improvements their work had created including measurable improvements in water quality, reductions in agricultural pollution, policy changes that protected environmental health, and the development of community capacity for ongoing environmental monitoring and advocacy. They also assessed the broader impacts including increased environmental awareness, student engagement in environmental issues, and the development of models for youth environmental leadership that were being replicated in other communities.",
        pause: true,
        hook: "What measurable impacts has {userName}'s environmental advocacy created for their community?",
        microVariants: {
          text: "Chapter 12: Long-term Impact Assessment\n\nReflecting on years of advocacy, {userName} documented concrete improvements including water quality and policy changes.",
          alternatives: ["Impact assessment revealed measurable environmental improvements and community capacity building."],
          optionalDetails: [`Water quality improved by ${Math.floor(Math.random() * 40) + 20}% across monitored watershed areas.`]
        }
      },
      {
        text: "Chapter 13: Future Vision and Commitment\n\nLooking toward their future in college and beyond, {userName} committed to continuing environmental advocacy while pursuing academic and career paths that would amplify their impact through environmental science, policy work, or community organizing. They understood that their early environmental advocacy had provided them with both technical skills and organizing experience that would be valuable throughout their life. The experience had also connected them with a network of environmental advocates and mentors who would support their continued development as an environmental leader working for both environmental protection and social justice.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Chapter 13: Future Vision and Commitment\n\nLooking toward college and beyond, {userName} committed to continuing environmental advocacy through academic and career paths.",
          alternatives: ["Future commitment integrated environmental advocacy with academic interests and professional development."],
          optionalDetails: [`Professional network included ${Math.floor(Math.random() * 100) + 25} environmental advocates and policy experts.`]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Global Student Climate Summit\n\nFive years after their initial environmental awakening, {userName} stood before the United Nations Youth Climate Summit as the youngest keynote speaker in the organization's history, representing a global network of student environmental activists they had helped establish across six continents.",
        microVariants: [
          "Their climate action network had prevented the equivalent of 10 million tons of CO2 emissions through student-led initiatives spanning renewable energy projects, sustainable agriculture programs, and community environmental education campaigns."
        ]
      },
      {
        type: 'cozy',
        text: "Final Chapter: The Community Garden Celebration\n\nYears later, {userName} walked through the thriving community garden and watershed restoration area that had grown from their environmental advocacy work, watching families enjoy {favoriteFood} grown in soil that was now clean and productive. Children played near the restored creek where {favoriteAnimal} had returned, and community members gathered for their monthly environmental monitoring meetings that had become beloved neighborhood traditions.",
        microVariants: [
          "The garden had become a place where three generations of families shared environmental knowledge while tending plots that fed both bodies and souls.",
          "Evening gatherings under the {favoriteColor} sunset brought together neighbors who had built lasting friendships through shared environmental stewardship."
        ]
      },
      {
        type: 'silly', 
        text: "Final Chapter: The Environmental Superhero Recognition\n\nWhen the mayor declared {userName} the city's first official 'Environmental Superhero' and presented them with a cape made from recycled {favoriteColor} materials, even the local {favoriteAnimal} population seemed to applaud from their newly restored habitats. The ceremony featured a sustainable {favoriteFood} feast and a parade of solar-powered floats, proving that environmental advocacy could be both effective and delightfully ridiculous.",
        microVariants: [
          "The superhero costume included boots made from repurposed pollution monitoring equipment and a utility belt filled with native plant seeds.",
          "Local environmental groups celebrated with a synchronized dance performed to the sound of wind turbines."
        ]
      },
      {
        type: 'reflective',
        text: "Final Chapter: The Quiet Revolution\n\n{userName} sat by the restored watershed on a peaceful {favoriteColor} evening, reflecting on how environmental advocacy had taught them that the most powerful changes often happened quietly, through patient relationship-building and steady commitment to both environmental protection and community care. The work had shown them that environmental leadership meant listening deeply to both ecological systems and community wisdom.",
        microVariants: [
          "The restored ecosystem had become a living classroom where community members of all ages learned about the interconnections between environmental health and community wellbeing.",
          "Silent moments by the water reminded {userName} that environmental advocacy was ultimately about creating conditions where all life could flourish."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "environmental_issues": ["water contamination", "soil degradation", "air pollution", "habitat destruction"],
        "solutions": ["renewable energy", "sustainable agriculture", "conservation programs", "policy advocacy"]
      },
      weatherVariants: ["environmentally conscious", "sustainably focused", "ecologically aware", "climate-concerned"],
      settingVariants: ["in nature", "in the community", "in environmental research", "in climate action"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 2: Social Justice & Community Organizing
  {
    title: "The Equal Access Advocacy Campaign",
    theme: "Social Justice & Community Organizing",
    level: "Grade 7",
    scenes: [
      {
        text: "Chapter 1: The Discovery of Inequality\n\n{userName} had always been aware of differences in their community, but their understanding of systemic inequality deepened dramatically when they began volunteering at the local community center and discovered the stark disparities that existed between different neighborhoods. While helping elementary students with homework and practicing their {hobbies} during volunteer breaks, they noticed that children from certain zip codes consistently arrived without proper school supplies, lacked access to reliable internet, and had never experienced activities like music lessons or sports programs that {userName} had always taken for granted.",
        pause: true,
        hook: "What comprehensive strategies will {userName} develop to address educational inequality and create lasting systemic change?",
        microVariants: {
          text: "Chapter 1: The Discovery of Inequality\n\n{userName} had always been aware of differences in their community, but their understanding of systemic inequality deepened dramatically when they began volunteering at the local community center and discovered the stark disparities that existed between different neighborhoods. While helping elementary students with homework and practicing their {hobbies} during volunteer breaks, they noticed that children from certain zip codes consistently arrived without proper school supplies, lacked access to reliable internet, and had never experienced activities like music lessons or sports programs that {userName} had always taken for granted.",
          alternatives: [
            "Chapter 1: The Systemic Recognition\n\n{userName} had maintained general awareness of community variations, however their comprehension of systemic inequality intensified dramatically when they commenced volunteer service at the local community center and identified pronounced disparities between different neighborhoods."
          ],
          optionalDetails: [
            `Random Seed ${Math.floor(Math.random() * 1000)}: The community center's {favoriteColor} bulletin board displayed achievement gaps by neighborhood.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: Local {favoriteAnimal} therapy visits were only available in affluent school districts.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: The quality of {favoriteFood} in school lunch programs varied dramatically by location.`
          ]
        }
      },
      {
        text: "Chapter 2: Community Research and Documentation\n\n{userName} developed systematic methods for documenting the educational inequities they had observed, conducting interviews with students, families, teachers, and community leaders to understand how resource disparities affected educational outcomes and life opportunities. They learned to use data analysis tools to examine achievement gaps, funding formulas, and resource distribution patterns while ensuring that community voices remained central to the research process. Through this work, {userName} discovered the importance of community-controlled research that could inform both organizing strategies and policy advocacy.",
        pause: true,
        hook: "What patterns of inequality will {userName}'s research reveal, and how will community members respond?",
        microVariants: {
          text: "Chapter 2: Community Research and Documentation\n\n{userName} developed systematic methods for documenting educational inequities through interviews and data analysis.",
          alternatives: ["Research methodology centered community voices while providing evidence for organizing and policy advocacy."],
          optionalDetails: [`Interviews with ${Math.floor(Math.random() * 200) + 50} community members revealed systemic resource disparities.`]
        }
      },
      {
        text: "Chapter 3: Coalition Building and Organization Development\n\nWith research evidence demonstrating clear patterns of educational inequality, {userName} helped organize a coalition of parents, students, teachers, and community organizations to develop comprehensive strategies for addressing systemic inequities through both advocacy and direct action. They learned about the importance of building inclusive coalitions that respected different community perspectives while finding common ground for collective action on educational justice issues.",
        pause: true,
        hook: "How will {userName} build trust and unity among diverse coalition members with different experiences and priorities?",
        microVariants: {
          text: "Chapter 3: Coalition Building and Organization Development\n\nResearch evidence helped {userName} organize coalitions to address systemic inequities through advocacy and action.",
          alternatives: ["Coalition organizing brought together diverse community voices for comprehensive educational justice strategies."],
          optionalDetails: [`Coalition included ${Math.floor(Math.random() * 40) + 15} organizations representing various community interests.`]
        }
      },
      {
        text: "Chapter 4: Policy Analysis and Advocacy Strategy Development\n\n{userName} worked with policy experts and community organizers to analyze existing educational policies, funding mechanisms, and resource allocation systems to identify specific points where advocacy could create meaningful change. They learned to translate complex policy information into accessible language while developing advocacy strategies that combined grassroots organizing with policy expertise and community leadership development.",
        pause: true,
        hook: "What specific policy changes will {userName}'s advocacy work target to address educational inequities?",
        microVariants: {
          text: "Chapter 4: Policy Analysis and Advocacy Strategy Development\n\n{userName} worked with experts to analyze policies and develop advocacy strategies for meaningful change.",
          alternatives: ["Policy analysis informed organizing strategies that combined grassroots action with expert knowledge."],
          optionalDetails: [`Policy review identified ${Math.floor(Math.random() * 15) + 5} specific areas where advocacy could improve educational equity.`]
        }
      },
      {
        text: "Chapter 5: Community Organizing and Mobilization\n\nThe coalition organized community forums, school board meetings, and public demonstrations to raise awareness about educational inequities while building public support for policy changes and increased educational funding. {userName} learned about the strategic use of different organizing tactics while ensuring that affected communities maintained leadership roles in advocacy efforts and decision-making processes.",
        pause: true,
        hook: "How will community organizing tactics build power for educational justice advocacy?",
        microVariants: {
          text: "Chapter 5: Community Organizing and Mobilization\n\nThe coalition organized forums, meetings, and demonstrations to build support for policy changes and funding increases.",
          alternatives: ["Strategic organizing tactics built community power while maintaining focus on affected community leadership."],
          optionalDetails: [`Community forums drew ${Math.floor(Math.random() * 500) + 100} participants across multiple neighborhood locations.`]
        }
      },
      {
        text: "Chapter 6: Media Strategy and Public Education\n\n{userName} helped develop comprehensive media strategies that included social media campaigns, press releases, and community storytelling events to educate the broader public about educational inequities while building support for policy solutions. They learned to frame educational justice as a community issue that affected everyone while ensuring that directly affected families and students remained central to media representations.",
        pause: true,
        hook: "What impact will media strategy have on public understanding and support for educational justice?",
        microVariants: {
          text: "Chapter 6: Media Strategy and Public Education\n\n{userName} helped develop media strategies including campaigns and storytelling events to educate the public about inequities.",
          alternatives: ["Comprehensive media work built public support while centering affected community voices in advocacy messaging."],
          optionalDetails: [`Media campaigns reached ${Math.floor(Math.random() * 10000) + 2000} community members through multiple channels.`]
        }
      },
      {
        text: "Chapter 7: Direct Action and Civil Disobedience\n\nWhen conventional advocacy tactics proved insufficient, {userName} worked with experienced organizers to plan and coordinate direct action campaigns including school walkouts, sit-ins at government buildings, and civil disobedience actions that pressured policymakers to address educational inequities. They learned about nonviolent resistance strategies while building relationships with legal observers, media allies, and community supporters.",
        pause: true,
        hook: "How will direct action tactics strengthen the pressure for educational justice policy changes?",
        microVariants: {
          text: "Chapter 7: Direct Action and Civil Disobedience\n\nDirect action campaigns including walkouts and sit-ins pressured policymakers to address educational inequities.",
          alternatives: ["Nonviolent resistance tactics escalated pressure while building broader community support for educational justice."],
          optionalDetails: [`Direct actions involved ${Math.floor(Math.random() * 800) + 200} participants across multiple demonstration sites.`]
        }
      },
      {
        text: "Chapter 8: Policy Victories and Implementation\n\nThe sustained organizing pressure led to significant policy victories including increased educational funding, resource equity requirements, and community oversight mechanisms that ensured ongoing accountability for educational justice. {userName} learned about policy implementation processes while working to ensure that policy changes created meaningful improvements in educational opportunities for affected students and communities.",
        pause: true,
        hook: "What concrete improvements will policy victories create for students and families in affected communities?",
        microVariants: {
          text: "Chapter 8: Policy Victories and Implementation\n\nSustained organizing led to policy victories including funding increases, equity requirements, and accountability mechanisms.",
          alternatives: ["Policy implementation required ongoing organizing to ensure meaningful improvements in educational opportunities."],
          optionalDetails: [`Funding increases provided ${Math.floor(Math.random() * 5000) + 1000} dollars per student in additional resources.`]
        }
      },
      {
        text: "Chapter 9: Community Capacity Building and Leadership Development\n\nBeyond specific policy victories, {userName} focused on building long-term community capacity for educational advocacy through leadership training programs, resource sharing networks, and ongoing organizing infrastructure that could address future educational challenges. They learned about sustainable organizing approaches that built community power while developing the next generation of educational justice advocates.",
        pause: true,
        hook: "How will community capacity building ensure long-term sustainability of educational justice organizing?",
        microVariants: {
          text: "Chapter 9: Community Capacity Building and Leadership Development\n\nBeyond policy victories, {userName} focused on building community capacity through training and organizing infrastructure.",
          alternatives: ["Sustainable organizing approaches built community power while developing future educational justice advocates."],
          optionalDetails: [`Leadership training programs graduated ${Math.floor(Math.random() * 60) + 20} new advocates annually.`]
        }
      },
      {
        text: "Chapter 10: Regional Network Development and Movement Building\n\nThe success of local educational justice organizing led to invitations from regional and national organizations to help establish networks of community-based educational advocacy groups. {userName} learned about movement building strategies while supporting educational justice campaigns in other communities and sharing organizing models that could be adapted to different local contexts.",
        pause: true,
        hook: "How will regional networking amplify the impact of local educational justice organizing?",
        microVariants: {
          text: "Chapter 10: Regional Network Development and Movement Building\n\nLocal success led to regional networking opportunities to establish community-based advocacy networks.",
          alternatives: ["Movement building strategies supported educational justice campaigns while sharing adaptable organizing models."],
          optionalDetails: [`Regional network included ${Math.floor(Math.random() * 25) + 10} communities across four states.`]
        }
      },
      {
        text: "Chapter 11: Educational Innovation and Alternative Models\n\n{userName} worked with educators and community organizations to develop alternative educational models that addressed systemic inequities through community-controlled schools, innovative pedagogy, and family engagement approaches that respected community knowledge and cultural assets. This work taught them about the importance of creating educational alternatives while continuing to advocate for broader systemic change.",
        pause: true,
        hook: "What educational innovations will demonstrate alternative approaches to equitable, community-centered learning?",
        microVariants: {
          text: "Chapter 11: Educational Innovation and Alternative Models\n\n{userName} worked with educators to develop community-controlled schools and innovative pedagogical approaches.",
          alternatives: ["Educational alternatives demonstrated community-centered approaches while advocating for broader systemic change."],
          optionalDetails: [`Alternative programs served ${Math.floor(Math.random() * 300) + 100} students with community-controlled educational models.`]
        }
      },
      {
        text: "Chapter 12: College Preparation and Future Planning\n\nAs {userName} prepared for college applications and future career decisions, they reflected on how educational justice advocacy had shaped their understanding of education, policy, and community organizing as interconnected approaches to social change. Their advocacy experience had provided them with research skills, leadership experience, and a network of mentors while demonstrating their commitment to educational equity and community empowerment.",
        pause: true,
        hook: "How will educational justice advocacy experience influence {userName}'s academic and career choices?",
        microVariants: {
          text: "Chapter 12: College Preparation and Future Planning\n\nEducational justice advocacy shaped understanding of education, policy, and organizing as interconnected approaches to change.",
          alternatives: ["College preparation integrated advocacy experience with academic interests and career planning for continued social justice work."],
          optionalDetails: [`College applications emphasized ${Math.floor(Math.random() * 6) + 3} years of community organizing and policy advocacy experience.`]
        }
      },
      {
        text: "Chapter 13: Long-term Impact and Continuing Commitment\n\nReflecting on several years of educational justice work, {userName} documented the concrete improvements their organizing had created while committing to continued advocacy through college and future career paths. They understood that educational justice advocacy would be a lifelong commitment that could take many forms while always centering community leadership and systemic change approaches that addressed root causes of educational inequality.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Chapter 13: Long-term Impact and Continuing Commitment\n\nReflecting on years of work, {userName} documented improvements while committing to continued advocacy through future paths.",
          alternatives: ["Lifelong commitment to educational justice could take many forms while always centering community leadership and systemic change."],
          optionalDetails: [`Organizing work had improved educational resources for ${Math.floor(Math.random() * 5000) + 2000} students across the region.`]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The National Policy Impact\n\nStanding before the Congressional Committee on Educational Equity as the youngest person ever to testify about systemic educational reform, {userName} presented their comprehensive research and advocacy work to legislators who would ultimately pass the landmark Equal Educational Opportunity Act based largely on the grassroots organizing model they had developed.",
        microVariants: [
          "Final Chapter: The Legislative Victory\n\nAddressing the Congressional Committee on Educational Equity as the historically youngest individual to testify regarding systemic educational reform, {userName} presented their comprehensive research and advocacy contributions to legislators."
        ]
      },
      {
        type: 'cozy',
        text: "Final Chapter: The Community School Celebration\n\nYears later, {userName} walked through the vibrant community school that had emerged from their educational justice advocacy, watching students of all backgrounds collaborate on projects while teachers who looked like the community facilitated learning that honored both academic excellence and cultural knowledge. The school library displayed {favoriteColor} artwork created by students, and the garden where children grew {favoriteFood} had become a symbol of community-controlled education.",
        microVariants: [
          "Evening family education events brought three generations together to share knowledge while children played with therapy {favoriteAnimal} in the school's wellness center.",
          "The school had become a community hub where families gathered for celebrations, meetings, and mutual support that strengthened both educational outcomes and community connections."
        ]
      },
      {
        type: 'silly',
        text: "Final Chapter: The Educational Justice Dance-Off\n\nWhen the school district declared an annual 'Educational Equity Day' complete with a parade featuring {userName} as the grand marshal riding a float shaped like a giant {favoriteColor} pencil, even the local {favoriteAnimal} rescue organization joined the celebration by organizing a 'Reading with Rescue Animals' program. The festivities included a dance-off between teachers and students, with the winning moves being incorporated into the new 'Equity in Motion' physical education curriculum.",
        microVariants: [
          "The parade featured marching bands playing songs written by students about educational justice, with lyrics celebrating the joy of learning in a fair and inclusive environment.",
          "Local businesses sponsored a feast featuring every student's {favoriteFood} while community elders shared stories about the importance of education for community empowerment."
        ]
      },
      {
        type: 'reflective',
        text: "Final Chapter: The Quiet Revolution in Learning\n\n{userName} sat in a peaceful corner of the community learning center on a soft {favoriteColor} afternoon, reflecting on how educational justice work had taught them that the most transformative learning happened through relationships built on mutual respect and shared commitment to community wellbeing. The center hummed with quiet conversations where students, families, and teachers learned from each other in ways that honored everyone's knowledge and experience.",
        microVariants: [
          "The learning space had become a place where academic achievement and community wisdom flourished together, creating educational experiences that prepared students for both personal success and community leadership.",
          "Silent moments in the garden reminded {userName} that educational justice was ultimately about creating conditions where every person's intellectual gifts could contribute to collective knowledge and community strength."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "justice_elements": ["educational equity", "resource distribution", "opportunity gaps", "systemic barriers", "policy reform"],
        "organizing_tools": ["community research", "coalition building", "advocacy campaigns", "policy analysis", "grassroots mobilization"]
      },
      weatherVariants: ["community meeting evening", "advocacy rally afternoon", "research session morning", "celebration day"],
      settingVariants: ["community center", "city hall", "school board meeting", "advocacy headquarters"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  },

  // Template 3: Scientific Innovation & Environmental Solutions
  {
    title: "The Renewable Energy Revolution",
    theme: "Scientific Innovation & Environmental Solutions",
    level: "Grade 7",
    scenes: [
      {
        text: "Chapter 1: The Climate Crisis Challenge\n\n{userName} had always been passionate about environmental science and sustainable technology, often spending their free time practicing {hobbies} while researching renewable energy innovations and climate change mitigation strategies. But their academic interest became an urgent mission when their environmental science class partnered with the local university's climate research lab to develop practical solutions for their community's growing energy needs while reducing carbon emissions.",
        pause: true,
        hook: "What innovative renewable energy solutions will {userName} develop to revolutionize their community's approach to sustainable power?",
        microVariants: {
          text: "Chapter 1: The Climate Crisis Challenge\n\n{userName} had always been passionate about environmental science and sustainable technology, often spending their free time practicing {hobbies} while researching renewable energy innovations and climate change mitigation strategies. But their academic interest became an urgent mission when their environmental science class partnered with the local university's climate research lab to develop practical solutions for their community's growing energy needs while reducing carbon emissions.",
          alternatives: [
            "Chapter 1: The Sustainability Imperative\n\n{userName} had consistently maintained passion for environmental science and sustainable technology, frequently dedicating leisure periods to practicing {hobbies} while investigating renewable energy innovations and climate change mitigation strategies."
          ],
          optionalDetails: [
            `Random Seed ${Math.floor(Math.random() * 1000)}: The research lab's {favoriteColor} solar panels were achieving record efficiency rates.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: Local {favoriteAnimal} populations were being affected by air pollution from power plants.`,
            `Random Seed ${Math.floor(Math.random() * 1000)}: The university's sustainable {favoriteFood} production program needed renewable energy to expand.`
          ]
        }
      },
      {
        text: "Chapter 2: Research and Prototype Development\n\n{userName} dove into intensive research about renewable energy technologies, collaborating with university engineering students and environmental science researchers to understand the technical and economic challenges of implementing sustainable energy solutions in their community. They learned about solar photovoltaic systems, wind turbine design, energy storage technologies, and grid integration challenges while developing plans for community-based renewable energy projects that could reduce both environmental impact and energy costs.",
        pause: true,
        hook: "What specific renewable energy innovations will {userName} focus on for their community project?",
        microVariants: {
          text: "Chapter 2: Research and Prototype Development\n\n{userName} dove into intensive research about renewable energy technologies, collaborating with university students to develop community-based solutions.",
          alternatives: ["Technical research combined with community needs assessment to identify viable renewable energy options."],
          optionalDetails: [`Research identified ${Math.floor(Math.random() * 40) + 20}% potential reduction in community energy costs through renewable systems.`]
        }
      },
      {
        text: "Chapter 3: Community Needs Assessment and Stakeholder Engagement\n\nRecognizing that successful renewable energy projects required community buy-in and understanding, {userName} organized community meetings to assess energy needs, economic constraints, and environmental priorities while building relationships with local business owners, homeowners, and community organizations. They learned about the importance of community engagement in technology implementation while developing communication strategies that made technical information accessible to diverse audiences.",
        pause: true,
        hook: "How will {userName} build community support for renewable energy initiatives while addressing economic and technical concerns?",
        microVariants: {
          text: "Chapter 3: Community Needs Assessment and Stakeholder Engagement\n\n{userName} organized community meetings to assess energy needs and build support for renewable projects.",
          alternatives: ["Community engagement strategies made renewable energy accessible while addressing local economic and environmental priorities."],
          optionalDetails: [`Community surveys reached ${Math.floor(Math.random() * 500) + 200} households across various neighborhood demographics.`]
        }
      },
      {
        text: "Chapter 4: Pilot Project Development and Implementation\n\n{userName} worked with university partners and community volunteers to design and implement a pilot solar energy project at the community center, learning about project management, technical installation, and community coordination while demonstrating the practical feasibility of renewable energy technologies. The pilot project became a hands-on learning laboratory that provided both technical education and concrete evidence of renewable energy benefits.",
        pause: true,
        hook: "What challenges and successes will emerge from {userName}'s renewable energy pilot project?",
        microVariants: {
          text: "Chapter 4: Pilot Project Development and Implementation\n\n{userName} worked with partners to implement a pilot solar project, learning about project management and technical installation.",
          alternatives: ["Hands-on pilot project provided technical education while demonstrating renewable energy feasibility and benefits."],
          optionalDetails: [`Solar installation generated ${Math.floor(Math.random() * 15000) + 5000} kilowatt-hours annually for community use.`]
        }
      },
      {
        text: "Chapter 5: Policy Research and Advocacy Development\n\nThe success of the pilot project led {userName} to research renewable energy policies, utility regulations, and financing mechanisms that could support broader renewable energy adoption in their community. They learned about net metering, renewable energy incentives, and community solar programs while developing advocacy strategies to promote supportive policies at municipal and state levels.",
        pause: true,
        hook: "What policy barriers and opportunities will {userName} discover in promoting community renewable energy adoption?",
        microVariants: {
          text: "Chapter 5: Policy Research and Advocacy Development\n\nPilot success led {userName} to research renewable energy policies and financing mechanisms for broader adoption.",
          alternatives: ["Policy advocacy combined technical knowledge with community organizing to support renewable energy expansion."],
          optionalDetails: [`Policy research identified ${Math.floor(Math.random() * 8) + 3} specific regulatory changes needed for community energy programs.`]
        }
      },
      {
        text: "Chapter 6: Educational Program Development and Community Outreach\n\n{userName} developed comprehensive educational programs that taught community members about renewable energy technologies, energy efficiency, and climate change science while providing practical skills for energy conservation and sustainable living. These programs included workshops for different age groups, demonstration projects, and peer education initiatives that built community capacity for ongoing environmental action.",
        pause: true,
        hook: "How will educational programs build lasting community capacity for renewable energy and climate action?",
        microVariants: {
          text: "Chapter 6: Educational Program Development and Community Outreach\n\n{userName} developed educational programs teaching renewable energy technologies and practical sustainability skills.",
          alternatives: ["Community education programs built technical knowledge while developing capacity for ongoing environmental action."],
          optionalDetails: [`Educational workshops reached ${Math.floor(Math.random() * 800) + 300} community members across multiple program sessions.`]
        }
      },
      {
        text: "Chapter 7: Technology Innovation and Adaptation\n\nBuilding on their growing technical expertise, {userName} worked with engineering mentors to develop innovations that adapted renewable energy technologies to specific community needs and conditions. They experimented with small-scale wind systems, solar thermal applications, and energy storage solutions while learning about the innovation process and the importance of community-centered technology development.",
        pause: true,
        hook: "What innovative adaptations will {userName} develop to make renewable energy more accessible and effective for their community?",
        microVariants: {
          text: "Chapter 7: Technology Innovation and Adaptation\n\n{userName} worked with mentors to develop innovations adapting renewable technologies to community needs.",
          alternatives: ["Technical innovation focused on community-centered technology development and accessible renewable energy solutions."],
          optionalDetails: [`Technology adaptations improved energy efficiency by ${Math.floor(Math.random() * 25) + 10}% while reducing installation costs.`]
        }
      },
      {
        text: "Chapter 8: Economic Development and Green Jobs Creation\n\n{userName} recognized that sustainable renewable energy projects needed to create economic opportunities for community members, so they worked with local businesses and workforce development organizations to establish training programs for renewable energy installation, maintenance, and system design. These programs provided pathways to green employment while building local capacity for renewable energy expansion.",
        pause: true,
        hook: "How will green jobs training programs create economic opportunities while advancing renewable energy goals?",
        microVariants: {
          text: "Chapter 8: Economic Development and Green Jobs Creation\n\n{userName} worked with organizations to establish training programs for renewable energy jobs and local economic development.",
          alternatives: ["Workforce development programs created economic opportunities while building local capacity for renewable energy expansion."],
          optionalDetails: [`Training programs prepared ${Math.floor(Math.random() * 60) + 25} community members for careers in renewable energy industries.`]
        }
      },
      {
        text: "Chapter 9: Regional Network Building and Movement Development\n\nThe success of local renewable energy initiatives led to invitations from regional environmental organizations to help establish networks of community-based renewable energy projects. {userName} learned about movement building and resource sharing while supporting renewable energy development in other communities and advocating for policies that could accelerate the transition to sustainable energy systems.",
        pause: true,
        hook: "How will regional networking amplify the impact of local renewable energy initiatives?",
        microVariants: {
          text: "Chapter 9: Regional Network Building and Movement Development\n\nLocal success led to regional networking opportunities to establish community-based renewable energy networks.",
          alternatives: ["Movement building strategies supported renewable energy development while sharing resources and advocacy approaches."],
          optionalDetails: [`Regional network included ${Math.floor(Math.random() * 30) + 15} communities implementing renewable energy projects.`]
        }
      },
      {
        text: "Chapter 10: Climate Science Integration and Advocacy Expansion\n\n{userName} deepened their understanding of climate science and environmental policy to better communicate the urgency of renewable energy transition while developing advocacy campaigns that connected local renewable energy projects to broader climate action goals. They learned to frame renewable energy as both an environmental necessity and an economic opportunity while building coalitions that could influence climate policy at multiple levels.",
        pause: true,
        hook: "How will climate advocacy strengthen support for renewable energy while addressing broader environmental challenges?",
        microVariants: {
          text: "Chapter 10: Climate Science Integration and Advocacy Expansion\n\n{userName} deepened climate science understanding to connect local projects to broader climate action goals.",
          alternatives: ["Climate advocacy framed renewable energy as environmental necessity and economic opportunity for broader policy influence."],
          optionalDetails: [`Advocacy campaigns reached ${Math.floor(Math.random() * 15000) + 5000} people through multiple communication channels.`]
        }
      },
      {
        text: "Chapter 11: College Preparation and Future Career Planning\n\nAs {userName} prepared for college applications and future career decisions, they reflected on how renewable energy advocacy had shaped their understanding of engineering, environmental science, and community organizing as interconnected approaches to addressing climate challenges. Their renewable energy experience had provided them with technical skills, project management experience, and community leadership abilities while demonstrating their commitment to sustainable technology and environmental justice.",
        pause: true,
        hook: "How will renewable energy advocacy experience influence {userName}'s academic and career choices in science and engineering?",
        microVariants: {
          text: "Chapter 11: College Preparation and Future Career Planning\n\nRenewable energy advocacy shaped understanding of engineering, science, and organizing as interconnected approaches to climate challenges.",
          alternatives: ["College preparation integrated technical experience with environmental advocacy for future career development in sustainable technology."],
          optionalDetails: [`College applications emphasized ${Math.floor(Math.random() * 5) + 3} years of renewable energy project leadership and technical innovation.`]
        }
      },
      {
        text: "Chapter 12: Long-term Impact Assessment and Sustainability Planning\n\nReflecting on several years of renewable energy advocacy, {userName} documented the concrete environmental and economic benefits their projects had created including measurable reductions in carbon emissions, energy cost savings for community members, and the development of local capacity for ongoing renewable energy development. They also developed sustainability plans to ensure that renewable energy initiatives could continue growing and adapting to new technological developments and community needs.",
        pause: true,
        hook: "What measurable impacts has {userName}'s renewable energy advocacy created for environmental and economic sustainability?",
        microVariants: {
          text: "Chapter 12: Long-term Impact Assessment and Sustainability Planning\n\nReflecting on years of advocacy, {userName} documented environmental and economic benefits while planning for sustainability.",
          alternatives: ["Impact assessment revealed measurable carbon reductions and energy savings while ensuring ongoing renewable energy development."],
          optionalDetails: [`Renewable energy projects reduced community carbon emissions by ${Math.floor(Math.random() * 500) + 200} tons annually.`]
        }
      },
      {
        text: "Chapter 13: Innovation Legacy and Future Vision\n\nLooking toward their future in college and beyond, {userName} committed to continuing renewable energy innovation and climate advocacy while pursuing academic and career paths that would amplify their impact through engineering, environmental science, or energy policy work. They understood that their early experience with community-based renewable energy had provided them with both technical skills and organizing experience that would be valuable throughout their career in addressing climate challenges through sustainable technology development.",
        pause: false,
        hook: "",
        microVariants: {
          text: "Chapter 13: Innovation Legacy and Future Vision\n\nLooking toward college and beyond, {userName} committed to continuing renewable energy innovation through academic and career paths.",
          alternatives: ["Future commitment integrated technical innovation with climate advocacy for sustainable technology development throughout their career."],
          optionalDetails: [`Professional network included ${Math.floor(Math.random() * 80) + 30} renewable energy engineers and environmental policy experts.`]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "Final Chapter: The Global Climate Leadership\n\nStanding before the United Nations Climate Action Summit as the youngest recipient of the Global Environmental Innovation Award, {userName} addressed world leaders about their revolutionary renewable energy technologies that had become the foundation for international climate change mitigation efforts.",
        microVariants: [
          "Final Chapter: The International Recognition Summit\n\nAddressing the United Nations Climate Action Summit as the historically youngest recipient of the Global Environmental Innovation Award, {userName} presented to world leaders regarding their revolutionary renewable energy technologies."
        ]
      },
      {
        type: 'cozy',
        text: "Final Chapter: The Community Energy Celebration\n\nYears later, {userName} walked through their neighborhood during the annual Renewable Energy Festival, watching families enjoy {favoriteFood} cooked with solar ovens while children played in community gardens powered by wind energy. The {favoriteColor} solar panels on every roof gleamed in the sunshine, and therapy {favoriteAnimal} from the local rescue organization wandered peacefully through the sustainable community that had grown from their renewable energy advocacy.",
        microVariants: [
          "Evening gatherings featured stories shared by three generations about how renewable energy had transformed their community while creating local jobs and environmental health.",
          "The community center had become a hub where neighbors gathered to share energy-efficient recipes and teach children about sustainability through hands-on learning experiences."
        ]
      },
      {
        type: 'silly',
        text: "Final Chapter: The Renewable Energy Superhero Celebration\n\nWhen the city declared {userName} the official 'Solar Superhero' and built a statue of them holding a {favoriteColor} wind turbine, even the local {favoriteAnimal} population seemed to celebrate by organizing themselves into formation around the community's solar panels. The ceremony featured a feast of {favoriteFood} prepared entirely with renewable energy, and the mayor announced that all future city celebrations would be powered by the sun, wind, and community enthusiasm.",
        microVariants: [
          "The superhero costume included a cape made from recycled solar panel materials and boots that generated electricity with every step.",
          "Local renewable energy companies sponsored a synchronized dance performed by wind turbines, creating both entertainment and clean electricity."
        ]
      },
      {
        type: 'reflective',
        text: "Final Chapter: The Quiet Revolution in Energy\n\n{userName} sat in the peaceful community garden on a warm {favoriteColor} afternoon, reflecting on how renewable energy advocacy had taught them that the most powerful technologies were those that worked in harmony with natural systems while strengthening community connections. The quiet hum of wind turbines and the gentle warmth of solar heating reminded them that sustainable innovation was ultimately about creating conditions where both human communities and natural ecosystems could thrive together.",
        microVariants: [
          "The renewable energy systems had become almost invisible parts of daily life, providing clean power while creating spaces where community members learned from both technology and nature.",
          "Silent moments in the solar-powered learning center reminded {userName} that renewable energy was ultimately about creating abundant, clean power that supported both human prosperity and environmental health."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "energy_technologies": ["solar innovations", "wind power systems", "hydroelectric solutions", "geothermal applications"],
        "research_methods": ["data analysis", "prototype development", "efficiency testing", "environmental impact studies"]
      },
      weatherVariants: ["sunny research day", "windy testing session", "clear measurement morning", "innovative evening"],
      settingVariants: ["university research lab", "renewable energy facility", "sustainable technology center", "environmental innovation hub"],
      randomSeed: Math.floor(Math.random() * 10000)
    }
  }
];

/**
 * Get a random Grade 7 template or specific template by index
 */
export function getGrade7FallbackTemplate(templateIndex?: number): StoryTemplate | null {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < GRADE_7_FALLBACK_TEMPLATES.length) {
    return GRADE_7_FALLBACK_TEMPLATES[templateIndex];
  }
  
  if (GRADE_7_FALLBACK_TEMPLATES.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * GRADE_7_FALLBACK_TEMPLATES.length);
  return GRADE_7_FALLBACK_TEMPLATES[randomIndex];
}

/**
 * Get the count of available Grade 7 templates
 */
export function getGrade7FallbackTemplateCount(): number {
  return GRADE_7_FALLBACK_TEMPLATES.length;
}