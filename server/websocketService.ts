import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io";

/**
 * WebSocket Service for Real-Time Updates
 * Handles blockchain events, payment updates, security alerts, and agent status
 */
export class WebSocketService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Subscribe to channels
      socket.on("subscribe:blockchain", () => {
        socket.join("blockchain");
        console.log(`${socket.id} subscribed to blockchain events`);
      });

      socket.on("subscribe:payments", () => {
        socket.join("payments");
        console.log(`${socket.id} subscribed to payment events`);
      });

      socket.on("subscribe:security", () => {
        socket.join("security");
        console.log(`${socket.id} subscribed to security events`);
      });

      socket.on("subscribe:agents", () => {
        socket.join("agents");
        console.log(`${socket.id} subscribed to agent events`);
      });

      socket.on("subscribe:quantum", () => {
        socket.join("quantum");
        console.log(`${socket.id} subscribed to quantum events`);
      });

      socket.on("subscribe:trading", () => {
        socket.join("trading");
        console.log(`${socket.id} subscribed to trading events`);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    console.log("WebSocket server initialized");
  }

  /**
   * Emit blockchain event
   */
  emitBlockchainEvent(event: {
    type: "transaction" | "block" | "balance_update";
    data: any;
  }) {
    if (this.io) {
      this.io.to("blockchain").emit("blockchain:event", event);
    }
  }

  /**
   * Emit payment event
   */
  emitPaymentEvent(event: {
    type: "payment_success" | "payment_failed" | "subscription_updated";
    data: any;
  }) {
    if (this.io) {
      this.io.to("payments").emit("payment:event", event);
    }
  }

  /**
   * Emit security event
   */
  emitSecurityEvent(event: {
    type: "threat_detected" | "threat_resolved" | "scan_complete";
    threatLevel: "none" | "low" | "medium" | "high" | "critical";
    data: any;
  }) {
    if (this.io) {
      this.io.to("security").emit("security:event", event);
    }
  }

  /**
   * Emit agent status update
   */
  emitAgentEvent(event: {
    type: "status_change" | "task_complete" | "error";
    agentId: string;
    data: any;
  }) {
    if (this.io) {
      this.io.to("agents").emit("agent:event", event);
    }
  }

  /**
   * Emit quantum job update
   */
  emitQuantumEvent(event: {
    type: "job_queued" | "job_running" | "job_complete" | "job_failed";
    jobId: string;
    data: any;
  }) {
    if (this.io) {
      this.io.to("quantum").emit("quantum:event", event);
    }
  }

  /**
   * Emit trading bot event
   */
  emitTradingEvent(event: {
    type: "bot_started" | "bot_stopped" | "bot_paused" | "execution_complete" | "pnl_update";
    botId: string;
    data: any;
  }) {
    if (this.io) {
      this.io.to("trading").emit("trading:event", event);
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();
