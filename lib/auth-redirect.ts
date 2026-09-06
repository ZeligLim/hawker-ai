import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Sanitizes a redirect path to ensure it is a safe, internal, relative URL.
 * Prevents open-redirect attacks and prevents redirecting back to /auth loops.
 */
export function sanitizeRedirectPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null;

  const trimmed = path.trim();

  // Must be a relative path starting with /
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  // Prevent redirect loops back to auth pages
  if (trimmed === '/auth' || trimmed.startsWith('/auth/') || trimmed.startsWith('/auth?')) {
    return null;
  }

  return trimmed;
}

const REDIRECT_STORAGE_KEY = 'hawker_auth_redirect';

export function getSavedAuthRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.sessionStorage.getItem(REDIRECT_STORAGE_KEY);
    return sanitizeRedirectPath(saved);
  } catch {
    return null;
  }
}

export function saveAuthRedirect(path: string | null | undefined): void {
  if (typeof window === 'undefined' || !path) return;
  const sanitized = sanitizeRedirectPath(path);
  if (sanitized) {
    try {
      window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, sanitized);
    } catch {
      // ignore sessionStorage errors
    }
  }
}

export function clearAuthRedirect(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Determines the default app route for an authenticated user based on their
 * stored mode (shop owner, booth owner, or customer).
 */
export function resolveDefaultAppRoute(): string {
  if (typeof window === 'undefined') return '/home';

  try {
    const isShopOwner = window.localStorage.getItem('hawker-shop-owner-mode') === 'true';
    if (isShopOwner) return '/shop-owner/booths';

    const userMode = window.localStorage.getItem('hawker-user-mode');
    if (userMode === 'owner') return '/owner';
  } catch {
    // ignore
  }

  // Default for customer experience
  return '/home';
}

/**
 * Synchronously resolves the redirect target, prioritizing:
 * 1. Explicit path parameter (e.g. from ?redirect=)
 * 2. Saved redirect in sessionStorage
 * 3. Document referrer (if internal and not /auth)
 * 4. User's active app mode (shop, booth, or customer home)
 */
export function resolveAuthRedirect(explicitPath?: string | null): string {
  // 1. Explicit path parameter
  const sanitizedExplicit = sanitizeRedirectPath(explicitPath);
  if (sanitizedExplicit) {
    clearAuthRedirect();
    return sanitizedExplicit;
  }

  // 2. Saved redirect in sessionStorage
  const saved = getSavedAuthRedirect();
  if (saved) {
    clearAuthRedirect();
    return saved;
  }

  // 3. Document referrer
  if (typeof window !== 'undefined' && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin) {
        const refPath = sanitizeRedirectPath(refUrl.pathname + refUrl.search);
        if (refPath && refPath !== '/') {
          return refPath;
        }
      }
    } catch {
      // ignore
    }
  }

  // 4. Default to user's app (shop, booth, or customer)
  return resolveDefaultAppRoute();
}

/**
 * Asynchronously resolves the user's destination, checking Supabase
 * memberships if available to route shop owners to /shop-owner/booths
 * and booth owners to /owner.
 */
export async function resolveUserDestination(
  client: SupabaseClient | null | undefined,
  user: User | null | undefined,
  explicitPath?: string | null,
): Promise<string> {
  const directTarget = sanitizeRedirectPath(explicitPath) || getSavedAuthRedirect();
  if (directTarget) {
    clearAuthRedirect();
    return directTarget;
  }

  // Check referrer if from same origin
  if (typeof window !== 'undefined' && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin) {
        const refPath = sanitizeRedirectPath(refUrl.pathname + refUrl.search);
        if (refPath && refPath !== '/') {
          return refPath;
        }
      }
    } catch {
      // ignore
    }
  }

  // Check memberships from Supabase if user is present
  if (client && user) {
    try {
      // Check restaurant (shop) memberships
      const { data: restaurantMemberships, error: restErr } = await client
        .from('restaurant_memberships')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!restErr && restaurantMemberships && restaurantMemberships.length > 0) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-shop-owner-mode', 'true');
        }
        return '/shop-owner/booths';
      }

      // Check merchant (booth) memberships
      const { data: merchantMemberships, error: merchErr } = await client
        .from('merchant_memberships')
        .select('food_outlet_id')
        .eq('user_id', user.id)
        .limit(1);

      if (!merchErr && merchantMemberships && merchantMemberships.length > 0) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-user-mode', 'owner');
        }
        return '/owner';
      }
    } catch {
      // fallback to resolveDefaultAppRoute
    }
  }

  return resolveDefaultAppRoute();
}
