import { Router } from 'express';
import { matchController } from '../controllers/matchController';

const router = Router();

// Static/multi-segment routes BEFORE parameterized routes to avoid shadowing
router.get('/recent/list', matchController.getRecentMatches.bind(matchController));
router.get('/player/:playerId/matches', matchController.getPlayerMatches.bind(matchController));
router.get('/player/:playerId/stats', matchController.getPlayerStats.bind(matchController));

router.post('/', matchController.createMatch.bind(matchController));
router.get('/', matchController.getRecentMatches.bind(matchController));   // list alias
router.get('/:matchId', matchController.getMatch.bind(matchController));
router.put('/:matchId/result', matchController.recordResult.bind(matchController));
router.delete('/:matchId', matchController.cancelMatch.bind(matchController));

export default router;
