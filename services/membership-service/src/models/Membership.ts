export type MembershipType = 'FREE' | 'BASIC' | 'RANKED' | 'ELITE';
export type PaymentStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Membership {
  id: number;
  user_id: string;
  membership_type: MembershipType;
  start_date: Date;
  expiry_date?: Date;
  payment_status: PaymentStatus;
  payment_method?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MembershipPricing {
  type: MembershipType;
  price_vnd: number;
  duration_months: number;
  benefits: string[];
}

export const MEMBERSHIP_PRICING: Record<MembershipType, MembershipPricing> = {
  FREE: {
    type: 'FREE',
    price_vnd: 0,
    duration_months: 0,
    benefits: ['View ranking', 'Trial play', 'No points earned'],
  },
  BASIC: {
    type: 'BASIC',
    price_vnd: 400000,
    duration_months: 12,
    benefits: ['Earn ranking points', 'Join official tournaments', 'Court discounts'],
  },
  RANKED: {
    type: 'RANKED',
    price_vnd: 1000000,
    duration_months: 12,
    benefits: ['All BASIC benefits', 'Tournament priority', 'Performance analysis', 'Certified coach access'],
  },
  ELITE: {
    type: 'ELITE',
    price_vnd: 3000000,
    duration_months: 12,
    benefits: ['All RANKED benefits', 'Premium league access', 'VIP events', 'Sponsor perks'],
  },
};
