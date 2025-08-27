import { describe, it, expect } from "vitest";
import { EnhancedFallbackManager, ENHANCED_FALLBACK_TEMPLATES } from "@/constants/enhancedFallbackTemplates";
import { resolveAllPlaceholders } from "@/utils/placeholderResolver";
import type { UserInfo, DifficultyLevel } from "@/types";

function makeUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    name: "Taylor Chen",
    age: 8,
    grade: "2nd",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    favoriteColor: "purple",
    favoriteAnimal: "dolphin",
    hobbies: "swimming, painting",
    favoriteFood: "sushi",
    specialRequest: "theme: ocean adventures and friendship",
    ...overrides,
  };
}

describe("Enhanced Fallback Template Quality & Consistency", () => {
  describe("Template Count Verification", () => {
    it("has updated template counts for all difficulty levels", () => {
      const counts = Object.entries(ENHANCED_FALLBACK_TEMPLATES).map(([level, templates]) => 
        [level, templates.length]
      );
      
      console.log("Template counts by difficulty:", counts);
      
      // Verify minimum counts (should be much higher now)
      expect(ENHANCED_FALLBACK_TEMPLATES.beginner.length).toBeGreaterThan(45);
      expect(ENHANCED_FALLBACK_TEMPLATES.easy.length).toBeGreaterThan(45);
      expect(ENHANCED_FALLBACK_TEMPLATES.medium.length).toBeGreaterThan(45);
      expect(ENHANCED_FALLBACK_TEMPLATES.hard.length).toBeGreaterThan(45);
      expect(ENHANCED_FALLBACK_TEMPLATES.expert.length).toBeGreaterThan(45);
    });
  });

  describe("User-Specific Placeholder Usage", () => {
    it("uses proper user placeholders instead of generic ones", () => {
      const difficulties: DifficultyLevel[] = ["beginner", "easy", "medium", "hard", "expert"];
      
      difficulties.forEach(difficulty => {
        const templates = ENHANCED_FALLBACK_TEMPLATES[difficulty];
        
        templates.forEach((template, idx) => {
          const allSections = [
            ...template.setup,
            ...template.development, 
            ...template.climax,
            ...template.resolution
          ];
          
          const hasUserPlaceholders = allSections.some(text => 
            text.includes("{userName}") || 
            text.includes("{favoriteColor}") || 
            text.includes("{favoriteAnimal}") ||
            text.includes("{favoriteFood}") ||
            text.includes("{hobbies}") ||
            text.includes("{specialRequest}")
          );
          
          if (hasUserPlaceholders) {
            // Should not have generic placeholders if it has user-specific ones
            const hasGenericPlaceholders = allSections.some(text =>
              text.includes("{animal}") || 
              text.includes("{color}") || 
              text.includes("{object}")
            );
            
            expect(hasGenericPlaceholders).toBe(false);
          }
        });
      });
    });

    it("properly resolves all user-specific placeholders", () => {
      const user = makeUser();
      const difficulties: DifficultyLevel[] = ["beginner", "easy", "medium"];
      
      difficulties.forEach(difficulty => {
        const template = EnhancedFallbackManager.getFallbackTemplate(difficulty, user, 0);
        const resolved = resolveAllPlaceholders(template, { userInfo: user });
        
        // Should contain actual user data
        expect(resolved).toContain("Taylor");
        if (template.includes("{favoriteColor}")) expect(resolved).toContain("purple");
        if (template.includes("{favoriteAnimal}")) expect(resolved).toContain("dolphin");
        if (template.includes("{favoriteFood}")) expect(resolved).toContain("sushi");
        if (template.includes("{hobbies}")) expect(resolved).toContain("swimming");
        if (template.includes("{specialRequest}")) expect(resolved).toContain("ocean adventures");
        
        // Should not contain unresolved placeholders
        expect(resolved).not.toMatch(/\{[^}]+\}/);
      });
    });
  });

  describe("Never-Ending Story Implementation", () => {
    it("includes continuation hooks at the end of stories", () => {
      const user = makeUser();
      const difficulties: DifficultyLevel[] = ["beginner", "easy", "medium", "hard"];
      
      difficulties.forEach(difficulty => {
        const template = EnhancedFallbackManager.getFallbackTemplate(difficulty, user, 4); // Last page
        
        // Should end with a question or continuation hook
        const continuationHooks = [
          "What", "Who", "Which", "Where", "How", "next?", "awaits?", "will"
        ];
        
        const hasHook = continuationHooks.some(hook => 
          template.toLowerCase().includes(hook.toLowerCase())
        );
        
        expect(hasHook).toBe(true);
      });
    });

    it("has contextual continuation points for each difficulty", () => {
      const difficulties: DifficultyLevel[] = ["beginner", "easy", "medium", "hard", "expert"];
      
      difficulties.forEach(difficulty => {
        const templates = ENHANCED_FALLBACK_TEMPLATES[difficulty];
        
        templates.forEach(template => {
          expect(template.continuationPoints).toBeDefined();
          expect(template.continuationPoints.length).toBeGreaterThan(0);
          expect(template.nextStorySeeds).toBeDefined();
          expect(template.nextStorySeeds.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Difficulty Level Segregation", () => {
    it("ensures Level 2+ doesn't get Level 0-1 content", () => {
      const user = makeUser({ age: 8 });
      
      // Test medium difficulty (Level 2)
      for (let i = 0; i < 10; i++) {
        const template = EnhancedFallbackManager.getFallbackTemplate("medium", user, i);
        
        // Level 2 should have more complex sentences
        const sentences = template.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = sentences.reduce((acc, sentence) => {
          return acc + sentence.trim().split(/\s+/).length;
        }, 0) / sentences.length;
        
        // Medium difficulty should average more than 5 words per sentence
        expect(avgWordsPerSentence).toBeGreaterThan(5);
        
        // Should not contain overly simple patterns typical of Level 0-1
        expect(template).not.toMatch(/\b(big|little|good|bad)\s+(is|are)\b/i);
        expect(template).not.toMatch(/\b(go|run|jump|play)\s*[.!]?\s*$/i);
      }
    });

    it("maintains appropriate complexity for each level", () => {
      const user = makeUser();
      
      const beginnerTemplate = EnhancedFallbackManager.getFallbackTemplate("beginner", user, 0);
      const expertTemplate = EnhancedFallbackManager.getFallbackTemplate("expert", user, 0);
      
      // Beginner should be simple
      const beginnerWords = beginnerTemplate.split(/\s+/).length;
      expect(beginnerWords).toBeLessThan(50);
      
      // Expert should be complex
      const expertWords = expertTemplate.split(/\s+/).length;
      expect(expertWords).toBeGreaterThan(80);
      
      // Expert should have more complex vocabulary
      const complexWords = ["philosophical", "intellectual", "synthesis", "understanding"];
      const hasComplexWords = complexWords.some(word => 
        expertTemplate.toLowerCase().includes(word)
      );
      expect(hasComplexWords).toBe(true);
    });
  });

  describe("Story Arc Structure", () => {
    it("maintains proper story structure across all templates", () => {
      const difficulties: DifficultyLevel[] = ["beginner", "easy", "medium", "hard", "expert"];
      
      difficulties.forEach(difficulty => {
        const templates = ENHANCED_FALLBACK_TEMPLATES[difficulty];
        
        templates.forEach(template => {
          expect(template.setup.length).toBeGreaterThan(0);
          expect(template.development.length).toBeGreaterThan(0);
          expect(template.climax.length).toBeGreaterThan(0);
          expect(template.resolution.length).toBeGreaterThan(0);
          
          // Story should have proper progression
          const totalSections = template.setup.length + template.development.length + 
                               template.climax.length + template.resolution.length;
          expect(totalSections).toBeGreaterThanOrEqual(4);
        });
      });
    });
  });

  describe("Template Variety & Session Management", () => {
    it("provides variety across multiple fallback calls", () => {
      const user = makeUser();
      const templates = new Set<string>();
      
      // Get 10 fallback templates
      for (let i = 0; i < 10; i++) {
        const template = EnhancedFallbackManager.getFallbackTemplate("medium", user, i);
        templates.add(template);
      }
      
      // Should have variety (not all identical)
      expect(templates.size).toBeGreaterThan(3);
    });

    it("handles session clearing correctly", () => {
      const user = makeUser();
      
      // Get some templates
      EnhancedFallbackManager.getFallbackTemplate("easy", user, 0);
      EnhancedFallbackManager.getFallbackTemplate("easy", user, 1);
      
      // Clear session
      EnhancedFallbackManager.clearSession();
      
      // Should still work after clearing
      const template = EnhancedFallbackManager.getFallbackTemplate("easy", user, 0);
      expect(template).toBeTruthy();
      expect(template.length).toBeGreaterThan(10);
    });
  });
});