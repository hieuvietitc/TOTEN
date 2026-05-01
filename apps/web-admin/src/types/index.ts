export type MembershipType = 'FREE' | 'BASIC' | 'RANKED' | 'ELITE';
export type FraudSeverity = 'WARNING' | 'HOLD' | 'INVESTIGATION' | 'BANNED';
export type TournamentType = 'LOCAL' | 'CITY' | 'PROVINCIAL' | 'NATIONAL';
export type SponsorPackage = 'TITLE' | 'CITY' | 'EQUIPMENT' | 'DIGITAL';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  city?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  type: MembershipType;
  status: string;
  expires_at?: string;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  address: string;
  total_courts: number;
  is_verified: boolean;
  created_at: string;
}

export interface Court {
  id: string;
  club_id: string;
  name: string;
  surface_type: string;
  is_indoor: boolean;
  base_price: number;
  is_available: boolean;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  court_id?: string;
  match_type: string;
  status: string;
  winner_id?: string;
  score?: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  club_id: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  prize_pool: number;
  status: string;
}

export interface FraudAlert {
  id: string;
  user_id: string;
  rule_triggered: string;
  severity: FraudSeverity;
  description: string;
  status: string;
  created_at: string;
}

export interface Sponsorship {
  id: string;
  company_name: string;
  package_type: SponsorPackage;
  amount: number;
  status: string;
  start_date: string;
  end_date: string;
}

export interface DailyMetrics {
  new_signups: number;
  active_players: number;
  matches_played: number;
  revenue_vnd: number;
  fraud_alerts: number;
  date: string;
}

export interface NationalSnapshot {
  total_users: number;
  active_users: number;
  paid_members: number;
  total_clubs: number;
  total_matches: number;
  total_tournaments: number;
  total_revenue: number;
  membership_breakdown: Record<MembershipType, number>;
  weekly_signups: Array<{ week: string; count: number }>;
}

export interface KPIAlert {
  metric: string;
  current: number;
  target: number;
  pct: number;
  status: 'on_track' | 'at_risk' | 'critical';
}

export interface FinanceSummary {
  total_revenue: number;
  total_expense: number;
  net_profit: number;
  gross_margin: number;
  daily_trend: Array<{ date: string; revenue: number; expense: number }>;
  revenue_by_type: Record<string, number>;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}
