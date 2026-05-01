import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Typography, message, Badge } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { clubsApi } from '@/services/api';
import type { Club } from '@/types';

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await clubsApi.list({ limit: 100 });
      setClubs(res.data.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const verify = async (id: string) => {
    try {
      await clubsApi.verify(id);
      message.success('Đã xác minh CLB');
      load();
    } catch {
      message.error('Lỗi xác minh');
    }
  };

  const columns = [
    { title: 'Tên CLB', dataIndex: 'name', key: 'name', render: (v: string) => <b>{v}</b> },
    { title: 'Thành phố', dataIndex: 'city', key: 'city' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'Số sân', dataIndex: 'total_courts', key: 'total_courts' },
    {
      title: 'Trạng thái',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (v: boolean) => (
        <Badge status={v ? 'success' : 'warning'} text={v ? 'Đã xác minh' : 'Chờ xác minh'} />
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: Club) =>
        !record.is_verified ? (
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            size="small"
            onClick={() => verify(record.id)}
            style={{ background: '#1a6b3c' }}
          >
            Xác minh
          </Button>
        ) : (
          <Tag color="green">Verified</Tag>
        ),
    },
  ];

  const verified = clubs.filter((c) => c.is_verified).length;

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>Quản lý Câu lạc bộ</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Tag color="blue">Tổng: {clubs.length}</Tag>
        <Tag color="green">Đã xác minh: {verified}</Tag>
        <Tag color="orange">Chờ duyệt: {clubs.length - verified}</Tag>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={clubs} loading={loading} pagination={{ pageSize: 20 }} />
    </div>
  );
}
