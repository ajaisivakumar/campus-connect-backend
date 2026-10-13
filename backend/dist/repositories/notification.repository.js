"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class NotificationRepository {
    static async createNotification(data) {
        return database_1.default.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                body: data.body || null,
                relatedId: data.relatedId || null,
                relatedType: data.relatedType || null,
            },
        });
    }
    static async getUserNotifications(userId) {
        return database_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    static async markAsRead(id, userId) {
        return database_1.default.notification.updateMany({
            where: { id, userId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    static async markAllAsRead(userId) {
        return database_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
