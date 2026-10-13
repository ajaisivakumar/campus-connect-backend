"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserRepository {
    static async findById(id) {
        return database_1.default.user.findUnique({ where: { id } });
    }
    static async findByEmail(email) {
        return database_1.default.user.findUnique({ where: { email } });
    }
    static async findByNormalizedEmail(emailNormalized) {
        return database_1.default.user.findUnique({ where: { emailNormalized } });
    }
    static async createUser(data) {
        return database_1.default.user.create({ data });
    }
    static async updateUser(id, data) {
        return database_1.default.user.update({
            where: { id },
            data,
        });
    }
    static async updateLastLogin(id) {
        return database_1.default.user.update({
            where: { id },
            data: { lastLoginAt: new Date() },
        });
    }
    static async createEmailVerificationToken(userId, tokenHash, expiresAt) {
        return database_1.default.emailVerificationToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
    }
    static async findEmailVerificationToken(tokenHash) {
        return database_1.default.emailVerificationToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
    }
    static async markEmailVerificationTokenUsed(id) {
        return database_1.default.emailVerificationToken.update({
            where: { id },
            data: { usedAt: new Date() },
        });
    }
    static async createPasswordResetToken(userId, tokenHash, expiresAt) {
        return database_1.default.passwordResetToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
    }
    static async findPasswordResetToken(tokenHash) {
        return database_1.default.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
    }
    static async markPasswordResetTokenUsed(id) {
        return database_1.default.passwordResetToken.update({
            where: { id },
            data: { usedAt: new Date() },
        });
    }
    static async getAllUsers(skip = 0, take = 50, search) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, users] = await Promise.all([
            database_1.default.user.count({ where }),
            database_1.default.user.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    emailVerified: true,
                    displayName: true,
                    anonymousAlias: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            }),
        ]);
        return { total, users };
    }
}
exports.UserRepository = UserRepository;
