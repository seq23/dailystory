# Code Review Guidelines - Phase 1-4 Implementation

## Overview

This guide provides comprehensive code review criteria for maintaining the integrity of the Phase 1-4 image generation system implementation, preventing architectural drift and ensuring consistent quality.

## General Review Principles

### Tier Policy Compliance (Critical)
- [ ] **No subscription-based tier restrictions**: Code must not use `isPremium`, `isGuestUser`, or similar flags for quality/tier determination
- [ ] **All users start with Tier 1**: Verify generation logic begins with highest quality tier
- [ ] **Consistent fallback progression**: All user types follow identical fallback sequence
- [ ] **Analytics only usage**: Subscription flags used solely for tracking, not functionality

### Phase Implementation Integrity
- [ ] **Phase 1 WebSocket**: RunwareWebSocketManager properly integrated with circuit breaker pattern
- [ ] **Phase 2 Memory**: BackendTokenManager called for prompt optimization
- [ ] **Phase 3 Cultural**: CulturalNameDetector integrated for character processing
- [ ] **Phase 4 Security**: SecurityValidator validates all requests, MetricsCollector monitors operations

## Component-Specific Review Criteria

### Frontend Components (`src/`)

#### SimpleImageService.ts
```javascript
// ✅ CORRECT: Subscription-agnostic API
static async generateStoryImage(
  pageText: string,
  userInfo: UserInfo,
  // ... other params
  isPremium: boolean = false  // Analytics only
)

// ❌ WRONG: Subscription-based logic
if (isPremium) {
  return await generatePremiumImage();
} else {
  return await generateBasicImage();
}
```

**Review Checklist:**
- [ ] No subscription-based branching logic
- [ ] Error handling preserves user experience consistency
- [ ] Backend delegation maintains tier policy
- [ ] Analytics parameters clearly separated from functional parameters

#### Story Display Components
- [ ] Image display logic identical for all user types
- [ ] Loading states consistent across subscription levels
- [ ] Error messages don't reveal subscription-based differences
- [ ] Progress indicators work uniformly

### Backend Edge Functions (`supabase/functions/`)

#### runware-generate-image/index.ts
```javascript
// ✅ CORRECT: Tier 1 for all users
const tier1Result = await generateWithRunwarePremium(prompt, avatarIdentity);

// ✅ CORRECT: Security validation
const securityResult = await SecurityValidator.validateImageRequest(req, params);

// ❌ WRONG: Subscription-based tier assignment
if (isGuestUser) {
  return await generateBasicTier();
}
```

**Review Checklist:**
- [ ] SecurityValidator called at request entry point
- [ ] CulturalNameDetector integrated for character processing
- [ ] All users receive identical Tier 1 processing
- [ ] MetricsCollector monitors all operations
- [ ] Fallback logic maintains subscription parity
- [ ] CORS headers properly configured

#### ai-story-enhancer/index.ts
```javascript
// ✅ CORRECT: 3-field schema structure
const enhancedResult = {
  characters: processedAvatarData,
  visualComponents: { sceneType, lighting, keyObjects, setting, mood },
  primaryScene: comprehensiveVisualDescription
};

// ✅ CORRECT: Token optimization
const optimizedPrompt = await BackendTokenManager.optimizePrompt(enhancedResult, userInfo);
```

**Review Checklist:**
- [ ] Maintains 3-field schema structure (characters, visualComponents, primaryScene)
- [ ] BackendTokenManager integration for memory optimization
- [ ] No subscription-based enhancement differences
- [ ] Cultural intelligence integration points maintained
- [ ] Token efficiency improvements preserved

### Shared Components (`supabase/functions/_shared/`)

#### SecurityValidator.js
```javascript
// ✅ CORRECT: Consistent validation for all users
static async validateImageRequest(req, params) {
  const rateLimitResult = await this.checkRateLimit(identifier, 'image_generation');
  // No subscription-based rate limit differences
}

// ❌ WRONG: Premium user exemptions
if (isPremium) {
  return { valid: true }; // Skip validation
}
```

**Review Checklist:**
- [ ] Rate limiting applied consistently across user types
- [ ] Content validation identical for all users
- [ ] Session validation enforced uniformly
- [ ] No premium user security exemptions
- [ ] Proper error handling and logging

#### MetricsCollector.js
```javascript
// ✅ CORRECT: Analytics without functional impact
static async recordGeneration(result, userInfo) {
  const metrics = {
    tier: result.tier,
    isGuestUser: !userInfo.isPremium, // Analytics only
    // ... other metrics
  };
}

// ❌ WRONG: Metrics affecting functionality
if (isGuestUser && dailyCount > limit) {
  throw new Error('Limit reached');
}
```

**Review Checklist:**
- [ ] Metrics collection doesn't affect generation logic
- [ ] User type tracking for analytics only
- [ ] Performance monitoring covers all user types equally
- [ ] No subscription-based metric filtering

#### RunwareWebSocketManager.js
- [ ] Circuit breaker pattern properly implemented
- [ ] Connection pooling optimized for all users
- [ ] Retry logic doesn't favor subscription status
- [ ] Error handling maintains service consistency

#### BackendTokenManager.js
- [ ] Priority-based optimization applied uniformly
- [ ] Token compression benefits all users equally
- [ ] Protected words list includes all cultural variations
- [ ] Memory optimization maintains quality consistency

#### CulturalNameDetector.js
- [ ] Cultural name recognition works for all users
- [ ] Processing enhancement applied uniformly
- [ ] No subscription-based cultural feature restrictions
- [ ] Character consistency improvements universal

#### Avatar Identity Handling
```javascript
// ✅ CORRECT: Robust fallback pattern
const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'child';

// ✅ CORRECT: Dual parameter functions
function processAvatar(avatarIdentity, userInfo) {
  const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'child';
}

// ❌ WRONG: Direct usage without fallback
const avatarType = avatarIdentity.type;

// ❌ WRONG: Unsafe default gender
const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'boy';
```

**Avatar Fallback Review Checklist:**
- [ ] All avatar type usage implements three-level fallback pattern: `avatarIdentity?.type || userInfo?.avatar?.type || 'child'`
- [ ] Functions accept both `avatarIdentity` and `userInfo` parameters when possible
- [ ] No direct usage of `userInfo.avatar.type` without fallback consideration
- [ ] 'child' used as final fallback for gender neutrality
- [ ] Function signatures clearly indicate avatar parameter expectations
- [ ] Logging includes avatar source tracking (optimized/fallback/default)

## Security Review Criteria

### Authentication & Authorization
- [ ] Edge functions use proper Supabase authentication
- [ ] JWT verification when required
- [ ] No custom authentication bypasses
- [ ] Session management follows security best practices

### Rate Limiting & Abuse Prevention
- [ ] Rate limits defined in SecurityValidator
- [ ] Consistent enforcement across user types
- [ ] Proper cleanup of rate limit data
- [ ] No subscription-based rate limit exemptions

### Content Security
- [ ] Input validation for all user-provided content
- [ ] Output sanitization where appropriate
- [ ] No injection vulnerabilities
- [ ] Proper error message handling (no information leakage)

### API Security
- [ ] CORS headers properly configured
- [ ] API key validation where required
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling without exposing internals

## Performance Review Criteria

### Memory Management
- [ ] BackendTokenManager reduces memory footprint
- [ ] No memory leaks in long-running processes
- [ ] Proper cleanup of resources
- [ ] Efficient data structures

### Connection Management
- [ ] WebSocket connections properly managed
- [ ] Connection pooling prevents resource exhaustion
- [ ] Proper connection lifecycle management
- [ ] Circuit breaker prevents cascade failures

### Response Times
- [ ] SecurityValidator adds minimal latency (<100ms)
- [ ] Cultural processing efficient (<50ms)
- [ ] Token optimization improves overall performance
- [ ] Monitoring overhead minimal (<5%)

## Documentation Review Criteria

### Code Documentation
- [ ] Critical business logic properly commented
- [ ] Phase implementation clearly documented
- [ ] Integration points well explained
- [ ] Security considerations noted

### Architecture Documentation
- [ ] Changes reflected in architectural diagrams
- [ ] Integration patterns documented
- [ ] Fallback flows clearly described
- [ ] Security model properly documented

## Testing Review Criteria

### Unit Tests
- [ ] New functionality has corresponding unit tests
- [ ] Tests verify subscription-agnostic behavior
- [ ] Security validation tests included
- [ ] Performance regression tests present

### Integration Tests
- [ ] End-to-end flow tests updated
- [ ] Cross-component integration verified
- [ ] Fallback system tests comprehensive
- [ ] Security integration tests included

### Regression Tests
- [ ] Tier policy compliance tests updated
- [ ] Phase 1-4 functionality regression tests
- [ ] Performance benchmark tests maintained
- [ ] Security validation regression tests

## Common Anti-Patterns to Reject

### Subscription-Based Logic
```javascript
// ❌ REJECT: Direct subscription checks
if (userInfo.isPremium) {
  return premiumFeature();
}

// ❌ REJECT: Indirect subscription logic
const maxIterations = isGuestUser ? 1 : 5;

// ❌ REJECT: Quality degradation for guests
const qualityLevel = isPremium ? 'high' : 'medium';
```

### Avatar Handling Anti-Patterns
```javascript
// ❌ REJECT: No fallback - will break when avatarIdentity is null
const avatarType = avatarIdentity.type;

// ❌ REJECT: Only partial fallback - ignores userInfo.avatar
const avatarType = avatarIdentity?.type || 'child';

// ❌ REJECT: Unsafe gender default
const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'boy';

// ❌ REJECT: Wrong fallback order
const avatarType = userInfo?.avatar?.type || avatarIdentity?.type || 'child';

// ❌ REJECT: Missing avatarIdentity parameter
function processAvatar(userInfo) {
  const avatarType = userInfo.avatar.type; // No optimization support
}
```

### Security Bypasses
```javascript
// ❌ REJECT: Premium user security exemptions
if (isPremium) {
  return { valid: true }; // Skip validation
}

// ❌ REJECT: Hardcoded bypasses
if (userId === 'admin') {
  // Skip rate limiting
}
```

### Performance Inconsistencies
```javascript
// ❌ REJECT: Different processing for user types
const processingDepth = isGuestUser ? 'shallow' : 'deep';

// ❌ REJECT: Resource allocation based on subscription
const connectionLimit = isPremium ? 10 : 2;
```

## Review Approval Criteria

### Required Approvals
- [ ] **Security Review**: If changes affect SecurityValidator or validation logic
- [ ] **Architecture Review**: If changes affect Phase 1-4 component integration
- [ ] **Performance Review**: If changes affect optimization or resource usage
- [ ] **Policy Review**: If changes could affect tier policy compliance

### Automatic Rejection Triggers
- Subscription-based quality restrictions
- Security validation bypasses
- Tier policy violations
- Phase implementation regressions
- Performance degradation without justification

---

**Review Standards**: Phase 1-4 Implementation Compliant  
**Security Level**: Production-Ready Validation  
**Performance**: Optimized for All User Types  
**Policy Compliance**: Tier 1 for All Users Enforced
