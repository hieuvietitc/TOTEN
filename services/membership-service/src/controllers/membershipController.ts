import { Request, Response } from 'express';
import { membershipService } from '../services/membershipService';
import { MembershipType } from '../models/Membership';

export class MembershipController {
  async getMembership(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const membership = await membershipService.getMembership(userId);

      if (!membership) {
        return res.status(404).json({ error: 'Membership not found' });
      }

      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch membership' });
    }
  }

  async createMembership(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { type } = req.body;

      const membership = await membershipService.createMembership(
        userId,
        (type as MembershipType) || 'FREE'
      );

      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create membership' });
    }
  }

  async upgradeMembership(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { type } = req.body;

      if (!type || !['FREE', 'BASIC', 'RANKED', 'ELITE'].includes(type)) {
        return res.status(400).json({ error: 'Invalid membership type' });
      }

      const membership = await membershipService.upgradeMembership(userId, type as MembershipType);
      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: 'Failed to upgrade membership' });
    }
  }

  async checkValid(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const valid = await membershipService.checkMembershipValid(userId);
      res.json({ userId, valid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate membership' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await membershipService.getMembershipStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

export const membershipController = new MembershipController();
