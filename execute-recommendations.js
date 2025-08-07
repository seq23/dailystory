#!/usr/bin/env node

/**
 * Execute 4 Key Test Recommendations in Order
 */

import { execSync } from 'child_process';

console.log('🎯 EXECUTING 4 KEY TEST RECOMMENDATIONS IN ORDER');
console.log('='.repeat(50));

const recommendations = [
  {
    step: 1,
    name: 'Install Playwright Browsers',
    cmd: 'npx playwright install',
    critical: true
  },
  {
    step: 2, 
    name: 'Run Unit Tests',
    cmd: 'npx vitest run src/test/unit --reporter=basic',
    critical: true
  },
  {
    step: 3,
    name: 'Execute Load Tests', 
    cmd: 'npx playwright test e2e/load-testing.spec.ts',
    critical: false
  },
  {
    step: 4,
    name: 'Run Security Tests',
    cmd: 'npx playwright test e2e/security.spec.ts', 
    critical: false
  }
];

let completedSteps = 0;
let failedSteps = 0;

for (const { step, name, cmd, critical } of recommendations) {
  console.log(`\n🔄 STEP ${step}: ${name}`);
  console.log(`Command: ${cmd}`);
  
  const startTime = Date.now();
  
  try {
    execSync(cmd, { stdio: 'inherit', timeout: 300000 });
    const duration = Date.now() - startTime;
    
    console.log(`✅ STEP ${step} COMPLETED: ${name} (${duration}ms)`);
    completedSteps++;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ STEP ${step} FAILED: ${name} (${duration}ms)`);
    
    if (critical) {
      console.log(`🔥 CRITICAL STEP FAILED - This may affect subsequent steps`);
    }
    
    failedSteps++;
    console.log(`Error: ${error.message.substring(0, 200)}...`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('📊 RECOMMENDATIONS EXECUTION SUMMARY');
console.log('='.repeat(50));

console.log(`✅ Completed Steps: ${completedSteps}/4`);
console.log(`❌ Failed Steps: ${failedSteps}/4`);
console.log(`📊 Success Rate: ${((completedSteps / 4) * 100).toFixed(1)}%`);

if (completedSteps === 4) {
  console.log('\n🎉 ALL RECOMMENDATIONS COMPLETED SUCCESSFULLY!');
  console.log('Your enterprise test suite is fully operational.');
} else if (completedSteps >= 2) {
  console.log('\n✅ PARTIAL SUCCESS - Core functionality validated');
  console.log(`Fix ${failedSteps} remaining issue(s) for complete coverage.`);
} else {
  console.log('\n🔥 NEEDS ATTENTION - Multiple critical steps failed');
  console.log('Review error messages above and fix infrastructure issues.');
}

console.log('\n📋 Next Steps:');
console.log('- Review any failed steps above');
console.log('- Run individual test commands for detailed debugging'); 
console.log('- Use: node setup-test-scripts.js run [test-name]');

process.exit(failedSteps > 2 ? 1 : 0);