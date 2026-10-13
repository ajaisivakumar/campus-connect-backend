"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CgpaRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class CgpaRepository {
    static async getCurriculumCourses(semester, regulation = '2025', programme = 'B.E. CSE') {
        return database_1.default.curriculumCourse.findMany({
            where: {
                semester,
                regulation,
                programme,
                isActive: true,
            },
            orderBy: { courseCode: 'asc' },
        });
    }
    static async getGradeScales(regulation = '2025', programme = 'B.E. CSE') {
        return database_1.default.gradeScale.findMany({
            where: {
                regulation,
                programme,
                isActive: true,
            },
            orderBy: { gradePoint: 'desc' },
        });
    }
    static async saveSemesterResult(data) {
        // Delete existing semester result if any to replace
        await database_1.default.studentSemesterResult.deleteMany({
            where: {
                studentId: data.studentId,
                semester: data.semester,
            },
        });
        return database_1.default.studentSemesterResult.create({
            data: {
                studentId: data.studentId,
                semester: data.semester,
                curriculumVersion: data.curriculumVersion,
                totalEligibleCredits: data.totalEligibleCredits,
                totalWeightedPoints: data.totalWeightedPoints,
                calculatedGPA: data.calculatedGPA,
                isPublishedToLeaderboard: data.isPublishedToLeaderboard,
                subjectGrades: {
                    create: data.subjectGrades.map((g) => ({
                        curriculumCourseId: g.curriculumCourseId || null,
                        subjectNameSnapshot: g.subjectNameSnapshot,
                        creditSnapshot: g.creditSnapshot,
                        letterGrade: g.letterGrade,
                        gradePointSnapshot: g.gradePointSnapshot,
                        includedInCalc: g.includedInCalc,
                        weightedPoints: g.weightedPoints,
                        selectedElective: g.selectedElective || null,
                    })),
                },
            },
            include: {
                subjectGrades: true,
            },
        });
    }
    static async getAllStudentResults(studentId) {
        return database_1.default.studentSemesterResult.findMany({
            where: { studentId },
            orderBy: { semester: 'asc' },
            include: {
                subjectGrades: true,
            },
        });
    }
    static async getStudentResultBySemester(studentId, semester) {
        return database_1.default.studentSemesterResult.findUnique({
            where: {
                studentId_semester: { studentId, semester },
            },
            include: {
                subjectGrades: true,
            },
        });
    }
    static async deleteStudentResultBySemester(studentId, semester) {
        return database_1.default.studentSemesterResult.delete({
            where: {
                studentId_semester: { studentId, semester },
            },
        });
    }
}
exports.CgpaRepository = CgpaRepository;
