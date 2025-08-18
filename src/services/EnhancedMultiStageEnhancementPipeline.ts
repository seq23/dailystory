// Enhanced Multi-Stage Enhancement Pipeline with Placeholder Integration
// Processes input through structured enhancement stages with proper placeholder resolution

import { UserInfo, DifficultyLevel } from "@/types";
import { resolveAllPlaceholders } from "@/utils/placeholderResolver";
import { PlaceholderValidationService } from "./PlaceholderValidationService";
import { DifficultyLevelMapper } from "./DifficultyLevelMapper";
import { AdvancedCharacterEngine, CharacterDescriptor } from "./AdvancedCharacterEngine";
import { StructuredPromptEngine, PromptTemplate } from "./StructuredPromptEngine";
import { MulticulturalVisualService } from "./MulticulturalVisualService";
import { StoryVisualStateManager } from "./storyVisualState";
import { AdvancedQualityEngine } from "./AdvancedQualityEngine";

export interface EnhancementStage {
  name: string;
  priority: number;
  processor: (input: string, context: EnhancementContext) => Promise<EnhancementStageResult>;
  validator?: (result: EnhancementStageResult) => boolean;
  fallback?: () => EnhancementStageResult;
}

export interface EnhancementContext {
  userInfo: UserInfo;
  pageNumber: number;
  sessionId: string;
  pageText?: string;
  difficulty: DifficultyLevel;
  characters?: CharacterDescriptor[];
}

export interface EnhancementStageResult {
  success: boolean;
  data: any;
  processingTime: number;
  qualityScore: number;
  issues: string[];
}

export interface PipelineResult {
  finalPrompt: string;
  template: PromptTemplate;
  characters: CharacterDescriptor[];
  parameters: RunwareParameters;
  qualityScore: number;
  processingMetrics: {
    totalTime: number;
    stagesCompleted: number;
    placeholderValidation: any;
  };
  recommendations: string[];
}

export interface RunwareParameters {
  model: string;
  cfgScale: number;
  steps: number;
  width: number;
  height: number;
  seed?: number;
}

export class EnhancedMultiStageEnhancementPipeline {
  private static readonly STAGES: EnhancementStage[] = [
    {
      name: "Placeholder Validation & Resolution",
      priority: 1,
      processor: this.validateAndResolvePlaceholders.bind(this),
      validator: (result) => result.success && result.qualityScore > 0.8
    },
    {
      name: "Difficulty Level Mapping",
      priority: 2,
      processor: this.mapDifficultyLevel.bind(this),
      validator: (result) => result.success
    },
    {
      name: "Character Detection & Consistency",
      priority: 3,
      processor: this.detectAndEnhanceCharacters.bind(this),
      validator: (result) => result.success && result.data.characters.length > 0
    },
    {
      name: "Cultural Context Enhancement",
      priority: 4,
      processor: this.enhanceCulturalContext.bind(this),
      validator: (result) => result.success
    },
    {
      name: "Structured Prompt Composition",
      priority: 5,
      processor: this.composeStructuredPrompt.bind(this),
      validator: (result) => result.success && result.data.template
    },
    {
      name: "Parameter Optimization",
      priority: 6,
      processor: this.optimizeParameters.bind(this),
      validator: (result) => result.success && result.data.parameters
    }
  ];

  /**
   * Main pipeline processor with comprehensive enhancement
   */
  static async processThroughPipeline(
    input: string,
    userInfo: UserInfo,
    pageNumber: number,
    sessionId: string
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const context: EnhancementContext = {
      userInfo,
      pageNumber,
      sessionId,
      pageText: input,
      difficulty: DifficultyLevelMapper.normalizeLevel(
        userInfo.readingLevel || userInfo.difficultyLevel || 'easy'
      )
    };

    let stagesCompleted = 0;
    let placeholderValidation: any = null;
    let characters: CharacterDescriptor[] = [];
    let template: PromptTemplate | null = null;
    let parameters: RunwareParameters | null = null;
    const recommendations: string[] = [];
    let qualityScore = 0;

    console.log(`🔄 Starting enhanced pipeline for page ${pageNumber}...`);

    // Process through all stages
    for (const stage of this.STAGES) {
      try {
        console.log(`⚙️ Processing stage: ${stage.name}`);
        const stageResult = await stage.processor(input, context);

        if (stageResult.success) {
          stagesCompleted++;
          qualityScore += stageResult.qualityScore;
          
          // Store stage-specific results
          switch (stage.name) {
            case "Placeholder Validation & Resolution":
              placeholderValidation = stageResult.data;
              input = stageResult.data.resolvedText; // Use resolved text for subsequent stages
              break;
            case "Character Detection & Consistency":
              characters = stageResult.data.characters;
              context.characters = characters;
              // Track visual details for consistency
              StoryVisualStateManager.analyzeAndTrackVisualDetails(context.sessionId, input, context.pageNumber);
              input = StoryVisualStateManager.enhanceTextWithConsistentDetails(context.sessionId, input, context.pageNumber);
              break;
            case "Structured Prompt Composition":
              // Apply advanced quality enhancement in final stage
              const enhancementResult = AdvancedQualityEngine.optimizeForChildrensBooks(
                input, 
                context.sessionId, 
                context.pageNumber, 
                context.userInfo
              );
              input = enhancementResult.enhancedPrompt;
              template = stageResult.data.template;
              console.log(`🎨 Applied quality enhancements: ${enhancementResult.optimizations.join(', ')}`);
              break;
            case "Parameter Optimization":
              parameters = stageResult.data.parameters;
              break;
          }

          if (stageResult.issues.length > 0) {
            recommendations.push(...stageResult.issues);
          }
        } else {
          console.warn(`⚠️ Stage ${stage.name} failed, using fallback`);
          if (stage.fallback) {
            const fallbackResult = stage.fallback();
            recommendations.push(`Used fallback for ${stage.name}: ${fallbackResult.issues.join(', ')}`);
          }
        }
      } catch (error) {
        console.error(`❌ Stage ${stage.name} encountered error:`, error);
        recommendations.push(`Error in ${stage.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Ensure we have all required components
    if (!template) {
      template = this.createFallbackTemplate(input, userInfo, characters);
      recommendations.push('Used fallback template due to processing errors');
    }

    if (!parameters) {
      parameters = this.getDefaultParameters();
      recommendations.push('Used default parameters due to processing errors');
    }

    const finalPrompt = StructuredPromptEngine.templateToPrompt(template);
    const totalTime = Date.now() - startTime;
    const finalQualityScore = stagesCompleted > 0 ? qualityScore / stagesCompleted : 0;

    console.log(`✅ Pipeline completed in ${totalTime}ms with ${stagesCompleted}/${this.STAGES.length} stages`);

    return {
      finalPrompt,
      template,
      characters,
      parameters,
      qualityScore: finalQualityScore,
      processingMetrics: {
        totalTime,
        stagesCompleted,
        placeholderValidation
      },
      recommendations
    };
  }

  // Stage processor implementations

  private static async validateAndResolvePlaceholders(
    input: string,
    context: EnhancementContext
  ): Promise<EnhancementStageResult> {
    const startTime = Date.now();
    
    try {
      const validation = PlaceholderValidationService.validatePlaceholders(
        input,
        context.userInfo,
        context.pageText
      );

      return {
        success: validation.isValid,
        data: validation,
        processingTime: Date.now() - startTime,
        qualityScore: validation.validationScore,
        issues: validation.recommendations
      };
    } catch (error) {
      return {
        success: false,
        data: { resolvedText: input },
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        issues: [`Placeholder validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static async mapDifficultyLevel(
    input: string,
    context: EnhancementContext
  ): Promise<EnhancementStageResult> {
    const startTime = Date.now();
    
    try {
      const originalLevel = context.userInfo.readingLevel || context.userInfo.difficultyLevel || 'easy';
      const mappedLevel = DifficultyLevelMapper.normalizeLevel(originalLevel);
      
      context.difficulty = mappedLevel;

      return {
        success: true,
        data: { 
          originalLevel, 
          mappedLevel,
          isValid: DifficultyLevelMapper.isValidBackendLevel(mappedLevel)
        },
        processingTime: Date.now() - startTime,
        qualityScore: 1.0,
        issues: []
      };
    } catch (error) {
      return {
        success: false,
        data: { mappedLevel: 'easy' },
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        issues: [`Difficulty mapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static async detectAndEnhanceCharacters(
    input: string,
    context: EnhancementContext
  ): Promise<EnhancementStageResult> {
    const startTime = Date.now();
    
    try {
      const characters = AdvancedCharacterEngine.detectCharactersInText(
        input,
        context.sessionId,
        context.userInfo,
        context.pageNumber
      );

      const qualityScore = characters.length > 0 ? 1.0 : 0.5;
      const issues: string[] = [];

      if (characters.length === 0) {
        issues.push('No characters detected in text');
      }

      return {
        success: true,
        data: { characters },
        processingTime: Date.now() - startTime,
        qualityScore,
        issues
      };
    } catch (error) {
      return {
        success: false,
        data: { characters: [] },
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        issues: [`Character detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static async enhanceCulturalContext(
    input: string,
    context: EnhancementContext
  ): Promise<EnhancementStageResult> {
    const startTime = Date.now();
    
    try {
      const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(
        context.userInfo.nativeLanguage as any
      );

      const enhancedInput = `${input} with ${culturalProfile.culturalElements.join(', ')}`;

      return {
        success: true,
        data: { culturalProfile, enhancedInput },
        processingTime: Date.now() - startTime,
        qualityScore: 0.9,
        issues: []
      };
    } catch (error) {
      return {
        success: false,
        data: { enhancedInput: input },
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        issues: [`Cultural enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static async composeStructuredPrompt(
    input: string,
    context: EnhancementContext
  ): Promise<EnhancementStageResult> {
    const startTime = Date.now();
    
    try {
      const template = StructuredPromptEngine.composeStructuredPrompt(
        input,
        context.userInfo,
        context.pageNumber,
        context.characters || [],
        undefined
      );

      return {
        success: true,
        data: { template },
        processingTime: Date.now() - startTime,
        qualityScore: 0.95,
        issues: []
      };
    } catch (error) {
      return {
        success: false,
        data: { template: this.createFallbackTemplate(input, context.userInfo, context.characters || []) },
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        issues: [`Prompt composition failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static async optimizeParameters(
    input: string,
    context: EnhancementContext
  ): Promise<EnhancementStageResult> {
    const startTime = Date.now();
    
    try {
      const baseParams = this.getDefaultParameters();
      const characterCount = context.characters?.length || 0;
      
      // Adjust parameters based on complexity
      const optimizedParams = this.adjustParametersForComplexity(baseParams, characterCount, context.difficulty);

      return {
        success: true,
        data: { parameters: optimizedParams },
        processingTime: Date.now() - startTime,
        qualityScore: 0.9,
        issues: []
      };
    } catch (error) {
      return {
        success: false,
        data: { parameters: this.getDefaultParameters() },
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        issues: [`Parameter optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // Helper methods

  private static createFallbackTemplate(
    input: string,
    userInfo: UserInfo,
    characters: CharacterDescriptor[]
  ): PromptTemplate {
    return {
      visualAppearance: MulticulturalVisualService.generateCulturalCharacterDescription(userInfo),
      secondaryCharacters: '',
      sceneDescription: input,
      culturalSetting: MulticulturalVisualService.generateCulturalSetting(userInfo),
      styleFramework: 'Simple children\'s book illustration',
      qualityEnhancement: 'High quality, child-friendly illustration'
    };
  }

  private static getDefaultParameters(): RunwareParameters {
    return {
      model: "runware:100@1",
      cfgScale: 3.5, // Optimal for children's book style consistency
      steps: 10, // Optimal quality/speed balance  
      width: 1024,
      height: 1024
    };
  }

  private static adjustParametersForComplexity(
    baseParams: RunwareParameters,
    characterCount: number,
    difficulty: DifficultyLevel
  ): RunwareParameters {
    const adjusted = { ...baseParams };

    // Adjust based on character complexity (keep within optimal ranges)
    if (characterCount > 2) {
      adjusted.steps = Math.min(12, adjusted.steps + 2); // Stay within 8-12 optimal range
      adjusted.cfgScale = Math.min(4, adjusted.cfgScale + 0.5); // Stay within 3-4 optimal range
    }

    // Adjust based on difficulty level (minimal adjustments to maintain quality)
    const difficultyMultipliers = {
      'beginner': { steps: 1.0, cfg: 1.0 },
      'easy': { steps: 1.0, cfg: 1.0 },
      'medium': { steps: 1.1, cfg: 1.0 },
      'hard': { steps: 1.2, cfg: 1.1 },
      'expert': { steps: 1.2, cfg: 1.1 }
    };

    const multiplier = difficultyMultipliers[difficulty];
    adjusted.steps = Math.min(12, Math.round(adjusted.steps * multiplier.steps)); // Cap at 12
    adjusted.cfgScale = Math.min(4, adjusted.cfgScale * multiplier.cfg); // Cap at 4

    return adjusted;
  }
}