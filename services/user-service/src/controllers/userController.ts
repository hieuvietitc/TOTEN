import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { CreateUserDTO } from '../models/User';

export class UserController {
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listUsers(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await userService.getAllUsers(limit, offset);
      res.json({ data: { items: users, total: users.length, limit, offset } });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await userService.softDeleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async checkEmailExists(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email required' });
      }
      const user = await userService.getUserByEmail(email as string);
      res.json({ exists: !!user });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const userController = new UserController();
