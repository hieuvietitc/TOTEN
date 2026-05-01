import { Request, Response } from 'express';
import { sponsorService } from '../services/sponsorService';

export class SponsorController {
  async createSponsor(req: Request, res: Response) {
    try {
      const { sponsor_name, contact_email, industry, package_type, amount_vnd, start_date, end_date } = req.body;

      if (!sponsor_name || !contact_email || !package_type || !amount_vnd || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const sponsor = await sponsorService.createSponsor({
        sponsor_name,
        contact_email,
        industry,
        package_type,
        amount_vnd,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: 'NEGOTIATING',
        benefits: [],
      });

      res.status(201).json(sponsor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create sponsor' });
    }
  }

  async getSponsor(req: Request, res: Response) {
    try {
      const { sponsorId } = req.params;
      const sponsor = await sponsorService.getSponsor(sponsorId);

      if (!sponsor) {
        return res.status(404).json({ error: 'Sponsor not found' });
      }

      res.json(sponsor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sponsor' });
    }
  }

  async listSponsors(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const sponsors = await sponsorService.listSponsors(status as any);
      res.json({ sponsors, total: sponsors.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list sponsors' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { sponsorId } = req.params;
      const { status } = req.body;

      const sponsor = await sponsorService.updateStatus(sponsorId, status);
      res.json(sponsor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update sponsor' });
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const { sponsorId } = req.params;
      const period = (req.query.period as string) || new Date().toISOString().slice(0, 7);

      const report = await sponsorService.generateReport(sponsorId, period);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to generate report' });
    }
  }

  async generateProposal(req: Request, res: Response) {
    try {
      const { industry } = req.body;

      if (!industry) {
        return res.status(400).json({ error: 'industry required' });
      }

      const proposal = await sponsorService.generateProposal(industry);
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate proposal' });
    }
  }

  async getFinancialSummary(req: Request, res: Response) {
    try {
      const summary = await sponsorService.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch financial summary' });
    }
  }
}

export const sponsorController = new SponsorController();
