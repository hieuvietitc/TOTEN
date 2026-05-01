import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify', authController.verifyToken.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

export default router;
