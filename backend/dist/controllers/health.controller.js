"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const database_1 = __importDefault(require("../config/database"));
class HealthController {
    static async check(_req, res) {
        try {
            await database_1.default.$queryRaw `SELECT 1`;
            res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                database: 'connected',
                uptime: process.uptime(),
            });
        }
        catch (err) {
            res.status(503).json({
                status: 'degraded',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: err.message,
            });
        }
    }
}
exports.HealthController = HealthController;
