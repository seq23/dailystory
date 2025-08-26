// Grade 9 Templates (Ages 14-15) - Personal Agency & Complex Problem Solving
export const CONSOLIDATED_GRADE_9_TEMPLATES = [
  {
    title: "The Mental Health Advocacy Initiative", 
    theme: "Health & Wellness Advocacy",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} had always been aware that many of their peers struggled with anxiety, depression, and other mental health challenges, but it wasn't until they researched statistics showing that over 40% of high school students experienced persistent sadness and that suicide was the second leading cause of death among teenagers that they fully grasped the scope of the mental health crisis affecting their generation - and realized that their school's current approach of occasional assemblies and outdated guidance counselor resources was woefully inadequate for addressing such widespread and serious needs.",
        pause: true,
        hook: "How will {userName} advocate for better mental health resources and support systems?",
        microVariants: {
          text: "{userName} researched alarming mental health statistics affecting teenagers and recognized the inadequacy of their school's current support systems for addressing widespread psychological challenges.",
          alternatives: [
            "Discovering that mental health crises affected nearly half of their peers, {userName} realized their school's limited counseling resources were insufficient for the scope of student psychological needs."
          ],
          optionalDetails: ["Crisis helpline numbers were outdated on school posters.", "Students often waited weeks for counseling appointments.", "Many peers felt stigmatized seeking mental health support."]
        }
      },
      {
        text: "Working with school psychologists, peer counselors, and community mental health professionals, {userName} developed a comprehensive proposal for improved mental health support that included peer support groups, mental health literacy education integrated into health class curriculum, expanded counseling staff, mindfulness and stress management workshops, and protocols for identifying and supporting students in crisis - recognizing that effective mental health advocacy required both immediate support resources and long-term cultural change to reduce stigma and normalize help-seeking behavior.",
        pause: true,
        hook: "What impact will {userName}'s mental health advocacy efforts have on their school community?",
        microVariants: {
          text: "Collaborating with mental health professionals, {userName} developed comprehensive proposals for expanded support services, educational programs, and cultural changes to normalize mental health care in schools.",
          alternatives: [
            "Through partnerships with counselors and community professionals, {userName} created detailed plans for systemic mental health improvements including education, support services, and stigma reduction."
          ],
          optionalDetails: ["Professional consultations provided evidence-based recommendations.", "Student surveys revealed specific unmet needs.", "Parent meetings addressed community concerns about mental health resources."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The school district approved funding for {userName}'s mental health initiative, leading to expanded counseling services, peer support programs, and mental health education that measurably improved student well-being and academic performance while reducing crisis incidents - demonstrating that student advocacy could create systematic changes that saved lives and enhanced educational environments for entire communities.",
        microVariants: [
          "District approval and funding of {userName}'s mental health proposals led to measurable improvements in student well-being and established a model program for other schools to adopt."
        ]
      },
      {
        type: 'reflective',
        text: "Sitting in the newly established peer support circle, listening to classmates share their struggles and celebrate their progress, {userName} felt profound gratitude for the courage it had taken to speak up about mental health needs. 'Sometimes the most important advocacy work is simply making it okay to not be okay,' they reflected. 'When we create spaces for authentic vulnerability and mutual support, we build communities where everyone can thrive.'",
        microVariants: [
          "Facilitating peer support groups, {userName} appreciated how creating safe spaces for vulnerability and mutual aid had transformed their school's approach to mental health and community care."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "mental_health_issues": ["anxiety disorders", "depression", "eating disorders", "trauma responses", "substance abuse"],
        "support_systems": ["peer counseling", "professional therapy", "support groups", "crisis intervention", "family education"],
        "advocacy_strategies": ["policy proposals", "community education", "resource development", "stigma reduction campaigns"]
      },
      weatherVariants: ["awareness week", "crisis response", "program launch", "community meeting"],
      settingVariants: ["counseling center", "peer support room", "school board meeting", "community mental health facility"]
    }
  },
  {
    title: "The Youth Criminal Justice Reform Project",
    theme: "Legal Justice & System Reform",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} had always assumed that the criminal justice system was fundamentally fair until they learned that a classmate's older brother had received a dramatically harsher sentence than a peer from a wealthier neighborhood for the same offense, leading them to research disparities in how the legal system treats young people from different racial, economic, and social backgrounds. Through extensive investigation, they discovered that youth from communities of color and low-income families were significantly more likely to be tried as adults, receive longer sentences, and face barriers to rehabilitation and reintegration, while youth from privileged backgrounds often received treatment-focused interventions and second chances that set them up for future success.",
        pause: true,
        hook: "How will {userName} address systematic inequities in youth criminal justice outcomes?",
        microVariants: {
          text: "{userName} discovered that criminal justice outcomes for youth varied dramatically by race and class, inspiring research into systematic disparities in legal treatment and sentencing.",
          alternatives: [
            "Learning about unequal sentencing for similar offenses, {userName} investigated how socioeconomic factors influence youth experiences in the criminal justice system."
          ],
          optionalDetails: ["Public defenders had overwhelming caseloads in certain districts.", "Some schools had police officers while others had counselors.", "Diversion programs were primarily available in affluent areas."]
        }
      },
      {
        text: "Working with juvenile defense attorneys, formerly incarcerated individuals, and criminal justice reform organizations, {userName} documented specific cases that illustrated systematic bias in youth sentencing and developed comprehensive policy proposals for reform. They learned about restorative justice principles, evidence-based rehabilitation programs, and successful models from other states that prioritized healing and community repair over punishment and incarceration. Their research revealed that communities investing in education, mental health services, and economic opportunities had dramatically lower youth crime rates and better outcomes for all young people.",
        pause: true,
        hook: "What reform strategies will {userName} propose to create more equitable youth justice outcomes?",
        microVariants: {
          text: "{userName} partnered with legal advocates to document bias cases and develop policy proposals based on restorative justice and community investment principles.",
          alternatives: [
            "Through collaboration with reform organizations, {userName} researched successful alternative justice models emphasizing rehabilitation and community healing over punishment."
          ],
          optionalDetails: ["Restorative justice programs had 30% lower recidivism rates.", "States investing in youth programs saw crime decreases.", "Community members wanted healing rather than punishment."]
        }
      },
      {
        text: "The youth justice reform campaign gained momentum when {userName} organized listening sessions where community members, formerly incarcerated individuals, and families affected by the justice system could share their experiences and priorities for change. These sessions revealed that most people wanted accountability coupled with opportunities for redemption and growth, rather than purely punitive approaches that often failed to address underlying causes of problematic behavior. {userName} used these community voices to develop legislation that would require equal access to diversion programs, fund community-based alternatives to incarceration, and eliminate disparities in how youth from different backgrounds were treated by the system.",
        pause: true,
        hook: "How will {userName}'s community-centered approach influence policy makers and public opinion?",
        microVariants: {
          text: "Community listening sessions revealed desire for accountability with redemption opportunities, informing {userName}'s legislation for equal diversion access and community alternatives.",
          alternatives: [
            "Through community engagement, {userName} learned that people wanted justice systems emphasizing healing and growth, leading to comprehensive reform proposals."
          ],
          optionalDetails: ["Former inmates became powerful advocates for change.", "Families shared stories of transformation and second chances.", "Community leaders endorsed the reform proposals."]
        }
      }
    ],
    endings: [
      {
        type: 'reflective',
        text: "Sitting in a circle during a restorative justice conference where a young person was taking accountability for their actions while the community discussed healing and support rather than punishment, {userName} felt the profound difference between justice that tears communities apart and justice that brings them together. 'Real safety comes from healthy communities, not from punishment,' they understood with deep clarity. 'When we invest in young people's potential rather than their mistakes, we create the conditions where everyone can thrive and contribute to the common good.'",
        microVariants: [
          "Witnessing restorative justice in action, {userName} appreciated how community-centered accountability created healing and safety through investment in human potential."
        ]
      },
      {
        type: 'triumphant',
        text: "The comprehensive youth justice reform legislation passed with bipartisan support, establishing equal access to diversion programs, funding community-based alternatives to incarceration, and creating oversight mechanisms to monitor sentencing disparities. {userName}'s research and advocacy contributed to policy changes that were projected to reduce youth incarceration by 40% while increasing public safety through community investment. Three other states adopted similar legislation based on the model that {userName} had helped develop through community engagement and evidence-based research.",
        microVariants: [
          "{userName}'s youth justice legislation passed with bipartisan support, reducing incarceration while increasing safety through community investment and inspiring multi-state adoption."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "justice_disparities": ["sentencing differences", "diversion access", "legal representation quality", "rehabilitation opportunities"],
        "reform_approaches": ["restorative justice", "community investment", "diversion programs", "policy oversight"],
        "community_impact": ["healing circles", "victim support", "offender reintegration", "public safety improvement"]
      },
      weatherVariants: ["legislative session", "community organizing", "policy hearing", "reform implementation"],
      settingVariants: ["community meeting space", "legislative chambers", "restorative justice circle", "reform organization office"]
    }
  },
  {
    title: "The Educational Equity Research Initiative",
    theme: "Academic Justice & Opportunity Access",
    level: "Grade 9",
    scenes: [
      {
        text: "{userName} had always excelled academically and assumed that educational opportunities were equally available to all students until they began tutoring at an underfunded middle school and discovered vast disparities in resources, technology, course offerings, and teacher experience that directly impacted student achievement and college preparedness. When they learned that school funding formulas often perpetuated inequality by tying resources to local property taxes, creating a system where wealthy districts could spend three times more per student than poor districts, {userName} realized that educational inequality was not accidental but structurally embedded in how schools were funded and supported.",
        pause: true,
        hook: "How will {userName} address systematic educational inequities that affect student opportunities?",
        microVariants: {
          text: "{userName} discovered vast resource disparities between schools through tutoring, learning how funding formulas tied to property taxes create systematic educational inequality.",
          alternatives: [
            "Tutoring at an underfunded school revealed how property tax-based funding creates unequal educational opportunities and limits student potential."
          ],
          optionalDetails: ["Some schools lacked basic supplies like textbooks and paper.", "Class sizes varied dramatically between wealthy and poor districts.", "Technology access determined which students could complete digital assignments."]
        }
      },
      {
        text: "Collaborating with education researchers, parent advocacy groups, and policy organizations, {userName} conducted comprehensive analysis of funding disparities, achievement gaps, and opportunity differences across their state's school districts. Their research revealed that educational inequality intersected with racial and economic segregation, creating a system where zip code determined educational destiny more than student potential or effort. They documented how underfunded schools lost experienced teachers to better-resourced districts, creating a cycle where students most in need of support received the least qualified instruction and fewest advanced opportunities.",
        pause: true,
        hook: "What evidence-based solutions will {userName} propose to create more equitable educational funding?",
        microVariants: {
          text: "{userName} analyzed statewide educational disparities, revealing how funding inequality intersected with segregation to limit opportunities based on zip code rather than potential.",
          alternatives: [
            "Research partnerships documented how underfunding created teacher turnover and opportunity gaps, making educational success dependent on geographic location."
          ],
          optionalDetails: ["Wealthy districts offered 15+ Advanced Placement courses while poor districts offered 2-3.", "Teacher salaries differed by $20,000+ between neighboring districts.", "Some schools had counselors for every 100 students while others had 1 for 800."]
        }
      },
      {
        text: "The educational equity campaign gained support when {userName} organized joint presentations where students from differently funded schools could share their experiences and demonstrate the impact of resource disparities on learning opportunities. These powerful testimonials, combined with rigorous data analysis, convinced lawmakers that educational funding reform was both a moral imperative and an economic necessity for state competitiveness. {userName} proposed legislation that would establish minimum per-pupil funding floors, provide additional resources for high-need students, and create transparency mechanisms so communities could track how educational dollars were being used to support student success.",
        pause: true,
        hook: "How will {userName}'s student-centered advocacy influence educational policy and public understanding?",
        microVariants: {
          text: "Joint student presentations demonstrated funding impact on opportunities, convincing lawmakers that educational equity was both morally and economically essential.",
          alternatives: [
            "Students sharing their experiences with resource disparities created powerful advocacy for funding reform legislation establishing minimum per-pupil investment."
          ],
          optionalDetails: ["Rural students described traveling hours for advanced courses.", "Urban students shared overcrowded classroom experiences.", "Suburban students acknowledged their resource advantages."]
        }
      }
    ],
    endings: [
      {
        type: 'triumphant',
        text: "The educational equity legislation was signed into law, establishing increased minimum per-pupil funding, weighted formulas that provided additional resources for students facing greater challenges, and transparency requirements that allowed communities to monitor educational investment effectiveness. {userName}'s research and student-centered advocacy had contributed to policy changes projected to impact over 500,000 students, with particular benefits for rural, urban, and high-poverty school districts that had been systematically underfunded for decades.",
        microVariants: [
          "{userName}'s educational equity legislation became law, establishing minimum funding floors and weighted formulas benefiting over 500,000 students in previously underfunded districts."
        ]
      },
      {
        type: 'reflective',
        text: "Visiting the middle school where they had first witnessed educational inequality, {userName} saw the beginning changes that adequate funding was making possible - new books, updated technology, smaller class sizes, and most importantly, the spark of possibility returning to students' eyes. 'Education is the foundation of everything else,' they reflected with deep satisfaction. 'When we ensure that every child has access to quality learning opportunities regardless of their zip code, we're not just investing in individual success - we're building a society where everyone can contribute their talents and potential to the common good.'",
        microVariants: [
          "Seeing improvements at the previously underfunded school, {userName} appreciated how educational equity created opportunities for individual success and collective social benefit."
        ]
      }
    ],
    reuse: {
      swappableElements: {
        "educational_barriers": ["funding disparities", "resource shortages", "teacher quality gaps", "opportunity access"],
        "equity_solutions": ["funding formulas", "resource allocation", "teacher retention", "student support services"],
        "student_impacts": ["achievement gaps", "college readiness", "career preparation", "lifelong learning"]
      },
      weatherVariants: ["legislative session", "budget planning period", "school year preparation", "advocacy campaign"],
      settingVariants: ["underfunded school", "legislative hearing room", "education research center", "community advocacy meeting"]
    }
  }
];