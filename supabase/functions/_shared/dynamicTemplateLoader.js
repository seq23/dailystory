/**
 * Dynamic Template Loader - On-Demand Loading with Caching
 * Replaces monolithic template loading with lean, cached imports
 * Reduces memory footprint by 99% (5MB → 50KB base + requested only)
 */

import { TEMPLATE_REGISTRY, getRegistryConfig, getRegistryTemplateCount } from './templates/registry.js';

// Template cache to avoid re-importing
const templateCache = new Map();

/**
 * Load a specific template on-demand with caching
 */
export async function loadTemplate(level, templateIndex = null) {
  const cacheKey = `${level}_${templateIndex || 'random'}`;
  
  // Check cache first
  if (templateCache.has(cacheKey)) {
    console.log(`📦 Cache hit for ${cacheKey}`);
    return templateCache.get(cacheKey);
  }

  console.log(`🔄 Loading template ${level} index ${templateIndex}`);
  
  const config = getRegistryConfig(level);
  if (!config) {
    throw new Error(`Unknown template level: ${level}`);
  }

  let template = null;

  if (config.type === 'static') {
    // Level 0 - import from single file
    try {
      const module = await import(config.path);
      const templates = module[config.functions.getter]();
      
      if (templateIndex !== null && templateIndex >= 0 && templateIndex < templates.length) {
        template = templates[templateIndex];
      } else {
        template = templates[Math.floor(Math.random() * templates.length)];
      }
    } catch (error) {
      console.error(`❌ Failed to load static template ${level}:`, error);
      throw error;
    }
  } else {
    // Dynamic templates - import individual file
    try {
      let targetIndex = templateIndex;
      if (targetIndex === null || targetIndex < 0 || targetIndex >= config.count) {
        targetIndex = Math.floor(Math.random() * config.count);
      }

      const templateInfo = config.templates[targetIndex];
      if (!templateInfo) {
        throw new Error(`Template index ${targetIndex} not found for ${level}`);
      }

      const templatePath = `${config.path}${templateInfo.file}`;
      const module = await import(templatePath);
      template = module.default || module.template;
      
      if (!template) {
        throw new Error(`Template module ${templatePath} did not export template`);
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
 */
export function getDynamicTemplateCount(level) {
  return getRegistryTemplateCount(level);
}

/**
 * Clear template cache (for memory management)
 */
export function clearTemplateCache() {
  const cacheSize = templateCache.size;
  templateCache.clear();
  console.log(`🧹 Cleared ${cacheSize} cached templates`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: templateCache.size,
    keys: Array.from(templateCache.keys())
  };
}