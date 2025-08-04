// Simple Word Count Verification for Difficulty Levels
// Quick test to verify word counts are appropriate for each level

import { getDifficultyAppropriateTemplate, validateDifficultyCompliance } from '@/constants/difficultyAppropriateTemplates';

console.log('🔍 WORD COUNT VERIFICATION TEST');
console.log('================================');

const difficulties = ['easy', 'medium', 'hard', 'expert'] as const;

difficulties.forEach(difficulty => {
  console.log(`\n📝 Testing ${difficulty.toUpperCase()} level:`);
  
  // Get 3 sample templates for this difficulty
  for (let i = 0; i < 3; i++) {
    const template = getDifficultyAppropriateTemplate(difficulty);
    const samplePage = template[0]; // Get first page of template
    
    // Replace placeholders with sample data
    const processedContent = samplePage
      .replace(/{name}/g, 'Alex')
      .replace(/{animal}/g, 'cat')
      .replace(/{color}/g, 'blue')
      .replace(/{food}/g, 'pizza')
      .replace(/{object}/g, 'treasure')
      .replace(/{setting}/g, 'forest')
      .replace(/{pronoun}/g, 'they');
    
    const wordCount = processedContent.split(/\s+/).filter(w => w.trim()).length;
    const validation = validateDifficultyCompliance(processedContent, difficulty);
    
    const status = validation.isValid ? '✅' : '❌';
    const range = `${validation.expectedRange.min}-${validation.expectedRange.max}`;
    
    console.log(`   Sample ${i + 1}: ${status} ${wordCount} words (target: ${range})`);
    console.log(`   Content: "${processedContent}"`);
    
    if (!validation.isValid) {
      console.log(`   ⚠️ ISSUE: Word count ${wordCount} is outside expected range ${range}`);
    }
  }
});

console.log('\n🎯 EXPECTED WORD COUNT RANGES:');
console.log('   Easy: 3-6 words (Level 1 vocabulary)');
console.log('   Medium: 6-12 words (age-appropriate)');
console.log('   Hard: 10-18 words (complete thoughts)');
console.log('   Expert: 15-25 words (complex thoughts)');

console.log('\n📱 MOBILE LAYOUT EXPECTATIONS:');
console.log('   Easy: No scrolling required');
console.log('   Medium: No scrolling required');
console.log('   Hard: No scrolling required');
console.log('   Expert: Minimal scrolling acceptable');

// Test seamless switching
console.log('\n🔄 TESTING SEAMLESS SWITCHING:');
console.log('Generating one page for each difficulty...');

const switchTest = difficulties.map(difficulty => {
  const template = getDifficultyAppropriateTemplate(difficulty);
  const content = template[0]
    .replace(/{name}/g, 'Alex')
    .replace(/{animal}/g, 'cat')
    .replace(/{color}/g, 'blue');
  
  const wordCount = content.split(/\s+/).filter(w => w.trim()).length;
  const charCount = content.length;
  
  return {
    difficulty,
    wordCount,
    charCount,
    content: content.substring(0, 50) + '...'
  };
});

switchTest.forEach(test => {
  console.log(`   ${test.difficulty}: ${test.wordCount} words, ${test.charCount} chars - "${test.content}"`);
});

const wordCounts = switchTest.map(t => t.wordCount);
const charCounts = switchTest.map(t => t.charCount);

console.log(`\n📊 PROGRESSION ANALYSIS:`);
console.log(`   Word progression: ${wordCounts.join(' → ')} (should increase)`);
console.log(`   Character progression: ${charCounts.join(' → ')} (should increase)`);

const wordProgression = wordCounts.every((count, i) => i === 0 || count >= wordCounts[i - 1]);
const charProgression = charCounts.every((count, i) => i === 0 || count >= charCounts[i - 1]);

console.log(`   Word progression correct: ${wordProgression ? '✅' : '❌'}`);
console.log(`   Character progression correct: ${charProgression ? '✅' : '❌'}`);

if (wordProgression && charProgression) {
  console.log('\n🎉 DIFFICULTY PROGRESSION IS WORKING CORRECTLY!');
} else {
  console.log('\n⚠️ DIFFICULTY PROGRESSION NEEDS ADJUSTMENT');
}