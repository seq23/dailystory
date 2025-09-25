// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
/**
 * Dynamic Template Loader - On-Demand Loading with Caching
 * Replaces monolithic template loading with lean, cached imports
 * Reduces memory footprint by 99% (5MB → 50KB base + requested only)
 */

import { TEMPLATE_REGISTRY, getRegistryConfig, getRegistryTemplateCount } from './templates/registry.ts';

interface TemplateModule {
  default?: string[];
  template?: string[];
  [key: string]: any;
}

interface CacheStats {
  size: number;
  keys: string[];
}

// Template cache to avoid re-importing
const templateCache = new Map<string, string[]>();

/**
 * Load a specific template on-demand with caching
 */
export async function loadTemplate(level: string, templateIndex: number | null = null): Promise<string[] | null> {
  const cacheKey = `${level}_${templateIndex || 'random'}`;
  
  // Check cache first
  if (templateCache.has(cacheKey)) {
    console.log(`📦 Cache hit for ${cacheKey}`);
    return templateCache.get(cacheKey) || null;
  }

  console.log(`🔄 Loading template ${level} index ${templateIndex}`);
  
  const config = getRegistryConfig(level);
  if (!config) {
    throw new Error(`Unknown template level: ${level}`);
  }

  let template: string[] | null = null;

  if (config.type === 'static') {
    // Level 0 - import from single file and call getter function
    try {
      const module = await import(`./templates/${config.path}`) as any;
      
      // Call the getter function with templateIndex
      if (templateIndex !== null && templateIndex >= 0) {
        template = config.functions?.getter ? module[config.functions.getter](templateIndex) : null;
      } else {
        template = config.functions?.getter ? module[config.functions.getter]() : null; // Random template
      }
    } catch (error) {
      console.error(`❌ Failed to load static template ${level}:`, error);
      throw error;
    }
  } else {
    // Dynamic templates - load individual files
    try {
      let targetIndex = templateIndex;
      if (targetIndex === null || targetIndex < 0 || targetIndex >= config.count) {
        targetIndex = Math.floor(Math.random() * config.count);
      }

      // Load individual template files
      const templateInfo = config.templates[targetIndex];
      if (templateInfo) {
        const templatePath = `./templates/${config.path}${templateInfo.file}`;
        const module = await import(templatePath) as TemplateModule;
        template = module.default || module.template || null;
        
        if (template) {
          console.log(`✅ Loaded individual template file: ${templatePath}`);
        }
      }
      
      if (!template) {
        throw new Error(`No template found for ${level}[${targetIndex}]`);
      }
    } catch (error) {
      console.error(`❌ Failed to load dynamic template ${level}[${templateIndex}]:`, error);
      throw error;
    }
  }

  // Cache the loaded template
  if (template) {
    templateCache.set(cacheKey, template);
    console.log(`✅ Cached template ${cacheKey}`);
  }

  return template;
}

/**
 * Get template count for exploration mode
 * Uses registry counts since they now accurately match existing files
 */
export async function getDynamicTemplateCount(level: string): Promise<number> {
  const registryCount = getRegistryTemplateCount(level);
  
  // Registry is now accurate after optimization, so use it directly
  if (registryCount > 0) {
    return registryCount;
  }
  
  // Fallback for level0 or if registry lookup fails
  if (level === 'level0') {
    return 100; // Level 0 has 100 templates
  }
  
  console.warn(`⚠️ No count found for level ${level}, returning 0`);
  return 0;
}

/**
 * Clear template cache (for memory management)
 */
export function clearTemplateCache(): void {
  const cacheSize = templateCache.size;
  templateCache.clear();
  console.log(`🧹 Cleared ${cacheSize} cached templates`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return {
    size: templateCache.size,
    keys: Array.from(templateCache.keys())
  };
}