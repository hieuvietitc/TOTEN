import pool from '../config/database';
import { Booking, BookingRequest } from '../models/Booking';
import { v4 as uuidv4 } from 'uuid';

const BASE_PRICE_VND = 100000;

export class BookingService {
  async createBooking(req: BookingRequest): Promise<Booking> {
    const { user_id, court_id, booking_date, start_time, end_time } = req;

    const isAvailable = await this.checkCourtAvailability(court_id, booking_date, start_time, end_time);
    if (!isAvailable) {
      throw new Error('Court not available for this time slot');
    }

    const price = this.calculatePrice(booking_date, start_time);

    const query = `
      INSERT INTO court_bookings (id, user_id, court_id, booking_date, start_time, end_time, price_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      uuidv4(),
      user_id,
      court_id,
      booking_date,
      start_time,
      end_time,
      price,
      'CONFIRMED',
    ]);

    return result.rows[0];
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    const query = 'SELECT * FROM court_bookings WHERE id = $1';
    const result = await pool.query(query, [bookingId]);
    return result.rows[0] || null;
  }

  async getUserBookings(userId: string, limit = 50): Promise<Booking[]> {
    const query = `
      SELECT * FROM court_bookings
      WHERE user_id = $1
      ORDER BY booking_date DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    const query = `
      UPDATE court_bookings
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE id = $1
    `;
    const result = await pool.query(query, [bookingId]);
    return result.rowCount! > 0;
  }

  async checkCourtAvailability(
    courtId: number,
    bookingDate: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count FROM court_bookings
      WHERE court_id = $1
        AND booking_date = $2
        AND status = 'CONFIRMED'
        AND NOT (end_time <= $3 OR start_time >= $4)
    `;
    const result = await pool.query(query, [courtId, bookingDate, startTime, endTime]);
    return parseInt(result.rows[0].count) === 0;
  }

  private calculatePrice(bookingDate: Date, startTime: string): number {
    const date = new Date(bookingDate);
    const hour = parseInt(startTime.split(':')[0]);
    const dayOfWeek = date.getDay();

    let multiplier = 1.0;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      multiplier = 1.2;
    }

    if (hour >= 18 && hour <= 21) {
      multiplier *= 1.3;
    } else if (hour < 9 || hour > 22) {
      multiplier *= 0.8;
    }

    return Math.round(BASE_PRICE_VND * multiplier);
  }

  async getCourtStats(clubId?: number): Promise<{ total_bookings: number; avg_occupancy: number }> {
    const whereClause = clubId ? 'WHERE c.club_id = $1' : '';
    const params = clubId ? [clubId] : [];

    const query = `
      SELECT
        COUNT(*) as total_bookings,
        ROUND(AVG(CASE WHEN cb.status = 'CONFIRMED' THEN 1 ELSE 0 END) * 100) as avg_occupancy
      FROM court_bookings cb
      JOIN courts c ON cb.court_id = c.id
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    return {
      total_bookings: parseInt(result.rows[0].total_bookings),
      avg_occupancy: parseInt(result.rows[0].avg_occupancy) || 0,
    };
  }
}

export const bookingService = new BookingService();
