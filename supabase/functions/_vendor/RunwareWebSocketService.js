/**
 * Runware WebSocket Service - Vendor Bundle
 * 
 * This is a local fallback copy of RunwareWebSocketService for maximum availability.
 * Identical to _shared/RunwareWebSocketService.js but serves as a vendor bundle.
 * 
 * Usage: Import this when _shared version fails to load
 * Pattern: Two-tier fallback (shared → vendor)
 */

const RUNWARE_WS_ENDPOINT = "wss://ws-api.runware.ai/v1";

/**
 * Runware WebSocket Service for real-time image generation
 */
export class RunwareWebSocketService {
  /**
   * Generate an image using the Runware WebSocket API
   */
  static async generateImage(params) {
    const {
      apiKey,
      positivePrompt,
      negativePrompt = "",
      width = 1024,
      height = 1024,
      model = "runware:100@1",
      numberResults = 1,
      outputFormat = "WEBP",
      seed = null,
      lora = [],
      timeout = 60000,
      signal = null,
    } = params;

    if (!apiKey) {
      throw new Error("Runware API key is required");
    }

    if (!positivePrompt) {
      throw new Error("Positive prompt is required");
    }

    return new Promise((resolve, reject) => {
      let ws = null;
      let timeoutId = null;
      let isResolved = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close(1000, "Normal closure");
        }
        if (signal) {
          signal.removeEventListener("abort", abortHandler);
        }
      };

      const resolveOnce = (result) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(result);
        }
      };

      const rejectOnce = (error) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      };

      const abortHandler = () => {
        rejectOnce(new Error("Request aborted by caller"));
      };

      if (signal) {
        if (signal.aborted) {
          return rejectOnce(new Error("Request already aborted"));
        }
        signal.addEventListener("abort", abortHandler);
      }

      timeoutId = setTimeout(() => {
        const error = new Error(
          `Runware WebSocket timeout after ${timeout}ms`
        );
        error.code = "TIMEOUT";
        rejectOnce(error);
      }, timeout);

      try {
        ws = new WebSocket(RUNWARE_WS_ENDPOINT);

        ws.onopen = () => {
          console.log("✅ Runware WebSocket connected");

          const taskUUID = crypto.randomUUID();
          const authMessage = {
            taskType: "authentication",
            apiKey: apiKey,
          };
          const imageMessage = {
            taskType: "imageInference",
            taskUUID: taskUUID,
            positivePrompt: positivePrompt,
            negativePrompt: negativePrompt,
            width: width,
            height: height,
            model: model,
            numberResults: numberResults,
            outputFormat: outputFormat,
            CFGScale: 1,
            scheduler: "FlowMatchEulerDiscreteScheduler",
            steps: 4,
            lora: lora,
          };

          if (seed !== null && seed !== undefined) {
            imageMessage.seed = seed;
          }

          ws.send(JSON.stringify([authMessage, imageMessage]));
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            if (response.error || response.errors) {
              const errorMessage =
                response.errorMessage ||
                response.errors?.[0]?.message ||
                "Unknown Runware error";
              const error = new Error(errorMessage);
              error.code = "RUNWARE_API_ERROR";
              error.details = response;
              return rejectOnce(error);
            }

            if (response.data) {
              for (const item of response.data) {
                if (item.taskType === "authentication") {
                  console.log(
                    "✅ Runware authentication successful:",
                    item.connectionSessionUUID
                  );
                } else if (item.taskType === "imageInference") {
                  console.log(
                    "✅ Runware image generated:",
                    item.imageURL
                  );
                  return resolveOnce({
                    success: true,
                    imageURL: item.imageURL,
                    imageUUID: item.imageUUID,
                    seed: item.seed,
                    NSFWContent: item.NSFWContent || false,
                    cost: item.cost,
                  });
                }
              }
            }
          } catch (parseError) {
            const error = new Error(
              `Failed to parse Runware response: ${parseError.message}`
            );
            error.code = "PARSE_ERROR";
            rejectOnce(error);
          }
        };

        ws.onerror = (error) => {
          console.error("❌ Runware WebSocket error:", error);
          const wsError = new Error(
            `WebSocket error: ${RunwareWebSocketService.classifyWebSocketError(error)}`
          );
          wsError.code = "WEBSOCKET_ERROR";
          rejectOnce(wsError);
        };

        ws.onclose = (event) => {
          if (!isResolved) {
            const reason = RunwareWebSocketService.getCloseReason(event.code);
            const error = new Error(
              `WebSocket closed unexpectedly: ${reason} (code ${event.code})`
            );
            error.code = "WEBSOCKET_CLOSED";
            rejectOnce(error);
          }
        };
      } catch (error) {
        const wsError = new Error(`Failed to create WebSocket: ${error.message}`);
        wsError.code = "WEBSOCKET_CREATION_ERROR";
        rejectOnce(wsError);
      }
    });
  }

  /**
   * Test Runware WebSocket connection
   */
  static async testConnection(apiKey, timeout = 10000) {
    if (!apiKey) {
      return {
        success: false,
        error: "API key is required",
      };
    }

    return new Promise((resolve) => {
      let ws = null;
      const timeoutId = setTimeout(() => {
        if (ws) ws.close();
        resolve({
          success: false,
          error: "Connection timeout",
        });
      }, timeout);

      try {
        ws = new WebSocket(RUNWARE_WS_ENDPOINT);

        ws.onopen = () => {
          const authMessage = {
            taskType: "authentication",
            apiKey: apiKey,
          };
          ws.send(JSON.stringify([authMessage]));
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            if (response.error || response.errors) {
              clearTimeout(timeoutId);
              ws.close();
              resolve({
                success: false,
                error:
                  response.errorMessage ||
                  response.errors?.[0]?.message ||
                  "Authentication failed",
              });
              return;
            }

            if (
              response.data?.[0]?.taskType === "authentication"
            ) {
              clearTimeout(timeoutId);
              ws.close();
              resolve({
                success: true,
                sessionUUID: response.data[0].connectionSessionUUID,
              });
            }
          } catch (parseError) {
            clearTimeout(timeoutId);
            ws.close();
            resolve({
              success: false,
              error: `Parse error: ${parseError.message}`,
            });
          }
        };

        ws.onerror = (error) => {
          clearTimeout(timeoutId);
          resolve({
            success: false,
            error: RunwareWebSocketService.classifyWebSocketError(error),
          });
        };

        ws.onclose = (event) => {
          clearTimeout(timeoutId);
          if (event.code !== 1000) {
            resolve({
              success: false,
              error: `Connection closed: ${RunwareWebSocketService.getCloseReason(event.code)}`,
            });
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: `Connection failed: ${error.message}`,
        });
      }
    });
  }

  /**
   * Classify WebSocket error
   */
  static classifyWebSocketError(error) {
    const message = error?.message || String(error);
    if (message.includes("certificate")) return "SSL/TLS certificate error";
    if (message.includes("timeout")) return "Connection timeout";
    if (message.includes("ECONNREFUSED")) return "Connection refused";
    if (message.includes("ENOTFOUND")) return "DNS resolution failed";
    if (message.includes("network")) return "Network error";
    return message || "Unknown WebSocket error";
  }

  /**
   * Get WebSocket close reason
   */
  static getCloseReason(code) {
    const reasons = {
      1000: "Normal closure",
      1001: "Going away",
      1002: "Protocol error",
      1003: "Unsupported data",
      1005: "No status received",
      1006: "Abnormal closure",
      1007: "Invalid frame payload data",
      1008: "Policy violation",
      1009: "Message too big",
      1010: "Missing extension",
      1011: "Internal server error",
      1015: "TLS handshake failure",
    };
    return reasons[code] || `Unknown close code: ${code}`;
  }
}

// Make available globally for backward compatibility
globalThis.RunwareWebSocketService = RunwareWebSocketService;
