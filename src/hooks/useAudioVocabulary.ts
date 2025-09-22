import { useState, useCallback } from 'react';

export interface AudioVocabularyState {
  isAudioPlaying: boolean;
  isAudioLoading: boolean;
  showVocabularyCollector: boolean;
  wordsInteracted: number;
  sessionWordsRead: number;
  pagesCompleted: Set<number>;
  audioPlayedPage: number | null;
  vocabularyData: any;
}

export interface AudioVocabularyActions {
  setIsAudioPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAudioLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowVocabularyCollector: React.Dispatch<React.SetStateAction<boolean>>;
  setWordsInteracted: React.Dispatch<React.SetStateAction<number>>;
  setSessionWordsRead: React.Dispatch<React.SetStateAction<number>>;
  setPagesCompleted: React.Dispatch<React.SetStateAction<Set<number>>>;
  setAudioPlayedPage: React.Dispatch<React.SetStateAction<number | null>>;
  setVocabularyData: React.Dispatch<React.SetStateAction<any>>;
  incrementWordsInteracted: () => void;
  incrementSessionWordsRead: (count?: number) => void;
  markPageCompleted: (pageNumber: number) => void;
  resetSessionCounters: () => void;
  clearVocabularyData: () => void;
}

export const useAudioVocabulary = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showVocabularyCollector, setShowVocabularyCollector] = useState(false);
  const [wordsInteracted, setWordsInteracted] = useState(0);
  const [sessionWordsRead, setSessionWordsRead] = useState(0);
  const [pagesCompleted, setPagesCompleted] = useState<Set<number>>(new Set());
  const [audioPlayedPage, setAudioPlayedPage] = useState<number | null>(null);
  const [vocabularyData, setVocabularyData] = useState<any>(null);

  const incrementWordsInteracted = useCallback(() => {
    setWordsInteracted(prev => prev + 1);
  }, []);

  const incrementSessionWordsRead = useCallback((count: number = 1) => {
    setSessionWordsRead(prev => prev + count);
  }, []);

  const markPageCompleted = useCallback((pageNumber: number) => {
    setPagesCompleted(prev => new Set([...prev, pageNumber]));
  }, []);

  const resetSessionCounters = useCallback(() => {
    setWordsInteracted(0);
    setSessionWordsRead(0);
    setPagesCompleted(new Set());
    setAudioPlayedPage(null);
  }, []);

  const clearVocabularyData = useCallback(() => {
    setVocabularyData(null);
  }, []);

  const state: AudioVocabularyState = {
    isAudioPlaying,
    isAudioLoading,
    showVocabularyCollector,
    wordsInteracted,
    sessionWordsRead,
    pagesCompleted,
    audioPlayedPage,
    vocabularyData,
  };

  const actions: AudioVocabularyActions = {
    setIsAudioPlaying,
    setIsAudioLoading,
    setShowVocabularyCollector,
    setWordsInteracted,
    setSessionWordsRead,
    setPagesCompleted,
    setAudioPlayedPage,
    setVocabularyData,
    incrementWordsInteracted,
    incrementSessionWordsRead,
    markPageCompleted,
    resetSessionCounters,
    clearVocabularyData,
  };

  return { state, actions };
};