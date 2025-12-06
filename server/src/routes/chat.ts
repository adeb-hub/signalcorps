import { Router, Request, Response } from 'express';
import { producer } from '../lib/kafka.js';

const router = Router();

// POST /api/chat/send
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { userId, message, recipientId } = req.body;

    // 1. Define the Payload
    // We use a custom event_type so we don't confuse it with real iMessages
    const payload = {
      event_type: 'signal_corps.chat', 
      data: {
        id: `msg-${Date.now()}`,
        text: message,
        sender_id: userId,
        recipient_id: recipientId,
        timestamp: new Date().toISOString()
      }
    };

    // 2. Send to Kafka
    await producer.send({
      topic: process.env.KAFKA_TOPIC as string,
      messages: [
        { value: JSON.stringify(payload) }
      ],
    });

    console.log(`🚀 Sent to Kafka: "${message}"`);
    
    return res.json({ status: 'sent', messageId: payload.data.id });

  } catch (error) {
    console.error("Producer Error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;