"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = __importDefault(require("./config/database"));
const logger_1 = __importDefault(require("./config/logger"));
const crypto_1 = require("./utils/crypto");
const seed_1 = require("./startup/seed");
// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Apply database schema (prisma db push)
// Runs before the server starts. Safe to run on every deploy:
//   - Creates tables / columns that don't exist yet
//   - Never deletes existing data
//   - Idempotent: no-ops if schema is already up to date
// ─────────────────────────────────────────────────────────────────────────────
function applyDatabaseSchema() {
    logger_1.default.info('📦 Applying database schema (prisma db push)...');
    try {
        (0, child_process_1.execSync)('npx prisma db push --skip-generate --accept-data-loss=false', {
            stdio: 'inherit',
            env: { ...process.env },
        });
        logger_1.default.info('✅ Database schema is up to date.');
    }
    catch (err) {
        logger_1.default.error('❌ prisma db push failed — server cannot start safely.', err);
        process.exit(1);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Bootstrap admin account
// Creates the initial admin only if it does not already exist.
// Never overwrites an existing admin password.
// ─────────────────────────────────────────────────────────────────────────────
async function bootstrapAdmin() {
    try {
        const adminEmailNormalized = (0, crypto_1.normalizeEmail)(env_1.env.ADMIN_EMAIL);
        const existingAdmin = await database_1.default.user.findUnique({
            where: { emailNormalized: adminEmailNormalized },
        });
        if (!existingAdmin) {
            const passwordHash = await (0, crypto_1.hashPassword)(env_1.env.ADMIN_INITIAL_PASSWORD);
            await database_1.default.user.create({
                data: {
                    name: env_1.env.ADMIN_NAME,
                    email: env_1.env.ADMIN_EMAIL,
                    emailNormalized: adminEmailNormalized,
                    passwordHash,
                    role: 'ADMIN',
                    accountStatus: 'ACTIVE',
                    emailVerified: true,
                    displayName: env_1.env.ADMIN_NAME,
                    anonymousAlias: 'Administrator',
                },
            });
            logger_1.default.info('✅ Admin account bootstrapped.');
        }
        else {
            logger_1.default.info('✓ Admin account already exists — skipping bootstrap.');
        }
    }
    catch (err) {
        logger_1.default.error('Error during admin bootstrap: %o', err);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Seed reference data (curriculum + grade scale)
// Idempotent: only inserts rows that are missing. Safe on every restart.
// ─────────────────────────────────────────────────────────────────────────────
async function runSeed() {
    await (0, seed_1.seedDatabase)(database_1.default);
}
// ─────────────────────────────────────────────────────────────────────────────
// Startup sequence
// ─────────────────────────────────────────────────────────────────────────────
async function initialize() {
    // Schema must be applied before anything else
    applyDatabaseSchema();
    // Admin bootstrap + seed run in parallel (both are independent)
    await Promise.all([bootstrapAdmin(), runSeed()]);
    logger_1.default.info('🟢 All startup checks passed.');
}
// ─────────────────────────────────────────────────────────────────────────────
// Start server — initialization runs before accepting any traffic
// ─────────────────────────────────────────────────────────────────────────────
initialize()
    .then(() => {
    const server = app_1.default.listen(env_1.env.PORT, () => {
        logger_1.default.info(`🚀 Campus Connect backend running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
    });
    // ── Graceful shutdown ──────────────────────────────────────────────────
    const handleGracefulShutdown = async (signal) => {
        logger_1.default.info(`Received ${signal}. Shutting down gracefully...`);
        server.close(async () => {
            logger_1.default.info('HTTP server closed.');
            await database_1.default.$disconnect();
            logger_1.default.info('Database connection closed.');
            process.exit(0);
        });
        // Force-kill after 10 s if connections don't drain
        setTimeout(() => {
            logger_1.default.error('Could not close connections in time — forcefully shutting down.');
            process.exit(1);
        }, 10_000);
    };
    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
})
    .catch((err) => {
    logger_1.default.error('❌ Fatal error during server initialization: %o', err);
    process.exit(1);
});
