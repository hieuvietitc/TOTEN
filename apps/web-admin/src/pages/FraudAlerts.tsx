import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Input, message, Typography, Select, Row, Col, Card, Statistic } from 'antd';
import { CheckOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { fraudApi } from '@/services/api';
import type { FraudAlert, FraudSeverity } from '@/types';

const SEVERITY_COLOR: Record<FraudSeverity, string> = {
  WARNING: 'orange', HOLD: 'gold', INVESTIGATION: 'red', BANNED: 'volcano',
};

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined);
  const [resolving, setResolving] = useState<FraudAlert | null>(null);
  const [resolution, setResolution] = useState('');

  const load = async (sev?: string) => {
    setLoading(true);
    try {
      const res = await fraudApi.alerts({ status: 'OPEN', severity: sev, limit: 200 });
      setAlerts(res.data.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resolve = async () => {
    if (!resolving) return;
    await fraudApi.resolve(resolving.id, resolution);
    message.success('Đã xử lý cảnh báo');
    setResolving(null);
    setResolution('');
    load(severityFilter);
  };

  const countBySeverity = (s: FraudSeverity) => alerts.filter((a) => a.severity === s).length;

  const columns = [
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (v: FraudSeverity) => (
        <Tag color={SEVERITY_COLOR[v]} icon={<WarningOutlined />}>{v}</Tag>
      ),
    },
    { title: 'Rule vi phạm', dataIndex: 'rule_triggered', key: 'rule_triggered' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'OPEN' ? 'red' : 'green'}>{v}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: FraudAlert) => (
        <Space>
          {record.status === 'OPEN' && (
            <Button
              icon={<CheckOutlined />}
              size="small"
              type="primary"
              onClick={() => { setResolving(record); setResolution(''); }}
              style={{ background: '#1a6b3c' }}
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Cảnh báo Gian lận</Typography.Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {(['WARNING', 'HOLD', 'INVESTIGATION', 'BANNED'] as FraudSeverity[]).map((s) => (
          <Col key={s} xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title={s}
                value={countBySeverity(s)}
                valueStyle={{ color: SEVERITY_COLOR[s] === 'volcano' ? '#cf1322' : undefined }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc theo mức độ"
          allowClear
          style={{ width: 180 }}
          options={[
            { value: 'WARNING', label: 'WARNING' },
            { value: 'HOLD', label: 'HOLD' },
            { value: 'INVESTIGATION', label: 'INVESTIGATION' },
            { value: 'BANNED', label: 'BANNED' },
          ]}
          onChange={(v) => { setSeverityFilter(v); load(v); }}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={alerts}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        open={!!resolving}
        title={`Xử lý cảnh báo: ${resolving?.rule_triggered}`}
        onOk={resolve}
        onCancel={() => setResolving(null)}
        okText="Xác nhận"
        cancelText="Huỷ"
      >
        {resolving?.severity === 'BANNED' && (
          <Tag color="red" style={{ marginBottom: 12 }}>
            Lệnh BAN yêu cầu xác nhận thủ công bởi người có thẩm quyền
          </Tag>
        )}
        <Input.TextArea
          placeholder="Nhập quyết định xử lý..."
          rows={3}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        />
      </Modal>
    </div>
  );
}
