import express from 'express';
import cors from 'cors';
import fraudRoutes from './routes/fraudRoutes';

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

app.use('/api/fraud', fraudRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fraud-service' });
});

app.listen(PORT, () => {
  console.log(`Fraud Service running on port ${PORT}`);
});
