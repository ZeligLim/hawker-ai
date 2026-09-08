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

test('Customer intent route classification: guest mode applies strictly within customer app routes', () => {
  const isCustomerRoute = (redirectParam?: string | null): boolean => {
    return Boolean(
      redirectParam &&
        (redirectParam.startsWith('/home') ||
          redirectParam.startsWith('/menu') ||
          redirectParam.startsWith('/orders') ||
          redirectParam.startsWith('/scan') ||
          redirectParam.startsWith('/shop/') ||
          redirectParam === '/shop' ||
          redirectParam.startsWith('/results'))
    );
  };

  // Customer app routes allow guest mode
  assert.equal(isCustomerRoute('/home'), true);
  assert.equal(isCustomerRoute('/menu'), true);
  assert.equal(isCustomerRoute('/orders'), true);
  assert.equal(isCustomerRoute('/scan'), true);
  assert.equal(isCustomerRoute('/shop/madam-kwan'), true);
  assert.equal(isCustomerRoute('/results?query=laksa'), true);

  // Marketing, operator onboarding, and stall worker routes DO NOT allow guest mode
  assert.equal(isCustomerRoute(null), false);
  assert.equal(isCustomerRoute(''), false);
  assert.equal(isCustomerRoute('/'), false);
  assert.equal(isCustomerRoute('/apply'), false);
  assert.equal(isCustomerRoute('/owner'), false);
  assert.equal(isCustomerRoute('/owner/orders'), false);
  assert.equal(isCustomerRoute('/shop-owner/booths'), false);
  assert.equal(isCustomerRoute('/pricing'), false);
});

test('Marketing nav role detection & dashboard visibility logic', () => {
  const evaluateNavState = (roles: { hasShopOwner: boolean; hasBooth: boolean }) => {
    const hasShop = roles.hasShopOwner;
    const hasStall = roles.hasBooth;
    const hasDashboard = hasShop || hasStall;
    const hasBoth = hasShop && hasStall;
    const showStartFree = !hasShop; // Start Free only shows if shop onboarding NOT completed

    return {
      hasDashboard,
      hasBoth,
      showStartFree,
      dashboardType: hasBoth ? 'dropdown' : hasShop ? 'shop' : hasStall ? 'stall' : 'none',
      targetHref: hasBoth ? null : hasShop ? '/shop-owner/booths' : hasStall ? '/owner/orders' : null,
    };
  };

  // 1. Regular Diner / Customer (neither shop nor booth)
  const dinerState = evaluateNavState({ hasShopOwner: false, hasBooth: false });
  assert.equal(dinerState.hasDashboard, false);
  assert.equal(dinerState.dashboardType, 'none');
  assert.equal(dinerState.showStartFree, true);

  // 2. Shop Owner Only
  const shopOnlyState = evaluateNavState({ hasShopOwner: true, hasBooth: false });
  assert.equal(shopOnlyState.hasDashboard, true);
  assert.equal(shopOnlyState.hasBoth, false);
  assert.equal(shopOnlyState.dashboardType, 'shop');
  assert.equal(shopOnlyState.targetHref, '/shop-owner/booths');
  assert.equal(shopOnlyState.showStartFree, false); // Hidden because shop onboarding is complete

  // 3. Stall Worker Only (from email invitation)
  const stallOnlyState = evaluateNavState({ hasShopOwner: false, hasBooth: true });
  assert.equal(stallOnlyState.hasDashboard, true);
  assert.equal(stallOnlyState.hasBoth, false);
  assert.equal(stallOnlyState.dashboardType, 'stall');
  assert.equal(stallOnlyState.targetHref, '/owner/orders');
  assert.equal(stallOnlyState.showStartFree, true); // Shown to allow registering a shop

  // 4. Dual Role Account (both Shop Owner AND Stall Worker)
  const dualRoleState = evaluateNavState({ hasShopOwner: true, hasBooth: true });
  assert.equal(dualRoleState.hasDashboard, true);
  assert.equal(dualRoleState.hasBoth, true);
  assert.equal(dualRoleState.dashboardType, 'dropdown'); // Renders dropdown with both options
  assert.equal(dualRoleState.showStartFree, false); // Hidden because shop onboarding is complete
});

