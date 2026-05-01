import { Router } from 'express';
import { membershipController } from '../controllers/membershipController';

const router = Router();

router.get('/:userId', membershipController.getMembership.bind(membershipController));
router.post('/:userId', membershipController.createMembership.bind(membershipController));
router.put('/:userId', membershipController.upgradeMembership.bind(membershipController));
router.get('/:userId/valid', membershipController.checkValid.bind(membershipController));
router.get('/stats/overview', membershipController.getStats.bind(membershipController));

export default router;
