"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSemesterResultSchema = exports.subjectGradeInputSchema = void 0;
const zod_1 = require("zod");
exports.subjectGradeInputSchema = zod_1.z.object({
    curriculumCourseId: zod_1.z.string().uuid().optional().nullable(),
    subjectNameSnapshot: zod_1.z.string().min(1).max(200),
    creditSnapshot: zod_1.z.coerce.number().min(0.5).max(30),
    letterGrade: zod_1.z.string().min(1).max(5),
    includedInCalc: zod_1.z.boolean().default(true),
    selectedElective: zod_1.z.string().max(200).optional().nullable(),
});
exports.saveSemesterResultSchema = zod_1.z.object({
    semester: zod_1.z.coerce.number().int().min(1).max(10),
    curriculumVersion: zod_1.z.string().default('2025'),
    subjectGrades: zod_1.z.array(exports.subjectGradeInputSchema).min(1, 'At least one subject grade required'),
    isPublishedToLeaderboard: zod_1.z.boolean().default(false),
    academicBatch: zod_1.z.string().optional().default('2025-2029'),
});
