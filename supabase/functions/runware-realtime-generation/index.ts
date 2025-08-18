import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MultiStageEnhancementPipeline } from "../runware-generate-image/multi-stage-pipeline.js";

// Phase 5: WebSocket Real-Time Generation Service
// Provides instant feedback and batch processing capabilities

interface RealtimeGenerationRequest {
  sessionId: string;
  pageText: string;
  userInfo: any;
  pageNumber: number;
  totalPages: number;
  mode: 'preview' | 'production' | 'batch';
  connectionId?: string;
}

interface WebSocketConnection {
  id: string;
  websocket: WebSocket;
  sessionId: string;
  lastActivity: number;
  requestQueue: string[];
}

class RealtimeGenerationManager {
  private static connections: Map<string, WebSocketConnection> = new Map();
  private static runwareWs: WebSocket | null = null;
  private static runwareReady = false;

  static async initializeRunwareConnection() {
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      throw new Error('RUNWARE_API_KEY not configured');
    }

    try {
      this.runwareWs = new WebSocket("wss://ws-api.runware.ai/v1");
      
      return new Promise<void>((resolve, reject) => {
        if (!this.runwareWs) return reject(new Error('WebSocket creation failed'));

        this.runwareWs.onopen = () => {
          console.log("🔌 Runware WebSocket connected");
          // Authenticate immediately
          this.runwareWs!.send(JSON.stringify([{
            taskType: "authentication",
            apiKey: runwareApiKey
          }]));
        };

        this.runwareWs.onmessage = (event) => {
          const response = JSON.parse(event.data);
          
          if (response.data) {
            response.data.forEach((item: any) => {
              if (item.taskType === "authentication") {
                console.log("✅ Runware authenticated successfully");
                this.runwareReady = true;
                resolve();
              } else if (item.taskType === "imageInference") {
                this.handleImageResult(item);
              }
            });
          }
        };

        this.runwareWs.onerror = (error) => {
          console.error("❌ Runware WebSocket error:", error);
          this.runwareReady = false;
          reject(error);
        };

        this.runwareWs.onclose = () => {
          console.log("🔌 Runware WebSocket disconnected, attempting reconnect...");
          this.runwareReady = false;
          setTimeout(() => this.initializeRunwareConnection(), 2000);
        };
      });
    } catch (error) {
      console.error("Failed to initialize Runware connection:", error);
      throw error;
    }
  }

  static handleImageResult(result: any) {
    console.log(`🎨 Image generated: ${result.imageURL} (seed: ${result.seed})`);
    
    // Broadcast to all connected clients in the same session
    const message = {
      type: 'image_generated',
      data: {
        imageURL: result.imageURL,
        seed: result.seed,
        cost: result.cost,
        taskUUID: result.taskUUID
      }
    };

    this.broadcastToSession(result.sessionId || 'default', message);
  }

  static broadcastToSession(sessionId: string, message: any) {
    for (const [connId, conn] of this.connections) {
      if (conn.sessionId === sessionId && conn.websocket.readyState === WebSocket.OPEN) {
        try {
          conn.websocket.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to send to connection ${connId}:`, error);
          this.connections.delete(connId);
        }
      }
    }
  }

  static addConnection(connId: string, websocket: WebSocket, sessionId: string) {
    this.connections.set(connId, {
      id: connId,
      websocket,
      sessionId,
      lastActivity: Date.now(),
      requestQueue: []
    });
    
    console.log(`🔗 Added connection ${connId} for session ${sessionId}`);
  }

  static removeConnection(connId: string) {
    this.connections.delete(connId);
    console.log(`🔗 Removed connection ${connId}`);
  }

  static async processRealtimeGeneration(request: RealtimeGenerationRequest, connId?: string) {
    if (!this.runwareReady || !this.runwareWs) {
      await this.initializeRunwareConnection();
    }

    try {
      // Use multi-stage pipeline for enhancement
      const pipelineResult = await MultiStageEnhancementPipeline.processThroughPipeline(
        request.pageText,
        request.userInfo,
        request.sessionId,
        request.pageNumber,
        request.totalPages
      );

      const taskUUID = crypto.randomUUID();
      
      // Send generation request to Runware
      const generationRequest = [{
        taskType: "imageInference",
        taskUUID,
        sessionId: request.sessionId, // Track for response routing
        positivePrompt: pipelineResult.finalPrompt,
        model: "runware:100@1",
        width: 1024,
        height: 1024,
        numberResults: 1,
        outputFormat: "WEBP",
        ...pipelineResult.optimizedParameters
      }];

      // Add negative prompt if available
      if (pipelineResult.negativePrompt) {
        generationRequest[0].negativePrompt = pipelineResult.negativePrompt;
      }

      this.runwareWs!.send(JSON.stringify(generationRequest));

      // Send immediate feedback to client
      if (connId) {
        const connection = this.connections.get(connId);
        if (connection && connection.websocket.readyState === WebSocket.OPEN) {
          connection.websocket.send(JSON.stringify({
            type: 'generation_started',
            data: {
              taskUUID,
              enhancementQuality: pipelineResult.qualityScore,
              stagesCompleted: pipelineResult.stagesCompleted,
              processingTime: pipelineResult.processingTime
            }
          }));
        }
      }

      return {
        success: true,
        taskUUID,
        qualityScore: pipelineResult.qualityScore
      };

    } catch (error) {
      console.error("Realtime generation failed:", error);
      throw error;
    }
  }

  static cleanupInactiveConnections() {
    const now = Date.now();
    const maxInactivity = 30 * 60 * 1000; // 30 minutes

    for (const [connId, conn] of this.connections) {
      if (now - conn.lastActivity > maxInactivity) {
        conn.websocket.close();
        this.connections.delete(connId);
        console.log(`🧹 Cleaned up inactive connection ${connId}`);
      }
    }
  }
}

// Initialize cleanup interval
setInterval(() => {
  RealtimeGenerationManager.cleanupInactiveConnections();
}, 5 * 60 * 1000); // Every 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId') || 'default';
    const connectionId = crypto.randomUUID();

    socket.onopen = () => {
      console.log(`🔌 WebSocket connection opened for session ${sessionId}`);
      RealtimeGenerationManager.addConnection(connectionId, socket, sessionId);
      
      // Send welcome message
      socket.send(JSON.stringify({
        type: 'connection_established',
        data: { connectionId, sessionId }
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'generate_image') {
          const request: RealtimeGenerationRequest = {
            sessionId,
            ...message.data,
            mode: message.data.mode || 'preview'
          };
          
          await RealtimeGenerationManager.processRealtimeGeneration(request, connectionId);
        } else if (message.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong' }));
        }
        
        // Update activity timestamp
        const connection = RealtimeGenerationManager.connections.get(connectionId);
        if (connection) {
          connection.lastActivity = Date.now();
        }
      } catch (error) {
        console.error("WebSocket message handling error:", error);
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: error.message }
        }));
      }
    };

    socket.onclose = () => {
      console.log(`🔌 WebSocket connection closed for session ${sessionId}`);
      RealtimeGenerationManager.removeConnection(connectionId);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      RealtimeGenerationManager.removeConnection(connectionId);
    };

    return response;
  }

  // Handle HTTP requests
  try {
    const request: RealtimeGenerationRequest = await req.json();
    const result = await RealtimeGenerationManager.processRealtimeGeneration(request);
    
    return createCorsResponse({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Realtime generation error:', error);
    return createCorsErrorResponse(`Error: ${error.message}`);
  }
});

// Initialize Runware connection on startup
RealtimeGenerationManager.initializeRunwareConnection().catch(console.error);