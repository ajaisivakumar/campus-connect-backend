"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const database_1 = __importDefault(require("./database"));
const crypto_1 = require("../utils/crypto");
const env_1 = require("./env");
const logger_1 = __importDefault(require("./logger"));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                accountStatus: true,
                emailVerified: true,
                displayName: true,
                anonymousAlias: true,
            },
        });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
// Local Strategy
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        const normalized = (0, crypto_1.normalizeEmail)(email);
        const user = await database_1.default.user.findUnique({
            where: { emailNormalized: normalized },
        });
        if (!user || !user.passwordHash) {
            return done(null, false, { message: 'Invalid email or password.' });
        }
        const isMatch = await (0, crypto_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password.' });
        }
        if (user.accountStatus === 'SUSPENDED') {
            return done(null, false, { message: 'Account is suspended.' });
        }
        return done(null, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            anonymousAlias: user.anonymousAlias,
        });
    }
    catch (err) {
        return done(err);
    }
}));
// Google OAuth Strategy
if (env_1.env.GOOGLE_CLIENT_ID && env_1.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.GOOGLE_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env_1.env.GOOGLE_CALLBACK_URL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in Google profile'), undefined);
            }
            const emailNormalized = (0, crypto_1.normalizeEmail)(email);
            const providerId = profile.id;
            // Check if auth provider exists
            let authProvider = await database_1.default.authProvider.findUnique({
                where: {
                    provider_providerId: {
                        provider: 'google',
                        providerId,
                    },
                },
                include: { user: true },
            });
            if (authProvider) {
                return done(null, authProvider.user);
            }
            // Check if user with email already exists
            let user = await database_1.default.user.findUnique({
                where: { emailNormalized },
            });
            if (!user) {
                user = await database_1.default.user.create({
                    data: {
                        name: profile.displayName || profile.name?.givenName || 'Google User',
                        email,
                        emailNormalized,
                        emailVerified: true,
                        accountStatus: 'ACTIVE',
                    },
                });
            }
            await database_1.default.authProvider.create({
                data: {
                    userId: user.id,
                    provider: 'google',
                    providerId,
                },
            });
            return done(null, user);
        }
        catch (err) {
            logger_1.default.error('Google OAuth error: %o', err);
            return done(err, undefined);
        }
    }));
}
exports.default = passport_1.default;
