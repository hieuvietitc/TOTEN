import pool from '../config/database';
import { Rating, getTierFromRating } from '../models/Rating';
import { RatingCalculator } from '../utils/ratingCalculator';

export class RatingService {
  async initializeRating(userId: string): Promise<Rating> {
    const initialRating = 5.0;
    const query = `
      INSERT INTO ratings (user_id, rating_value, tier, matches_played, last_updated)
      VALUES ($1, $2, $3, 0, NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET rating_value = EXCLUDED.rating_value
      RETURNING *
    `;

    const result = await pool.query(query, [userId, initialRating, getTierFromRating(initialRating)]);
    return result.rows[0];
  }

  async getRating(userId: string): Promise<Rating | null> {
    const query = 'SELECT * FROM ratings WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  async updateRatingFromMatch(
    winnerId: string,
    loserId: string,
    matchData: {
      winnerRating: number;
      loserRating: number;
      matchesPlayedWinner: number;
      matchesPlayedLoser: number;
      winnerScore: number;
      loserScore: number;
      hasQRCheckin: boolean;
      dualConfirmed: boolean;
    }
  ): Promise<{ winner: Rating; loser: Rating }> {
    const pointDiff = matchData.winnerScore - matchData.loserScore;

    const newWinnerRating = RatingCalculator.calculateNewRating(
      matchData.winnerRating,
      matchData.loserRating,
      1, // Win
      matchData.matchesPlayedWinner,
      pointDiff,
      matchData.hasQRCheckin,
      matchData.dualConfirmed
    );

    const newLoserRating = RatingCalculator.calculateNewRating(
      matchData.loserRating,
      matchData.winnerRating,
      0, // Loss
      matchData.matchesPlayedLoser,
      pointDiff,
      matchData.hasQRCheckin,
      matchData.dualConfirmed
    );

    const updateQuery = `
      UPDATE ratings
      SET rating_value = $1,
          tier = $2,
          matches_played = matches_played + 1,
          last_updated = NOW()
      WHERE user_id = $3
      RETURNING *
    `;

    const winnerResult = await pool.query(updateQuery, [
      newWinnerRating,
      getTierFromRating(newWinnerRating),
      winnerId,
    ]);

    const loserResult = await pool.query(updateQuery, [
      newLoserRating,
      getTierFromRating(newLoserRating),
      loserId,
    ]);

    return {
      winner: winnerResult.rows[0],
      loser: loserResult.rows[0],
    };
  }

  async getTopPlayers(limit = 100): Promise<Rating[]> {
    const query = `
      SELECT * FROM ratings
      ORDER BY rating_value DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getPlayersByTier(tier: string, limit = 50): Promise<Rating[]> {
    const query = `
      SELECT * FROM ratings
      WHERE tier = $1
      ORDER BY rating_value DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [tier, limit]);
    return result.rows;
  }

  async getRatingStats(): Promise<{
    avgRating: number;
    medianRating: number;
    totalPlayers: number;
  }> {
    const query = `
      SELECT
        ROUND(AVG(rating_value)::numeric, 2) as avg_rating,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY rating_value) as median_rating,
        COUNT(*) as total_players
      FROM ratings
    `;
    const result = await pool.query(query);
    return {
      avgRating: parseFloat(result.rows[0].avg_rating),
      medianRating: parseFloat(result.rows[0].median_rating),
      totalPlayers: parseInt(result.rows[0].total_players),
    };
  }
}

export const ratingService = new RatingService();
