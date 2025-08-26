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
  }
];