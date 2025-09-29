/**
 * Stripe vendor wrapper - Local fallback for CDN failures
 * Version: 12.18.0
 * 
 * This wrapper provides resilient access to the Stripe SDK by falling back
 * to a locally bundled version when network CDNs are unavailable.
 */

// Import from the actual bundle
import Stripe from './stripe@12.18.0.bundle.mjs';

export default Stripe;
export { Stripe };
