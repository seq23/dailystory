import { toast } from "sonner";
import { SecureWebSocket } from "@/utils/websocketSecurity";
import { SecurityMonitor, PerformanceMonitor } from "@/utils/monitoring";

const API_ENDPOINT = "wss://ws-api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds";
  seed?: number | null;
  lora?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

export class SecureRunwareService {
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private isAuthenticated: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private messageQueue: Array<{ timestamp: number; size: number }> = [];
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 2000;
  private readonly maxMessageSize = 1024 * 1024; // 1MB
  private readonly messageRateLimit = 10;
  private readonly messageRateWindow = 1000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.connectionPromise = this.initializeConnection();
    
    // Log API service initialization
    SecurityMonitor.logEvent('security', 'api_service_init', {
      service: 'runware',
      timestamp: Date.now()
    }, 'low');
  }

  private async initializeConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(API_ENDPOINT);
        
        this.ws.onopen = () => {
          PerformanceMonitor.endTiming('websocket_connection');
          SecurityMonitor.logEvent('security', 'websocket_connected', {
            endpoint: API_ENDPOINT,
            timestamp: Date.now()
          }, 'low');
          
          this.authenticate().then(resolve).catch(reject);
        };

        this.ws.onmessage = (event) => {
          this.handleSecureMessage(event.data);
        };

        this.ws.onerror = (error) => {
          SecurityMonitor.logEvent('error', 'websocket_error', {
            error: error.toString(),
            timestamp: Date.now()
          }, 'medium');
          reject(error);
        };

        this.ws.onclose = () => {
          SecurityMonitor.logEvent('security', 'websocket_disconnected', {
            timestamp: Date.now()
          }, 'low');
          this.isAuthenticated = false;
          this.handleReconnect();
        };

        PerformanceMonitor.startTiming('websocket_connection');
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connectionPromise = this.initializeConnection();
      }, this.reconnectInterval);
    }
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    // Clean old messages
    this.messageQueue = this.messageQueue.filter(
      msg => now - msg.timestamp < this.messageRateWindow
    );
    
    return this.messageQueue.length < this.messageRateLimit;
  }

  private isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private async authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error("WebSocket not ready for authentication"));
        return;
      }
      
      SecurityMonitor.logEvent('security', 'api_authentication_attempt', {
        service: 'runware',
        timestamp: Date.now()
      }, 'medium');

      const authMessage = [{
        taskType: "authentication",
        apiKey: this.apiKey,
        ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
      }];
      
      // Set up authentication timeout
      const authTimeout = setTimeout(() => {
        SecurityMonitor.logEvent('security', 'api_authentication_timeout', {
          service: 'runware',
          timestamp: Date.now()
        }, 'high');
        reject(new Error("Authentication timeout"));
      }, 10000);

      const authCallback = (data: any) => {
        if (data.taskType === "authentication") {
          clearTimeout(authTimeout);
          this.connectionSessionUUID = data.connectionSessionUUID;
          this.isAuthenticated = true;
          
          SecurityMonitor.logEvent('security', 'api_authentication_success', {
            service: 'runware',
            sessionUUID: data.connectionSessionUUID,
            timestamp: Date.now()
          }, 'low');
          
          resolve();
        }
      };

      this.messageCallbacks.set('auth', authCallback);
      this.sendMessage(authMessage);
    });
  }

  private sendMessage(data: any): boolean {
    if (!this.checkRateLimit()) {
      SecurityMonitor.logEvent('security', 'rate_limit_exceeded', {
        service: 'runware',
        timestamp: Date.now()
      }, 'medium');
      return false;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message = JSON.stringify(data);
    const messageSize = new Blob([message]).size;

    if (messageSize > this.maxMessageSize) {
      SecurityMonitor.logEvent('security', 'message_size_exceeded', {
        size: messageSize,
        maxSize: this.maxMessageSize
      }, 'medium');
      return false;
    }

    this.messageQueue.push({ timestamp: Date.now(), size: messageSize });
    this.ws.send(message);
    return true;
  }

  private handleSecureMessage(data: any): void {
    try {
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (response.error || response.errors) {
        SecurityMonitor.logEvent('error', 'api_response_error', {
          error: response.errorMessage || response.errors?.[0]?.message,
          timestamp: Date.now()
        }, 'medium');
        
        const errorMessage = response.errorMessage || response.errors?.[0]?.message || "An error occurred";
        toast.error(errorMessage);
        return;
      }

      if (response.data) {
        response.data.forEach((item: any) => {
          const callback = this.messageCallbacks.get(item.taskUUID || 'auth');
          if (callback) {
            callback(item);
            if (item.taskUUID) {
              this.messageCallbacks.delete(item.taskUUID);
            }
          }
        });
      }
    } catch (error) {
      SecurityMonitor.logEvent('error', 'message_parsing_error', {
        error: error.toString(),
        timestamp: Date.now()
      }, 'medium');
    }
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    // Wait for connection and authentication
    await this.connectionPromise;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      SecurityMonitor.logEvent('security', 'api_call_unauthorized', {
        operation: 'generateImage',
        timestamp: Date.now()
      }, 'high');
      throw new Error("Service not authenticated");
    }

    SecurityMonitor.logEvent('security', 'api_image_generation_request', {
      promptLength: params.positivePrompt.length,
      model: params.model || 'runware:100@1',
      timestamp: Date.now()
    }, 'low');

    const taskUUID = crypto.randomUUID();
    
    return PerformanceMonitor.measureAsync('image_generation', async () => {
      return new Promise((resolve, reject) => {
        const message = [{
          taskType: "imageInference",
          taskUUID,
          model: params.model || "runware:100@1",
          width: 768,
          height: 1024,
          numberResults: params.numberResults || 1,
          outputFormat: params.outputFormat || "WEBP",
          steps: 4,
          CFGScale: params.CFGScale || 1,
          scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
          strength: params.strength || 0.8,
          lora: params.lora || [],
          ...params,
        }];

        if (!params.seed) {
          delete message[0].seed;
        }

        if (message[0].model === "runware:100@1") {
          delete message[0].promptWeighting;
        }

        this.messageCallbacks.set(taskUUID, (data) => {
          if (data.error) {
            SecurityMonitor.logEvent('error', 'image_generation_error', {
              error: data.errorMessage,
              taskUUID,
              timestamp: Date.now()
            }, 'medium');
            reject(new Error(data.errorMessage));
          } else {
            SecurityMonitor.logEvent('security', 'image_generation_success', {
              taskUUID,
              imageUUID: data.imageUUID,
              NSFWContent: data.NSFWContent,
              cost: data.cost,
              timestamp: Date.now()
            }, 'low');
            resolve(data);
          }
        });

        // Set request timeout
        setTimeout(() => {
          if (this.messageCallbacks.has(taskUUID)) {
            this.messageCallbacks.delete(taskUUID);
            SecurityMonitor.logEvent('error', 'image_generation_timeout', {
              taskUUID,
              timestamp: Date.now()
            }, 'medium');
            reject(new Error("Image generation timeout"));
          }
        }, 60000); // 60 second timeout

        this.sendMessage(message);
      });
    });
  }

  // Enhanced cleanup
  close(): void {
    SecurityMonitor.logEvent('security', 'api_service_shutdown', {
      service: 'runware',
      timestamp: Date.now()
    }, 'low');
    
    this.messageCallbacks.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Cache for generated images with security logging
export const secureImageCache = new Map<string, string>();

// Enhanced cache operations with monitoring
export const cacheImage = (key: string, url: string): void => {
  secureImageCache.set(key, url);
  SecurityMonitor.logEvent('user', 'image_cached', {
    cacheSize: secureImageCache.size,
    timestamp: Date.now()
  }, 'low');
};

export const getCachedImage = (key: string): string | undefined => {
  const result = secureImageCache.get(key);
  if (result) {
    SecurityMonitor.logEvent('user', 'image_cache_hit', {
      key,
      timestamp: Date.now()
    }, 'low');
  }
  return result;
};