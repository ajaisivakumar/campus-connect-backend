"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.opportunityRouter = (0, express_1.Router)();
exports.opportunityRouter.get('/', (req, res) => {
    const { category } = req.query;
    let list = store_1.db.opportunities;
    if (category && category !== 'ALL') {
        list = list.filter((o) => o.category === category);
    }
    res.json({ opportunities: list });
});
exports.opportunityRouter.post('/', auth_middleware_1.authenticate, (req, res) => {
    const { title, description, category, requiredSkills, teamSize, contactPreference } = req.body;
    const newOpp = {
        id: 'opp-' + Date.now(),
        title,
        description,
        category: category || 'HACKATHON',
        requiredSkills: requiredSkills || [],
        teamSize: Number(teamSize) || 4,
        contactPreference: contactPreference || 'in_app',
        creatorAlias: 'Builder#' + Math.floor(100 + Math.random() * 900),
        creatorId: req.user?.id,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
    };
    store_1.db.opportunities.unshift(newOpp);
    res.status(201).json({ opportunity: newOpp });
});
exports.opportunityRouter.get('/:id/messages', auth_middleware_1.authenticate, (req, res) => {
    const list = store_1.db.messages.filter((m) => m.opportunityId === req.params.id);
    res.json({ messages: list });
});
exports.opportunityRouter.post('/:id/messages', auth_middleware_1.authenticate, (req, res) => {
    const { message } = req.body;
    const opp = store_1.db.opportunities.find((o) => o.id === req.params.id);
    if (!opp)
        return res.status(404).json({ message: 'Opportunity not found' });
    const newMsg = {
        id: 'msg-' + Date.now(),
        opportunityId: opp.id,
        senderId: req.user?.id || 'usr-1',
        senderName: req.user?.name || 'Student',
        senderAlias: req.user ? req.user.name : 'You',
        recipientId: opp.creatorAlias,
        message,
        createdAt: new Date().toISOString(),
    };
    store_1.db.messages.push(newMsg);
    res.status(201).json({ message: newMsg });
});
exports.opportunityRouter.patch('/:id/close', auth_middleware_1.authenticate, (req, res) => {
    const opp = store_1.db.opportunities.find((o) => o.id === req.params.id);
    if (!opp)
        return res.status(404).json({ message: 'Opportunity not found' });
    opp.status = 'CLOSED';
    res.json({ opportunity: opp });
});
exports.default = exports.opportunityRouter;
