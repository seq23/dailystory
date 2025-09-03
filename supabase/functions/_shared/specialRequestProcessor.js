/**
 * Special Request Processor
 * Parses and validates user special requests for template selection
 */

/**
 * Parse special request with safety checks
 * @param {string} specialRequest - User's special request
 * @returns {object} Parsed request with validation
 */
export function parseSpecialRequest(specialRequest) {
  if (!specialRequest || typeof specialRequest !== 'string') {
    return {
      isValid: false,
      originalRequest: '',
      error: 'Invalid request format'
    };
  }

  const request = specialRequest.trim();
  
  if (request.length === 0) {
    return {
      isValid: false,
      originalRequest: request,
      error: 'Empty request'
    };
  }

  if (request.length > 200) {
    return {
      isValid: false,
      originalRequest: request,
      error: 'Request too long'
    };
  }

  // Basic validation passed
  return {
    isValid: true,
    originalRequest: request,
    cleanedRequest: request.toLowerCase().trim(),
    keywords: extractKeywords(request)
  };
}

/**
 * Extract keywords from special request
 * @param {string} request - Special request text
 * @returns {string[]} Array of extracted keywords
 */
function extractKeywords(request) {
  if (!request) return [];
  
  // Convert to lowercase and split into words
  const words = request.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
  
  // Remove common stop words
  const stopWords = new Set(['the', 'and', 'but', 'for', 'are', 'with', 'his', 'they', 'this', 'have', 'from', 'not', 'been', 'you', 'her', 'she', 'can', 'was', 'one', 'our', 'had', 'but', 'what', 'all', 'were', 'when', 'your', 'how', 'each', 'who', 'did', 'has']);
  
  return words.filter(word => !stopWords.has(word));
}