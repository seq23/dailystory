
export const validateField = (fieldName: string, value: string) => {
  // Simple validation - can be enhanced later
  const errors: string[] = [];
  
  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName} is required`);
  }
  
  // Check for inappropriate content (basic implementation)
  const inappropriateWords = ['bad', 'evil', 'scary', 'violent'];
  if (inappropriateWords.some(word => value.toLowerCase().includes(word))) {
    errors.push('Content may not be appropriate for children');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    hasCoppaViolation: false // Simple implementation
  };
};
