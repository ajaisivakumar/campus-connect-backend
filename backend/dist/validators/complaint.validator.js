"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatusSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
exports.createComplaintSchema = zod_1.z.object({
    floor: zod_1.z.string().min(1, 'Floor is required').max(50),
    lab: zod_1.z.string().min(1, 'Lab is required').max(100),
    systemNumber: zod_1.z.string().min(1, 'System number is required').max(50),
    description: zod_1.z.string().min(5, 'Issue description must be at least 5 characters').max(3000),
});
exports.updateComplaintStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    resolutionNote: zod_1.z.string().max(1000).optional(),
});
