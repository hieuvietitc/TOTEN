// ─── Shared TOTEN Types ───

export type MembershipType = 'FREE' | 'BASIC' | 'RANKED' | 'ELITE';
export type MatchType = 'CASUAL' | 'RANKED' | 'TOURNAMENT';
export type TournamentType = 'LOCAL' | 'CITY' | 'PROVINCIAL' | 'NATIONAL';
export type FraudSeverity = 'WARNING' | 'HOLD' | 'INVESTIGATION' | 'BANNED';
export type SponsorPackage = 'TITLE' | 'CITY' | 'EQUIPMENT' | 'DIGITAL';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const MEMBERSHIP_FEES: Record<MembershipType, number> = {
  FREE: 0,
  BASIC: 400_000,
  RANKED: 1_000_000,
  ELITE: 3_000_000,
};

export const EVENT_LEVEL_POINTS: Record<TournamentType, number> = {
  LOCAL: 1,
  CITY: 2,
  PROVINCIAL: 3,
  NATIONAL: 4,
};

export const RATING_TIERS = {
  BEGINNER:   { min: 1.0, max: 2.5 },
  AMATEUR:    { min: 2.6, max: 4.0 },
  CLUB_PLAYER: { min: 4.1, max: 6.0 },
  ADVANCED:   { min: 6.1, max: 8.0 },
  ELITE:      { min: 8.1, max: 10.0 },
} as const;

export const KPI_TARGETS_120_DAYS = {
  trial_players:   20_000,
  active_players:  10_000,
  paid_members:    5_000,
  clubs:           100,
  revenue_vnd:     15_000_000_000,
  tournaments:     120,
};
