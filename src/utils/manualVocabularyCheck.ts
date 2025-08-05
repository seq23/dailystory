// Manual Vocabulary Count & Duplicate Check
import { 
  DOLCH_PRE_PRIMER_VOCABULARY, 
  PREMIUM_LEVEL_0_VOCABULARY,
  FREE_LEVEL_0_VOCABULARY 
} from '@/constants/dolchPrePrimer';

console.log('🔢 MANUAL COUNT & DUPLICATE CHECK');
console.log('=================================');

// Convert to arrays for analysis
const dolchArray = Array.from(DOLCH_PRE_PRIMER_VOCABULARY).sort();
const freeArray = Array.from(FREE_LEVEL_0_VOCABULARY).sort();  
const premiumArray = Array.from(PREMIUM_LEVEL_0_VOCABULARY).sort();

console.log('\n📝 DOLCH PRE-PRIMER (40 words):');
console.log(dolchArray.join(', '));
console.log(`Count: ${dolchArray.length}`);

console.log('\n📝 FREE VOCABULARY:');
console.log(freeArray.join(', '));
console.log(`Count: ${freeArray.length}`);
console.log(`Matches Dolch: ${freeArray.length === dolchArray.length && freeArray.every(word => dolchArray.includes(word))}`);

console.log('\n📝 PREMIUM VOCABULARY:');
console.log(premiumArray.join(', '));
console.log(`Count: ${premiumArray.length}`);

// Find premium-only words
const premiumOnly = premiumArray.filter(word => !dolchArray.includes(word)).sort();
console.log('\n✨ PREMIUM-ONLY WORDS:');
console.log(premiumOnly.join(', '));
console.log(`Premium-only count: ${premiumOnly.length}`);
console.log(`Total premium: ${premiumArray.length} (40 Dolch + ${premiumOnly.length} additions)`);

// Check for any words that might be in Dolch already
const additionsInDolch = premiumOnly.filter(word => dolchArray.includes(word));
if (additionsInDolch.length > 0) {
  console.log(`⚠️  Words already in Dolch: ${additionsInDolch.join(', ')}`);
} else {
  console.log('✅ No duplicates found in premium additions');
}

// Manual verification of specific words
const testWords = ['the', 'of', 'to', 'was', 'some', 'new', 'has', 'will'];
console.log('\n🧪 MANUAL WORD TESTS:');
testWords.forEach(word => {
  const inDolch = dolchArray.includes(word);
  const inFree = freeArray.includes(word);
  const inPremium = premiumArray.includes(word);
  console.log(`"${word}": Dolch=${inDolch}, Free=${inFree}, Premium=${inPremium}`);
});

console.log('\n🎯 SUMMARY:');
console.log(`✅ Dolch words: ${dolchArray.length}`);
console.log(`✅ Free words: ${freeArray.length} (should equal Dolch)`);
console.log(`✅ Premium words: ${premiumArray.length} (should be ~75+)`);
console.log(`✅ Premium additions: ${premiumOnly.length}`);

export { dolchArray, freeArray, premiumArray, premiumOnly };