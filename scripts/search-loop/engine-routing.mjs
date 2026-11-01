#!/usr/bin/env node
// The shared search engine (seq23/search-loop) reads a routing file of the
// shape { policy: { max_cost_usd, fallback_to_paid }, free_models: [...] }.
// This repo keeps ONE model list, config/llm_routing.json, read through
// scripts/llm/free_router.mjs. This script derives the engine's file from it
// (never a second hand-kept list) and refuses if the policy check fails.
// Output: .search-loop-routing.json (gitignored), named in search-loop.config.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConfig, policyErrors } from '../llm/free_router.mjs';

export function engineRouting(cfg = readConfig()) {
  const errors = policyErrors(cfg);
  if (errors.length) throw new Error(`NAMED STOP [ROUTING_POLICY] config/llm_routing.json fails the $0 policy: ${errors.join('; ')}`);
  return {
    derived_from: 'config/llm_routing.json',
    policy: { max_cost_usd: 0, fallback_to_paid: false },
    free_models: cfg.models.map((m) => ({ id: m.id, pricing: { prompt: String(m.pricing.prompt), completion: String(m.pricing.completion) } })),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const out = engineRouting();
  fs.writeFileSync(path.join(root, '.search-loop-routing.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`search-loop routing: ${out.free_models.length} free models from config/llm_routing.json`);
}
