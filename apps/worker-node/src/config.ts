import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'fraud-radar-worker',
    groupId: process.env.KAFKA_GROUP_ID || 'fraud-radar-decision-group',
    topic: process.env.KAFKA_TOPIC_TRANSACTIONS || 'transactions.scored',
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};