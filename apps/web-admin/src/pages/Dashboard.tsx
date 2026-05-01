import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Tag, List, Typography, Alert, Spin, Progress } from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined,
  WarningOutlined,
  RiseOutlined,
  BankOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { controlTowerApi } from '@/services/api';
import type { KPIAlert, NationalSnapshot } from '@/types';

const COLORS = ['#1a6b3c', '#52c41a', '#1890ff', '#faad14'];
const KPI_TARGETS = {
  trial_players: 20000,
  active_players: 10000,
  paid_members: 5000,
  clubs: 100,
  revenue_vnd: 15_000_000_000,
  tournaments: 120,
};

function fmtMoney(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  return v.toLocaleString('vi-VN');
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<NationalSnapshot | null>(null);
  const [kpiAlerts, setKpiAlerts] = useState<KPIAlert[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      controlTowerApi.snapshot(),
      controlTowerApi.kpiAlerts(),
      controlTowerApi.recommendations(),
    ]).then(([s, k, r]) => {
      setSnapshot(s.data.data);
      setKpiAlerts(k.data.data ?? []);
      setRecommendations(r.data.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!snapshot) return <Alert type="error" message="Không thể tải dữ liệu" />;

  const memberPie = Object.entries(snapshot.membership_breakdown ?? {}).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  const kpiProgress = [
    { label: 'Người dùng thử', current: snapshot.total_users, target: KPI_TARGETS.trial_players },
    { label: 'Active players', current: snapshot.active_users, target: KPI_TARGETS.active_players },
    { label: 'Paid members', current: snapshot.paid_members, target: KPI_TARGETS.paid_members },
    { label: 'Câu lạc bộ', current: snapshot.total_clubs, target: KPI_TARGETS.clubs },
    { label: 'Tournaments', current: snapshot.total_tournaments, target: KPI_TARGETS.tournaments },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        Control Tower — Tổng quan quốc gia
      </Typography.Title>

      {/* KPI Alerts */}
      {kpiAlerts.filter((a) => a.status !== 'on_track').map((a) => (
        <Alert
          key={a.metric}
          type={a.status === 'critical' ? 'error' : 'warning'}
          message={`${a.metric}: ${a.pct.toFixed(0)}% target — cần hành động`}
          style={{ marginBottom: 8 }}
          showIcon
        />
      ))}

      {/* Top stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng người dùng', value: snapshot.total_users, icon: <TeamOutlined />, color: '#1a6b3c' },
          { title: 'Thành viên trả phí', value: snapshot.paid_members, icon: <RiseOutlined />, color: '#52c41a' },
          { title: 'Câu lạc bộ', value: snapshot.total_clubs, icon: <BankOutlined />, color: '#1890ff' },
          { title: 'Tổng trận đấu', value: snapshot.total_matches, icon: <TrophyOutlined />, color: '#722ed1' },
          { title: 'Giải đấu', value: snapshot.total_tournaments, icon: <TrophyOutlined />, color: '#faad14' },
          { title: 'Doanh thu', value: fmtMoney(snapshot.total_revenue), icon: <DollarOutlined />, color: '#f5222d' },
        ].map((s) => (
          <Col key={s.title} xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title={s.title}
                value={s.value}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color, fontSize: 22 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Weekly signup trend */}
        <Col xs={24} lg={16}>
          <Card title="Đăng ký theo tuần">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={snapshot.weekly_signups ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1a6b3c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Membership pie */}
        <Col xs={24} lg={8}>
          <Card title="Phân bổ hội viên">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={memberPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {memberPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* KPI Progress */}
        <Col xs={24} lg={12}>
          <Card title="KPI 120 ngày">
            {kpiProgress.map((k) => {
              const pct = Math.min(100, (k.current / k.target) * 100);
              return (
                <div key={k.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{k.label}</span>
                    <span style={{ color: '#888' }}>{k.current.toLocaleString()} / {k.target.toLocaleString()}</span>
                  </div>
                  <Progress
                    percent={pct}
                    strokeColor={pct >= 80 ? '#52c41a' : pct >= 50 ? '#faad14' : '#f5222d'}
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        {/* Recommendations */}
        <Col xs={24} lg={12}>
          <Card title="Khuyến nghị hành động" extra={<Tag color="blue">AI</Tag>}>
            <List
              size="small"
              dataSource={recommendations}
              renderItem={(item: string, i) => (
                <List.Item>
                  <Tag color={i === 0 ? 'red' : i === 1 ? 'orange' : 'green'}>{i + 1}</Tag>
                  {item}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
