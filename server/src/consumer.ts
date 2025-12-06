// Node.js Kafka Consumer Example
// Install: npm install kafkajs

import { Kafka } from 'kafkajs';
import 'dotenv/config'; // Load environment variables from .env file

// Ensure required environment variables are set
const requiredEnvVars = ['KAFKA_BROKERS', 'KAFKA_USERNAME', 'KAFKA_PASSWORD', 'KAFKA_TOPIC', 'KAFKA_GROUP_ID', 'KAFKA_CLIENT_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Kafka Configuration
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

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID!
});

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: process.env.KAFKA_TOPIC!,
      fromBeginning: true
    });

    console.log(`Listening to topic: ${process.env.KAFKA_TOPIC}`);
    console.log('Waiting for messages... (Press Ctrl+C to stop)');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('\nReceived message:');
        console.log('Topic:', topic);
        console.log('Partition:', partition);
        console.log('Offset:', message.offset);
        // Assuming the message value is a JSON string, let's parse it.
        try {
          const jsonValue = JSON.parse(message.value!.toString());
          console.log('Value (JSON):', jsonValue);
        } catch (e) {
          console.log('Value (Raw):', message.value!.toString());
        }
      }
    });
  } catch (error) {
    console.error('Error in consumer run:', error);
  }
};

run().catch(console.error);

// Graceful shutdown
const shutdown = async () => {
  console.log('\nDisconnecting consumer...');
  await consumer.disconnect();
  console.log('Consumer disconnected.');
};

process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});