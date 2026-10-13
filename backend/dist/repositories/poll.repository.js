"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class PollRepository {
    static async createPoll(data) {
        return database_1.default.poll.create({
            data: {
                question: data.question,
                createdById: data.createdById,
                resultsVisibility: data.resultsVisibility || 'AFTER_VOTE',
                closesAt: data.closesAt || null,
                status: 'ACTIVE',
                publishedAt: new Date(),
                options: {
                    create: data.options.map((optionText, index) => ({
                        optionText,
                        displayOrder: index,
                    })),
                },
            },
            include: {
                options: true,
            },
        });
    }
    static async getActivePolls(userId) {
        const polls = await database_1.default.poll.findMany({
            where: {
                status: 'ACTIVE',
            },
            orderBy: { createdAt: 'desc' },
            include: {
                options: {
                    orderBy: { displayOrder: 'asc' },
                    include: {
                        _count: { select: { votes: true } },
                    },
                },
                _count: { select: { votes: true } },
                votes: userId ? { where: { userId } } : false,
            },
        });
        return polls;
    }
    static async getPollById(id, userId) {
        return database_1.default.poll.findUnique({
            where: { id },
            include: {
                options: {
                    orderBy: { displayOrder: 'asc' },
                    include: {
                        _count: { select: { votes: true } },
                    },
                },
                _count: { select: { votes: true } },
                votes: userId ? { where: { userId } } : false,
            },
        });
    }
    static async castVote(pollId, optionId, userId) {
        return database_1.default.pollVote.create({
            data: {
                pollId,
                optionId,
                userId,
            },
        });
    }
    static async hasUserVoted(pollId, userId) {
        const vote = await database_1.default.pollVote.findUnique({
            where: {
                pollId_userId: { pollId, userId },
            },
        });
        return !!vote;
    }
    static async updatePoll(id, data) {
        return database_1.default.poll.update({
            where: { id },
            data,
        });
    }
    static async deletePoll(id) {
        return database_1.default.poll.delete({ where: { id } });
    }
    static async getAllPollsAdmin() {
        return database_1.default.poll.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                options: true,
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: { select: { votes: true } },
            },
        });
    }
}
exports.PollRepository = PollRepository;
