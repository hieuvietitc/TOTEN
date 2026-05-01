import { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography, Space, Modal, Card, Row, Col, Statistic, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { sponsorApi } from '@/services/api';
import type { Sponsorship, SponsorPackage } from '@/types';

const PKG_COLOR: Record<SponsorPackage, string> = {
  TITLE: 'gold', CITY: 'blue', EQUIPMENT: 'green', DIGITAL: 'purple',
};

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setLoading(true);
    sponsorApi.list({ limit: 100 })
      .then((r) => setSponsors(r.data.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const viewReport = async (id: string) => {
    const res = await sponsorApi.report(id);
    setDetail(res.data.data);
  };

  const totalRevenue = sponsors.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const active = sponsors.filter((s) => s.status === 'ACTIVE').length;

  const columns = [
    { title: 'Công ty', dataIndex: 'company_name', key: 'company_name', render: (v: string) => <b>{v}</b> },
    {
      title: 'Gói tài trợ',
      dataIndex: 'package_type',
      key: 'package_type',
      render: (v: SponsorPackage) => <Tag color={PKG_COLOR[v]}>{v}</Tag>,
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `${(v / 1_000_000).toFixed(0)}M VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v}</Tag>,
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Kết thúc',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Báo cáo',
      key: 'report',
      render: (_: unknown, record: Sponsorship) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => viewReport(record.id)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Nhà Tài Trợ</Typography.Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="Tổng nhà tài trợ" value={sponsors.length} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Statistic title="Đang hoạt động" value={active} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng doanh thu tài trợ"
              value={`${(totalRevenue / 1_000_000_000).toFixed(2)}B VND`}
              valueStyle={{ color: '#1a6b3c' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={sponsors}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        title="Báo cáo hiệu quả tài trợ"
        width={600}
      >
        {detail && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Tiếp cận">{(detail.total_reach as number)?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Brand Exposures">{(detail.brand_exposures as number)?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Trận tài trợ">{detail.matches_sponsored as number}</Descriptions.Item>
            <Descriptions.Item label="Giải tài trợ">{detail.tournaments_sponsored as number}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
