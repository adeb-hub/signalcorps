import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './lib/db.js';
import Verify from './routes/verify.js'
import Status from './routes/status.js'
import List from './routes/list.js'
import Chat from './routes/chat.js'
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

connectDB();

app.use('/api/verify', Verify);

// --- THE FIX IS HERE ---
// Change '/api/status' to '/api/user'
// Because Status.ts defines router.post('/status'), the result is /api/user/status
app.use('/api/user', Status); 
app.use('/api/user', List)
app.use('api/chat', Chat)

app.get('/', (req, res) => {
  res.send('Vibe Check Backend is Alive');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
