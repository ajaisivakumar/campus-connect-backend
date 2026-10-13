"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class OpportunityRepository {
    static async createOpportunity(creatorId, alias, data) {
        return database_1.default.opportunity.create({
            data: {
                creatorId,
                anonymousAlias: alias,
                title: data.title,
                category: data.category,
                description: data.description,
                skillsNeeded: data.skillsNeeded || null,
                teamSize: data.teamSize || null,
                collaborationMode: data.collaborationMode || null,
                eventName: data.eventName || null,
                externalUrl: data.externalUrl || null,
                deadline: data.deadline ? new Date(data.deadline) : null,
                additionalInfo: data.additionalInfo || null,
                lookingFor: data.lookingFor || null,
                status: 'OPEN',
            },
        });
    }
    static async getOpportunities(status, category) {
        const where = {};
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        return database_1.default.opportunity.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                anonymousAlias: true,
                title: true,
                category: true,
                description: true,
                skillsNeeded: true,
                teamSize: true,
                collaborationMode: true,
                eventName: true,
                externalUrl: true,
                deadline: true,
                additionalInfo: true,
                lookingFor: true,
                status: true,
                createdAt: true,
                creatorId: true,
            },
        });
    }
    static async getOpportunityById(id) {
        return database_1.default.opportunity.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    static async updateOpportunity(id, data) {
        return database_1.default.opportunity.update({
            where: { id },
            data,
        });
    }
    static async deleteOpportunity(id) {
        return database_1.default.opportunity.delete({ where: { id } });
    }
    static async createConversation(opportunityId, participantUserIds) {
        return database_1.default.conversation.create({
            data: {
                opportunityId,
                participants: {
                    create: participantUserIds.map((userId) => ({ userId })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, displayName: true, anonymousAlias: true },
                        },
                    },
                },
            },
        });
    }
    static async findConversationByOpportunityAndUser(opportunityId, userId) {
        return database_1.default.conversation.findFirst({
            where: {
                opportunityId,
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, displayName: true, anonymousAlias: true } },
                    },
                },
            },
        });
    }
    static async getUserConversations(userId) {
        return database_1.default.conversation.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                opportunity: {
                    select: { id: true, title: true, anonymousAlias: true },
                },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, displayName: true, anonymousAlias: true } },
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    static async getMessages(conversationId) {
        return database_1.default.message.findMany({
            where: { conversationId, isDeleted: false },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, name: true, displayName: true, anonymousAlias: true },
                },
            },
        });
    }
    static async createMessage(conversationId, senderId, content) {
        const [msg] = await database_1.default.$transaction([
            database_1.default.message.create({
                data: {
                    conversationId,
                    senderId,
                    content,
                },
            }),
            database_1.default.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessageAt: new Date(),
                    updatedAt: new Date(),
                },
            }),
        ]);
        return msg;
    }
}
exports.OpportunityRepository = OpportunityRepository;
