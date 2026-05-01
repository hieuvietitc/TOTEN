export interface PlayerProfile {
  userId: string;
  rating: number;
  city: string;
  district?: string;
  availableSlots: string[]; // e.g. ["MON_18", "WED_20", "SAT_07"]
  recentOpponents: string[]; // last 10 opponent userIds
  matchGoal: 'CASUAL' | 'PRACTICE' | 'RANKED' | 'TOURNAMENT';
  matchesPlayed: number;
}

export interface MatchFitResult {
  playerAId: string;
  playerBId: string;
  mfsScore: number;
  breakdown: {
    skill: number;
    location: number;
    schedule: number;
    history: number;
    goal: number;
  };
  sharedSlots: string[];
  recommended: boolean;
}

export class MatchFitScoreEngine {
  private static readonly WEIGHTS = {
    skill: 0.30,
    location: 0.20,
    schedule: 0.20,
    history: 0.15,
    goal: 0.15,
  };

  static calculate(playerA: PlayerProfile, playerB: PlayerProfile): MatchFitResult {
    const skill = this.skillScore(playerA.rating, playerB.rating);
    const location = this.locationScore(playerA.city, playerB.city, playerA.district, playerB.district);
    const schedule = this.scheduleScore(playerA.availableSlots, playerB.availableSlots);
    const history = this.historyScore(playerA.userId, playerB.userId, playerA.recentOpponents);
    const goal = this.goalScore(playerA.matchGoal, playerB.matchGoal);

    const sharedSlots = playerA.availableSlots.filter(s => playerB.availableSlots.includes(s));

    const mfsScore = parseFloat((
      skill * this.WEIGHTS.skill +
      location * this.WEIGHTS.location +
      schedule * this.WEIGHTS.schedule +
      history * this.WEIGHTS.history +
      goal * this.WEIGHTS.goal
    ).toFixed(3));

    return {
      playerAId: playerA.userId,
      playerBId: playerB.userId,
      mfsScore,
      breakdown: { skill, location, schedule, history, goal },
      sharedSlots,
      recommended: mfsScore >= 0.65,
    };
  }

  // 30% weight: closer rating = higher score
  private static skillScore(ratingA: number, ratingB: number): number {
    const diff = Math.abs(ratingA - ratingB);
    if (diff <= 0.3) return 1.0;
    if (diff <= 0.7) return 0.85;
    if (diff <= 1.2) return 0.65;
    if (diff <= 2.0) return 0.40;
    return 0.15;
  }

  // 20% weight: same city > same district > different city
  private static locationScore(
    cityA: string,
    cityB: string,
    districtA?: string,
    districtB?: string
  ): number {
    if (cityA !== cityB) return 0.2;
    if (districtA && districtB && districtA === districtB) return 1.0;
    return 0.75;
  }

  // 20% weight: more shared time slots = higher score
  private static scheduleScore(slotsA: string[], slotsB: string[]): number {
    if (slotsA.length === 0 || slotsB.length === 0) return 0.0;
    const shared = slotsA.filter(s => slotsB.includes(s)).length;
    const ratio = shared / Math.min(slotsA.length, slotsB.length);
    return Math.min(1.0, ratio * 1.2);
  }

  // 15% weight: haven't played recently = better
  private static historyScore(
    playerAId: string,
    playerBId: string,
    recentOpponents: string[]
  ): number {
    const lastMatchIndex = recentOpponents.indexOf(playerBId);
    if (lastMatchIndex === -1) return 1.0;
    if (lastMatchIndex >= 7) return 0.8;
    if (lastMatchIndex >= 4) return 0.5;
    return 0.2;
  }

  // 15% weight: same goal = perfect match
  private static goalScore(goalA: string, goalB: string): number {
    if (goalA === goalB) return 1.0;
    const compatible: Record<string, string[]> = {
      RANKED: ['RANKED', 'PRACTICE'],
      PRACTICE: ['PRACTICE', 'CASUAL', 'RANKED'],
      CASUAL: ['CASUAL', 'PRACTICE'],
      TOURNAMENT: ['TOURNAMENT', 'RANKED'],
    };
    return compatible[goalA]?.includes(goalB) ? 0.65 : 0.2;
  }

  static rankCandidates(
    targetPlayer: PlayerProfile,
    candidates: PlayerProfile[]
  ): MatchFitResult[] {
    return candidates
      .filter(c => c.userId !== targetPlayer.userId)
      .map(c => this.calculate(targetPlayer, c))
      .sort((a, b) => b.mfsScore - a.mfsScore);
  }
}
