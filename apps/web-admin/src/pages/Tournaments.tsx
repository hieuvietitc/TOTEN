import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Space, Card, Statistic, Row, Col } from 'antd';
import { tournamentApi } from '@/services/api';
import type { Tournament, TournamentType } from '@/types';

const TYPE_COLOR: Record<TournamentType, string> = {
  LOCAL: 'default', CITY: 'blue', PROVINCIAL: 'gold', NATIONAL: 'red',
};

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: 'blue', ONGOING: 'green', COMPLETED: 'default', CANCELLED: 'red',
};

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    tournamentApi.list({ limit: 200 })
      .then((r) => setTournaments(r.data.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const byType = (t: TournamentType) => tournaments.filter((x) => x.type === t).length;
  const active = tournaments.filter((x) => x.status === 'ONGOING').length;

  const columns = [
    { title: 'Tên giải', dataIndex: 'name', key: 'name', render: (v: string) => <b>{v}</b> },
    {
      title: 'Cấp độ',
      dataIndex: 'type',
      key: 'type',
      render: (v: TournamentType) => <Tag color={TYPE_COLOR[v]}>{v}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: 'Tham dự',
      dataIndex: 'max_participants',
      key: 'max_participants',
      render: (v: number) => `${v} người`,
    },
    {
      title: 'Giải thưởng',
      dataIndex: 'prize_pool',
      key: 'prize_pool',
      render: (v: number) => `${(v / 1_000_000).toFixed(0)}M VND`,
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
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Quản lý Giải đấu</Typography.Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: 'Tổng giải', value: tournaments.length },
          { title: 'Đang diễn ra', value: active },
          { title: 'Cấp LOCAL', value: byType('LOCAL') },
          { title: 'Cấp CITY', value: byType('CITY') },
          { title: 'Cấp PROVINCIAL', value: byType('PROVINCIAL') },
          { title: 'Cấp NATIONAL', value: byType('NATIONAL') },
        ].map((s) => (
          <Col key={s.title} xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} valueStyle={{ fontSize: 20 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={tournaments}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
