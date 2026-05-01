export type AlertSeverity = 'WARNING' | 'HOLD' | 'INVESTIGATION' | 'BANNED';
export type AlertStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED';

export interface FraudAlert {
  id: string;
  match_id?: string;
  user_id: string;
  alert_type: string;
  severity: AlertSeverity;
  description: string;
  evidence: Record<string, any>;
  status: AlertStatus;
  reviewer_id?: string;
  resolution_note?: string;
  created_at: Date;
  resolved_at?: Date;
}

export interface FraudCheck {
  userId: string;
  matchId?: string;
  matchData?: {
    scoreA: number;
    scoreB: number;
    hasQRCheckin: boolean;
    dualConfirmed: boolean;
    ratingA: number;
    ratingB: number;
    matchDurationMinutes?: number;
  };
}

export interface FraudCheckResult {
  isSuspicious: boolean;
  alerts: Array<{
    type: string;
    severity: AlertSeverity;
    description: string;
    evidence: Record<string, any>;
  }>;
}
