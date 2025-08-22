/**
 * Validation Engine - Phase 3 Implementation
 * Pre-generation validation and quality assurance for image generation
 */

export class ValidationEngine {
  
  /**
   * Validate prompt quality before generation
   */
  static validatePromptQuality(prompt, metadata = {}) {
    console.log(`🔍 ValidationEngine - Analyzing prompt quality (${prompt.length} chars)`);
    
    const validation = {
      valid: true,
      score: 0,
      issues: [],
      recommendations: [],
      metadata: {
        length: prompt.length,
        wordCount: prompt.split(/\s+/).length,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
    
    // 1. Length validation
    const lengthCheck = this.validateLength(prompt);
    validation.score += lengthCheck.score;
    if (!lengthCheck.valid) {
      validation.valid = false;
      validation.issues.push(lengthCheck.issue);
      validation.recommendations.push(lengthCheck.recommendation);
    }
    
    // 2. Content quality validation
    const contentCheck = this.validateContent(prompt);
    validation.score += contentCheck.score;
    validation.issues.push(...contentCheck.issues);
    validation.recommendations.push(...contentCheck.recommendations);
    
    // 3. Cultural sensitivity validation
    const culturalCheck = this.validateCulturalSensitivity(prompt);
    validation.score += culturalCheck.score;
    validation.issues.push(...culturalCheck.issues);
    validation.recommendations.push(...culturalCheck.recommendations);
    
    // 4. Technical format validation
    const technicalCheck = this.validateTechnicalFormat(prompt);
    validation.score += technicalCheck.score;
    validation.issues.push(...technicalCheck.issues);
    validation.recommendations.push(...technicalCheck.recommendations);
    
    // Calculate final score (0-100)
    validation.score = Math.max(0, Math.min(100, validation.score));
    
    // Overall validation fails if score too low
    if (validation.score < 50) {
      validation.valid = false;
      validation.issues.push('Overall prompt quality score too low');
    }
    
    console.log(`📊 Prompt validation complete - Score: ${validation.score}, Valid: ${validation.valid}`);
    
    return validation;
  }
  
  /**
   * Length validation
   */
  static validateLength(prompt) {
    const length = prompt.length;
    const words = prompt.split(/\s+/).length;
    
    // Optimal ranges
    const optimalMin = 100;
    const optimalMax = 2800;
    const criticalMax = 3000;
    
    if (length > criticalMax) {
      return {
        valid: false,
        score: 0,
        issue: `Prompt too long: ${length}/${criticalMax} characters`,
        recommendation: 'Apply aggressive optimization to reduce length'
      };
    }
    
    if (length > optimalMax) {
      return {
        valid: true,
        score: 60,
        issue: `Prompt approaching limit: ${length}/${optimalMax} characters`,
        recommendation: 'Consider optimization for better performance'
      };
    }
    
    if (length < optimalMin) {
      return {
        valid: true,
        score: 70,
        issue: `Prompt may be too short: ${length} characters`,
        recommendation: 'Consider adding more descriptive details'
      };
    }
    
    return {
      valid: true,
      score: 90,
      issue: null,
      recommendation: 'Length is optimal'
    };
  }
  
  /**
   * Content quality validation
   */
  static validateContent(prompt) {
    const issues = [];
    const recommendations = [];
    let score = 80;
    
    // Check for essential elements
    const essentialElements = [
      { pattern: /character|person|child|boy|girl/i, name: 'character description' },
      { pattern: /scene|setting|room|outdoor|indoor|park|home|school/i, name: 'scene description' },
      { pattern: /illustration|style|book|digital/i, name: 'art style specification' }
    ];
    
    essentialElements.forEach(element => {
      if (!element.pattern.test(prompt)) {
        issues.push(`Missing ${element.name}`);
        recommendations.push(`Add ${element.name} for better results`);
        score -= 10;
      }
    });
    
    // Check for clarity and specificity
    const vagueWords = ['thing', 'stuff', 'something', 'somehow', 'maybe', 'perhaps'];
    const vagueCount = vagueWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(prompt)
    ).length;
    
    if (vagueCount > 2) {
      issues.push('Prompt contains vague language');
      recommendations.push('Use more specific descriptive terms');
      score -= 5;
    }
    
    // Check for contradictions
    const contradictions = [
      { patterns: [/bright|sunny/i, /dark|night/i], name: 'lighting contradiction' },
      { patterns: [/indoor|inside/i, /outdoor|outside/i], name: 'location contradiction' },
      { patterns: [/happy|joyful/i, /sad|crying/i], name: 'emotion contradiction' }
    ];
    
    contradictions.forEach(contradiction => {
      const matches = contradiction.patterns.filter(pattern => pattern.test(prompt));
      if (matches.length > 1) {
        issues.push(`Possible ${contradiction.name} detected`);
        recommendations.push(`Clarify ${contradiction.name} in prompt`);
        score -= 10;
      }
    });
    
    return { score, issues, recommendations };
  }
  
  /**
   * Cultural sensitivity validation
   */
  static validateCulturalSensitivity(prompt) {
    const issues = [];
    const recommendations = [];
    let score = 90;
    
    // Check for cultural representation
    const culturalElements = [
      /african|black|brown|asian|hispanic|latino|indigenous|native/i,
      /cultural|traditional|heritage|diverse|multicultural/i,
      /skin tone|complexion|ethnicity/i
    ];
    
    const hasCulturalContext = culturalElements.some(pattern => pattern.test(prompt));
    
    if (hasCulturalContext) {
      // Check for respectful language
      const respectfulTerms = [
        /beautiful|authentic|respectful|accurate|diverse/i,
        /natural|appropriate|culturally/i
      ];
      
      const hasRespectfulLanguage = respectfulTerms.some(pattern => pattern.test(prompt));
      
      if (!hasRespectfulLanguage) {
        issues.push('Cultural content needs respectful descriptors');
        recommendations.push('Add respectful cultural descriptors');
        score -= 15;
      }
      
      // Check for potentially problematic terms
      const problematicPatterns = [
        /exotic|primitive|savage/i,
        /stereotype|typical|standard/i
      ];
      
      problematicPatterns.forEach(pattern => {
        if (pattern.test(prompt)) {
          issues.push('Potentially problematic cultural language detected');
          recommendations.push('Use more respectful cultural descriptions');
          score -= 20;
        }
      });
    }
    
    return { score, issues, recommendations };
  }
  
  /**
   * Technical format validation
   */
  static validateTechnicalFormat(prompt) {
    const issues = [];
    const recommendations = [];
    let score = 85;
    
    // Check for technical specifications
    const technicalElements = [
      { pattern: /illustration|digital|art|style/i, name: 'art style' },
      { pattern: /lighting|light|shadow|bright|warm|soft/i, name: 'lighting specification' },
      { pattern: /quality|resolution|detailed|professional/i, name: 'quality specification' }
    ];
    
    technicalElements.forEach(element => {
      if (!element.pattern.test(prompt)) {
        recommendations.push(`Consider adding ${element.name} specification`);
        score -= 5;
      }
    });
    
    // Check for formatting issues
    if (/\s{3,}/.test(prompt)) {
      issues.push('Excessive whitespace detected');
      recommendations.push('Clean up spacing in prompt');
      score -= 5;
    }
    
    if (/[^\w\s\-.,!?;:'"()]/g.test(prompt)) {
      issues.push('Special characters detected');
      recommendations.push('Remove or replace special characters');
      score -= 10;
    }
    
    return { score, issues, recommendations };
  }
  
  /**
   * Generate validation report
   */
  static generateValidationReport(validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      overall: {
        valid: validationResult.valid,
        score: validationResult.score,
        grade: this.calculateGrade(validationResult.score)
      },
      summary: {
        totalIssues: validationResult.issues.length,
        criticalIssues: validationResult.issues.filter(issue => 
          issue.includes('too long') || issue.includes('quality score too low')
        ).length,
        recommendations: validationResult.recommendations.length
      },
      details: {
        issues: validationResult.issues,
        recommendations: validationResult.recommendations,
        metadata: validationResult.metadata
      }
    };
    
    return report;
  }
  
  /**
   * Calculate letter grade from score
   */
  static calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  
  /**
   * Auto-fix common validation issues
   */
  static autoFixPrompt(prompt, validationResult) {
    let fixed = prompt;
    
    // Fix excessive whitespace
    fixed = fixed.replace(/\s+/g, ' ').trim();
    
    // Add missing technical elements if score is low
    if (validationResult.score < 70) {
      if (!/illustration|digital|art/i.test(fixed)) {
        fixed += " professional children's book digital illustration";
      }
      
      if (!/lighting|light/i.test(fixed)) {
        fixed += " soft natural lighting";
      }
    }
    
    return fixed;
  }
}