export interface UserInfo {
  favoriteAnimal?: string;
  favoriteFood?: string;
  favoriteColor?: string;
  hobbies?: string;
  avatar?: {
    skinTone?: string;
    gender?: string;
  };
  gradeLevel?: string;
  readingLevel?: string;
}

export interface StoryPage {
  id: string;
  content: string;
  pageNumber: number;
  imageUrl?: string;
  timestamp: number;
}

export interface SavedStoryMetadata {
  imageCacheMetadata?: Record<number, string>;
  image_cache_metadata?: Record<number, string>;
}

export interface SavedStory extends SavedStoryMetadata {
  id: string;
  title?: string;
  pages: StoryPage[];
  userInfo: UserInfo;
  createdAt: number;
  lastAccessed: number;
  isActive: boolean;
}

export interface StorySession {
  id: string;
  pages: StoryPage[];
  userInfo: UserInfo;
  createdAt: number;
  lastAccessed: number;
  isActive: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  sessionId: string;
  pageNumber: number;
  retryCount?: number;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  generationTime: number;
  provider: 'runware' | 'openai' | 'fallback';
}