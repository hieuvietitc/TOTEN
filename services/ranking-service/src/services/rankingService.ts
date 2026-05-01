import pool from '../config/database';
import { Ranking } from '../models/Rating';
import { RankingCalculator } from '../utils/rankingCalculator';

export class RankingService {
  async initializeRanking(userId: string): Promise<Ranking> {
    const query = `
      INSERT INTO rankings (user_id, ranking_points, rank_position, period, last_updated)
      VALUES ($1, 0, 0, $2, NOW())
      ON CONFLICT (user_id, period) DO UPDATE
      SET ranking_points = EXCLUDED.ranking_points
      RETURNING *
    `;

    const currentPeriod = this.getCurrentPeriod();
    const result = await pool.query(query, [userId, currentPeriod]);
    return result.rows[0];
  }

  async getRanking(userId: string, period?: string): Promise<Ranking | null> {
    const queryPeriod = period || this.getCurrentPeriod();
    const query = `
      SELECT * FROM rankings
      WHERE user_id = $1 AND period = $2
    `;
    const result = await pool.query(query, [userId, queryPeriod]);
    return result.rows[0] || null;
  }

  async addRankingPoints(
    userId: string,
    playerRating: number,
    opponentRating: number,
    eventLevel: 1 | 2 | 3 | 4,
    won: boolean
  ): Promise<Ranking> {
    const points = RankingCalculator.calculateMatchPoints(playerRating, opponentRating, eventLevel, won);

    const query = `
      UPDATE rankings
      SET ranking_points = ranking_points + $1,
          last_updated = NOW()
      WHERE user_id = $2 AND period = $3
      RETURNING *
    `;

    const period = this.getCurrentPeriod();
    const result = await pool.query(query, [points, userId, period]);

    if (result.rows.length === 0) {
      return this.initializeRanking(userId);
    }

    return result.rows[0];
  }

  async updateAllRankPositions(): Promise<void> {
    const period = this.getCurrentPeriod();

    const query = `
      WITH ranked AS (
        SELECT
          user_id,
          ranking_points,
          ROW_NUMBER() OVER (ORDER BY ranking_points DESC) as new_position
        FROM rankings
        WHERE period = $1
      )
      UPDATE rankings r
      SET rank_position = ranked.new_position
      FROM ranked
      WHERE r.user_id = ranked.user_id AND r.period = $1
    `;

    await pool.query(query, [period]);
  }

  async getLeaderboard(limit = 100, period?: string): Promise<Ranking[]> {
    const queryPeriod = period || this.getCurrentPeriod();
    const query = `
      SELECT * FROM rankings
      WHERE period = $1
      ORDER BY ranking_points DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [queryPeriod, limit]);
    return result.rows;
  }

  async getPlayerRankInfo(userId: string, period?: string): Promise<{
    rank: number;
    totalRanked: number;
    percentile: number;
  }> {
    const queryPeriod = period || this.getCurrentPeriod();
    const query = `
      SELECT
        rank_position as rank,
        (SELECT COUNT(*) FROM rankings WHERE period = $1) as total_ranked,
        ROUND((rank_position::float / (SELECT COUNT(*) FROM rankings WHERE period = $1) * 100)::numeric, 2) as percentile
      FROM rankings
      WHERE user_id = $2 AND period = $1
    `;

    const result = await pool.query(query, [queryPeriod, userId]);

    if (result.rows.length === 0) {
      return { rank: 0, totalRanked: 0, percentile: 0 };
    }

    return {
      rank: result.rows[0].rank,
      totalRanked: parseInt(result.rows[0].total_ranked),
      percentile: parseFloat(result.rows[0].percentile),
    };
  }

  async resetPeriod(): Promise<void> {
    const newPeriod = this.getCurrentPeriod();
    const query = `
      INSERT INTO rankings (user_id, ranking_points, rank_position, period, last_updated)
      SELECT user_id, 0, 0, $1, NOW()
      FROM (SELECT DISTINCT user_id FROM rankings) unique_users
      ON CONFLICT (user_id, period) DO NOTHING
    `;

    await pool.query(query, [newPeriod]);
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const weekStart = this.getWeekStart(now);
    return `${year}-W${this.getWeekNumber(now)}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}

export const rankingService = new RankingService();
