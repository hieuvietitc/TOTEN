import pool from '../config/database';
import { Membership, MembershipType, MEMBERSHIP_PRICING } from '../models/Membership';

export class MembershipService {
  async getMembership(userId: string): Promise<Membership | null> {
    const query = `
      SELECT * FROM membership
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  async createMembership(userId: string, type: MembershipType = 'FREE'): Promise<Membership> {
    const pricing = MEMBERSHIP_PRICING[type];
    const startDate = new Date();
    let expiryDate = null;

    if (type !== 'FREE' && pricing.duration_months > 0) {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + pricing.duration_months);
    }

    const query = `
      INSERT INTO membership (user_id, membership_type, start_date, expiry_date, payment_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      type,
      startDate,
      expiryDate,
      type === 'FREE' ? 'ACTIVE' : 'PENDING',
    ]);
    return result.rows[0];
  }

  async upgradeMembership(userId: string, newType: MembershipType): Promise<Membership> {
    const current = await this.getMembership(userId);

    if (current && current.membership_type === newType) {
      return current;
    }

    const pricing = MEMBERSHIP_PRICING[newType];
    const startDate = new Date();
    let expiryDate = null;

    if (newType !== 'FREE' && pricing.duration_months > 0) {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + pricing.duration_months);
    }

    const query = `
      UPDATE membership
      SET membership_type = $1,
          start_date = $2,
          expiry_date = $3,
          payment_status = $4,
          updated_at = NOW()
      WHERE user_id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [
      newType,
      startDate,
      expiryDate,
      newType === 'FREE' ? 'ACTIVE' : 'ACTIVE',
      userId,
    ]);
    return result.rows[0];
  }

  async renewMembership(userId: string): Promise<Membership> {
    const current = await this.getMembership(userId);
    if (!current) throw new Error('Membership not found');

    return this.upgradeMembership(userId, current.membership_type);
  }

  async checkMembershipValid(userId: string): Promise<boolean> {
    const membership = await this.getMembership(userId);
    if (!membership) return false;

    if (membership.membership_type === 'FREE') return true;
    if (membership.payment_status !== 'ACTIVE') return false;
    if (!membership.expiry_date) return true;

    return new Date() <= new Date(membership.expiry_date);
  }

  async getMembershipStats(): Promise<{ [key: string]: number }> {
    const query = `
      SELECT membership_type, COUNT(*) as count
      FROM membership
      GROUP BY membership_type
    `;
    const result = await pool.query(query);
    const stats: { [key: string]: number } = {};
    result.rows.forEach(row => {
      stats[row.membership_type] = parseInt(row.count);
    });
    return stats;
  }
}

export const membershipService = new MembershipService();
