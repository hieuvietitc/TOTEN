import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// GET /api/users/clubs — list all clubs
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const city = req.query.city as string | undefined;

    const params: unknown[] = [limit, offset];
    const where = city ? `WHERE city = $3` : '';
    if (city) params.push(city);

    const result = await pool.query(
      `SELECT id, name, city, address, total_courts, is_verified, created_at
       FROM clubs ${where}
       ORDER BY is_verified DESC, name ASC
       LIMIT $1 OFFSET $2`,
      params,
    );
    const total = await pool.query(
      `SELECT COUNT(*) FROM clubs ${where}`,
      city ? [city] : [],
    );
    res.json({ data: { items: result.rows, total: parseInt(total.rows[0].count) } });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/clubs/:clubId
router.get('/:clubId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM clubs WHERE id = $1', [req.params.clubId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Club not found' });
    res.json({ data: result.rows[0] });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/clubs/:clubId/verify
router.put('/:clubId/verify', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE clubs SET is_verified = true, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.clubId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Club not found' });
    res.json({ data: result.rows[0], message: 'Club verified' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
