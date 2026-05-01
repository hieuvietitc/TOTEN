import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert, Typography, Spin } from 'antd';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { financeApi } from '@/services/api';
import type { FinanceSummary } from '@/types';

const COLORS = ['#1a6b3c', '#52c41a', '#1890ff', '#faad14', '#f5222d'];

function fmtB(v: number) {
  return `${(v / 1_000_000_000).toFixed(2)}B`;
}

export default function Finance() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([financeApi.summary(), financeApi.alerts()])
      .then(([s, a]) => {
        setSummary(s.data.data);
        setAlerts(a.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!summary) return <Alert type="error" message="Không thể tải dữ liệu tài chính" />;

  const revenueByType = Object.entries(summary.revenue_by_type ?? {}).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Tài chính — P&L</Typography.Title>

      {alerts.map((a, i) => (
        <Alert key={i} type="warning" message={a} showIcon style={{ marginBottom: 8 }} />
      ))}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng doanh thu', value: fmtB(summary.total_revenue), color: '#1a6b3c' },
          { title: 'Tổng chi phí', value: fmtB(summary.total_expense), color: '#f5222d' },
          { title: 'Lợi nhuận ròng', value: fmtB(summary.net_profit), color: summary.net_profit >= 0 ? '#52c41a' : '#f5222d' },
          { title: 'Biên lợi nhuận', value: `${(summary.gross_margin * 100).toFixed(1)}%`, color: '#1890ff' },
        ].map((s) => (
          <Col key={s.title} xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={s.title}
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 24 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Xu hướng doanh thu & chi phí (30 ngày)">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={summary.daily_trend ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a6b3c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a6b3c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5222d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f5222d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M VND`} />
                <Area type="monotone" dataKey="revenue" stroke="#1a6b3c" fill="url(#rev)" name="Doanh thu" />
                <Area type="monotone" dataKey="expense" stroke="#f5222d" fill="url(#exp)" name="Chi phí" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Doanh thu theo loại">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={revenueByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {revenueByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M VND`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
