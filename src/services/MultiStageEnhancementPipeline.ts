// Multi-Stage Enhancement Pipeline
// Phase 2: Layered AI processing for optimal results

import { StructuredPromptEngine, PromptTemplate } from "./StructuredPromptEngine";
import { AdvancedCharacterEngine, CharacterDescriptor } from "./AdvancedCharacterEngine";
import { MulticulturalVisualService } from "./MulticulturalVisualService";
import { PromptLengthManager, PromptSegment, PromptPriority } from "../utils/promptLengthManager";
import { UserInfo, DifficultyLevel } from "@/types";
import { SupportedLanguage } from "@/types/multilingual";

export interface EnhancementStage {
  name: string;
  priority: number;
  processor: (input: any) => Promise<any>;
  validator: (output: any) => boolean;
  fallback: (input: any) => any;
}

export interface PipelineResult {
  finalPrompt: string;
  enhancedCharacters: CharacterDescriptor[];
  optimizedParameters: RunwareParameters;
  qualityScore: number;
  stagesCompleted: string[];
  fallbacksUsed: string[];
  processingTime: number;
}

export interface RunwareParameters {
  model: string;
  cfgScale: number;
  steps: number;
  scheduler: string;
  strength: number;
  seed?: number;
  width: number;
  height: number;
}

export class MultiStageEnhancementPipeline {
  private static readonly STAGES: EnhancementStage[] = [
    {
      name: 'Scene Extraction & Cultural Enhancement',
      priority: 1,
      processor: MultiStageEnhancementPipeline.enhanceSceneWithCulture,
      validator: (output) => output && output.length > 50,
      fallback: (input) => input.originalText
    },
    {
      name: 'Character Consistency Injection',
      priority: 2,
      processor: MultiStageEnhancementPipeline.injectCharacterConsistency,
      validator: (output) => output && output.characters.length > 0,
      fallback: (input) => ({ characters: [], description: input.sceneDescription })
    },
    {
      name: 'Style Framework Application',
      priority: 3,
      processor: MultiStageEnhancementPipeline.applyStyleFramework,
      validator: (output) => output && output.styleElements.length > 0,
      fallback: (input) => ({ styleElements: ['children\'s book illustration'], prompt: input.prompt })
    },
    {
      name: 'Quality Optimization',
      priority: 4,
      processor: MultiStageEnhancementPipeline.optimizeQuality,
      validator: (output) => output && output.optimizedPrompt.length > 0,
      fallback: (input) => ({ optimizedPrompt: input.prompt, parameters: input.parameters })
    },
    {
      name: 'Parameter Optimization',
      priority: 5,
      processor: MultiStageEnhancementPipeline.optimizeParameters,
      validator: (output) => output && output.cfgScale > 0,
      fallback: () => MultiStageEnhancementPipeline.getDefaultParameters()
    }
  ];

  /**
   * Main pipeline execution
   */
  static async processThroughPipeline(
    storyText: string,
    userInfo: UserInfo,
    sessionId: string,
    pageNumber: number,
    totalPages: number = 10
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const stagesCompleted: string[] = [];
    const fallbacksUsed: string[] = [];
    
    console.log(`🔄 Starting multi-stage enhancement pipeline for page ${pageNumber}`);
    
    // Initial context
    let pipelineContext = {
      originalText: storyText,
      userInfo,
      sessionId,
      pageNumber,
      totalPages,
      sceneDescription: '',
      characters: [] as CharacterDescriptor[],
      styleElements: [] as string[],
      prompt: '',
      parameters: this.getDefaultParameters(),
      qualityScore: 0
    };

    // Execute stages sequentially
    for (const stage of this.STAGES) {
      try {
        console.log(`🎯 Processing stage: ${stage.name}`);
        
        const stageResult = await stage.processor(pipelineContext);
        
        if (stage.validator(stageResult)) {
          // Merge stage result into context
          pipelineContext = { ...pipelineContext, ...stageResult };
          stagesCompleted.push(stage.name);
          console.log(`✅ Stage completed: ${stage.name}`);
        } else {
          // Use fallback
          const fallbackResult = stage.fallback(pipelineContext);
          pipelineContext = { ...pipelineContext, ...fallbackResult };
          fallbacksUsed.push(stage.name);
          console.log(`⚠️ Using fallback for stage: ${stage.name}`);
        }
      } catch (error) {
        console.error(`❌ Stage failed: ${stage.name}`, error);
        const fallbackResult = stage.fallback(pipelineContext);
        pipelineContext = { ...pipelineContext, ...fallbackResult };
        fallbacksUsed.push(stage.name);
      }
    }

    const processingTime = Date.now() - startTime;
    
    const result: PipelineResult = {
      finalPrompt: pipelineContext.prompt,
      enhancedCharacters: pipelineContext.characters,
      optimizedParameters: pipelineContext.parameters,
      qualityScore: this.calculateQualityScore(pipelineContext),
      stagesCompleted,
      fallbacksUsed,
      processingTime
    };

    console.log(`🏁 Pipeline completed in ${processingTime}ms. Quality score: ${result.qualityScore}/100`);
    
    return result;
  }

  // Stage 1: Scene Extraction & Cultural Enhancement
  private static async enhanceSceneWithCulture(context: any): Promise<any> {
    const { originalText, userInfo } = context;
    
    // Extract primary scene
    const primaryScene = this.extractPrimaryScene(originalText);
    
    // Add cultural context
    const culturalSetting = MulticulturalVisualService.generateCulturalSetting(userInfo);
    const culturalElements = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    const enhancedScene = `${primaryScene}, ${culturalSetting}, ${culturalElements.culturalElements.slice(0, 2).join(', ')}`;
    
    return {
      sceneDescription: enhancedScene,
      culturalContext: culturalElements
    };
  }

  // Stage 2: Character Consistency Injection
  private static async injectCharacterConsistency(context: any): Promise<any> {
    const { originalText, userInfo, sessionId, pageNumber } = context;
    
    // Detect characters in text
    const detectedCharacters = AdvancedCharacterEngine.detectCharactersInText(
      originalText,
      sessionId,
      userInfo,
      pageNumber
    );
    
    // Generate character descriptions with consistency
    const characterDescriptions = detectedCharacters.map(char => {
      return `${char.name}: ${char.physicalTraits}`;
    });
    
    return {
      characters: detectedCharacters,
      characterDescriptions: characterDescriptions.join(', ')
    };
  }

  // Stage 3: Style Framework Application
  private static async applyStyleFramework(context: any): Promise<any> {
    const { userInfo, pageNumber, totalPages, sceneDescription } = context;
    
    // Select dynamic style based on content and progression
    const dynamicStyle = StructuredPromptEngine.selectDynamicStyle(
      sceneDescription,
      userInfo,
      pageNumber,
      totalPages
    );
    
    // Compose structured prompt template
    const template = StructuredPromptEngine.composeStructuredPrompt(
      sceneDescription,
      userInfo,
      pageNumber,
      context.characters || []
    );
    
    const finalPrompt = StructuredPromptEngine.templateToPrompt(template);
    
    return {
      styleElements: [dynamicStyle],
      template,
      prompt: finalPrompt
    };
  }

  // Stage 4: Quality Optimization
  private static async optimizeQuality(context: any): Promise<any> {
    const { prompt, userInfo } = context;
    
    // Create prompt segments for optimization
    const segments: PromptSegment[] = [
      {
        content: context.sceneDescription || '',
        priority: PromptPriority.CORE_CONTENT,
        canTruncate: false
      },
      {
        content: context.characterDescriptions || '',
        priority: PromptPriority.CHARACTER_DETAILS,
        canTruncate: true,
        tier: 'standard'
      },
      {
        content: context.styleElements?.join(' ') || '',
        priority: PromptPriority.STYLE_FRAMEWORK,
        canTruncate: true
      }
    ];
    
    // Optimize prompt length
    const optimization = PromptLengthManager.optimizePrompt(segments);
    
    // Add quality enhancement terms
    const qualityTerms = MulticulturalVisualService.getQualityEnhancementTerms(userInfo);
    const negativePrompt = MulticulturalVisualService.generateCulturalNegativePrompt(userInfo);
    
    const optimizedPrompt = `${optimization.optimizedPrompt}, ${qualityTerms}`;
    
    return {
      optimizedPrompt,
      negativePrompt,
      optimization
    };
  }

  // Stage 5: Parameter Optimization
  private static async optimizeParameters(context: any): Promise<any> {
    const { userInfo, characters } = context;
    
    // Get culturally optimized parameters
    const culturalParams = MulticulturalVisualService.getOptimizedGenerationParams(userInfo);
    
    // Adjust parameters based on character complexity
    const characterComplexity = characters?.length || 1;
    const adjustedParams = this.adjustParametersForComplexity(culturalParams, characterComplexity);
    
    // Optimize for skin tone and hair texture representation
    const diversityOptimizedParams = this.optimizeForDiversity(adjustedParams, userInfo);
    
    return diversityOptimizedParams;
  }

  // Helper methods

  private static extractPrimaryScene(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actionWords = ['walk', 'run', 'play', 'look', 'see', 'go', 'find', 'hold', 'sit', 'stand', 'move'];
    
    let bestScene = sentences[0] || text;
    let highestScore = 0;
    
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.filter(word => actionWords.includes(word)).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestScene = sentence.trim();
      }
    }
    
    return bestScene;
  }

  private static adjustParametersForComplexity(baseParams: any, complexity: number): RunwareParameters {
    const adjusted = { ...this.getDefaultParameters(), ...baseParams };
    
    // Increase steps for complex scenes
    if (complexity > 2) {
      adjusted.steps = Math.min(adjusted.steps + 1, 6);
    }
    
    // Adjust CFG scale for character consistency
    if (complexity > 1) {
      adjusted.cfgScale = Math.min(adjusted.cfgScale + 0.2, 2.0);
    }
    
    return adjusted;
  }

  private static optimizeForDiversity(params: RunwareParameters, userInfo: UserInfo): RunwareParameters {
    const nativeLanguage = userInfo.nativeLanguage as SupportedLanguage;
    
    // Optimize for melanin-rich skin tones
    if (['ar', 'hi', 'pt'].includes(nativeLanguage)) {
      params.cfgScale = Math.min(params.cfgScale + 0.3, 2.0);
      params.steps = Math.min(params.steps + 1, 6);
    }
    
    // Optimize for textured hair representation
    if (['ar', 'hi', 'pt'].includes(nativeLanguage)) {
      params.strength = Math.min(params.strength + 0.1, 0.9);
    }
    
    return params;
  }

  private static getDefaultParameters(): RunwareParameters {
    return {
      model: "runware:100@1",
      cfgScale: 1.5,
      steps: 3,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: 0.8,
      width: 1024,
      height: 1024
    };
  }

  private static calculateQualityScore(context: any): number {
    let score = 60; // Base score
    
    // Character consistency bonus
    if (context.characters && context.characters.length > 0) {
      score += 15;
    }
    
    // Cultural enhancement bonus
    if (context.culturalContext) {
      score += 10;
    }
    
    // Style framework bonus
    if (context.styleElements && context.styleElements.length > 0) {
      score += 10;
    }
    
    // Optimization bonus
    if (context.optimization && context.optimization.wasOptimized) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }
}