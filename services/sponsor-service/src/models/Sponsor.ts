export type SponsorPackage = 'TITLE' | 'CITY' | 'EQUIPMENT' | 'DIGITAL';
export type SponsorStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'NEGOTIATING';

export interface Sponsor {
  id: string;
  sponsor_name: string;
  contact_email: string;
  contact_phone?: string;
  industry?: string;
  package_type: SponsorPackage;
  amount_vnd: number;
  start_date: Date;
  end_date: Date;
  status: SponsorStatus;
  benefits: string[];
  created_at: Date;
  updated_at: Date;
}

export interface SponsorReport {
  sponsor_id: string;
  sponsor_name: string;
  period: string;
  total_players_reached: number;
  total_matches: number;
  total_checkins: number;
  age_groups: Record<string, number>;
  top_cities: string[];
  brand_exposures: number;
  conversion_rate: number;
}

export interface SponsorProposal {
  sponsor_name: string;
  industry: string;
  recommended_package: SponsorPackage;
  rationale: string;
  target_audience: string;
  estimated_reach: number;
  suggested_amount_vnd: number;
}
