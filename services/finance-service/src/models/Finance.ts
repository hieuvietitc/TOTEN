export type TransactionType = 'MEMBERSHIP_FEE' | 'TOURNAMENT_FEE' | 'COURT_BOOKING' | 'EQUIPMENT_SALE' | 'SPONSORSHIP';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  user_id?: string;
  amount_vnd: number;
  payment_method?: string;
  status: TransactionStatus;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface PLSummary {
  period: string;
  revenue: {
    membership: number;
    tournament: number;
    court_booking: number;
    equipment: number;
    sponsorship: number;
    total: number;
  };
  cost: {
    marketing: number;
    operations: number;
    staff: number;
    total: number;
  };
  gross_profit: number;
  gross_margin_pct: number;
}

export interface FinanceAlert {
  type: 'LOW_REVENUE' | 'HIGH_REFUND_RATE' | 'BUDGET_OVERRUN' | 'KPI_MISS';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  value: number;
  threshold: number;
}
