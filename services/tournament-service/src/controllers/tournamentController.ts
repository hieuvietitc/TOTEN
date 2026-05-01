import { Request, Response } from 'express';
import { tournamentService } from '../services/tournamentService';

export class TournamentController {
  async createTournament(req: Request, res: Response) {
    try {
      const { name, city, start_date, end_date, tournament_type, club_id, max_players, entry_fee } = req.body;

      if (!name || !city || !start_date || !end_date || !tournament_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const tournament = await tournamentService.createTournament({
        name,
        city,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        tournament_type,
        club_id,
        max_players,
        entry_fee,
      });

      res.status(201).json(tournament);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tournament' });
    }
  }

  async getTournament(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;
      const tournament = await tournamentService.getTournament(tournamentId);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tournament' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status required' });
      }

      const tournament = await tournamentService.updateTournamentStatus(tournamentId, status);
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tournament' });
    }
  }

  async registerParticipant(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id required' });
      }

      const participant = await tournamentService.registerParticipant(tournamentId, user_id);
      res.status(201).json(participant);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to register' });
    }
  }

  async getParticipants(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;
      const participants = await tournamentService.getParticipants(tournamentId);
      res.json({ participants, total: participants.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  }

  async getMatches(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;
      const round = req.query.round ? parseInt(req.query.round as string) : undefined;

      const matches = await tournamentService.getTournamentMatches(tournamentId, round);
      res.json({ matches, total: matches.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  }

  async recordResult(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { score_a, score_b, winner_id } = req.body;

      if (score_a === undefined || score_b === undefined || !winner_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const match = await tournamentService.recordMatchResult(matchId, score_a, score_b, winner_id);
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record result' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { tournamentId } = req.params;
      const stats = await tournamentService.getTournamentStats(tournamentId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  async listTournaments(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

      const tournaments = await tournamentService.listTournaments(status as any, limit);
      res.json({ tournaments, total: tournaments.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list tournaments' });
    }
  }
}

export const tournamentController = new TournamentController();
