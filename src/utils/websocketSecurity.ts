// WebSocket Security Enhancements

interface SecureWebSocketOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  messageRateLimit?: number;
  messageRateWindow?: number;
  allowedOrigins?: string[];
  maxMessageSize?: number;
}

export class SecureWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageQueue: Array<{ timestamp: number; size: number }> = [];
  private options: Required<SecureWebSocketOptions>;

  constructor(url: string, options: SecureWebSocketOptions = {}) {
    this.options = {
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      reconnectInterval: options.reconnectInterval ?? 3000,
      messageRateLimit: options.messageRateLimit ?? 10,
      messageRateWindow: options.messageRateWindow ?? 60000,
      allowedOrigins: options.allowedOrigins ?? [window.location.origin],
      maxMessageSize: options.maxMessageSize ?? 1024 * 1024 // 1MB
    };

    this.connect(url);
  }

  private connect(url: string) {
    try {
      // Validate URL
      const wsUrl = new URL(url);
      if (!['ws:', 'wss:'].includes(wsUrl.protocol)) {
        throw new Error('Invalid WebSocket protocol');
      }

      // Prefer secure WebSocket in production
      if (window.location.protocol === 'https:' && wsUrl.protocol === 'ws:') {
        wsUrl.protocol = 'wss:';
      }

      this.ws = new WebSocket(wsUrl.toString());
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Secure WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        // Validate message size
        if (event.data.length > this.options.maxMessageSize) {
          console.warn('Message exceeds maximum size limit');
          return;
        }

        // Rate limiting
        if (!this.checkRateLimit(event.data.length)) {
          console.warn('Message rate limit exceeded');
          return;
        }

        // Parse and validate JSON
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Invalid message received:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.handleReconnect();
    };
  }

  private checkRateLimit(messageSize: number): boolean {
    const now = Date.now();
    
    // Clean old messages outside the window
    this.messageQueue = this.messageQueue.filter(
      msg => now - msg.timestamp < this.options.messageRateWindow
    );

    // Check if we're under the rate limit
    if (this.messageQueue.length >= this.options.messageRateLimit) {
      return false;
    }

    // Add current message to queue
    this.messageQueue.push({ timestamp: now, size: messageSize });
    return true;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.ws?.url) {
          this.connect(this.ws.url);
        }
      }, this.options.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(data: any) {
    // Override this method to handle incoming messages
    console.log('Received message:', data);
  }

  public send(data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return false;
    }

    try {
      const message = JSON.stringify(data);
      
      // Check message size
      if (message.length > this.options.maxMessageSize) {
        console.error('Message too large to send');
        return false;
      }

      // Rate limiting check
      if (!this.checkRateLimit(message.length)) {
        console.warn('Send rate limit exceeded');
        return false;
      }

      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  public close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}