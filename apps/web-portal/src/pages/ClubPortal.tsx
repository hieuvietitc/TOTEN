import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag } from 'antd';
import axios from 'axios';

interface BookingEntry {
  id: string;
  court_name: string;
  user_name: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
}

interface CourtStat {
  court_id: string;
  court_name: string;
  occupancy_rate: number;
  total_bookings: number;
  revenue: number;
}

export default function ClubPortal({ clubId }: { clubId: string }) {
  const [stats, setStats] = useState<CourtStat[]>([]);
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/users/clubs/${clubId}/courts`),
      axios.get(`/api/booking`, { params: { club_id: clubId, limit: 50 } }),
    ]).then(([courts, bks]) => {
      setStats(courts.data.data?.stats ?? []);
      setBookings(bks.data.data?.items ?? []);
    }).finally(() => setLoading(false));
  }, [clubId]);

  const totalRevenue = stats.reduce((s, c) => s + c.revenue, 0);
  const avgOccupancy = stats.length > 0
    ? stats.reduce((s, c) => s + c.occupancy_rate, 0) / stats.length
    : 0;

  const columns = [
    { title: 'Sân', dataIndex: 'court_name', key: 'court_name' },
    { title: 'Người đặt', dataIndex: 'user_name', key: 'user_name' },
    { title: 'Giờ bắt đầu', dataIndex: 'start_time', key: 'start_time', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
    { title: 'Giá', dataIndex: 'total_price', key: 'total_price', render: (v: number) => `${(v / 1000).toFixed(0)}K` },
    { title: 'TT', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'CONFIRMED' ? 'green' : 'orange'}>{v}</Tag> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>CLB Dashboard</Typography.Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><Card><Statistic title="Số sân" value={stats.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Tổng doanh thu" value={`${(totalRevenue / 1_000_000).toFixed(1)}M`} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Tỉ lệ lấp đầy TB" value={`${avgOccupancy.toFixed(0)}%`} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="Lượt đặt" value={bookings.length} /></Card></Col>
      </Row>

      <Card title="Lịch đặt sân gần đây">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={bookings}
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
}
