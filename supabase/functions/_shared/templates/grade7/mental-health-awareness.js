// Grade 7 Template: Mental Health Awareness Campaign
export const template = {
  title: "The Mental Health Awareness Campaign",
  theme: "Peer Support & Emotional Wellness",
  level: "Grade 7",
  scenes: [
    {
      text: "{userName} noticed that several classmates had become increasingly withdrawn and anxious during the school year, but when they tried to talk to friends about mental health, they realized that most students lacked the vocabulary and knowledge to discuss emotional wellness openly. After learning that suicide rates among teenagers had increased dramatically and that many young people felt isolated in their struggles, {userName} decided to research how schools could better support student mental health through peer education and destigmatization efforts.",
      pause: true,
      hook: "How can {userName} create effective mental health support among their peers?",
      microVariants: {
        text: "{userName} observed classmates struggling with mental health but lacking tools for open discussion, inspiring research into peer-based emotional wellness support systems.",
        alternatives: [
          "Recognizing emotional struggles among peers and inadequate mental health discourse, {userName} began developing student-centered wellness education approaches."
        ],
        optionalDetails: ["Guidance counselors had long waiting lists for appointments.", "Students often masked their feelings with humor or silence.", "Social media amplified both connection and comparison pressures."]
      }
    },
    {
      text: "Collaborating with school counselors and researching evidence-based mental health programs, {userName} developed a peer support network called 'Circle of Care' where trained student volunteers could provide initial emotional support and connect classmates with appropriate professional resources. They learned about active listening techniques, crisis recognition signs, and the importance of maintaining appropriate boundaries while helping friends. The program emphasized that peer supporters were not therapists, but rather bridges to professional help when needed.",
      pause: true,
      hook: "What challenges will arise as {userName} implements peer mental health support?",
      microVariants: {
        text: "{userName} created 'Circle of Care,' training student volunteers in active listening and crisis recognition to provide peer support and connect classmates with professional help.",
        alternatives: [
          "The peer support network taught students supportive communication skills while establishing clear boundaries and referral protocols for serious mental health concerns."
        ],
        optionalDetails: ["Training included role-playing difficult conversations.", "Students learned to recognize signs of depression and anxiety.", "Clear protocols existed for involving adults when necessary."]
      }
    },
    {
      text: "The Circle of Care program launched with monthly mental health awareness assemblies where students shared personal stories, professionals provided education about common mental health conditions, and the school community learned practical strategies for supporting emotional wellness. {userName} organized stress-reduction workshops during exam periods, created quiet spaces for students who felt overwhelmed, and established anonymous suggestion systems where students could request help without fear of judgment or social stigma.",
      pause: true,
      hook: "How will the school community respond to increased mental health openness?",
      microVariants: {
        text: "Monthly assemblies featured student stories and professional education, while {userName} organized stress-reduction workshops and created safe spaces for emotional support.",
        alternatives: [
          "The program combined personal storytelling with expert education, offering practical wellness strategies and judgment-free support systems for struggling students."
        ],
        optionalDetails: ["Student participation in assemblies was voluntary but enthusiastic.", "Teachers received training on recognizing student distress.", "Parents attended evening sessions about supporting teen mental health."]
      }
    }
  ],
  endings: [
    {
      type: 'cozy',
      text: "Six months later, {userName} sat in the newly designated 'Wellness Corner' of the library, surrounded by comfortable chairs and soft lighting, watching as students naturally gravitated toward this peaceful space during stressful moments. The gentle hum of quiet conversation and the sight of peers supporting each other created an atmosphere of healing and hope. 'Sometimes the most powerful medicine is simply knowing you're not alone,' {userName} reflected as they witnessed authentic friendships forming through shared vulnerability.",
      microVariants: [
        "In the peaceful Wellness Corner, {userName} found satisfaction watching peers support each other, realizing that connection and understanding were powerful healing forces."
      ]
    },
    {
      type: 'triumphant',
      text: "The Circle of Care program expanded to include partnerships with five neighboring schools, creating a regional youth mental health network that served over 2,000 students. {userName} was invited to present their peer support model at a national conference on adolescent mental health, where education professionals praised the program's effectiveness in reducing stigma and connecting students to appropriate resources. Several states expressed interest in implementing similar programs in their school districts.",
      microVariants: [
        "{userName}'s Circle of Care expanded regionally, serving thousands of students and earning national recognition as an effective model for peer-based mental health support."
      ]
    }
  ],
  reuse: {
    swappableElements: {
      "mental_health_challenges": ["anxiety disorders", "depression", "eating disorders", "social isolation", "academic pressure"],
      "support_strategies": ["peer listening", "stress management", "mindfulness practice", "crisis intervention", "resource connection"],
      "wellness_activities": ["meditation sessions", "art therapy", "journaling workshops", "exercise programs", "support groups"]
    },
    weatherVariants: ["stressful exam period", "transitional school season", "winter wellness focus", "spring renewal activities"],
    settingVariants: ["school counseling office", "peer support room", "wellness corner", "community mental health center"]
  }
};