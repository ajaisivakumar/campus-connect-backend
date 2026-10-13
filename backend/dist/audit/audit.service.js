"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../config/logger"));
class AuditService {
    static async log(params) {
        try {
            await database_1.default.auditLog.create({
                data: {
                    eventType: params.eventType,
                    actorId: params.actorId || null,
                    actorRole: params.actorRole || null,
                    targetType: params.targetType || null,
                    targetId: params.targetId || null,
                    outcome: params.outcome,
                    description: params.description || null,
                    requestId: params.requestId || null,
                },
            });
        }
        catch (err) {
            logger_1.default.error('Failed to persist audit log: %o', err);
        }
    }
    static async getLogs(page = 1, limit = 50, filter) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filter?.eventType)
            where.eventType = filter.eventType;
        if (filter?.actorId)
            where.actorId = filter.actorId;
        const [total, logs] = await Promise.all([
            database_1.default.auditLog.count({ where }),
            database_1.default.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    actor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
        ]);
        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            logs,
        };
    }
}
exports.AuditService = AuditService;
exports.default = AuditService;
