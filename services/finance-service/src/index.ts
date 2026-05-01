import express from 'express';
import cors from 'cors';
import financeRoutes from './routes/financeRoutes';

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

app.use('/api/finance', financeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'finance-service' });
});

app.listen(PORT, () => {
  console.log(`Finance Service running on port ${PORT}`);
});
