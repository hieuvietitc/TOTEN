export type TournamentStatus = 'PLANNING' | 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED';
export type TournamentType = 'LOCAL' | 'CITY' | 'PROVINCIAL' | 'NATIONAL';

export interface Tournament {
  id: string;
  name: string;
  city: string;
  start_date: Date;
  end_date: Date;
  club_id?: number;
  tournament_type: TournamentType;
  status: TournamentStatus;
  max_players?: number;
  entry_fee?: number;
  created_at: Date;
  updated_at: Date;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  registered_at: Date;
  seeding_rank: number;
  group?: string;
  status: 'REGISTERED' | 'WITHDRAWN' | 'COMPLETED';
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  player_a_id: string;
  player_b_id: string;
  match_date?: Date;
  score_a?: number;
  score_b?: number;
  winner_id?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}
