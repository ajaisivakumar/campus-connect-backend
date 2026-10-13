"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LostFoundRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class LostFoundRepository {
    static async createItem(data) {
        return database_1.default.lostFoundItem.create({
            data: {
                creatorId: data.creatorId || null,
                itemName: data.itemName || null,
                category: data.category || null,
                imageUrl: data.imageUrl,
                imageKey: data.imageKey,
                foundLocation: data.foundLocation || null,
                currentLocation: data.currentLocation || null,
                description: data.description || null,
                itemStatus: data.itemStatus || 'FOUND',
                publicationStatus: 'PUBLISHED',
            },
        });
    }
    static async getItems(status, search) {
        const where = { isHidden: false, publicationStatus: 'PUBLISHED' };
        if (status)
            where.itemStatus = status;
        if (search) {
            where.OR = [
                { itemName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { foundLocation: { contains: search, mode: 'insensitive' } },
            ];
        }
        return database_1.default.lostFoundItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { id: true, name: true, displayName: true },
                },
            },
        });
    }
    static async getItemById(id) {
        return database_1.default.lostFoundItem.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, name: true, displayName: true, email: true },
                },
            },
        });
    }
    static async updateItem(id, data) {
        return database_1.default.lostFoundItem.update({
            where: { id },
            data,
        });
    }
    static async deleteItem(id) {
        return database_1.default.lostFoundItem.delete({ where: { id } });
    }
    static async reportItem(reporterId, itemId, reason) {
        return database_1.default.report.create({
            data: {
                reporterId,
                entityType: 'LOST_FOUND',
                entityId: itemId,
                reason,
            },
        });
    }
}
exports.LostFoundRepository = LostFoundRepository;
