import nodemailer from 'nodemailer';

interface EmailUser {
  name: string;
  email: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@genesis.ai';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 28px; font-weight: 700; color: #18181b; letter-spacing: -0.5px; }
    .logo span { color: #6366f1; }
    .content { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .footer { text-align: center; margin-top: 32px; color: #71717a; font-size: 13px; }
    h1 { color: #18181b; font-size: 22px; margin-bottom: 16px; }
    p { color: #3f3f46; line-height: 1.6; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GENE<span>SIS</span></div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} GENESIS. All rights reserved.</p>
      <p>AI Co-Founder Platform for Startups</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[Email] SMTP not configured. Would send to ${to}: ${subject}`);
      return true;
    }

    await transporter.sendMail({
      from: `"GENESIS" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export async function sendWelcomeEmail(user: EmailUser): Promise<boolean> {
  const content = `
    <h1>Welcome to GENESIS, ${user.name}!</h1>
    <p>We're thrilled to have you on board. GENESIS is your AI-powered co-founder platform, designed to help you build, grow, and scale your startup.</p>
    <p>Here's what you can do to get started:</p>
    <ul>
      <li>Set up your company profile</li>
      <li>Define your vision, mission, and goals</li>
      <li>Explore AI-powered insights and strategies</li>
      <li>Create your first business plan or pitch deck</li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="btn">Go to Dashboard</a>
    </p>
    <p>If you have any questions, reply to this email or reach out to our support team.</p>
    <p>Best,<br>The GENESIS Team</p>`;

  return sendEmail(user.email, 'Welcome to GENESIS - Your AI Co-Founder', baseTemplate(content));
}

export async function sendPasswordResetEmail(user: EmailUser, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const content = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
    <p>Best,<br>The GENESIS Team</p>`;

  return sendEmail(user.email, 'Reset Your GENESIS Password', baseTemplate(content));
}

export async function sendInvitationEmail(
  email: string,
  company: { name: string },
  invitedBy: { name: string }
): Promise<boolean> {
  const content = `
    <h1>You've Been Invited!</h1>
    <p>${invitedBy.name} has invited you to join <strong>${company.name}</strong> on GENESIS.</p>
    <p>GENESIS is an AI-powered co-founder platform that helps startups build, grow, and scale. As a team member, you'll have access to:</p>
    <ul>
      <li>AI-powered strategic advice</li>
      <li>Business planning tools</li>
      <li>Financial modeling and analysis</li>
      <li>Collaborative workspace</li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/register?invitation=true" class="btn">Accept Invitation</a>
    </p>
    <p>If you don't want to join, you can safely ignore this email.</p>
    <p>Best,<br>The GENESIS Team</p>`;

  return sendEmail(email, `You're Invited to Join ${company.name} on GENESIS`, baseTemplate(content));
}

export async function sendNotificationEmail(
  user: EmailUser,
  title: string,
  message: string
): Promise<boolean> {
  const content = `
    <h1>${title}</h1>
    <p>Hi ${user.name},</p>
    <p>${message}</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="btn">View in Dashboard</a>
    </p>
    <p>Best,<br>The GENESIS Team</p>`;

  return sendEmail(user.email, `GENESIS: ${title}`, baseTemplate(content));
}
