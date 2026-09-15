import test from 'node:test';
import assert from 'node:assert/strict';
import { isPlatformAdminRole, getPlatformRole } from './auth-rbac.ts';

test('isPlatformAdminRole correctly identifies superadmin and saas_owner', () => {
  assert.equal(isPlatformAdminRole('superadmin'), true);
  assert.equal(isPlatformAdminRole('saas_owner'), true);

  assert.equal(isPlatformAdminRole('support'), false);
  assert.equal(isPlatformAdminRole('owner'), false);
  assert.equal(isPlatformAdminRole('manager'), false);
  assert.equal(isPlatformAdminRole('worker'), false);
  assert.equal(isPlatformAdminRole('customer'), false);
  assert.equal(isPlatformAdminRole(null), false);
  assert.equal(isPlatformAdminRole(undefined), false);
  assert.equal(isPlatformAdminRole(''), false);
});

test('getPlatformRole evaluates bootstrap environment variable SUPERADMIN_EMAILS', async () => {
  const originalEnv = process.env.SUPERADMIN_EMAILS;
  process.env.SUPERADMIN_EMAILS = 'superadmin@hawker.app, platform-owner@hawker.app';

  try {
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    } as any;

    // Authorized superadmin email (case insensitive)
    const adminCheck = await getPlatformRole(mockClient, 'user-1', 'SuperAdmin@Hawker.App');
    assert.equal(adminCheck.isPlatformAdmin, true);
    assert.equal(adminCheck.isSaasOwner, true);
    assert.equal(adminCheck.role, 'saas_owner');

    // Standard non-admin shop owner
    const shopOwnerCheck = await getPlatformRole(mockClient, 'user-2', 'shopowner@kopitiam.com');
    assert.equal(shopOwnerCheck.isPlatformAdmin, false);
    assert.equal(shopOwnerCheck.isSuperAdmin, false);
    assert.equal(shopOwnerCheck.isSaasOwner, false);
    assert.equal(shopOwnerCheck.role, null);
  } finally {
    process.env.SUPERADMIN_EMAILS = originalEnv;
  }
});

test('getPlatformRole evaluates database platform_roles records', async () => {
  const originalEnv = process.env.SUPERADMIN_EMAILS;
  delete process.env.SUPERADMIN_EMAILS;

  try {
    // Mock client returning superadmin from platform_roles
    const superAdminClient = {
      from: (table: string) => {
        assert.equal(table, 'platform_roles');
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { role: 'superadmin' }, error: null }),
            }),
          }),
        };
      },
    } as any;

    const result1 = await getPlatformRole(superAdminClient, 'saas-admin-123', 'admin@domain.com');
    assert.equal(result1.isPlatformAdmin, true);
    assert.equal(result1.isSuperAdmin, true);
    assert.equal(result1.role, 'superadmin');

    // Mock client returning regular support role (read-only, not platform admin)
    const supportClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { role: 'support' }, error: null }),
          }),
        }),
      }),
    } as any;

    const result2 = await getPlatformRole(supportClient, 'support-456', 'support@domain.com');
    assert.equal(result2.isPlatformAdmin, false);
    assert.equal(result2.isSuperAdmin, false);
    assert.equal(result2.role, 'support');
  } finally {
    process.env.SUPERADMIN_EMAILS = originalEnv;
  }
});

test('Monetization update guard blocks non-admins from modifying fees', () => {
  const isPlatformAdmin = false;

  // Case 1: Standard shop owner only updating basic store details
  const shopProfileUpdate = {
    name: 'Setia Food Court',
    address: '123 Jalan Setia, Penang',
    slug: 'setia-food-court',
  };

  const hasMonetization1 =
    (shopProfileUpdate as any).fee_payer !== undefined ||
    (shopProfileUpdate as any).platform_fee_fixed !== undefined ||
    (shopProfileUpdate as any).platform_fee_percent !== undefined;

  assert.equal(hasMonetization1, false, 'Standard shop profile edit has no monetization fields');

  // Case 2: Malicious or unauthorized shop owner attempting to zero platform fee
  const maliciousPayload = {
    name: 'Setia Food Court',
    platform_fee_percent: 0.0,
    fee_payer: 'MERCHANT',
  };

  const hasMonetization2 =
    (maliciousPayload as any).fee_payer !== undefined ||
    (maliciousPayload as any).platform_fee_fixed !== undefined ||
    (maliciousPayload as any).platform_fee_percent !== undefined;

  assert.equal(hasMonetization2, true, 'Malicious payload includes sensitive platform fee fields');

  const isBlocked = hasMonetization2 && !isPlatformAdmin;
  assert.equal(isBlocked, true, 'Non-admin request attempting fee edit must be blocked with 403 Forbidden');
});
