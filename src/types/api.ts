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
  success: boolean | string | number;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImageResponse {
  success: boolean | string | number;
  imageURL?: string;
  image_url?: string;
  imageUrl?: string;
  url?: string;
  tier?: string;
  usedTier?: string;
  seed?: number | string;
  prompt?: string;
  metadata?: any;
  generatedAt?: string;
  timestamp?: string;
  provider?: string;
  model?: string;
  cost?: number;
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