"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const exceptions_1 = require("../../exceptions");
const config_1 = require("../../../config/config");
const sendEmail = async ({ to, cc, bcc, subject, html, attachments = [], }) => {
    if (!to && !cc && !bcc) {
        throw new exceptions_1.BadRequestException("Invalid request: At least one recipient must be provided");
    }
    if (!html?.length && !attachments.length) {
        throw new exceptions_1.BadRequestException("Invalid request: Either HTML content or attachments must be provided");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_1.EMAIL_APP,
            pass: config_1.EMAIL_APP_PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
        from: `"${config_1.APPLICATION_NAME} 🎈" <${config_1.EMAIL_APP}>`,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
