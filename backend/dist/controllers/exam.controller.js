"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamController = void 0;
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../config/database"));
const ai_service_1 = __importDefault(require("../services/ai.service"));
const storage_service_1 = __importDefault(require("../services/storage.service"));
class ExamController {
    static async extract(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'Please upload an image of the timetable' });
                return;
            }
            const fileBuffer = fs_1.default.readFileSync(req.file.path);
            const extracted = await ai_service_1.default.extractTimetableFromImage(req.file.path, fileBuffer);
            res.status(200).json({
                success: true,
                data: {
                    ...extracted,
                    sourceImageUrl: storage_service_1.default.getFileUrl(req.file.filename),
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async analyze(req, res, next) {
        try {
            const { exams } = req.body;
            if (!Array.isArray(exams) || exams.length === 0) {
                res.status(400).json({ success: false, message: 'List of exams is required for analysis' });
                return;
            }
            const today = new Date();
            const analyzed = exams.map((exam) => {
                const examDate = new Date(exam.examDate);
                const diffMs = examDate.getTime() - today.getTime();
                const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                let urgency = 'NORMAL';
                if (daysRemaining <= 3)
                    urgency = 'CRITICAL';
                else if (daysRemaining <= 7)
                    urgency = 'HIGH';
                else if (daysRemaining <= 14)
                    urgency = 'MODERATE';
                return {
                    ...exam,
                    daysRemaining,
                    urgency,
                };
            });
            res.status(200).json({ success: true, data: analyzed });
        }
        catch (err) {
            next(err);
        }
    }
    static async studyPlan(req, res, next) {
        try {
            const { exams } = req.body;
            if (!Array.isArray(exams) || exams.length === 0) {
                res.status(400).json({ success: false, message: 'List of exams is required to build a study plan' });
                return;
            }
            const plan = await ai_service_1.default.generateStudyPlan(exams);
            res.status(200).json({ success: true, data: plan });
        }
        catch (err) {
            next(err);
        }
    }
    static async getTimetables(req, res, next) {
        try {
            const userId = req.user.id;
            const timetables = await database_1.default.examTimetable.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: { exams: { orderBy: { examDate: 'asc' } } },
            });
            res.status(200).json({ success: true, data: timetables });
        }
        catch (err) {
            next(err);
        }
    }
    static async createTimetable(req, res, next) {
        try {
            const userId = req.user.id;
            const { semester, academicYear, institution, branch, sourceImageUrl, exams, warnings } = req.body;
            const timetable = await database_1.default.examTimetable.create({
                data: {
                    userId,
                    semester: semester ? Number(semester) : null,
                    academicYear: academicYear || null,
                    institution: institution || null,
                    branch: branch || null,
                    sourceImageUrl: sourceImageUrl || null,
                    warnings: warnings || null,
                    status: 'CONFIRMED',
                    exams: {
                        create: (exams || []).map((e) => ({
                            subjectCode: e.subjectCode || null,
                            subjectName: e.subjectName,
                            examDate: new Date(e.examDate),
                            session: e.session || null,
                            confidence: e.confidence || null,
                            warnings: e.warnings || null,
                        })),
                    },
                },
                include: { exams: true },
            });
            res.status(201).json({ success: true, data: timetable });
        }
        catch (err) {
            next(err);
        }
    }
    static async getTimetableById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const timetable = await database_1.default.examTimetable.findFirst({
                where: { id, userId },
                include: { exams: { orderBy: { examDate: 'asc' } } },
            });
            if (!timetable) {
                res.status(404).json({ success: false, message: 'Timetable not found' });
                return;
            }
            res.status(200).json({ success: true, data: timetable });
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteTimetable(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await database_1.default.examTimetable.deleteMany({
                where: { id, userId },
            });
            res.status(200).json({ success: true, message: 'Timetable deleted' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ExamController = ExamController;
