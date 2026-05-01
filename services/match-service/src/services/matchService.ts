import pool from '../config/database';
import { Match, MatchType, MatchStatus } from '../models/Match';
import { v4 as uuidv4 } from 'uuid';

export class MatchService {
  async createMatch(
    playerAId: string,
    playerBId: string,
    matchType: MatchType = 'CASUAL',
    courtId?: number,
    clubId?: number
  ): Promise<Match> {
    const query = `
      INSERT INTO matches (id, player_a_id, player_b_id, court_id, club_id, match_date, match_type, status)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      uuidv4(),
      playerAId,
      playerBId,
      courtId || null,
      clubId || null,
      matchType,
      'SCHEDULED',
    ]);

    return result.rows[0];
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const query = 'SELECT * FROM matches WHERE id = $1';
    const result = await pool.query(query, [matchId]);
    return result.rows[0] || null;
  }

  async recordResult(
    matchId: string,
    scoreA: number,
    scoreB: number,
    winnerId: string
  ): Promise<Match> {
    const query = `
      UPDATE matches
      SET score_a = $1,
          score_b = $2,
          winner_id = $3,
          status = 'COMPLETED',
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [scoreA, scoreB, winnerId, matchId]);

    if (result.rows.length === 0) {
      throw new Error('Match not found');
    }

    return result.rows[0];
  }

  async getPlayerMatches(playerId: string, limit = 50): Promise<Match[]> {
    const query = `
      SELECT * FROM matches
      WHERE (player_a_id = $1 OR player_b_id = $1)
      AND status = 'COMPLETED'
      ORDER BY match_date DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [playerId, limit]);
    return result.rows;
  }

  async getPlayerStats(playerId: string): Promise<{
    total_matches: number;
    wins: number;
    losses: number;
    win_rate: number;
  }> {
    const query = `
      SELECT
        COUNT(*) as total_matches,
        SUM(CASE WHEN winner_id = $1 THEN 1 ELSE 0 END) as wins
      FROM matches
      WHERE (player_a_id = $1 OR player_b_id = $1)
      AND status = 'COMPLETED'
    `;

    const result = await pool.query(query, [playerId]);
    const total = parseInt(result.rows[0].total_matches) || 0;
    const wins = parseInt(result.rows[0].wins) || 0;
    const losses = total - wins;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    return {
      total_matches: total,
      wins,
      losses,
      win_rate: parseFloat(winRate.toFixed(2)),
    };
  }

  async cancelMatch(matchId: string): Promise<boolean> {
    const query = `
      UPDATE matches
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE id = $1 AND status != 'COMPLETED'
    `;

    const result = await pool.query(query, [matchId]);
    return result.rowCount! > 0;
  }

  async getRecentMatches(limit = 20): Promise<Match[]> {
    const query = `
      SELECT * FROM matches
      WHERE status = 'COMPLETED'
      ORDER BY match_date DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

export const matchService = new MatchService();
