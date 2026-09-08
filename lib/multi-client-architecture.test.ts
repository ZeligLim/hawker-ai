import test from 'node:test';
import assert from 'node:assert/strict';
import { PermissionEngine } from './shared/permissions.ts';
import type { UserAuthorizationState } from './shared/types.ts';

// Helper fixtures
const mockDinerAuth: UserAuthorizationState = {
  userId: 'usr-customer-1',
  isAuthenticated: true,
  isCustomer: true,
  isStallWorker: false,
  isShopOwner: false,
  stallMemberships: [],
  shopMemberships: [],
};

const mockStallWorkerAAuth: UserAuthorizationState = {
  userId: 'usr-worker-stall-a',
  isAuthenticated: true,
  isCustomer: true,
  isStallWorker: true,
  isShopOwner: false,
  stallMemberships: [
    {
      userId: 'usr-worker-stall-a',
      foodOutletId: 'stall-outlet-a',
      role: 'staff',
      outletName: 'Hainanese Chicken Rice',
      restaurantId: 'centre-lot10',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
  shopMemberships: [],
};

const mockShopOwnerAuth: UserAuthorizationState = {
  userId: 'usr-shop-owner-1',
  isAuthenticated: true,
  isCustomer: true,
  isStallWorker: false,
  isShopOwner: true,
  stallMemberships: [],
  shopMemberships: [
    {
      id: 'rm-1',
      userId: 'usr-shop-owner-1',
      restaurantId: 'centre-lot10',
      role: 'owner',
      restaurantName: 'Lot 10 Hutong',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
};

const mockUnauthenticated: UserAuthorizationState = {
  userId: '',
  isAuthenticated: false,
  isCustomer: true,
  isStallWorker: false,
  isShopOwner: false,
  stallMemberships: [],
  shopMemberships: [],
};

test('1. Client Path Resolution: identifies the correct client experience', () => {
  // Public website / marketing
  assert.equal(PermissionEngine.getClientForPath('/'), 'website');
  assert.equal(PermissionEngine.getClientForPath('/pricing'), 'website');
  assert.equal(PermissionEngine.getClientForPath('/plans'), 'website');
  assert.equal(PermissionEngine.getClientForPath('/apply'), 'website');
  assert.equal(PermissionEngine.getClientForPath('/auth'), 'website');

  // Customer App
  assert.equal(PermissionEngine.getClientForPath('/home'), 'customer');
  assert.equal(PermissionEngine.getClientForPath('/menu'), 'customer');
  assert.equal(PermissionEngine.getClientForPath('/orders'), 'customer');
  assert.equal(PermissionEngine.getClientForPath('/profile'), 'customer');
  assert.equal(PermissionEngine.getClientForPath('/scan'), 'customer');
  assert.equal(PermissionEngine.getClientForPath('/shop/stall-1'), 'customer');

  // Hawker Stall App
  assert.equal(PermissionEngine.getClientForPath('/stall'), 'stall');
  assert.equal(PermissionEngine.getClientForPath('/owner'), 'stall');
  assert.equal(PermissionEngine.getClientForPath('/owner/orders'), 'stall');
  assert.equal(PermissionEngine.getClientForPath('/owner/menu'), 'stall');

  // Shop Owner App
  assert.equal(PermissionEngine.getClientForPath('/shop-owner'), 'owner');
  assert.equal(PermissionEngine.getClientForPath('/shop-owner/booths'), 'owner');
  assert.equal(PermissionEngine.getClientForPath('/shop-owner/analytics'), 'owner');
});

test('2. Customer Client Boundaries: unauthenticated or diner access', () => {
  // Diners and guests can access Customer App
  assert.equal(PermissionEngine.canAccessCustomer(mockUnauthenticated), true);
  assert.equal(PermissionEngine.canAccessCustomer(mockDinerAuth), true);

  // Diners CANNOT access Stall App
  assert.equal(PermissionEngine.canAccessStall(mockDinerAuth), false);
  const dinerToStall = PermissionEngine.isRouteAllowed('/owner/orders', mockDinerAuth);
  assert.equal(dinerToStall.allowed, false);
  assert.equal(dinerToStall.redirectUrl, '/profile');

  // Diners CANNOT access Shop Owner App
  assert.equal(PermissionEngine.canAccessOwner(mockDinerAuth), false);
  const dinerToOwner = PermissionEngine.isRouteAllowed('/shop-owner/booths', mockDinerAuth);
  assert.equal(dinerToOwner.allowed, false);
  assert.equal(dinerToOwner.redirectUrl, '/apply');
});

test('3. Stall Worker Isolation: worker can manage own stall, but NOT other stalls or owner analytics', () => {
  // Worker A can manage Stall A
  assert.equal(PermissionEngine.canAccessStall(mockStallWorkerAAuth, 'stall-outlet-a'), true);
  assert.equal(PermissionEngine.canManageStallOrder(mockStallWorkerAAuth, 'stall-outlet-a'), true);
  assert.equal(PermissionEngine.canManageStallDishes(mockStallWorkerAAuth, 'stall-outlet-a'), true);

  // Cross-Stall Isolation: Worker A CANNOT manage Stall B!
  assert.equal(PermissionEngine.canAccessStall(mockStallWorkerAAuth, 'stall-outlet-b'), false);
  assert.equal(PermissionEngine.canManageStallOrder(mockStallWorkerAAuth, 'stall-outlet-b'), false);
  assert.equal(PermissionEngine.canManageStallDishes(mockStallWorkerAAuth, 'stall-outlet-b'), false);

  // Stall Worker CANNOT view Shop Owner Analytics
  assert.equal(PermissionEngine.canViewShopAnalytics(mockStallWorkerAAuth, 'centre-lot10'), false);
  assert.equal(PermissionEngine.canAccessOwner(mockStallWorkerAAuth), false);

  const workerToAnalytics = PermissionEngine.isRouteAllowed('/shop-owner/analytics', mockStallWorkerAAuth);
  assert.equal(workerToAnalytics.allowed, false);
});

test('4. Shop Owner Isolation: owner can manage own venue, but NOT another venue', () => {
  // Owner can access their own shop (centre-lot10)
  assert.equal(PermissionEngine.canAccessOwner(mockShopOwnerAuth, 'centre-lot10'), true);
  assert.equal(PermissionEngine.canViewShopAnalytics(mockShopOwnerAuth, 'centre-lot10'), true);
  assert.equal(PermissionEngine.canManageShopSettings(mockShopOwnerAuth, 'centre-lot10'), true);

  // Cross-Shop Isolation: Owner 1 CANNOT manage Shop 2!
  assert.equal(PermissionEngine.canAccessOwner(mockShopOwnerAuth, 'centre-amoy-street'), false);
  assert.equal(PermissionEngine.canViewShopAnalytics(mockShopOwnerAuth, 'centre-amoy-street'), false);
  assert.equal(PermissionEngine.canManageShopSettings(mockShopOwnerAuth, 'centre-amoy-street'), false);
});

test('5. Unauthenticated Redirection: protects stall and owner portals with return redirect', () => {
  const stallAuthCheck = PermissionEngine.isRouteAllowed('/owner/orders', mockUnauthenticated);
  assert.equal(stallAuthCheck.allowed, false);
  assert.equal(stallAuthCheck.redirectUrl, '/auth?redirect=%2Fowner%2Forders');

  const ownerAuthCheck = PermissionEngine.isRouteAllowed('/shop-owner/booths', mockUnauthenticated);
  assert.equal(ownerAuthCheck.allowed, false);
  assert.equal(ownerAuthCheck.redirectUrl, '/auth?redirect=%2Fshop-owner%2Fbooths');
});
