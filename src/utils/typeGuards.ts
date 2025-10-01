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
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Accept boolean, string, or number success values
  const successValue = obj.success;
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
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Check for any of the image URL field variations
  const hasImageUrl = !!(
    obj.imageURL ||
    obj.image_url ||
    obj.imageUrl ||
    obj.url
  );
  
  // Validate success value
  const hasSuccess = !!(
    obj.success === true ||
    obj.success === 'true' ||
    obj.success === 1 ||
    obj.success === '1'
  );
  
  return hasImageUrl && hasSuccess;
};

/**
 * Extracts image URL from response handling all field name variations
 */
export const extractImageUrl = (obj: any): string | null => {
  if (typeof obj !== 'object' || obj === null) return null;
  
  // Try all possible field names in priority order
  const imageUrl = obj.imageURL || obj.image_url || obj.imageUrl || obj.url;
  
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  
  const trimmed = imageUrl.trim();
  
  // Validate it's a proper URL
  if (trimmed.length === 0) return null;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;
  
  return trimmed;
};

/**
 * Extracts and normalizes success value from response
 */
export const extractSuccessValue = (obj: any): boolean => {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const success = obj.success;
  
  // Handle all success value variations
  return (
    success === true ||
    success === 'true' ||
    success === 1 ||
    success === '1'
  );
};

/**
 * Normalizes Supabase function response structure
 * Handles both direct responses and nested { data: actualResponse } structure
 */
export const normalizeSupabaseResponse = <T = any>(response: any): T | null => {
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