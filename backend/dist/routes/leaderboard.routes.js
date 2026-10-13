"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.leaderboardRouter = (0, express_1.Router)();
exports.leaderboardRouter.get('/', (req, res) => {
    const { milestone } = req.query;
    let list = store_1.db.leaderboard;
    if (milestone && milestone !== 'ALL') {
        list = list.filter((i) => i.milestone === milestone);
    }
    res.json({ leaderboard: list });
});
exports.leaderboardRouter.get('/me', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user?.id || 'usr-1';
    const entry = store_1.db.leaderboard.find((l) => l.userId === userId);
    res.json({
        status: {
            isOptedIn: !!entry,
            isAnonymous: entry?.isAnonymous || false,
            currentRank: entry?.rank || 6,
            cgpa: entry?.cgpa || 8.8,
            milestone: entry?.milestone || 'Sem 1-4',
        },
    });
});
exports.leaderboardRouter.post('/opt-in', auth_middleware_1.authenticate, (req, res) => {
    const { isOptedIn, isAnonymous } = req.body;
    const userId = req.user?.id || 'usr-1';
    let entry = store_1.db.leaderboard.find((l) => l.userId === userId);
    if (isOptedIn && !entry) {
        entry = {
            id: 'lb-' + Date.now(),
            userId,
            rank: store_1.db.leaderboard.length + 1,
            displayName: req.user?.name || 'Alex Johnson',
            alias: 'Student#' + Math.floor(100 + Math.random() * 900),
            isAnonymous: !!isAnonymous,
            cgpa: 8.8,
            milestone: 'Sem 1-4',
            department: req.user?.department || 'Computer Science',
            batch: '2023-2027',
            verified: true,
        };
        store_1.db.leaderboard.push(entry);
    }
    else if (!isOptedIn && entry) {
        store_1.db.leaderboard = store_1.db.leaderboard.filter((l) => l.userId !== userId);
    }
    else if (entry) {
        entry.isAnonymous = !!isAnonymous;
    }
    res.json({
        status: {
            isOptedIn,
            isAnonymous: !!isAnonymous,
            currentRank: entry?.rank || 6,
            cgpa: 8.8,
            milestone: 'Sem 1-4',
        },
    });
});
exports.leaderboardRouter.patch('/:id/verify', auth_middleware_1.authenticate, (req, res) => {
    const entry = store_1.db.leaderboard.find((l) => l.id === req.params.id);
    if (!entry)
        return res.status(404).json({ message: 'Leaderboard entry not found' });
    entry.verified = req.body.verified;
    res.json({ entry });
});
exports.default = exports.leaderboardRouter;
