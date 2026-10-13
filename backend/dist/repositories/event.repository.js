"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class EventRepository {
    static async createEvent(creatorId, data) {
        return database_1.default.event.create({
            data: {
                creatorId,
                title: data.title,
                category: data.category,
                description: data.description,
                brochureUrl: data.brochureUrl || null,
                brochureKey: data.brochureKey || null,
                registrationUrl: data.registrationUrl || null,
                eventStartDate: data.eventStartDate ? new Date(data.eventStartDate) : null,
                eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : null,
                registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
                organizer: data.organizer || null,
                location: data.location || null,
                format: data.format || 'OFFLINE',
                status: 'PENDING',
            },
        });
    }
    static async getPublishedEvents(category, search) {
        const where = { status: 'PUBLISHED' };
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { organizer: { contains: search, mode: 'insensitive' } },
            ];
        }
        return database_1.default.event.findMany({
            where,
            orderBy: { eventStartDate: 'asc' },
            include: {
                creator: {
                    select: { id: true, name: true, displayName: true },
                },
            },
        });
    }
    static async getEventById(id) {
        return database_1.default.event.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, name: true, displayName: true, email: true },
                },
            },
        });
    }
    static async updateEvent(id, data) {
        return database_1.default.event.update({
            where: { id },
            data,
        });
    }
    static async deleteEvent(id) {
        return database_1.default.event.delete({ where: { id } });
    }
    static async reportEvent(reporterId, eventId, reason) {
        return database_1.default.report.create({
            data: {
                reporterId,
                entityType: 'EVENT',
                entityId: eventId,
                reason,
            },
        });
    }
    static async getAllEventsAdmin(status) {
        const where = {};
        if (status)
            where.status = status;
        return database_1.default.event.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                reports: true,
            },
        });
    }
    static async moderateEvent(id, moderatorId, status, moderatorNote) {
        return database_1.default.event.update({
            where: { id },
            data: {
                status,
                moderatorId,
                moderatorNote: moderatorNote || null,
            },
        });
    }
}
exports.EventRepository = EventRepository;
