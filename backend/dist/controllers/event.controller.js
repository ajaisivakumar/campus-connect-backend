"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_repository_1 = require("../repositories/event.repository");
const audit_service_1 = __importDefault(require("../audit/audit.service"));
class EventController {
    static async list(req, res, next) {
        try {
            const { category, search } = req.query;
            const events = await event_repository_1.EventRepository.getPublishedEvents(category, search);
            res.status(200).json({ success: true, data: events });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await event_repository_1.EventRepository.getEventById(id);
            if (!event) {
                res.status(404).json({ success: false, message: 'Event not found' });
                return;
            }
            res.status(200).json({ success: true, data: event });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.id;
            const event = await event_repository_1.EventRepository.createEvent(userId, req.body);
            await audit_service_1.default.log({
                eventType: 'EVENT_SUBMITTED',
                actorId: userId,
                targetType: 'EVENT',
                targetId: event.id,
                outcome: 'SUCCESS',
            });
            res.status(201).json({
                success: true,
                message: 'Event submitted successfully. Awaiting moderator approval.',
                data: event,
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
            const existing = await event_repository_1.EventRepository.getEventById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Event not found' });
                return;
            }
            if (existing.creatorId !== userId && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
                return;
            }
            const updated = await event_repository_1.EventRepository.updateEvent(id, req.body);
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
            const existing = await event_repository_1.EventRepository.getEventById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Event not found' });
                return;
            }
            if (existing.creatorId !== userId && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
                return;
            }
            await event_repository_1.EventRepository.deleteEvent(id);
            res.status(200).json({ success: true, message: 'Event deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    static async report(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const reporterId = req.user.id;
            await event_repository_1.EventRepository.reportEvent(reporterId, id, reason);
            res.status(200).json({ success: true, message: 'Event reported for moderator review' });
        }
        catch (err) {
            next(err);
        }
    }
    // Admin
    static async listAdmin(req, res, next) {
        try {
            const { status } = req.query;
            const events = await event_repository_1.EventRepository.getAllEventsAdmin(status);
            res.status(200).json({ success: true, data: events });
        }
        catch (err) {
            next(err);
        }
    }
    static async publish(req, res, next) {
        try {
            const { id } = req.params;
            const moderatorId = req.user.id;
            const event = await event_repository_1.EventRepository.moderateEvent(id, moderatorId, 'PUBLISHED');
            res.status(200).json({ success: true, data: event });
        }
        catch (err) {
            next(err);
        }
    }
    static async reject(req, res, next) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            const moderatorId = req.user.id;
            const event = await event_repository_1.EventRepository.moderateEvent(id, moderatorId, 'REJECTED', note);
            res.status(200).json({ success: true, data: event });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EventController = EventController;
