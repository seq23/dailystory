// Global gamification integration with enhanced vocabulary tracking
let globalAddVocabularyWord: (() => void) | null = null;

export const setupGamificationGlobals = (addVocabularyWord: () => void, enablePersistence: boolean = true) => {
  console.log('🎮 SETUP GAMIFICATION GLOBALS CALLED!', { 
    enablePersistence,
    addVocabularyWordType: typeof addVocabularyWord,
    addVocabularyWordExists: !!addVocabularyWord
  });
  
  if (!addVocabularyWord) {
    console.error('❌ setupGamificationGlobals: addVocabularyWord is null or undefined!');
    return;
  }
  
  // Store the function globally for InteractiveWord component
  globalAddVocabularyWord = addVocabularyWord;
  (window as any).addVocabularyWord = addVocabularyWord;
  
  console.log('🎮 Gamification globals set up:', {
    addVocabularyWordAvailable: !!addVocabularyWord,
    enablePersistence,
    globalFunctionSet: !!(window as any).addVocabularyWord,
    windowObjectKeys: Object.keys(window).filter(key => key.includes('add') || key.includes('Vocabulary')),
    testCallResult: (() => {
      try {
        addVocabularyWord();
        return 'SUCCESS - function called successfully';
      } catch (error) {
        return `ERROR - ${error}`;
      }
    })()
  });
  
  // Set up global vocabulary collection (if not already set)
  if (!(window as any).addToVocabulary) {
    (window as any).addToVocabulary = (vocabularyWord: any) => {
      // Only persist vocabulary for premium users
      if (enablePersistence) {
        try {
          const stored = localStorage.getItem('vocabulary_collection') || '[]';
          const collection = JSON.parse(stored);
          collection.push(vocabularyWord);
          localStorage.setItem('vocabulary_collection', JSON.stringify(collection));
          console.log('📝 Added vocabulary word to collection:', vocabularyWord);
        } catch (error) {
          console.error('❌ Failed to save vocabulary word:', error);
        }
      }
    };
  }
};

export const getGlobalAddVocabularyWord = (): (() => void) | null => {
  return globalAddVocabularyWord;
};

export const cleanupGamificationGlobals = () => {
  globalAddVocabularyWord = null;
  delete (window as any).addVocabularyWord;
  console.log('🧹 Gamification globals cleaned up');
  // Keep addToVocabulary as it might be used elsewhere
};
