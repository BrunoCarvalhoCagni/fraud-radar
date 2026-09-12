import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config.js';
import { EnrichedTransactionEvent, SystemMetrics } from './types.js';

export class SocketServerService {
  private io: SocketIOServer | null = null;
  private metrics: SystemMetrics = {
    totalProcessed: 0,
    totalApproved: 0,
    totalReviewed: 0,
    totalBlocked: 0,
    totalBlockedAmount: 0,
    fraudRatePercentage: 0,
  };

  public initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [config.clientOrigin, '*'],
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Send immediate initial metrics state on connection
      socket.emit('metrics_update', this.metrics);

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });

    console.log('[WebSocket] Socket.io server initialized and ready.');
  }

  public broadcastTransaction(event: EnrichedTransactionEvent): void {
    if (!this.io) return;

    // Update real-time metrics
    this.metrics.totalProcessed += 1;
    if (event.decision === 'BLOCKED') {
      this.metrics.totalBlocked += 1;
      this.metrics.totalBlockedAmount += event.amount;
    } else if (event.decision === 'MANUAL_REVIEW') {
      this.metrics.totalReviewed += 1;
    } else {
      this.metrics.totalApproved += 1;
    }

    this.metrics.fraudRatePercentage = Number(
      ((this.metrics.totalBlocked / this.metrics.totalProcessed) * 100).toFixed(2)
    );

    // Broadcast event to connected frontend clients
    this.io.emit('transaction_event', event);
    this.io.emit('metrics_update', this.metrics);
  }

  public getMetrics(): SystemMetrics {
    return this.metrics;
  }
}

export const socketService = new SocketServerService();