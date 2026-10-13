"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../config/logger"));
class TelegramService {
    botToken = env_1.env.TELEGRAM_BOT_TOKEN;
    chatId = env_1.env.TELEGRAM_CHAT_ID;
    async sendLabComplaintNotification(payload) {
        const timestampIST = payload.createdAt.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const message = `🔴 NEW ANONYMOUS LAB COMPLAINT

Complaint ID: ${payload.referenceId}
Floor: ${payload.floor}
Lab: ${payload.lab}
System Number: ${payload.systemNumber}

Issue:
${payload.description}

Submitted: ${timestampIST} IST
Status: OPEN

Please inspect the reported system.`;
        if (!this.botToken || !this.chatId) {
            logger_1.default.info(`[TelegramService MOCK] Token/ChatId not configured. Message content:\n${message}`);
            return { success: true };
        }
        try {
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            await axios_1.default.post(url, {
                chat_id: this.chatId,
                text: message,
            });
            return { success: true };
        }
        catch (error) {
            const errMsg = error.response?.data?.description || error.message || 'Unknown Telegram error';
            logger_1.default.error('Telegram notification failed: %s', errMsg);
            return { success: false, error: errMsg };
        }
    }
}
exports.telegramService = new TelegramService();
exports.default = exports.telegramService;
