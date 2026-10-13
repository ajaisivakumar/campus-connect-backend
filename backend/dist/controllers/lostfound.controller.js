"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LostFoundController = void 0;
const lostfound_repository_1 = require("../repositories/lostfound.repository");
const storage_service_1 = __importDefault(require("../services/storage.service"));
const audit_service_1 = __importDefault(require("../audit/audit.service"));
class LostFoundController {
    static async list(req, res, next) {
        try {
            const { status, search } = req.query;
            const items = await lostfound_repository_1.LostFoundRepository.getItems(status, search);
            res.status(200).json({ success: true, data: items });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const item = await lostfound_repository_1.LostFoundRepository.getItemById(id);
            if (!item || item.isHidden) {
                res.status(404).json({ success: false, message: 'Item not found' });
                return;
            }
            res.status(200).json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'Image upload is mandatory for lost & found items' });
                return;
            }
            const userId = req.user?.id;
            const imageUrl = storage_service_1.default.getFileUrl(req.file.filename);
            const imageKey = req.file.filename;
            const item = await lostfound_repository_1.LostFoundRepository.createItem({
                creatorId: userId,
                itemName: req.body.itemName,
                category: req.body.category,
                imageUrl,
                imageKey,
                foundLocation: req.body.foundLocation,
                currentLocation: req.body.currentLocation,
                description: req.body.description,
                itemStatus: req.body.itemStatus || 'FOUND',
            });
            if (userId) {
                await audit_service_1.default.log({
                    eventType: 'LOST_FOUND_POSTED',
                    actorId: userId,
                    targetType: 'LOST_FOUND',
                    targetId: item.id,
                    outcome: 'SUCCESS',
                });
            }
            res.status(201).json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await lostfound_repository_1.LostFoundRepository.getItemById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Item not found' });
                return;
            }
            if (existing.creatorId && existing.creatorId !== req.user?.id && req.user?.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to edit this item' });
                return;
            }
            const updated = await lostfound_repository_1.LostFoundRepository.updateItem(id, req.body);
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const existing = await lostfound_repository_1.LostFoundRepository.getItemById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Item not found' });
                return;
            }
            if (existing.creatorId && existing.creatorId !== req.user?.id && req.user?.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
                return;
            }
            await storage_service_1.default.deleteFile(existing.imageKey);
            await lostfound_repository_1.LostFoundRepository.deleteItem(id);
            res.status(200).json({ success: true, message: 'Item deleted successfully' });
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
            await lostfound_repository_1.LostFoundRepository.reportItem(reporterId, id, reason);
            res.status(200).json({ success: true, message: 'Report submitted to moderators' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.LostFoundController = LostFoundController;
