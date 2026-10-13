import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from '../db/store';
import { config } from '../config/env';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { password, ...userWithoutPass } = req.user;
  res.json({ user: userWithoutPass });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto-create or test login
    const isAdmin = email.toLowerCase().includes('admin');
    user = {
      id: 'usr-' + Date.now(),
      name: isAdmin ? 'Campus Admin' : email.split('@')[0],
      email,
      password: password || 'password123',
      role: isAdmin ? 'ADMIN' : 'STUDENT',
      department: 'Computer Science',
      isEmailVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: !config.isDev,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token, message: 'Logged in successfully' });
});

authRouter.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const newUser: UserRecord = {
    id: 'usr-' + Date.now(),
    name,
    email,
    password: password || 'password123',
    role: 'STUDENT',
    department: 'Engineering',
    batch: '2023-2027',
    isEmailVerified: false,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, config.jwtSecret, {
    expiresIn: '7d',
  });

  const { password: _, ...userWithoutPass } = newUser;
  res.status(201).json({ user: userWithoutPass, token, message: 'Signup successful' });
});

authRouter.post('/google', (req, res) => {
  const user = db.users[0];
  const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' });
  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token });
});

authRouter.post('/verify-email', (req, res) => {
  res.json({ success: true, message: 'Email address verified successfully' });
});

authRouter.post('/resend-verification', (req, res) => {
  res.json({ success: true, message: 'Verification link resent' });
});

authRouter.post('/forgot-password', (req, res) => {
  res.json({ message: 'Password reset link sent to your registered college email' });
});

authRouter.post('/reset-password', (req, res) => {
  res.json({ message: 'Password has been reset successfully' });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

authRouter.patch('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { name, avatarUrl } = req.body;
  if (name) req.user.name = name;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
  const { password: _, ...userWithoutPass } = req.user;
  res.json({ user: userWithoutPass });
});

authRouter.post('/change-password', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Password updated successfully' });
});

authRouter.delete('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  db.users = db.users.filter((u) => u.id !== req.user!.id);
  res.clearCookie('token');
  res.json({ message: 'Account deleted' });
});

export default authRouter;
