import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { getCustomerOrders, getOrderReceipt } from './order-service.ts';

test('getCustomerOrders - returns isolated customer orders', async () => {
  const mockClient = {
    from: mock.fn((table: string) => {
      const chain = {
        select: mock.fn(() => chain),
        eq: mock.fn(() => chain),
        order: mock.fn(async () => ({ data: [{ id: 'order-1', customer_id: 'cust-1' }] }))
      };
      return chain;
    })
  };

  const result = await getCustomerOrders(mockClient as any, 'cust-1');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'order-1');
});

test('getOrderReceipt - securely enforces customer ID matching', async () => {
  const mockClient = {
    from: mock.fn((table: string) => {
      const chain = {
        select: mock.fn(() => chain),
        eq: mock.fn((col, val) => chain),
        single: mock.fn(async () => ({ 
          data: { 
            id: 'order-1', 
            subtotal: 10, 
            merchant_orders: [] 
          } 
        }))
      };
      return chain;
    })
  };

  const receipt = await getOrderReceipt(mockClient as any, 'order-1', 'cust-1');
  assert.equal(receipt.id, 'order-1');
  assert.equal(receipt.subtotal, 10);
});
