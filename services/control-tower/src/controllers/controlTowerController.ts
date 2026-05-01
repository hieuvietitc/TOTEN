import { Request, Response } from 'express';
import { controlTowerService } from '../services/controlTowerService';

export class ControlTowerController {
  async getDailyMetrics(req: Request, res: Response) {
    try {
      const metrics = await controlTowerService.getDailyMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get daily metrics' });
    }
  }

  async getNationalSnapshot(req: Request, res: Response) {
    try {
      const snapshot = await controlTowerService.getNationalSnapshot();
      res.json(snapshot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get national snapshot' });
    }
  }

  async getClubLeaderboard(req: Request, res: Response) {
    try {
      const top = parseInt(req.query.top as string) || 10;
      const bottom = parseInt(req.query.bottom as string) || 10;

      const leaderboard = await controlTowerService.getClubLeaderboard(top, bottom);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get club leaderboard' });
    }
  }

  async getKPIAlerts(req: Request, res: Response) {
    try {
      const alerts = await controlTowerService.getKPIAlerts();
      res.json({ alerts, total: alerts.length, has_critical: alerts.some(a => a.severity === 'CRITICAL') });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get KPI alerts' });
    }
  }

  async getRecommendations(req: Request, res: Response) {
    try {
      const recommendations = await controlTowerService.getActionRecommendations();
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  async getFullDashboard(req: Request, res: Response) {
    try {
      const [metrics, snapshot, kpiAlerts, recommendations, leaderboard] = await Promise.all([
        controlTowerService.getDailyMetrics(),
        controlTowerService.getNationalSnapshot(),
        controlTowerService.getKPIAlerts(),
        controlTowerService.getActionRecommendations(),
        controlTowerService.getClubLeaderboard(5, 5),
      ]);

      res.json({
        generated_at: new Date().toISOString(),
        daily: metrics,
        national: snapshot,
        kpi_alerts: kpiAlerts,
        recommendations,
        clubs: leaderboard,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load dashboard' });
    }
  }
}

export const controlTowerController = new ControlTowerController();
