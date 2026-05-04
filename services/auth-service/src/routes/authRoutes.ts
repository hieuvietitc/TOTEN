import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { verifyToken } from '../utils/tokenUtils';
import axios from 'axios';

const router = Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify', authController.verifyToken.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// GET /auth/me — decode token and return current user
router.get('/me', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  try {
    const r = await axios.get(`${USER_SERVICE_URL}/api/users/${decoded.userId}`);
    res.json({ data: r.data });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
