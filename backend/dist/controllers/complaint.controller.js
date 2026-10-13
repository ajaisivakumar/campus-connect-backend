"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintController = void 0;
const complaint_repository_1 = require("../repositories/complaint.repository");
const telegram_service_1 = __importDefault(require("../services/telegram.service"));
const email_service_1 = __importDefault(require("../services/email.service"));
const audit_service_1 = __importDefault(require("../audit/audit.service"));
const logger_1 = __importDefault(require("../config/logger"));
class ComplaintController {
    static async create(req, res, next) {
        try {
            const { floor, lab, systemNumber, description } = req.body;
            const complaint = await complaint_repository_1.ComplaintRepository.createComplaint({
                floor,
                lab,
                systemNumber,
                description,
            });
            // Dispatch Telegram notification
            telegram_service_1.default
                .sendLabComplaintNotification({
                referenceId: complaint.referenceId,
                floor: complaint.floor,
                lab: complaint.lab,
                systemNumber: complaint.systemNumber,
                description: complaint.description,
                createdAt: complaint.createdAt,
            })
                .then(async (result) => {
                await complaint_repository_1.ComplaintRepository.updateDeliveryStatus(complaint.id, {
                    telegramStatus: result.success ? 'SENT' : 'FAILED',
                    telegramAttempts: 1,
                    lastTelegramError: result.error || null,
                });
            })
                .catch((err) => {
                logger_1.default.error('Background telegram sending error: %o', err);
            });
            // Dispatch Email notification
            email_service_1.default
                .sendLabComplaintEmail({
                referenceId: complaint.referenceId,
                floor: complaint.floor,
                lab: complaint.lab,
                systemNumber: complaint.systemNumber,
                description: complaint.description,
                createdAt: complaint.createdAt,
            })
                .then(async (success) => {
                await complaint_repository_1.ComplaintRepository.updateDeliveryStatus(complaint.id, {
                    emailStatus: success ? 'SENT' : 'FAILED',
                    emailAttempts: 1,
                });
            })
                .catch((err) => {
                logger_1.default.error('Background email sending error: %o', err);
            });
            await audit_service_1.default.log({
                eventType: 'LAB_COMPLAINT_SUBMITTED',
                targetType: 'LAB_COMPLAINT',
                targetId: complaint.id,
                outcome: 'SUCCESS',
                description: `Reference: ${complaint.referenceId}`,
            });
            res.status(201).json({
                success: true,
                message: 'Lab complaint submitted anonymously. Lab technician has been notified.',
                data: {
                    referenceId: complaint.referenceId,
                    status: complaint.status,
                    createdAt: complaint.createdAt,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Admin
    static async listAdmin(req, res, next) {
        try {
            const { status } = req.query;
            const complaints = await complaint_repository_1.ComplaintRepository.getAllComplaints(status);
            res.status(200).json({ success: true, data: complaints });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, resolutionNote } = req.body;
            const moderatorId = req.user.id;
            const complaint = await complaint_repository_1.ComplaintRepository.updateStatus(id, moderatorId, status, resolutionNote);
            await audit_service_1.default.log({
                eventType: 'LAB_COMPLAINT_UPDATED',
                actorId: moderatorId,
                actorRole: req.user.role,
                targetType: 'LAB_COMPLAINT',
                targetId: id,
                outcome: 'SUCCESS',
                description: `Status changed to ${status}`,
            });
            res.status(200).json({ success: true, data: complaint });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ComplaintController = ComplaintController;
