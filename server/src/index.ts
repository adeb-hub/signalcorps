import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './lib/db.js';


// Import Routes
import Verify from './routes/verify.js'
import Status from './routes/status.js'
import List from './routes/list.js'
import Chat from './routes/chat.js' // Changed import name to 'chat.routes.js' for clarity, assuming that's the file.

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173", // Local development
        "https://knowledge-base-7wsp.vercel.app/" // <--- ADD YOUR LIVE FRONTEND URL HERE
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
const PORT = process.env.PORT || 3001;

connectDB();


// --- REGISTER ROUTES ---
// /api/verify - Bio Submission + AI Check
app.use('/api/verify', Verify);

// /api/user - Status Check (Is Verified?) AND List All Users
app.use('/api/user', Status); 
app.use('/api/user', List);

// FIX: Added leading slash. This mounts the chat router at /api/chat/send
app.use('/api/chat', Chat); 

app.get('/', (req, res) => {
    res.send('Signal Corps Backend is Alive');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app