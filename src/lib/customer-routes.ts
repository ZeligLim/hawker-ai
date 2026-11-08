const nonCentreRoutes = new Set([
 'admin',
 'api',
 'auth',
 'booths',
 'customer',
 'hawker',
 'menu',
 'orders',
 'owner',
 'plans',
 'pricing',
 'profile',
 'results',
 'scan',
 'shop',
 'shop-owner',
 'stall',
 'stalls',
 'subscribe',
]);

export function isCentreCustomerRoute(pathname: string): boolean {
 const segments = pathname.split('/').filter(Boolean);
 const [centreSlug, subroute] = segments;

 if (!centreSlug || nonCentreRoutes.has(centreSlug)) return false;
 return segments.length === 1 || (segments.length === 2 && ['menu', 'orders'].includes(subroute));
}
