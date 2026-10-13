"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.eventRouter = (0, express_1.Router)();
exports.eventRouter.get('/', (req, res) => {
    const { category } = req.query;
    let list = store_1.db.events;
    if (category && category !== 'ALL') {
        list = list.filter((e) => e.category === category);
    }
    res.json({ events: list });
});
exports.eventRouter.get('/:id', (req, res) => {
    const evt = store_1.db.events.find((e) => e.id === req.params.id);
    if (!evt)
        return res.status(404).json({ message: 'Event not found' });
    res.json({ event: evt });
});
exports.eventRouter.post('/', auth_middleware_1.authenticate, (req, res) => {
    const { title, description, category, eventDate, venue, registrationLink, brochureUrl } = req.body;
    if (!title || !description || !eventDate || !venue) {
        return res.status(400).json({ message: 'Missing required event fields' });
    }
    const newEvent = {
        id: 'evt-' + Date.now(),
        title,
        description,
        category: category || 'TECHNICAL',
        eventDate,
        venue,
        registrationLink,
        brochureUrl: brochureUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
        status: 'PENDING',
        organizerName: req.user?.name || 'Student Submitter',
        createdAt: new Date().toISOString(),
    };
    store_1.db.events.unshift(newEvent);
    res.status(201).json({ event: newEvent });
});
exports.eventRouter.patch('/:id/status', auth_middleware_1.authenticate, (req, res) => {
    const { status, notes } = req.body;
    const evt = store_1.db.events.find((e) => e.id === req.params.id);
    if (!evt)
        return res.status(404).json({ message: 'Event not found' });
    if (status)
        evt.status = status;
    if (notes)
        evt.moderatorNotes = notes;
    res.json({ event: evt });
});
exports.eventRouter.delete('/:id', auth_middleware_1.authenticate, (req, res) => {
    store_1.db.events = store_1.db.events.filter((e) => e.id !== req.params.id);
    res.json({ message: 'Event removed' });
});
exports.default = exports.eventRouter;
