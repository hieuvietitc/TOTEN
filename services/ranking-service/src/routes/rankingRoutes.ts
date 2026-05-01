import { Router } from 'express';
import { rankingController } from '../controllers/rankingController';
import { matchmakingController } from '../matchmaking/matchmakingController';

const router = Router();

router.get('/rating/:userId', rankingController.getRating.bind(rankingController));
router.get('/ranking/:userId', rankingController.getRanking.bind(rankingController));
router.post('/update-match', rankingController.updateFromMatch.bind(rankingController));
router.get('/leaderboard/top', rankingController.getLeaderboard.bind(rankingController));
router.get('/player/:userId/rank-info', rankingController.getPlayerRankInfo.bind(rankingController));
router.get('/players/top', rankingController.getTopPlayers.bind(rankingController));
router.get('/stats/overview', rankingController.getStats.bind(rankingController));

// Matchmaking routes
router.get('/matchmaking/:userId', matchmakingController.findMatches.bind(matchmakingController));
router.post('/matchmaking/mfs', matchmakingController.calculateMFS.bind(matchmakingController));

export default router;
