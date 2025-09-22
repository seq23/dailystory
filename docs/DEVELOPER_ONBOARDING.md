# Developer Onboarding Guide

## 🎯 Welcome to Time2Read Development

This guide will get you up and running with the Time2Read codebase, understanding the architecture, and contributing effectively to the platform.

## 📋 Prerequisites

### Required Software
- **Node.js**: v18+ ([install via nvm](https://github.com/nvm-sh/nvm))
- **npm**: v8+ (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### Recommended Tools
- **Supabase CLI**: For local edge function development
- **Browser Dev Tools**: Chrome/Firefox developer extensions
- **Postman/Insomnia**: API testing (optional)

## 🚀 Quick Start

### 1. Repository Setup
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd time2read

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Environment Configuration
The app uses Supabase for backend services. Configuration is handled through:
- `src/config/appConfig.ts`: Main application settings
- `src/constants/app.ts`: Application constants
- `supabase/config.toml`: Edge function configuration

### 3. First Run Verification
1. Navigate to `http://localhost:5173`
2. Verify the guest experience loads (20-minute timer should appear)
3. Check browser console for any errors
4. Test basic story generation flow

## 🏗️ Architecture Overview

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route-based page components  
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── config/             # Configuration files
├── constants/          # Application constants
├── utils/              # Helper utilities
└── integrations/       # External service integrations
```

### Backend Structure (Supabase)
```
supabase/
├── functions/          # Edge functions (47 total)
├── migrations/         # Database schema changes
└── config.toml        # Function deployment config
```

## 🔄 Understanding User Flows

### Guest User Experience
1. **Entry**: Lands on main page, 20-minute timer starts
2. **Story Generation**: Netflix-style batch generation (10-12 pages)
3. **Page Limit**: Can only view pages 1-6
4. **Progression**: \"Next Story\" button on page 6 (artificial cutoff)
5. **Cache Clearing**: New story clears previous cache
6. **Session End**: Timer expires, all cache cleared

### Premium User Experience  
1. **Entry**: Same landing, but can dismiss timer
2. **Story Generation**: Live generation (page-by-page)
3. **No Limits**: Can continue stories indefinitely
4. **Story Control**: \"Finish Story\" button for user-driven endings
5. **Library**: Save stories with all images
6. **Magic Wand**: Re-write stories (clears cache, new generation)

## 🛠️ Development Workflow

### Working with Stories

#### Netflix-Style Service (Guests)
```typescript
// src/services/NetflixStyleStoryService.ts
// Handles batch story generation for guests
// Key: Generates 10-12+ pages, only shows 6
```

#### Live Generation Service (Premium)
```typescript  
// src/services/storyGenerationService.ts
// Handles real-time page-by-page generation
// Key: Infinite continuation capability
```

### Working with Images
```typescript
// Image generation uses dual-provider system
// Primary: Runware (configured in appConfig.ts)
// Fallback: OpenAI DALL-E 3
// Consistency: Character tracking across pages
```

### Working with Monitoring
**⚠️ CRITICAL: Edge Function Quota Management**

All monitoring components have auto-refresh **DISABLED** by default due to quota burn incident (2.98M invocations).

```typescript
// DO NOT enable auto-refresh unless absolutely necessary
const { autoRefresh = false, refreshInterval = 300000 } = options;

// Use manual refresh buttons instead
const handleManualRefresh = () => {
  // Trigger data refresh
};
```

## 🔧 Configuration Deep Dive

### `src/config/appConfig.ts`
Central configuration hub:
```typescript
export const APP_CONFIG: AppConfig = {
  images: {
    defaultProvider: 'runware', // Primary image provider
    fallbackProvider: 'openai', // Fallback provider
    // ... provider-specific settings
  },
  features: {
    resumeOnRefresh: {
      premium: false,  // Disabled for stability
      guest: false,    // Disabled for stability  
    },
    // ... other feature flags
  }
};
```

### Edge Function Development
When creating new edge functions:

1. **Security First**: Always add CORS headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

2. **Usage Awareness**: Monitor invocations to prevent quota burn
3. **Manual Triggers**: Prefer manual over automatic calling
4. **Batch Operations**: Combine multiple operations when possible

## 🚨 Critical Development Guidelines

### Emergency Throttling Compliance
Due to the recent quota incident, all new monitoring features MUST:
- Default to manual refresh only
- Include explicit user controls for live updates  
- Implement visibility state detection
- Use conservative polling intervals (5+ minutes)

### Performance Requirements
- **Story Generation**: Target <5 seconds per page
- **Image Generation**: Target <8 seconds per image  
- **Cache Hit Rate**: Maintain >80% for backward navigation
- **Bundle Size**: Keep initial load <2MB

### Code Quality Standards
```typescript
// Use TypeScript strict mode
// Follow React hooks best practices  
// Implement proper error boundaries
// Add comprehensive error handling
// Include meaningful console logging
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Guest experience: Timer, 6-page limit, \"Next Story\"
- [ ] Premium experience: Dismissible timer, unlimited pages
- [ ] Image consistency: Same images on backward navigation
- [ ] Cache clearing: Proper behavior on story transitions
- [ ] Error handling: Graceful fallbacks for failed generations

### Automated Testing (Future Enhancement)
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical user flows
- Performance benchmarking

## 📊 Monitoring & Debugging

### Available Debug Tools
1. **UnifiedDebugMonitor**: Comprehensive system monitoring
2. **SecurityDashboard**: Security event tracking
3. **CacheInspectorPanel**: Cache state inspection
4. **AdvancedSystemStatus**: System health overview
5. **Console Logs**: Detailed execution logging

### Debugging Best Practices
- Use manual refresh buttons, avoid auto-polling
- Check browser console for errors and warnings
- Monitor network tab for failed requests
- Use React DevTools for component state inspection

### Performance Monitoring
```typescript
// Built-in performance tracking
import { PerformanceMonitor } from '@/utils/monitoring';

const monitor = new PerformanceMonitor();
monitor.startTiming('operation-name');
// ... perform operation
monitor.endTiming('operation-name');
```

## 🔐 Security Considerations

### Authentication Flow
- Supabase handles all authentication
- JWT tokens for API access
- Premium status checking via edge functions
- RLS policies for data access

### Content Safety
- AI prompt filtering for appropriate content
- Template fallbacks for content safety
- User reporting mechanisms
- Child safety (COPPA) compliance

### Edge Function Security
```typescript
// Always validate user input
// Use Supabase client methods (never raw SQL)
// Implement proper error handling
// Add comprehensive logging
```

## 📚 Additional Resources

### Documentation
- [`README.md`](../README.md): Project overview and setup
- [`docs/BUSINESS_LOGIC_DOCUMENTATION.md`](./BUSINESS_LOGIC_DOCUMENTATION.md): Business rules
- [`docs/EMERGENCY_EDGE_FUNCTION_THROTTLING.md`](./EMERGENCY_EDGE_FUNCTION_THROTTLING.md): Throttling guide
- [`supabase/functions/_shared/SYSTEM_ARCHITECTURE.md`](../supabase/functions/_shared/SYSTEM_ARCHITECTURE.md): Technical architecture

### External Links
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🆘 Getting Help

### Internal Resources
- Check existing documentation first
- Review similar components in the codebase
- Use debug tools for troubleshooting

### Common Issues & Solutions

#### Edge Function Quota Exceeded
- **Problem**: Too many automatic function calls
- **Solution**: Use manual refresh, disable auto-polling

#### Story Generation Fails  
- **Problem**: AI service unavailable
- **Solution**: Check template service fallback, verify edge functions

#### Image Loading Issues
- **Problem**: Image generation or caching problems
- **Solution**: Check both Runware and OpenAI services, verify cache state

#### Premium Features Not Working
- **Problem**: User tier detection issues
- **Solution**: Verify authentication, check premium status edge function

## 🏗️ Edge Function Receptionist Pattern V4.2

### Dual-File Architecture
All edge functions now use a **Receptionist Pattern** to eliminate CORS issues and import/export errors:

- **`index.ts`** (Receptionist): Handles CORS, health checks, OPTIONS preflight
- **`index.js`** (Handler): Contains business logic, POST-only processing

### Receptionist Responsibilities
The TypeScript receptionist (`index.ts`) handles:
```typescript
// CORS headers (applied to ALL responses)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Cache-Control': 'public, max-age=600',
  'Vary': 'Origin'
};

// Health endpoints
HEAD /health    // No body, fast load balancer probes
GET /health     // JSON response with service status  
OPTIONS *       // CORS preflight (204, Max-Age: 600)
```

### Handler Requirements
Business logic handlers (`index.js`) must:
```javascript
// ✅ CORRECT: Export on declaration
export default async function handleRequest(req) {
  // POST-only business logic
}

// ❌ NEVER: Export at end of file
// export default handleRequest;
```

### CORS Configuration (Copy-Paste Ready)
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS', 
  'Cache-Control': 'public, max-age=600',
  'Vary': 'Origin'
};

function withCors(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
```

### Development Guardrails

#### 🚫 Never Do
- Export handlers at end of file (`export default handleRequest;`)
- Mix CORS handling in business logic
- Use raw SQL in edge functions
- Enable auto-refresh on monitoring components

#### ✅ Always Do
- Export handlers on declaration
- Use Supabase client methods only
- Include comprehensive error handling
- Test CORS preflight behavior

### Deployment Pre-Flight Checklist
```bash
# 1. Format and validate
deno fmt supabase/functions/your-function/index.js
deno check supabase/functions/your-function/index.js

# 2. Local testing
supabase functions serve your-function --no-verify-jwt

# 3. Health check validation  
curl -I http://localhost:54321/functions/v1/your-function/health
# Expect: 200 OK with CORS headers, no body

# 4. CORS preflight test
curl -X OPTIONS http://localhost:54321/functions/v1/your-function \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization"
# Expect: 204 No Content with Max-Age: 600

# 5. POST functionality test
curl -X POST http://localhost:54321/functions/v1/your-function \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Sanity Checklist for CI/CD
- [ ] `deno check` passes without errors
- [ ] HEAD `/health` returns 200 with CORS headers
- [ ] OPTIONS returns 204 with `Max-Age: 600`
- [ ] No authentication required for health probes
- [ ] Browser DevTools shows cached preflight (no duplicate OPTIONS)
- [ ] All responses include complete CORS header set

---

**Last Updated**: January 2025  
**Version**: 4.2 (Receptionist Pattern Edition)  
**Developer Guide Status**: Ready for Use ✅
