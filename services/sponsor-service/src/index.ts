import express from 'express';
import cors from 'cors';
import sponsorRoutes from './routes/sponsorRoutes';

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

app.use('/api/sponsors', sponsorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sponsor-service' });
});

app.listen(PORT, () => {
  console.log(`Sponsor Service running on port ${PORT}`);
});
