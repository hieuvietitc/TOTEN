import { Request, Response } from 'express';
import { matchService } from '../services/matchService';
import { MatchType } from '../models/Match';

export class MatchController {
  async createMatch(req: Request, res: Response) {
    try {
      const { player_a_id, player_b_id, match_type, court_id, club_id } = req.body;

      if (!player_a_id || !player_b_id) {
        return res.status(400).json({ error: 'player_a_id and player_b_id required' });
      }

      const match = await matchService.createMatch(
        player_a_id,
        player_b_id,
        (match_type as MatchType) || 'CASUAL',
        court_id,
        club_id
      );

      res.status(201).json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create match' });
    }
  }

  async getMatch(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const match = await matchService.getMatch(matchId);

      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      res.json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch match' });
    }
  }

  async recordResult(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { score_a, score_b, winner_id } = req.body;

      if (score_a === undefined || score_b === undefined || !winner_id) {
        return res.status(400).json({ error: 'score_a, score_b, winner_id required' });
      }

      const match = await matchService.recordResult(matchId, score_a, score_b, winner_id);
      res.json(match);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to record result' });
    }
  }

  async getPlayerMatches(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

      const matches = await matchService.getPlayerMatches(playerId, limit);
      res.json({ matches, total: matches.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  }

  async getPlayerStats(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const stats = await matchService.getPlayerStats(playerId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  async cancelMatch(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const cancelled = await matchService.cancelMatch(matchId);

      if (!cancelled) {
        return res.status(404).json({ error: 'Match not found or already completed' });
      }

      res.json({ message: 'Match cancelled' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel match' });
    }
  }

  async getRecentMatches(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const matches = await matchService.getRecentMatches(limit);
      res.json({ matches, total: matches.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recent matches' });
    }
  }
}

export const matchController = new MatchController();
