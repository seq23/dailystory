// Grade 9 Template: Mental Health Advocacy Initiative
export const template = {
  title: "The Mental Health Advocacy Initiative",
  theme: "Health & Wellness Advocacy",
  level: "Grade 9",
  scenes: [
    {
      text: "Riley Martinez had always noticed that their friend Casey seemed quieter than usual lately, but it wasn't until they found Casey crying in the empty art room that Riley realized something was seriously wrong. 'I can't keep pretending everything's fine,' Casey whispered, their voice breaking. 'I think about dying every single day.' Riley's heart shattered as they pulled Casey into a fierce hug, realizing that the mental health crisis at their school was more than statistics - it was their friend's daily reality. In that moment, surrounded by half-finished paintings and the smell of acrylic, Riley knew they couldn't stay silent about the inadequate mental health support at their school.",
      pause: true,
      hook: "How will Riley's discovery of Casey's struggle inspire them to take action?",
      microVariants: {
        text: "Finding Casey in crisis in the art room opened Riley's eyes to the real mental health emergency among their peers and sparked their determination to fight for better support.",
        alternatives: ["Casey's confession about suicidal thoughts transformed Riley's understanding of their school's mental health crisis from abstract to painfully personal.", "The art room became the place where Riley realized that advocating for mental health resources was literally a matter of life and death."],
        optionalDetails: ["Casey had been hiding their depression for months", "Several other students had dropped out due to untreated mental health issues", "The school had only one counselor for 800 students"]
      }
    },
    {
      text: "That night, Riley stayed up researching mental health statistics, horrified to learn that over 40% of high school students experienced persistent sadness and that suicide was the second leading cause of death among teenagers. When they called Casey to check in, their conversation stretched past midnight as they talked about everything - Casey's depression, Riley's anxiety about college, their shared frustration with their school's outdated mental health resources. 'Thank you for not making me feel broken,' Casey said softly before hanging up. Riley felt their heart flutter, realizing that their concern for Casey was evolving into something deeper, something that made them want to fight even harder for mental health support.",
      pause: true,
      hook: "Will Riley's growing feelings for Casey strengthen their resolve to create change?",
      microVariants: {
        text: "Late-night research and heart-to-heart conversations with Casey deepened both Riley's understanding of mental health issues and their emotional connection to Casey.",
        alternatives: ["Riley's research into teen suicide rates was motivated by their growing care for Casey and determination to protect them.", "Conversations with Casey revealed both the scope of mental health challenges and Riley's deepening feelings for their friend."],
        optionalDetails: ["Most students didn't know where to get help for mental health issues", "The school's mental health pamphlets were from the 1990s", "Riley discovered they also had undiagnosed anxiety"]
      }
    },
    {
      text: "Riley started paying attention to mental health issues everywhere - in their classes, in the hallways, in their friend groups. They noticed Sam constantly picking at their skin, Jordan sleeping through classes, and Alex making jokes about wanting to disappear. During lunch with Casey, they brought up the idea of starting a mental health advocacy group. Casey's eyes lit up for the first time in weeks. 'Would you really do that?' they asked, reaching across the table to squeeze Riley's hand. The touch sent electricity through Riley's entire body, and they realized that fighting for Casey's well-being had become inseparable from their growing romantic feelings. 'For you, I'd do anything,' Riley replied, then blushed at how that sounded.",
      pause: true,
      hook: "How will Riley balance their activism with their developing feelings for Casey?",
      microVariants: {
        text: "Riley's growing awareness of classmates' mental health struggles was matched by their deepening romantic feelings for Casey, who responded positively to advocacy ideas.",
        alternatives: ["Noticing widespread mental health issues among peers, Riley found motivation in Casey's enthusiastic support for their advocacy plans.", "Casey's excitement about mental health advocacy made Riley realize their friendship was becoming something more romantic and meaningful."],
        optionalDetails: ["Teachers were reporting increased absences and declining grades", "Several students had been hospitalized for mental health crises", "Riley and Casey started eating lunch together every day"]
      }
    },
    {
      text: "Riley approached Ms. Johnson, the school psychologist, about their concerns and was surprised by her enthusiastic response. 'I've been advocating for better resources for years,' Ms. Johnson said, 'but it's more powerful coming from students.' She introduced Riley to Dr. Kim from the community mental health center, who offered to help train student advocates. When Riley shared this news with Casey after school, they walked home together for the first time, their shoulders bumping as they talked excitedly about possibilities. 'I can't believe you're doing this,' Casey said, stopping to face Riley under the oak tree by the school. 'You're incredible.' The way Casey looked at them made Riley's heart race with hope and possibility.",
      pause: true,
      hook: "What will happen as Riley and Casey work together on mental health advocacy?",
      microVariants: {
        text: "Professional support from Ms. Johnson and Dr. Kim validated Riley's advocacy plans while their walks home with Casey created opportunities for deeper connection.",
        alternatives: ["Ms. Johnson's enthusiasm for student-led mental health advocacy matched the growing intimacy between Riley and Casey.", "Professional allies strengthened Riley's advocacy work while their relationship with Casey deepened through shared walks and conversations."],
        optionalDetails: ["Dr. Kim had helped start successful peer support programs at other schools", "Ms. Johnson was relieved to have student advocates supporting her work", "Riley and Casey started texting late into the night about their plans"]
      }
    },
    {
      text: "The first meeting of their mental health advocacy group attracted twelve students, including several Riley hadn't expected. As they sat in a circle in Ms. Johnson's office, sharing stories about anxiety, depression, and the pressure to appear perfect, Riley watched Casey speak for the first time about their struggles. 'I thought I was the only one feeling this way,' Casey said, their voice stronger than Riley had heard it in months. 'But sitting here with all of you, I realize we can help each other.' When Casey caught Riley's eye and smiled, Riley felt their heart soar with pride and something that felt suspiciously like love.",
      pause: true,
      hook: "How will leading the support group together affect Riley and Casey's relationship?",
      microVariants: {
        text: "The first support group meeting revealed widespread mental health struggles while showing Casey's growing strength and deepening Riley's feelings for them.",
        alternatives: ["Twelve students attending their first meeting validated Riley's advocacy approach while Casey's participation marked their healing and their growing bond.", "Casey's courage in sharing their story at the group meeting made Riley realize how much they admired and cared for them."],
        optionalDetails: ["Three students mentioned having eating disorders", "Several talked about family pressure and perfectionism", "Students exchanged phone numbers for crisis support"]
      }
    }
  ],
  endings: [
    {
      type: 'triumphant',
      text: "Riley and Casey's mental health advocacy program expands to schools across the district, with their peer support model becoming a national example of how student-led initiatives can save lives while building meaningful relationships based on mutual care and shared purpose.",
      microVariants: ["Their advocacy model spreads nationally while their relationship becomes an example of how love and activism can strengthen each other.", "The program's success demonstrates that peer support and romantic partnership can create powerful foundations for social change."]
    },
    {
      type: 'reflective',
      text: "Riley continues mental health advocacy work while understanding that the most important healing happens not just through programs and policies, but through the daily practice of showing up for each other with love, patience, and authentic care - lessons learned through their relationship with Casey.",
      microVariants: ["Ongoing advocacy work teaches Riley that sustainable change requires both systematic approaches and personal relationships built on genuine care.", "The work reveals that mental health healing happens through both professional support and the kind of love Riley and Casey share."]
    }
  ],
  reuse: {
    swappableElements: {
      "mental_health_issues": ["depression", "anxiety", "eating disorders", "self-harm"],
      "advocacy_strategies": ["peer support groups", "policy proposals", "awareness campaigns", "crisis intervention training"],
      "school_responses": ["administrative support", "resource allocation", "policy changes", "staff training"],
      "community_partnerships": ["mental health centers", "crisis hotlines", "therapy organizations", "peer counseling programs"]
    },
    weatherVariants: ["awareness week", "crisis response", "program launch", "community meeting"],
    settingVariants: ["counseling center", "peer support room", "school board meeting", "community mental health facility"],
    randomSeed: 252
  }
};