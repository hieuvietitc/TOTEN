import { Router, Request, Response } from 'express';
import { fraudController } from '../controllers/fraudController';
import pool from '../config/database';

const router = Router();

router.post('/check', fraudController.runChecks.bind(fraudController));
router.get('/alerts', fraudController.getAlerts.bind(fraudController));
router.put('/alerts/:alertId/resolve', fraudController.resolveAlert.bind(fraudController));
router.post('/ban/:userId', fraudController.requestBan.bind(fraudController));
router.get('/stats', fraudController.getStats.bind(fraudController));

// GET /fraud/player/:userId/history
router.get('/player/:userId/history', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM fraud_alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.userId],
    );
    res.json({ data: { items: result.rows, total: result.rowCount } });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
