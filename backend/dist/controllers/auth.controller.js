"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const passport_1 = __importDefault(require("passport"));
const user_repository_1 = require("../repositories/user.repository");
const crypto_1 = require("../utils/crypto");
const email_service_1 = __importDefault(require("../services/email.service"));
const audit_service_1 = __importDefault(require("../audit/audit.service"));
const logger_1 = __importDefault(require("../config/logger"));
class AuthController {
    static async signup(req, res, next) {
        try {
            const { name, email, password, displayName } = req.body;
            const normalized = (0, crypto_1.normalizeEmail)(email);
            const existingUser = await user_repository_1.UserRepository.findByNormalizedEmail(normalized);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'An account with this email address already exists.',
                });
                return;
            }
            const passwordHash = await (0, crypto_1.hashPassword)(password);
            const user = await user_repository_1.UserRepository.createUser({
                name,
                email,
                emailNormalized: normalized,
                passwordHash,
                displayName: displayName || name,
                anonymousAlias: `Student_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                role: 'USER',
                accountStatus: 'PENDING_VERIFICATION',
                emailVerified: false,
            });
            // Generate verification token
            const rawToken = (0, crypto_1.generateSecureToken)();
            const tokenHash = (0, crypto_1.hashToken)(rawToken);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await user_repository_1.UserRepository.createEmailVerificationToken(user.id, tokenHash, expiresAt);
            await email_service_1.default.sendVerificationEmail(user.email, rawToken);
            await audit_service_1.default.log({
                eventType: 'USER_REGISTERED',
                actorId: user.id,
                actorRole: user.role,
                outcome: 'SUCCESS',
                description: `User registered: ${user.email}`,
            });
            res.status(201).json({
                success: true,
                message: 'Account registered successfully. Please check your email to verify your account.',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async signin(req, res, next) {
        passport_1.default.authenticate('local', (err, user, info) => {
            if (err)
                return next(err);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Invalid email or password.',
                });
            }
            req.logIn(user, async (loginErr) => {
                if (loginErr)
                    return next(loginErr);
                await user_repository_1.UserRepository.updateLastLogin(user.id);
                await audit_service_1.default.log({
                    eventType: 'USER_LOGIN',
                    actorId: user.id,
                    actorRole: user.role,
                    outcome: 'SUCCESS',
                    description: `User signed in: ${user.email}`,
                });
                return res.status(200).json({
                    success: true,
                    message: 'Signed in successfully.',
                    data: {
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            accountStatus: user.accountStatus,
                            emailVerified: user.emailVerified,
                            displayName: user.displayName,
                            anonymousAlias: user.anonymousAlias,
                        },
                    },
                });
            });
        })(req, res, next);
    }
    static async googleCallback(req, res, next) {
        passport_1.default.authenticate('google', (err, user) => {
            if (err || !user) {
                logger_1.default.error('Google OAuth callback failure: %o', err);
                return res.redirect('/login?error=oauth_failed');
            }
            req.logIn(user, async (loginErr) => {
                if (loginErr)
                    return next(loginErr);
                await user_repository_1.UserRepository.updateLastLogin(user.id);
                return res.redirect('/dashboard');
            });
        })(req, res, next);
    }
    static async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            const tokenHash = (0, crypto_1.hashToken)(token);
            const verificationRecord = await user_repository_1.UserRepository.findEmailVerificationToken(tokenHash);
            if (!verificationRecord) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token.',
                });
                return;
            }
            if (verificationRecord.usedAt) {
                res.status(400).json({
                    success: false,
                    message: 'Verification token has already been used.',
                });
                return;
            }
            if (new Date() > verificationRecord.expiresAt) {
                res.status(400).json({
                    success: false,
                    message: 'Verification token has expired. Please request a new one.',
                });
                return;
            }
            await user_repository_1.UserRepository.markEmailVerificationTokenUsed(verificationRecord.id);
            await user_repository_1.UserRepository.updateUser(verificationRecord.userId, {
                emailVerified: true,
                accountStatus: 'ACTIVE',
            });
            await audit_service_1.default.log({
                eventType: 'EMAIL_VERIFIED',
                actorId: verificationRecord.userId,
                outcome: 'SUCCESS',
                description: 'Email verified successfully',
            });
            res.status(200).json({
                success: true,
                message: 'Email verified successfully. You can now access all platform features.',
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            const user = await user_repository_1.UserRepository.findByNormalizedEmail((0, crypto_1.normalizeEmail)(email));
            if (user && !user.emailVerified) {
                const rawToken = (0, crypto_1.generateSecureToken)();
                const tokenHash = (0, crypto_1.hashToken)(rawToken);
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await user_repository_1.UserRepository.createEmailVerificationToken(user.id, tokenHash, expiresAt);
                await email_service_1.default.sendVerificationEmail(user.email, rawToken);
            }
            res.status(200).json({
                success: true,
                message: 'If an unverified account exists with this email, a verification link has been sent.',
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await user_repository_1.UserRepository.findByNormalizedEmail((0, crypto_1.normalizeEmail)(email));
            if (user) {
                const rawToken = (0, crypto_1.generateSecureToken)();
                const tokenHash = (0, crypto_1.hashToken)(rawToken);
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
                await user_repository_1.UserRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);
                await email_service_1.default.sendPasswordResetEmail(user.email, rawToken);
                await audit_service_1.default.log({
                    eventType: 'PASSWORD_RESET_REQUESTED',
                    actorId: user.id,
                    outcome: 'SUCCESS',
                });
            }
            res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been dispatched.',
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            const tokenHash = (0, crypto_1.hashToken)(token);
            const resetRecord = await user_repository_1.UserRepository.findPasswordResetToken(tokenHash);
            if (!resetRecord || resetRecord.usedAt || new Date() > resetRecord.expiresAt) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired password reset token.',
                });
                return;
            }
            const passwordHash = await (0, crypto_1.hashPassword)(newPassword);
            await user_repository_1.UserRepository.updateUser(resetRecord.userId, { passwordHash });
            await user_repository_1.UserRepository.markPasswordResetTokenUsed(resetRecord.id);
            await audit_service_1.default.log({
                eventType: 'PASSWORD_RESET_COMPLETED',
                actorId: resetRecord.userId,
                outcome: 'SUCCESS',
            });
            res.status(200).json({
                success: true,
                message: 'Password reset successfully. You may now log in with your new password.',
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async logout(req, res, next) {
        const userId = req.user?.id;
        req.logout((err) => {
            if (err)
                return next(err);
            req.session.destroy(() => {
                res.clearCookie('connect.sid');
                if (userId) {
                    audit_service_1.default.log({
                        eventType: 'USER_LOGOUT',
                        actorId: userId,
                        outcome: 'SUCCESS',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Logged out successfully.',
                });
            });
        });
    }
    static async me(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const user = await user_repository_1.UserRepository.findById(req.user.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                anonymousAlias: user.anonymousAlias,
                createdAt: user.createdAt,
            },
        });
    }
}
exports.AuthController = AuthController;
