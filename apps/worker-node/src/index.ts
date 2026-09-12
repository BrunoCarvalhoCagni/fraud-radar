import http from 'http';
import { config } from './config.js';
import { socketService } from './socketServer.js';
import { kafkaConsumerService } from './kafkaConsumer.js';

const server = http.createServer((req, res) => {
  // Simple health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'fraud-radar-worker',
        timestamp: new Date().toISOString(),
        metrics: socketService.getMetrics(),
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Initialize WebSocket Gateway
socketService.initialize(server);

// Start HTTP/WebSocket server & Kafka Consumer
server.listen(config.port, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Worker & Gateway running at http://localhost:${config.port}`);
  console.log(`📡 WebSocket endpoint ready for frontend clients.`);
  console.log(`====================================================`);

  try {
    await kafkaConsumerService.start();
  } catch (error) {
    console.error('[Fatal] Failed to bootstrap Kafka Consumer:', error);
    process.exit(1);
  }
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n[Shutdown] Received ${signal}. Terminating gracefully...`);
  await kafkaConsumerService.stop();
  server.close(() => {
    console.log('[Shutdown] Server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));