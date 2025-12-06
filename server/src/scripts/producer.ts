// Node.js Kafka Producer Example
// Install: npm install kafkajs
import { Kafka } from "kafkajs";

// Kafka Configuration
const kafka = new Kafka({
  clientId: 'team-client-3e51baf395e244f88610216b73f8f882',
  brokers: 'pkc-619z3.us-east1.gcp.confluent.cloud:9092'.split(','),
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: 'd301e79d-4082-43f8-b9f9-08cf2e1bd8e9',
    password: 'cfltTIivf3OHq6tr9fpASLxV4pp7vzPfvnz3cwT8+NAoOAJUCZwRuxuk1sSZTK+w'
  }
});

const producer = kafka.producer();

async function sendMessage() {
  await producer.connect();
  
  const message = {
    event: 'test_message',
    data: {
      message: 'Hello from Signal Corps!',
      timestamp: new Date().toISOString()
    }
  };

  try {
    const result = await producer.send({
      topic: 'team.team.3e51baf395e244f88610216b73f8f882',
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
  }
}

sendMessage();