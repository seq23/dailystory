import { UserInfo, StoryPage, APIResponse, ImageResponse } from '@/types/api';

export const isUserInfo = (obj: any): obj is UserInfo => {
  return typeof obj === 'object' && obj !== null;
};

export const isStoryPage = (obj: any): obj is StoryPage => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.pageNumber === 'number'
  );
};

/**
 * Flexible API response validation - handles boolean, string, and number success values
 */
export const isAPIResponse = (obj: any): obj is APIResponse => {
  const normalized = normalizeSupabaseResponse(obj);
  if (typeof normalized !== 'object' || normalized === null) return false;
  
  // Accept boolean, string, or number success values
  const successValue = normalized.success;
  return (
    successValue === true ||
    successValue === false ||
    successValue === 'true' ||
    successValue === 'false' ||
    successValue === 1 ||
    successValue === 0 ||
    successValue === '1' ||
    successValue === '0'
  );
};

/**
 * Validates image response with all field name variations
 */
export const isImageResponse = (obj: any): obj is ImageResponse => {
  const normalized = normalizeSupabaseResponse(obj);
  if (typeof normalized !== 'object' || normalized === null) return false;
  
  // Check for any of the image URL field variations
  const hasImageUrl = !!(
    normalized.imageURL ||
    normalized.image_url ||
    normalized.imageUrl ||
    normalized.url
  );
  
  // Validate success value
  const hasSuccess = !!(
    normalized.success === true ||
    normalized.success === 'true' ||
    normalized.success === 1 ||
    normalized.success === '1'
  );
  
  return hasImageUrl && hasSuccess;
};

/**
 * Extracts image URL from response handling all field name variations
 */
export const extractImageUrl = (obj: any): string | null => {
  const normalized = normalizeSupabaseResponse(obj);
  if (typeof normalized !== 'object' || normalized === null) {
    console.log('🔍 extractImageUrl: obj is not an object or is null', { obj, type: typeof obj });
    return null;
  }
  
  // Try all possible field names in priority order
  const imageUrl = normalized.imageURL || normalized.image_url || normalized.imageUrl || normalized.url;
  
  console.log('🔍 extractImageUrl: Field extraction', {
    hasImageURL: !!normalized.imageURL,
    hasImage_url: !!normalized.image_url,
    hasImageUrl: !!normalized.imageUrl,
    hasUrl: !!normalized.url,
    extractedValue: imageUrl,
    extractedType: typeof imageUrl
  });
  
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.log('🔍 extractImageUrl: imageUrl is not a valid string', { imageUrl, type: typeof imageUrl });
    return null;
  }
  
  const trimmed = imageUrl.trim();
  
  console.log('🔍 extractImageUrl: Trimmed value', { trimmed, length: trimmed.length });
  
  // Validate it's a proper URL
  if (trimmed.length === 0) {
    console.log('🔍 extractImageUrl: Trimmed string is empty');
    return null;
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    console.log('🔍 extractImageUrl: URL does not start with http(s)://', { trimmed });
    return null;
  }
  
  console.log('🔍 extractImageUrl: SUCCESS - Returning valid URL', { url: trimmed });
  return trimmed;
};

/**
 * Extracts and normalizes success value from response
 */
export const extractSuccessValue = (obj: any): boolean => {
  const normalized = normalizeSupabaseResponse(obj);
  if (typeof normalized !== 'object' || normalized === null) {
    console.log('🔍 extractSuccessValue: obj is not an object or is null', { obj, type: typeof obj });
    return false;
  }
  
  const success = normalized.success;
  
  console.log('🔍 extractSuccessValue: Checking success field', {
    successValue: success,
    successType: typeof success,
    isTrue: success === true,
    isStringTrue: success === 'true',
    isNumber1: success === 1,
    isString1: success === '1'
  });
  
  // Handle all success value variations
  const result = (
    success === true ||
    success === 'true' ||
    success === 1 ||
    success === '1'
  );
  
  console.log('🔍 extractSuccessValue: Result', { result });
  
  return result;
};

/**
 * Normalizes Supabase function response structure
 * Handles JSON strings, direct responses, and nested { data: actualResponse } structure
 */
export const normalizeSupabaseResponse = <T = any>(response: any): T | null => {
  // Handle JSON string responses (parse to object)
  if (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch {
      return null; // Invalid JSON string
    }
  }
  
  if (typeof response !== 'object' || response === null) return null;
  
  // If response has a 'data' field, extract it (Supabase wrapper)
  if ('data' in response && response.data !== null && response.data !== undefined) {
    return response.data as T;
  }
  
  // Otherwise return the response as-is
  return response as T;
};

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${value}`);
};

export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};