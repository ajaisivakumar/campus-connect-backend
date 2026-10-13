"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
// Route imports
const auth_routes_1 = require("./routes/auth.routes");
const poll_routes_1 = require("./routes/poll.routes");
const event_routes_1 = require("./routes/event.routes");
const opportunity_routes_1 = require("./routes/opportunity.routes");
const lostfound_routes_1 = require("./routes/lostfound.routes");
const complaint_routes_1 = require("./routes/complaint.routes");
const cgpa_routes_1 = require("./routes/cgpa.routes");
const exam_routes_1 = require("./routes/exam.routes");
const leaderboard_routes_1 = require("./routes/leaderboard.routes");
const notification_routes_1 = require("./routes/notification.routes");
const admin_routes_1 = require("./routes/admin.routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [env_1.config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Campus Connect Backend', timestamp: new Date().toISOString() });
});
// Mount API routes
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/polls', poll_routes_1.pollRouter);
app.use('/api/events', event_routes_1.eventRouter);
app.use('/api/opportunities', opportunity_routes_1.opportunityRouter);
app.use('/api/lostfound', lostfound_routes_1.lostfoundRouter);
app.use('/api/complaints', complaint_routes_1.complaintRouter);
app.use('/api/cgpa', cgpa_routes_1.cgpaRouter);
app.use('/api/exams', exam_routes_1.examRouter);
app.use('/api/leaderboard', leaderboard_routes_1.leaderboardRouter);
app.use('/api/notifications', notification_routes_1.notificationRouter);
app.use('/api/admin', admin_routes_1.adminRouter);
app.use(errorHandler_1.errorHandler);
const server = app.listen(env_1.config.port, () => {
    console.log(`🚀 Campus Connect Server running on http://localhost:${env_1.config.port}`);
    console.log(`📡 Accepting requests from: ${env_1.config.frontendUrl}`);
});
exports.default = app;
