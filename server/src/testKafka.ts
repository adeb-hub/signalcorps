import 'dotenv/config';
import { Kafka } from 'kafkajs';

// Kafka Configuration
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'team-client-3e51baf395e244f88610216b73f8f882',
  brokers: (process.env.KAFKA_BROKERS || 'pkc-619z3.us-east1.gcp.confluent.cloud:9092').split(','),
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME || 'd301e79d-4082-43f8-b9f9-08cf2e1bd8e9',
    password: process.env.KAFKA_PASSWORD || 'cfltTIivf3OHq6tr9fpASLxV4pp7vzPfvnz3cwT8+NAoOAJUCZwRuxuk1sSZTK+w'
  }
});

async function testConnection() {
  console.log('\n===== Testing Kafka Connection =====\n');

  console.log('Configuration:');
  console.log('  Client ID:', process.env.KAFKA_CLIENT_ID);
  console.log('  Brokers:', process.env.KAFKA_BROKERS);
  console.log('  Username:', process.env.KAFKA_USERNAME);
  console.log('  Topic:', process.env.KAFKA_TOPIC);
  console.log('  Group ID:', process.env.KAFKA_GROUP_ID);
  console.log('\n');

  const producer = kafka.producer();
  const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || 'team-cg-3e51baf395e244f88610216b73f8f882'
  });

  try {
    // Test Producer Connection
    console.log('Connecting to Kafka Producer...');
    await producer.connect();
    console.log('✓ Producer connected successfully!\n');

    // Send a test message
    const topic = process.env.KAFKA_TOPIC || 'team.team.3e51baf395e244f88610216b73f8f882';
    const message = {
      event: 'test_connection',
      data: {
        message: 'Hello from test MMMMMM!',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sending test message...');
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
    console.log('✓ Message sent successfully!\n');

    // Test Consumer Connection
    console.log('Connecting to Kafka Consumer...');
    await consumer.connect();
    console.log('✓ Consumer connected successfully!\n');

    await consumer.subscribe({ topic, fromBeginning: false });
    console.log(`✓ Subscribed to topic: ${topic}\n`);

    console.log('Listening for messages (for 10 seconds)...\n');

    let messageCount = 0;
    const timeout = setTimeout(async () => {
      console.log(`\n\nReceived ${messageCount} message(s) in total.`);
      console.log('\n===== Test Complete =====\n');
      await consumer.disconnect();
      await producer.disconnect();
      process.exit(0);
    }, 10000);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        messageCount++;
        console.log('📨 Message received:');
        console.log('  Topic:', topic);
        console.log('  Partition:', partition);
        console.log('  Value:', message.value?.toString());
        console.log('');
      }
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nPossible issues:');
    console.error('  1. Check if your Kafka credentials are correct');
    console.error('  2. Make sure the broker URL is accessible');
    console.error('  3. Verify your .env file has all required variables');
    console.error('  4. Contact hackathon organizers for updated credentials\n');

    await producer.disconnect().catch(() => {});
    await consumer.disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();
