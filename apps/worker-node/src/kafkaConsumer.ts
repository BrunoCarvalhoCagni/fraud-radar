import { Kafka, Consumer } from 'kafkajs';
import { config } from './config.js';
import { RawScoredEvent } from './types.js';
import { rulesEngine } from './rulesEngine.js';
import { socketService } from './socketServer.js';

export class KafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    this.consumer = this.kafka.consumer({ groupId: config.kafka.groupId });
  }

  public async start(): Promise<void> {
    console.log(`[KafkaConsumer] Connecting to brokers at: ${config.kafka.brokers.join(', ')}`);
    await this.consumer.connect();
    console.log('[KafkaConsumer] Connected successfully.');

    await this.consumer.subscribe({
      topic: config.kafka.topic,
      fromBeginning: false,
    });
    console.log(`[KafkaConsumer] Subscribed to topic: "${config.kafka.topic}"`);

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        try {
          const rawPayload = JSON.parse(message.value.toString()) as RawScoredEvent;

          // 1. Evaluate business rules
          const enrichedEvent = rulesEngine.evaluate(rawPayload);

          // 2. Broadcast via WebSocket to Frontend
          socketService.broadcastTransaction(enrichedEvent);

          console.log(
            `[Processed] Tx: ${enrichedEvent.transaction_id} | Amount: $${enrichedEvent.amount} | Decision: ${enrichedEvent.decision} | Risk: ${(enrichedEvent.risk_score * 100).toFixed(1)}%`
          );
        } catch (err) {
          console.error('[KafkaConsumer] Error processing message payload:', err);
        }
      },
    });
  }

  public async stop(): Promise<void> {
    console.log('[KafkaConsumer] Disconnecting consumer...');
    await this.consumer.disconnect();
    console.log('[KafkaConsumer] Disconnected.');
  }
}

export const kafkaConsumerService = new KafkaConsumerService();