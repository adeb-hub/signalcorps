import { Router, Request, Response } from 'express';
import User from '../models/User.js'; // Ensure the .js extension matches your project config

const router = Router();

// POST /api/user/status
// We use POST so we can securely pass the userId in the body
router.post('/status', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        // 1. Input Validation
        if (!userId) {
            return res.status(400).json({ error: "userId is required in the body" });
        }

        // 2. Database Lookup
        // We search by 'clerkId' because that is the immutable ID from Clerk
        const user = await User.findOne({ clerkId: userId });

        // 3. Handle "Ghost User" (Exists in Clerk, but hasn't submitted Bio yet)
        if (!user) {
            // This tells the frontend: "Let them in, but show the Onboarding Form"
            return res.status(200).json({ 
                isVerified: false, 
                exists: false 
            });
        }

        // 4. Handle Existing User
        return res.status(200).json({ 
            isVerified: user.isVerified, 
            exists: true,
            // Optional: You can send back the bio or skills if you need them on the dashboard
            bio: user.bio 
        });

    } catch (error) {
        console.error("Status Check Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;