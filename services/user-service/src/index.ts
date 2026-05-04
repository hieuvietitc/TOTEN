import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import clubRoutes from './routes/clubRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// clubs MUST be mounted before /api/users so /:id won't swallow /clubs/*
app.use('/api/users/clubs', clubRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
