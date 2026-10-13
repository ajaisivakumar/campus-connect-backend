"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollController = void 0;
const poll_repository_1 = require("../repositories/poll.repository");
const audit_service_1 = __importDefault(require("../audit/audit.service"));
class PollController {
    static async getActive(req, res, next) {
        try {
            const userId = req.user?.id;
            const polls = await poll_repository_1.PollRepository.getActivePolls(userId);
            res.status(200).json({ success: true, data: polls });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const poll = await poll_repository_1.PollRepository.getPollById(id, userId);
            if (!poll) {
                res.status(404).json({ success: false, message: 'Poll not found' });
                return;
            }
            res.status(200).json({ success: true, data: poll });
        }
        catch (err) {
            next(err);
        }
    }
    static async vote(req, res, next) {
        try {
            const { id: pollId } = req.params;
            const { optionId } = req.body;
            const userId = req.user.id;
            const poll = await poll_repository_1.PollRepository.getPollById(pollId);
            if (!poll) {
                res.status(404).json({ success: false, message: 'Poll not found' });
                return;
            }
            if (poll.status !== 'ACTIVE') {
                res.status(400).json({ success: false, message: 'Poll is no longer active' });
                return;
            }
            if (poll.closesAt && new Date() > poll.closesAt) {
                res.status(400).json({ success: false, message: 'Voting has closed for this poll' });
                return;
            }
            const hasVoted = await poll_repository_1.PollRepository.hasUserVoted(pollId, userId);
            if (hasVoted) {
                res.status(409).json({ success: false, message: 'You have already voted on this poll' });
                return;
            }
            await poll_repository_1.PollRepository.castVote(pollId, optionId, userId);
            await audit_service_1.default.log({
                eventType: 'POLL_VOTE_CAST',
                actorId: userId,
                targetType: 'POLL',
                targetId: pollId,
                outcome: 'SUCCESS',
            });
            res.status(200).json({ success: true, message: 'Vote recorded successfully' });
        }
        catch (err) {
            if (err.code === 'P2002') {
                res.status(409).json({ success: false, message: 'You have already voted on this poll' });
                return;
            }
            next(err);
        }
    }
    static async getResults(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const poll = await poll_repository_1.PollRepository.getPollById(id, userId);
            if (!poll) {
                res.status(404).json({ success: false, message: 'Poll not found' });
                return;
            }
            const hasVoted = userId ? await poll_repository_1.PollRepository.hasUserVoted(id, userId) : false;
            if (poll.resultsVisibility === 'AFTER_VOTE' && !hasVoted && req.user?.role !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    message: 'You must cast a vote to view poll results',
                });
                return;
            }
            res.status(200).json({ success: true, data: poll });
        }
        catch (err) {
            next(err);
        }
    }
    // Admin handlers
    static async create(req, res, next) {
        try {
            const { question, options, closesAt, resultsVisibility } = req.body;
            const poll = await poll_repository_1.PollRepository.createPoll({
                question,
                options,
                createdById: req.user.id,
                closesAt: closesAt ? new Date(closesAt) : undefined,
                resultsVisibility,
            });
            res.status(201).json({ success: true, data: poll });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const poll = await poll_repository_1.PollRepository.updatePoll(id, req.body);
            res.status(200).json({ success: true, data: poll });
        }
        catch (err) {
            next(err);
        }
    }
    static async publish(req, res, next) {
        try {
            const { id } = req.params;
            const poll = await poll_repository_1.PollRepository.updatePoll(id, {
                status: 'ACTIVE',
                publishedAt: new Date(),
            });
            res.status(200).json({ success: true, data: poll });
        }
        catch (err) {
            next(err);
        }
    }
    static async close(req, res, next) {
        try {
            const { id } = req.params;
            const poll = await poll_repository_1.PollRepository.updatePoll(id, {
                status: 'CLOSED',
                closesAt: new Date(),
            });
            res.status(200).json({ success: true, data: poll });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            await poll_repository_1.PollRepository.deletePoll(id);
            res.status(200).json({ success: true, message: 'Poll deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PollController = PollController;
