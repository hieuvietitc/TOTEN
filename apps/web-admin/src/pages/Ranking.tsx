import { useEffect, useState } from 'react';
import { Table, Tag, Avatar, Typography, Select, Space, Card, Row, Col, Statistic } from 'antd';
import { TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { rankingApi } from '@/services/api';

interface RankEntry {
  rank: number;
  user_id: string;
  full_name: string;
  city: string;
  rating: number;
  total_points: number;
  matches_played: number;
}

const TIER_COLOR: Record<string, string> = {
  BEGINNER: 'default',
  AMATEUR: 'blue',
  CLUB_PLAYER: 'cyan',
  ADVANCED: 'gold',
  ELITE: 'purple',
};

function getTier(rating: number): string {
  if (rating <= 2.5) return 'BEGINNER';
  if (rating <= 4.0) return 'AMATEUR';
  if (rating <= 6.0) return 'CLUB_PLAYER';
  if (rating <= 8.0) return 'ADVANCED';
  return 'ELITE';
}

export default function Ranking() {
  const [data, setData] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<string | undefined>(undefined);

  const load = async (c?: string) => {
    setLoading(true);
    try {
      const res = await rankingApi.leaderboard({ limit: 100, city: c });
      setData(res.data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const top3 = data.slice(0, 3);

  const columns = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (v: number) => (
        v <= 3
          ? <TrophyOutlined style={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][v - 1], fontSize: 18 }} />
          : v
      ),
    },
    {
      title: 'Người chơi',
      key: 'player',
      render: (_: unknown, r: RankEntry) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span>{r.full_name}</span>
        </Space>
      ),
    },
    { title: 'Thành phố', dataIndex: 'city', key: 'city' },
    {
      title: 'Hạng',
      key: 'tier',
      render: (_: unknown, r: RankEntry) => {
        const tier = getTier(r.rating);
        return <Tag color={TIER_COLOR[tier]}>{tier}</Tag>;
      },
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (v: number) => <b>{v?.toFixed(2)}</b>,
      sorter: (a: RankEntry, b: RankEntry) => b.rating - a.rating,
    },
    { title: 'Điểm ATP', dataIndex: 'total_points', key: 'total_points', sorter: (a: RankEntry, b: RankEntry) => b.total_points - a.total_points },
    { title: 'Trận đấu', dataIndex: 'matches_played', key: 'matches_played' },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Bảng xếp hạng</Typography.Title>

      {top3.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {top3.map((p, i) => (
            <Col key={p.user_id} xs={24} sm={8}>
              <Card
                style={{ textAlign: 'center', borderColor: ['#FFD700', '#C0C0C0', '#CD7F32'][i] }}
              >
                <TrophyOutlined style={{ fontSize: 32, color: ['#FFD700', '#C0C0C0', '#CD7F32'][i] }} />
                <Typography.Title level={5} style={{ marginTop: 8 }}>{p.full_name}</Typography.Title>
                <Tag color={TIER_COLOR[getTier(p.rating)]}>{getTier(p.rating)}</Tag>
                <Statistic title="Rating" value={p.rating?.toFixed(2)} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc theo thành phố"
          allowClear
          style={{ width: 200 }}
          onChange={(v) => { setCity(v); load(v); }}
          options={[
            { value: 'Hồ Chí Minh', label: 'TP.HCM' },
            { value: 'Hà Nội', label: 'Hà Nội' },
            { value: 'Đà Nẵng', label: 'Đà Nẵng' },
            { value: 'Cần Thơ', label: 'Cần Thơ' },
          ]}
        />
      </Space>

      <Table
        rowKey="user_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
