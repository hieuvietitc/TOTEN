import { Request, Response } from 'express';
import axios from 'axios';
import { generateToken, verifyToken } from '../utils/tokenUtils';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/passwordUtils';
import pool from '../config/database';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, full_name, phone, birth_date, gender, city } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, password required' });
      }

      const validation = validatePasswordStrength(password);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Invalid password', details: validation.errors });
      }

      const passwordHash = await hashPassword(password);

      try {
        const userRes = await axios.post(`${USER_SERVICE_URL}/api/users`, {
          username,
          email,
          password_hash: passwordHash,
          full_name,
          phone,
          birth_date,
          gender,
          city,
        });

        const user = userRes.data;
        const token = generateToken(user.id, user.email);

        const query = `
          INSERT INTO membership (user_id, membership_type, start_date, expiry_date, payment_status)
          VALUES ($1, $2, NOW(), NULL, $3)
        `;
        await pool.query(query, [user.id, 'FREE', 'ACTIVE']);

        res.status(201).json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
          },
          token,
        });
      } catch (userError: any) {
        if (userError.response?.status === 409) {
          return res.status(409).json({ error: 'User already exists' });
        }
        throw userError;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const userQuery = `
        SELECT u.id, u.email, u.password_hash, u.username, u.full_name, m.membership_type
        FROM users u
        LEFT JOIN membership m ON u.id = m.user_id
        WHERE u.email = $1 AND u.deleted_at IS NULL
      `;
      const result = await pool.query(userQuery, [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const passwordMatch = await comparePassword(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id, user.email);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          membership_type: user.membership_type,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token required' });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ valid: true, userId: decoded.userId, email: decoded.email });
    } catch (error) {
      res.status(500).json({ error: 'Token verification failed' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token required' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const newToken = generateToken(decoded.userId, decoded.email);
      res.json({ token: newToken });
    } catch (error) {
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }
}

export const authController = new AuthController();
