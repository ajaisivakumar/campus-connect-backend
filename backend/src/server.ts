import { execSync } from 'child_process';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import logger from './config/logger';
import { hashPassword, normalizeEmail } from './utils/crypto';
import { seedDatabase } from './startup/seed';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Apply database schema (prisma db push)
// Runs before the server starts. Safe to run on every deploy:
//   - Creates tables / columns that don't exist yet
//   - Never deletes existing data
//   - Idempotent: no-ops if schema is already up to date
// ─────────────────────────────────────────────────────────────────────────────
function applyDatabaseSchema(): void {
  logger.info('📦 Applying database schema (prisma db push)...');
  try {
    execSync('node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss=false', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    logger.info('✅ Database schema is up to date.');
  } catch (err) {
    logger.error('❌ prisma db push failed — server cannot start safely.', err);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Bootstrap admin account
// Creates the initial admin only if it does not already exist.
// Never overwrites an existing admin password.
// ─────────────────────────────────────────────────────────────────────────────
async function bootstrapAdmin(): Promise<void> {
  try {
    const adminEmailNormalized = normalizeEmail(env.ADMIN_EMAIL);
    const existingAdmin = await prisma.user.findUnique({
      where: { emailNormalized: adminEmailNormalized },
    });

    if (!existingAdmin) {
      const passwordHash = await hashPassword(env.ADMIN_INITIAL_PASSWORD);
      await prisma.user.create({
        data: {
          name:             env.ADMIN_NAME,
          email:            env.ADMIN_EMAIL,
          emailNormalized:  adminEmailNormalized,
          passwordHash,
          role:             'ADMIN',
          accountStatus:    'ACTIVE',
          emailVerified:    true,
          displayName:      env.ADMIN_NAME,
          anonymousAlias:   'Administrator',
        },
      });
      logger.info('✅ Admin account bootstrapped.');
    } else {
      logger.info('✓ Admin account already exists — skipping bootstrap.');
    }
  } catch (err) {
    logger.error('Error during admin bootstrap: %o', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Seed reference data (curriculum + grade scale)
// Idempotent: only inserts rows that are missing. Safe on every restart.
// ─────────────────────────────────────────────────────────────────────────────
async function runSeed(): Promise<void> {
  await seedDatabase(prisma);
}

// ─────────────────────────────────────────────────────────────────────────────
// Startup sequence
// ─────────────────────────────────────────────────────────────────────────────
async function initialize(): Promise<void> {
  // Schema must be applied before anything else
  applyDatabaseSchema();

  // Admin bootstrap + seed run in parallel (both are independent)
  await Promise.all([bootstrapAdmin(), runSeed()]);

  logger.info('🟢 All startup checks passed.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Start server — initialization runs before accepting any traffic
// ─────────────────────────────────────────────────────────────────────────────
initialize()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Campus Connect backend running on port ${env.PORT} in ${env.NODE_ENV} mode`,
      );
    });

    // ── Graceful shutdown ──────────────────────────────────────────────────
    const handleGracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        logger.info('Database connection closed.');
        process.exit(0);
      });

      // Force-kill after 10 s if connections don't drain
      setTimeout(() => {
        logger.error('Could not close connections in time — forcefully shutting down.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT',  () => handleGracefulShutdown('SIGINT'));
  })
  .catch((err) => {
    logger.error('❌ Fatal error during server initialization: %o', err);
    process.exit(1);
  });
