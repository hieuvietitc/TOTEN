import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  TrophyOutlined,
  BarChartOutlined,
  DollarOutlined,
  WarningOutlined,
  GiftOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/dashboard',   icon: <DashboardOutlined />, label: 'Control Tower' },
  { key: '/players',     icon: <TeamOutlined />,      label: 'Người Chơi' },
  { key: '/clubs',       icon: <BankOutlined />,      label: 'Câu Lạc Bộ' },
  { key: '/tournaments', icon: <TrophyOutlined />,    label: 'Giải Đấu' },
  { key: '/ranking',     icon: <BarChartOutlined />,  label: 'Xếp Hạng' },
  { key: '/finance',     icon: <DollarOutlined />,    label: 'Tài Chính' },
  { key: '/fraud',       icon: <WarningOutlined />,   label: 'Gian Lận' },
  { key: '/sponsors',    icon: <GiftOutlined />,      label: 'Nhà Tài Trợ' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') { logout(); navigate('/login'); }
    },
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ background: '#001529' }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography.Title level={4} style={{ color: '#1a6b3c', margin: 0 }}>
            {collapsed ? 'T' : '🎾 TOTEN'}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <span
            style={{ cursor: 'pointer', fontSize: 18 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>

          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#1a6b3c' }} />
              <span>{user?.full_name ?? 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
