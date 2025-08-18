// WebSocket-based Runware service for real-time image generation
export interface RunwareGenerationParams {
  positivePrompt: string;
  negativePrompt?: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  seed?: number;
  steps?: number;
}

export interface RunwareResult {
  success: boolean;
  imageURL?: string;
  imageUUID?: string;
  NSFWContent?: boolean;
  cost?: number;
  seed?: number;
  error?: string;
}

export class RunwareService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private isAuthenticated: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket("wss://ws-api.runware.ai/v1");
        
        this.ws.onopen = () => {
          console.log("🔌 RunwareService WebSocket connected");
          this.authenticate().then(resolve).catch(reject);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          console.error("❌ RunwareService WebSocket error:", error);
          this.isAuthenticated = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("🔌 RunwareService WebSocket closed");
          this.isAuthenticated = false;
          this.connectionPromise = null;
          
          // Auto-reconnect after 1 second
          setTimeout(() => {
            if (!this.connectionPromise) {
              this.connect();
            }
          }, 1000);
        };

      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private async authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not ready for authentication"));
        return;
      }
      
      const authMessage = [{
        taskType: "authentication",
        apiKey: this.apiKey,
        ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
      }];
      
      console.log("🔑 Authenticating with Runware...");
      
      const authTimeout = setTimeout(() => {
        reject(new Error("Authentication timeout"));
      }, 10000);

      const authHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          if (response.data?.[0]?.taskType === "authentication") {
            clearTimeout(authTimeout);
            this.ws?.removeEventListener("message", authHandler);
            this.connectionSessionUUID = response.data[0].connectionSessionUUID;
            this.isAuthenticated = true;
            console.log("✅ RunwareService authenticated");
            resolve();
          }
        } catch (error) {
          clearTimeout(authTimeout);
          reject(error);
        }
      };
      
      this.ws.addEventListener("message", authHandler);
      this.ws.send(JSON.stringify(authMessage));
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const response = JSON.parse(event.data);
      
      if (response.data) {
        response.data.forEach((item: any) => {
          if (item.taskType === "authentication") {
            this.connectionSessionUUID = item.connectionSessionUUID;
            this.isAuthenticated = true;
          } else if (item.taskUUID) {
            const callback = this.messageCallbacks.get(item.taskUUID);
            if (callback) {
              callback(item);
              this.messageCallbacks.delete(item.taskUUID);
            }
          }
        });
      }
    } catch (error) {
      console.error("❌ Failed to parse RunwareService message:", error);
    }
  }

  async generateImage(params: RunwareGenerationParams): Promise<RunwareResult> {
    // Ensure connection
    if (!this.isAuthenticated) {
      await this.connect();
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      throw new Error("RunwareService not connected or authenticated");
    }

    const taskUUID = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(taskUUID);
        reject(new Error("Generation timeout"));
      }, 30000);

      this.messageCallbacks.set(taskUUID, (data) => {
        clearTimeout(timeout);
        
        if (data.taskType === "imageInference") {
          resolve({
            success: true,
            imageURL: data.imageURL,
            imageUUID: data.imageUUID,
            NSFWContent: data.NSFWContent,
            cost: data.cost,
            seed: data.seed
          });
        } else {
          reject(new Error(data.error || "Generation failed"));
        }
      });

      const message = [{
        taskType: "imageInference",
        taskUUID,
        positivePrompt: params.positivePrompt,
        negativePrompt: params.negativePrompt || "",
        model: params.model || "runware:100@1",
        width: params.width || 1024,
        height: params.height || 1024,
        numberResults: params.numberResults || 1,
        outputFormat: params.outputFormat || "WEBP",
        CFGScale: params.CFGScale || 3,
        scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: params.strength || 0.8,
        steps: params.steps || 8,
        ...(params.seed && { seed: params.seed })
      }];

      console.log("🎨 Sending generation request to Runware");
      this.ws!.send(JSON.stringify(message));
    });
  }

  async generateBatch(params: RunwareGenerationParams, count: number): Promise<RunwareResult[]> {
    const results: RunwareResult[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Use different seed for each generation
        const batchParams = { ...params, seed: undefined };
        const result = await this.generateImage(batchParams);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticated = false;
    this.connectionPromise = null;
    this.messageCallbacks.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated;
  }
}