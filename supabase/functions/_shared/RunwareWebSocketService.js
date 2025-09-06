// Unified Runware WebSocket Service
// Single source of truth for all Runware WebSocket operations across edge functions

class RunwareWebSocketService {
  static async generateImage({
    apiKey,
    positivePrompt,
    negativePrompt = '',
    parameters = {},
    timeout = 30000
  }) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://ws-api.runware.ai/v1');
      let authCompleted = false;
      let resolved = false;
      
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          reject(new Error('WebSocket timeout'));
        }
      }, timeout);

      ws.onopen = () => {
        console.log('📡 WebSocket connected to Runware');
        
        // Send authentication
        const authMessage = JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]);
        ws.send(authMessage);
      };

      ws.onmessage = (event) => {
        if (resolved) return;
        
        console.log('📩 WebSocket message:', event.data);
        const response = JSON.parse(event.data);
        
        // Handle errors
        if (response.error || response.errors) {
          console.error('❌ Runware error:', response);
          resolved = true;
          clearTimeout(timeoutId);
          ws.close();
          const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Generation failed';
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
              ws.close();
              
              resolve({
                success: true,
                imageURL: item.imageURL,
                seed: item.seed,
                cost: item.cost,
                NSFWContent: item.NSFWContent || false
              });
            }
          }
        }
      };

      ws.onerror = (error) => {
        if (!resolved) {
          resolved = true;
          console.error('❌ WebSocket error:', error);
          clearTimeout(timeoutId);
          reject(error);
        }
      };

      ws.onclose = () => {
        if (!resolved) {
          resolved = true;
          console.log('🔌 WebSocket closed unexpectedly');
          clearTimeout(timeoutId);
          reject(new Error('WebSocket closed unexpectedly'));
        }
      };
    });
  }

  // Helper for diagnostic operations
  static async testConnection(apiKey, timeout = 15000) {
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

      ws.onmessage = (event) => {
        if (resolved) return;
        
        const response = JSON.parse(event.data);
        
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

      ws.onerror = (error) => {
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
}

// Export for use in edge functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RunwareWebSocketService };
}

// Make available as global
globalThis.RunwareWebSocketService = RunwareWebSocketService;