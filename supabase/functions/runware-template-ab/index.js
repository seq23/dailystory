// Thin re-export wrapper for phase2-validation.js compatibility
// All business logic is now in index.ts (single-file TypeScript implementation)

export { default } from "./index.ts";
export { processSecondaryCharacters, PREMIUM_PROMPT_TEMPLATES, BASIC_PROMPT_TEMPLATES } from "./index.ts";
