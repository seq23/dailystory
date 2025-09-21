# Templates, Prompts & Schemas Complete Reference

## 🎯 **AI Scene Creator System Prompts (Tier 1)**

### OpenAI Models Used
- **Primary**: `gpt-4o` (legacy, reliable)
- **Enhanced**: `gpt-4.1` (improved reasoning)
- **Latest**: `gpt-5` (flagship model)

### **System Prompt Structure**
```typescript
// From ai-visual-scene-creator actual implementation
const systemPrompt = `You are an AI visual scene creator for children's stories.
Analyze the given story text and extract key visual elements that would make compelling illustrations.

Return a JSON object with this exact structure:
{
  "primaryScene": "Main action or scene happening",
  "setting": "Where the scene takes place",
  "action": "What is happening in the scene", 
  "mood": "Emotional tone/atmosphere",
  "pose": "Character positioning/body language"
}

Focus on:
- Age-appropriate imagery for children
- Clear, simple visual concepts
- Engaging character poses and expressions
- Rich environmental details
- Consistent story elements`;
```

### **User Prompt Template**
```typescript
// Actual prompt construction
const userPrompt = `Story Text: "${storyText}"
Page Number: ${pageNumber}
Character Details: ${JSON.stringify(characterDetails)}

Please analyze this story segment and provide visual scene elements.`;
```

### **AI Response Schema**
```typescript
interface AISceneResponse {
  primaryScene: string;    // "Emma discovers a magical garden gate"
  setting: string;         // "Enchanted garden entrance with ivy-covered walls"
  action: string;          // "Character reaching toward glowing gate handle"
  mood: string;            // "Wonder and curiosity"
  pose: string;            // "Standing with outstretched arm, looking up in awe"
}
```

## 🏗️ **Template Architecture**

<lov-mermaid>
graph TD
    A[AI Scene Creator Response] --> B{Template Selection}
    B -->|Premium Path| C[runware-template-ab]
    B -->|Nuclear Path| D[runware-template-cd]
    
    C --> E[Tier 2.5A: 6-Section Premium]
    C --> F[Tier 2.5B: 4-Section Basic]
    
    D --> G[Tier 2.5C: Lean Hair Mapping]
    D --> H[Tier 2.5D: Emergency Hardcoded]
    
    E --> I[Character Consistency + Rich Details]
    F --> J[Simplified Generation]
    G --> K[Basic Hair/Feature Mapping]
    H --> L[Hardcoded Fallback Template]
</lov-mermaid>

## **Template Tier 2.5A - Premium (runware-template-ab)**

### **6-Section Template Structure**
```typescript
// From actual runware-template-ab implementation
const premiumTemplate = {
  characterDetails: {
    appearance: `${aiResponse.pose}, ${characterConsistency.appearance}`,
    clothing: characterConsistency.clothing,
    facialFeatures: characterConsistency.facialFeatures
  },
  
  sceneComposition: {
    primaryScene: aiResponse.primaryScene,
    setting: aiResponse.setting,
    foregroundElements: extractedForeground,
    backgroundElements: extractedBackground
  },
  
  actionAndMood: {
    action: aiResponse.action,
    mood: aiResponse.mood,
    emotionalTone: derivedTone
  },
  
  environmentalDetails: {
    lighting: derivedLighting,
    atmosphere: environmentalContext,
    seasonalElements: seasonalContext
  },
  
  technicalSpecs: {
    artStyle: "children's book illustration",
    colorPalette: "warm, inviting colors",
    quality: "high detail, professional illustration"
  },
  
  consistencyElements: {
    characterSeeds: characterConsistencySeeds,
    styleReference: globalStyleReference
  }
};
```

### **Character Consistency Implementation**
```typescript
// Actual character consistency logic
const characterConsistency = {
  appearance: `${avatarConfig.skinTone} skin, ${avatarConfig.hairColor} hair, ${avatarConfig.hairStyle}`,
  clothing: avatarConfig.clothingStyle || "casual children's clothing",
  facialFeatures: `friendly expression, ${avatarConfig.eyeColor} eyes`,
  consistency: `character seed: ${characterSeed}, maintain appearance across scenes`
};
```

## **Template Tier 2.5B - Basic (runware-template-ab)**

### **4-Section Simplified Template**
```typescript
// Simplified version for faster generation
const basicTemplate = {
  character: `${characterConsistency.basic}, ${aiResponse.pose}`,
  scene: `${aiResponse.primaryScene} in ${aiResponse.setting}`,
  action: `${aiResponse.action} with ${aiResponse.mood} mood`,
  style: "children's book illustration, colorful, engaging"
};
```

## **Template Tier 2.5C - Nuclear (runware-template-cd)**

### **Lean Hair Mapping System**
```typescript
// From actual runware-template-cd implementation
const nuclearTemplate = {
  hairMapping: {
    "blonde": "light golden hair",
    "brown": "warm brown hair", 
    "black": "dark hair",
    "red": "auburn hair",
    "other": "styled hair"
  },
  
  sceneBasic: `${aiResponse.primaryScene || 'child in story scene'}`,
  setting: `${aiResponse.setting || 'storybook setting'}`,
  character: `child with ${mappedHair}, ${basicPose}`,
  mood: `${aiResponse.mood || 'happy and engaged'}`,
  
  technicalSpecs: "children's illustration, simple, clear"
};
```

### **5-Option Hair Mapping Logic**
```typescript
// Actual mapping function
function mapHairForNuclear(hairColor, hairStyle) {
  const hairMap = {
    blonde: "light golden hair",
    brown: "warm brown hair",
    black: "dark hair", 
    red: "auburn hair",
    default: "styled hair"
  };
  
  return hairMap[hairColor.toLowerCase()] || hairMap.default;
}
```

## **Template Tier 2.5D - Emergency (runware-template-cd)**

### **Hardcoded Fallback Template**
```typescript
// Last resort hardcoded template
const emergencyTemplate = {
  prompt: `A cheerful child character in a colorful storybook illustration. 
           The child is engaged in a story activity with a happy expression. 
           Children's book art style, warm colors, simple and engaging composition.
           Professional illustration quality suitable for children's literature.`,
  
  style: "children's book illustration",
  mood: "happy and engaging",
  quality: "professional children's book art"
};
```

## **Template Selection Algorithm**

<lov-mermaid>
flowchart TD
    A[AI Scene Response Available] --> B{Response Quality Check}
    B -->|High Quality| C[Select Tier 2.5A Premium]
    B -->|Medium Quality| D[Select Tier 2.5B Basic]
    B -->|Low/Missing| E[Route to Nuclear Service]
    
    E --> F{Character Data Available?}
    F -->|Yes| G[Tier 2.5C: Hair Mapping]
    F -->|No| H[Tier 2.5D: Emergency Hardcoded]
    
    C --> I[6-Section Template Generation]
    D --> J[4-Section Template Generation]
    G --> K[5-Option Hair Mapping]
    H --> L[Hardcoded Fallback]
</lov-mermaid>

## **Prompt Enhancement Examples**

### **Premium Template Output (2.5A)**
```
A 7-year-old child with warm brown skin and curly black hair, wearing a bright red t-shirt, 
standing with outstretched arm looking up in awe at a magical garden gate. The gate is covered 
in glowing ivy with sparkles of light, set against an enchanted garden entrance with ancient 
stone walls. The scene conveys wonder and curiosity with soft golden lighting filtering through 
leaves. Children's book illustration style with warm, inviting colors and high detail professional 
quality. Character seed: abc123, maintain consistent appearance.
```

### **Nuclear Template Output (2.5C)**
```
Child with warm brown hair in storybook setting, reaching toward magical gate, 
happy and engaged mood. Children's illustration, simple, clear.
```

### **Emergency Template Output (2.5D)**
```
A cheerful child character in a colorful storybook illustration. The child is engaged 
in a story activity with a happy expression. Children's book art style, warm colors, 
simple and engaging composition.
```

## **Schema Validation**

### **AI Response Validation**
```typescript
// Actual validation from ai-visual-scene-creator
function validateAIResponse(response) {
  const required = ['primaryScene', 'setting', 'action', 'mood', 'pose'];
  const missing = required.filter(field => !response[field]);
  
  if (missing.length > 0) {
    console.warn(`Missing AI response fields: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}
```

### **Template Output Schema**
```typescript
interface TemplateOutput {
  prompt: string;           // Generated image prompt
  templateTier: string;     // "2.5A" | "2.5B" | "2.5C" | "2.5D"
  characterSeed?: string;   // For consistency
  processingTime: number;   // Generation time in ms
  fallbackUsed: boolean;    // Whether fallback was triggered
}
```

## **Error Handling & Fallbacks**

### **AI Scene Creator Failures**
```typescript
// When AI fails, route to nuclear templates
if (!aiResponse || !validateAIResponse(aiResponse)) {
  console.log("🚨 AI Scene Creator failed, routing to nuclear templates");
  route = "runware-template-cd";
  templateTier = "2.5C"; // Hair mapping fallback
}
```

### **Template Service Failures**
```typescript
// Progressive degradation through template tiers
if (templateABFails) {
  console.log("🚨 Template AB failed, falling back to CD");
  route = "runware-template-cd";
  templateTier = "2.5C";
  
  if (templateCDFails) {
    console.log("🚨 All templates failed, using emergency");
    templateTier = "2.5D";
    return emergencyTemplate;
  }
}
```

---
*Last Updated: September 21, 2025*
*Template Status: All 4 tiers operational and tested*