"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const database_1 = __importDefault(require("../config/database"));
const user_repository_1 = require("../repositories/user.repository");
const audit_service_1 = __importDefault(require("../audit/audit.service"));
class AdminController {
    static async dashboard(_req, res, next) {
        try {
            const [totalUsers, totalEvents, pendingEvents, totalOpportunities, totalComplaints, openComplaints, totalPolls, totalLostFound,] = await Promise.all([
                database_1.default.user.count(),
                database_1.default.event.count(),
                database_1.default.event.count({ where: { status: 'PENDING' } }),
                database_1.default.opportunity.count(),
                database_1.default.labComplaint.count(),
                database_1.default.labComplaint.count({ where: { status: 'OPEN' } }),
                database_1.default.poll.count(),
                database_1.default.lostFoundItem.count(),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    totalUsers,
                    totalEvents,
                    pendingEvents,
                    totalOpportunities,
                    totalComplaints,
                    openComplaints,
                    totalPolls,
                    totalLostFound,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            const search = req.query.search;
            const skip = (page - 1) * limit;
            const { total, users } = await user_repository_1.UserRepository.getAllUsers(skip, limit, search);
            res.status(200).json({
                success: true,
                data: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    users,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateUserStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { accountStatus } = req.body;
            const updated = await user_repository_1.UserRepository.updateUser(id, { accountStatus });
            await audit_service_1.default.log({
                eventType: 'ADMIN_USER_STATUS_CHANGE',
                actorId: req.user.id,
                actorRole: req.user.role,
                targetType: 'USER',
                targetId: id,
                outcome: 'SUCCESS',
                description: `Status changed to ${accountStatus}`,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const updated = await user_repository_1.UserRepository.updateUser(id, { role });
            await audit_service_1.default.log({
                eventType: 'ADMIN_USER_ROLE_CHANGE',
                actorId: req.user.id,
                actorRole: req.user.role,
                targetType: 'USER',
                targetId: id,
                outcome: 'SUCCESS',
                description: `Role changed to ${role}`,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 50;
            const eventType = req.query.eventType;
            const data = await audit_service_1.default.getLogs(page, limit, { eventType });
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AdminController = AdminController;
