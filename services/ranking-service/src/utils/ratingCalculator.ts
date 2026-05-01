export class RatingCalculator {
  private static readonly K_VALUES = {
    INITIAL: 32,
    MID: 24,
    HIGH: 16,
  };

  static getKFactor(matchesPlayed: number): number {
    if (matchesPlayed < 10) return this.K_VALUES.INITIAL;
    if (matchesPlayed < 50) return this.K_VALUES.MID;
    return this.K_VALUES.HIGH;
  }

  static calculateExpectedScore(playerRating: number, opponentRating: number): number {
    const diff = opponentRating - playerRating;
    return 1 / (1 + Math.pow(10, diff / 400));
  }

  static getGameFactor(pointDiff: number): number {
    if (pointDiff < 5) return 1.0;
    return 1.5;
  }

  static getConfidenceFactor(hasQRCheckin: boolean, dualConfirmed: boolean): number {
    if (hasQRCheckin && dualConfirmed) return 1.0;
    if (dualConfirmed) return 0.8;
    return 0.5;
  }

  static calculateNewRating(
    playerRating: number,
    opponentRating: number,
    result: number, // 1 = win, 0.5 = draw, 0 = loss
    matchesPlayed: number,
    pointDiff: number,
    hasQRCheckin: boolean,
    dualConfirmed: boolean
  ): number {
    const K = this.getKFactor(matchesPlayed);
    const expectedScore = this.calculateExpectedScore(playerRating, opponentRating);
    const gameMultiplier = result > 0 ? this.getGameFactor(pointDiff) : 0.5;
    const confidenceFactor = this.getConfidenceFactor(hasQRCheckin, dualConfirmed);

    const ratingChange = K * (result - expectedScore) * gameMultiplier * confidenceFactor;
    const newRating = playerRating + ratingChange;

    return Math.max(1.0, Math.min(10.0, parseFloat(newRating.toFixed(2))));
  }
}
