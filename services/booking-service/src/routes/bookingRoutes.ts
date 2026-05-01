import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';

const router = Router();

router.post('/', bookingController.createBooking.bind(bookingController));
router.get('/:bookingId', bookingController.getBooking.bind(bookingController));
router.get('/user/:userId', bookingController.getUserBookings.bind(bookingController));
router.delete('/:bookingId', bookingController.cancelBooking.bind(bookingController));
router.get('/check/availability', bookingController.checkAvailability.bind(bookingController));
router.get('/stats/overview', bookingController.getStats.bind(bookingController));

export default router;
