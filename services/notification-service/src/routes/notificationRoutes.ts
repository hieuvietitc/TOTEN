import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';

const router = Router();

router.post('/', notificationController.createNotification.bind(notificationController));
router.get('/user/:userId', notificationController.getUserNotifications.bind(notificationController));
router.put('/:notificationId/read', notificationController.markAsRead.bind(notificationController));
router.put('/user/:userId/read-all', notificationController.markAllAsRead.bind(notificationController));
router.get('/user/:userId/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.get('/preference/:userId', notificationController.getPreference.bind(notificationController));
router.put('/preference/:userId', notificationController.updatePreference.bind(notificationController));
router.post('/broadcast', notificationController.broadcastNotification.bind(notificationController));

export default router;
