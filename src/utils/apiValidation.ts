import { isAPIResponse, isUserInfo, isStoryPage, isImageResponse, extractImageUrl, extractSuccessValue, normalizeSupabaseResponse } from './typeGuards';
import { APIResponse, UserInfo, StoryPage, ImageResponse } from '@/types/api';

/**
 * Runtime validation middleware for API responses
 */
export class APIValidator {
  static validateResponse<T>(response: any): APIResponse<T> {
    if (!isAPIResponse(response)) {
      throw new Error('Invalid API response format');
    }
    return response;
  }

  static validateUserInfo(data: any): UserInfo {
    if (!isUserInfo(data)) {
      throw new Error('Invalid UserInfo format');
    }
    return data;
  }

  static validateStoryPage(data: any): StoryPage {
    if (!isStoryPage(data)) {
      throw new Error('Invalid StoryPage format');
    }
    return data;
  }

  static validateStoryPages(data: any[]): StoryPage[] {
    if (!Array.isArray(data)) {
      throw new Error('Story pages must be an array');
    }
    
    return data.map((page, index) => {
      if (!isStoryPage(page)) {
        throw new Error(`Invalid StoryPage format at index ${index}`);
      }
      return page;
    });
  }

  /**
   * Validates image response with robust multi-field and multi-type handling
   * Handles all variations: imageURL, image_url, imageUrl, url
   * Handles success values: boolean, string, number
   */
  static validateImageResponse(response: any): ImageResponse {
    if (!isImageResponse(response)) {
      const imageUrl = extractImageUrl(response);
      const hasSuccess = extractSuccessValue(response);
      
      throw new Error(
        `Invalid image response format. ` +
        `Success: ${hasSuccess}, ` +
        `Image URL: ${imageUrl ? 'present but invalid' : 'missing'}`
      );
    }
    
    return {
      success: extractSuccessValue(response),
      imageURL: extractImageUrl(response)!,
      ...response
    };
  }

  /**
   * Validates Supabase function image response (handles nested { data: response } structure)
   */
  static validateSupabaseImageResponse(supabaseResponse: any): ImageResponse {
    // Normalize the response structure first
    const normalized = normalizeSupabaseResponse(supabaseResponse);
    
    if (!normalized) {
      throw new Error('Empty or invalid Supabase response');
    }
    
    // Validate the normalized response
    return this.validateImageResponse(normalized);
  }

  /**
   * Extracts validated image URL from any response format
   */
  static extractValidatedImageUrl(response: any): string {
    const imageUrl = extractImageUrl(response);
    
    if (!imageUrl) {
      throw new Error('No valid image URL found in response');
    }
    
    return imageUrl;
  }

  /**
   * Checks if response indicates success (handles all variations)
   */
  static isSuccessfulResponse(response: any): boolean {
    return extractSuccessValue(response);
  }
}

/**
 * Async wrapper for API calls with automatic validation
 */
export async function validateAPICall<T>(
  apiCall: () => Promise<any>
): Promise<APIResponse<T>> {
  try {
    const response = await apiCall();
    return APIValidator.validateResponse<T>(response);
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}