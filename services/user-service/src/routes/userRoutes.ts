import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.get('/:id', userController.getUser.bind(userController));
router.get('/', userController.listUsers.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));
router.get('/check/email', userController.checkEmailExists.bind(userController));

export default router;
