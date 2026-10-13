"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
const crypto_1 = require("../utils/crypto");
class ComplaintRepository {
    static async createComplaint(data) {
        // Determine daily sequence
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const countToday = await database_1.default.labComplaint.count({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });
        const referenceId = (0, crypto_1.generateComplaintRefId)(countToday + 1);
        return database_1.default.labComplaint.create({
            data: {
                referenceId,
                floor: data.floor,
                lab: data.lab,
                systemNumber: data.systemNumber,
                description: data.description,
                status: 'OPEN',
            },
        });
    }
    static async getAllComplaints(status) {
        const where = {};
        if (status)
            where.status = status;
        return database_1.default.labComplaint.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                moderator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    static async getComplaintById(id) {
        return database_1.default.labComplaint.findUnique({
            where: { id },
            include: {
                moderator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    static async updateStatus(id, moderatorId, status, resolutionNote) {
        return database_1.default.labComplaint.update({
            where: { id },
            data: {
                status,
                moderatorId,
                resolutionNote: resolutionNote || null,
            },
        });
    }
    static async updateDeliveryStatus(id, updates) {
        return database_1.default.labComplaint.update({
            where: { id },
            data: updates,
        });
    }
}
exports.ComplaintRepository = ComplaintRepository;
