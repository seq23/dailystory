// Quick test script to verify edge functions are working
// Run this to test the edge function fixes

const PROJECT_ID = 'cpzeuogomaixamrtnnmj';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino';

const FUNCTIONS = [
  'runware-template-ab',
  'runware-template-cd', 
  'runware-generate-image'
];

async function testFunction(functionName) {
  const url = `https://${PROJECT_ID}.supabase.co/functions/v1/${functionName}`;
  
  try {
    console.log(`Testing ${functionName}...`);
    
    // Test with HEAD request first (should return 200)
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`${functionName} HEAD: ${headResponse.status} ${headResponse.statusText}`);
    
    // Test with GET request (should return service info)
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`${functionName} GET: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.ok) {
      const data = await getResponse.text();
      console.log(`${functionName} Response: ${data.substring(0, 100)}...`);
    } else {
      console.error(`${functionName} Error: ${await getResponse.text()}`);
    }
    
  } catch (error) {
    console.error(`${functionName} Test Failed:`, error.message);
  }
  
  console.log('---');
}

async function runTests() {
  console.log('🧪 Testing Edge Functions After Bug Fix');
  console.log('==========================================');
  
  for (const functionName of FUNCTIONS) {
    await testFunction(functionName);
  }
  
  console.log('✅ Test Complete');
}

// Uncomment to run:
// runTests();

module.exports = { runTests };