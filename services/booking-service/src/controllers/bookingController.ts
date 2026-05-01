import { Request, Response } from 'express';
import { bookingService } from '../services/bookingService';

export class BookingController {
  async createBooking(req: Request, res: Response) {
    try {
      const { user_id, court_id, booking_date, start_time, end_time } = req.body;

      if (!user_id || !court_id || !booking_date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const booking = await bookingService.createBooking({
        user_id,
        court_id,
        booking_date: new Date(booking_date),
        start_time,
        end_time,
      });

      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create booking' });
    }
  }

  async getBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const booking = await bookingService.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const bookings = await bookingService.getUserBookings(userId, limit);

      res.json({ bookings, total: bookings.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const cancelled = await bookingService.cancelBooking(bookingId);

      if (!cancelled) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json({ message: 'Booking cancelled' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }

  async checkAvailability(req: Request, res: Response) {
    try {
      const { court_id, booking_date, start_time, end_time } = req.query;

      if (!court_id || !booking_date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required query parameters' });
      }

      const available = await bookingService.checkCourtAvailability(
        parseInt(court_id as string),
        new Date(booking_date as string),
        start_time as string,
        end_time as string
      );

      res.json({ available });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check availability' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const clubId = req.query.club_id ? parseInt(req.query.club_id as string) : undefined;
      const stats = await bookingService.getCourtStats(clubId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

export const bookingController = new BookingController();
