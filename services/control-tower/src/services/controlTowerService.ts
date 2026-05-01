import pool from '../config/database';

export interface DailyMetrics {
  date: string;
  new_signups: number;
  active_players: number;
  matches_today: number;
  new_members: number;
  revenue_today_vnd: number;
  fraud_alerts_open: number;
}

export interface ClubLeaderboard {
  club_id: number;
  club_name: string;
  city: string;
  players_this_week: number;
  matches_this_week: number;
  revenue_this_week: number;
  growth_pct: number;
}

export interface NationalSnapshot {
  as_of: string;
  total_users: number;
  paid_members: number;
  active_clubs: number;
  total_matches: number;
  total_tournaments: number;
  total_revenue_vnd: number;
  fraud_open_alerts: number;
  membership_breakdown: Record<string, number>;
  top_cities: Array<{ city: string; count: number }>;
  weekly_signups: Array<{ week: string; count: number }>;
}

export interface KPIAlert {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  current: number;
  target: number;
  action_required: string;
}

export class ControlTowerService {
  async getDailyMetrics(): Promise<DailyMetrics> {
    const today = new Date().toISOString().slice(0, 10);

    const [signups, matches, members, revenue, fraudAlerts] = await Promise.all([
      pool.query(`SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = $1`, [today]),
      pool.query(`SELECT COUNT(*) as c FROM matches WHERE DATE(match_date) = $1 AND status = 'COMPLETED'`, [today]),
      pool.query(`SELECT COUNT(*) as c FROM membership WHERE DATE(start_date) = $1 AND membership_type != 'FREE'`, [today]),
      pool.query(`SELECT COALESCE(SUM(amount_vnd),0) as total FROM financial_transactions WHERE DATE(created_at) = $1 AND status = 'COMPLETED'`, [today]),
      pool.query(`SELECT COUNT(*) as c FROM fraud_alerts WHERE status = 'OPEN'`),
    ]);

    // Active players: those who played a match in last 7 days
    const activePlayers = await pool.query(`
      SELECT COUNT(DISTINCT player_id) as c FROM (
        SELECT player_a_id as player_id FROM matches WHERE match_date >= NOW() - INTERVAL '7 days'
        UNION
        SELECT player_b_id FROM matches WHERE match_date >= NOW() - INTERVAL '7 days'
      ) t
    `);

    return {
      date: today,
      new_signups: parseInt(signups.rows[0].c) || 0,
      active_players: parseInt(activePlayers.rows[0].c) || 0,
      matches_today: parseInt(matches.rows[0].c) || 0,
      new_members: parseInt(members.rows[0].c) || 0,
      revenue_today_vnd: parseInt(revenue.rows[0].total) || 0,
      fraud_alerts_open: parseInt(fraudAlerts.rows[0].c) || 0,
    };
  }

  async getNationalSnapshot(): Promise<NationalSnapshot> {
    const [users, members, clubs, matches, tournaments, revenue, fraudAlerts] = await Promise.all([
      pool.query(`SELECT COUNT(*) as c FROM users WHERE deleted_at IS NULL`),
      pool.query(`SELECT COUNT(*) as c FROM membership WHERE membership_type != 'FREE' AND payment_status = 'ACTIVE'`),
      pool.query(`SELECT COUNT(*) as c FROM clubs WHERE status = 'ACTIVE'`),
      pool.query(`SELECT COUNT(*) as c FROM matches WHERE status = 'COMPLETED'`),
      pool.query(`SELECT COUNT(*) as c FROM tournaments`),
      pool.query(`SELECT COALESCE(SUM(amount_vnd),0) as total FROM financial_transactions WHERE status = 'COMPLETED'`),
      pool.query(`SELECT COUNT(*) as c FROM fraud_alerts WHERE status = 'OPEN'`),
    ]);

    const membershipBreakdown = await pool.query(`
      SELECT membership_type, COUNT(*) as count
      FROM membership
      GROUP BY membership_type
    `);

    const topCities = await pool.query(`
      SELECT city, COUNT(*) as count FROM users
      WHERE deleted_at IS NULL AND city IS NOT NULL
      GROUP BY city ORDER BY count DESC LIMIT 10
    `);

    const weeklySignups = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-WW') as week, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY week ORDER BY week
    `);

    const membershipMap: Record<string, number> = {};
    membershipBreakdown.rows.forEach(r => {
      membershipMap[r.membership_type] = parseInt(r.count);
    });

    return {
      as_of: new Date().toISOString(),
      total_users: parseInt(users.rows[0].c) || 0,
      paid_members: parseInt(members.rows[0].c) || 0,
      active_clubs: parseInt(clubs.rows[0].c) || 0,
      total_matches: parseInt(matches.rows[0].c) || 0,
      total_tournaments: parseInt(tournaments.rows[0].c) || 0,
      total_revenue_vnd: parseInt(revenue.rows[0].total) || 0,
      fraud_open_alerts: parseInt(fraudAlerts.rows[0].c) || 0,
      membership_breakdown: membershipMap,
      top_cities: topCities.rows.map(r => ({ city: r.city, count: parseInt(r.count) })),
      weekly_signups: weeklySignups.rows.map(r => ({ week: r.week, count: parseInt(r.count) })),
    };
  }

  async getClubLeaderboard(top = 10, bottom = 10): Promise<{
    top: ClubLeaderboard[];
    bottom: ClubLeaderboard[];
  }> {
    const query = `
      SELECT
        c.id as club_id,
        c.name as club_name,
        c.city,
        COUNT(DISTINCT CASE WHEN m.match_date >= NOW() - INTERVAL '7 days'
          THEN m.player_a_id END) as players_this_week,
        COUNT(DISTINCT CASE WHEN m.match_date >= NOW() - INTERVAL '7 days'
          THEN m.id END) as matches_this_week,
        COALESCE(SUM(CASE WHEN ft.created_at >= NOW() - INTERVAL '7 days'
          THEN ft.amount_vnd END), 0) as revenue_this_week
      FROM clubs c
      LEFT JOIN matches m ON m.club_id = c.id
      LEFT JOIN financial_transactions ft ON ft.reference_id = c.id::text
      WHERE c.status = 'ACTIVE'
      GROUP BY c.id, c.name, c.city
    `;

    const result = await pool.query(query);
    const clubs: ClubLeaderboard[] = result.rows.map(r => ({
      club_id: r.club_id,
      club_name: r.club_name,
      city: r.city,
      players_this_week: parseInt(r.players_this_week) || 0,
      matches_this_week: parseInt(r.matches_this_week) || 0,
      revenue_this_week: parseInt(r.revenue_this_week) || 0,
      growth_pct: 0,
    }));

    const sorted = clubs.sort((a, b) => b.matches_this_week - a.matches_this_week);

    return {
      top: sorted.slice(0, top),
      bottom: sorted.slice(-bottom).reverse(),
    };
  }

  async getKPIAlerts(): Promise<KPIAlert[]> {
    const snapshot = await this.getNationalSnapshot();
    const alerts: KPIAlert[] = [];

    const TARGET_USERS = 20000;
    const TARGET_PAID_MEMBERS = 5000;
    const TARGET_CLUBS = 100;
    const TARGET_REVENUE_VND = 15_000_000_000;

    if (snapshot.total_users < TARGET_USERS * 0.5) {
      alerts.push({
        type: 'USER_ACQUISITION',
        severity: 'CRITICAL',
        message: `User count ${snapshot.total_users.toLocaleString()} is below 50% of 120-day target`,
        current: snapshot.total_users,
        target: TARGET_USERS,
        action_required: 'Increase marketing spend — activate Try TOTEN Week campaign',
      });
    } else if (snapshot.total_users < TARGET_USERS * 0.8) {
      alerts.push({
        type: 'USER_ACQUISITION',
        severity: 'WARNING',
        message: `User count at ${Math.round((snapshot.total_users / TARGET_USERS) * 100)}% of 120-day target`,
        current: snapshot.total_users,
        target: TARGET_USERS,
        action_required: 'Review club acquisition pipeline and referral campaigns',
      });
    }

    if (snapshot.paid_members < TARGET_PAID_MEMBERS * 0.5) {
      alerts.push({
        type: 'MEMBER_CONVERSION',
        severity: 'CRITICAL',
        message: `Paid members ${snapshot.paid_members.toLocaleString()} far below ${TARGET_PAID_MEMBERS.toLocaleString()} target`,
        current: snapshot.paid_members,
        target: TARGET_PAID_MEMBERS,
        action_required: 'Launch Free→Basic conversion campaign with 30-day trial incentive',
      });
    }

    if (snapshot.active_clubs < TARGET_CLUBS * 0.6) {
      alerts.push({
        type: 'CLUB_COVERAGE',
        severity: 'WARNING',
        message: `Only ${snapshot.active_clubs} active clubs vs ${TARGET_CLUBS} target`,
        current: snapshot.active_clubs,
        target: TARGET_CLUBS,
        action_required: 'Accelerate club onboarding — focus on Hanoi and Da Nang regions',
      });
    }

    if (snapshot.total_revenue_vnd < TARGET_REVENUE_VND * 0.3) {
      alerts.push({
        type: 'REVENUE',
        severity: 'WARNING',
        message: `Revenue at ${(snapshot.total_revenue_vnd / 1_000_000).toFixed(0)}M VND — below 30% of target`,
        current: snapshot.total_revenue_vnd,
        target: TARGET_REVENUE_VND,
        action_required: 'Prioritize Starter Kit sales and sponsor negotiations',
      });
    }

    if (snapshot.fraud_open_alerts > 50) {
      alerts.push({
        type: 'FRAUD_VOLUME',
        severity: snapshot.fraud_open_alerts > 100 ? 'CRITICAL' : 'WARNING',
        message: `${snapshot.fraud_open_alerts} open fraud alerts require review`,
        current: snapshot.fraud_open_alerts,
        target: 10,
        action_required: 'Review and resolve fraud alerts — assign to Fraud & Compliance Officer',
      });
    }

    return alerts;
  }

  async getActionRecommendations(): Promise<Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    area: string;
    action: string;
    expected_impact: string;
  }>> {
    const snapshot = await this.getNationalSnapshot();
    const recommendations = [];

    if (snapshot.total_users > 0) {
      const conversionRate = snapshot.paid_members / snapshot.total_users;
      if (conversionRate < 0.20) {
        recommendations.push({
          priority: 'HIGH' as const,
          area: 'MEMBERSHIP',
          action: 'Launch "First Month Free" Basic campaign for all Free ID holders',
          expected_impact: `+${Math.round(snapshot.total_users * 0.05)} paid members in 30 days`,
        });
      }
    }

    if (snapshot.active_clubs < 50) {
      recommendations.push({
        priority: 'HIGH' as const,
        area: 'CLUB_EXPANSION',
        action: 'Deploy CLUB SQUAD to Hanoi and Da Nang — target 20 new clubs in 2 weeks',
        expected_impact: '+20 clubs, +3,000 trial players',
      });
    }

    if (snapshot.total_revenue_vnd < 5_000_000_000) {
      recommendations.push({
        priority: 'HIGH' as const,
        area: 'SPONSORSHIP',
        action: 'Commercial Lead to pursue City Sponsor deals in HCM and Hanoi this week',
        expected_impact: '+2–3B VND in 45 days',
      });
    }

    recommendations.push({
      priority: 'MEDIUM' as const,
      area: 'ENGAGEMENT',
      action: 'Schedule weekly mini-tournament in each active club (Saturday format)',
      expected_impact: '+40% weekly active players per club',
    });

    recommendations.push({
      priority: 'LOW' as const,
      area: 'RANKING',
      action: 'Publish weekly Top 100 ranking on social media — drives organic signups',
      expected_impact: '+500–1,000 organic signups per week',
    });

    return recommendations;
  }
}

export const controlTowerService = new ControlTowerService();
