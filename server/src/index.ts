import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Vibe Check Backend is Alive');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});