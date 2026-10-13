"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_repository_1 = require("../repositories/notification.repository");
class NotificationController {
    static async list(req, res, next) {
        try {
            const userId = req.user.id;
            const notifications = await notification_repository_1.NotificationRepository.getUserNotifications(userId);
            res.status(200).json({ success: true, data: notifications });
        }
        catch (err) {
            next(err);
        }
    }
    static async markRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await notification_repository_1.NotificationRepository.markAsRead(id, userId);
            res.status(200).json({ success: true, message: 'Notification marked as read' });
        }
        catch (err) {
            next(err);
        }
    }
    static async markAllRead(req, res, next) {
        try {
            const userId = req.user.id;
            await notification_repository_1.NotificationRepository.markAllAsRead(userId);
            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
