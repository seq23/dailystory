// Level 3 Vocabulary (Ages 9-11) - 5th-6th Grade
// Includes all Level 2 words plus 5th-6th grade vocabulary

import { LEVEL_2_VOCABULARY } from './level2Vocabulary';

export const LEVEL_3_VOCABULARY = new Set([
  // Include all Level 2 words
  ...LEVEL_2_VOCABULARY,
  
  // 5th-6th Grade Advanced Vocabulary + Author Voice Keywords
  'abandon', 'ability', 'absence', 'absolute', 'absorb', 'abstract', 'abuse', 'academic', 'accept', 'access',
  'accident', 'accompany', 'accomplish', 'according', 'account', 'accurate', 'achieve', 'acquire', 'action', 'active',
  'activity', 'actual', 'adapt', 'addition', 'adequate', 'adjust', 'administration', 'admit', 'adopt', 'adult',
  'advance', 'advantage', 'adventure', 'advertise', 'advice', 'advise', 'affect', 'afford', 'afraid', 'agency',
  
  // CRITICAL AUTHOR VOICE WORDS - ensuring templates don't fail validation
  'opportunity', 'curiosity', 'experiment', 'realized', 'chances', 'distilled', 'carefully', 'measure', 'record',
  'sleeping', 'outdoors', 'calling', 'campfires', 'safely', 'marshmallows', 'countless', 'community', 'neighbors',
  'prepare', 'throughout', 'science', 'reminded', 'growth', 'types', 'investigate', 'mysteries', 'fascinating',
  'agent', 'aggressive', 'agree', 'agreement', 'agriculture', 'ahead', 'aid', 'aim', 'aircraft', 'album',
  'alcohol', 'alert', 'alien', 'alive', 'alliance', 'allow', 'ally', 'almost', 'alone', 'alternative',
  'amazing', 'ambition', 'ambulance', 'amount', 'analysis', 'analyze', 'ancient', 'anger', 'angle', 'angry',
  'announce', 'annual', 'anonymous', 'anxiety', 'anxious', 'apart', 'apartment', 'apologize', 'apparent', 'appeal',
  'appear', 'appearance', 'application', 'apply', 'appoint', 'appointment', 'appreciate', 'approach', 'appropriate', 'approval',
  'approve', 'approximately', 'architect', 'architecture', 'argue', 'argument', 'arise', 'arrange', 'arrangement', 'arrest',
  'arrival', 'arrive', 'article', 'artificial', 'artist', 'artistic', 'aside', 'assault', 'assembly', 'assess',
  'assignment', 'assist', 'assistance', 'assistant', 'associate', 'association', 'assume', 'assumption', 'assure', 'athlete',
  'athletic', 'atmosphere', 'attach', 'attack', 'attempt', 'attend', 'attention', 'attitude', 'attorney', 'attract',
  'attractive', 'attribute', 'audience', 'author', 'authority', 'automatic', 'available', 'average', 'avoid', 'award',
  'aware', 'awareness', 'background', 'balance', 'ban', 'band', 'bank', 'banner', 'bar', 'barely',
  'bargain', 'barrier', 'basic', 'basically', 'basket', 'basketball', 'battle', 'beach', 'bean', 'bear',
  'beat', 'beautiful', 'beauty', 'become', 'bedroom', 'beer', 'begin', 'beginning', 'behalf', 'behave',
  'behavior', 'being', 'belief', 'believe', 'bell', 'belong', 'below', 'belt', 'bench', 'bend',
  'benefit', 'beside', 'best', 'bet', 'better', 'between', 'beyond', 'bicycle', 'bid', 'big',
  'bill', 'billion', 'bind', 'biological', 'bird', 'birth', 'birthday', 'bit', 'bite', 'bitter'
]);

export function isLevel3Word(word: string): boolean {
  return LEVEL_3_VOCABULARY.has(word.toLowerCase());
}

export function validateLevel3Sentence(sentence: string, userName?: string): { 
  isValid: boolean; 
  invalidWords: string[];
} {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const userNameLower = userName?.toLowerCase();
  const invalidWords = words.filter(word => {
    // Always allow the user's name
    if (userNameLower && word === userNameLower) {
      return false;
    }
    return !LEVEL_3_VOCABULARY.has(word);
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}