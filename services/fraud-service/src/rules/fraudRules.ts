import { AlertSeverity } from '../models/FraudAlert';

export interface RuleResult {
  triggered: boolean;
  type: string;
  severity: AlertSeverity;
  description: string;
  evidence: Record<string, any>;
}

// Rule 1: Không có QR check-in → tạm giữ điểm
export function checkNoQRCheckin(hasQRCheckin: boolean, matchId: string): RuleResult {
  const triggered = !hasQRCheckin;
  return {
    triggered,
    type: 'NO_QR_CHECKIN',
    severity: 'HOLD',
    description: 'Match result submitted without physical QR check-in at court',
    evidence: { match_id: matchId, has_qr_checkin: hasQRCheckin },
  };
}

// Rule 2: Không có xác nhận 2 chiều → nhắc nhở
export function checkNoDualConfirmation(dualConfirmed: boolean, matchId: string): RuleResult {
  const triggered = !dualConfirmed;
  return {
    triggered,
    type: 'NO_DUAL_CONFIRMATION',
    severity: 'WARNING',
    description: 'Match result not confirmed by both players',
    evidence: { match_id: matchId, dual_confirmed: dualConfirmed },
  };
}

// Rule 3: Chênh lệch rating quá lớn mà thắng lớn → bất thường
export function checkRatingAnomaly(
  winnerRating: number,
  loserRating: number,
  scoreWinner: number,
  scoreLoser: number
): RuleResult {
  const ratingDiff = Math.abs(winnerRating - loserRating);
  const scoreDiff = Math.abs(scoreWinner - scoreLoser);
  const lowRatedWon = winnerRating < loserRating - 3.0;
  const triggered = lowRatedWon && scoreDiff > 5;

  return {
    triggered,
    type: 'RATING_ANOMALY',
    severity: 'INVESTIGATION',
    description: `Low-rated player won with unusual score difference`,
    evidence: {
      winner_rating: winnerRating,
      loser_rating: loserRating,
      rating_diff: ratingDiff,
      score_diff: scoreDiff,
    },
  };
}

// Rule 4: Trận quá nhanh → không hợp lệ
export function checkMatchDuration(durationMinutes?: number, matchId?: string): RuleResult {
  const triggered = durationMinutes !== undefined && durationMinutes < 10;
  return {
    triggered,
    type: 'TOO_SHORT_MATCH',
    severity: 'HOLD',
    description: `Match completed in unusually short time (${durationMinutes} min)`,
    evidence: { match_id: matchId, duration_minutes: durationMinutes },
  };
}

// Rule 5: Cùng 2 người đánh nhau quá nhiều trong tuần
export function checkFrequentPairing(pairingCountThisWeek: number, playerAId: string, playerBId: string): RuleResult {
  const triggered = pairingCountThisWeek >= 5;
  return {
    triggered,
    type: 'FREQUENT_PAIRING',
    severity: pairingCountThisWeek >= 8 ? 'INVESTIGATION' : 'WARNING',
    description: `Players paired ${pairingCountThisWeek} times this week — possible point farming`,
    evidence: { player_a: playerAId, player_b: playerBId, count_this_week: pairingCountThisWeek },
  };
}

// Rule 6: Rating tăng quá nhanh
export function checkRatingVelocity(ratingGainLast7Days: number, userId: string): RuleResult {
  const triggered = ratingGainLast7Days > 1.5;
  return {
    triggered,
    type: 'RATING_VELOCITY',
    severity: ratingGainLast7Days > 2.5 ? 'INVESTIGATION' : 'WARNING',
    description: `Rating increased by ${ratingGainLast7Days.toFixed(2)} in last 7 days`,
    evidence: { user_id: userId, rating_gain_7d: ratingGainLast7Days },
  };
}
