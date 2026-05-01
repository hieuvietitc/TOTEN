import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'toten',
  password: process.env.DB_PASSWORD || 'toten_dev_password',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'toten_db',
});

export default pool;
