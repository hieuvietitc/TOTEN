import pool from '../config/database';
import { User, CreateUserDTO, UpdateUserDTO, createUserObject } from '../models/User';

export class UserService {
  async createUser(data: CreateUserDTO & { password_hash: string }): Promise<User> {
    const query = `
      INSERT INTO users (username, email, password_hash, full_name, phone, birth_date, gender, city)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.username,
      data.email,
      data.password_hash,
      data.full_name || null,
      data.phone || null,
      data.birth_date || null,
      data.gender || null,
      data.city || null,
    ];
    const result = await pool.query(query, values);
    return createUserObject(result.rows[0]);
  }

  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? createUserObject(result.rows[0]) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [email]);
    return result.rows[0] ? createUserObject(result.rows[0]) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [username]);
    return result.rows[0] ? createUserObject(result.rows[0]) : null;
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(data.full_name);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(data.avatar_url);
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(data.city);
    }

    if (updates.length === 0) return this.getUserById(id);

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] ? createUserObject(result.rows[0]) : null;
  }

  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE deleted_at IS NULL LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows.map(row => createUserObject(row));
  }

  async softDeleteUser(id: string): Promise<boolean> {
    const query = 'UPDATE users SET deleted_at = NOW() WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}

export const userService = new UserService();
