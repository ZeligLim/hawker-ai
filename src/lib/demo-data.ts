export type DemoRole = 'platform-admin' | 'centre-owner' | 'stall-worker' | 'diner';

export type DemoProfile = {
 id: DemoRole;
 name: string;
 email: string;
 role: string;
 description: string;
};

export const demoProfiles: DemoProfile[] = [
 {
 id: 'platform-admin',
 name: 'Platform Admin',
 email: 'admin@demo.hawker.test',
 role: 'SaaS owner',
 description: 'Platform metrics and venue overview',
 },
 {
 id: 'centre-owner',
 name: 'Centre Owner',
 email: 'owner@demo.hawker.test',
 role: 'Venue operator',
 description: 'Centre revenue, stalls, and orders',
 },
 {
 id: 'stall-worker',
 name: 'Stall Worker',
 email: 'western@demo.hawker.test',
 role: 'Western stall',
 description: 'Kitchen tickets and menu activity',
 },
 {
 id: 'diner',
 name: 'Diner',
 email: 'diner@demo.hawker.test',
 role: 'QR order',
 description: 'A sample order receipt; live menus stay QR-only',
 },
];

export const demoOrders = [
 { id: 'HK-2048', time: '12:42 PM', stall: 'Western', items: 'Spaghetti Bolognese × 1', total: 14.5, status: 'Preparing' },
 { id: 'HK-2047', time: '12:37 PM', stall: 'Ah Huat Curry Mee', items: 'Curry Mee × 2', total: 25, status: 'Ready' },
 { id: 'HK-2046', time: '12:31 PM', stall: 'Kopi & Teh', items: 'Iced Teh Tarik × 2', total: 7, status: 'Completed' },
 { id: 'HK-2045', time: '12:26 PM', stall: 'Western', items: 'Chicken Chop × 1', total: 18, status: 'New' },
];

export const demoStalls = [
 { name: 'Western', category: 'Western', status: 'Open', orders: 18, revenue: 428.5 },
 { name: 'Ah Huat Curry Mee', category: 'Noodles', status: 'Open', orders: 24, revenue: 592 },
 { name: 'Kopi & Teh', category: 'Drinks', status: 'Busy', orders: 31, revenue: 186 },
 { name: 'Sweet Corner', category: 'Desserts', status: 'Closed', orders: 8, revenue: 96 },
];

export const demoRevenue = [
 { day: 'Mon', amount: 1180 },
 { day: 'Tue', amount: 1460 },
 { day: 'Wed', amount: 1320 },
 { day: 'Thu', amount: 1710 },
 { day: 'Fri', amount: 2140 },
 { day: 'Sat', amount: 2680 },
 { day: 'Sun', amount: 1920 },
];
