"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../config/logger"));
class EmailService {
    transporter = null;
    constructor() {
        if (env_1.env.SMTP_USER && env_1.env.SMTP_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                host: env_1.env.SMTP_HOST,
                port: env_1.env.SMTP_PORT,
                secure: env_1.env.SMTP_SECURE,
                auth: {
                    user: env_1.env.SMTP_USER,
                    pass: env_1.env.SMTP_PASS,
                },
            });
        }
    }
    async sendVerificationEmail(to, token) {
        const verificationUrl = `${env_1.env.FRONTEND_URL}/verify-email?token=${token}`;
        const subject = 'Verify Your College Community Account';
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2>Welcome to College Community Platform!</h2>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This verification link will expire in 24 hours.</p>
      </div>
    `;
        return this.sendMail({ to, subject, html });
    }
    async sendPasswordResetEmail(to, token) {
        const resetUrl = `${env_1.env.FRONTEND_URL}/reset-password?token=${token}`;
        const subject = 'Password Reset Request';
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `;
        return this.sendMail({ to, subject, html });
    }
    async sendLabComplaintEmail(complaint) {
        const recipient = env_1.env.ADMIN_NOTIFICATION_EMAIL || env_1.env.ADMIN_EMAIL;
        const subject = `[Lab Complaint] System Issue Reported: ${complaint.referenceId}`;
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #b91c1c;">New Anonymous Lab Complaint</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Reference ID:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.referenceId}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Floor:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.floor}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Lab:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.lab}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">System Number:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.systemNumber}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Reported At:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
        </table>
        <h3 style="margin-top: 20px;">Issue Description:</h3>
        <p style="background: #f3f4f6; padding: 12px; border-radius: 6px;">${complaint.description}</p>
      </div>
    `;
        return this.sendMail({ to: recipient, subject, html });
    }
    async sendMail(options) {
        if (!this.transporter) {
            logger_1.default.info(`[EmailService MOCK] To: ${options.to} | Subject: "${options.subject}"`);
            return true;
        }
        try {
            await this.transporter.sendMail({
                from: env_1.env.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send email to %s: %o', options.to, error);
            return false;
        }
    }
}
exports.emailService = new EmailService();
exports.default = exports.emailService;
