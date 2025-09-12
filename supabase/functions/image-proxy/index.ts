// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[image-proxy] Loaded: 2025-09-12T18:45:32Z");
import { serve } from "https://deno.land/std@0.168.0/http/server.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageProxyRequest {
  url: string;
  maxSize?: number;
}

const ALLOWED_DOMAINS = [
  'im.runware.ai',
  'images.unsplash.com',
  'cdn.openai.com'
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ALLOWED_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

async function validateImageContent(response: Response): Promise<boolean> {
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  // Check content type
  if (!contentType || !ALLOWED_CONTENT_TYPES.some(type => contentType.includes(type))) {
    return false;
  }

  // Check content size
  if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
    return false;
  }

  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response('Missing url parameter', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Validate the image URL domain
    if (!validateImageUrl(imageUrl)) {
      console.warn('🚫 Blocked request to unauthorized domain:', imageUrl);
      return new Response('Unauthorized domain', { 
        status: 403,
        headers: corsHeaders 
      });
    }

    // Fetch the image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      console.log('🖼️ Proxying image request:', imageUrl);
      
      const imageResponse = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ImageProxy/1.0',
        }
      });

      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        console.warn('📡 Failed to fetch image:', imageResponse.status, imageResponse.statusText);
        return new Response('Failed to fetch image', { 
          status: imageResponse.status,
          headers: corsHeaders 
        });
      }

      // Validate image content
      if (!await validateImageContent(imageResponse)) {
        console.warn('🚫 Invalid image content detected:', imageUrl);
        return new Response('Invalid image content', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      // Stream the image back
      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', imageResponse.headers.get('content-type') || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Add security headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Content-Security-Policy', "default-src 'none'");
      
      return new Response(imageResponse.body, {
        status: 200,
        headers
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.warn('⏱️ Image request timeout:', imageUrl);
        return new Response('Request timeout', { 
          status: 408,
          headers: corsHeaders 
        });
      }
      
      console.error('🔥 Image fetch error:', fetchError);
      return new Response('Failed to fetch image', { 
        status: 500,
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('🔥 Image proxy error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});