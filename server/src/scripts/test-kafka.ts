import { connectKafka, producer } from '../lib/kafka.js';

const run = async () => {
  // 1. Connect
  await connectKafka();

  // 2. Send a Test Message
  try {
    const topic = process.env.KAFKA_TOPIC;
    if (!topic) throw new Error("No Topic defined");

    console.log(`📤 Sending test message to ${topic}...`);
    
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify({ hello: "world", time: Date.now() }) }],
    });

    console.log("🎉 SUCCESS! Message sent to cluster.");
  } catch (e) {
    console.error("❌ Send Failed:", e);
  }

  // 3. Exit (Ctrl+C to stop manually if it hangs, or process.exit)
  process.exit(0);
};

run();