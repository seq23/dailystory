// ============= DATA FLOW OPTIMIZER =============
// Phase 5: Optimize data structures and prevent data loss during function calls
// Ensures efficient and reliable data flow between all image generation services

import { dataFlowValidator } from './DataFlowValidator.js';

export class DataFlowOptimizer {
  constructor() {
    this.optimizationMetrics = new Map();
    this.dataTransforms = [];
  }

  // ============= ORCHESTRATOR OPTIMIZATION =============

  // Optimize input for orchestrator processing
  optimizeOrchestratorInput(rawInput) {
    console.log('⚡ Phase 5: Optimizing orchestrator input structure');
    
    const startTime = Date.now();
    
    // Validate and normalize input
    const validation = dataFlowValidator.validateOrchestratorInput(rawInput);
    if (!validation.isValid) {
      throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
    }

    const optimizedInput = {
      ...validation.normalizedInput,
      
      // Add optimization metadata
      _optimization: {
        version: '5.0',
        optimizedAt: new Date().toISOString(),
        originalKeys: Object.keys(rawInput).length,
        optimizedKeys: Object.keys(validation.normalizedInput).length
      },
      
      // Optimize userInfo for better processing
      userInfo: this.optimizeUserInfo(validation.normalizedInput.userInfo),
      
      // Optimize avatarIdentity for consistency
      avatarIdentity: this.optimizeAvatarIdentity(validation.normalizedInput.avatarIdentity),
      
      // Optimize pageText for AI processing
      pageText: this.optimizePageText(validation.normalizedInput.pageText)
    };

    // Record optimization metrics
    this.recordOptimization('orchestrator-input', {
      processingTime: Date.now() - startTime,
      inputSize: JSON.stringify(rawInput).length,
      outputSize: JSON.stringify(optimizedInput).length,
      compressionRatio: JSON.stringify(optimizedInput).length / JSON.stringify(rawInput).length
    });

    console.log('✅ Phase 5: Orchestrator input optimized');
    return optimizedInput;
  }

  // Optimize output from orchestrator
  optimizeOrchestratorOutput(rawOutput, inputMetadata = {}) {
    console.log('⚡ Phase 5: Optimizing orchestrator output structure');
    
    const startTime = Date.now();
    
    // Validate output structure
    const validation = dataFlowValidator.validateOrchestratorOutput(rawOutput);
    
    const optimizedOutput = {
      ...rawOutput,
      
      // Ensure consistent metadata structure
      metadata: {
        ...rawOutput.metadata,
        dataFlowVersion: '5.0',
        optimized: true,
        processingChain: this.buildProcessingChain(inputMetadata),
        outputOptimizedAt: new Date().toISOString()
      },
      
      // Add performance metrics if available
      performance: this.extractPerformanceMetrics(rawOutput),
      
      // Add data flow validation results
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
        structure: validation.outputStructure
      }
    };

    // Record optimization
    this.recordOptimization('orchestrator-output', {
      processingTime: Date.now() - startTime,
      validationPassed: validation.isValid,
      warningCount: validation.warnings?.length || 0
    });

    console.log('✅ Phase 5: Orchestrator output optimized');
    return optimizedOutput;
  }

  // ============= TEMPLATE SERVICE OPTIMIZATION =============

  // Optimize input for template services
  optimizeTemplateServiceInput(rawInput, serviceName) {
    console.log(`⚡ Phase 5: Optimizing ${serviceName} input structure`);
    
    const startTime = Date.now();
    
    // Validate template service input
    const validation = dataFlowValidator.validateTemplateServiceInput(rawInput, serviceName);
    if (!validation.isValid) {
      throw new Error(`${serviceName} input validation failed: ${validation.errors.join(', ')}`);
    }

    const optimizedInput = {
      ...validation.normalizedInput,
      
      // Add service-specific optimization metadata
      _serviceOptimization: {
        targetService: serviceName,
        optimizedAt: new Date().toISOString(),
        complexityValidated: true
      },
      
      // Optimize storyText for template processing
      storyText: this.optimizeStoryTextForTemplates(validation.normalizedInput.storyText),
      
      // Ensure templateComplexity is properly set
      templateComplexity: this.validateTemplateComplexity(
        validation.normalizedInput.templateComplexity, 
        serviceName
      )
    };

    this.recordOptimization(`${serviceName}-input`, {
      processingTime: Date.now() - startTime,
      complexityLevel: optimizedInput.templateComplexity
    });

    console.log(`✅ Phase 5: ${serviceName} input optimized`);
    return optimizedInput;
  }

  // Optimize template service output
  optimizeTemplateServiceOutput(rawOutput, serviceName, inputData = {}) {
    console.log(`⚡ Phase 5: Optimizing ${serviceName} output structure`);
    
    const startTime = Date.now();
    
    // Validate template service output
    const validation = dataFlowValidator.validateTemplateServiceOutput(rawOutput, serviceName);
    
    const optimizedOutput = {
      ...rawOutput,
      
      // Ensure consistent structure
      tier: rawOutput.tier || this.inferTierFromService(serviceName),
      templateType: rawOutput.templateType || 'template-generated',
      
      // Add optimization metadata
      optimization: {
        service: serviceName,
        optimizedAt: new Date().toISOString(),
        inputPreserved: this.checkInputPreservation(inputData, rawOutput),
        validationPassed: validation.isValid
      },
      
      // Normalize prompt structure
      promptData: {
        positive: rawOutput.positivePrompt || rawOutput.prompt,
        negative: rawOutput.negativePrompt || '',
        templateType: rawOutput.templateType
      }
    };

    this.recordOptimization(`${serviceName}-output`, {
      processingTime: Date.now() - startTime,
      hasImageURL: !!rawOutput.imageURL,
      validationPassed: validation.isValid
    });

    console.log(`✅ Phase 5: ${serviceName} output optimized`);
    return optimizedOutput;
  }

  // ============= AI SCENE CREATOR OPTIMIZATION =============

  // Optimize AI scene creator input
  optimizeAISceneCreatorInput(rawInput) {
    console.log('⚡ Phase 5: Optimizing AI scene creator input structure');
    
    const startTime = Date.now();
    
    // Validate AI scene creator input
    const validation = dataFlowValidator.validateAISceneCreatorInput(rawInput);
    if (!validation.isValid) {
      throw new Error(`AI scene creator input validation failed: ${validation.errors.join(', ')}`);
    }

    const optimizedInput = {
      ...validation.normalizedInput,
      
      // Optimize pageText for AI processing
      pageText: this.optimizePageTextForAI(validation.normalizedInput.pageText),
      
      // Ensure enhancement request is properly structured
      enhancementRequest: {
        ...validation.normalizedInput.enhancementRequest,
        optimizedForAI: true,
        requestTimestamp: new Date().toISOString()
      }
    };

    this.recordOptimization('ai-scene-creator-input', {
      processingTime: Date.now() - startTime,
      textLength: optimizedInput.pageText.length
    });

    console.log('✅ Phase 5: AI scene creator input optimized');
    return optimizedInput;
  }

  // Optimize AI scene creator output
  optimizeAISceneCreatorOutput(rawOutput) {
    console.log('⚡ Phase 5: Optimizing AI scene creator output structure');
    
    const startTime = Date.now();
    
    // Validate AI scene creator output
    const validation = dataFlowValidator.validateAISceneCreatorOutput(rawOutput);
    
    const optimizedOutput = {
      ...rawOutput,
      
      // Ensure enhanced schema is properly structured
      enhancedSchema: rawOutput.enhancedSchema ? {
        ...rawOutput.enhancedSchema,
        
        // Optimize schema components
        primaryScene: this.optimizePrimaryScene(rawOutput.enhancedSchema.primaryScene),
        visualElements: this.optimizeVisualElements(rawOutput.enhancedSchema.visualElements),
        characterDetails: this.optimizeCharacterDetails(rawOutput.enhancedSchema.characterDetails),
        
        // Add optimization metadata
        _schemaOptimization: {
          optimizedAt: new Date().toISOString(),
          version: '5.0'
        }
      } : null,
      
      // Add validation results
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings
      }
    };

    this.recordOptimization('ai-scene-creator-output', {
      processingTime: Date.now() - startTime,
      hasEnhancedSchema: !!rawOutput.enhancedSchema,
      validationPassed: validation.isValid
    });

    console.log('✅ Phase 5: AI scene creator output optimized');
    return optimizedOutput;
  }

  // ============= SPECIFIC OPTIMIZATION FUNCTIONS =============

  // Optimize userInfo structure
  optimizeUserInfo(userInfo) {
    if (!userInfo) return null;
    
    return {
      ...userInfo,
      
      // Ensure consistent data types
      age: userInfo.age ? parseInt(userInfo.age) : null,
      interests: Array.isArray(userInfo.interests) ? userInfo.interests : [],
      
      // Optimize difficulty mapping
      difficulty: this.normalizeDifficulty(userInfo.difficulty),
      
      // Add computed fields for efficiency
      complexity: this.computeUserComplexity(userInfo),
      hasCustomization: !!(userInfo.interests?.length > 0 || userInfo.specialRequest)
    };
  }

  // Optimize avatarIdentity structure
  optimizeAvatarIdentity(avatarIdentity) {
    if (!avatarIdentity) return null;
    
    return {
      ...avatarIdentity,
      
      // Add completeness score
      completeness: this.calculateAvatarCompleteness(avatarIdentity),
      
      // Optimize cultural data
      culturalProfile: this.buildCulturalProfile(avatarIdentity),
      
      // Add validation flags
      isComplete: this.isAvatarComplete(avatarIdentity),
      hasVisualTraits: !!(avatarIdentity.skinTone || avatarIdentity.hairColor || avatarIdentity.eyeColor)
    };
  }

  // Optimize pageText for processing
  optimizePageText(pageText) {
    if (!pageText) return '';
    
    // Clean and normalize text
    let optimized = pageText
      .trim()
      .replace(/\\s+/g, ' ')              // Normalize whitespace
      .replace(/[^\\w\\s.,!?'-]/g, '')     // Remove special characters
      .substring(0, 2000);               // Limit length for performance
    
    // Add text metrics for processing optimization
    return optimized;
  }

  // Optimize storyText specifically for template processing
  optimizeStoryTextForTemplates(storyText) {
    if (!storyText) return '';
    
    // Template-specific optimization
    return storyText
      .trim()
      .substring(0, 1000)  // Templates need shorter text
      .replace(/[^\\w\\s.,!?'-]/g, '');
  }

  // Optimize pageText for AI processing
  optimizePageTextForAI(pageText) {
    if (!pageText) return '';
    
    // AI-specific optimization (can handle longer text)
    return pageText
      .trim()
      .substring(0, 3000)  // AI can handle more context
      .replace(/\\s+/g, ' ');
  }

  // ============= UTILITY FUNCTIONS =============

  // Normalize difficulty levels
  normalizeDifficulty(difficulty) {
    const difficultyMap = {
      'easy': 'easy',
      'medium': 'medium', 
      'hard': 'hard',
      'k': 'easy',
      '1': 'easy',
      '2': 'medium',
      '3': 'medium',
      '4': 'hard',
      '5': 'hard'
    };
    
    return difficultyMap[String(difficulty).toLowerCase()] || 'medium';
  }

  // Compute user complexity for routing
  computeUserComplexity(userInfo) {
    if (!userInfo) return 'basic';
    
    let complexity = 0;
    
    if (userInfo.age && userInfo.age > 8) complexity += 1;
    if (userInfo.interests && userInfo.interests.length > 2) complexity += 1;
    if (userInfo.specialRequest) complexity += 1;
    if (userInfo.difficulty === 'hard') complexity += 2;
    
    if (complexity >= 3) return 'advanced';
    if (complexity >= 1) return 'intermediate';
    return 'basic';
  }

  // Calculate avatar completeness score
  calculateAvatarCompleteness(avatarIdentity) {
    if (!avatarIdentity) return 0;
    
    const fields = ['skinTone', 'hairColor', 'eyeColor', 'nativeLanguage', 'culturalBackground'];
    const presentFields = fields.filter(field => avatarIdentity[field]);
    
    return (presentFields.length / fields.length) * 100;
  }

  // Check if avatar is complete
  isAvatarComplete(avatarIdentity) {
    return this.calculateAvatarCompleteness(avatarIdentity) >= 60;
  }

  // Build cultural profile
  buildCulturalProfile(avatarIdentity) {
    if (!avatarIdentity) return null;
    
    return {
      hasLanguage: !!avatarIdentity.nativeLanguage,
      hasCulturalBackground: !!avatarIdentity.culturalBackground,
      hasVisualTraits: !!(avatarIdentity.skinTone || avatarIdentity.hairColor),
      culturalScore: this.calculateCulturalScore(avatarIdentity)
    };
  }

  // Calculate cultural score for routing decisions
  calculateCulturalScore(avatarIdentity) {
    if (!avatarIdentity) return 0;
    
    let score = 0;
    if (avatarIdentity.nativeLanguage && avatarIdentity.nativeLanguage !== 'en') score += 2;
    if (avatarIdentity.culturalBackground) score += 2;
    if (avatarIdentity.skinTone) score += 1;
    
    return score;
  }

  // Validate template complexity for service
  validateTemplateComplexity(complexity, serviceName) {
    const validComplexities = {
      'runware-template-ab': ['A', 'B'],
      'runware-template-cd': ['C', 'D']
    };
    
    const valid = validComplexities[serviceName] || [];
    return valid.includes(complexity) ? complexity : valid[0];
  }

  // Infer tier from service name
  inferTierFromService(serviceName) {
    const tierMap = {
      'runware-template-ab': '2.5A-B',
      'runware-template-cd': '2.5C-D',
      'ai-visual-scene-creator': '1'
    };
    
    return tierMap[serviceName] || 'unknown';
  }

  // Check input preservation in output
  checkInputPreservation(inputData, outputData) {
    const criticalFields = ['sessionId', 'pageNumber', 'userInfo'];
    
    for (const field of criticalFields) {
      if (inputData[field] && !outputData[field]) {
        return false;
      }
    }
    
    return true;
  }

  // ============= OPTIMIZATION METRICS =============

  // Record optimization metrics
  recordOptimization(type, metrics) {
    const record = {
      type,
      timestamp: new Date().toISOString(),
      ...metrics
    };
    
    this.optimizationMetrics.set(`${type}-${Date.now()}`, record);
    
    // Keep only recent records (memory management)
    if (this.optimizationMetrics.size > 1000) {
      const oldestKey = this.optimizationMetrics.keys().next().value;
      this.optimizationMetrics.delete(oldestKey);
    }
  }

  // Get optimization statistics
  getOptimizationStats() {
    const records = Array.from(this.optimizationMetrics.values());
    
    return {
      totalOptimizations: records.length,
      averageProcessingTime: this.calculateAverage(records, 'processingTime'),
      optimizationsByType: this.groupBy(records, 'type'),
      recentOptimizations: records.slice(-10)
    };
  }

  // Calculate average for numeric field
  calculateAverage(records, field) {
    const values = records.map(r => r[field]).filter(v => typeof v === 'number');
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  // Group records by field
  groupBy(records, field) {
    return records.reduce((groups, record) => {
      const key = record[field];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  // Clear optimization metrics
  clearMetrics() {
    this.optimizationMetrics.clear();
    console.log('🧹 Phase 5: Optimization metrics cleared');
  }
}

// Create singleton instance
export const dataFlowOptimizer = new DataFlowOptimizer();
