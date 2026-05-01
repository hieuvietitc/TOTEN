import pool from '../config/database';
import { Tournament, TournamentParticipant, TournamentMatch, TournamentStatus } from '../models/Tournament';
import { v4 as uuidv4 } from 'uuid';

export class TournamentService {
  async createTournament(data: {
    name: string;
    city: string;
    start_date: Date;
    end_date: Date;
    tournament_type: 'LOCAL' | 'CITY' | 'PROVINCIAL' | 'NATIONAL';
    club_id?: number;
    max_players?: number;
    entry_fee?: number;
  }): Promise<Tournament> {
    const query = `
      INSERT INTO tournaments (id, name, city, start_date, end_date, club_id, tournament_type, status, max_players, entry_fee)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      uuidv4(),
      data.name,
      data.city,
      data.start_date,
      data.end_date,
      data.club_id || null,
      data.tournament_type,
      'PLANNING',
      data.max_players || null,
      data.entry_fee || 0,
    ]);

    return result.rows[0];
  }

  async getTournament(tournamentId: string): Promise<Tournament | null> {
    const query = 'SELECT * FROM tournaments WHERE id = $1';
    const result = await pool.query(query, [tournamentId]);
    return result.rows[0] || null;
  }

  async updateTournamentStatus(tournamentId: string, status: TournamentStatus): Promise<Tournament> {
    const query = `
      UPDATE tournaments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, tournamentId]);
    return result.rows[0];
  }

  async registerParticipant(tournamentId: string, userId: string): Promise<TournamentParticipant> {
    const existingQuery = `
      SELECT * FROM tournament_participants
      WHERE tournament_id = $1 AND user_id = $2
    `;
    const existing = await pool.query(existingQuery, [tournamentId, userId]);

    if (existing.rows.length > 0) {
      throw new Error('User already registered');
    }

    const query = `
      INSERT INTO tournament_participants (id, tournament_id, user_id, registered_at, seeding_rank, status)
      VALUES ($1, $2, $3, NOW(), 0, 'REGISTERED')
      RETURNING *
    `;

    const result = await pool.query(query, [uuidv4(), tournamentId, userId]);
    return result.rows[0];
  }

  async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    const query = `
      SELECT * FROM tournament_participants
      WHERE tournament_id = $1 AND status = 'REGISTERED'
      ORDER BY registered_at
    `;
    const result = await pool.query(query, [tournamentId]);
    return result.rows;
  }

  async createMatch(
    tournamentId: string,
    playerAId: string,
    playerBId: string,
    round: number
  ): Promise<TournamentMatch> {
    const query = `
      INSERT INTO tournament_matches (id, tournament_id, player_a_id, player_b_id, round, status)
      VALUES ($1, $2, $3, $4, $5, 'SCHEDULED')
      RETURNING *
    `;

    const result = await pool.query(query, [uuidv4(), tournamentId, playerAId, playerBId, round]);
    return result.rows[0];
  }

  async getTournamentMatches(tournamentId: string, round?: number): Promise<TournamentMatch[]> {
    let query = 'SELECT * FROM tournament_matches WHERE tournament_id = $1';
    const params: any[] = [tournamentId];

    if (round !== undefined) {
      query += ` AND round = $2`;
      params.push(round);
    }

    query += ' ORDER BY round, id';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async recordMatchResult(
    matchId: string,
    scoreA: number,
    scoreB: number,
    winnerId: string
  ): Promise<TournamentMatch> {
    const query = `
      UPDATE tournament_matches
      SET score_a = $1, score_b = $2, winner_id = $3, status = 'COMPLETED'
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [scoreA, scoreB, winnerId, matchId]);
    return result.rows[0];
  }

  async getTournamentStats(tournamentId: string): Promise<{
    total_participants: number;
    total_matches: number;
    completed_matches: number;
  }> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1 AND status = 'REGISTERED') as total_participants,
        (SELECT COUNT(*) FROM tournament_matches WHERE tournament_id = $1) as total_matches,
        (SELECT COUNT(*) FROM tournament_matches WHERE tournament_id = $1 AND status = 'COMPLETED') as completed_matches
    `;

    const result = await pool.query(query, [tournamentId]);
    return {
      total_participants: parseInt(result.rows[0].total_participants),
      total_matches: parseInt(result.rows[0].total_matches),
      completed_matches: parseInt(result.rows[0].completed_matches),
    };
  }

  async listTournaments(status?: TournamentStatus, limit = 50): Promise<Tournament[]> {
    let query = 'SELECT * FROM tournaments';
    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
      query += ` ORDER BY start_date DESC LIMIT ${limit}`;
    } else {
      query += ` ORDER BY start_date DESC LIMIT ${limit}`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export const tournamentService = new TournamentService();
