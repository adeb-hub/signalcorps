// src/lib/kafka.ts
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import 'dotenv/config';

// Helper to clean environment variables (for Windows/copy-paste)
const cleanEnv = (val: string | undefined) => (val || '').replace(/[\r\n"']/g, '').trim();

// Get clean credentials
const BROKERS = cleanEnv(process.env.KAFKA_BROKERS);
const USERNAME = cleanEnv(process.env.KAFKA_USERNAME);
const PASSWORD = cleanEnv(process.env.KAFKA_PASSWORD);
const CLIENT_ID = cleanEnv(process.env.KAFKA_CLIENT_ID);
const GROUP_ID = cleanEnv(process.env.KAFKA_GROUP_ID);

// 1. Validation (Same as before)
const missingVars = ['KAFKA_BROKERS', 'KAFKA_USERNAME', 'KAFKA_PASSWORD'].filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`❌ CRITICAL ERROR: Missing Kafka env vars: ${missingVars.join(', ')}`);
}

// 2. Initialize Kafka Client
const kafka = new Kafka({
  clientId: CLIENT_ID || 'signal-corps-fallback',
  brokers: BROKERS.split(','),
  ssl: true, 
  sasl: {
    // FIX: Swapping PLAIN to SCRAM-SHA-256
    mechanism: 'scram-sha-256', 
    username: USERNAME,
    password: PASSWORD,
  },
  logLevel: logLevel.ERROR, 
  connectionTimeout: 10000,
  authenticationTimeout: 10000,
});

// 3. Export Singletons
export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID || 'vibe-check-group' });

// 4. Connection Helper
export const connectKafka = async () => {
  try {
    console.log("🔌 Connecting to Kafka Cluster...");
    await producer.connect();
    await consumer.connect();
    console.log("✅ Kafka Producer/Consumer Connected (Using SCRAM)");
  } catch (error) {
    console.error("❌ Kafka Connection Failed:", (error as Error).message);
  }
};