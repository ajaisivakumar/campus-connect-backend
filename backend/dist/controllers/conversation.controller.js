"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const opportunity_repository_1 = require("../repositories/opportunity.repository");
const database_1 = __importDefault(require("../config/database"));
class ConversationController {
    static async list(req, res, next) {
        try {
            const userId = req.user.id;
            const conversations = await opportunity_repository_1.OpportunityRepository.getUserConversations(userId);
            res.status(200).json({ success: true, data: conversations });
        }
        catch (err) {
            next(err);
        }
    }
    static async getMessages(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            // Verify participant
            const participant = await database_1.default.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: { conversationId: id, userId },
                },
            });
            if (!participant && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to view this conversation' });
                return;
            }
            const messages = await opportunity_repository_1.OpportunityRepository.getMessages(id);
            res.status(200).json({ success: true, data: messages });
        }
        catch (err) {
            next(err);
        }
    }
    static async sendMessage(req, res, next) {
        try {
            const { id: conversationId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            const participant = await database_1.default.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: { conversationId, userId },
                },
            });
            if (!participant) {
                res.status(403).json({ success: false, message: 'You are not a participant in this conversation' });
                return;
            }
            const message = await opportunity_repository_1.OpportunityRepository.createMessage(conversationId, userId, content);
            res.status(201).json({ success: true, data: message });
        }
        catch (err) {
            next(err);
        }
    }
    static async markRead(req, res, next) {
        try {
            const { id: conversationId } = req.params;
            const userId = req.user.id;
            await database_1.default.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    readAt: null,
                },
                data: {
                    readAt: new Date(),
                },
            });
            res.status(200).json({ success: true, message: 'Messages marked as read' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ConversationController = ConversationController;
