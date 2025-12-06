// src/routes/chat.routes.ts (FINAL VERSION WITH CLERK CLIENT)
import { Router, Request, Response } from 'express';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import User from '../models/User.js'; // MongoDB User model

// --- FIX: Import clerkClient from the new standard location ---
// This client is automatically configured via environment variables
import { clerkClient } from '@clerk/clerk-sdk-node'; 

const router = Router();

// --- 1. AI & SCHEMA DEFINITION ---
const VibeSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string(),
});

const BAD_QUALITY_THRESHOLD = 3;

// --- 2. DELETION/PENALTY LOGIC ---
async function handlePenalty(userId: string, reason: string) {
  try {
    // 1. Increment the badQualityCount
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { badQualityCount: 1 } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.warn(`Vibe Guard: User not found for ID ${userId}. Skipping penalty.`);
      return { status: 'user_not_found' };
    }

    const currentCount = user.badQualityCount;

    console.log(`❌ Vibe Check Failed! User ${userId} Bad Quality Count: ${currentCount}`);

    // 2. Check the threshold
    if (currentCount >= BAD_QUALITY_THRESHOLD) {
      console.log(`🚨🚨 PERMANENT BAN: Executing account deletion for user ${userId}. Reason: ${reason}`);

      // --- FINAL CLERK DELETION FIX ---
      try {
        // Use the imported clerkClient directly
        await clerkClient.users.deleteUser(userId); 
        console.log(`✅ User successfully deleted from Clerk (ID: ${userId}).`);
      } catch (clerkError) {
        // This is crucial: If the user was already deleted by Clerk's webhook, this may fail, but we proceed with MongoDB deletion.
        console.error("Clerk Deletion Failed (User may still be logged in):", clerkError);
      }
      
      // 3. Delete from MongoDB
      await User.deleteOne({ clerkId: userId });
      
      // Return the specific 'banned' status to trigger frontend logout
      return { status: 'banned' };
    }

    return { status: 'count_incremented', count: currentCount };
  } catch (e) {
    console.error(`Failed to handle penalty for user ${userId}:`, e);
    return { status: 'error' };
  }
}

// --- 3. GOOD QUALITY LOGIC ---
async function handleGoodQuality(userId: string) {
  try {
    await User.findOneAndUpdate({ clerkId: userId }, { badQualityCount: 0 });
    console.log(`✅ Good Vibe. Bad Quality Counter reset for user ${userId}.`);
  } catch (e) {
    console.error(`Failed to reset counter for user ${userId}:`, e);
  }
}

// --- 4. THE MAIN ENDPOINT ---
// POST /api/chat/send
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;

    if (!message || !userId)
      return res.status(400).json({ error: 'Missing message or userId.' });

    // 1. AI Analysis (Synchronous Call)
    const { object: analysis } = await generateObject({
      model: google('gemini-flash-latest'),
      schema: VibeSchema,
      system: `
    You are 'Vibe Guard'. Assign a "Vibe Score" (0-100) based on message content in the context of a professional, high-signal, technical hackathon network.
    
    SCORING RULES:
    0-19: **Immediate Failure**. This score MUST be used for any mention of illegal substances, recreational drugs, harassment, spam, financial scams, self-promotion, selling, or explicit/vulgar content. This includes casual phrases like "I like weed" or "smoking."
    20-79: Medium Signal/Noise. Use for social chat, off-topic discussion, or vague talk.
    80-100: High Signal. Use for technical questions, project details, code, or constructive discussion.
    
    CRITICAL: Score 0 for any reference to drugs, selling, or harassment.
    `,
      prompt: `Message content: "${message}"`,
    });
    const score = analysis.score;
    console.log(`\n🔍 Vibe Check for ${userId}: Score ${score}/100. Reason: ${analysis.reason}`);

    // 2. Conditional DB Logic
    if (score < 30) {
      const penaltyResult = await handlePenalty(userId, analysis.reason);

      if (penaltyResult.status === 'banned') {
        // This response triggers the client-side signOut() in home.tsx
        return res
          .status(200)
          .json({
            status: 'banned',
            message: 'Account deleted due to repeated bad quality messages. Logging out.',
          });
      }
    } else {
      await handleGoodQuality(userId);
    }

    // 3. Final Response (Default Success)
    return res
      .status(200)
      .json({
        status: 'sent',
        message: 'Message sent and verified successfully.',
      });
  } catch (error) {
    console.error('❌ CRITICAL ENDPOINT ERROR:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error during verification.' });
  }
});

export default router;