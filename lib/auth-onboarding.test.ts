import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeRedirectPath,
  resolveAuthRedirect,
  resolveUserDestination,
} from './auth-redirect.ts';

test('sanitizeRedirectPath allows safe relative paths and blocks open redirects & auth loops', () => {
  // Safe relative paths
  assert.equal(sanitizeRedirectPath('/apply'), '/apply');
  assert.equal(sanitizeRedirectPath('/shop-owner/booths'), '/shop-owner/booths');
  assert.equal(sanitizeRedirectPath('/home'), '/home');

  // Blocks open-redirect attacks
  assert.equal(sanitizeRedirectPath('https://evil.com'), null);
  assert.equal(sanitizeRedirectPath('//malicious.site/phish'), null);
  assert.equal(sanitizeRedirectPath('javascript:alert(1)'), null);

  // Blocks auth loops
  assert.equal(sanitizeRedirectPath('/auth'), null);
  assert.equal(sanitizeRedirectPath('/auth?redirect=/home'), null);
  assert.equal(sanitizeRedirectPath('/auth/signin'), null);

  // Handles null / empty
  assert.equal(sanitizeRedirectPath(null), null);
  assert.equal(sanitizeRedirectPath(undefined), null);
  assert.equal(sanitizeRedirectPath(''), null);
});

test('resolveAuthRedirect prioritizes explicit /apply redirect', () => {
  const result = resolveAuthRedirect('/apply');
  assert.equal(result, '/apply');
});

test('resolveUserDestination directs explicit /apply to /apply for onboarding', async () => {
  const mockUser = { id: 'usr-123', email: 'hawker@example.com' } as any;

  // When explicit /apply is provided, user is directed to /apply
  const destination = await resolveUserDestination(null, mockUser, '/apply');
  assert.equal(destination, '/apply');
});

test('resolveUserDestination directs existing shop owner to /shop-owner/booths by default', async () => {
  const mockUser = { id: 'usr-owner-456', email: 'owner@example.com' } as any;

  // Mock Supabase client returning existing restaurant_memberships
  const mockClient = {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          limit: async () => {
            if (table === 'restaurant_memberships') {
              return { data: [{ id: 'rm-1', restaurant_id: 'rest-1', role: 'owner' }], error: null };
            }
            return { data: [], error: null };
          },
        }),
      }),
    }),
  } as any;

  const destination = await resolveUserDestination(mockClient, mockUser, null);
  assert.equal(destination, '/shop-owner/booths');
});

test('resolveUserDestination directs stall merchant to /owner by default', async () => {
  const mockUser = { id: 'usr-merchant-789', email: 'merchant@example.com' } as any;

  // Mock Supabase client returning no restaurant membership, but merchant_memberships
  const mockClient = {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          limit: async () => {
            if (table === 'restaurant_memberships') {
              return { data: [], error: null };
            }
            if (table === 'merchant_memberships') {
              return { data: [{ id: 'mm-1', food_outlet_id: 'fo-1', role: 'owner' }], error: null };
            }
            return { data: [], error: null };
          },
        }),
      }),
    }),
  } as any;

  const destination = await resolveUserDestination(mockClient, mockUser, null);
  assert.equal(destination, '/owner');
});

test('resolveUserDestination directs regular diner to /home by default', async () => {
  const mockUser = { id: 'usr-diner-101', email: 'diner@example.com' } as any;

  const mockClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
    }),
  } as any;

  const destination = await resolveUserDestination(mockClient, mockUser, null);
  assert.equal(destination, '/home');
});
