import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notificationRoutes';

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
