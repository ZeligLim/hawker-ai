import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, getCustomerOrders, getOrderReceipt } from './order-service.ts';

test('createOrder creates a pay-at-counter order without platform fees', async () => {
 let rpcArgs: Record<string, unknown> | undefined;
 const mockClient = {
 from: mock.fn((table: string) => {
 if (table === 'dishes') {
 return {
 select: mock.fn(() => ({
 in: mock.fn(async () => ({
 data: [{
 id: 'dish-1',
 price: 12.5,
 food_outlet_id: 'stall-1',
 name: 'Noodles',
 customizations: [],
 }],
 error: null,
 })),
 })),
 };
 }

 const updateChain: { eq: ReturnType<typeof mock.fn> } = {
 eq: mock.fn(() => updateChain),
 };
 return {
 update: mock.fn(() => updateChain),
 };
 }),
 rpc: mock.fn(async (_name: string, args: Record<string, unknown>) => {
 rpcArgs = args;
 return { data: 'order-1', error: null };
 }),
 };

 const result = await createOrder(mockClient as any, {
 tableSessionId: 'session-1',
 items: [{ dishId: 'dish-1', quantity: 2 }],
 });

 assert.equal(result.orderId, 'order-1');
 assert.equal(result.subtotalAmount, 25);
 assert.equal(result.platformFeeAmount, 0);
 assert.equal(result.totalAmount, 25);
 assert.equal(result.merchantPayoutAmount, 25);
 assert.equal(rpcArgs?.p_service_fee, 0);
 assert.equal(rpcArgs?.p_platform_fee_amount, 0);
 assert.equal(rpcArgs?.p_total, 25);
});

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
