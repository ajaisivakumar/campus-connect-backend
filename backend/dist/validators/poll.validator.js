"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.votePollSchema = exports.updatePollSchema = exports.createPollSchema = void 0;
const zod_1 = require("zod");
exports.createPollSchema = zod_1.z.object({
    question: zod_1.z.string().min(5, 'Question must be at least 5 characters').max(500),
    options: zod_1.z
        .array(zod_1.z.string().min(1, 'Option text cannot be empty').max(200))
        .min(2, 'At least 2 options are required')
        .max(10, 'Maximum 10 options allowed'),
    closesAt: zod_1.z.string().datetime().optional(),
    resultsVisibility: zod_1.z.enum(['ALWAYS', 'AFTER_VOTE', 'AFTER_CLOSE']).default('AFTER_VOTE'),
});
exports.updatePollSchema = zod_1.z.object({
    question: zod_1.z.string().min(5).max(500).optional(),
    closesAt: zod_1.z.string().datetime().optional().nullable(),
    resultsVisibility: zod_1.z.enum(['ALWAYS', 'AFTER_VOTE', 'AFTER_CLOSE']).optional(),
});
exports.votePollSchema = zod_1.z.object({
    optionId: zod_1.z.string().uuid('Valid option ID required'),
});
