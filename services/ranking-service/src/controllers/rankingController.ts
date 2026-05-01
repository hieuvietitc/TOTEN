import { Request, Response } from 'express';
import { ratingService } from '../services/ratingService';
import { rankingService } from '../services/rankingService';

export class RankingController {
  async getRating(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const rating = await ratingService.getRating(userId);

      if (!rating) {
        const initialized = await ratingService.initializeRating(userId);
        return res.json(initialized);
      }

      res.json(rating);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rating' });
    }
  }

  async getRanking(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      let ranking = await rankingService.getRanking(userId, period as string);

      if (!ranking) {
        ranking = await rankingService.initializeRanking(userId);
      }

      res.json(ranking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ranking' });
    }
  }

  async updateFromMatch(req: Request, res: Response) {
    try {
      const { winnerId, loserId } = req.body;
      const matchData = req.body;

      if (!winnerId || !loserId) {
        return res.status(400).json({ error: 'winnerId and loserId required' });
      }

      const ratings = await ratingService.updateRatingFromMatch(winnerId, loserId, matchData);
      await rankingService.addRankingPoints(
        winnerId,
        matchData.winnerRating,
        matchData.loserRating,
        matchData.eventLevel || 1,
        true
      );

      await rankingService.updateAllRankPositions();

      res.json({
        winner: ratings.winner,
        loser: ratings.loser,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update ratings' });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const period = req.query.period as string;

      const leaderboard = await rankingService.getLeaderboard(limit, period);
      res.json({ leaderboard, total: leaderboard.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }

  async getPlayerRankInfo(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const rankInfo = await rankingService.getPlayerRankInfo(userId, period as string);
      res.json(rankInfo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rank info' });
    }
  }

  async getTopPlayers(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const tier = req.query.tier as string;

      let topPlayers;
      if (tier) {
        topPlayers = await ratingService.getPlayersByTier(tier, limit);
      } else {
        topPlayers = await ratingService.getTopPlayers(limit);
      }

      res.json({ players: topPlayers, total: topPlayers.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch top players' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await ratingService.getRatingStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

export const rankingController = new RankingController();
