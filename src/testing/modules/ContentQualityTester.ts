interface ContentQualityTestResult {
  testName: string;
  passed: boolean;
  failed: boolean;
  score: number;
  issues: ContentQualityIssue[];
  metrics: ContentQualityMetrics;
  educationalEffectiveness: number;
  criticalIssues: string[];
}

interface ContentQualityIssue {
  category: 'template' | 'story' | 'educational' | 'appropriateness' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: string;
  affectedContent: string;
  recommendedAction: string;
  educationalImpact: 'none' | 'low' | 'medium' | 'high';
}

interface ContentQualityMetrics {
  templateVariableCompletion: number;
  storyQualityConsistency: number;
  educationalValueAlignment: number;
  ageAppropriatenessScore: number;
  readabilityScore: number;
  vocabularyLevelAccuracy: number;
}

interface StoryTemplate {
  id: string;
  level: number;
  template: string;
  variables: string[];
  expectedWordCount: number;
  educationalGoals: string[];
}

interface TemplateVariable {
  name: string;
  type: 'user_name' | 'character' | 'setting' | 'object' | 'action';
  required: boolean;
  defaultValue?: string;
}

export class ContentQualityTester {
  private static mockTemplates: StoryTemplate[] = [
    {
      id: 'level0-template-1',
      level: 0,
      template: 'Hi {user name}! This is a cat. The cat is big. The cat says meow.',
      variables: ['{user name}'],
      expectedWordCount: 12,
      educationalGoals: ['sight words', 'simple sentences', 'animal recognition']
    },
    {
      id: 'level1-template-1',
      level: 1,
      template: 'Hello {user name}, today we will read about {character}. {character} likes to {action} in the {setting}.',
      variables: ['{user name}', '{character}', '{action}', '{setting}'],
      expectedWordCount: 15,
      educationalGoals: ['character development', 'action words', 'setting description']
    },
    {
      id: 'level2-template-1',
      level: 2,
      template: '{user name}, meet {character} who lives in {setting}. {character} has a special {object} that helps them {action}.',
      variables: ['{user name}', '{character}', '{setting}', '{object}', '{action}'],
      expectedWordCount: 18,
      educationalGoals: ['descriptive language', 'object relationships', 'problem solving']
    }
  ];

  private static mockGeneratedStories = [
    {
      template: 'level0-template-1',
      generatedContent: 'Hi Emma! This is a cat. The cat is big. The cat says meow.',
      variables: { '{user name}': 'Emma' },
      level: 0
    },
    {
      template: 'level1-template-1',
      generatedContent: 'Hello Sarah, today we will read about a brave knight. The knight likes to explore in the enchanted forest.',
      variables: { '{user name}': 'Sarah', '{character}': 'a brave knight', '{action}': 'explore', '{setting}': 'the enchanted forest' },
      level: 1
    },
    {
      template: 'level2-template-1',
      generatedContent: 'Alex, meet Luna the scientist who lives in a secret laboratory. Luna has a special telescope that helps them discover new planets.',
      variables: { '{user name}': 'Alex', '{character}': 'Luna the scientist', '{setting}': 'a secret laboratory', '{object}': 'telescope', '{action}': 'discover new planets' },
      level: 2
    }
  ];

  static async runContentQualityTests(): Promise<ContentQualityTestResult> {
    const issues: ContentQualityIssue[] = [];
    const criticalIssues: string[] = [];

    // Test template variable completion
    const templateResults = await this.testTemplateVariableCompletion();
    issues.push(...templateResults.issues);
    if (templateResults.criticalIssues.length > 0) {
      criticalIssues.push(...templateResults.criticalIssues);
    }

    // Test story quality consistency
    const storyQualityResults = await this.testStoryQualityConsistency();
    issues.push(...storyQualityResults.issues);

    // Test educational value alignment
    const educationalResults = await this.testEducationalValueAlignment();
    issues.push(...educationalResults.issues);

    // Test age appropriateness
    const ageResults = await this.testAgeAppropriateness();
    issues.push(...ageResults.issues);

    // Test readability
    const readabilityResults = await this.testReadability();
    issues.push(...readabilityResults.issues);

    // Test vocabulary level accuracy
    const vocabularyResults = await this.testVocabularyLevelAccuracy();
    issues.push(...vocabularyResults.issues);
    if (vocabularyResults.criticalIssues.length > 0) {
      criticalIssues.push(...vocabularyResults.criticalIssues);
    }

    // Calculate metrics
    const metrics: ContentQualityMetrics = {
      templateVariableCompletion: templateResults.score,
      storyQualityConsistency: storyQualityResults.score,
      educationalValueAlignment: educationalResults.score,
      ageAppropriatenessScore: ageResults.score,
      readabilityScore: readabilityResults.score,
      vocabularyLevelAccuracy: vocabularyResults.score
    };

    const educationalEffectiveness = this.calculateEducationalEffectiveness(metrics);
    const overallScore = this.calculateOverallScore(metrics);
    const passed = overallScore >= 85 && criticalIssues.length === 0 && educationalEffectiveness >= 80;

    return {
      testName: 'Content Quality Assessment',
      passed,
      failed: !passed,
      score: overallScore,
      issues,
      metrics,
      educationalEffectiveness,
      criticalIssues
    };
  }

  private static async testTemplateVariableCompletion(): Promise<{
    issues: ContentQualityIssue[];
    criticalIssues: string[];
    score: number;
  }> {
    const issues: ContentQualityIssue[] = [];
    const criticalIssues: string[] = [];
    let totalTests = 0;
    let passedTests = 0;

    for (const story of this.mockGeneratedStories) {
      const template = this.mockTemplates.find(t => t.id === story.template);
      if (!template) continue;

      totalTests++;

      // Check if all template variables are replaced
      const unreplacedVariables = this.findUnreplacedVariables(story.generatedContent, template.variables);
      
      if (unreplacedVariables.length === 0) {
        passedTests++;
      } else {
        const severity = unreplacedVariables.includes('{user name}') ? 'critical' : 'high';
        issues.push({
          category: 'template',
          severity,
          description: `Template variables not replaced: ${unreplacedVariables.join(', ')}`,
          element: 'template.variableReplacement',
          affectedContent: story.generatedContent,
          recommendedAction: 'Ensure all template variables are properly replaced with appropriate values',
          educationalImpact: severity === 'critical' ? 'high' : 'medium'
        });

        if (severity === 'critical') {
          criticalIssues.push(`Critical template variable '{user name}' not replaced in ${story.template}`);
        }
      }

      // Check variable content quality
      const variableQualityIssues = this.validateVariableContent(story.variables, template.level);
      issues.push(...variableQualityIssues);

      // Check for placeholder text
      const hasPlaceholders = this.detectPlaceholderText(story.generatedContent);
      if (hasPlaceholders.found) {
        issues.push({
          category: 'template',
          severity: 'high',
          description: 'Placeholder text detected in generated story',
          element: 'template.placeholders',
          affectedContent: hasPlaceholders.examples.join(', '),
          recommendedAction: 'Replace placeholder text with appropriate content',
          educationalImpact: 'high'
        });
      }
    }

    const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    return { issues, criticalIssues, score };
  }

  private static async testStoryQualityConsistency(): Promise<{
    issues: ContentQualityIssue[];
    score: number;
  }> {
    const issues: ContentQualityIssue[] = [];
    let totalScore = 0;
    let storyCount = 0;

    for (const story of this.mockGeneratedStories) {
      storyCount++;
      let storyScore = 100;

      // Test sentence structure
      const sentenceStructure = this.analyzeSentenceStructure(story.generatedContent, story.level);
      if (!sentenceStructure.isAppropriate) {
        storyScore -= 25;
        issues.push({
          category: 'story',
          severity: 'medium',
          description: `Sentence structure not appropriate for level ${story.level}`,
          element: 'story.sentenceStructure',
          affectedContent: story.generatedContent,
          recommendedAction: 'Adjust sentence complexity to match reading level',
          educationalImpact: 'medium'
        });
      }

      // Test narrative flow
      const narrativeFlow = this.analyzeNarrativeFlow(story.generatedContent);
      if (!narrativeFlow.isCoherent) {
        storyScore -= 20;
        issues.push({
          category: 'story',
          severity: 'medium',
          description: 'Story lacks coherent narrative flow',
          element: 'story.narrativeFlow',
          affectedContent: story.generatedContent,
          recommendedAction: 'Improve story structure and logical progression',
          educationalImpact: 'medium'
        });
      }

      // Test engagement factors
      const engagement = this.analyzeEngagementFactors(story.generatedContent, story.level);
      if (engagement.score < 70) {
        storyScore -= 15;
        issues.push({
          category: 'story',
          severity: 'low',
          description: `Low engagement score: ${engagement.score}%`,
          element: 'story.engagement',
          affectedContent: story.generatedContent,
          recommendedAction: 'Add more engaging elements appropriate for the reading level',
          educationalImpact: 'low'
        });
      }

      // Test character development
      const characterDevelopment = this.analyzeCharacterDevelopment(story.generatedContent, story.variables);
      if (!characterDevelopment.isAdequate) {
        storyScore -= 10;
        issues.push({
          category: 'story',
          severity: 'low',
          description: 'Limited character development in story',
          element: 'story.characterDevelopment',
          affectedContent: story.generatedContent,
          recommendedAction: 'Enhance character description and development',
          educationalImpact: 'low'
        });
      }

      totalScore += Math.max(0, storyScore);
    }

    const averageScore = storyCount > 0 ? totalScore / storyCount : 0;
    return { issues, score: averageScore };
  }

  private static async testEducationalValueAlignment(): Promise<{
    issues: ContentQualityIssue[];
    score: number;
  }> {
    const issues: ContentQualityIssue[] = [];
    let totalAlignment = 0;
    let templateCount = 0;

    for (const template of this.mockTemplates) {
      templateCount++;
      let alignmentScore = 100;

      // Check if story meets educational goals
      const story = this.mockGeneratedStories.find(s => s.template === template.id);
      if (!story) continue;

      for (const goal of template.educationalGoals) {
        const meetsGoal = this.checkEducationalGoal(story.generatedContent, goal, template.level);
        if (!meetsGoal.achieved) {
          alignmentScore -= 100 / template.educationalGoals.length;
          issues.push({
            category: 'educational',
            severity: 'medium',
            description: `Educational goal not met: ${goal}`,
            element: 'educational.goalAlignment',
            affectedContent: story.generatedContent,
            recommendedAction: meetsGoal.recommendation,
            educationalImpact: 'high'
          });
        }
      }

      // Check vocabulary level consistency
      const vocabularyConsistency = this.checkVocabularyConsistency(story.generatedContent, template.level);
      if (!vocabularyConsistency.isConsistent) {
        alignmentScore -= 20;
        issues.push({
          category: 'educational',
          severity: 'high',
          description: `Vocabulary level inconsistent with level ${template.level}`,
          element: 'educational.vocabularyLevel',
          affectedContent: vocabularyConsistency.problematicWords.join(', '),
          recommendedAction: 'Adjust vocabulary to match target reading level',
          educationalImpact: 'high'
        });
      }

      totalAlignment += Math.max(0, alignmentScore);
    }

    const averageAlignment = templateCount > 0 ? totalAlignment / templateCount : 0;
    return { issues, score: averageAlignment };
  }

  private static async testAgeAppropriateness(): Promise<{
    issues: ContentQualityIssue[];
    score: number;
  }> {
    const issues: ContentQualityIssue[] = [];
    let totalScore = 0;
    let storyCount = 0;

    for (const story of this.mockGeneratedStories) {
      storyCount++;
      let appropriatenessScore = 100;

      // Check content appropriateness for children
      const contentCheck = this.checkContentAppropriateness(story.generatedContent);
      if (!contentCheck.isAppropriate) {
        appropriatenessScore -= 50;
        issues.push({
          category: 'appropriateness',
          severity: 'critical',
          description: 'Content contains inappropriate material for children',
          element: 'content.appropriateness',
          affectedContent: contentCheck.concerningContent.join(', '),
          recommendedAction: 'Remove or replace inappropriate content',
          educationalImpact: 'high'
        });
      }

      // Check emotional appropriateness
      const emotionalCheck = this.checkEmotionalAppropriateness(story.generatedContent, story.level);
      if (!emotionalCheck.isAppropriate) {
        appropriatenessScore -= 25;
        issues.push({
          category: 'appropriateness',
          severity: 'medium',
          description: 'Content may be emotionally inappropriate for target age group',
          element: 'content.emotionalAppropriateness',
          affectedContent: story.generatedContent,
          recommendedAction: 'Adjust emotional content for age group',
          educationalImpact: 'medium'
        });
      }

      // Check complexity appropriateness
      const complexityCheck = this.checkComplexityAppropriateness(story.generatedContent, story.level);
      if (!complexityCheck.isAppropriate) {
        appropriatenessScore -= 15;
        issues.push({
          category: 'appropriateness',
          severity: 'low',
          description: 'Content complexity may not match target reading level',
          element: 'content.complexity',
          affectedContent: story.generatedContent,
          recommendedAction: 'Adjust content complexity to match reading level',
          educationalImpact: 'medium'
        });
      }

      totalScore += Math.max(0, appropriatenessScore);
    }

    const averageScore = storyCount > 0 ? totalScore / storyCount : 0;
    return { issues, score: averageScore };
  }

  private static async testReadability(): Promise<{
    issues: ContentQualityIssue[];
    score: number;
  }> {
    const issues: ContentQualityIssue[] = [];
    let totalReadability = 0;
    let storyCount = 0;

    for (const story of this.mockGeneratedStories) {
      storyCount++;
      const readabilityMetrics = this.calculateReadabilityMetrics(story.generatedContent);
      
      let readabilityScore = 100;

      // Check sentence length appropriateness
      if (readabilityMetrics.averageSentenceLength > this.getMaxSentenceLength(story.level)) {
        readabilityScore -= 30;
        issues.push({
          category: 'accessibility',
          severity: 'medium',
          description: `Average sentence length (${readabilityMetrics.averageSentenceLength.toFixed(1)} words) too long for level ${story.level}`,
          element: 'readability.sentenceLength',
          affectedContent: story.generatedContent,
          recommendedAction: 'Shorten sentences to improve readability',
          educationalImpact: 'medium'
        });
      }

      // Check syllable complexity
      if (readabilityMetrics.averageSyllablesPerWord > this.getMaxSyllables(story.level)) {
        readabilityScore -= 25;
        issues.push({
          category: 'accessibility',
          severity: 'medium',
          description: `Word complexity too high for level ${story.level}`,
          element: 'readability.wordComplexity',
          affectedContent: story.generatedContent,
          recommendedAction: 'Use simpler words appropriate for reading level',
          educationalImpact: 'high'
        });
      }

      // Check reading grade level
      if (readabilityMetrics.gradeLevel > story.level + 1) {
        readabilityScore -= 20;
        issues.push({
          category: 'accessibility',
          severity: 'high',
          description: `Content reading level (${readabilityMetrics.gradeLevel}) exceeds target level (${story.level})`,
          element: 'readability.gradeLevel',
          affectedContent: story.generatedContent,
          recommendedAction: 'Simplify language to match target reading level',
          educationalImpact: 'high'
        });
      }

      totalReadability += Math.max(0, readabilityScore);
    }

    const averageReadability = storyCount > 0 ? totalReadability / storyCount : 0;
    return { issues, score: averageReadability };
  }

  private static async testVocabularyLevelAccuracy(): Promise<{
    issues: ContentQualityIssue[];
    criticalIssues: string[];
    score: number;
  }> {
    const issues: ContentQualityIssue[] = [];
    const criticalIssues: string[] = [];
    let totalAccuracy = 0;
    let storyCount = 0;

    for (const story of this.mockGeneratedStories) {
      storyCount++;
      const vocabularyAnalysis = this.analyzeVocabularyLevel(story.generatedContent, story.level);
      
      let accuracyScore = 100;

      // Check for words above reading level
      if (vocabularyAnalysis.wordsAboveLevel.length > 0) {
        const severity = vocabularyAnalysis.wordsAboveLevel.length > 3 ? 'critical' : 'high';
        accuracyScore -= vocabularyAnalysis.wordsAboveLevel.length * 10;
        
        issues.push({
          category: 'educational',
          severity,
          description: `${vocabularyAnalysis.wordsAboveLevel.length} words above target reading level`,
          element: 'vocabulary.levelAccuracy',
          affectedContent: vocabularyAnalysis.wordsAboveLevel.join(', '),
          recommendedAction: 'Replace advanced words with level-appropriate alternatives',
          educationalImpact: 'high'
        });

        if (severity === 'critical') {
          criticalIssues.push(`Story for level ${story.level} contains too many advanced words`);
        }
      }

      // Check for inappropriate sight words
      if (vocabularyAnalysis.inappropriateSightWords.length > 0) {
        accuracyScore -= 20;
        issues.push({
          category: 'educational',
          severity: 'medium',
          description: 'Using sight words inappropriate for reading level',
          element: 'vocabulary.sightWords',
          affectedContent: vocabularyAnalysis.inappropriateSightWords.join(', '),
          recommendedAction: 'Use sight words appropriate for the target level',
          educationalImpact: 'medium'
        });
      }

      // Check vocabulary diversity
      if (vocabularyAnalysis.diversityScore < 60) {
        accuracyScore -= 15;
        issues.push({
          category: 'educational',
          severity: 'low',
          description: `Low vocabulary diversity: ${vocabularyAnalysis.diversityScore}%`,
          element: 'vocabulary.diversity',
          affectedContent: story.generatedContent,
          recommendedAction: 'Introduce more varied vocabulary within appropriate level',
          educationalImpact: 'low'
        });
      }

      totalAccuracy += Math.max(0, accuracyScore);
    }

    const averageAccuracy = storyCount > 0 ? totalAccuracy / storyCount : 0;
    return { issues, criticalIssues, score: averageAccuracy };
  }

  // Helper methods for content analysis
  private static findUnreplacedVariables(content: string, variables: string[]): string[] {
    return variables.filter(variable => content.includes(variable));
  }

  private static validateVariableContent(variables: Record<string, string>, level: number) {
    const issues: ContentQualityIssue[] = [];
    
    for (const [variable, value] of Object.entries(variables)) {
      if (!value || value.trim().length === 0) {
        issues.push({
          category: 'template',
          severity: 'high',
          description: `Empty value for variable ${variable}`,
          element: 'template.variableContent',
          affectedContent: variable,
          recommendedAction: 'Provide appropriate content for all template variables',
          educationalImpact: 'medium'
        });
      }
    }

    return issues;
  }

  private static detectPlaceholderText(content: string): { found: boolean; examples: string[] } {
    const placeholderPatterns = [
      /\[placeholder\]/gi,
      /\{.*\}/g,
      /TODO/gi,
      /FIXME/gi,
      /\[.*\]/g
    ];

    const examples: string[] = [];
    let found = false;

    for (const pattern of placeholderPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        found = true;
        examples.push(...matches);
      }
    }

    return { found, examples };
  }

  private static analyzeSentenceStructure(content: string, level: number): { isAppropriate: boolean } {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const maxWordsPerSentence = [8, 12, 16, 20, 25][level] || 25;
    
    const appropriateSentences = sentences.filter(sentence => {
      const wordCount = sentence.trim().split(/\s+/).length;
      return wordCount <= maxWordsPerSentence;
    });

    return { isAppropriate: appropriateSentences.length / sentences.length >= 0.8 };
  }

  private static analyzeNarrativeFlow(content: string): { isCoherent: boolean } {
    // Simplified coherence check
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return { isCoherent: sentences.length >= 2 && sentences.length <= 10 };
  }

  private static analyzeEngagementFactors(content: string, level: number): { score: number } {
    let score = 50; // Base score
    
    // Check for questions
    if (content.includes('?')) score += 10;
    
    // Check for exclamations
    if (content.includes('!')) score += 10;
    
    // Check for direct address
    if (content.toLowerCase().includes('you') || content.toLowerCase().includes('your')) score += 15;
    
    // Check for action words
    const actionWords = ['run', 'jump', 'play', 'explore', 'discover', 'adventure'];
    if (actionWords.some(word => content.toLowerCase().includes(word))) score += 15;

    return { score: Math.min(100, score) };
  }

  private static analyzeCharacterDevelopment(content: string, variables: Record<string, string>): { isAdequate: boolean } {
    const hasCharacter = Object.keys(variables).some(key => key.includes('character')) || 
                        content.toLowerCase().includes('character');
    const hasDescription = content.split(' ').length > 10;
    
    return { isAdequate: hasCharacter && hasDescription };
  }

  private static checkEducationalGoal(content: string, goal: string, level: number): { achieved: boolean; recommendation: string } {
    const goalChecks: Record<string, (content: string) => boolean> = {
      'sight words': (content) => {
        const sightWords = ['the', 'and', 'a', 'to', 'said', 'you', 'is', 'of', 'in', 'it'];
        return sightWords.some(word => content.toLowerCase().includes(word));
      },
      'simple sentences': (content) => {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.every(s => s.trim().split(/\s+/).length <= 8);
      },
      'animal recognition': (content) => {
        const animals = ['cat', 'dog', 'bird', 'fish', 'rabbit'];
        return animals.some(animal => content.toLowerCase().includes(animal));
      },
      'character development': (content) => content.toLowerCase().includes('character'),
      'action words': (content) => {
        const actionWords = ['run', 'jump', 'walk', 'play', 'eat', 'sleep'];
        return actionWords.some(word => content.toLowerCase().includes(word));
      }
    };

    const checker = goalChecks[goal];
    const achieved = checker ? checker(content) : true;

    const recommendations: Record<string, string> = {
      'sight words': 'Include more common sight words appropriate for the reading level',
      'simple sentences': 'Break down complex sentences into simpler structures',
      'animal recognition': 'Include animals that children can easily recognize and relate to',
      'character development': 'Add more descriptive details about the character',
      'action words': 'Include action verbs to make the story more engaging'
    };

    return {
      achieved,
      recommendation: recommendations[goal] || `Ensure content supports the educational goal: ${goal}`
    };
  }

  private static checkVocabularyConsistency(content: string, level: number): { isConsistent: boolean; problematicWords: string[] } {
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const problematicWords: string[] = [];

    // Define difficulty levels for words (simplified)
    const advancedWords = ['magnificent', 'extraordinary', 'complicated', 'mysterious', 'adventure'];
    
    for (const word of words) {
      if (level < 2 && advancedWords.includes(word)) {
        problematicWords.push(word);
      }
    }

    return {
      isConsistent: problematicWords.length === 0,
      problematicWords
    };
  }

  private static checkContentAppropriateness(content: string): { isAppropriate: boolean; concerningContent: string[] } {
    const inappropriateWords = ['violence', 'scary', 'dangerous', 'hurt', 'bad'];
    const concerningContent = inappropriateWords.filter(word => 
      content.toLowerCase().includes(word)
    );

    return {
      isAppropriate: concerningContent.length === 0,
      concerningContent
    };
  }

  private static checkEmotionalAppropriateness(content: string, level: number): { isAppropriate: boolean } {
    const negativeEmotions = ['sad', 'angry', 'scared', 'worried', 'frustrated'];
    const hasNegativeEmotions = negativeEmotions.some(emotion => 
      content.toLowerCase().includes(emotion)
    );

    // Lower levels should have more positive content
    return { isAppropriate: level > 1 || !hasNegativeEmotions };
  }

  private static checkComplexityAppropriateness(content: string, level: number): { isAppropriate: boolean } {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const averageWordsPerSentence = sentences.reduce((sum, sentence) => 
      sum + sentence.trim().split(/\s+/).length, 0
    ) / sentences.length;

    const maxWords = [6, 10, 14, 18, 22][level] || 22;
    return { isAppropriate: averageWordsPerSentence <= maxWords };
  }

  private static calculateReadabilityMetrics(content: string) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    const averageSentenceLength = words.length / sentences.length;
    const averageSyllablesPerWord = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;
    
    // Simplified grade level calculation
    const gradeLevel = (0.39 * averageSentenceLength) + (11.8 * averageSyllablesPerWord) - 15.59;

    return {
      averageSentenceLength,
      averageSyllablesPerWord,
      gradeLevel: Math.max(0, gradeLevel)
    };
  }

  private static countSyllables(word: string): number {
    // Simplified syllable counting
    return Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length);
  }

  private static getMaxSentenceLength(level: number): number {
    return [8, 12, 16, 20, 25][level] || 25;
  }

  private static getMaxSyllables(level: number): number {
    return [1.2, 1.4, 1.6, 1.8, 2.0][level] || 2.0;
  }

  private static analyzeVocabularyLevel(content: string, level: number) {
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = [...new Set(words)];
    
    // Simplified vocabulary analysis
    const advancedWords = words.filter(word => word.length > 7);
    const wordsAboveLevel = level < 2 ? advancedWords : [];
    
    const inappropriateSightWords: string[] = [];
    const diversityScore = (uniqueWords.length / words.length) * 100;

    return {
      wordsAboveLevel,
      inappropriateSightWords,
      diversityScore
    };
  }

  private static calculateEducationalEffectiveness(metrics: ContentQualityMetrics): number {
    const weights = {
      templateVariableCompletion: 0.15,
      storyQualityConsistency: 0.20,
      educationalValueAlignment: 0.25,
      ageAppropriatenessScore: 0.15,
      readabilityScore: 0.15,
      vocabularyLevelAccuracy: 0.10
    };

    return Object.entries(weights).reduce((total, [metric, weight]) => {
      return total + (metrics[metric as keyof ContentQualityMetrics] * weight);
    }, 0);
  }

  private static calculateOverallScore(metrics: ContentQualityMetrics): number {
    return Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
  }

  static generateContentQualityReport(result: ContentQualityTestResult): string {
    let report = `# Content Quality Assessment Report\n\n`;
    report += `**Test:** ${result.testName}\n`;
    report += `**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `**Overall Score:** ${result.score.toFixed(1)}%\n`;
    report += `**Educational Effectiveness:** ${result.educationalEffectiveness.toFixed(1)}%\n\n`;

    if (result.criticalIssues.length > 0) {
      report += `## 🚨 Critical Issues\n`;
      result.criticalIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }

    report += `## Quality Metrics\n`;
    report += `- **Template Variable Completion:** ${result.metrics.templateVariableCompletion.toFixed(1)}%\n`;
    report += `- **Story Quality Consistency:** ${result.metrics.storyQualityConsistency.toFixed(1)}%\n`;
    report += `- **Educational Value Alignment:** ${result.metrics.educationalValueAlignment.toFixed(1)}%\n`;
    report += `- **Age Appropriateness:** ${result.metrics.ageAppropriatenessScore.toFixed(1)}%\n`;
    report += `- **Readability Score:** ${result.metrics.readabilityScore.toFixed(1)}%\n`;
    report += `- **Vocabulary Level Accuracy:** ${result.metrics.vocabularyLevelAccuracy.toFixed(1)}%\n\n`;

    if (result.issues.length > 0) {
      report += `## Issues by Educational Impact\n\n`;
      
      const grouped = result.issues.reduce((acc, issue) => {
        if (!acc[issue.educationalImpact]) acc[issue.educationalImpact] = [];
        acc[issue.educationalImpact].push(issue);
        return acc;
      }, {} as Record<string, ContentQualityIssue[]>);

      ['high', 'medium', 'low', 'none'].forEach(impact => {
        if (grouped[impact]?.length > 0) {
          report += `### ${impact.toUpperCase()} EDUCATIONAL IMPACT (${grouped[impact].length})\n`;
          grouped[impact].forEach(issue => {
            const severity = issue.severity === 'critical' ? '🔴' : 
                            issue.severity === 'high' ? '🟠' : 
                            issue.severity === 'medium' ? '🟡' : '🟢';
            report += `${severity} **${issue.category.toUpperCase()} - ${issue.element}**\n`;
            report += `${issue.description}\n`;
            report += `*Content:* ${issue.affectedContent.substring(0, 100)}${issue.affectedContent.length > 100 ? '...' : ''}\n`;
            report += `*Action:* ${issue.recommendedAction}\n\n`;
          });
        }
      });
    }

    return report;
  }
}