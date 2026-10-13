"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("./config/passport"));
const env_1 = require("./config/env");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
// Import routers
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const poll_routes_1 = __importDefault(require("./routes/poll.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const opportunity_routes_1 = __importDefault(require("./routes/opportunity.routes"));
const lostfound_routes_1 = __importDefault(require("./routes/lostfound.routes"));
const complaint_routes_1 = __importDefault(require("./routes/complaint.routes"));
const cgpa_routes_1 = __importDefault(require("./routes/cgpa.routes"));
const exam_routes_1 = __importDefault(require("./routes/exam.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const app = (0, express_1.default)();
// Security HTTP headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: [env_1.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static file serving for uploads
const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
app.use('/uploads', express_1.default.static(uploadDir));
// Express Session setup with connect-pg-simple
const PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use((0, express_session_1.default)({
    store: new PgSession({
        conString: env_1.env.DATABASE_URL,
        createTableIfMissing: true,
        tableName: 'user_sessions',
    }),
    secret: env_1.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
        httpOnly: true,
        secure: env_1.env.COOKIE_SECURE || env_1.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: env_1.env.COOKIE_DOMAIN || undefined,
    },
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Global Rate Limiting
app.use('/api', rate_limit_middleware_1.generalLimiter);
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/polls', poll_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api', opportunity_routes_1.default); // contains /api/opportunities and /api/conversations
app.use('/api/lost-and-found', lostfound_routes_1.default);
app.use('/api/lab-complaints', complaint_routes_1.default);
app.use('/api/cgpa', cgpa_routes_1.default);
app.use('/api/exam', exam_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/health', health_routes_1.default);
// Centralized error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
