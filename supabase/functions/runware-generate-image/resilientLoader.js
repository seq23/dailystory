/**
 * Shim: Re-export resilientLoader from _shared
 * 
 * This eliminates import-map reliance for CCS's vendor-first fallback.
 * CCS can now use "./resilientLoader.js" and it will resolve to the shared implementation.
 */

export * from "../_shared/resilientLoader.js";
