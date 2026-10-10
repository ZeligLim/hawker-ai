import test from 'node:test';
import assert from 'node:assert/strict';
import { MockPaymentProvider } from './mock-provider.ts';
import crypto from 'crypto';

test('MockPaymentProvider - handles valid webhook and marks as PAID', async () => {
  const provider = new MockPaymentProvider();
  
  const body = JSON.stringify({
      provider: 'mock',
      paymentId: 'pi_abc123',
      orderId: 'ord_xyz',
      status: 'PAID'
    });
  const signature = crypto.createHmac('sha256', process.env.MOCK_WEBHOOK_SECRET || 'test-secret').update(body).digest('hex');
  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'x-mock-signature': signature },
    body
  });

  const result = await provider.handleWebhook(req);
  assert.notEqual(result, null);
  assert.equal(result!.status, 'PAID');
  assert.equal(result!.orderId, 'ord_xyz');
  assert.equal(result!.paymentId, 'pi_abc123');
});

test('MockPaymentProvider - rejects webhook for mismatched provider', async () => {
  const provider = new MockPaymentProvider();
  
  const body = JSON.stringify({
      provider: 'stripe',
      paymentId: 'pi_abc123',
      orderId: 'ord_xyz',
      status: 'PAID'
    });
  const signature = crypto.createHmac('sha256', process.env.MOCK_WEBHOOK_SECRET || 'test-secret').update(body).digest('hex');
  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'x-mock-signature': signature },
    body
  });

  const result = await provider.handleWebhook(req);
  assert.equal(result, null);
});

test('MockPaymentProvider - creates payment successfully', async () => {
  const provider = new MockPaymentProvider();
  const res = await provider.createPayment({
    orderId: 'ord_123',
    amount: 100,
    currency: 'MYR',
    returnUrl: 'http://localhost/return'
  });

  assert.equal(res.status, 'PENDING');
  assert.ok(res.paymentId.startsWith('mock_pi_'));
  assert.ok(res.redirectUrl.includes('mock-payment'));
});
