import { describe, it, expect } from "vitest";
import { 
  validateTheme, 
  validateThemeBatch, 
  generateFeedbackMessage, 
  getSuggestedThemes 
} from "@/utils/themeValidation";

describe("Theme Validation System", () => {
  describe("Basic Theme Validation", () => {
    it("accepts kid-friendly themes", () => {
      const validThemes = [
        "adventure", "friendship", "animals", "magic", 
        "nature", "discovery", "creativity", "teamwork",
        "monsters", "dragon", "unicorn" // monsters should now be allowed
      ];
      
      validThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
        expect(result.sanitized).toBe(theme);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("rejects violent content", () => {
      const violentThemes = [
        "violence", "murder", "kill", "death", "blood", 
        "torture", "assault", "rape", "suicide"
      ];
      
      violentThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("inappropriate content");
      });
    });

    it("rejects sexual content", () => {
      const sexualThemes = [
        "sex", "sexual", "sexy", "nude", "naked", "porn", 
        "pornography", "erotic", "seductive", "prostitute",
        "breast", "penis", "vagina", "orgasm", "masturbate",
        "horny", "lust", "arousal", "intimate", "passion"
      ];
      
      sexualThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("inappropriate content");
      });
    });

    it("rejects drug and alcohol content", () => {
      const drugThemes = [
        "alcohol", "drunk", "cocaine", "heroin", "marijuana", 
        "weed", "meth", "ecstasy", "lsd", "crack", "dealer",
        "addiction", "overdose", "cigarette", "vaping", "high"
      ];
      
      drugThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("inappropriate content");
      });
    });

    it("rejects gambling content", () => {
      const gamblingThemes = ["gambling", "casino", "betting", "poker", "slots"];
      
      gamblingThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("inappropriate content");
      });
    });

    it("rejects personal information (COPPA)", () => {
      const personalInfoThemes = [
        "my mom Sarah", "123 main street", "555-123-4567", 
        "john@email.com", "Roosevelt Elementary"
      ];
      
      personalInfoThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.coppaViolation).toBe(true);
        expect(result.errors[0]).toContain("personal information");
      });
    });

    it("handles empty and oversized themes", () => {
      const emptyResult = validateTheme("");
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.errors[0]).toContain("cannot be empty");

      const longTheme = "a".repeat(51);
      const longResult = validateTheme(longTheme);
      expect(longResult.valid).toBe(false);
      expect(longResult.errors[0]).toContain("too long");
    });
  });

  describe("Batch Validation", () => {
    it("processes mixed valid and invalid themes", () => {
      const themes = [
        "adventure", "friendship", "violence", "magic", 
        "drugs", "animals", "sex", "creativity"
      ];
      
      const result = validateThemeBatch(themes);
      
      expect(result.validThemes).toEqual(
        expect.arrayContaining(["adventure", "friendship", "magic", "animals", "creativity"])
      );
      expect(result.rejectedThemes).toHaveLength(3);
      expect(result.rejectedThemes.map(r => r.theme)).toEqual(
        expect.arrayContaining(["violence", "drugs", "sex"])
      );
    });

    it("handles too many themes", () => {
      const manyThemes = Array(15).fill("adventure");
      const result = validateThemeBatch(manyThemes);
      
      expect(result.warnings).toContain("Too many themes provided, processing first 10 only");
      expect(result.validThemes).toHaveLength(1); // deduped
    });
  });

  describe("Feedback Generation", () => {
    it("generates positive feedback for all valid themes", () => {
      const result = {
        validThemes: ["adventure", "friendship"],
        rejectedThemes: [],
        warnings: [],
        totalProcessed: 2
      };
      
      const feedback = generateFeedbackMessage(result);
      expect(feedback).toContain("Great! All 2 themes are appropriate");
    });

    it("generates helpful feedback for mixed results", () => {
      const result = {
        validThemes: ["adventure"],
        rejectedThemes: [
          { theme: "violence", reason: "inappropriate", coppaViolation: false },
          { theme: "my mom", reason: "personal info", coppaViolation: true }
        ],
        warnings: [],
        totalProcessed: 3
      };
      
      const feedback = generateFeedbackMessage(result);
      expect(feedback).toContain("1 themes accepted");
      expect(feedback).toContain("privacy protection");
      expect(feedback).toContain("age-appropriateness");
      expect(feedback).toContain("Try themes like: adventure, friendship");
    });
  });

  describe("Age-Appropriate Suggestions", () => {
    it("suggests age-appropriate themes", () => {
      const preschool = getSuggestedThemes(4);
      expect(preschool).toEqual(expect.arrayContaining(["animals", "family", "colors"]));

      const elementary = getSuggestedThemes(8);
      expect(elementary).toEqual(expect.arrayContaining(["adventure", "magic", "nature"]));

      const middle = getSuggestedThemes(12);
      expect(middle).toEqual(expect.arrayContaining(["mystery", "teamwork", "science"]));
    });
  });

  describe("Monster Theme Allowance", () => {
    it("allows monster-related themes that were previously blocked", () => {
      const monsterThemes = ["monsters", "monster", "dragon", "friendly monster"];
      
      monsterThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(true);
        expect(result.sanitized).toBe(theme);
      });
    });

    it("still blocks truly scary supernatural themes", () => {
      const scaryThemes = ["demon", "devil", "ghost", "zombie", "vampire"];
      
      scaryThemes.forEach(theme => {
        const result = validateTheme(theme);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("inappropriate content");
      });
    });
  });
});