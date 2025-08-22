
interface StoryPage {
  pageNumber: number;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
}

export const getStoredStory = (name: string, age: string): StoryPage[] | null => {
  try {
    const key = `story_${name}_${age}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored story:', error);
    return null;
  }
};

export const storeStory = (name: string, age: string, story: StoryPage[]): void => {
  try {
    const key = `story_${name}_${age}`;
    localStorage.setItem(key, JSON.stringify(story));
  } catch (error) {
    console.error('Failed to store story:', error);
  }
};

export const clearStoredStory = (name: string, age: string): void => {
  try {
    const key = `story_${name}_${age}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear stored story:', error);
  }
};
