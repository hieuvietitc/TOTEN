import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/bookingRoutes';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use('/api/booking', bookingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service' });
});

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
