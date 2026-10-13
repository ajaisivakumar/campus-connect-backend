"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateEventSchema = exports.reportEventSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    category: zod_1.z.string().min(2).max(50),
    description: zod_1.z.string().min(10).max(5000),
    brochureUrl: zod_1.z.string().url().optional().nullable(),
    brochureKey: zod_1.z.string().optional().nullable(),
    registrationUrl: zod_1.z.string().url().optional().nullable(),
    eventStartDate: zod_1.z.string().datetime().optional().nullable(),
    eventEndDate: zod_1.z.string().datetime().optional().nullable(),
    registrationDeadline: zod_1.z.string().datetime().optional().nullable(),
    organizer: zod_1.z.string().max(100).optional().nullable(),
    location: zod_1.z.string().max(200).optional().nullable(),
    format: zod_1.z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional().default('OFFLINE'),
});
exports.updateEventSchema = exports.createEventSchema.partial();
exports.reportEventSchema = zod_1.z.object({
    reason: zod_1.z.string().min(5).max(500),
});
exports.moderateEventSchema = zod_1.z.object({
    status: zod_1.z.enum(['PUBLISHED', 'REJECTED']),
    moderatorNote: zod_1.z.string().max(500).optional(),
});
