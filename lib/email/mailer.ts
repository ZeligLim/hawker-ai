import nodemailer from 'nodemailer';

export interface StallInvitationEmailParams {
  to: string;
  stallName: string;
  venueName: string;
  setupLink: string;
  expiresAt: string;
}

export interface EmailDispatchResult {
  success: boolean;
  delivered: boolean;
  simulated: boolean;
  provider: 'resend' | 'smtp' | 'simulation';
  previewUrl?: string;
  error?: string;
  setupLink: string;
}

/**
 * Generate responsive HTML email for Stall Setup Invitations
 */
function buildInvitationHtml({
  to,
  stallName,
  venueName,
  setupLink,
  expiresAt,
}: StallInvitationEmailParams): string {
  const expiryFormatted = new Date(expiresAt).toLocaleDateString('en-MY', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stall Setup Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f7;
      margin: 0;
      padding: 24px;
      color: #1d1d1f;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
    .header {
      background: #111827;
      padding: 36px 32px;
      text-align: center;
    }
    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.14);
      color: #f59e0b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      padding: 5px 14px;
      border-radius: 100px;
      margin-bottom: 12px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 36px 32px;
    }
    .lead {
      font-size: 16px;
      line-height: 1.6;
      color: #1d1d1f;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .summary-card {
      background: #fbfbfd;
      border: 1px solid #e5e5ea;
      border-radius: 18px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f2;
      font-size: 13px;
    }
    .summary-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .summary-row:first-child {
      padding-top: 0;
    }
    .summary-label {
      color: #6e6e73;
    }
    .summary-value {
      font-weight: 600;
      color: #1d1d1f;
      text-align: right;
    }
    .cta-wrapper {
      text-align: center;
      margin: 32px 0 28px;
    }
    .btn {
      display: inline-block;
      background: #0071e3;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 15px 36px;
      border-radius: 100px;
      box-shadow: 0 4px 14px rgba(0, 113, 227, 0.35);
    }
    .perks-list {
      margin: 28px 0;
      border-top: 1px solid #f0f0f2;
      padding-top: 24px;
    }
    .perk-item {
      font-size: 13px;
      color: #424245;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .perk-item strong {
      color: #1d1d1f;
    }
    .alt-link-box {
      background: #f5f5f7;
      border-radius: 12px;
      padding: 14px;
      font-size: 11px;
      color: #86868b;
      word-break: break-all;
      line-height: 1.5;
      margin-top: 24px;
    }
    .footer {
      background: #fbfbfd;
      border-top: 1px solid #f0f0f2;
      padding: 24px 32px;
      text-align: center;
      font-size: 11px;
      color: #86868b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-badge">Hawker Stall Invite</div>
      <h1>Operate your stall on Hawker</h1>
    </div>

    <div class="content">
      <p class="lead">
        Hello! You have been authorized by the food hall operator at <strong>${venueName}</strong> to configure and operate the stall slot <strong>${stallName}</strong>.
      </p>

      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Venue</span>
          <span class="summary-value">${venueName}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Booth Slot</span>
          <span class="summary-value">${stallName}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Authorized Email</span>
          <span class="summary-value">${to}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Link Valid Until</span>
          <span class="summary-value">${expiryFormatted}</span>
        </div>
      </div>

      <div class="cta-wrapper">
        <a href="${setupLink}" class="btn" target="_blank" rel="noreferrer">
          Accept Invite & Set Up Stall &rsaquo;
        </a>
      </div>

      <div class="perks-list">
        <div class="perk-item">
          <strong>⚡ Real-Time Digital Menu:</strong> Add your signature dishes, customize prices, and toggle sold-out availability in 1 tap.
        </div>
        <div class="perk-item">
          <strong>🛎️ Live Kitchen Display (KDS):</strong> Receive orders directly to your station the moment customers scan their table QR.
        </div>
        <div class="perk-item">
          <strong>💰 100% Payout Retention:</strong> Zero monthly software subscriptions and 0% platform commission on stall earnings.
        </div>
      </div>

      <div class="alt-link-box">
        If the button above does not work, copy and paste this link into your browser:<br>
        <a href="${setupLink}" style="color: #0071e3;">${setupLink}</a>
      </div>
    </div>

    <div class="footer">
      This invitation was issued specifically to <strong>${to}</strong>.<br>
      Only this email is authorized to claim control of this stall.<br>
      &copy; ${new Date().getFullYear()} Hawker Platform. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate plain text fallback for email clients
 */
function buildInvitationText({
  to,
  stallName,
  venueName,
  setupLink,
  expiresAt,
}: StallInvitationEmailParams): string {
  return `You've been invited to operate ${stallName} at ${venueName} on the Hawker Platform!

Authorized Email: ${to}
Link Valid Until: ${new Date(expiresAt).toLocaleDateString()}

Click the link below to accept your invitation and configure your stall:
${setupLink}

What you'll get:
- Real-time digital menu management & 1-tap sold-out controls
- Direct-to-station live Kitchen Display (KDS)
- 100% payout retention (0% platform commission on stall earnings)

Only ${to} is authorized to claim this stall. If you were not expecting this invitation, you can safely ignore this message.`;
}

/**
 * Dispatches an email using Resend (if RESEND_API_KEY is configured),
 * SMTP (if SMTP_HOST is configured), or local simulation.
 */
export async function sendStallInvitationEmail(
  params: StallInvitationEmailParams
): Promise<EmailDispatchResult> {
  const subject = `You've been invited to manage ${params.stallName} at ${params.venueName}`;
  const html = buildInvitationHtml(params);
  const text = buildInvitationText(params);

  // 1. Check Resend API Key
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey !== 'your_resend_api_key') {
    try {
      const fromEmail =
        process.env.RESEND_FROM ||
        process.env.EMAIL_FROM ||
        'Hawker Platform <onboarding@resend.dev>';

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.to],
          subject,
          html,
          text,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? `Resend API failed with status ${response.status}`);
      }

      console.log(`[Email] Stall invitation delivered to ${params.to} via Resend (${data?.id})`);

      return {
        success: true,
        delivered: true,
        simulated: false,
        provider: 'resend',
        setupLink: params.setupLink,
      };
    } catch (error) {
      console.error('[Email Error] Resend dispatch failed:', error);
      // Fall through to SMTP or simulation
    }
  }

  // 2. Check SMTP Configuration
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      });

      const fromEmail =
        process.env.SMTP_FROM ||
        process.env.EMAIL_FROM ||
        `Hawker Platform <noreply@${smtpHost.includes('.') ? smtpHost.split('.').slice(-2).join('.') : 'hawker.app'}>`;

      const info = await transporter.sendMail({
        from: fromEmail,
        to: params.to,
        subject,
        html,
        text,
      });

      console.log(`[Email] Stall invitation delivered to ${params.to} via SMTP (${info.messageId})`);

      return {
        success: true,
        delivered: true,
        simulated: false,
        provider: 'smtp',
        setupLink: params.setupLink,
      };
    } catch (error) {
      console.error('[Email Error] SMTP dispatch failed:', error);
      // Fall through to simulation
    }
  }

  // 3. Dev Simulation Mode (No external email credentials configured)
  console.log(`\n═══════════════════════════════════════════════════════════════════════`);
  console.log(`📨 [HAWKER EMAIL DISPATCH (DEV PREVIEW)]`);
  console.log(`To:          ${params.to}`);
  console.log(`Subject:     ${subject}`);
  console.log(`Venue:       ${params.venueName}`);
  console.log(`Stall Slot:  ${params.stallName}`);
  console.log(`Setup Link:  ${params.setupLink}`);
  console.log(`Expires At:  ${params.expiresAt}`);
  console.log(`Provider:    None configured (set RESEND_API_KEY or SMTP_HOST in .env.local)`);
  console.log(`═══════════════════════════════════════════════════════════════════════\n`);

  return {
    success: true,
    delivered: false,
    simulated: true,
    provider: 'simulation',
    setupLink: params.setupLink,
  };
}
