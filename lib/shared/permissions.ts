/**
 * Hawker Multi-Client Platform Permission Engine
 *
 * Implements strict role-based capability evaluation and client boundaries.
 * Fully decoupled from React DOM / browser state for shared Web & Mobile execution.
 */

import type { ClientAppType, UserAuthorizationState } from './types.ts';

export class PermissionEngine {
  /**
   * Any user (logged out guest or logged in user) can access the Customer experience.
   */
  static canAccessCustomer(_auth: UserAuthorizationState): boolean {
    return true;
  }

  /**
   * Stall App access:
   * User must be authenticated and have a valid stall membership (or be the owner of the parent shop).
   */
  static canAccessStall(auth: UserAuthorizationState, stallId?: string): boolean {
    if (!auth.isAuthenticated || !auth.userId) return false;

    if (stallId) {
      const hasDirectStall = auth.stallMemberships.some(
        (m) => m.foodOutletId === stallId && ['owner', 'manager', 'staff'].includes(m.role)
      );
      if (hasDirectStall) return true;

      // Also check if user is shop owner for this stall's parent restaurant
      const matchingStall = auth.stallMemberships.find((m) => m.foodOutletId === stallId);
      if (matchingStall?.restaurantId) {
        return auth.shopMemberships.some(
          (sm) => sm.restaurantId === matchingStall.restaurantId && ['owner', 'manager'].includes(sm.role)
        );
      }
      return false;
    }

    return auth.isStallWorker || auth.isShopOwner;
  }

  /**
   * Shop Owner App access:
   * User must be authenticated and belong to at least one restaurant as owner or manager.
   */
  static canAccessOwner(auth: UserAuthorizationState, shopId?: string): boolean {
    if (!auth.isAuthenticated || !auth.userId) return false;

    if (shopId) {
      return auth.shopMemberships.some(
        (m) => m.restaurantId === shopId && ['owner', 'manager'].includes(m.role)
      );
    }

    return auth.isShopOwner;
  }

  /**
   * Stall order management (KDS / Ticket workflow):
   * Stall workers can only manage orders belonging to their authorized stall.
   */
  static canManageStallOrder(auth: UserAuthorizationState, stallId: string): boolean {
    return this.canAccessStall(auth, stallId);
  }

  /**
   * Stall menu / 86 item availability:
   * Stall workers can only modify dishes belonging to their authorized stall.
   */
  static canManageStallDishes(auth: UserAuthorizationState, stallId: string): boolean {
    return this.canAccessStall(auth, stallId);
  }

  /**
   * Shop-wide Analytics:
   * Stall workers CANNOT view shop-wide analytics.
   * Only Shop Owners / Managers can view analytics for their specific shop.
   */
  static canViewShopAnalytics(auth: UserAuthorizationState, shopId?: string): boolean {
    return this.canAccessOwner(auth, shopId);
  }

  /**
   * Shop-wide Settings (Venue fee, address, booth keys):
   * Only Shop Owners / Managers can manage shop settings.
   */
  static canManageShopSettings(auth: UserAuthorizationState, shopId: string): boolean {
    return this.canAccessOwner(auth, shopId);
  }

  /**
   * Determines the target client experience for a given path.
   */
  static getClientForPath(pathname: string): ClientAppType {
    if (
      pathname === '/' ||
      pathname === '/customer' ||
      pathname.startsWith('/customer/') ||
      pathname === '/pricing' ||
      pathname === '/plans' ||
      pathname === '/subscribe' ||
      pathname === '/apply' ||
      pathname.startsWith('/auth')
    ) {
      return 'website';
    }

    if (pathname.startsWith('/stall') || pathname.startsWith('/owner')) {
      return 'stall';
    }

    if (pathname.startsWith('/shop-owner') || pathname === '/booths' || pathname.startsWith('/booths/')) {
      return 'owner';
    }

    return 'customer';
  }

  /**
   * Validates whether a route transition should be permitted for the current user.
   */
  static isRouteAllowed(
    pathname: string,
    auth: UserAuthorizationState
  ): { allowed: boolean; redirectUrl?: string; reason?: string } {
    const client = this.getClientForPath(pathname);

    // Marketing/Website routes are open to all
    if (client === 'website') {
      return { allowed: true };
    }

    // Customer routes are open to all (guest or authenticated)
    if (client === 'customer') {
      return { allowed: true };
    }

    // Stall worker routes require authentication & stall worker role
    if (client === 'stall') {
      if (!auth.isAuthenticated) {
        return {
          allowed: false,
          redirectUrl: `/auth?redirect=${encodeURIComponent(pathname)}`,
          reason: 'Authentication required for Stall Kitchen App',
        };
      }

      if (!auth.isStallWorker && !auth.isShopOwner) {
        return {
          allowed: false,
          redirectUrl: '/profile',
          reason: 'Access denied: You do not have permissions for any hawker stall',
        };
      }

      return { allowed: true };
    }

    // Shop Owner routes require authentication & shop owner role
    if (client === 'owner') {
      if (!auth.isAuthenticated) {
        return {
          allowed: false,
          redirectUrl: `/auth?redirect=${encodeURIComponent(pathname)}`,
          reason: 'Authentication required for Shop Owner App',
        };
      }

      if (!auth.isShopOwner) {
        return {
          allowed: false,
          redirectUrl: '/apply',
          reason: 'Access denied: You do not own a hawker shop or venue',
        };
      }

      return { allowed: true };
    }

    return { allowed: true };
  }
}
