// Global gamification integration with enhanced vocabulary tracking
let globalAddVocabularyWord: (() => void) | null = null;

export const setupGamificationGlobals = (addVocabularyWord: () => void, enablePersistence: boolean = true) => {
  console.log('🎮 SETUP GAMIFICATION GLOBALS CALLED!', { 
    enablePersistence,
    addVocabularyWordType: typeof addVocabularyWord,
    addVocabularyWordExists: !!addVocabularyWord,
    environment: window.location.href.includes('preview') ? 'preview' : 'console'
  });
  
  if (!addVocabularyWord) {
    console.error('❌ setupGamificationGlobals: addVocabularyWord is null or undefined!');
    return;
  }
  
  // Wrap the function to add debugging
  const wrappedAddVocabularyWord = () => {
    console.log('🎯 VOCABULARY WORD ADDED VIA GLOBAL FUNCTION!', {
      timestamp: new Date().toISOString(),
      environment: window.location.href.includes('preview') ? 'preview' : 'console'
    });
    return addVocabularyWord();
  };
  
  // Store the function globally for InteractiveWord component
  globalAddVocabularyWord = wrappedAddVocabularyWord;
  (window as any).addVocabularyWord = wrappedAddVocabularyWord;
  
  console.log('🎮 Gamification globals set up:', {
    addVocabularyWordAvailable: !!addVocabularyWord,
    enablePersistence,
    globalFunctionSet: !!(window as any).addVocabularyWord,
    windowObjectKeys: Object.keys(window).filter(key => key.includes('add') || key.includes('Vocabulary'))
  });
  
  // Set up global vocabulary collection (if not already set)
  if (!(window as any).addToVocabulary) {
    (window as any).addToVocabulary = (vocabularyWord: any) => {
      if (!enablePersistence) return;
      try {
        const userName = (window as any).__currentUserName || localStorage.getItem('user_display_name') || 'guest';
        const key = `vocabulary_${userName}`;

        // One-time merge from legacy key per user
        try {
          const migratedFlag = localStorage.getItem(`vocab_migrated_${userName}`);
          const legacy = localStorage.getItem('vocabulary_collection');
          if (legacy && migratedFlag !== '1') {
            const legacyItems = JSON.parse(legacy);
            const current = JSON.parse(localStorage.getItem(key) || '[]');
            const merged = Array.isArray(current) ? [...current] : [];
            for (const w of legacyItems) {
              if (!merged.find((m: any) => (m?.word || '').toLowerCase() === (w?.word || '').toLowerCase())) {
                merged.push(w);
              }
            }
            localStorage.setItem(key, JSON.stringify(merged));
            localStorage.setItem(`vocab_migrated_${userName}`, '1');
          }
        } catch {}

        const normalize = (w: any) => {
          const diff = (w?.difficulty || '').toLowerCase();
          const normalizedDifficulty = (
            diff === 'beginner' || diff === 'intermediate' || diff === 'advanced'
          ) ? diff : (diff === 'easy' ? 'beginner' : (diff === 'medium' ? 'intermediate' : 'advanced'));
          const dateStr = w?.dateAdded || w?.addedAt || new Date().toISOString();
          return {
            word: (w?.word || '').toString(),
            definition: (w?.definition || '').toString(),
            translation: w?.translation || undefined,
            difficulty: normalizedDifficulty,
            dateAdded: dateStr,
            timesReviewed: typeof w?.timesReviewed === 'number' ? w.timesReviewed : 0,
            mastered: !!w?.mastered,
            storyContext: w?.storyContext || w?.context || w?.sampleSentence || ''
          };
        };

        const stored = localStorage.getItem(key) || '[]';
        const collection = JSON.parse(stored);
        const newItem = normalize(vocabularyWord);
        const exists = collection.find((m: any) => (m?.word || '').toLowerCase() === newItem.word.toLowerCase());
        if (!exists) {
          collection.push(newItem);
        }
        localStorage.setItem(key, JSON.stringify(collection));
        console.log('📝 Added vocabulary word to collection:', { key, vocabularyWord: newItem });
      } catch (error) {
        console.error('❌ Failed to save vocabulary word:', error);
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
