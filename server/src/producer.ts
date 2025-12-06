// Node.js Kafka Producer Example
// Install: npm install kafkajs

import { Kafka } from 'kafkajs';
import 'dotenv/config'; // Load environment variables from .env file

// Ensure required environment variables are set
const requiredEnvVars = ['KAFKA_BROKERS', 'KAFKA_USERNAME', 'KAFKA_PASSWORD', 'KAFKA_TOPIC', 'KAFKA_CLIENT_ID'];
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

const producer = kafka.producer();

const sendMessage = async () => {
  try {
    // Connect producer first
    await producer.connect();
    console.log('Producer connected.');

    const message = {
      event: 'test_message',
      data: {
        message: 'Hello from Signal Corps!',
        timestamp: new Date().toISOString()
      }
    };

    const result = await producer.send({
      topic: process.env.KAFKA_TOPIC!,
      messages: [
        {
          value: JSON.stringify(message)
        }
      ]
    });

    console.log('Message sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    await producer.disconnect();
    console.log('Producer disconnected.');
  }
}

sendMessage();