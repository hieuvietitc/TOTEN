import { Router } from 'express';
import { controlTowerController } from '../controllers/controlTowerController';

const router = Router();

router.get('/dashboard', controlTowerController.getFullDashboard.bind(controlTowerController));
router.get('/daily', controlTowerController.getDailyMetrics.bind(controlTowerController));
router.get('/snapshot', controlTowerController.getNationalSnapshot.bind(controlTowerController));
router.get('/clubs/leaderboard', controlTowerController.getClubLeaderboard.bind(controlTowerController));
router.get('/kpi/alerts', controlTowerController.getKPIAlerts.bind(controlTowerController));
router.get('/recommendations', controlTowerController.getRecommendations.bind(controlTowerController));

export default router;
