import { Router, Request, Response } from 'express';
import User from '../models/User.js'; 

const router = Router();

// --- NEW ROUTE: Get All Verified Users ---
// This feeds the Network Graph on the Home Page
router.get('/list', async (req: Request, res: Response) => {
    try {
        // 1. Fetch only VERIFIED users
        // We limit to 50 so the graph doesn't lag during the demo
        const users = await User.find({ isVerified: true })
            .select('clerkId githubUsername bio skills') // Only get public info
            .limit(50);

        return res.status(200).json({ users });
    } catch (error) {
        console.error("List Users Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;