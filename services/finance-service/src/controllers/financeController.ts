import { Request, Response } from 'express';
import { financeService } from '../services/financeService';

export class FinanceController {
  async recordTransaction(req: Request, res: Response) {
    try {
      const { transaction_type, user_id, amount_vnd, payment_method, status, reference_id, metadata } = req.body;

      if (!transaction_type || !amount_vnd) {
        return res.status(400).json({ error: 'transaction_type and amount_vnd required' });
      }

      const tx = await financeService.recordTransaction({
        transaction_type,
        user_id,
        amount_vnd,
        payment_method,
        status,
        reference_id,
        metadata,
      });

      res.status(201).json(tx);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record transaction' });
    }
  }

  async getPLSummary(req: Request, res: Response) {
    try {
      const { period } = req.query;
      const summary = await financeService.getPLSummary(period as string);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get P&L summary' });
    }
  }

  async getRevenueByType(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const breakdown = await financeService.getRevenueByType(days);
      res.json({ breakdown, days });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get revenue breakdown' });
    }
  }

  async getDailyRevenue(req: Request, res: Response) {
    try {
      const days = Math.min(parseInt(req.query.days as string) || 30, 90);
      const daily = await financeService.getDailyRevenue(days);
      res.json({ daily, days });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get daily revenue' });
    }
  }

  async getAlerts(req: Request, res: Response) {
    try {
      const alerts = await financeService.checkAlerts();
      res.json({ alerts, total: alerts.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get finance alerts' });
    }
  }

  async getUserTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const transactions = await financeService.getUserTransactions(userId, limit);
      res.json({ transactions, total: transactions.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
}

export const financeController = new FinanceController();
