import express from 'express';
import cors from 'cors';
import rankingRoutes from './routes/rankingRoutes';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

app.use('/api/ranking', rankingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ranking-service' });
});

app.listen(PORT, () => {
  console.log(`Ranking Service running on port ${PORT}`);
});
