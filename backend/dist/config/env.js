"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.env = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    DATABASE_URL: process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/college_community?schema=public',
    SESSION_SECRET: process.env.SESSION_SECRET || 'super-secret-session-key-minimum-32-chars-long',
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',
    COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
    // Admin bootstrap
    ADMIN_NAME: process.env.ADMIN_NAME || 'System Administrator',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@college.edu',
    ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@SecurePassword2026!',
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    // Email (SMTP)
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || 'notifications@college.edu',
    SMTP_PASS: process.env.SMTP_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'College Community <notifications@college.edu>',
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || 'facilities@college.edu',
    // Telegram Bot
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
    // AI Service
    AI_PROVIDER: process.env.AI_PROVIDER || 'MOCK',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    // Storage
    STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'LOCAL',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
};
exports.config = {
    port: exports.env.PORT,
    jwtSecret: exports.env.SESSION_SECRET,
    frontendUrl: exports.env.FRONTEND_URL,
    isDev: exports.env.NODE_ENV !== 'production',
};
exports.default = exports.env;
