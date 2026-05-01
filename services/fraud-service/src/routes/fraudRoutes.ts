import { Router } from 'express';
import { fraudController } from '../controllers/fraudController';

const router = Router();

router.post('/check', fraudController.runChecks.bind(fraudController));
router.get('/alerts', fraudController.getAlerts.bind(fraudController));
router.put('/alerts/:alertId/resolve', fraudController.resolveAlert.bind(fraudController));
router.post('/ban/:userId', fraudController.requestBan.bind(fraudController));
router.get('/stats', fraudController.getStats.bind(fraudController));

export default router;
