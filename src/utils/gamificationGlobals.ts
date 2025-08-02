// Global gamification integration
export const setupGamificationGlobals = (addVocabularyWord: () => void, enablePersistence: boolean = true) => {
  // Set up global functions for InteractiveWord component
  (window as any).addVocabularyWord = addVocabularyWord;
  
  // Set up global vocabulary collection (if not already set)
  if (!(window as any).addToVocabulary) {
    (window as any).addToVocabulary = (vocabularyWord: any) => {
      // Only persist vocabulary for premium users
      if (enablePersistence) {
        const stored = localStorage.getItem('vocabulary_collection') || '[]';
        const collection = JSON.parse(stored);
        collection.push(vocabularyWord);
        localStorage.setItem('vocabulary_collection', JSON.stringify(collection));
      }
    };
  }
};

export const cleanupGamificationGlobals = () => {
  delete (window as any).addVocabularyWord;
  // Keep addToVocabulary as it might be used elsewhere
};
