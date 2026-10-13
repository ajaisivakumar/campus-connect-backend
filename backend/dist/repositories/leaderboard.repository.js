"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class LeaderboardRepository {
    static async upsertLeaderboardEntry(data) {
        return database_1.default.leaderboardEntry.upsert({
            where: {
                userId_academicBatch_semesterMilestone: {
                    userId: data.userId,
                    academicBatch: data.academicBatch,
                    semesterMilestone: data.semesterMilestone,
                },
            },
            update: {
                validatedCGPA: data.validatedCGPA,
                semesterResultId: data.semesterResultId || null,
                displayMode: data.displayMode || 'ANONYMOUS',
                publicDisplayName: data.publicDisplayName || null,
                consentGiven: data.consentGiven,
                isPublished: data.isPublished !== undefined ? data.isPublished : true,
            },
            create: {
                userId: data.userId,
                academicBatch: data.academicBatch,
                semesterMilestone: data.semesterMilestone,
                validatedCGPA: data.validatedCGPA,
                semesterResultId: data.semesterResultId || null,
                displayMode: data.displayMode || 'ANONYMOUS',
                publicDisplayName: data.publicDisplayName || null,
                consentGiven: data.consentGiven,
                isPublished: data.isPublished !== undefined ? data.isPublished : true,
            },
        });
    }
    static async getLeaderboard(academicBatch, semesterMilestone) {
        const where = {
            academicBatch,
            isPublished: true,
            isEligible: true,
            consentGiven: true,
        };
        if (semesterMilestone) {
            where.semesterMilestone = semesterMilestone;
        }
        const entries = await database_1.default.leaderboardEntry.findMany({
            where,
            orderBy: { validatedCGPA: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        anonymousAlias: true,
                    },
                },
            },
        });
        // Sanitize user name according to displayMode
        return entries.map((entry, index) => {
            let displayName = 'Anonymous Student';
            if (entry.displayMode === 'PUBLIC_NAME') {
                displayName = entry.user.name;
            }
            else if (entry.displayMode === 'CUSTOM_ALIAS') {
                displayName = entry.publicDisplayName || entry.user.displayName || 'Anonymous Student';
            }
            else {
                displayName = entry.user.anonymousAlias || `Student #${index + 1}`;
            }
            return {
                rank: index + 1,
                id: entry.id,
                displayName,
                displayMode: entry.displayMode,
                validatedCGPA: entry.validatedCGPA,
                semesterMilestone: entry.semesterMilestone,
                academicBatch: entry.academicBatch,
            };
        });
    }
    static async getUserEntries(userId) {
        return database_1.default.leaderboardEntry.findMany({
            where: { userId },
            orderBy: { semesterMilestone: 'desc' },
        });
    }
    static async removeUserFromLeaderboard(userId, academicBatch, semesterMilestone) {
        return database_1.default.leaderboardEntry.deleteMany({
            where: {
                userId,
                academicBatch,
                semesterMilestone,
            },
        });
    }
}
exports.LeaderboardRepository = LeaderboardRepository;
