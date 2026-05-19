import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { BadRequestException } from "../../exceptions";
import {
  APPLICATION_NAME,
  EMAIL_APP,
  EMAIL_APP_PASSWORD,
} from "../../../config/config";
export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
}: Mail.Options): Promise<void> => {
  if (!to && !cc && !bcc) {
    throw new BadRequestException(
      "Invalid request: At least one recipient must be provided",
    );
  }
  if (!(html as string)?.length && !attachments.length) {
    throw new BadRequestException(
      "Invalid request: Either HTML content or attachments must be provided",
    );
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_APP,
      pass: EMAIL_APP_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
    from: `"${APPLICATION_NAME} 🎈" <${EMAIL_APP}>`,
  });
  console.log("Message sent:", info.messageId);
};