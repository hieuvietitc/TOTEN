import express from 'express';
import cors from 'cors';
import matchRoutes from './routes/matchRoutes';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use('/api/matches', matchRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'match-service' });
});

app.listen(PORT, () => {
  console.log(`Match Service running on port ${PORT}`);
});
