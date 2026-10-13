"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const store_1 = require("../db/store");
const env_1 = require("../config/env");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.get('/me', auth_middleware_1.authenticate, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    const { password, ...userWithoutPass } = req.user;
    res.json({ user: userWithoutPass });
});
exports.authRouter.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    let user = store_1.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
        store_1.db.users.push(user);
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.config.jwtSecret, {
        expiresIn: '7d',
    });
    res.cookie('token', token, {
        httpOnly: true,
        secure: !env_1.config.isDev,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { password: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass, token, message: 'Logged in successfully' });
});
exports.authRouter.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !name) {
        return res.status(400).json({ message: 'Name and email are required' });
    }
    const existing = store_1.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const newUser = {
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
    store_1.db.users.push(newUser);
    const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, env_1.config.jwtSecret, {
        expiresIn: '7d',
    });
    const { password: _, ...userWithoutPass } = newUser;
    res.status(201).json({ user: userWithoutPass, token, message: 'Signup successful' });
});
exports.authRouter.post('/google', (req, res) => {
    const user = store_1.db.users[0];
    const token = jsonwebtoken_1.default.sign({ id: user.id }, env_1.config.jwtSecret, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass, token });
});
exports.authRouter.post('/verify-email', (req, res) => {
    res.json({ success: true, message: 'Email address verified successfully' });
});
exports.authRouter.post('/resend-verification', (req, res) => {
    res.json({ success: true, message: 'Verification link resent' });
});
exports.authRouter.post('/forgot-password', (req, res) => {
    res.json({ message: 'Password reset link sent to your registered college email' });
});
exports.authRouter.post('/reset-password', (req, res) => {
    res.json({ message: 'Password has been reset successfully' });
});
exports.authRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});
exports.authRouter.patch('/profile', auth_middleware_1.authenticate, (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { name, avatarUrl } = req.body;
    if (name)
        req.user.name = name;
    if (avatarUrl !== undefined)
        req.user.avatarUrl = avatarUrl;
    const { password: _, ...userWithoutPass } = req.user;
    res.json({ user: userWithoutPass });
});
exports.authRouter.post('/change-password', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'Password updated successfully' });
});
exports.authRouter.delete('/profile', auth_middleware_1.authenticate, (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    store_1.db.users = store_1.db.users.filter((u) => u.id !== req.user.id);
    res.clearCookie('token');
    res.json({ message: 'Account deleted' });
});
exports.default = exports.authRouter;
