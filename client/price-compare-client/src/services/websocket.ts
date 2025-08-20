interface WebSocketConfig {
  userId: string;
  domain: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig | null = null;

  setConfig(config: WebSocketConfig): void {
    this.config = config;
  }

  connect(config: WebSocketConfig): WebSocket {
    this.config = config;
    
    const wssUri = `wss://${config.domain}/prod?userId=${config.userId}&domain=${config.domain}`;
    this.ws = new WebSocket(wssUri);
    
    console.log('Connecting to WebSocket:', wssUri);

    this.ws.onopen = () => {
      console.log("Connected to WebSocket server");
      if (config.onOpen) {
        config.onOpen();
      }
    };

    this.ws.onmessage = (event) => {
      console.log('WebSocket message received:', event);
      const data = JSON.parse(event.data);
      console.log("Message from server:", data);
      
      if (config.onMessage) {
        config.onMessage(data);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (config.onError) {
        config.onError(error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      if (config.onClose) {
        config.onClose();
      }
    };

    return this.ws;
  }

  disconnect(userId?: string): void {
    if (this.ws) {
      // Optionally notify server explicitly
      if (userId) {
        this.ws.send(JSON.stringify({ type: "disconnect", userId }));
      }
      this.ws.close();
      this.ws = null;
    }
  }

  setupBeforeUnloadHandler(userId: string): () => void {
    const handleBeforeUnload = () => {
      this.disconnect(userId);
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Return cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected. Cannot send data:", data);
    }
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
