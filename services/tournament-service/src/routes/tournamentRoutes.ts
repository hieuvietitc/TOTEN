import { Router } from 'express';
import { tournamentController } from '../controllers/tournamentController';

const router = Router();

// Static routes first to prevent /:tournamentId shadowing
router.get('/', tournamentController.listTournaments.bind(tournamentController));
router.post('/', tournamentController.createTournament.bind(tournamentController));
router.put('/match/:matchId/result', tournamentController.recordResult.bind(tournamentController));

// Parameterized routes after statics
router.get('/:tournamentId', tournamentController.getTournament.bind(tournamentController));
router.put('/:tournamentId/status', tournamentController.updateStatus.bind(tournamentController));
router.post('/:tournamentId/register', tournamentController.registerParticipant.bind(tournamentController));
router.get('/:tournamentId/participants', tournamentController.getParticipants.bind(tournamentController));
router.get('/:tournamentId/matches', tournamentController.getMatches.bind(tournamentController));
router.get('/:tournamentId/stats', tournamentController.getStats.bind(tournamentController));

export default router;
