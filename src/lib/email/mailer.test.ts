import test from 'node:test';
import assert from 'node:assert/strict';
import { sendStallInvitationEmail } from './mailer.ts';

test('sendStallInvitationEmail simulates delivery in dev mode when credentials are not configured', async () => {
  // Ensure no live email keys during test
  const originalResend = process.env.RESEND_API_KEY;
  const originalSmtp = process.env.SMTP_HOST;
  delete process.env.RESEND_API_KEY;
  delete process.env.SMTP_HOST;

  try {
    const result = await sendStallInvitationEmail({
      to: 'vendor@currymee.com',
      stallName: 'Ah Huat Curry Mee (Slot #02)',
      venueName: 'Setia Hawker Centre',
      setupLink: 'http://localhost:3000/booths/join?token=test-token-12345',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });

    assert.equal(result.success, true);
    assert.equal(result.delivered, false);
    assert.equal(result.simulated, true);
    assert.equal(result.provider, 'simulation');
    assert.equal(result.setupLink, 'http://localhost:3000/booths/join?token=test-token-12345');
  } finally {
    process.env.RESEND_API_KEY = originalResend;
    process.env.SMTP_HOST = originalSmtp;
  }
});
