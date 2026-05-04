import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

api.interceptors.request.use((cfg) => {
  const raw = localStorage.getItem('toten-auth');
  if (raw) {
    const state = JSON.parse(raw);
    if (state?.state?.token) cfg.headers.Authorization = `Bearer ${state.state.token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('toten-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Users
export const usersApi = {
  list: (params?: { limit?: number; offset?: number; search?: string }) =>
    api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  deactivate: (id: string) => api.delete(`/users/${id}`),
};

// Membership
export const membershipApi = {
  getByUser: (userId: string) => api.get(`/membership/user/${userId}`),
  upgrade: (userId: string, type: string) =>
    api.post(`/membership/upgrade`, { user_id: userId, membership_type: type }),
  stats: () => api.get('/membership/stats'),
};

// Clubs — served by user-service at /users/clubs
export const clubsApi = {
  list: (params?: { limit?: number; offset?: number; city?: string }) =>
    api.get('/users/clubs', { params }),
  verify: (id: string) => api.put(`/users/clubs/${id}/verify`),
};

// Bookings
export const bookingApi = {
  list: (params?: Record<string, unknown>) => api.get('/booking', { params }),
  // backend route: GET /booking/stats/overview (no per-court stats endpoint)
  stats: () => api.get('/booking/stats/overview'),
};

// Matches
export const matchApi = {
  // GET / is aliased to recent list in match-service
  list: (params?: Record<string, unknown>) => api.get('/matches', { params }),
  playerStats: (userId: string) => api.get(`/matches/player/${userId}/stats`),
};

// Ranking — corrected paths
export const rankingApi = {
  leaderboard: (params?: { limit?: number; city?: string }) =>
    api.get('/ranking/leaderboard/top', { params }),
  playerRating: (userId: string) => api.get(`/ranking/rating/${userId}`),
};

// Tournaments
export const tournamentApi = {
  list: (params?: Record<string, unknown>) => api.get('/tournaments', { params }),
  getById: (id: string) => api.get(`/tournaments/${id}`),
  stats: (id: string) => api.get(`/tournaments/${id}/stats`),
};

// Fraud — resolve uses PUT (backend route is PUT /alerts/:id/resolve)
export const fraudApi = {
  alerts: (params?: { status?: string; severity?: string; limit?: number }) =>
    api.get('/fraud/alerts', { params }),
  resolve: (id: string, resolution: string) =>
    api.put(`/fraud/alerts/${id}/resolve`, { resolution }),
  userHistory: (userId: string) => api.get(`/fraud/player/${userId}/history`),
};

// Sponsors
export const sponsorApi = {
  list: (params?: Record<string, unknown>) => api.get('/sponsors', { params }),
  report: (id: string) => api.get(`/sponsors/${id}/report`),
};

// Finance — corrected paths
export const financeApi = {
  summary: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/finance/pl', { params }),
  dailyTrend: (days?: number) => api.get('/finance/revenue/daily', { params: { days } }),
  alerts: () => api.get('/finance/alerts'),
};

// Control Tower — corrected kpi path
export const controlTowerApi = {
  daily: () => api.get('/control-tower/daily'),
  snapshot: () => api.get('/control-tower/snapshot'),
  clubLeaderboard: () => api.get('/control-tower/clubs/leaderboard'),
  kpiAlerts: () => api.get('/control-tower/kpi/alerts'),
  recommendations: () => api.get('/control-tower/recommendations'),
  dashboard: () => api.get('/control-tower/dashboard'),
};

export default api;
