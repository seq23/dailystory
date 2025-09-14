/**
 * DATA FLOW VALIDATOR - SIMPLIFIED
 * Basic input normalization only - complex validation moved to UnifiedDebugValidator
 */

import { unifiedDebugValidator } from './UnifiedDebugValidator.js';

class DataFlowValidator {
  constructor() {
    this.validationHistory = [];
    this.dataTransitionLog = [];
    this.maxHistorySize = 50; // Reduced from larger number
  }

  // Basic input normalization - keep this for core functionality
  normalizeOrchestratorInput(input) {
    if (!input || typeof input !== 'object') return {};
    
    return {
      pageText: input.pageText || input.page_text || input.text || '',
      userInfo: this.normalizeUserInfo(input.userInfo || input.user_info || {}),
      avatarIdentity: this.normalizeAvatarIdentity(input.avatarIdentity || input.avatar_identity || {}),
      sessionId: input.sessionId || input.session_id || '',
      pageNumber: input.pageNumber || input.page_number || 1
    };
  }

  normalizeUserInfo(userInfo) {
    if (!userInfo || typeof userInfo !== 'object') return {};
    
    return {
      name: userInfo.name || userInfo.childName || '',
      age: userInfo.age || userInfo.child_age || '',
      interests: userInfo.interests || [],
      favoriteColor: userInfo.favoriteColor || userInfo.favorite_color || '',
      favoriteAnimal: userInfo.favoriteAnimal || userInfo.favorite_animal || ''
    };
  }

  normalizeAvatarIdentity(avatarIdentity) {
    if (!avatarIdentity || typeof avatarIdentity !== 'object') return {};
    
    return {
      name: avatarIdentity.name || '',
      type: avatarIdentity.type || avatarIdentity.avatar_type || '',
      characteristics: avatarIdentity.characteristics || []
    };
  }

  // Comprehensive validation using unified validator
  async validateSystem(context) {
    try {
      return await unifiedDebugValidator.validateSystem({
        ...context,
        operation: 'data_flow_validation'
      });
    } catch (error) {
      console.warn('⚠️ [DataFlowValidator] Validation error (non-blocking):', error.message);
      return { status: 'error', error: error.message };
    }
  }

  // Simple logging
  logValidation(type, validation) {
    this.validationHistory.unshift({
      type,
      validation,
      timestamp: new Date().toISOString()
    });

    if (this.validationHistory.length > this.maxHistorySize) {
      this.validationHistory = this.validationHistory.slice(0, this.maxHistorySize);
    }
  }

  getValidationHistory() {
    return this.validationHistory;
  }

  clearLogs() {
    this.validationHistory = [];
    this.dataTransitionLog = [];
  }
}

export const dataFlowValidator = new DataFlowValidator();
