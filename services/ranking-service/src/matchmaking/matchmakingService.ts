import pool from '../config/database';
import { MatchFitScoreEngine, PlayerProfile, MatchFitResult } from './matchFitScore';

export class MatchmakingService {
  async findMatches(
    userId: string,
    options: {
      city?: string;
      matchGoal?: 'CASUAL' | 'PRACTICE' | 'RANKED' | 'TOURNAMENT';
      availableSlots?: string[];
      limit?: number;
    }
  ): Promise<MatchFitResult[]> {
    const targetProfile = await this.buildPlayerProfile(userId);
    if (!targetProfile) throw new Error('Player profile not found');

    // Override with request options
    if (options.city) targetProfile.city = options.city;
    if (options.matchGoal) targetProfile.matchGoal = options.matchGoal;
    if (options.availableSlots) targetProfile.availableSlots = options.availableSlots;

    const candidateProfiles = await this.getCandidates(targetProfile, options.limit || 20);
    return MatchFitScoreEngine.rankCandidates(targetProfile, candidateProfiles);
  }

  private async buildPlayerProfile(userId: string): Promise<PlayerProfile | null> {
    const userQuery = `
      SELECT u.id, u.city, u.district, r.rating_value, r.matches_played
      FROM users u
      LEFT JOIN ratings r ON u.id = r.user_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `;
    const userResult = await pool.query(userQuery, [userId]);
    if (userResult.rows.length === 0) return null;

    const user = userResult.rows[0];

    const recentOpponentsQuery = `
      SELECT
        CASE WHEN player_a_id = $1 THEN player_b_id ELSE player_a_id END as opponent_id
      FROM matches
      WHERE (player_a_id = $1 OR player_b_id = $1)
        AND status = 'COMPLETED'
      ORDER BY match_date DESC
      LIMIT 10
    `;
    const opponentsResult = await pool.query(recentOpponentsQuery, [userId]);

    return {
      userId: user.id,
      rating: parseFloat(user.rating_value) || 5.0,
      city: user.city || 'HCM',
      district: user.district,
      availableSlots: [],
      recentOpponents: opponentsResult.rows.map(r => r.opponent_id),
      matchGoal: 'CASUAL',
      matchesPlayed: parseInt(user.matches_played) || 0,
    };
  }

  private async getCandidates(target: PlayerProfile, limit: number): Promise<PlayerProfile[]> {
    const ratingMin = target.rating - 2.0;
    const ratingMax = target.rating + 2.0;

    const query = `
      SELECT u.id, u.city, u.district, r.rating_value, r.matches_played
      FROM users u
      JOIN ratings r ON u.id = r.user_id
      WHERE u.id != $1
        AND u.deleted_at IS NULL
        AND r.rating_value BETWEEN $2 AND $3
      ORDER BY ABS(r.rating_value - $4) ASC
      LIMIT $5
    `;

    const result = await pool.query(query, [
      target.userId,
      ratingMin,
      ratingMax,
      target.rating,
      limit * 3, // fetch more to allow ranking
    ]);

    return result.rows.map(row => ({
      userId: row.id,
      rating: parseFloat(row.rating_value),
      city: row.city || 'HCM',
      district: row.district,
      availableSlots: [],
      recentOpponents: [],
      matchGoal: 'CASUAL' as const,
      matchesPlayed: parseInt(row.matches_played) || 0,
    }));
  }
}

export const matchmakingService = new MatchmakingService();
