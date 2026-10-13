"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_middleware_1.authenticate);
exports.adminRouter.get('/metrics', (req, res) => {
    const totalUsers = store_1.db.users.length;
    const activeUsers = store_1.db.users.filter((u) => u.status === 'ACTIVE').length;
    const suspendedUsers = store_1.db.users.filter((u) => u.status === 'SUSPENDED').length;
    const publishedEvents = store_1.db.events.filter((e) => e.status === 'PUBLISHED').length;
    const activePolls = store_1.db.polls.filter((p) => p.status === 'ACTIVE').length;
    const openComplaints = store_1.db.complaints.filter((c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
    const lostFoundOpen = store_1.db.lostFound.filter((l) => l.status === 'OPEN').length;
    const lostFoundResolved = store_1.db.lostFound.filter((l) => l.status === 'RESOLVED' || l.status === 'RETURNED').length;
    res.json({
        metrics: {
            totalUsers,
            activeUsers,
            suspendedUsers,
            publishedEvents,
            activePolls,
            openComplaints,
            lostFoundOpen,
            lostFoundResolved,
            moderationActions24h: 12,
            securityEventsCount: 0,
        },
    });
});
exports.adminRouter.get('/users', (req, res) => {
    const safeUsers = store_1.db.users.map(({ password, ...u }) => u);
    res.json({ users: safeUsers });
});
exports.adminRouter.patch('/users/:id/status', (req, res) => {
    const user = store_1.db.users.find((u) => u.id === req.params.id);
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    user.status = req.body.status;
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
});
exports.adminRouter.patch('/users/:id/role', (req, res) => {
    const user = store_1.db.users.find((u) => u.id === req.params.id);
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    user.role = req.body.role;
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
});
exports.adminRouter.get('/audit-logs', (req, res) => {
    res.json({ logs: store_1.db.auditLogs });
});
exports.default = exports.adminRouter;
