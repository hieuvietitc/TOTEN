# TOTEN Data Dictionary

## Core Tables

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  birth_date DATE,
  gender ENUM('M', 'F', 'O'),
  city VARCHAR(100),
  district VARCHAR(100),
  country VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### membership
```sql
CREATE TABLE membership (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  membership_type ENUM('FREE', 'BASIC', 'RANKED', 'ELITE'),
  start_date DATE NOT NULL,
  expiry_date DATE,
  payment_status ENUM('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### clubs
```sql
CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  certified BOOLEAN DEFAULT FALSE,
  num_courts INT,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### courts
```sql
CREATE TABLE courts (
  id SERIAL PRIMARY KEY,
  club_id INT NOT NULL REFERENCES clubs(id),
  court_number INT,
  surface VARCHAR(50),
  status ENUM('AVAILABLE', 'MAINTENANCE', 'RESERVED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### matches
```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  player_a_id INT NOT NULL REFERENCES users(id),
  player_b_id INT NOT NULL REFERENCES users(id),
  court_id INT REFERENCES courts(id),
  club_id INT REFERENCES clubs(id),
  match_date TIMESTAMP NOT NULL,
  match_type ENUM('CASUAL', 'RANKED', 'TOURNAMENT'),
  status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
  score_a INT,
  score_b INT,
  winner_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ratings
```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  rating_value DECIMAL(4,2),
  tier VARCHAR(50),
  matches_played INT DEFAULT 0,
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### rankings
```sql
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  ranking_points INT DEFAULT 0,
  rank_position INT,
  period VARCHAR(20),
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### tournaments
```sql
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  start_date DATE,
  end_date DATE,
  club_id INT REFERENCES clubs(id),
  tournament_type VARCHAR(50),
  status ENUM('PLANNING', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### court_bookings
```sql
CREATE TABLE court_bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  court_id INT NOT NULL REFERENCES courts(id),
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  price_amount INT,
  status ENUM('CONFIRMED', 'CANCELLED', 'NO_SHOW'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### fraud_alerts
```sql
CREATE TABLE fraud_alerts (
  id SERIAL PRIMARY KEY,
  match_id INT REFERENCES matches(id),
  user_id INT REFERENCES users(id),
  alert_type VARCHAR(100),
  severity ENUM('WARNING', 'HOLD', 'INVESTIGATION', 'BANNED'),
  description TEXT,
  status ENUM('OPEN', 'REVIEWED', 'RESOLVED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
```

### sponsorships
```sql
CREATE TABLE sponsorships (
  id SERIAL PRIMARY KEY,
  sponsor_name VARCHAR(255),
  contact_email VARCHAR(255),
  package_type ENUM('TITLE', 'CITY', 'EQUIPMENT', 'DIGITAL'),
  amount_vnd INT,
  start_date DATE,
  end_date DATE,
  status ENUM('ACTIVE', 'EXPIRED', 'TERMINATED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### financial_transactions
```sql
CREATE TABLE financial_transactions (
  id SERIAL PRIMARY KEY,
  transaction_type ENUM('MEMBERSHIP_FEE', 'TOURNAMENT_FEE', 'COURT_BOOKING', 'EQUIPMENT_SALE', 'SPONSORSHIP'),
  user_id INT REFERENCES users(id),
  amount_vnd INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  payment_method VARCHAR(50),
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
