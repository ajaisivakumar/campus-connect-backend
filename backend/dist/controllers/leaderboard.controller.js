"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardController = void 0;
const leaderboard_repository_1 = require("../repositories/leaderboard.repository");
const cgpa_repository_1 = require("../repositories/cgpa.repository");
class LeaderboardController {
    static async getLeaderboard(req, res, next) {
        try {
            const { academicBatch = '2025-2029', semesterMilestone } = req.query;
            const milestone = semesterMilestone ? parseInt(semesterMilestone, 10) : undefined;
            const leaderboard = await leaderboard_repository_1.LeaderboardRepository.getLeaderboard(academicBatch, milestone);
            res.status(200).json({ success: true, data: leaderboard });
        }
        catch (err) {
            next(err);
        }
    }
    static async publish(req, res, next) {
        try {
            const userId = req.user.id;
            const { semesterMilestone, academicBatch, displayMode, publicDisplayName, consentGiven } = req.body;
            // Verify that user actually has results for this semester
            const semResult = await cgpa_repository_1.CgpaRepository.getStudentResultBySemester(userId, semesterMilestone);
            if (!semResult) {
                res.status(400).json({
                    success: false,
                    message: `You do not have saved GPA/CGPA results for Semester ${semesterMilestone}`,
                });
                return;
            }
            // Compute CGPA up to this milestone
            const allResults = await cgpa_repository_1.CgpaRepository.getAllStudentResults(userId);
            const eligibleResults = allResults.filter((r) => r.semester <= semesterMilestone);
            let cumulativeCredits = 0;
            let cumulativeWeighted = 0;
            eligibleResults.forEach((r) => {
                cumulativeCredits += r.totalEligibleCredits;
                cumulativeWeighted += r.totalWeightedPoints;
            });
            const validatedCGPA = cumulativeCredits > 0
                ? parseFloat((cumulativeWeighted / cumulativeCredits).toFixed(2))
                : semResult.calculatedGPA;
            const entry = await leaderboard_repository_1.LeaderboardRepository.upsertLeaderboardEntry({
                userId,
                academicBatch: academicBatch || '2025-2029',
                semesterMilestone,
                validatedCGPA,
                semesterResultId: semResult.id,
                displayMode,
                publicDisplayName,
                consentGiven,
                isPublished: true,
            });
            res.status(200).json({
                success: true,
                message: 'Your validated CGPA has been published to the leaderboard',
                data: entry,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateConsent(req, res, next) {
        try {
            const userId = req.user.id;
            const { semesterMilestone, academicBatch, displayMode, publicDisplayName, isPublished } = req.body;
            const existingEntries = await leaderboard_repository_1.LeaderboardRepository.getUserEntries(userId);
            const target = existingEntries.find((e) => e.academicBatch === (academicBatch || '2025-2029') && e.semesterMilestone === semesterMilestone);
            if (!target) {
                res.status(404).json({ success: false, message: 'Leaderboard entry not found' });
                return;
            }
            const updated = await leaderboard_repository_1.LeaderboardRepository.upsertLeaderboardEntry({
                userId,
                academicBatch: target.academicBatch,
                semesterMilestone: target.semesterMilestone,
                validatedCGPA: target.validatedCGPA,
                semesterResultId: target.semesterResultId || undefined,
                displayMode: displayMode || target.displayMode,
                publicDisplayName: publicDisplayName !== undefined ? publicDisplayName : target.publicDisplayName,
                consentGiven: true,
                isPublished: isPublished !== undefined ? isPublished : target.isPublished,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async remove(req, res, next) {
        try {
            const userId = req.user.id;
            const { semesterMilestone, academicBatch = '2025-2029' } = req.body;
            await leaderboard_repository_1.LeaderboardRepository.removeUserFromLeaderboard(userId, academicBatch, Number(semesterMilestone));
            res.status(200).json({ success: true, message: 'Unpublished from leaderboard' });
        }
        catch (err) {
            next(err);
        }
    }
    static async getMyEntries(req, res, next) {
        try {
            const userId = req.user.id;
            const entries = await leaderboard_repository_1.LeaderboardRepository.getUserEntries(userId);
            res.status(200).json({ success: true, data: entries });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.LeaderboardController = LeaderboardController;
