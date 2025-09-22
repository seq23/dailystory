import { isAPIResponse, isUserInfo, isStoryPage } from './typeGuards';
import { APIResponse, UserInfo, StoryPage } from '@/types/api';

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