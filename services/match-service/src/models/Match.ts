export type MatchType = 'CASUAL' | 'RANKED' | 'TOURNAMENT';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  player_a_id: string;
  player_b_id: string;
  court_id?: number;
  club_id?: number;
  match_date: Date;
  match_type: MatchType;
  status: MatchStatus;
  score_a?: number;
  score_b?: number;
  winner_id?: string;
  qr_checkin?: boolean;
  gps_location?: string;
  confirmed_by_a?: boolean;
  confirmed_by_b?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MatchResult {
  match_id: string;
  score_a: number;
  score_b: number;
  winner_id: string;
  confirmed?: boolean;
}
