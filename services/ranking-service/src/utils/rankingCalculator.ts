export class RankingCalculator {
  private static readonly BASE_POINTS = 10;

  static getEventLevelMultiplier(eventLevel: 1 | 2 | 3 | 4): number {
    const multipliers: Record<number, number> = {
      1: 1.0, // Local
      2: 1.5, // City
      3: 2.0, // Provincial
      4: 3.0, // National
    };
    return multipliers[eventLevel] || 1.0;
  }

  static getOpponentStrengthFactor(playerRating: number, opponentRating: number): number {
    const diff = Math.abs(opponentRating - playerRating);
    if (diff < 2.0) return 1.0;
    return opponentRating / playerRating;
  }

  static getResultFactor(won: boolean): number {
    return won ? 2.0 : 0;
  }

  static calculateMatchPoints(
    playerRating: number,
    opponentRating: number,
    eventLevel: 1 | 2 | 3 | 4,
    won: boolean
  ): number {
    const eventMultiplier = this.getEventLevelMultiplier(eventLevel);
    const opponentFactor = this.getOpponentStrengthFactor(playerRating, opponentRating);
    const resultFactor = this.getResultFactor(won);

    const points = this.BASE_POINTS * eventMultiplier * opponentFactor * resultFactor;
    return Math.round(points);
  }

  static updateRankingPoints(
    currentPoints: number,
    newPoints: number,
    isInTopResults: boolean
  ): number {
    if (!isInTopResults) {
      return currentPoints;
    }
    return currentPoints + newPoints;
  }

  static getRankPosition(userPoints: number, allUserPoints: number[]): number {
    const sorted = [...allUserPoints].sort((a, b) => b - a);
    return sorted.findIndex(p => p === userPoints) + 1;
  }
}
