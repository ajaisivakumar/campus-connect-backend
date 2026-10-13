"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaderboardConsentSchema = exports.publishLeaderboardSchema = void 0;
const zod_1 = require("zod");
exports.publishLeaderboardSchema = zod_1.z.object({
    semesterMilestone: zod_1.z.coerce.number().int().min(1).max(10),
    academicBatch: zod_1.z.string().default('2025-2029'),
    displayMode: zod_1.z.enum(['ANONYMOUS', 'CUSTOM_ALIAS', 'PUBLIC_NAME']).default('ANONYMOUS'),
    publicDisplayName: zod_1.z.string().max(50).optional().nullable(),
    consentGiven: zod_1.z.boolean().refine((val) => val === true, 'Consent must be given to publish on leaderboard'),
});
exports.updateLeaderboardConsentSchema = zod_1.z.object({
    semesterMilestone: zod_1.z.coerce.number().int().min(1).max(10),
    academicBatch: zod_1.z.string().default('2025-2029'),
    displayMode: zod_1.z.enum(['ANONYMOUS', 'CUSTOM_ALIAS', 'PUBLIC_NAME']).optional(),
    publicDisplayName: zod_1.z.string().max(50).optional().nullable(),
    isPublished: zod_1.z.boolean().optional(),
});
