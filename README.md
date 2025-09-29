# Time2Read - AI-Powered Story Generation Platform

## 📖 Project Overview

Time2Read is an innovative AI-powered platform that creates personalized, never-ending stories for children and learners. The platform features distinct experiences for guest and premium users, with sophisticated story generation, image creation, and monitoring systems.

**Project URL**: https://lovable.dev/projects/592147a7-1050-4b6c-af2b-895053e775df

## 🎯 Core Features

### User Experience Tiers

#### 🆓 Guest Users (Free)
- **20-minute session timer** with pause/resume controls
- **6-page story limit** per story (artificial business cutoff)
- **Netflix-style generation**: 10-12+ pages generated, only 6 visible
- **"Next Story" progression**: Artificial limit to encourage upgrades
- **Fresh image per page** with backward navigation caching
- **No story endings**: Business decision to drive premium conversions

#### 💎 Premium Users (Paid)
- **Unlimited session time** (dismissible timer)
- **Live page-by-page generation** (no artificial limits)
- **"Finish Story" control**: User-driven story endings
- **Part II/III continuation**: Extend stories indefinitely
- **Story library**: Save stories with all original images
- **Magic wand re-writing**: Regenerate stories with new content

### 🔄 Never-Ending Story System
- **Core principle**: Stories designed to continue indefinitely
- **AI behavior**: Never naturally concludes, always prepared to continue
- **Business differentiation**: Artificial cutoffs for guests, unlimited for premium

## 🏗️ Technical Architecture

### Frontend Architecture
```
AuthWrapper
├── GuestExperience (Timer + 6-page limit)
└── AuthenticatedApp (Premium features)
```

### Story Generation Pipeline
- **Netflix Service** (`src/services/NetflixStyleStoryService.ts`): Batch generation for guests
- **Live Service** (`src/services/storyGenerationService.ts`): Real-time generation for premium
- **Template Service** (`supabase/functions/template-service/`): Universal fallback

### Image Generation System
- **Primary**: Runware Flux models (configurable in `appConfig.ts`)
- **Fallback**: OpenAI DALL-E 3
- **Caching**: Browser-based with navigation consistency
- **Providers**: Dual-provider architecture with automatic failover

### Monitoring & Debugging
- **Emergency Throttling**: Implemented to prevent edge function quota burn
- **Manual Refresh**: All monitoring components default to manual refresh
- **Live Updates**: Optional auto-refresh with visibility detection
- **Debug Tools**: Comprehensive logging and performance tracking

## 🚨 Critical System Features

### Emergency Edge Function Throttling
Due to excessive edge function usage (2.98M invocations), emergency measures implemented:

- **Auto-refresh disabled** by default on all monitoring components
- **Manual refresh controls** added to prevent quota burn
- **Increased polling intervals** (5-10x longer when enabled)
- **Visibility state detection** (no background polling)
- **Expected 95% usage reduction**

### Session Management
- **Cache clearing triggers**:
  - Guests: "Next Story" or session timeout
  - Premium: Session end or story re-write
  - Both: Browser refresh/reload

## 🛠️ Development Setup

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Local Development
```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

### Configuration Files
- `src/config/appConfig.ts`: Centralized app configuration
- `src/constants/app.ts`: Application-wide constants
- `supabase/config.toml`: Edge function configuration

## 🔧 Monitoring & Performance

### Edge Function Management
- **47 edge functions** deployed for various services
- **Manual monitoring**: Use refresh buttons, avoid auto-polling
- **Usage tracking**: Monitor via Supabase dashboard
- **Quota awareness**: Critical for preventing overages

### Development Guidelines
1. **Enable live updates sparingly** - Only when actively debugging
2. **Use manual refresh** for routine monitoring
3. **Close monitoring panels** when not in use
4. **Monitor usage regularly** via Supabase dashboard

### Production Deployment
- **Deploy via Lovable**: Click Share → Publish
- **Custom domain**: Project → Settings → Domains
- **Monitor edge function usage** post-deployment

## 📊 Business Intelligence

### Key Metrics
- **Guest conversion**: "Next Story" → upgrade conversion
- **Premium engagement**: Story length, continuation rates
- **Content quality**: Validation success rates
- **Technical performance**: Generation times, cache hit ratios

### A/B Testing Opportunities
- Guest page limits (4, 6, 8 pages)
- Timer durations (15, 20, 25 minutes)
- Upgrade messaging and timing
- Content difficulty optimization

## 🔒 Compliance & Safety

### Child Safety (COPPA)
- Data minimization
- Parental consent for under-13
- Age-appropriate content filtering
- Secure processing and limited retention

### Content Moderation
- AI safeguards in generation prompts
- Pre-reviewed template content
- User reporting mechanisms
- Automated content scanning

## 📚 Documentation

**📚 [Documentation Hub](docs/README.md)** - Start here for role-based navigation

### Quick Access by Role
- **Developers**: [Development Guide](docs/DEVELOPMENT_GUIDE.md) | [Authentication Model](docs/AUTHENTICATION_MODEL.md) | [API Reference](docs/API_REFERENCE.md)
- **Operations**: [Operations Guide](docs/OPERATIONS_GUIDE.md) | [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- **Management**: [Master System Guide](docs/MASTER_SYSTEM_GUIDE.md) | [Master Errors](docs/MASTER_ERRORS_TO_FIX.md)

### Core Documentation
- **[Master System Guide](docs/MASTER_SYSTEM_GUIDE.md)**: Complete architecture + business logic
- **[Authentication Model](docs/AUTHENTICATION_MODEL.md)**: **NEW:** Premium access model explained
- **[Operations Guide](docs/OPERATIONS_GUIDE.md)**: Current status, roadmap, monitoring
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Setup, patterns, standards, debugging
- **[API Reference](docs/API_REFERENCE.md)**: All 40 edge functions with examples
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Deployment procedures and checklists
- **[Master Errors](docs/MASTER_ERRORS_TO_FIX.md)**: Known issues and troubleshooting

## 🚀 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI Services**: OpenAI GPT-4, DALL-E 3
- **Image Generation**: Runware Flux, OpenAI fallbacks
- **State Management**: TanStack Query
- **Routing**: React Router v6

## 🔗 Useful Links

- [Lovable Documentation](https://docs.lovable.dev/)
- [Project Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Supabase Documentation](https://supabase.com/docs)
- [Custom Domain Setup](https://docs.lovable.dev/tips-tricks/custom-domain)

## 📈 Performance Metrics

- **Story Generation**: ~2-5 seconds per page
- **Image Generation**: ~3-8 seconds per image
- **Cache Hit Rate**: >80% for backward navigation
- **Uptime**: 99.9% availability target
- **Edge Function Usage**: <1M monthly (post-throttling)

---

**Last Updated**: September 22, 2025  
**Version**: 3.1 (Console Cleanup In Progress)  
**Status**: Core Features Operational ⚠️ (Console cleanup ongoing - see `docs/MASTER_ERRORS_TO_FIX.md`)