import express from 'express';
import cors from 'cors';
import tournamentRoutes from './routes/tournamentRoutes';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

app.use('/api/tournaments', tournamentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tournament-service' });
});

app.listen(PORT, () => {
  console.log(`Tournament Service running on port ${PORT}`);
});
