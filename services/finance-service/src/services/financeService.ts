import pool from '../config/database';
import {
  Transaction, TransactionType, TransactionStatus,
  PLSummary, FinanceAlert,
} from '../models/Finance';
import { v4 as uuidv4 } from 'uuid';

export class FinanceService {
  async recordTransaction(data: {
    transaction_type: TransactionType;
    user_id?: string;
    amount_vnd: number;
    payment_method?: string;
    status?: TransactionStatus;
    reference_id?: string;
    metadata?: Record<string, any>;
  }): Promise<Transaction> {
    const query = `
      INSERT INTO financial_transactions
        (id, transaction_type, user_id, amount_vnd, payment_method, status, reference_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      uuidv4(),
      data.transaction_type,
      data.user_id || null,
      data.amount_vnd,
      data.payment_method || null,
      data.status || 'COMPLETED',
      data.reference_id || null,
      JSON.stringify(data.metadata || {}),
    ]);

    return result.rows[0];
  }

  async getPLSummary(period?: string): Promise<PLSummary> {
    const dateFilter = period
      ? `AND DATE_TRUNC('month', created_at) = $1::date`
      : `AND created_at >= NOW() - INTERVAL '30 days'`;

    const params = period ? [period] : [];

    const query = `
      SELECT
        transaction_type,
        SUM(amount_vnd) FILTER (WHERE status = 'COMPLETED') as revenue
      FROM financial_transactions
      WHERE 1=1 ${dateFilter}
      GROUP BY transaction_type
    `;

    const result = await pool.query(query, params);

    const revenueMap: Record<string, number> = {};
    result.rows.forEach(r => {
      revenueMap[r.transaction_type] = parseInt(r.revenue) || 0;
    });

    const revenue = {
      membership: revenueMap['MEMBERSHIP_FEE'] || 0,
      tournament: revenueMap['TOURNAMENT_FEE'] || 0,
      court_booking: revenueMap['COURT_BOOKING'] || 0,
      equipment: revenueMap['EQUIPMENT_SALE'] || 0,
      sponsorship: revenueMap['SPONSORSHIP'] || 0,
      total: 0,
    };
    revenue.total = Object.values(revenue).reduce((a, b) => a + b, 0) - revenue.total;

    const estimatedCosts = {
      marketing: Math.round(revenue.total * 0.25),
      operations: Math.round(revenue.total * 0.15),
      staff: Math.round(revenue.total * 0.10),
      total: 0,
    };
    estimatedCosts.total = estimatedCosts.marketing + estimatedCosts.operations + estimatedCosts.staff;

    const grossProfit = revenue.total - estimatedCosts.total;
    const grossMarginPct = revenue.total > 0
      ? parseFloat(((grossProfit / revenue.total) * 100).toFixed(2))
      : 0;

    return {
      period: period || 'last_30_days',
      revenue,
      cost: estimatedCosts,
      gross_profit: grossProfit,
      gross_margin_pct: grossMarginPct,
    };
  }

  async getRevenueByType(days = 30): Promise<Array<{ type: string; amount: number; percentage: number }>> {
    const query = `
      SELECT
        transaction_type as type,
        SUM(amount_vnd) as amount
      FROM financial_transactions
      WHERE status = 'COMPLETED'
        AND created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY transaction_type
      ORDER BY amount DESC
    `;

    const result = await pool.query(query, [days]);
    const total = result.rows.reduce((sum, r) => sum + parseInt(r.amount), 0);

    return result.rows.map(r => ({
      type: r.type,
      amount: parseInt(r.amount),
      percentage: total > 0 ? parseFloat(((parseInt(r.amount) / total) * 100).toFixed(2)) : 0,
    }));
  }

  async getDailyRevenue(days = 30): Promise<Array<{ date: string; revenue: number; count: number }>> {
    const query = `
      SELECT
        DATE(created_at) as date,
        SUM(amount_vnd) as revenue,
        COUNT(*) as count
      FROM financial_transactions
      WHERE status = 'COMPLETED'
        AND created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const result = await pool.query(query, [days]);
    return result.rows.map(r => ({
      date: r.date,
      revenue: parseInt(r.revenue),
      count: parseInt(r.count),
    }));
  }

  async getRefundRate(days = 30): Promise<number> {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'REFUNDED') as refunded,
        COUNT(*) as total
      FROM financial_transactions
      WHERE created_at >= NOW() - ($1 || ' days')::interval
    `;

    const result = await pool.query(query, [days]);
    const refunded = parseInt(result.rows[0].refunded) || 0;
    const total = parseInt(result.rows[0].total) || 1;
    return parseFloat(((refunded / total) * 100).toFixed(2));
  }

  async checkAlerts(): Promise<FinanceAlert[]> {
    const alerts: FinanceAlert[] = [];
    const summary = await this.getPLSummary();
    const refundRate = await this.getRefundRate();

    if (summary.revenue.total < 100_000_000) {
      alerts.push({
        type: 'LOW_REVENUE',
        severity: 'WARNING',
        message: `Monthly revenue ${(summary.revenue.total / 1_000_000).toFixed(1)}M VND below 100M target`,
        value: summary.revenue.total,
        threshold: 100_000_000,
      });
    }

    if (refundRate > 5) {
      alerts.push({
        type: 'HIGH_REFUND_RATE',
        severity: refundRate > 10 ? 'CRITICAL' : 'WARNING',
        message: `Refund rate ${refundRate}% exceeds 5% threshold`,
        value: refundRate,
        threshold: 5,
      });
    }

    if (summary.gross_margin_pct < 30) {
      alerts.push({
        type: 'KPI_MISS',
        severity: 'WARNING',
        message: `Gross margin ${summary.gross_margin_pct}% below 30% target`,
        value: summary.gross_margin_pct,
        threshold: 30,
      });
    }

    return alerts;
  }

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    const query = `
      SELECT * FROM financial_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
}

export const financeService = new FinanceService();
