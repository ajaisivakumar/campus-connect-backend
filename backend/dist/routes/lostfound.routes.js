"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lostfoundRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.lostfoundRouter = (0, express_1.Router)();
exports.lostfoundRouter.get('/', (req, res) => {
    const { type, status } = req.query;
    let list = store_1.db.lostFound;
    if (type)
        list = list.filter((i) => i.type === type);
    if (status)
        list = list.filter((i) => i.status === status);
    res.json({ items: list });
});
exports.lostfoundRouter.post('/', auth_middleware_1.authenticate, (req, res) => {
    const { title, type, category, location, date, description, imageUrl, contactInfo, isSensitive } = req.body;
    const newItem = {
        id: 'lf-' + Date.now(),
        title,
        type: type || 'FOUND',
        category: category || 'Other',
        location,
        date,
        description,
        imageUrl,
        contactInfo,
        isSensitive: !!isSensitive,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
    };
    store_1.db.lostFound.unshift(newItem);
    res.status(201).json({ item: newItem });
});
exports.lostfoundRouter.patch('/:id/status', auth_middleware_1.authenticate, (req, res) => {
    const item = store_1.db.lostFound.find((i) => i.id === req.params.id);
    if (!item)
        return res.status(404).json({ message: 'Item not found' });
    if (req.body.status)
        item.status = req.body.status;
    res.json({ item });
});
exports.lostfoundRouter.delete('/:id', auth_middleware_1.authenticate, (req, res) => {
    store_1.db.lostFound = store_1.db.lostFound.filter((i) => i.id !== req.params.id);
    res.json({ message: 'Item deleted' });
});
exports.default = exports.lostfoundRouter;
