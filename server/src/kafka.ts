import { Kafka, Producer, Consumer } from 'kafkajs';
import 'dotenv/config';

// Ensure required environment variables are set for Kafka
const requiredEnvVars = [
  'KAFKA_CLIENT_ID',
  'KAFKA_BROKERS',
  'KAFKA_USERNAME',
  'KAFKA_PASSWORD',
  'KAFKA_GROUP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required Kafka environment variable: ${envVar}`);
  }
}

// Centralized Kafka configuration
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID!,
  brokers: process.env.KAFKA_BROKERS!.split(','),
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!
  }
});

// Create and export a single producer and consumer instance
export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID! });

// Export connection and disconnection functions for lifecycle management
export const connectKafka = async () => {
  await producer.connect();
  console.log('Kafka Producer connected.');
  await consumer.connect();
  console.log('Kafka Consumer connected.');
};

export const disconnectKafka = async () => {
  await producer.disconnect();
  console.log('Kafka Producer disconnected.');
  await consumer.disconnect();
  console.log('Kafka Consumer disconnected.');
};