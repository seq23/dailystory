// ============================================================================
// TEMPLATE LIBRARY SERVICE - COMPLETE IMPLEMENTATION WITH ALL TEMPLATES
// ============================================================================
// All template data consolidated in single source of truth - no external imports
// Template constants removed - now using dynamic imports from individual template files

import { loadTemplate } from './dynamicTemplateLoader.js';

// GETTER FUNCTIONS - UPDATED TO USE DYNAMIC IMPORTS
export async function getLevel1Template(templateIndex) {
  const templates = await loadTemplate('level1');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getLevel1TemplateCount() {
  const templates = await loadTemplate('level1');
  return templates ? templates.length : 0;
}

export async function getLevel2Template(templateIndex) {
  const templates = await loadTemplate('level2');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getLevel2TemplateCount() {
  const templates = await loadTemplate('level2');
  return templates ? templates.length : 0;
}

// Level 3 Templates - Updated to use dynamic imports
export async function getLevel3Template(templateIndex) {
  const templates = await loadTemplate('level3');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getLevel3TemplateCount() {
  const templates = await loadTemplate('level3');
  return templates ? templates.length : 0;
}

// Level 4 Templates - Updated to use dynamic imports  
export async function getLevel4Template(templateIndex) {
  const templates = await loadTemplate('level4');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getLevel4TemplateCount() {
  const templates = await loadTemplate('level4');
  return templates ? templates.length : 0;
}

export async function getGrade6FallbackTemplate(templateIndex) {
  const templates = await loadTemplate('grade6');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getGrade6FallbackTemplateCount() {
  const templates = await loadTemplate('grade6');
  return templates ? templates.length : 0;
}

export async function getGrade7FallbackTemplate(templateIndex) {
  const templates = await loadTemplate('grade7');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getGrade7FallbackTemplateCount() {
  const templates = await loadTemplate('grade7');
  return templates ? templates.length : 0;
}

export async function getGrade8FallbackTemplate(templateIndex) {
  const templates = await loadTemplate('grade8');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getGrade8FallbackTemplateCount() {
  const templates = await loadTemplate('grade8');
  return templates ? templates.length : 0;
}

export async function getGrade9FallbackTemplate(templateIndex) {
  const templates = await loadTemplate('grade9');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getGrade9FallbackTemplateCount() {
  const templates = await loadTemplate('grade9');
  return templates ? templates.length : 0;
}

export async function getGrade10FallbackTemplate(templateIndex) {
  const templates = await loadTemplate('grade10');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getGrade10FallbackTemplateCount() {
  const templates = await loadTemplate('grade10');
  return templates ? templates.length : 0;
}

// Level 0 getter functions - Updated to use dynamic imports
export async function getLevel0Template(templateIndex) {
  const templates = await loadTemplate('level0');
  if (!templates || templates.length === 0) return null;
  
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < templates.length) {
    return templates[templateIndex];
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function getLevel0TemplateCount() {
  const templates = await loadTemplate('level0');
  return templates ? templates.length : 0;
}

// Export service object for compatibility - Updated for async functions
export const TemplateLibraryService = {
  getLevel0Template,
  getLevel0TemplateCount,
  getLevel1Template,
  getLevel1TemplateCount,
  getLevel2Template,
  getLevel2TemplateCount,
  getLevel3Template,
  getLevel3TemplateCount,
  getLevel4Template,
  getLevel4TemplateCount,
  getGrade6FallbackTemplate,
  getGrade6FallbackTemplateCount,
  getGrade7FallbackTemplate,
  getGrade7FallbackTemplateCount,
  getGrade8FallbackTemplate,
  getGrade8FallbackTemplateCount,
  getGrade9FallbackTemplate,
  getGrade9FallbackTemplateCount,
  getGrade10FallbackTemplate,
  getGrade10FallbackTemplateCount
};
