# CORS Implementation Guide

**Last Updated:** 2025-01-30  
**Status:** Production Standard

## Overview

This project uses a **three-tiered CORS architecture** to handle different edge function requirements. This document explains when to use each system and provides implementation best practices.

---

## 🏗️ Architecture: Three CORS Systems

### **System 1: `healthCors.ts` - Dynamic CORS Wrapper** 
**Location:** `supabase/functions/_shared/healthCors.ts`

**Best For:**
- Audio/TTS functions requiring dynamic origin reflection
- Functions needing custom header mirroring
- Modern endpoints requiring flexible CORS

**Key Features:**
- ✅ Dynamic origin reflection (mirrors `Origin` header)
- ✅ Automatic `Access-Control-Request-Headers` mirroring
- ✅ `withCors()` wrapper for automatic error CORS handling
- ✅ Built-in health endpoint support (`/health`, `HEAD`, `GET`)

**Usage Example:**
```typescript
import { withCors } from '../_shared/healthCors.ts';

serve(withCors(async (req) => {
  // Your function logic
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}));
```

**Functions Using This:** 
- `elevenlabs-tts-smart`
- `elevenlabs-agent-signed-url`
- All audio/TTS endpoints

---

### **System 2: `corsAdvanced.ts` - Comprehensive TypeScript CORS**
**Location:** `supabase/functions/_shared/corsAdvanced.ts`

**Best For:**
- Image generation tier functions (`runware-*`, `ai-visual-scene-creator`)
- Functions requiring comprehensive monitoring
- TypeScript-first implementations

**Key Features:**
- ✅ Type-safe CORS configuration
- ✅ Comprehensive header baseline (`COMPREHENSIVE_HEADER_BASELINE`)
- ✅ Advanced error response formatting
- ✅ Monitoring-friendly CORS metadata

**Usage Example:**
```typescript
import { createDynamicCorsResponse, createDynamicCorsOptionsResponse } from '../_shared/corsAdvanced.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createDynamicCorsOptionsResponse(req);
  }
  
  const data = { success: true };
  return createDynamicCorsResponse(req, data);
});
```

**Functions Using This:**
- `ai-visual-scene-creator`
- `runware-template-ab`
- `runware-template-cd`

---

### **System 3: Static `corsHeaders` Objects**
**Location:** Inline in each function

**Best For:**
- Payment functions (`create-checkout`, `customer-portal`, `check-subscription`)
- Simple, stable endpoints
- Utility functions with predictable CORS needs

**Key Features:**
- ✅ Zero overhead (no function calls)
- ✅ Explicit and auditable
- ✅ Works with all origins (`Access-Control-Allow-Origin: *`)
- ✅ Now includes `Vary` header for proper caching

**Usage Example:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers', // ✅ REQUIRED
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  // Your logic
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

**Functions Using This:** 27 functions including:
- `create-checkout`, `customer-portal`, `check-subscription`
- `openai-tts`, `elevenlabs-tts`
- `correct-spelling`, `translate-universal`, `word-dictionary`

---

## 🎯 Decision Tree: Which CORS System to Use?

```
START: Creating new edge function
│
├─ Does it require dynamic origin validation?
│  └─ YES → Use `healthCors.ts` with `withCors()`
│
├─ Is it part of image generation tier?
│  └─ YES → Use `corsAdvanced.ts`
│
├─ Is it a payment/subscription function?
│  └─ YES → Use static `corsHeaders` (ensure Vary header)
│
├─ Is it a simple utility/translation function?
│  └─ YES → Use static `corsHeaders` (ensure Vary header)
│
└─ DEFAULT → Use static `corsHeaders` (simplest approach)
```

---

## ✅ CORS Best Practices

### **1. Always Use Status 204 for OPTIONS**
```typescript
// ✅ CORRECT
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// ❌ WRONG
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 200, headers: corsHeaders });
}
```

### **2. Include Vary Header in Static corsHeaders**
```typescript
// ✅ CORRECT
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers', // ✅ Required
};

// ❌ INCOMPLETE
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // Missing Vary header
};
```

### **3. Always Merge CORS Headers on Responses**
```typescript
// ✅ CORRECT
return new Response(JSON.stringify(data), {
  headers: { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  }
});

// ❌ WRONG (missing CORS headers)
return new Response(JSON.stringify(data), {
  headers: { 'Content-Type': 'application/json' }
});
```

### **4. Handle Errors with CORS Headers**
```typescript
// ✅ CORRECT
try {
  // logic
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ❌ WRONG (errors blocked by browser due to missing CORS)
try {
  // logic
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500
  });
}
```

---

## 🧪 Testing Checklist

Before deploying a new edge function, verify:

- [ ] Preflight `OPTIONS` request returns status **204**
- [ ] Preflight response includes all required headers:
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Headers`
  - `Access-Control-Allow-Methods`
  - `Access-Control-Max-Age`
  - `Vary` (for static corsHeaders)
- [ ] All responses (success and error) include CORS headers
- [ ] Function works from:
  - [ ] Local development (`localhost`)
  - [ ] Lovable preview environment (`.lovable.dev`)
  - [ ] Production domain
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows proper preflight and actual request

---

## 🚨 Common Pitfalls to Avoid

### ❌ **1. Returning 200 Instead of 204 for OPTIONS**
**Problem:** Some browsers may cache this incorrectly  
**Fix:** Always use `status: 204` for preflight responses

### ❌ **2. Missing Vary Header**
**Problem:** CDN/browser cache may serve wrong responses  
**Fix:** Add `'Vary': 'Origin, Access-Control-Request-Headers'` to static corsHeaders

### ❌ **3. Forgetting CORS on Error Responses**
**Problem:** Browser blocks error details from frontend  
**Fix:** Include corsHeaders in all error responses

### ❌ **4. Using Multiple CORS Systems in One Function**
**Problem:** Confusion and potential header conflicts  
**Fix:** Pick ONE system and stick with it

---

## 📊 Current System Status

**Total Functions:** 40  
**Using `healthCors.ts`:** 8 functions (audio/TTS tier)  
**Using `corsAdvanced.ts`:** 3 functions (image generation tier)  
**Using static `corsHeaders`:** 27 functions (payment, utility, etc.)  
**Using legacy systems:** 2 functions (deprecated, scheduled for migration)

**CORS Issues in Production:** ✅ **ZERO** (as of 2025-01-30)

---

## 🔧 Maintenance

### When to Update This Guide
- New CORS system introduced
- Edge function patterns change
- Browser CORS requirements evolve
- Production CORS issues discovered

### Migration Path (If Needed)
If you need to consolidate systems in the future:
1. Document current usage patterns
2. Choose target system (`healthCors.ts` recommended)
3. Migrate non-critical functions first
4. Test thoroughly in preview environment
5. Monitor production logs after deployment

---

## 📚 Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Supabase Edge Functions CORS Guide](https://supabase.com/docs/guides/functions/cors)
- Project-specific: `supabase/functions/_shared/healthCors.ts` (canonical implementation)

---

**Questions or Issues?**  
Consult this guide first, then review production logs, and test in preview environment before making changes.
