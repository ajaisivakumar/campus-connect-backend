"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = exports.updateOpportunitySchema = exports.createOpportunitySchema = void 0;
const zod_1 = require("zod");
exports.createOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    category: zod_1.z.string().min(2).max(50),
    description: zod_1.z.string().min(10).max(5000),
    skillsNeeded: zod_1.z.string().max(500).optional().nullable(),
    teamSize: zod_1.z.coerce.number().int().min(1).max(50).optional().nullable(),
    collaborationMode: zod_1.z.string().max(50).optional().nullable(),
    eventName: zod_1.z.string().max(200).optional().nullable(),
    externalUrl: zod_1.z.string().url().optional().nullable(),
    deadline: zod_1.z.string().datetime().optional().nullable(),
    additionalInfo: zod_1.z.string().max(2000).optional().nullable(),
    lookingFor: zod_1.z.string().max(200).optional().nullable(),
});
exports.updateOpportunitySchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    category: zod_1.z.string().min(2).max(50).optional(),
    description: zod_1.z.string().min(10).max(5000).optional(),
    skillsNeeded: zod_1.z.string().max(500).optional().nullable(),
    teamSize: zod_1.z.coerce.number().int().min(1).max(50).optional().nullable(),
    collaborationMode: zod_1.z.string().max(50).optional().nullable(),
    eventName: zod_1.z.string().max(200).optional().nullable(),
    externalUrl: zod_1.z.string().url().optional().nullable(),
    deadline: zod_1.z.string().datetime().optional().nullable(),
    additionalInfo: zod_1.z.string().max(2000).optional().nullable(),
    lookingFor: zod_1.z.string().max(200).optional().nullable(),
    status: zod_1.z.enum(['OPEN', 'TEAM_FORMED', 'CLOSED']).optional(),
});
exports.sendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message cannot be empty').max(3000),
});
