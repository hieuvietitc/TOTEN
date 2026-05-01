import { Router } from 'express';
import { financeController } from '../controllers/financeController';

const router = Router();

router.post('/transactions', financeController.recordTransaction.bind(financeController));
router.get('/pl', financeController.getPLSummary.bind(financeController));
router.get('/revenue/breakdown', financeController.getRevenueByType.bind(financeController));
router.get('/revenue/daily', financeController.getDailyRevenue.bind(financeController));
router.get('/alerts', financeController.getAlerts.bind(financeController));
router.get('/user/:userId/transactions', financeController.getUserTransactions.bind(financeController));

export default router;
