import { Router } from 'express';
import { matchController } from '../controllers/matchController';

const router = Router();

router.post('/', matchController.createMatch.bind(matchController));
router.get('/:matchId', matchController.getMatch.bind(matchController));
router.put('/:matchId/result', matchController.recordResult.bind(matchController));
router.get('/player/:playerId/matches', matchController.getPlayerMatches.bind(matchController));
router.get('/player/:playerId/stats', matchController.getPlayerStats.bind(matchController));
router.delete('/:matchId', matchController.cancelMatch.bind(matchController));
router.get('/recent/list', matchController.getRecentMatches.bind(matchController));

export default router;
