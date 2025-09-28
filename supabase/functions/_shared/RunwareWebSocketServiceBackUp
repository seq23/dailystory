// ============= Full TypeScript conversion =============
// Unified Runware WebSocket Service
// Single source of truth for all Runware WebSocket operations across edge functions

// TypeScript interfaces for type safety
interface GenerateImageParams {
  apiKey: string;
  positivePrompt: string;
  negativePrompt?: string;
  parameters?: ImageParameters;
  timeout?: number;
}

interface ImageParameters {
  width?: number;
  height?: number;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  steps?: number;
  seed?: number;
}

interface ImageGenerationResult {
  success: boolean;
  imageURL: string;
  seed: number;
  cost: number;
  NSFWContent: boolean;
}

interface TestConnectionResult {
  success: boolean;
  error?: string;
  connectionSessionUUID?: string;
}

interface RunwareResponse {
  error?: boolean;
  errors?: Array<{ message: string }>;
  errorMessage?: string;
  data?: Array<RunwareResponseItem>;
}

interface RunwareResponseItem {
  taskType: string;
  taskUUID?: string;
  imageURL?: string;
  seed?: number;
  cost?: number;
  NSFWContent?: boolean;
  connectionSessionUUID?: string;
}

interface ErrorWithMetadata extends Error {
  type?: string;
  nextAction?: string;
}

class RunwareWebSocketService {
  static async generateImage({
    apiKey,
    positivePrompt,
    negativePrompt = '',
    parameters = {},
    timeout = 120000 // Increased from 30s to 120s for image generation
  }: GenerateImageParams): Promise<ImageGenerationResult> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://ws-api.runware.ai/v1');
      let authCompleted = false;
      let resolved = false;
      let keepaliveInterval: number | null = null;
      
      // WebSocket timeout handler with improved error messaging
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (keepaliveInterval) clearInterval(keepaliveInterval);
          ws.close();
          console.error(`❌ Image generation timeout after ${timeout}ms`);
          reject(new Error(`Image generation timeout after ${timeout / 1000} seconds`));
        }
      }, timeout);

      ws.onopen = () => {
        console.log('📡 WebSocket connected to Runware for image generation');
        
        // Set up keepalive mechanism (ping every 20 seconds)
        keepaliveInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN && !resolved) {
            console.log('🏓 Sending WebSocket keepalive ping');
            try {
              (ws as any).ping();
            } catch (error) {
              // Ping not supported, send a minimal message instead
              console.log('🏓 Ping not supported, using alternative keepalive');
            }
          }
        }, 20000);
        
        // Send authentication
        const authMessage = JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]);
        ws.send(authMessage);
      };

      ws.onmessage = (event: MessageEvent) => {
        if (resolved) return;
        
        console.log('📩 WebSocket message:', event.data);
        const response: RunwareResponse = JSON.parse(event.data);
        
        // Handle errors
        if (response.error || response.errors) {
          console.error('❌ Runware error during image generation:', response);
          resolved = true;
          clearTimeout(timeoutId);
          if (keepaliveInterval) clearInterval(keepaliveInterval);
          ws.close();
          const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Image generation failed';
          reject(new Error(errorMessage));
          return;
        }

        // Handle successful responses
        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === "authentication" && !authCompleted) {
              authCompleted = true;
              console.log('✅ Runware authenticated');
              
              // Send image generation request
              const imageRequest = [{
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: positivePrompt,
                negativePrompt: negativePrompt,
                width: parameters.width || 1024,
                height: parameters.height || 1024,
                model: parameters.model || "runware:100@1",
                numberResults: parameters.numberResults || 1,
                outputFormat: parameters.outputFormat || "WEBP",
                CFGScale: parameters.CFGScale || 8,
                scheduler: parameters.scheduler || "FlowMatchEulerDiscreteScheduler",
                steps: parameters.steps || 25,
                ...(parameters.seed && { seed: parameters.seed })
              }];
              
              console.log('🚀 Sending image generation request');
              ws.send(JSON.stringify(imageRequest));
              
            } else if (item.taskType === "imageInference") {
              console.log('🎯 Image generated successfully:', item.imageURL);
              resolved = true;
              clearTimeout(timeoutId);
              if (keepaliveInterval) clearInterval(keepaliveInterval);
              ws.close();
              
              resolve({
                success: true,
                imageURL: item.imageURL!,
                seed: item.seed!,
                cost: item.cost!,
                NSFWContent: item.NSFWContent || false
              });
            }
          }
        }
      };

      ws.onerror = (error: Event) => {
        if (!resolved) {
          resolved = true;
          console.error('❌ WebSocket error during image generation:', error);
          clearTimeout(timeoutId);
          if (keepaliveInterval) clearInterval(keepaliveInterval);
          
          // Phase 2: Enhanced error classification
          const errorType = this.classifyWebSocketError(error as any);
          const enhancedError: ErrorWithMetadata = new Error(`WebSocket ${errorType}: ${(error as any)?.message || 'Connection failed'}`);
          enhancedError.type = errorType;
          enhancedError.nextAction = errorType === 'AUTH_ERROR' ? 'ESCALATE_TIER_4' : 'RETRY_THEN_TIER_4';
          
          reject(enhancedError);
        }
      };

      ws.onclose = (event: CloseEvent) => {
        if (!resolved) {
          resolved = true;
          console.log(`🔌 WebSocket closed unexpectedly during image generation (code: ${event.code})`);
          clearTimeout(timeoutId);
          if (keepaliveInterval) clearInterval(keepaliveInterval);
          
          // Phase 2: Enhanced close code handling
          const closeReason = this.getCloseReason(event.code);
          const error: ErrorWithMetadata = new Error(`WebSocket closed: ${closeReason} (code: ${event.code})`);
          error.type = event.code === 1000 ? 'NORMAL_CLOSE' : 'ABNORMAL_CLOSE';
          error.nextAction = event.code === 1000 ? 'RETRY' : 'ESCALATE_TIER_4';
          
          reject(error);
        }
      };
    });
  }

  // Helper for diagnostic operations
  static async testConnection(apiKey: string, timeout: number = 15000): Promise<TestConnectionResult> {
    return new Promise((resolve) => {
      const ws = new WebSocket('wss://ws-api.runware.ai/v1');
      let resolved = false;
      
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          resolve({ success: false, error: 'Connection timeout' });
        }
      }, timeout);

      ws.onopen = () => {
        console.log('🔌 Test connection established');
        
        const authMessage = JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]);
        ws.send(authMessage);
      };

      ws.onmessage = (event: MessageEvent) => {
        if (resolved) return;
        
        const response: RunwareResponse = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          resolved = true;
          clearTimeout(timeoutId);
          ws.close();
          resolve({ 
            success: false, 
            error: response.errorMessage || response.errors?.[0]?.message 
          });
          return;
        }

        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === "authentication") {
              resolved = true;
              clearTimeout(timeoutId);
              ws.close();
              resolve({ 
                success: true, 
                connectionSessionUUID: item.connectionSessionUUID 
              });
            }
          }
        }
      };

      ws.onerror = (error: Event) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ success: false, error: 'WebSocket error' });
        }
      };

      ws.onclose = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ success: false, error: 'Connection closed' });
        }
      };
    });
  }

  // Phase 2: Error classification helpers
  static classifyWebSocketError(error: any): string {
    const msg = error?.message?.toLowerCase() || '';
    if (msg.includes('auth') || msg.includes('unauthorized') || msg.includes('api key')) {
      return 'AUTH_ERROR';
    }
    if (msg.includes('network') || msg.includes('connection') || msg.includes('timeout')) {
      return 'NETWORK_ERROR';
    }
    if (msg.includes('quota') || msg.includes('limit')) {
      return 'QUOTA_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }
  
  static getCloseReason(code: number): string {
    const reasons: Record<number, string> = {
      1000: 'Normal Closure',
      1001: 'Going Away',
      1002: 'Protocol Error',
      1003: 'Unsupported Data',
      1006: 'Abnormal Closure',
      1011: 'Internal Error',
      1012: 'Service Restart',
      1013: 'Try Again Later',
      1014: 'Bad Gateway'
    };
    return reasons[code] || `Unknown (${code})`;
  }
}

// Export for use in edge functions
export { RunwareWebSocketService };
export type { GenerateImageParams, ImageGenerationResult, TestConnectionResult };

// Make available as global for backward compatibility
(globalThis as any).RunwareWebSocketService = RunwareWebSocketService;
