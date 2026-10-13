"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.pollRouter = (0, express_1.Router)();
exports.pollRouter.get('/', auth_middleware_1.authenticate, (req, res) => {
    const { status } = req.query;
    const currentUserId = req.user?.id || 'usr-1';
    let list = store_1.db.polls;
    if (status) {
        list = list.filter((p) => p.status === status);
    }
    // Attach userVoteId for client
    const enriched = list.map((p) => ({
        ...p,
        userVoteId: p.userVotes?.[currentUserId],
    }));
    res.json({ polls: enriched });
});
exports.pollRouter.post('/:id/vote', auth_middleware_1.authenticate, (req, res) => {
    const { id } = req.params;
    const { optionId } = req.body;
    const userId = req.user?.id || 'usr-1';
    const poll = store_1.db.polls.find((p) => p.id === id);
    if (!poll)
        return res.status(404).json({ message: 'Poll not found' });
    if (!poll.userVotes)
        poll.userVotes = {};
    poll.userVotes[userId] = optionId;
    poll.totalVotes += 1;
    const opt = poll.options.find((o) => o.id === optionId);
    if (opt)
        opt.voteCount += 1;
    res.json({ poll: { ...poll, userVoteId: optionId } });
});
exports.pollRouter.post('/', auth_middleware_1.authenticate, (req, res) => {
    const { question, description, options, expiresAt } = req.body;
    if (!question || !options || options.length < 2) {
        return res.status(400).json({ message: 'Poll question and at least 2 options are required' });
    }
    const newPoll = {
        id: 'poll-' + Date.now(),
        question,
        description,
        options: options.map((t, idx) => ({
            id: `opt-${Date.now()}-${idx}`,
            text: t,
            voteCount: 0,
        })),
        totalVotes: 0,
        userVotes: {},
        status: 'ACTIVE',
        expiresAt: expiresAt || new Date(Date.now() + 86400000 * 5).toISOString(),
        createdAt: new Date().toISOString(),
    };
    store_1.db.polls.unshift(newPoll);
    res.status(201).json({ poll: newPoll });
});
exports.pollRouter.patch('/:id/close', auth_middleware_1.authenticate, (req, res) => {
    const poll = store_1.db.polls.find((p) => p.id === req.params.id);
    if (!poll)
        return res.status(404).json({ message: 'Poll not found' });
    poll.status = 'CLOSED';
    res.json({ poll });
});
exports.pollRouter.delete('/:id', auth_middleware_1.authenticate, (req, res) => {
    store_1.db.polls = store_1.db.polls.filter((p) => p.id !== req.params.id);
    res.json({ message: 'Poll deleted' });
});
exports.default = exports.pollRouter;
