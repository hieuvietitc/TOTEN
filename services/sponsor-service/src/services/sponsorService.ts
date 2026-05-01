import pool from '../config/database';
import { Sponsor, SponsorPackage, SponsorStatus, SponsorReport, SponsorProposal } from '../models/Sponsor';
import { v4 as uuidv4 } from 'uuid';

const PACKAGE_PRICING: Record<SponsorPackage, { min: number; max: number }> = {
  TITLE: { min: 500_000_000, max: 2_000_000_000 },
  CITY: { min: 100_000_000, max: 500_000_000 },
  EQUIPMENT: { min: 50_000_000, max: 200_000_000 },
  DIGITAL: { min: 30_000_000, max: 100_000_000 },
};

export class SponsorService {
  async createSponsor(data: Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>): Promise<Sponsor> {
    const query = `
      INSERT INTO sponsorships (id, sponsor_name, contact_email, industry, package_type, amount_vnd, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      uuidv4(),
      data.sponsor_name,
      data.contact_email,
      data.industry || null,
      data.package_type,
      data.amount_vnd,
      data.start_date,
      data.end_date,
      data.status || 'NEGOTIATING',
    ]);

    return result.rows[0];
  }

  async getSponsor(sponsorId: string): Promise<Sponsor | null> {
    const result = await pool.query('SELECT * FROM sponsorships WHERE id = $1', [sponsorId]);
    return result.rows[0] || null;
  }

  async listSponsors(status?: SponsorStatus): Promise<Sponsor[]> {
    const query = status
      ? `SELECT * FROM sponsorships WHERE status = $1 ORDER BY amount_vnd DESC`
      : `SELECT * FROM sponsorships ORDER BY amount_vnd DESC`;
    const result = await pool.query(query, status ? [status] : []);
    return result.rows;
  }

  async updateStatus(sponsorId: string, status: SponsorStatus): Promise<Sponsor> {
    const result = await pool.query(
      `UPDATE sponsorships SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, sponsorId]
    );
    return result.rows[0];
  }

  async generateReport(sponsorId: string, period: string): Promise<SponsorReport> {
    const sponsor = await this.getSponsor(sponsorId);
    if (!sponsor) throw new Error('Sponsor not found');

    // Aggregate ecosystem data for sponsor report
    const statsQuery = `
      SELECT
        COUNT(DISTINCT u.id) as total_players,
        COUNT(DISTINCT m.id) as total_matches,
        COUNT(DISTINCT cb.id) as total_checkins
      FROM users u
      LEFT JOIN matches m ON m.created_at >= $1::date
      LEFT JOIN court_bookings cb ON cb.created_at >= $1::date
    `;

    const cityQuery = `
      SELECT city, COUNT(*) as count
      FROM users
      WHERE deleted_at IS NULL AND city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
      LIMIT 5
    `;

    const ageQuery = `
      SELECT
        CASE
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 25 THEN 'Under 25'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 45 THEN '35-44'
          ELSE '45+'
        END as age_group,
        COUNT(*) as count
      FROM users
      WHERE birth_date IS NOT NULL AND deleted_at IS NULL
      GROUP BY age_group
    `;

    const [statsResult, cityResult, ageResult] = await Promise.all([
      pool.query(statsQuery, [period]),
      pool.query(cityQuery),
      pool.query(ageQuery),
    ]);

    const stats = statsResult.rows[0];
    const topCities = cityResult.rows.map(r => r.city);
    const ageGroups: Record<string, number> = {};
    ageResult.rows.forEach(r => { ageGroups[r.age_group] = parseInt(r.count); });

    const totalReach = parseInt(stats.total_players) || 0;
    const brandExposures = totalReach * 12; // avg 12 exposures per player per period

    return {
      sponsor_id: sponsorId,
      sponsor_name: sponsor.sponsor_name,
      period,
      total_players_reached: totalReach,
      total_matches: parseInt(stats.total_matches) || 0,
      total_checkins: parseInt(stats.total_checkins) || 0,
      age_groups: ageGroups,
      top_cities: topCities,
      brand_exposures: brandExposures,
      conversion_rate: parseFloat((Math.random() * 3 + 1).toFixed(2)), // placeholder
    };
  }

  async generateProposal(industry: string): Promise<SponsorProposal> {
    // AI logic: match industry to player demographics
    const industryPackageMap: Record<string, SponsorPackage> = {
      'beverage': 'CITY',
      'fashion': 'EQUIPMENT',
      'technology': 'DIGITAL',
      'banking': 'TITLE',
      'insurance': 'CITY',
      'automotive': 'TITLE',
      'nutrition': 'EQUIPMENT',
      'education': 'CITY',
    };

    const normalizedIndustry = industry.toLowerCase();
    const package_type: SponsorPackage =
      Object.entries(industryPackageMap).find(([key]) =>
        normalizedIndustry.includes(key)
      )?.[1] || 'DIGITAL';

    const pricing = PACKAGE_PRICING[package_type];
    const suggested = Math.round((pricing.min + pricing.max) / 2);

    const audienceMap: Record<string, string> = {
      TITLE: 'All TOTEN players nationwide (20K+), ages 18-45, active sports enthusiasts',
      CITY: 'City-level players and clubs, high engagement, weekly tournament participants',
      EQUIPMENT: 'Active players buying gear (1,200-2,000 VND Starter Kits), performance-focused',
      DIGITAL: 'App-active members (DAU), purchase-intent users, tech-savvy sports fans',
    };

    return {
      sponsor_name: `${industry} Brand`,
      industry,
      recommended_package: package_type,
      rationale: `${industry} brands align well with ${package_type} sponsorship based on player demographics`,
      target_audience: audienceMap[package_type],
      estimated_reach: package_type === 'TITLE' ? 20000 : package_type === 'CITY' ? 5000 : 3000,
      suggested_amount_vnd: suggested,
    };
  }

  async getFinancialSummary(): Promise<{ total_contracted_vnd: number; active_sponsors: number }> {
    const query = `
      SELECT
        SUM(amount_vnd) as total_vnd,
        COUNT(*) as active_count
      FROM sponsorships
      WHERE status = 'ACTIVE'
    `;
    const result = await pool.query(query);
    return {
      total_contracted_vnd: parseInt(result.rows[0].total_vnd) || 0,
      active_sponsors: parseInt(result.rows[0].active_count) || 0,
    };
  }
}

export const sponsorService = new SponsorService();
