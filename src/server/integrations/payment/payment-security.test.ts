import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../../services/order-service.ts';
import { MockPaymentProvider } from './mock-provider.ts';

test('Security - Webhook Signature Validation Blocks Forged Request', async () => {
  const provider = new MockPaymentProvider();
  
  // A forgeable webhook request
  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'mock',
      paymentId: 'pi_fake',
      orderId: 'ord_123',
      status: 'PAID'
    })
  });

  const result = await provider.handleWebhook(req);
  
  // The system should reject this due to missing signature
  assert.equal(result, null);
});

test('Multi-Stall Order Calculation - allocations and commission in sen', async () => {
  const items = [
    { dishId: 'dish-1', price: 10.00, quantity: 2 }, // 20.00
    { dishId: 'dish-2', price: 15.00, quantity: 1 }, // 15.00
    { dishId: 'dish-3', price: 25.00, quantity: 1 }  // 25.00
  ];

  let merchantPayouts: any = [];
  
  const mockClient = {
    from: mock.fn((table: string) => {
      const chain = {
        select: mock.fn(() => chain),
        in: mock.fn(async (col: string, vals: any[]) => {
          if (table === 'dishes') {
            return {
              data: [
                { id: 'dish-1', price: 10.00, food_outlet_id: 'stall-a', name: 'Nasi Lemak' },
                { id: 'dish-2', price: 15.00, food_outlet_id: 'stall-b', name: 'Mee Goreng' },
                { id: 'dish-3', price: 25.00, food_outlet_id: 'stall-c', name: 'Laksa' }
              ]
            };
          }
          if (table === 'food_outlets') {
            return {
              data: [
                { id: 'stall-a', fee_payer: 'MERCHANT', platform_fee_fixed: 0, platform_fee_percent: 0.10 },
                { id: 'stall-b', fee_payer: 'MERCHANT', platform_fee_fixed: 0, platform_fee_percent: 0.10 },
                { id: 'stall-c', fee_payer: 'MERCHANT', platform_fee_fixed: 0, platform_fee_percent: 0.10 }
              ]
            };
          }
          return { data: [] };
        }),
        update: mock.fn((payload) => {
          if (table === 'merchant_orders') {
             merchantPayouts.push(payload);
          }
          return chain;
        }),
        eq: mock.fn(() => chain),
        insert: mock.fn(() => chain),
        single: mock.fn(async () => ({ data: { id: 'ord-123' } }))
      };
      return chain;
    }),
    rpc: mock.fn(async () => ({ data: 'ord-123' }))
  };

  const result = await createOrder(mockClient as any, { items, tableSessionId: 'ts-123' });

  // 10*2 = 20, 15*1 = 15, 25*1 = 25. Total = 60.
  // 10% platform fee = 6.00
  assert.equal(result.subtotalAmount, 60.00);
  assert.equal(result.platformFeeAmount, 6.00); 
  assert.equal(result.merchantPayoutAmount, 54.00);
  assert.equal(result.totalAmount, 60.00);

  // Assert that per-stall allocations are correct
  // Stall A: 20 * 0.10 = 2 -> payout 18
  // Stall B: 15 * 0.10 = 1.5 -> payout 13.5
  // Stall C: 25 * 0.10 = 2.5 -> payout 22.5
  
  assert.equal(merchantPayouts.length, 3);
  const payouts = merchantPayouts.map((p: any) => p.merchant_payout_amount).sort();
  assert.deepEqual(payouts, [13.50, 18.00, 22.50]);
});

test('Order Service rejects negative quantities', async () => {
  const items = [
    { dishId: 'dish-1', quantity: -2 }
  ];
  
  const mockClient = {
    from: mock.fn((table: string) => {
      const chain = {
        select: mock.fn(() => chain),
        in: mock.fn(async () => ({ 
          data: [{ id: 'dish-1', price: 10, food_outlet_id: 'stall-a' }] 
        }))
      };
      return chain;
    })
  };

  await assert.rejects(
    createOrder(mockClient as any, { items }),
    /Invalid quantity for item/
  );
});

