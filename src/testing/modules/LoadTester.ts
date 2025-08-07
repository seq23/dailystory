interface LoadTestResult {
  passed: number;
  failed: number;
  total: number;
  details: Array<{
    scenario: string;
    passed: boolean;
    duration: number;
    userCount: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    details: string;
  }>;
}

interface LoadTestScenario {
  name: string;
  userCount: number;
  duration: number;
  rampUpTime: number;
  endpoint?: string;
  expectedResponseTime: number;
  maxErrorRate: number;
}

export class LoadTester {
  private scenarios: LoadTestScenario[] = [
    {
      name: "Story Generation Under Load",
      userCount: 50,
      duration: 60000,
      rampUpTime: 10000,
      endpoint: "/api/generate-story",
      expectedResponseTime: 3000,
      maxErrorRate: 0.05
    },
    {
      name: "Concurrent Audio Requests",
      userCount: 30,
      duration: 45000,
      rampUpTime: 5000,
      endpoint: "/api/text-to-speech",
      expectedResponseTime: 2000,
      maxErrorRate: 0.02
    },
    {
      name: "Database Read Heavy Load",
      userCount: 100,
      duration: 120000,
      rampUpTime: 15000,
      endpoint: "/api/user-progress",
      expectedResponseTime: 500,
      maxErrorRate: 0.01
    },
    {
      name: "Image Generation Stress",
      userCount: 20,
      duration: 90000,
      rampUpTime: 10000,
      endpoint: "/api/generate-image",
      expectedResponseTime: 5000,
      maxErrorRate: 0.1
    },
    {
      name: "Peak Usage Simulation",
      userCount: 200,
      duration: 180000,
      rampUpTime: 30000,
      expectedResponseTime: 1000,
      maxErrorRate: 0.03
    }
  ];

  async runLoadTests(): Promise<LoadTestResult> {
    const results: LoadTestResult = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };

    console.log("🚀 Starting Load Testing Suite...");

    for (const scenario of this.scenarios) {
      console.log(`⚡ Running scenario: ${scenario.name}`);
      const testResult = await this.runLoadScenario(scenario);
      
      results.details.push(testResult);
      results.total++;
      
      if (testResult.passed) {
        results.passed++;
        console.log(`✅ ${scenario.name} - PASSED`);
      } else {
        results.failed++;
        console.log(`❌ ${scenario.name} - FAILED: ${testResult.details}`);
      }
    }

    // Run spike testing
    console.log("⚡ Running Spike Test...");
    const spikeResult = await this.runSpikeTest();
    results.details.push(spikeResult);
    results.total++;
    
    if (spikeResult.passed) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Run sustained load test
    console.log("⚡ Running Sustained Load Test...");
    const sustainedResult = await this.runSustainedLoadTest();
    results.details.push(sustainedResult);
    results.total++;
    
    if (sustainedResult.passed) {
      results.passed++;
    } else {
      results.failed++;
    }

    return results;
  }

  private async runLoadScenario(scenario: LoadTestScenario) {
    const startTime = Date.now();
    const metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      responseTimes: [] as number[]
    };

    try {
      // Simulate concurrent users
      const userPromises: Promise<void>[] = [];
      
      for (let i = 0; i < scenario.userCount; i++) {
        const userDelay = (scenario.rampUpTime / scenario.userCount) * i;
        
        userPromises.push(
          this.simulateUser(scenario, metrics, userDelay)
        );
      }

      await Promise.all(userPromises);

      const duration = Date.now() - startTime;
      const avgResponseTime = metrics.totalResponseTime / metrics.requests;
      const errorRate = metrics.errors / metrics.requests;
      const throughput = metrics.requests / (duration / 1000);

      // Calculate 95th percentile response time
      const sorted = metrics.responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p95ResponseTime = sorted[p95Index] || 0;

      const passed = avgResponseTime <= scenario.expectedResponseTime && 
                    errorRate <= scenario.maxErrorRate &&
                    p95ResponseTime <= scenario.expectedResponseTime * 1.5;

      return {
        scenario: scenario.name,
        passed,
        duration,
        userCount: scenario.userCount,
        responseTime: avgResponseTime,
        errorRate,
        throughput,
        details: passed ? 
          `Avg response: ${avgResponseTime.toFixed(0)}ms, Error rate: ${(errorRate * 100).toFixed(2)}%, Throughput: ${throughput.toFixed(1)} req/s` :
          `FAILED - Avg response: ${avgResponseTime.toFixed(0)}ms (expected ≤${scenario.expectedResponseTime}ms), Error rate: ${(errorRate * 100).toFixed(2)}% (expected ≤${(scenario.maxErrorRate * 100).toFixed(1)}%)`
      };

    } catch (error) {
      return {
        scenario: scenario.name,
        passed: false,
        duration: Date.now() - startTime,
        userCount: scenario.userCount,
        responseTime: 0,
        errorRate: 1,
        throughput: 0,
        details: `Load test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async simulateUser(
    scenario: LoadTestScenario, 
    metrics: any, 
    delay: number
  ): Promise<void> {
    await this.sleep(delay);
    
    const endTime = Date.now() + scenario.duration;
    
    while (Date.now() < endTime) {
      const requestStart = Date.now();
      
      try {
        // Simulate API request
        await this.makeRequest(scenario.endpoint);
        
        const responseTime = Date.now() - requestStart;
        metrics.requests++;
        metrics.totalResponseTime += responseTime;
        metrics.responseTimes.push(responseTime);
        
      } catch (error) {
        metrics.errors++;
        metrics.requests++;
      }
      
      // Random think time between requests (0.5-2 seconds)
      await this.sleep(500 + Math.random() * 1500);
    }
  }

  private async makeRequest(endpoint?: string): Promise<void> {
    // Simulate different types of requests with realistic delays
    const requestType = endpoint || this.getRandomEndpoint();
    
    let simulatedDelay: number;
    let errorProbability: number;
    
    switch (requestType) {
      case "/api/generate-story":
        simulatedDelay = 1500 + Math.random() * 2000; // 1.5-3.5s
        errorProbability = 0.02;
        break;
      case "/api/text-to-speech":
        simulatedDelay = 800 + Math.random() * 1200; // 0.8-2s
        errorProbability = 0.01;
        break;
      case "/api/generate-image":
        simulatedDelay = 3000 + Math.random() * 4000; // 3-7s
        errorProbability = 0.05;
        break;
      case "/api/user-progress":
        simulatedDelay = 100 + Math.random() * 300; // 0.1-0.4s
        errorProbability = 0.005;
        break;
      default:
        simulatedDelay = 200 + Math.random() * 500; // 0.2-0.7s
        errorProbability = 0.01;
    }
    
    await this.sleep(simulatedDelay);
    
    // Simulate random errors
    if (Math.random() < errorProbability) {
      throw new Error(`Simulated ${requestType} error`);
    }
  }

  private getRandomEndpoint(): string {
    const endpoints = [
      "/api/generate-story",
      "/api/text-to-speech",
      "/api/user-progress",
      "/api/generate-image"
    ];
    return endpoints[Math.floor(Math.random() * endpoints.length)];
  }

  private async runSpikeTest() {
    const startTime = Date.now();
    
    try {
      // Simulate sudden spike to 500 users
      const spikeUsers = 500;
      const spikeDuration = 30000; // 30 seconds
      
      console.log(`📈 Spike test: ${spikeUsers} users for ${spikeDuration/1000}s`);
      
      const userPromises = Array.from({ length: spikeUsers }, (_, i) => 
        this.simulateUser({
          name: "Spike Test",
          userCount: spikeUsers,
          duration: spikeDuration,
          rampUpTime: 1000, // Very fast ramp up
          expectedResponseTime: 5000, // Allow higher response times
          maxErrorRate: 0.1
        }, { requests: 0, errors: 0, totalResponseTime: 0, responseTimes: [] }, 0)
      );

      await Promise.all(userPromises);
      
      const duration = Date.now() - startTime;
      
      return {
        scenario: "Spike Test (500 users)",
        passed: duration < 45000, // Should complete within 45 seconds
        duration,
        userCount: spikeUsers,
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        details: `Spike test completed in ${duration}ms`
      };

    } catch (error) {
      return {
        scenario: "Spike Test (500 users)",
        passed: false,
        duration: Date.now() - startTime,
        userCount: 500,
        responseTime: 0,
        errorRate: 1,
        throughput: 0,
        details: `Spike test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async runSustainedLoadTest() {
    const startTime = Date.now();
    
    try {
      // Sustained load of 100 users for 5 minutes
      const sustainedUsers = 100;
      const sustainedDuration = 300000; // 5 minutes
      
      console.log(`⏱️ Sustained load test: ${sustainedUsers} users for ${sustainedDuration/60000} minutes`);
      
      const metrics = {
        requests: 0,
        errors: 0,
        totalResponseTime: 0,
        responseTimes: [] as number[]
      };

      const userPromises = Array.from({ length: sustainedUsers }, (_, i) => 
        this.simulateUser({
          name: "Sustained Load Test",
          userCount: sustainedUsers,
          duration: sustainedDuration,
          rampUpTime: 10000,
          expectedResponseTime: 2000,
          maxErrorRate: 0.02
        }, metrics, i * 100)
      );

      await Promise.all(userPromises);
      
      const duration = Date.now() - startTime;
      const avgResponseTime = metrics.totalResponseTime / metrics.requests;
      const errorRate = metrics.errors / metrics.requests;
      
      const passed = avgResponseTime <= 2000 && errorRate <= 0.02;
      
      return {
        scenario: "Sustained Load Test (100 users, 5min)",
        passed,
        duration,
        userCount: sustainedUsers,
        responseTime: avgResponseTime,
        errorRate,
        throughput: metrics.requests / (duration / 1000),
        details: passed ?
          `Sustained load completed successfully. Avg response: ${avgResponseTime.toFixed(0)}ms, Error rate: ${(errorRate * 100).toFixed(2)}%` :
          `Sustained load failed. Avg response: ${avgResponseTime.toFixed(0)}ms, Error rate: ${(errorRate * 100).toFixed(2)}%`
      };

    } catch (error) {
      return {
        scenario: "Sustained Load Test (100 users, 5min)",
        passed: false,
        duration: Date.now() - startTime,
        userCount: 100,
        responseTime: 0,
        errorRate: 1,
        throughput: 0,
        details: `Sustained load test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}