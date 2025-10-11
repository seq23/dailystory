          # CRITICAL: Image Generation Cascade Logic (Frontend + Orchestrator + Direct Mode)

**Date Updated: 2025-09-28**

## CORRECT CASCADE LOGIC SHOULD BE:

### Frontend: Health Check → Route Decision
```
├─ If orchestrator healthy: call runware-generate-image
└─ If orchestrator unhealthy: call ai-visual-scene-creator with directMode=true
```

### Orchestrator (runware-generate-image):
```
1. Try Tier 1 (get primaryScene from ai-visual-scene-creator) 
2. If primaryScene valid but image generation fails → try Direct Mode
3. If no primaryScene OR Direct Mode fails → 2.5A → 2.5B → 2.5C → 2.5D → SVG
```

### Direct Mode (ai-visual-scene-creator with directMode=true):
```
1. Generate primaryScene internally
2. Call runware-template-cd for image generation
3. Return image or error
```

## Implementation Status:
- ✅ Tier 1: Implemented in ai-visual-scene-creator
- ✅ Direct Mode: Implemented in ai-visual-scene-creator with directMode=true
- ✅ Tier 2.5A: Implemented in runware-template-ab with complexity 'A'
- ✅ Tier 2.5B: Implemented in runware-template-ab with complexity 'B'
- ✅ Tier 2.5C: Implemented in runware-template-cd with complexity 'C'
- ✅ Tier 2.5D: Implemented in runware-template-cd with complexity 'D'
- ✅ SVG Fallback: Implemented as final tier

## Critical Notes:
- Never duplicate cascade logic in frontend components - use the backend services
- Character logic consolidated into CharacterConsistencyService (backend only)
- Frontend services are minimal stubs - real logic in edge functions
- All tiers are implemented and functional as of 2025-09-28

## Anti-Regression Guidelines:
- DO NOT re-implement manual cascade logic in frontend components
- DO NOT skip intermediate tiers in the orchestrator cascade
- DO maintain proper error handling and logging at each tier
- DO ensure directErrorMessage is properly guarded when Direct Mode wasn't attempted

## Test-Only Features:
- **skipTier1AI flag**: Used by Force Tier 2.5A/B test buttons to skip AI scene extraction while preserving CCS execution. Simulates AI failure for testing template tier escalation. Never used in production flows.

# COMPREHENSIVE IMAGE GENERATION SYSTEM - HARDENED ARCHITECTURE

## SYSTEM STATUS: ✅ FULLY OPERATIONAL (Updated September 23, 2025)

This document outlines the enhanced image generation system with comprehensive error handling, boot validation, and resilience features. **Latest fixes**: Duplicate variable declarations resolved, receptionist pattern stabilized.

## CRITICAL FIXES IMPLEMENTED

### 1. ❌ FIXED: Boot Crash Issues
- **Problem**: `ReferenceError: monitorRequest is not defined` causing function crashes
- **Solution**: Removed all monitoring dependencies and implemented comprehensive boot validation
- **Status**: ✅ RESOLVED

### 2. ❌ FIXED: Database Schema Issues  
- **Problem**: Missing `details` JSONB column in `ai_prompt_debug_log` table
- **Solution**: Added missing column with proper default values
- **Status**: ✅ RESOLVED

### 3. ❌ FIXED: Deployment Failures
- **Problem**: Network errors and module loading failures preventing deployment
- **Solution**: Enhanced error handling, fallback systems, and boot validation
- **Status**: ✅ RESOLVED

## ENHANCED ARCHITECTURE COMPONENTS

### Phase 1: Boot Validation System
- **Component**: `BootValidationService.js`
- **Function**: Validates all system components during startup
- **Features**:
  - Environment variable validation
  - Module integrity checks
  - CORS system validation
  - Database connection validation
  - Comprehensive startup diagnostics

### Phase 6: Logging Consolidation  
- **Component**: Unified debug logging through structured systems
- **Function**: Routes all logging through centralized endpoint
- **Features**:
  - Structured logging with request IDs
  - Log levels: DEBUG, INFO, WARN, ERROR
  - Proper filtering and cleanup policies
  - Enhanced security audit logging

### Phase 7: Function Hardening & Resilience
- **Component**: Comprehensive try/catch blocks on all handlers
- **Function**: Bulletproof error handling with CORS fallbacks
- **Features**:
  - POST, OPTIONS, GET request handler wrapping
  - Circuit breaker integration with ErrorRecoverySystem
  - AbortController timeout management (30 seconds)
  - Dynamic CORS error response fallbacks

### Phase 8: Enhanced Timeout & Resilience
- **Component**: `EnhancedTimeoutSystem.js`
- **Function**: AbortController integration for all external calls
- **Features**:
  - Progressive degradation testing
  - Timeout cascade system (5s → 15s → 30s → 60s)
  - Resilience benchmarking with performance metrics
  - Circuit breaker integration for repeated failures

### Phase 9: Boot Self-Validation System
- **Component**: Integrated system integrity checks
- **Function**: Validates environment and modules at startup
- **Features**:
  - Required environment variable presence/validity checks
  - Module import integrity verification  
  - tier25Vocabulary VOCABULARY export validation
  - CORS system dual-mode (TypeScript/JavaScript) validation
  - Complete startup diagnostic logging

## CORS ARCHITECTURE

### Dual CORS System
- **Primary**: JavaScript CORS system (`corsAdvanced.js`)
- **Fallback**: TypeScript CORS system (`corsAdvanced.ts`)
- **Strategy**: Dynamic header detection with comprehensive coverage
- **Features**:
  - Auto-detection of all necessary headers and origins
  - No manual configuration required
  - Seamless integration across all clients

## DEPLOYMENT ARCHITECTURE

### Deployment Sequence
1. **Boot Validation** → Environment and module checks
2. **Error Recovery Initialization** → Circuit breakers and fallback systems  
3. **CORS System Activation** → Dynamic header detection
4. **Request Processing** → Enhanced timeout and resilience controls
5. **Logging & Monitoring** → Structured debug logging with cleanup policies

### Performance Optimizations
- **Static Data Caching**: 24-hour TTL for configuration data
- **Lazy Module Loading**: On-demand imports with fallback handling
- **Circuit Breaker Pattern**: Prevents cascade failures
- **Progressive Degradation**: Graceful fallback through tier system

## TROUBLESHOOTING GUIDE

### Boot Failures
1. Check environment variables (SUPABASE_URL, API keys)
2. Verify module exports (especially tier25Vocabulary.js)
3. Review boot validation logs for specific failures
4. Ensure database connectivity

### Runtime Errors  
1. Check enhanced timeout system logs
2. Review circuit breaker status
3. Verify CORS system fallback activation
4. Check structured logging for request tracking

### Deployment Issues
1. Verify all shared modules are present
2. Check GitHub Actions workflow status
3. Review Supabase function deployment logs
4. Ensure proper error handling wrapper activation

## SECURITY FEATURES

### Enhanced Security Logging
- All sensitive operations logged with request IDs
- Personal information incident tracking with COPPA compliance
- Automated cleanup policies (90-day audit log retention)
- Enhanced subscription security monitoring

### Data Protection
- Input validation and sanitization
- Proper error message handling (no sensitive data exposure)
- Session-based security controls
- Automated anonymization for inactive users

## MONITORING & METRICS

### Performance Metrics
- Request processing times with tier-based tracking
- Circuit breaker status monitoring
- Timeout cascade performance measurement
- Boot validation success/failure rates

### Health Monitoring
- System component status tracking
- API integration health checks
- Database connectivity monitoring  
- CORS system validation results

## MAINTENANCE PROCEDURES

### Regular Maintenance
- **Daily**: Monitor error logs and circuit breaker status
- **Weekly**: Review performance metrics and timeout cascade efficiency
- **Monthly**: Security audit log analysis and cleanup verification
- **Quarterly**: Full system resilience testing and boot validation accuracy

### Emergency Procedures
- **Boot Failures**: Check boot validation service logs, verify environment
- **Cascade Failures**: Review circuit breaker logs, reset if needed
- **CORS Issues**: Verify dual CORS system activation, check headers
- **Timeout Issues**: Review enhanced timeout system metrics, adjust cascades

---

## FINAL STATUS: ✅ SYSTEM READY FOR PRODUCTION

All critical issues have been resolved:
- ✅ Boot crashes fixed with comprehensive validation
- ✅ Database schema updated with missing columns  
- ✅ Deployment pipeline hardened with enhanced error handling
- ✅ Comprehensive timeout and resilience systems implemented
- ✅ Security and monitoring enhanced with structured logging
- ✅ Complete documentation and troubleshooting guides provided

The system is now deployment-ready with enterprise-grade reliability and comprehensive error handling.