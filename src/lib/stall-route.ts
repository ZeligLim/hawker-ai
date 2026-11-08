export type StallRouteIdentity = {
 id: string;
 name: string;
};

export function getStallSlug(stall: StallRouteIdentity): string {
 const namePart = stall.name
 .toLowerCase()
 .normalize('NFKD')
 .replace(/[\u0300-\u036f]/g, '')
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/^-|-$/g, '') || 'stall';

 return `${namePart}-${stall.id.slice(0, 8).toLowerCase()}`;
}

export function getStallRoute(stall: StallRouteIdentity, section = ''): string {
 const suffix = section.replace(/^\/+/, '');
 return `/${getStallSlug(stall)}/owner${suffix ? `/${suffix}` : ''}`;
}
