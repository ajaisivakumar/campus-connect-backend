"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportLostFoundSchema = exports.updateLostFoundItemSchema = exports.createLostFoundItemSchema = void 0;
const zod_1 = require("zod");
exports.createLostFoundItemSchema = zod_1.z.object({
    itemName: zod_1.z.string().max(100).optional().nullable(),
    category: zod_1.z.string().max(50).optional().nullable(),
    foundLocation: zod_1.z.string().max(200).optional().nullable(),
    currentLocation: zod_1.z.string().max(200).optional().nullable(),
    description: zod_1.z.string().max(2000).optional().nullable(),
    itemStatus: zod_1.z.enum(['FOUND', 'HANDED_OVER', 'CLAIMED', 'RETURNED', 'CLOSED']).default('FOUND'),
});
exports.updateLostFoundItemSchema = zod_1.z.object({
    itemName: zod_1.z.string().max(100).optional().nullable(),
    category: zod_1.z.string().max(50).optional().nullable(),
    foundLocation: zod_1.z.string().max(200).optional().nullable(),
    currentLocation: zod_1.z.string().max(200).optional().nullable(),
    description: zod_1.z.string().max(2000).optional().nullable(),
    itemStatus: zod_1.z.enum(['FOUND', 'HANDED_OVER', 'CLAIMED', 'RETURNED', 'CLOSED']).optional(),
    isHidden: zod_1.z.boolean().optional(),
});
exports.reportLostFoundSchema = zod_1.z.object({
    reason: zod_1.z.string().min(5).max(500),
});
