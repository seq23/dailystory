/**
 * System Documentation Component
 * Phase 8: Comprehensive documentation and troubleshooting guides
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, Search, Code, AlertTriangle, Settings, Users, Zap } from "lucide-react";

export const SystemDocumentation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const architectureOverview = {
    title: "Streamlined Image Generation Architecture",
    sections: [
      {
        title: "System Overview",
        content: `The system has been optimized for reliability and performance with a focus on essential functionality. Core services handle image generation, character consistency, error recovery, and session management with consolidated logging through the unified debug service.`,
        components: [
          "Runware Image Generation Orchestrator",
          "Character Consistency Service (Database-backed)", 
          "Session State Manager",
          "Error Recovery System",
          "Security Validator",
          "Unified Debug Service"
        ]
      },
      {
        title: "Simplified Data Flow",
        content: `1. User Request → Security Validation → Session Check
2. Character Consistency (Database) → Image Generation
3. Error Recovery (Circuit Breakers) → Unified Logging
4. Response with CORS → Frontend Display`,
        components: []
      },
      {
        title: "Recent Optimizations",
        content: `Console cleanup COMPLETE: All production code now uses DebugLogger system. Removed bloat files, fixed boot failures, consolidated logging through unified-debug-service, and implemented comprehensive error handling with circuit breakers.`,
        components: [
          "500+ console statements migrated to DebugLogger ✅",
          "Zero console statements in production code ✅",
          "Debug mode gating active ✅",
          "Boot validation system streamlined",
          "Logging routed through unified service",
          "Error recovery with progressive degradation"
        ]
      }
    ]
  };

  const culturalProfiles = {
    title: "Cultural Profile System",
    profiles: [
      {
        name: "African American",
        features: "20+ facial feature variations, weighted skin tone distribution, diverse settings",
        settings: "Urban, suburban, professional, educational, recreational environments",
        representation: "Balanced across socioeconomic spectrum"
      },
      {
        name: "Hispanic/Latino",
        features: "Regional variety (Mexican, Caribbean, South American influences)",
        settings: "Family-oriented, community-focused, colorful cultural environments",
        representation: "Diverse national origins and cultural expressions"
      },
      {
        name: "Asian",
        features: "East Asian, Southeast Asian, South Asian representations",
        settings: "Educational, family, cultural, modern and traditional blend",
        representation: "Multiple Asian cultures and traditions"
      },
      {
        name: "European American",
        features: "Various European heritage representations",
        settings: "Suburban, rural, professional, recreational",
        representation: "Diverse European cultural backgrounds"
      },
      {
        name: "Multicultural",
        features: "Mixed heritage, globally inspired appearances",
        settings: "International, diverse community environments",
        representation: "Global cultural fusion and modern diversity"
      }
    ]
  };

  const troubleshootingGuides = [
    {
      issue: "Image Generation Failing - All Tiers",
      symptoms: ["All image tiers failing", "ReferenceError: monitorRequest is not defined", "503 errors from unified-debug-service"],
      causes: ["Boot failures from duplicate exports", "Bad CORS imports", "Missing function definitions"],
      solutions: [
        "Check edge function logs for ReferenceError issues",
        "Verify no duplicate exports in tier25Vocabulary.js",
        "Remove bad CORS imports from unified-debug-service",
        "Force redeploy with updated deploy markers"
      ]
    },
    {
      issue: "Character Consistency Problems",
      symptoms: ["Character appearance changes between scenes", "Database connection errors", "Seed variation too high"],
      causes: ["Database connectivity issues", "Session ID conflicts", "Character cache corruption"],
      solutions: [
        "Check Supabase connection and service role key",
        "Verify character_consistency_cache table exists",
        "Clear character cache via clearServerState()",
        "Ensure session ID uniqueness across requests"
      ]
    },
    {
      issue: "Edge Function Boot Failures",
      symptoms: ["Functions won't start", "Unexpected reserved word errors", "Import/export conflicts"],
      causes: ["Duplicate exports in vocabulary files", "Bad external imports", "Module conflicts"],
      solutions: [
        "Check for duplicate CULTURAL_ARRAYS exports",
        "Remove non-existent external imports",
        "Verify all imports have proper .js extensions",
        "Force redeploy after fixing exports"
      ]
    },
    {
      issue: "Console Logging Migration (COMPLETED ✅)",
      symptoms: ["Previously: Too many console.log statements", "Performance degradation", "Cluttered logs"],
      causes: ["RESOLVED: All 500+ production console statements migrated to DebugLogger", "Structured logging now active", "Debug mode gating implemented"],
      solutions: [
        "✅ ALL COMPLETE: Production console statements eliminated",
        "✅ DebugLogger system active with categorized logging",
        "✅ Debug output only enabled in ?debug=1 mode",
        "✅ Performance optimized - ~90% reduction in console output"
      ]
    }
  ];

  const developerGuides = [
    {
      title: "Adding New Cultural Profiles",
      steps: [
        "Update FrontendIntelligence.js with new cultural profile",
        "Add facial features and cultural markers to cultural arrays",
        "Create setting variations and clothing options",
        "Update cultural enhancement trigger logic",
        "Test bias detection and cultural balance",
        "Update documentation and monitoring"
      ],
      codeExample: `// Add new cultural profile to FrontendIntelligence.js
static NEW_CULTURAL_PROFILE = {
  facialFeatures: ['feature1', 'feature2', 'feature3'],
  skinTones: ['tone1', 'tone2'],
  culturalMarkers: ['marker1', 'marker2'],
  settings: ['setting1', 'setting2']
};

// Update enhancement logic
static shouldApplyNewCulturalVariations(userInfo) {
  return userInfo.nativeLanguage === 'target-lang' && 
         userInfo.avatar?.skinTone === 'target-tone';
}`
    },
    {
      title: "Extending Style Frameworks",
      steps: [
        "Define new difficulty level in styleFrameworks.js",
        "Set appropriate quality parameters",
        "Create prompt templates for the level",
        "Update DifficultyLevelMapper mappings",
        "Test across all backend functions",
        "Monitor performance impact"
      ],
      codeExample: `// Add new style framework
COMPREHENSIVE_STYLE_FRAMEWORKS.expert_plus = {
  name: "Expert Plus",
  artStyle: "masterful digital artistry",
  qualityParameters: {
    steps: 16,
    cfgScale: 5.0,
    strength: 0.9
  }
};`
    },
    {
      title: "Performance Monitoring Setup",
      steps: [
        "Import AdvancedPerformanceMonitor",
        "Set up bias detection hooks",
        "Configure cache monitoring",
        "Implement alert thresholds",
        "Create dashboard integration",
        "Set up automated reporting"
      ],
      codeExample: `// Performance monitoring integration
const result = performanceMonitor.detectCulturalBias(
  prompt, 
  description, 
  culturalContext
);

performanceMonitor.trackGeneration(
  startTime,
  endTime,
  result,
  qualityScore
);`
    }
  ];

  const apiReference = [
    {
      service: "runware-generate-image (Orchestrator)", 
      methods: [
        "POST / - Main image generation endpoint with multi-tier routing",
        "OPTIONS / - CORS preflight handling",
        "Tier routing: 1 (Runware) → 2.5 (Fallback) → 4 (Emergency)",
        "Comprehensive error handling with circuit breakers"
      ]
    },
    {
      service: "CharacterConsistencyService", 
      methods: [
        "getCharacterSeed(sessionId, avatarIdentity, storyContext): CharacterData",
        "saveCharacterToDatabase(sessionId, characterKey, characterData): boolean",
        "getCharacterFromDatabase(sessionId, characterKey): CharacterData",
        "clearServerState(): ClearResult"
      ]
    },
    {
      service: "SessionStateManager",
      methods: [
        "initializeSession(sessionId, userType): SessionData",
        "getSessionData(sessionId): SessionData", 
        "updateSessionData(sessionId, updates): boolean",
        "endSession(sessionId): boolean"
      ]
    },
    {
      service: "ErrorRecoverySystem",
      methods: [
        "handleError(error, context): RecoveryResult",
        "getRecoveryStats(): StatsData",
        "classifyError(error): ErrorType",
        "executeEmergencyFallback(): FallbackResult"
      ]
    },
    {
      service: "unified-debug-service",
      methods: [
        "GET /?operation=recent-image-prompts - Recent image generation logs",
        "GET /?operation=ai-prompts&sessionId=X - AI prompt history",
        "POST /?operation=story-processing - Log story events",
        "GET /?operation=visual-scene-debug - Diagnostic information"
      ]
    }
  ];

  const filterContent = (content: string) => {
    if (!searchTerm) return true;
    return content.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Documentation</h2>
          <p className="text-muted-foreground">
            Comprehensive guides for the Cultural Intelligence System
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="architecture" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="architecture" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>Architecture</span>
          </TabsTrigger>
          <TabsTrigger value="cultural" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Cultural</span>
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Troubleshooting</span>
          </TabsTrigger>
          <TabsTrigger value="developer" className="flex items-center space-x-1">
            <Code className="h-4 w-4" />
            <span>Developer</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-1">
            <Zap className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center space-x-1">
            <Book className="h-4 w-4" />
            <span>Guides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{architectureOverview.title}</CardTitle>
              <CardDescription>
                System design and component relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {architectureOverview.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="text-muted-foreground">{section.content}</p>
                  {section.components.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {section.components.map((component, i) => (
                        <Badge key={i} variant="secondary">{component}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{culturalProfiles.title}</CardTitle>
              <CardDescription>
                Detailed breakdown of supported cultural representations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {culturalProfiles.profiles.map((profile, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">Features</h4>
                        <p className="text-sm text-muted-foreground">{profile.features}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Settings</h4>
                        <p className="text-sm text-muted-foreground">{profile.settings}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Representation</h4>
                        <p className="text-sm text-muted-foreground">{profile.representation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
              <CardDescription>
                Common issues and their solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {troubleshootingGuides
                  .filter(guide => filterContent(guide.issue + guide.symptoms.join(' ') + guide.causes.join(' ')))
                  .map((guide, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{guide.issue}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Symptoms</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {guide.symptoms.map((symptom, i) => (
                            <li key={i}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Possible Causes</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {guide.causes.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Solutions</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                          {guide.solutions.map((solution, i) => (
                            <li key={i}>{solution}</li>
                          ))}
                        </ol>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-4">
          <div className="grid gap-4">
            {developerGuides
              .filter(guide => filterContent(guide.title + guide.steps.join(' ')))
              .map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Steps</h4>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                      {guide.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Code Example</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {guide.codeExample}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Available services and methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apiReference.map((service, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-semibold">{service.service}</h3>
                    <div className="space-y-2">
                      {service.methods.map((method, i) => (
                        <code key={i} className="block bg-muted p-2 rounded text-sm">
                          {method}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guides</CardTitle>
              <CardDescription>
                Get started with system monitoring and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      1. Check cultural representation dashboard<br/>
                      2. Review bias detection alerts<br/>
                      3. Monitor generation performance<br/>
                      4. Check A/B test results<br/>
                      5. Review user feedback
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      1. Clear expired character seeds<br/>
                      2. Analyze cultural balance trends<br/>
                      3. Update prompt cache if needed<br/>
                      4. Review performance metrics<br/>
                      5. Update documentation
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};