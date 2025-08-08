// Level 3 Vocabulary (Ages 9-11) - 4th Grade
// Includes all Level 2 words plus 4th grade vocabulary

import { LEVEL_2_VOCABULARY } from './level2Vocabulary';

export const LEVEL_3_VOCABULARY = new Set([
  // Include all Level 2 words
  ...LEVEL_2_VOCABULARY,
  
  // 4th Grade Core Vocabulary
  'ability', 'accept', 'accident', 'accomplish', 'according', 'account', 'accurate', 'achieve', 'action', 'active',
  'activity', 'actual', 'addition', 'advance', 'adventure', 'advice', 'affect', 'afraid', 'agency', 'agree',
  'agreement', 'allow', 'almost', 'alone', 'amount', 'analysis', 'ancient', 'anger', 'angry', 'announce',
  'annual', 'anxiety', 'apart', 'appear', 'appearance', 'application', 'approach', 'appropriate', 'approval', 'area',
  
  // 4th Grade Narrative & Author Voice Words
  'opportunity', 'curiosity', 'experiment', 'realized', 'chances', 'carefully', 'measure', 'record', 'sleeping',
  'outdoors', 'calling', 'safely', 'community', 'neighbors', 'prepare', 'throughout', 'science', 'reminded',
  'growth', 'types', 'investigate', 'mysteries', 'fascinating', 'adventure', 'discovery', 'exploration', 'challenge',
  'achievement', 'success', 'determination', 'creativity', 'meanwhile', 'however', 'therefore', 'suddenly', 'finally',
  'immediately', 'wonderful', 'delightful', 'personality', 'character', 'courage', 'bravery', 'kindness', 'friendship',
  'teamwork', 'leadership', 'experience', 'magnificent', 'incredible', 'marvelous',
  // 4th Grade Extended Vocabulary
  'argue', 'argument', 'arrange', 'arrangement', 'arrival', 'arrive', 'article', 'artist', 'artistic', 'aside',
  'assignment', 'assist', 'assistance', 'assistant', 'associate', 'assume', 'athlete', 'athletic', 'atmosphere', 'attach',
  'attack', 'attempt', 'attend', 'attention', 'attitude', 'attract', 'attractive', 'audience', 'author', 'authority',
  'available', 'average', 'avoid', 'award', 'aware', 'background', 'balance', 'band', 'bank', 'banner',
  'barrier', 'basic', 'basket', 'basketball', 'battle', 'beach', 'bear', 'beat', 'beautiful', 'beauty',
  'become', 'bedroom', 'begin', 'beginning', 'behave', 'behavior', 'belief', 'believe', 'bell', 'belong',
  'below', 'belt', 'bench', 'bend', 'benefit', 'beside', 'best', 'better', 'between', 'beyond',
  'bicycle', 'bird', 'birth', 'birthday', 'bite', 'bitter', 'blame', 'blank', 'block', 'blood',
  'blow', 'board', 'boat', 'body', 'bone', 'book', 'border', 'born', 'bottle', 'bottom',
  'bowl', 'brain', 'branch', 'brave', 'bread', 'break', 'breakfast', 'breath', 'breathe', 'bridge',
  'bright', 'bring', 'broad', 'broke', 'broken', 'brother', 'brought', 'brown', 'brush', 'build',
  'building', 'burn', 'business', 'button', 'camera', 'camp', 'campaign', 'cancel', 'cancer', 'candidate',
  'capable', 'capital', 'captain', 'capture', 'carbon', 'card', 'care', 'career', 'careful', 'carry',
  'case', 'cash', 'cast', 'catch', 'category', 'cause', 'ceiling', 'celebrate', 'cell', 'center',
  'central', 'century', 'ceremony', 'certain', 'chain', 'chair', 'chairman', 'chamber', 'champion', 'chance',
  'change', 'channel', 'chapter', 'charge', 'charity', 'chart', 'chase', 'cheap', 'check', 'cheese',
  'chemical', 'chest', 'chicken', 'chief', 'child', 'choice', 'choose', 'church', 'citizen', 'city',
  'civil', 'claim', 'class', 'classic', 'classroom', 'clean', 'clear', 'click', 'client', 'climate',
  'climb', 'clock', 'close', 'clothes', 'cloud', 'club', 'coach', 'coast', 'coat', 'code'
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