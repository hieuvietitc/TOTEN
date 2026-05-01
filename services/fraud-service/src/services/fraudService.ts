import pool from '../config/database';
import { FraudAlert, FraudCheck, FraudCheckResult, AlertSeverity } from '../models/FraudAlert';
import {
  checkNoQRCheckin,
  checkNoDualConfirmation,
  checkRatingAnomaly,
  checkMatchDuration,
  checkFrequentPairing,
  checkRatingVelocity,
} from '../rules/fraudRules';
import { v4 as uuidv4 } from 'uuid';

export class FraudService {
  async runChecks(check: FraudCheck): Promise<FraudCheckResult> {
    const alerts: FraudCheckResult['alerts'] = [];
    const { userId, matchId, matchData } = check;

    if (matchData && matchId) {
      const qrRule = checkNoQRCheckin(matchData.hasQRCheckin, matchId);
      if (qrRule.triggered) alerts.push(qrRule);

      const dualRule = checkNoDualConfirmation(matchData.dualConfirmed, matchId);
      if (dualRule.triggered) alerts.push(dualRule);

      const ratingRule = checkRatingAnomaly(
        matchData.ratingA,
        matchData.ratingB,
        matchData.scoreA,
        matchData.scoreB
      );
      if (ratingRule.triggered) alerts.push(ratingRule);

      if (matchData.matchDurationMinutes !== undefined) {
        const durationRule = checkMatchDuration(matchData.matchDurationMinutes, matchId);
        if (durationRule.triggered) alerts.push(durationRule);
      }
    }

    const pairingCount = matchId
      ? await this.getPairingCountThisWeek(userId, matchId)
      : 0;

    if (pairingCount > 0) {
      const pairingRule = checkFrequentPairing(pairingCount, userId, matchId || '');
      if (pairingRule.triggered) alerts.push(pairingRule);
    }

    const ratingGain = await this.getRatingGainLast7Days(userId);
    if (ratingGain > 0) {
      const velocityRule = checkRatingVelocity(ratingGain, userId);
      if (velocityRule.triggered) alerts.push(velocityRule);
    }

    if (alerts.length > 0) {
      await this.saveAlerts(userId, matchId, alerts);
    }

    return {
      isSuspicious: alerts.length > 0,
      alerts,
    };
  }

  private async saveAlerts(
    userId: string,
    matchId: string | undefined,
    alerts: FraudCheckResult['alerts']
  ): Promise<void> {
    for (const alert of alerts) {
      if (alert.severity === 'BANNED') continue; // Never auto-ban

      const query = `
        INSERT INTO fraud_alerts (id, match_id, user_id, alert_type, severity, description, evidence, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `;
      await pool.query(query, [
        uuidv4(),
        matchId || null,
        userId,
        alert.type,
        alert.severity,
        alert.description,
        JSON.stringify(alert.evidence),
        'OPEN',
      ]);
    }
  }

  async getAlerts(filters: {
    userId?: string;
    status?: string;
    severity?: AlertSeverity;
    limit?: number;
  }): Promise<FraudAlert[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${idx++}`);
      params.push(filters.userId);
    }
    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.severity) {
      conditions.push(`severity = $${idx++}`);
      params.push(filters.severity);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 50;

    const query = `SELECT * FROM fraud_alerts ${where} ORDER BY created_at DESC LIMIT ${limit}`;
    const result = await pool.query(query, params);
    return result.rows;
  }

  async resolveAlert(
    alertId: string,
    reviewerId: string,
    resolutionNote: string,
    newStatus: 'RESOLVED' | 'REVIEWED'
  ): Promise<FraudAlert> {
    const query = `
      UPDATE fraud_alerts
      SET status = $1, reviewer_id = $2, resolution_note = $3, resolved_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [newStatus, reviewerId, resolutionNote, alertId]);
    return result.rows[0];
  }

  async banUser(userId: string, reviewerId: string, reason: string): Promise<void> {
    // Human approval required — log action only, do not auto-execute
    const query = `
      INSERT INTO fraud_alerts (id, user_id, alert_type, severity, description, evidence, status)
      VALUES ($1, $2, 'MANUAL_BAN_REQUEST', 'BANNED', $3, $4, 'OPEN')
    `;
    await pool.query(query, [
      uuidv4(),
      userId,
      reason,
      JSON.stringify({ requested_by: reviewerId, requires_human_approval: true }),
    ]);
  }

  async getFraudStats(): Promise<{
    open_alerts: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
  }> {
    const countQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'OPEN') as open_alerts,
        COUNT(*) FILTER (WHERE severity = 'WARNING') as warning,
        COUNT(*) FILTER (WHERE severity = 'HOLD') as hold,
        COUNT(*) FILTER (WHERE severity = 'INVESTIGATION') as investigation,
        COUNT(*) FILTER (WHERE severity = 'BANNED') as banned
      FROM fraud_alerts
    `;

    const typeQuery = `
      SELECT alert_type, COUNT(*) as count
      FROM fraud_alerts
      WHERE status = 'OPEN'
      GROUP BY alert_type
    `;

    const [countResult, typeResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(typeQuery),
    ]);

    const by_type: Record<string, number> = {};
    typeResult.rows.forEach(r => { by_type[r.alert_type] = parseInt(r.count); });

    return {
      open_alerts: parseInt(countResult.rows[0].open_alerts),
      by_severity: {
        WARNING: parseInt(countResult.rows[0].warning),
        HOLD: parseInt(countResult.rows[0].hold),
        INVESTIGATION: parseInt(countResult.rows[0].investigation),
        BANNED: parseInt(countResult.rows[0].banned),
      },
      by_type,
    };
  }

  private async getPairingCountThisWeek(userId: string, matchId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM matches
      WHERE (player_a_id = $1 OR player_b_id = $1)
        AND match_date >= NOW() - INTERVAL '7 days'
        AND status = 'COMPLETED'
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  private async getRatingGainLast7Days(userId: string): Promise<number> {
    // Simplified: check if rating change exists in audit log
    // In production this would query a ratings_history table
    return 0;
  }
}

export const fraudService = new FraudService();
