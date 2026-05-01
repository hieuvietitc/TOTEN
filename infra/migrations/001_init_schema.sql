-- TOTEN Database Schema v1.0
-- Migration 001: Initial schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username    VARCHAR(255) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name   VARCHAR(255),
  phone       VARCHAR(20),
  avatar_url  TEXT,
  birth_date  DATE,
  gender      VARCHAR(1) CHECK (gender IN ('M', 'F', 'O')),
  city        VARCHAR(100),
  district    VARCHAR(100),
  country     VARCHAR(100) DEFAULT 'Vietnam',
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_users_email    ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_city     ON users(city) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────
-- MEMBERSHIP
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id),
  membership_type VARCHAR(20) CHECK (membership_type IN ('FREE','BASIC','RANKED','ELITE')) NOT NULL DEFAULT 'FREE',
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date     DATE,
  payment_status  VARCHAR(20) CHECK (payment_status IN ('PENDING','ACTIVE','EXPIRED','CANCELLED')) DEFAULT 'ACTIVE',
  payment_method  VARCHAR(50),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_membership_user   ON membership(user_id);
CREATE INDEX idx_membership_type   ON membership(membership_type);
CREATE INDEX idx_membership_expiry ON membership(expiry_date);

-- ─────────────────────────────────────────
-- CLUBS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  city        VARCHAR(100),
  district    VARCHAR(100),
  address     TEXT,
  phone       VARCHAR(20),
  email       VARCHAR(255),
  certified   BOOLEAN DEFAULT FALSE,
  num_courts  INT DEFAULT 0,
  status      VARCHAR(20) CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')) DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clubs_city   ON clubs(city);
CREATE INDEX idx_clubs_status ON clubs(status);

-- ─────────────────────────────────────────
-- COURTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courts (
  id           SERIAL PRIMARY KEY,
  club_id      INT NOT NULL REFERENCES clubs(id),
  court_number INT NOT NULL,
  surface      VARCHAR(50),
  status       VARCHAR(20) CHECK (status IN ('AVAILABLE','MAINTENANCE','RESERVED')) DEFAULT 'AVAILABLE',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courts_club ON courts(club_id);

-- ─────────────────────────────────────────
-- MATCHES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_a_id   UUID NOT NULL REFERENCES users(id),
  player_b_id   UUID NOT NULL REFERENCES users(id),
  court_id      INT REFERENCES courts(id),
  club_id       INT REFERENCES clubs(id),
  match_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  match_type    VARCHAR(20) CHECK (match_type IN ('CASUAL','RANKED','TOURNAMENT')) DEFAULT 'CASUAL',
  status        VARCHAR(20) CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')) DEFAULT 'SCHEDULED',
  score_a       INT,
  score_b       INT,
  winner_id     UUID REFERENCES users(id),
  qr_checkin    BOOLEAN DEFAULT FALSE,
  gps_location  VARCHAR(100),
  confirmed_by_a BOOLEAN DEFAULT FALSE,
  confirmed_by_b BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_player_a  ON matches(player_a_id);
CREATE INDEX idx_matches_player_b  ON matches(player_b_id);
CREATE INDEX idx_matches_date      ON matches(match_date);
CREATE INDEX idx_matches_status    ON matches(status);
CREATE INDEX idx_matches_club      ON matches(club_id);

-- ─────────────────────────────────────────
-- RATINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id),
  rating_value    DECIMAL(4,2) NOT NULL DEFAULT 5.0
                    CHECK (rating_value >= 1.0 AND rating_value <= 10.0),
  tier            VARCHAR(20) DEFAULT 'CLUB_PLAYER',
  matches_played  INT DEFAULT 0,
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ratings_user  ON ratings(user_id);
CREATE INDEX idx_ratings_value ON ratings(rating_value DESC);
CREATE INDEX idx_ratings_tier  ON ratings(tier);

-- ─────────────────────────────────────────
-- RANKINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rankings (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id),
  ranking_points  INT DEFAULT 0,
  rank_position   INT DEFAULT 0,
  period          VARCHAR(20) NOT NULL,
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

CREATE INDEX idx_rankings_user   ON rankings(user_id);
CREATE INDEX idx_rankings_points ON rankings(ranking_points DESC);
CREATE INDEX idx_rankings_period ON rankings(period);

-- ─────────────────────────────────────────
-- TOURNAMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,
  city              VARCHAR(100),
  start_date        DATE,
  end_date          DATE,
  club_id           INT REFERENCES clubs(id),
  tournament_type   VARCHAR(20) CHECK (tournament_type IN ('LOCAL','CITY','PROVINCIAL','NATIONAL')) DEFAULT 'LOCAL',
  status            VARCHAR(20) CHECK (status IN ('PLANNING','REGISTRATION','IN_PROGRESS','COMPLETED')) DEFAULT 'PLANNING',
  max_players       INT,
  entry_fee         INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_type   ON tournaments(tournament_type);

-- ─────────────────────────────────────────
-- TOURNAMENT PARTICIPANTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  registered_at   TIMESTAMPTZ DEFAULT NOW(),
  seeding_rank    INT DEFAULT 0,
  grp             VARCHAR(10),
  status          VARCHAR(20) CHECK (status IN ('REGISTERED','WITHDRAWN','COMPLETED')) DEFAULT 'REGISTERED',
  UNIQUE(tournament_id, user_id)
);

-- ─────────────────────────────────────────
-- TOURNAMENT MATCHES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id),
  round           INT NOT NULL,
  player_a_id     UUID NOT NULL REFERENCES users(id),
  player_b_id     UUID NOT NULL REFERENCES users(id),
  match_date      TIMESTAMPTZ,
  score_a         INT,
  score_b         INT,
  winner_id       UUID REFERENCES users(id),
  status          VARCHAR(20) CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')) DEFAULT 'SCHEDULED'
);

CREATE INDEX idx_tmatch_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tmatch_round      ON tournament_matches(tournament_id, round);

-- ─────────────────────────────────────────
-- COURT BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS court_bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  court_id      INT NOT NULL REFERENCES courts(id),
  booking_date  DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  price_amount  INT NOT NULL,
  status        VARCHAR(20) CHECK (status IN ('CONFIRMED','CANCELLED','NO_SHOW')) DEFAULT 'CONFIRMED',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user   ON court_bookings(user_id);
CREATE INDEX idx_bookings_court  ON court_bookings(court_id, booking_date);
CREATE INDEX idx_bookings_date   ON court_bookings(booking_date);

-- ─────────────────────────────────────────
-- FRAUD ALERTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id         UUID REFERENCES matches(id),
  user_id          UUID NOT NULL REFERENCES users(id),
  alert_type       VARCHAR(100) NOT NULL,
  severity         VARCHAR(20) CHECK (severity IN ('WARNING','HOLD','INVESTIGATION','BANNED')) NOT NULL,
  description      TEXT NOT NULL,
  evidence         JSONB DEFAULT '{}',
  status           VARCHAR(20) CHECK (status IN ('OPEN','REVIEWED','RESOLVED')) DEFAULT 'OPEN',
  reviewer_id      UUID REFERENCES users(id),
  resolution_note  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ
);

CREATE INDEX idx_fraud_user     ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_status   ON fraud_alerts(status);
CREATE INDEX idx_fraud_severity ON fraud_alerts(severity);

-- ─────────────────────────────────────────
-- SPONSORSHIPS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sponsorships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_name    VARCHAR(255) NOT NULL,
  contact_email   VARCHAR(255),
  industry        VARCHAR(100),
  package_type    VARCHAR(20) CHECK (package_type IN ('TITLE','CITY','EQUIPMENT','DIGITAL')),
  amount_vnd      BIGINT NOT NULL DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  status          VARCHAR(20) CHECK (status IN ('ACTIVE','EXPIRED','TERMINATED','NEGOTIATING')) DEFAULT 'NEGOTIATING',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- FINANCIAL TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('MEMBERSHIP_FEE','TOURNAMENT_FEE','COURT_BOOKING','EQUIPMENT_SALE','SPONSORSHIP')) NOT NULL,
  user_id          UUID REFERENCES users(id),
  amount_vnd       BIGINT NOT NULL,
  currency         VARCHAR(3) DEFAULT 'VND',
  payment_method   VARCHAR(50),
  status           VARCHAR(20) CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED')) DEFAULT 'COMPLETED',
  reference_id     TEXT,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_user   ON financial_transactions(user_id);
CREATE INDEX idx_finance_type   ON financial_transactions(transaction_type);
CREATE INDEX idx_finance_status ON financial_transactions(status);
CREATE INDEX idx_finance_date   ON financial_transactions(created_at);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  type        VARCHAR(50) NOT NULL,
  channel     VARCHAR(20) CHECK (channel IN ('PUSH','EMAIL','SMS','IN_APP')) DEFAULT 'IN_APP',
  status      VARCHAR(20) CHECK (status IN ('SENT','DELIVERED','READ','FAILED')) DEFAULT 'SENT',
  related_id  TEXT,
  metadata    JSONB DEFAULT '{}',
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- ─────────────────────────────────────────
-- NOTIFICATION PREFERENCES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id           UUID PRIMARY KEY REFERENCES users(id),
  push_enabled      BOOLEAN DEFAULT TRUE,
  email_enabled     BOOLEAN DEFAULT TRUE,
  sms_enabled       BOOLEAN DEFAULT FALSE,
  in_app_enabled    BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end   TIME
);
