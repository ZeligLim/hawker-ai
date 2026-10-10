import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { isUserAuthorizedForOutlet } from './menu-service.ts';

test('isUserAuthorizedForOutlet - authorized via direct merchant membership', async () => {
  const mockClient = {
    from: mock.fn((table: string) => {
      if (table === 'merchant_memberships') {
        return {
          select: mock.fn(() => ({
            eq: mock.fn(() => ({
              eq: mock.fn(() => ({
                maybeSingle: mock.fn(async () => ({ data: { food_outlet_id: 'outlet-1' } }))
              }))
            }))
          }))
        };
      }
      return { select: mock.fn() };
    })
  };

  const result = await isUserAuthorizedForOutlet(mockClient as any, 'user-1', 'outlet-1');
  assert.equal(result, true);
});

test('isUserAuthorizedForOutlet - unauthorized user', async () => {
  const mockClient = {
    from: mock.fn((table: string) => {
      if (table === 'merchant_memberships') {
        return {
          select: mock.fn(() => ({
            eq: mock.fn(() => ({
              eq: mock.fn(() => ({
                maybeSingle: mock.fn(async () => ({ data: null }))
              }))
            }))
          }))
        };
      }
      if (table === 'food_outlets') {
        return {
          select: mock.fn(() => ({
            eq: mock.fn(() => ({
              maybeSingle: mock.fn(async () => ({ data: null }))
            }))
          }))
        };
      }
      return { select: mock.fn() };
    })
  };

  const result = await isUserAuthorizedForOutlet(mockClient as any, 'user-1', 'outlet-1');
  assert.equal(result, false);
});
