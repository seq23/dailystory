# Development Guide
**Last Updated:** 2025-09-29  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [1. Development Setup](#1-development-setup)
  - [1.1 Prerequisites](#11-prerequisites)
  - [1.2 Local Environment](#12-local-environment)
  - [1.3 IDE Configuration](#13-ide-configuration)
- [2. Edge Function Architecture](#2-edge-function-architecture)
  - [2.1 Function Structure](#21-function-structure)
  - [2.2 Hybrid Vendor System](#22-hybrid-vendor-system)
  - [2.3 Tier System Implementation](#23-tier-system-implementation)
  - [2.4 Error Handling Patterns](#24-error-handling-patterns)
- [3. Code Standards & Patterns](#3-code-standards--patterns)
  - [3.1 TypeScript Guidelines](#31-typescript-guidelines)
  - [3.2 React Best Practices](#32-react-best-practices)
  - [3.3 Error Handling Standards](#33-error-handling-standards)
  - [3.4 Testing Requirements](#34-testing-requirements)
- [4. Testing & Debugging](#4-testing--debugging)
  - [4.1 Unit Testing](#41-unit-testing)
  - [4.2 Integration Testing](#42-integration-testing)
  - [4.3 Debugging Edge Functions](#43-debugging-edge-functions)
  - [4.4 Production Monitoring](#44-production-monitoring)
- [5. Deployment Procedures](#5-deployment-procedures)
- [6. Future Documentation Needs](#6-future-documentation-needs)
- [📚 Related Documentation](#related-documentation)

---

## 1. Development Setup

### 1.1 Prerequisites

**Required Tools:**
- Node.js v18+ (LTS recommended)
- Bun package manager (preferred) or npm
- Supabase CLI v1.x
- Git v2.x+
- Code editor (VS Code recommended)

**Required Accounts:**
- Supabase account with project access
- Stripe account (for payment testing)
- OpenAI API key (for AI features)
- Runware API key (for image generation)
- ElevenLabs API key (for TTS features)

### 1.2 Local Environment

**Environment Variables:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Keys (stored in Supabase secrets)
OPENAI_API_KEY=your-openai-key
RUNWARE_API_KEY=your-runware-key
ELEVENLABS_API_KEY=your-elevenlabs-key
STRIPE_SECRET_KEY=your-stripe-key
```

**Installation:**
```bash
# Clone repository
git clone <repository-url>
cd time2read

# Install dependencies
bun install

# Set up Supabase
supabase login
supabase link --project-ref <your-project-ref>

# Run development server
bun run dev
```

**Database Setup:**
```bash
# Pull latest schema
supabase db pull

# Run migrations
supabase db push

# Seed database (if needed)
supabase db seed
```

### 1.3 IDE Configuration

### 1.4 Authentication & Premium Access Model

**⚠️ CRITICAL: ALL authenticated users are premium users.**

This project uses a simplified two-tier authentication model:
- **Authenticated users:** Full premium access (isPremium = true, always)
- **Unauthenticated users:** Guest experience (isPremium = false)

**Key Implementation Points:**

```typescript
// CORRECT: Authentication determines premium status
const isPremium = !!user; // Simple and reliable

// WRONG: Never check subscription for feature access
const isPremium = await checkSubscription(); // DON'T DO THIS
```

**What This Means for Development:**
1. **No Feature Gating:** Don't check subscription status before showing features
2. **Payment Functions:** Business operations ONLY (not access control)
3. **Simple Auth Flow:** User logged in = premium, user logged out = guest
4. **Global Flag:** `window.__IS_PREMIUM = !!user` available everywhere

**Detailed Documentation:** See [Authentication Model Guide](./AUTHENTICATION_MODEL.md) for complete implementation details, payment system role, and migration notes.

**VS Code Extensions (Recommended):**
- ESLint
- Prettier
- Supabase
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)

---

## 2. Edge Function Architecture

### 2.1 Function Structure

**Standard Edge Function Template:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const body = await req.json()

    // Business logic here
    const result = await processRequest(body)

    // Return success response
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

### 2.2 Hybrid Vendor System

**Tier Architecture Overview:**
- **Tier 1:** Network CDN fallbacks
- **Tier 2:** TRUE LOCAL VENDOR (local .mjs files)
- **Tier 3:** Template service fallback
- **Tier 4:** Emergency content generation

**Implementation Patterns:**

#### Payment Pattern (2-Tier)
```typescript
// Payment functions use specialized 2-tier pattern
// NO template fallback (payment requires full connectivity)

// Tier 1: Network CDN
try {
  const result = await stripeOperation()
  return successResponse(result)
} catch (networkError) {
  // Tier 2: Vendor Fallback
  try {
    const vendorClient = await loadVendorSupabase()
    return handleGracefulFailure(vendorClient)
  } catch (vendorError) {
    // Return standardized 503
    return serviceUnavailableResponse()
  }
}
```

#### Story Generation Pattern (4-Tier)
```typescript
// Tier 1: Network CDN with multi-CDN cascade
async function loadFromCDN() {
  const cdns = ['esm.sh', 'jspm.io', 'jsdelivr', 'unpkg']
  for (const cdn of cdns) {
    try {
      return await import(`https://${cdn}/@supabase/supabase-js@2.57.4`)
    } catch (err) {
      continue
    }
  }
  throw new Error('All CDNs failed')
}

// Tier 2: TRUE LOCAL VENDOR
async function loadFromVendor() {
  return await import('/_vendor/supabase-js@2.57.4.mjs')
}

// Tier 3: Template Service
async function generateFromTemplate(userInfo) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/template-service`, {
    method: 'POST',
    body: JSON.stringify(userInfo)
  })
  return response.json()
}

// Tier 4: Emergency Content
function generateEmergencyContent(userName) {
  const templates = [
    `Oh dear ${userName}, our story machine took a little rest...`,
    `Whoops-a-daisy ${userName}, our story elves went to play...`,
    `Hello there ${userName}, our story box needs a snack...`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}
```

#### Image Generation Pattern (4-Tier Cascade)
```typescript
// Orchestrator determines tier routing
async function generateImage(params) {
  const { userTier, forceMode, avatar } = params
  
  // Tier 1: AI Visual Scene Creator
  if (shouldUseTier1(userTier, forceMode)) {
    try {
      return await callAIVisualSceneCreator(params)
    } catch (err) {
      if (forceMode === 'tier1') {
        // Force Tier 1: Try Direct Mode
        return await callDirectMode(params)
      }
      // Fall to Tier 2.5A
    }
  }
  
  // Tier 2.5A: Premium Template (sophisticated)
  if (isPremiumTier(userTier)) {
    try {
      return await callTemplateAB(params, 'A')
    } catch (err) {
      // Fall to Tier 2.5B
    }
  }
  
  // Tier 2.5B: Basic Template (nuclear independent)
  try {
    return await callTemplateAB(params, 'B')
  } catch (err) {
    // Fall to Tier 2.5C
  }
  
  // Tier 2.5C: Nuclear Hardcoded Template
  try {
    return await callTemplateCD(params, 'C')
  } catch (err) {
    // Fall to Tier 2.5D
  }
  
  // Tier 2.5D: Ultimate Emergency (NEVER FAILS)
  return await callTemplateCD(params, 'D')
}
```

### 2.3 Tier System Implementation

**Nuclear Independence Requirements:**
- ✅ No external API dependencies
- ✅ No dependency on higher tiers
- ✅ Can operate with local data only
- ✅ Guaranteed success or graceful degradation

**Tier Selection Logic:**
```typescript
function determineTier(params: GenerationParams): TierConfig {
  const { userTier, avatar, forceMode, contentLength } = params
  
  // Force Mode overrides
  if (forceMode === 'tier1') {
    return { tier: 1, allowEscalation: false }
  }
  
  // Smart Bypass Logic (Content-based only)
  if (userTier === 'guest' && contentLength < 100) {
    return { tier: '2.5B', allowEscalation: true }
  }
  
  // Avatar Quality Assessment
  const avatarScore = calculateAvatarCompleteness(avatar)
  
  if (avatarScore >= 0.8 && userTier === 'premium') {
    return { tier: 1, allowEscalation: true }
  }
  
  if (avatarScore >= 0.4) {
    return { tier: '2.5A', allowEscalation: true }
  }
  
  return { tier: '2.5B', allowEscalation: true }
}
```

### 2.4 Error Handling Patterns

**Standard Error Handling:**
```typescript
// Request body consumption (CRITICAL: Single read only)
async function safeBodyParse(req: Request) {
  try {
    const rawBody = await req.text()
    return JSON.parse(rawBody)
  } catch (err) {
    throw new Error(`Body parse failed: ${err.message}`)
  }
}

// Tier escalation with logging
async function tryTierWithEscalation(
  tierFunc: () => Promise<any>,
  tierName: string,
  nextTier?: () => Promise<any>
) {
  try {
    console.log(`[${tierName}] Attempting...`)
    const result = await tierFunc()
    console.log(`[${tierName}] Success`)
    return { result, tier: tierName, success: true }
  } catch (error) {
    console.error(`[${tierName}] Failed:`, error.message)
    
    if (nextTier) {
      return await tryTierWithEscalation(nextTier, getNextTierName(tierName))
    }
    
    throw error
  }
}

// Emergency response headers
function createEmergencyResponse(content: string) {
  return new Response(
    JSON.stringify({ content }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Emergency-Fallback': 'true',
        'X-Story-Source': 'tier4_nuclear'
      }
    }
  )
}
```

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)

---

## 3. Code Standards & Patterns

### 3.1 TypeScript Guidelines

**Type Safety:**
```typescript
// Always define interfaces for data structures
interface UserInfo {
  name: string
  age: number
  grade: string
  nativeLanguage: string
  readingLevel?: number
}

// Use strict type checking
const processUser = (user: UserInfo): Promise<Result> => {
  // Implementation
}

// Avoid 'any' - use 'unknown' if type is truly unknown
const parseJSON = (data: unknown): ParsedData => {
  if (typeof data === 'string') {
    return JSON.parse(data)
  }
  throw new Error('Invalid data type')
}
```

**Null Safety:**
```typescript
// Use optional chaining and nullish coalescing
const userName = user?.name ?? 'Guest'

// Explicit null checks
if (avatar === null || avatar === undefined) {
  return getDefaultAvatar()
}
```

### 3.2 React Best Practices

**Component Structure:**
```typescript
// Functional components with TypeScript
interface ComponentProps {
  title: string
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  onSubmit, 
  isLoading = false 
}) => {
  // Hooks at top
  const [state, setState] = useState<string>('')
  const { data } = useQuery()
  
  // Event handlers
  const handleSubmit = useCallback(() => {
    onSubmit({ value: state })
  }, [state, onSubmit])
  
  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

**State Management:**
```typescript
// Use appropriate hooks
const [localState, setLocalState] = useState()
const contextValue = useContext(MyContext)
const memoizedValue = useMemo(() => expensiveCalc(), [deps])
const cachedCallback = useCallback(() => {}, [deps])

// Avoid prop drilling - use context for deep data
const UserContext = createContext<UserInfo | null>(null)
```

### 3.3 Error Handling Standards

**Error Boundaries:**
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logErrorToService(error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

**Try-Catch Patterns:**
```typescript
// Specific error handling
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  if (error instanceof NetworkError) {
    return handleNetworkError(error)
  }
  if (error instanceof ValidationError) {
    return handleValidationError(error)
  }
  throw error // Re-throw unknown errors
}

// Logging best practices
console.log('[Component] Action started', { userId, action })
console.error('[Component] Action failed', { error, context })
```

### 3.4 Testing Requirements

**Unit Test Structure:**
```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('renders with correct props', () => {
    const { getByText } = render(<MyComponent title="Test" />)
    expect(getByText('Test')).toBeInTheDocument()
  })
  
  it('handles user interaction', async () => {
    const onSubmit = vi.fn()
    const { getByRole } = render(<MyComponent onSubmit={onSubmit} />)
    
    await userEvent.click(getByRole('button'))
    expect(onSubmit).toHaveBeenCalledWith(expectedData)
  })
})
```

**Edge Function Testing:**
```typescript
// Test with sample request
Deno.test('function handles valid request', async () => {
  const req = new Request('http://localhost:8000', {
    method: 'POST',
    body: JSON.stringify({ userId: '123' })
  })
  
  const res = await handler(req)
  const data = await res.json()
  
  assertEquals(res.status, 200)
  assertExists(data.result)
})
```

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)

---

## 4. Testing & Debugging

### 4.1 Unit Testing

**Frontend Testing:**
```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test src/components/MyComponent.test.tsx

# Watch mode
bun test --watch
```

**Test Coverage Requirements:**
- Critical paths: 90%+ coverage
- Business logic: 80%+ coverage
- UI components: 70%+ coverage

### 4.2 Integration Testing

**End-to-End Testing:**
```typescript
import { test, expect } from '@playwright/test'

test('guest user story flow', async ({ page }) => {
  await page.goto('/')
  
  // Timer should start
  await expect(page.locator('[data-testid="timer"]')).toBeVisible()
  
  // Generate story
  await page.click('[data-testid="start-story"]')
  await expect(page.locator('[data-testid="story-page"]')).toBeVisible()
  
  // Navigate through pages
  for (let i = 1; i <= 6; i++) {
    await expect(page.locator('[data-testid="page-number"]')).toHaveText(`${i}`)
    if (i < 6) {
      await page.click('[data-testid="next-page"]')
    }
  }
  
  // Next story button should appear
  await expect(page.locator('[data-testid="next-story"]')).toBeVisible()
})
```

### 4.3 Debugging Edge Functions

**Local Development:**
```bash
# Serve functions locally
supabase functions serve

# Serve specific function
supabase functions serve generate-adaptive-story

# With debugging
supabase functions serve --debug
```

**Testing Interface:**
- Access `/prompt-testing?debug=1` for image generation testing
- Force Tier 1 testing
- Individual tier testing
- Batch tests
- Connectivity checks

**Log Analysis:**
```typescript
// Structured logging pattern
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  function: 'generate-adaptive-story',
  tier: 'tier1',
  userId: user.id,
  action: 'generation_started',
  metadata: { contentLength, difficulty }
}))
```

### 4.4 Production Monitoring

**Supabase Dashboard:**
- Edge function logs
- Performance metrics
- Error rates
- Invocation counts

**Custom Monitoring:**
```typescript
// Track tier usage
const trackTierUsage = (tier: string, success: boolean) => {
  supabase.from('tier_usage').insert({
    tier,
    success,
    timestamp: new Date().toISOString()
  })
}

// Track generation metrics
const trackGeneration = (type: string, duration: number) => {
  supabase.from('generation_metrics').insert({
    type,
    duration,
    timestamp: new Date().toISOString()
  })
}
```

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)

---

## 5. Deployment Procedures

**Pre-Deployment Checklist:**
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables verified
- [ ] Database migrations tested
- [ ] Edge functions tested locally
- [ ] Documentation updated

**Deployment Steps:**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Run tests
bun test

# 3. Build application
bun run build

# 4. Deploy to Supabase
supabase db push
supabase functions deploy

# 5. Verify deployment
# Check Supabase dashboard for:
# - Function deployment status
# - Database migration success
# - No error spikes

# 6. Monitor production
# - Check error logs
# - Verify tier usage patterns
# - Monitor response times
```

**Rollback Procedure:**
```bash
# If issues detected:
# 1. Revert database migration
supabase db reset

# 2. Redeploy previous function version
supabase functions deploy --no-verify-jwt <function-name>

# 3. Notify team
# 4. Investigate issue
# 5. Create hotfix if needed
```

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)

---

## 6. Future Documentation Needs

**Priority Areas Requiring Documentation:**

### Phase 1 (Q1 2025): Critical Business Logic
1. **Business Logic Flows** - Guest vs Premium differentiation
2. **Story Generation System** - Core narrative engine
3. **User Authentication & Subscription** - Auth flows and payment integration

### Phase 2 (Q2 2025): System Architecture
4. **Database Schema & RLS Policies** - Complete schema documentation
5. **Session & Cache Management** - Non-image caching strategies
6. **Security & Data Protection** - Security architecture and COPPA compliance

### Phase 3 (Q3 2025): User Experience & Performance
7. **Audio Integration Architecture** - TTS and voice synthesis
8. **Frontend Component Architecture** - Component hierarchy and patterns
9. **API Rate Limiting & Performance** - Optimization strategies

### Phase 4 (Q4 2025): Quality & Operations
10. **Testing & Monitoring Suite** - Comprehensive testing strategy
11. **Deployment & DevOps** - CI/CD and automation

**Documentation Standards:**
- Real code examples (no hallucinations)
- Mermaid diagrams for complex flows
- Error handling documentation
- Debug tools and monitoring features
- Performance data and metrics
- Integration point details

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)

---

## Related Documentation

### Core Documentation
- 📘 [Master System Guide](./MASTER_SYSTEM_GUIDE.md) - Complete architecture overview
- 📊 [Operations Guide](./OPERATIONS_GUIDE.md) - Implementation roadmap and status
- 🚨 [Master Errors Document](./MASTER_ERRORS_TO_FIX.md) - Error tracking and troubleshooting
- 🏠 [Documentation Hub](./README.md) - Central navigation

### Specialized Documentation
- 📡 [API Reference](./API_REFERENCE.md) - Edge function API documentation
- 🔧 [Error Handling Standards](./ERROR_HANDLING_STANDARDS.md) - Code standards for errors
- 📱 [Mobile App Guide](./MOBILE_APP_GUIDE.md) - Capacitor implementation

### Implementation Details
- 🔄 [Smart Bypass Fix](./SMART_BYPASS_CRITICAL_FIX_2025_09_28.md) - Business logic fixes
- 🏗️ [Integration Guide](./INTEGRATION_GUIDE.md) - Frontend-backend integration

---

**Document Status:** ✅ Complete and Current  
**Next Review:** 2025-10-06  
**Maintained By:** Engineering Team  
**Version:** 2.0 (Consolidated from DOCUMENTS_TO_UPDATE_2025.md and development standards)

[↑ Back to Top](#development-guide) | [📋 TOC](#table-of-contents)
