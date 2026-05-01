import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Players from '@/pages/Players';
import Clubs from '@/pages/Clubs';
import Tournaments from '@/pages/Tournaments';
import Ranking from '@/pages/Ranking';
import Finance from '@/pages/Finance';
import FraudAlerts from '@/pages/FraudAlerts';
import Sponsors from '@/pages/Sponsors';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="players" element={<Players />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="finance" element={<Finance />} />
          <Route path="fraud" element={<FraudAlerts />} />
          <Route path="sponsors" element={<Sponsors />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
