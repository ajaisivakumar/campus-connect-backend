"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComplaintRefId = exports.normalizeEmail = exports.hashToken = exports.generateSecureToken = exports.comparePassword = exports.hashPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateSecureToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};
exports.normalizeEmail = normalizeEmail;
const generateComplaintRefId = (dailySequence) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const seq = String(dailySequence).padStart(6, '0');
    return `LAB-${yyyy}${mm}${dd}-${seq}`;
};
exports.generateComplaintRefId = generateComplaintRefId;
