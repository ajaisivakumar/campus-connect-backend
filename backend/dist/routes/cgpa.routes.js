"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cgpaRouter = void 0;
const express_1 = require("express");
const store_1 = require("../db/store");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.cgpaRouter = (0, express_1.Router)();
exports.cgpaRouter.get('/saved', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user?.id || 'usr-1';
    const list = store_1.db.savedCgpa.filter((r) => r.userId === userId);
    res.json({ results: list });
});
exports.cgpaRouter.post('/saved', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user?.id || 'usr-1';
    const { semesterNumber, courses, gpa, totalCredits } = req.body;
    const existingIdx = store_1.db.savedCgpa.findIndex((r) => r.userId === userId && r.semesterNumber === Number(semesterNumber));
    const record = {
        id: 'sem-' + semesterNumber,
        userId,
        semesterNumber: Number(semesterNumber),
        gpa: Number(gpa),
        totalCredits: Number(totalCredits),
        courses: courses || [],
        createdAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
        store_1.db.savedCgpa[existingIdx] = record;
    }
    else {
        store_1.db.savedCgpa.push(record);
        store_1.db.savedCgpa.sort((a, b) => a.semesterNumber - b.semesterNumber);
    }
    res.status(201).json({ result: record });
});
exports.cgpaRouter.delete('/saved/:id', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user?.id || 'usr-1';
    store_1.db.savedCgpa = store_1.db.savedCgpa.filter((r) => !(r.id === req.params.id && r.userId === userId));
    res.json({ message: 'Deleted' });
});
exports.default = exports.cgpaRouter;
