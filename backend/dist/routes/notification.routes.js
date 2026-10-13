"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.notificationRouter = (0, express_1.Router)();
exports.notificationRouter.get('/', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user?.id || 'usr-1';
    const list = store_1.db.notifications.filter((n) => n.userId === userId || n.userId === 'all');
    res.json({ notifications: list });
});
exports.notificationRouter.patch('/:id/read', auth_middleware_1.authenticate, (req, res) => {
    const n = store_1.db.notifications.find((item) => item.id === req.params.id);
    if (n)
        n.read = true;
    res.json({ success: true });
});
exports.notificationRouter.patch('/read-all', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user?.id || 'usr-1';
    store_1.db.notifications.forEach((n) => {
        if (n.userId === userId || n.userId === 'all')
            n.read = true;
    });
    res.json({ success: true });
});
exports.default = exports.notificationRouter;
