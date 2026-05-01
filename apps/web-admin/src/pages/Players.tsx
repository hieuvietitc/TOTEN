import { useEffect, useState } from 'react';
import { Table, Input, Tag, Button, Space, Modal, Descriptions, message, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { usersApi, membershipApi, matchApi } from '@/services/api';
import type { User } from '@/types';

const MEMBERSHIP_COLOR: Record<string, string> = {
  FREE: 'default', BASIC: 'blue', RANKED: 'gold', ELITE: 'purple',
};

export default function Players() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<User | null>(null);
  const [detailExtra, setDetailExtra] = useState<Record<string, unknown>>({});
  const PAGE_SIZE = 20;

  const load = async (p = page, q = search) => {
    setLoading(true);
    try {
      const res = await usersApi.list({ limit: PAGE_SIZE, offset: (p - 1) * PAGE_SIZE, search: q });
      setUsers(res.data.data?.items ?? []);
      setTotal(res.data.data?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (user: User) => {
    setDetail(user);
    const [mem, stats] = await Promise.all([
      membershipApi.getByUser(user.id).catch(() => null),
      matchApi.playerStats(user.id).catch(() => null),
    ]);
    setDetailExtra({
      membership: mem?.data?.data,
      stats: stats?.data?.data,
    });
  };

  const deactivate = async (user: User) => {
    await usersApi.deactivate(user.id);
    message.success('Đã vô hiệu hoá tài khoản');
    load();
  };

  const columns = [
    { title: 'Họ tên', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Thành phố', dataIndex: 'city', key: 'city' },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record)}>Chi tiết</Button>
          {record.is_active && (
            <Button
              icon={<StopOutlined />}
              size="small"
              danger
              onClick={() => Modal.confirm({
                title: 'Vô hiệu hoá tài khoản?',
                onOk: () => deactivate(record),
              })}
            >
              Khoá
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Quản lý Người chơi</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); load(1, e.target.value); setPage(1); }}
          style={{ width: 280 }}
        />
        <Tag color="blue">Tổng: {total}</Tag>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: PAGE_SIZE,
          onChange: (p) => { setPage(p); load(p); },
        }}
      />

      <Modal
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        title={`Chi tiết: ${detail?.full_name}`}
        width={600}
      >
        {detail && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Email">{detail.email}</Descriptions.Item>
            <Descriptions.Item label="Username">{detail.username}</Descriptions.Item>
            <Descriptions.Item label="Phone">{detail.phone}</Descriptions.Item>
            <Descriptions.Item label="City">{detail.city}</Descriptions.Item>
            <Descriptions.Item label="Role">{detail.role}</Descriptions.Item>
            <Descriptions.Item label="Joined">{new Date(detail.created_at).toLocaleDateString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Hội viên">
              <Tag color={MEMBERSHIP_COLOR[(detailExtra.membership as { type?: string })?.type ?? 'FREE']}>
                {(detailExtra.membership as { type?: string })?.type ?? 'FREE'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trận đấu">
              {(detailExtra.stats as { total_matches?: number })?.total_matches ?? 0} trận
            </Descriptions.Item>
            <Descriptions.Item label="Tỉ lệ thắng">
              {((detailExtra.stats as { win_rate?: number })?.win_rate ?? 0).toFixed(0)}%
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
