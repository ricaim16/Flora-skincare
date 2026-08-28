import nodemailer from "nodemailer";
import type { SessionRole } from "./auth";

type PasswordResetEmailResult = {
  delivered: boolean;
  previewCode?: string;
};

function getTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

export async function sendPasswordResetEmail({
  email,
  code,
  accountType,
}: {
  email: string;
  code: string;
  accountType: SessionRole;
}): Promise<PasswordResetEmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `Password reset OTP for ${accountType} ${email}: ${code} (EMAIL_USER / EMAIL_PASS not configured)`
    );

    return {
      delivered: false,
      previewCode: process.env.NODE_ENV === "production" ? undefined : code,
    };
  }

  await transporter.sendMail({
    from: `"Flora Skincare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Flora Skincare verification code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #221230;">
        <h2 style="margin-bottom: 12px;">Password Reset Verification</h2>
        <p>Use the OTP below to continue resetting your Flora Skincare ${accountType} account password.</p>
        <div style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 10px; color: #6d28d9;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true };
}
