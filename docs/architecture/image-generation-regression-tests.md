# Image Generation Regression Tests

## Purpose
Prevent regression to subscription-based image quality tiers. All users must receive Tier 1 images.

## Test Cases

### Test 1: Guest User Image Quality
```javascript
// Verify guest users receive Tier 1 images
const guestResult = await SimpleImageService.generateStoryImage(
  "A happy child playing in the park",
  { name: "Guest", avatar: { type: "boy", skinTone: "medium" } },
  "medium",
  "test-session",
  1,
  "test-session",
  false // Guest user
);

expect(guestResult.metadata.tier).toBe(1);
expect(guestResult.metadata.enhancementLevel).toContain('ai-enhanced');
```

### Test 2: Premium User Image Quality
```javascript
// Verify premium users also receive Tier 1 images (same quality)
const premiumResult = await SimpleImageService.generateStoryImage(
  "A happy child playing in the park", 
  { name: "Premium", avatar: { type: "girl", skinTone: "light" } },
  "medium",
  "test-session",
  1,
  "test-session", 
  true // Premium user
);

expect(premiumResult.metadata.tier).toBe(1);
expect(premiumResult.metadata.enhancementLevel).toContain('ai-enhanced');
```

### Test 3: Quality Parity Verification
```javascript
// Verify guest and premium users get identical quality
const [guestImg, premiumImg] = await Promise.all([
  generateTestImage(false), // Guest
  generateTestImage(true)   // Premium
]);

expect(guestImg.metadata.tier).toBe(premiumImg.metadata.tier);
expect(guestImg.metadata.enhancementLevel).toBe(premiumImg.metadata.enhancementLevel);
```

### Test 4: Backend Tier Assignment
```javascript
// Verify backend orchestrator provides Tier 1 to all users
const response = await supabase.functions.invoke('runware-generate-image', {
  body: {
    pageText: "Test content",
    userInfo: testUser,
    isGuestUser: true // Should still get Tier 1
  }
});

expect(response.data.tier).toBe(1);
expect(response.data.success).toBe(true);
```

### Test 5: Fallback System Integrity
```javascript
// Verify fallbacks don't skip based on subscription
// Mock Tier 1 failure to test progression
mockRunwareFail();

const result = await SimpleImageService.generateStoryImage(
  "Test content",
  testUser,
  "medium",
  undefined,
  1,
  undefined,
  false // Guest user should get Tier 2 fallback, not tier jumping
);

expect(result.metadata.tier).toBeGreaterThanOrEqual(2); // Should fallback, not fail
expect(result.success).toBe(true); // Should always succeed
```

## Automated Monitoring

### Daily Health Check
```javascript
// Monitor tier distribution in production
const tierStats = await analyticsDashboard.getTierUsageStats();
expect(tierStats.tier1Percentage).toBeGreaterThan(90); // Most should be Tier 1
expect(tierStats.guestTier1Rate).toBe(tierStats.premiumTier1Rate); // Equal rates
```

### E2E Test Suite
```javascript
describe('Image Generation Tier Policy', () => {
  it('provides Tier 1 to all user types', async () => {
    const users = [
      { type: 'guest', isPremium: false },
      { type: 'premium', isPremium: true },
      { type: 'trial', isPremium: false }
    ];
    
    for (const user of users) {
      const result = await generateImage(user);
      expect(result.metadata.tier).toBe(1);
    }
  });
});
```

## Performance Benchmarks

### Quality Metrics
- All users: Tier 1 success rate > 95%
- Fallback engagement: < 5% for normal operations  
- Image quality scores: Consistent across user types

### Cost Monitoring  
- Track Tier 1 usage costs across user segments
- Monitor for cost anomalies that might indicate tier bypassing
- Validate business model sustainability with current policy

## Deployment Gates

### Pre-Production Checklist
- [ ] All test cases pass
- [ ] No subscription-based tier logic detected
- [ ] Backend tier assignment verified
- [ ] Frontend service compliance confirmed
- [ ] Documentation updated

### Production Validation
- [ ] Monitor tier distribution post-deployment
- [ ] Verify user experience consistency  
- [ ] Check cost implications
- [ ] Validate analytics accuracy

## Alert Conditions

### Critical Alerts
- Guest users receiving non-Tier-1 images
- Subscription-based tier restrictions detected
- Tier 1 success rate below 90%
- Quality disparity between user types

### Warning Alerts  
- Tier 1 success rate below 95%
- Unusual fallback tier engagement
- Cost per image exceeding thresholds
- User complaints about image quality

## Recovery Procedures

### If Tier Policy Violated
1. Immediate rollback to last compliant version
2. Investigate root cause of policy bypass
3. Fix code and update tests
4. Redeploy with enhanced monitoring

### If Tier 1 Becomes Unavailable
1. Monitor fallback tier usage
2. Ensure equal treatment across user types  
3. Restore Tier 1 ASAP while maintaining policy
4. Post-incident review and documentation update