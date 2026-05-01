import express from 'express';
import cors from 'cors';
import controlTowerRoutes from './routes/controlTowerRoutes';

const app = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(express.json());

app.use('/api/control-tower', controlTowerRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'control-tower' });
});

app.listen(PORT, () => {
  console.log(`Control Tower running on port ${PORT}`);
});
