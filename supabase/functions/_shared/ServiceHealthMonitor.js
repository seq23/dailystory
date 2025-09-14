// ============= SERVICE HEALTH MONITOR =============
// Phase 4: Smart service health monitoring and routing
// Monitors availability of all critical services for intelligent tier routing

export class ServiceHealthMonitor {
  constructor() {
    this.healthCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
    this.criticalServices = [
      'CharacterConsistencyService',
      'VisualDetailTracker', 
      'SessionStateManager',
      'UniversalPlaceholderResolver'
    ];
  }

  // Check health of all critical services
  async checkAllServicesHealth() {
    console.log('🏥 ServiceHealthMonitor: Checking all services health');
    
    const healthResults = {
      overall: 'HEALTHY',
      services: {},
      timestamp: new Date().toISOString(),
      availableTiers: []
    };

    // Check each critical service
    for (const serviceName of this.criticalServices) {
      try {
        const health = await this.checkServiceHealth(serviceName);
        healthResults.services[serviceName] = health;
      } catch (error) {
        console.error(`❌ Health check failed for ${serviceName}:`, error);
        healthResults.services[serviceName] = {
          status: 'UNHEALTHY',
          error: error.message,
          lastChecked: new Date().toISOString()
        };
      }
    }

    // Determine overall health and available tiers
    healthResults.overall = this.calculateOverallHealth(healthResults.services);
    healthResults.availableTiers = this.determineAvailableTiers(healthResults.services);
    
    console.log('🏥 Overall Health Status:', healthResults.overall);
    console.log('🎯 Available Tiers:', healthResults.availableTiers);
    
    return healthResults;
  }

  // Check individual service health with caching
  async checkServiceHealth(serviceName) {
    const cacheKey = `health_${serviceName}`;
    const cached = this.healthCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.health;
    }

    const health = await this.performHealthCheck(serviceName);
    
    this.healthCache.set(cacheKey, {
      health,
      timestamp: Date.now()
    });

    return health;
  }

  // Perform actual health check for service
  async performHealthCheck(serviceName) {
    try {
      switch (serviceName) {
        case 'CharacterConsistencyService':
          return await this.checkCharacterConsistencyService();
        
        case 'VisualDetailTracker':
          return await this.checkVisualDetailTracker();
        
        case 'SessionStateManager':
          return await this.checkSessionStateManager();
        
        case 'UniversalPlaceholderResolver':
          return await this.checkUniversalPlaceholderResolver();
        
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Health check for CharacterConsistencyService
  async checkCharacterConsistencyService() {
    try {
      const { CharacterConsistencyService } = await import('./CharacterConsistencyService.js');
      const service = new CharacterConsistencyService();
      
      // Test basic functionality
      const testResult = service.generateConsistentCharacter({
        name: 'TestUser',
        age: 8
      });
      
      if (testResult && testResult.visualDescription) {
        return {
          status: 'HEALTHY',
          responseTime: Date.now(),
          lastChecked: new Date().toISOString(),
          capabilities: ['character_generation', 'consistency_tracking']
        };
      } else {
        throw new Error('Service response validation failed');
      }
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Health check for VisualDetailTracker
  async checkVisualDetailTracker() {
    try {
      const { VisualDetailTracker } = await import('./VisualDetailTracker.js');
      const tracker = new VisualDetailTracker();
      
      // Test basic functionality
      const testDetails = tracker.extractVisualElements('test story text');
      
      return {
        status: 'HEALTHY',
        responseTime: Date.now(),
        lastChecked: new Date().toISOString(),
        capabilities: ['visual_extraction', 'detail_tracking']
      };
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Health check for SessionStateManager
  async checkSessionStateManager() {
    try {
      const { SessionStateManager } = await import('./SessionStateManager.js');
      const manager = new SessionStateManager();
      
      // Test basic functionality
      const testSession = manager.initializeSession('test-user-id');
      
      if (testSession && testSession.sessionId) {
        return {
          status: 'HEALTHY',
          responseTime: Date.now(),
          lastChecked: new Date().toISOString(),
          capabilities: ['session_management', 'state_tracking']
        };
      } else {
        throw new Error('Session initialization failed');
      }
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Health check for UniversalPlaceholderResolver
  async checkUniversalPlaceholderResolver() {
    try {
      const { UniversalPlaceholderResolver } = await import('./UniversalPlaceholderResolver.js');
      const resolver = new UniversalPlaceholderResolver(
        { name: 'TestUser', age: 8 },
        null,
        'test story text'
      );
      
      // Test basic functionality
      const testResult = resolver.resolve('Test {character} template');
      
      if (testResult && testResult.includes('TestUser')) {
        return {
          status: 'HEALTHY',
          responseTime: Date.now(),
          lastChecked: new Date().toISOString(),
          capabilities: ['placeholder_resolution', 'cultural_intelligence']
        };
      } else {
        throw new Error('Placeholder resolution failed');
      }
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Calculate overall system health
  calculateOverallHealth(services) {
    const statuses = Object.values(services).map(s => s.status);
    const healthyCount = statuses.filter(s => s === 'HEALTHY').length;
    const totalCount = statuses.length;
    
    if (healthyCount === totalCount) {
      return 'HEALTHY';
    } else if (healthyCount >= totalCount * 0.75) {
      return 'DEGRADED';
    } else if (healthyCount >= totalCount * 0.5) {
      return 'UNHEALTHY';
    } else {
      return 'CRITICAL';
    }
  }

  // Determine which tiers are available based on service health
  determineAvailableTiers(services) {
    const availableTiers = [];
    
    // Tier 1: Requires all services healthy
    const allServicesHealthy = Object.values(services).every(s => s.status === 'HEALTHY');
    if (allServicesHealthy) {
      availableTiers.push('1');
    }

    // Tier 2.5A: Requires CharacterConsistencyService + UniversalPlaceholderResolver
    const tier25AServices = [
      services.CharacterConsistencyService?.status === 'HEALTHY',
      services.UniversalPlaceholderResolver?.status === 'HEALTHY'
    ];
    if (tier25AServices.every(Boolean)) {
      availableTiers.push('2.5A');
    }

    // Tier 2.5B: Nuclear independence - always available (no external dependencies)
    availableTiers.push('2.5B');

    // Tier 2.5C: Requires UniversalPlaceholderResolver only
    if (services.UniversalPlaceholderResolver?.status === 'HEALTHY') {
      availableTiers.push('2.5C');
    }

    // Tier 2.5D: Always available (hardcoded fallback)
    availableTiers.push('2.5D');

    return availableTiers;
  }

  // Smart routing recommendation based on health
  recommendTier(userInfo, services) {
    const availableTiers = this.determineAvailableTiers(services);
    const userComplexity = this.getUserComplexityLevel(userInfo);
    
    console.log('🎯 Available tiers for routing:', availableTiers);
    console.log('👤 User complexity level:', userComplexity);

    // Route to best available tier based on user needs and service health
    for (const tier of this.getPreferredTierOrder(userComplexity)) {
      if (availableTiers.includes(tier)) {
        console.log(`✅ Routing to Tier ${tier} (best available match)`);
        return tier;
      }
    }

    // Fallback to most basic available tier
    const fallbackTier = availableTiers[availableTiers.length - 1] || '2.5D';
    console.log(`⚠️ Fallback routing to Tier ${fallbackTier}`);
    return fallbackTier;
  }

  // Determine user complexity level for smart routing
  getUserComplexityLevel(userInfo) {
    if (!userInfo) return 'basic';
    
    const complexity = userInfo.difficulty || 'medium';
    const hasCustomization = userInfo.interests?.length > 0 || userInfo.special_request;
    
    if (complexity === 'hard' || hasCustomization) {
      return 'advanced';
    } else if (complexity === 'medium') {
      return 'intermediate';
    } else {
      return 'basic';
    }
  }

  // Get preferred tier order based on user complexity
  getPreferredTierOrder(userComplexity) {
    switch (userComplexity) {
      case 'advanced':
        return ['1', '2.5A', '2.5C', '2.5B', '2.5D'];
      case 'intermediate':
        return ['2.5A', '2.5C', '2.5B', '2.5D'];
      case 'basic':
      default:
        return ['2.5B', '2.5C', '2.5A', '2.5D'];
    }
  }

  // Get degradation strategy for unhealthy services
  getDegradationStrategy(services) {
    const unhealthyServices = Object.entries(services)
      .filter(([, health]) => health.status !== 'HEALTHY')
      .map(([name]) => name);

    const strategy = {
      degradedServices: unhealthyServices,
      mitigations: [],
      recommendedTier: null
    };

    if (unhealthyServices.includes('CharacterConsistencyService')) {
      strategy.mitigations.push('Use basic character templates instead of dynamic consistency');
    }

    if (unhealthyServices.includes('VisualDetailTracker')) {
      strategy.mitigations.push('Disable visual continuity tracking');
    }

    if (unhealthyServices.includes('SessionStateManager')) {
      strategy.mitigations.push('Use stateless operation mode');
    }

    if (unhealthyServices.includes('UniversalPlaceholderResolver')) {
      strategy.mitigations.push('Use basic placeholder replacement');
    }

    // Recommend safest tier based on degradation
    if (unhealthyServices.length === 0) {
      strategy.recommendedTier = '1';
    } else if (unhealthyServices.length <= 2) {
      strategy.recommendedTier = '2.5A';
    } else {
      strategy.recommendedTier = '2.5B'; // Nuclear independence
    }

    return strategy;
  }

  // Clear health cache (for testing or forced refresh)
  clearHealthCache() {
    this.healthCache.clear();
    console.log('🧹 Service health cache cleared');
  }
}

// Create singleton instance
export const serviceHealthMonitor = new ServiceHealthMonitor();