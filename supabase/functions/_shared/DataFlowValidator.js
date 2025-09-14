// ============= DATA FLOW VALIDATOR =============
// Phase 5: Comprehensive data validation and flow optimization
// Ensures proper data structure and prevents data loss during tier transitions

export class DataFlowValidator {
  constructor() {
    this.validationHistory = new Map();
    this.dataTransitionLog = [];
  }

  // ============= INPUT VALIDATION =============
  
  // Validate orchestrator input structure
  validateOrchestratorInput(input) {
    console.log('🔍 Phase 5: Validating orchestrator input structure');
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedInput: {},
      inputStructure: this.analyzeInputStructure(input)
    };

    // Required fields validation
    const requiredFields = ['pageText', 'userInfo', 'avatarIdentity', 'sessionId'];
    
    for (const field of requiredFields) {
      if (!input[field]) {
        validation.errors.push(`Missing required field: ${field}`);
        validation.isValid = false;
      }
    }

    // Data type validation
    if (input.pageText && typeof input.pageText !== 'string') {
      validation.errors.push('pageText must be a string');
      validation.isValid = false;
    }

    if (input.userInfo && typeof input.userInfo !== 'object') {
      validation.errors.push('userInfo must be an object');
      validation.isValid = false;
    }

    if (input.avatarIdentity && typeof input.avatarIdentity !== 'object') {
      validation.errors.push('avatarIdentity must be an object');
      validation.isValid = false;
    }

    // Content validation
    if (input.pageText && input.pageText.trim().length === 0) {
      validation.errors.push('pageText cannot be empty');
      validation.isValid = false;
    }

    if (input.pageText && input.pageText.length > 5000) {
      validation.warnings.push('pageText is very long (>5000 chars), may cause performance issues');
    }

    // Normalize input structure
    validation.normalizedInput = this.normalizeOrchestratorInput(input);

    this.logValidation('orchestrator-input', validation);
    return validation;
  }

  // Validate template service input structure
  validateTemplateServiceInput(input, serviceName) {
    console.log(`🔍 Phase 5: Validating ${serviceName} input structure`);
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedInput: {},
      serviceName: serviceName
    };

    // Template-specific required fields
    const requiredFields = ['storyText', 'userInfo', 'templateComplexity'];
    
    for (const field of requiredFields) {
      if (!input[field]) {
        validation.errors.push(`Missing required field for ${serviceName}: ${field}`);
        validation.isValid = false;
      }
    }

    // Validate templateComplexity
    const validComplexities = serviceName === 'runware-template-ab' ? ['A', 'B'] : ['C', 'D'];
    if (input.templateComplexity && !validComplexities.includes(input.templateComplexity)) {
      validation.errors.push(`Invalid templateComplexity '${input.templateComplexity}' for ${serviceName}. Valid: ${validComplexities.join(', ')}`);
      validation.isValid = false;
    }

    // Normalize input for template service
    validation.normalizedInput = this.normalizeTemplateServiceInput(input);

    this.logValidation(`${serviceName}-input`, validation);
    return validation;
  }

  // Validate AI scene creator input structure  
  validateAISceneCreatorInput(input) {
    console.log('🔍 Phase 5: Validating AI scene creator input structure');
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedInput: {}
    };

    // Required fields for AI enhancement
    const requiredFields = ['pageText', 'userInfo'];
    
    for (const field of requiredFields) {
      if (!input[field]) {
        validation.errors.push(`Missing required field for AI scene creator: ${field}`);
        validation.isValid = false;
      }
    }

    // Validate enhancement request structure
    if (input.enhancementRequest && typeof input.enhancementRequest !== 'object') {
      validation.errors.push('enhancementRequest must be an object');
      validation.isValid = false;
    }

    validation.normalizedInput = this.normalizeAISceneCreatorInput(input);

    this.logValidation('ai-scene-creator-input', validation);
    return validation;
  }

  // ============= OUTPUT VALIDATION =============

  // Validate orchestrator output structure
  validateOrchestratorOutput(output) {
    console.log('🔍 Phase 5: Validating orchestrator output structure');
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      outputStructure: this.analyzeOutputStructure(output)
    };

    // Success response validation
    if (output.success) {
      if (!output.imageURL) {
        validation.errors.push('Success response missing imageURL');
        validation.isValid = false;
      }
      
      if (!output.tier) {
        validation.warnings.push('Success response missing tier information');
      }
      
      if (!output.metadata) {
        validation.warnings.push('Success response missing metadata');
      }
    } else {
      // Error response validation
      if (!output.error) {
        validation.errors.push('Error response missing error message');
        validation.isValid = false;
      }
    }

    this.logValidation('orchestrator-output', validation);
    return validation;
  }

  // Validate template service output structure
  validateTemplateServiceOutput(output, serviceName) {
    console.log(`🔍 Phase 5: Validating ${serviceName} output structure`);
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      serviceName: serviceName
    };

    if (output.success) {
      // Success response validation
      if (!output.imageURL) {
        validation.errors.push(`${serviceName} success response missing imageURL`);
        validation.isValid = false;
      }
      
      if (!output.positivePrompt && !output.prompt) {
        validation.errors.push(`${serviceName} success response missing prompt data`);
        validation.isValid = false;
      }
      
      if (!output.templateType) {
        validation.warnings.push(`${serviceName} response missing templateType`);
      }
      
      if (!output.tier) {
        validation.warnings.push(`${serviceName} response missing tier information`);
      }
    }

    this.logValidation(`${serviceName}-output`, validation);
    return validation;
  }

  // Validate AI scene creator output structure
  validateAISceneCreatorOutput(output) {
    console.log('🔍 Phase 5: Validating AI scene creator output structure');
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (output.success) {
      // Validate enhanced schema structure
      if (!output.enhancedSchema) {
        validation.errors.push('AI scene creator missing enhancedSchema');
        validation.isValid = false;
      } else {
        // Validate schema components
        const schema = output.enhancedSchema;
        
        if (!schema.primaryScene) {
          validation.warnings.push('Enhanced schema missing primaryScene');
        }
        
        if (!schema.visualElements) {
          validation.warnings.push('Enhanced schema missing visualElements');
        }
        
        if (!schema.characterDetails) {
          validation.warnings.push('Enhanced schema missing characterDetails');
        }
        
        if (schema.primaryScene && schema.primaryScene.length < 20) {
          validation.warnings.push('Primary scene description is very short');
        }
      }
    }

    this.logValidation('ai-scene-creator-output', validation);
    return validation;
  }

  // ============= DATA FLOW TRANSITION VALIDATION =============

  // Validate data preservation during tier transitions
  validateTierTransition(fromTier, toTier, inputData, outputData) {
    console.log(`🔄 Phase 5: Validating tier transition ${fromTier} → ${toTier}`);
    
    const transition = {
      fromTier,
      toTier,
      timestamp: new Date().toISOString(),
      isValid: true,
      dataPreserved: true,
      issues: [],
      inputKeys: Object.keys(inputData || {}),
      outputKeys: Object.keys(outputData || {})
    };

    // Check for data loss
    const criticalFields = ['userInfo', 'avatarIdentity', 'sessionId', 'pageNumber'];
    
    for (const field of criticalFields) {
      if (inputData[field] && !outputData[field]) {
        transition.issues.push(`Critical field '${field}' lost in transition`);
        transition.dataPreserved = false;
      }
    }

    // Check for data corruption
    if (inputData.userInfo && outputData.userInfo) {
      const inputUserKeys = Object.keys(inputData.userInfo).length;
      const outputUserKeys = Object.keys(outputData.userInfo).length;
      
      if (outputUserKeys < inputUserKeys * 0.8) { // Allow some reduction but not major loss
        transition.issues.push('Significant userInfo data reduction detected');
        transition.dataPreserved = false;
      }
    }

    // Log transition for analysis
    this.dataTransitionLog.push(transition);
    
    if (transition.issues.length > 0) {
      console.warn('⚠️ Phase 5: Data flow issues detected:', transition.issues);
    }

    return transition;
  }

  // ============= INPUT/OUTPUT NORMALIZATION =============

  // Normalize orchestrator input to standard format
  normalizeOrchestratorInput(input) {
    return {
      pageText: input.pageText || input.storyText || '',
      userInfo: this.normalizeUserInfo(input.userInfo),
      avatarIdentity: this.normalizeAvatarIdentity(input.avatarIdentity),
      sessionId: input.sessionId || null,
      pageNumber: input.pageNumber || 1,
      userId: input.userId || input.userInfo?.user_id || null,
      requestId: input.requestId || this.generateRequestId(),
      timestamp: new Date().toISOString()
    };
  }

  // Normalize template service input to standard format
  normalizeTemplateServiceInput(input) {
    return {
      storyText: input.storyText || input.pageText || '',
      userInfo: this.normalizeUserInfo(input.userInfo),
      avatarIdentity: this.normalizeAvatarIdentity(input.avatarIdentity),
      templateComplexity: input.templateComplexity,
      sessionId: input.sessionId || null,
      pageNumber: input.pageNumber || 1,
      timestamp: new Date().toISOString()
    };
  }

  // Normalize AI scene creator input
  normalizeAISceneCreatorInput(input) {
    return {
      pageText: input.pageText || input.storyText || '',
      userInfo: this.normalizeUserInfo(input.userInfo),
      avatarIdentity: this.normalizeAvatarIdentity(input.avatarIdentity),
      enhancementRequest: input.enhancementRequest || {
        type: 'full_enhancement',
        includeVisualElements: true,
        includeCharacterDetails: true,
        includeSpatialComposition: true
      },
      sessionId: input.sessionId || null,
      timestamp: new Date().toISOString()
    };
  }

  // Normalize userInfo structure
  normalizeUserInfo(userInfo) {
    if (!userInfo) return null;
    
    return {
      name: userInfo.name || userInfo.childName || null,
      age: userInfo.age || null,
      gradeLevel: userInfo.gradeLevel || null,
      difficulty: userInfo.difficulty || 'medium',
      interests: Array.isArray(userInfo.interests) ? userInfo.interests : [],
      nativeLanguage: userInfo.nativeLanguage || 'en',
      readingLevel: userInfo.readingLevel || null,
      specialRequest: userInfo.specialRequest || userInfo.special_request || null
    };
  }

  // Normalize avatarIdentity structure
  normalizeAvatarIdentity(avatarIdentity) {
    if (!avatarIdentity) return null;
    
    return {
      skinTone: avatarIdentity.skinTone || null,
      hairColor: avatarIdentity.hairColor || null,
      eyeColor: avatarIdentity.eyeColor || null,
      nativeLanguage: avatarIdentity.nativeLanguage || null,
      culturalBackground: avatarIdentity.culturalBackground || null,
      completenessValidation: avatarIdentity.completenessValidation || null
    };
  }

  // ============= ANALYSIS AND LOGGING =============

  // Analyze input structure for debugging
  analyzeInputStructure(input) {
    return {
      totalKeys: Object.keys(input || {}).length,
      hasUserInfo: !!input.userInfo,
      hasAvatarIdentity: !!input.avatarIdentity,
      userInfoKeys: input.userInfo ? Object.keys(input.userInfo).length : 0,
      avatarIdentityKeys: input.avatarIdentity ? Object.keys(input.avatarIdentity).length : 0,
      textLength: (input.pageText || input.storyText || '').length,
      hasSessionId: !!input.sessionId,
      hasPageNumber: !!input.pageNumber
    };
  }

  // Analyze output structure for debugging
  analyzeOutputStructure(output) {
    return {
      totalKeys: Object.keys(output || {}).length,
      isSuccess: !!output.success,
      hasImageURL: !!output.imageURL,
      hasMetadata: !!output.metadata,
      hasTierInfo: !!output.tier,
      hasPromptData: !!(output.prompt || output.positivePrompt),
      errorPresent: !!output.error
    };
  }

  // Log validation results for debugging
  logValidation(type, validation) {
    const logEntry = {
      type,
      timestamp: new Date().toISOString(),
      isValid: validation.isValid,
      errorCount: validation.errors?.length || 0,
      warningCount: validation.warnings?.length || 0,
      errors: validation.errors || [],
      warnings: validation.warnings || []
    };

    this.validationHistory.set(`${type}-${Date.now()}`, logEntry);

    if (validation.errors?.length > 0) {
      console.error(`❌ Phase 5: ${type} validation failed:`, validation.errors);
    }
    
    if (validation.warnings?.length > 0) {
      console.warn(`⚠️ Phase 5: ${type} validation warnings:`, validation.warnings);
    }
    
    if (validation.isValid && validation.errors?.length === 0) {
      console.log(`✅ Phase 5: ${type} validation passed`);
    }
  }

  // Generate request ID for tracking
  generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `df-${timestamp}-${random}`;
  }

  // Get validation history for debugging
  getValidationHistory() {
    return Array.from(this.validationHistory.values());
  }

  // Get data transition log for analysis
  getDataTransitionLog() {
    return this.dataTransitionLog;
  }

  // Clear logs (for memory management)
  clearLogs() {
    this.validationHistory.clear();
    this.dataTransitionLog = [];
    console.log('🧹 Phase 5: Data flow validation logs cleared');
  }
}

// Create singleton instance
export const dataFlowValidator = new DataFlowValidator();