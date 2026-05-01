import { Router } from 'express';
import { sponsorController } from '../controllers/sponsorController';

const router = Router();

router.post('/', sponsorController.createSponsor.bind(sponsorController));
router.get('/', sponsorController.listSponsors.bind(sponsorController));
router.get('/summary', sponsorController.getFinancialSummary.bind(sponsorController));
router.post('/proposal', sponsorController.generateProposal.bind(sponsorController));
router.get('/:sponsorId', sponsorController.getSponsor.bind(sponsorController));
router.put('/:sponsorId/status', sponsorController.updateStatus.bind(sponsorController));
router.get('/:sponsorId/report', sponsorController.getReport.bind(sponsorController));

export default router;
