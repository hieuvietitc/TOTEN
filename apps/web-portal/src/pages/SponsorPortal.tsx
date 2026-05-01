import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Descriptions } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface SponsorReport {
  company_name: string;
  package_type: string;
  total_reach: number;
  brand_exposures: number;
  matches_sponsored: number;
  tournaments_sponsored: number;
  age_distribution: Record<string, number>;
  city_distribution: Record<string, number>;
}

export default function SponsorPortal({ sponsorId }: { sponsorId: string }) {
  const [report, setReport] = useState<SponsorReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/sponsors/${sponsorId}/report`)
      .then((r) => setReport(r.data.data))
      .finally(() => setLoading(false));
  }, [sponsorId]);

  if (loading || !report) return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div>;

  const cityData = Object.entries(report.city_distribution ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>{report.company_name} — Báo cáo tài trợ</Typography.Title>
      <Tag color="gold" style={{ marginBottom: 16 }}>{report.package_type} SPONSOR</Tag>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><Card><Statistic title="Tổng tiếp cận" value={report.total_reach.toLocaleString()} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Brand Exposures" value={report.brand_exposures.toLocaleString()} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Trận tài trợ" value={report.matches_sponsored} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Giải tài trợ" value={report.tournaments_sponsored} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Phân bổ theo thành phố">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1a6b3c" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Phân bổ theo độ tuổi">
            <Descriptions column={1} size="small">
              {Object.entries(report.age_distribution ?? {}).map(([range, count]) => (
                <Descriptions.Item key={range} label={range}>{(count as number).toLocaleString()} người</Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
