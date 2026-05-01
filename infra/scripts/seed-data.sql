-- TOTEN Seed Data — Development Only
-- Run after 001_init_schema.sql

-- Sample clubs
INSERT INTO clubs (name, city, district, address, certified, num_courts, status)
VALUES
  ('TOTEN Club Thủ Đức',   'HCM', 'Thủ Đức',    '123 Võ Văn Ngân', TRUE, 4, 'ACTIVE'),
  ('TOTEN Club Bình Thạnh', 'HCM', 'Bình Thạnh', '45 Xô Viết Nghệ Tĩnh', TRUE, 3, 'ACTIVE'),
  ('TOTEN Club Đống Đa',   'Hanoi', 'Đống Đa',   '88 Giảng Võ', TRUE, 4, 'ACTIVE'),
  ('TOTEN Club Hải Châu',  'Da Nang', 'Hải Châu', '12 Trần Phú', FALSE, 2, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Sample courts
INSERT INTO courts (club_id, court_number, surface, status)
SELECT id, generate_series(1, num_courts), 'HARD', 'AVAILABLE'
FROM clubs;

-- Sample admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, full_name, city, gender)
VALUES (
  'admin_toten',
  'admin@toten.vn',
  '$2b$10$placeholder_hash_for_Admin@123',
  'TOTEN Admin',
  'HCM',
  'M'
) ON CONFLICT DO NOTHING;

-- Sample tournament
INSERT INTO tournaments (name, city, start_date, end_date, tournament_type, status, max_players, entry_fee)
VALUES (
  'TOTEN City Cup HCM - Tháng 5/2026',
  'HCM',
  '2026-05-15',
  '2026-05-17',
  'CITY',
  'REGISTRATION',
  32,
  200000
) ON CONFLICT DO NOTHING;
