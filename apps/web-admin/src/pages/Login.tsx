import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const res = await authApi.login(values.email, values.password);
      login(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch {
      message.error('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001529 0%, #1a6b3c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ width: 400, borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={2} style={{ color: '#1a6b3c' }}>
            🎾 TOTEN Admin
          </Typography.Title>
          <Typography.Text type="secondary">
            Hệ thống quản trị VTF TOTEN
          </Typography.Text>
        </div>
        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Nhập email' }, { type: 'email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ background: '#1a6b3c' }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
