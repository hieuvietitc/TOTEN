import express from 'express';
import cors from 'cors';
import membershipRoutes from './routes/membershipRoutes';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api/membership', membershipRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'membership-service' });
});

app.listen(PORT, () => {
  console.log(`Membership Service running on port ${PORT}`);
});
