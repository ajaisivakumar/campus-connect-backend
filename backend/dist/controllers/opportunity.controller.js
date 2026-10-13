"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityController = void 0;
const opportunity_repository_1 = require("../repositories/opportunity.repository");
const audit_service_1 = __importDefault(require("../audit/audit.service"));
class OpportunityController {
    static async list(req, res, next) {
        try {
            const { status, category } = req.query;
            const opportunities = await opportunity_repository_1.OpportunityRepository.getOpportunities(status, category);
            res.status(200).json({ success: true, data: opportunities });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const opportunity = await opportunity_repository_1.OpportunityRepository.getOpportunityById(id);
            if (!opportunity) {
                res.status(404).json({ success: false, message: 'Opportunity not found' });
                return;
            }
            res.status(200).json({ success: true, data: opportunity });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.id;
            const anonymousAlias = req.user.anonymousAlias || `Student_${Math.random().toString(36).substring(2, 7)}`;
            const opportunity = await opportunity_repository_1.OpportunityRepository.createOpportunity(userId, anonymousAlias, req.body);
            await audit_service_1.default.log({
                eventType: 'OPPORTUNITY_CREATED',
                actorId: userId,
                targetType: 'OPPORTUNITY',
                targetId: opportunity.id,
                outcome: 'SUCCESS',
            });
            res.status(201).json({
                success: true,
                data: opportunity,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const existing = await opportunity_repository_1.OpportunityRepository.getOpportunityById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Opportunity not found' });
                return;
            }
            if (existing.creatorId !== userId && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to modify this opportunity' });
                return;
            }
            const updated = await opportunity_repository_1.OpportunityRepository.updateOpportunity(id, req.body);
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const existing = await opportunity_repository_1.OpportunityRepository.getOpportunityById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Opportunity not found' });
                return;
            }
            if (existing.creatorId !== userId && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to delete this opportunity' });
                return;
            }
            await opportunity_repository_1.OpportunityRepository.deleteOpportunity(id);
            res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    static async expressInterest(req, res, next) {
        try {
            const { id: opportunityId } = req.params;
            const applicantId = req.user.id;
            const opportunity = await opportunity_repository_1.OpportunityRepository.getOpportunityById(opportunityId);
            if (!opportunity) {
                res.status(404).json({ success: false, message: 'Opportunity not found' });
                return;
            }
            if (opportunity.creatorId === applicantId) {
                res.status(400).json({ success: false, message: 'You cannot message your own opportunity post' });
                return;
            }
            // Check if conversation already exists between applicant and creator
            let conversation = await opportunity_repository_1.OpportunityRepository.findConversationByOpportunityAndUser(opportunityId, applicantId);
            if (!conversation) {
                conversation = await opportunity_repository_1.OpportunityRepository.createConversation(opportunityId, [applicantId, opportunity.creatorId]);
            }
            res.status(200).json({
                success: true,
                message: 'Interest recorded. Conversation initiated.',
                data: { conversationId: conversation.id },
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OpportunityController = OpportunityController;
