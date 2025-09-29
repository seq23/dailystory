/**
 * Stripe SDK Bundle - Local vendor copy
 * Version: 12.18.0
 * 
 * This is a vendored copy of the Stripe SDK for use as a fallback when
 * network CDNs are unavailable. This ensures payment verification can
 * continue even during CDN outages.
 * 
 * To update this bundle:
 * 1. npm install stripe@12.18.0
 * 2. Copy the appropriate ESM bundle from node_modules
 * 3. Ensure compatibility with Deno runtime
 * 
 * NOTE: This is a placeholder that exports a minimal Stripe constructor.
 * In production, this should be replaced with the full Stripe SDK bundle.
 * For now, we'll rely on the CDN and graceful degradation in check-subscription.
 */

// Minimal Stripe constructor for vendor fallback
class Stripe {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.apiVersion = options.apiVersion || '2023-10-16';
    
    // Initialize API resources
    this.customers = {
      list: async (params) => {
        throw new Error('Stripe vendor bundle: Full SDK not available. Please use network CDN.');
      }
    };
    
    this.subscriptions = {
      list: async (params) => {
        throw new Error('Stripe vendor bundle: Full SDK not available. Please use network CDN.');
      }
    };
  }
}

export default Stripe;
