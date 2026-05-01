import { Request, Response } from 'express';
import { fraudService } from '../services/fraudService';
import { AlertSeverity } from '../models/FraudAlert';

export class FraudController {
  async runChecks(req: Request, res: Response) {
    try {
      const { userId, matchId, matchData } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }

      const result = await fraudService.runChecks({ userId, matchId, matchData });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Fraud check failed' });
    }
  }

  async getAlerts(req: Request, res: Response) {
    try {
      const { userId, status, severity } = req.query;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

      const alerts = await fraudService.getAlerts({
        userId: userId as string,
        status: status as string,
        severity: severity as AlertSeverity,
        limit,
      });

      res.json({ alerts, total: alerts.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  async resolveAlert(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const { reviewer_id, resolution_note, status } = req.body;

      if (!reviewer_id || !resolution_note) {
        return res.status(400).json({ error: 'reviewer_id and resolution_note required' });
      }

      const alert = await fraudService.resolveAlert(
        alertId,
        reviewer_id,
        resolution_note,
        status || 'RESOLVED'
      );

      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  }

  async requestBan(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { reviewer_id, reason } = req.body;

      if (!reviewer_id || !reason) {
        return res.status(400).json({ error: 'reviewer_id and reason required' });
      }

      await fraudService.banUser(userId, reviewer_id, reason);
      res.json({ message: 'Ban request logged — awaiting human approval', requires_approval: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to request ban' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await fraudService.getFraudStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

export const fraudController = new FraudController();
