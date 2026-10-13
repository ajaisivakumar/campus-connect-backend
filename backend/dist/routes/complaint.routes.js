"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.complaintRouter = (0, express_1.Router)();
exports.complaintRouter.get('/', (req, res) => {
    const { status } = req.query;
    let list = store_1.db.complaints;
    if (status)
        list = list.filter((c) => c.status === status);
    res.json({ complaints: list });
});
exports.complaintRouter.post('/', (req, res) => {
    const { floor, lab, systemNumber, description } = req.body;
    if (!floor || !lab || !systemNumber || !description) {
        return res.status(400).json({ message: 'All complaint fields are required' });
    }
    const ref = 'LAB-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newComplaint = {
        id: 'cmp-' + Date.now(),
        referenceId: ref,
        floor,
        lab,
        systemNumber,
        description,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };
    store_1.db.complaints.unshift(newComplaint);
    res.status(201).json({ complaint: newComplaint });
});
exports.complaintRouter.patch('/:id/status', auth_middleware_1.authenticate, (req, res) => {
    const { status, notes } = req.body;
    const cmp = store_1.db.complaints.find((c) => c.id === req.params.id);
    if (!cmp)
        return res.status(404).json({ message: 'Complaint not found' });
    if (status)
        cmp.status = status;
    if (notes)
        cmp.adminNotes = notes;
    if (status === 'RESOLVED')
        cmp.resolvedAt = new Date().toISOString();
    res.json({ complaint: cmp });
});
exports.default = exports.complaintRouter;
