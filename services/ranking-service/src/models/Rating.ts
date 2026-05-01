export interface Rating {
  id: number;
  user_id: string;
  rating_value: number;
  tier: string;
  matches_played: number;
  last_updated: Date;
  created_at: Date;
}

export interface Ranking {
  id: number;
  user_id: string;
  ranking_points: number;
  rank_position: number;
  period: string;
  last_updated: Date;
  created_at: Date;
}

export const RATING_TIERS = {
  BEGINNER: { min: 1.0, max: 2.5, name: 'Beginner' },
  AMATEUR: { min: 2.6, max: 4.0, name: 'Amateur' },
  CLUB_PLAYER: { min: 4.1, max: 6.0, name: 'Club Player' },
  ADVANCED: { min: 6.1, max: 8.0, name: 'Advanced' },
  ELITE: { min: 8.1, max: 10.0, name: 'Elite' },
};

export const getTierFromRating = (rating: number): string => {
  if (rating <= 2.5) return 'BEGINNER';
  if (rating <= 4.0) return 'AMATEUR';
  if (rating <= 6.0) return 'CLUB_PLAYER';
  if (rating <= 8.0) return 'ADVANCED';
  return 'ELITE';
};
