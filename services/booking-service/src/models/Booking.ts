export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW';

export interface Booking {
  id: string;
  user_id: string;
  court_id: number;
  booking_date: Date;
  start_time: string;
  end_time: string;
  price_amount: number;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

export interface BookingRequest {
  user_id: string;
  court_id: number;
  booking_date: Date;
  start_time: string;
  end_time: string;
}
