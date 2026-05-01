import { Request, Response } from 'express';
import { matchmakingService } from './matchmakingService';

export class MatchmakingController {
  async findMatches(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { city, match_goal, available_slots, limit } = req.query;

      const matches = await matchmakingService.findMatches(userId, {
        city: city as string,
        matchGoal: match_goal as 'CASUAL' | 'PRACTICE' | 'RANKED' | 'TOURNAMENT',
        availableSlots: available_slots ? (available_slots as string).split(',') : undefined,
        limit: limit ? parseInt(limit as string) : 10,
      });

      const recommended = matches.filter(m => m.recommended);

      res.json({
        userId,
        total: matches.length,
        recommended: recommended.length,
        matches: matches.slice(0, parseInt(limit as string) || 10),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Matchmaking failed' });
    }
  }

  async calculateMFS(req: Request, res: Response) {
    try {
      const { playerA, playerB } = req.body;

      if (!playerA || !playerB) {
        return res.status(400).json({ error: 'playerA and playerB profiles required' });
      }

      const { MatchFitScoreEngine } = await import('./matchFitScore');
      const result = MatchFitScoreEngine.calculate(playerA, playerB);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'MFS calculation failed' });
    }
  }
}

export const matchmakingController = new MatchmakingController();
