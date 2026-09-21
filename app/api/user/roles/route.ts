import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getPlatformRole } from '@/lib/auth-rbac';

export async function GET(request: NextRequest) {
 const auth = await requireRequestUser(request);
 if (!auth.client || !auth.user) {
 return NextResponse.json({
 isCustomer: true,
 hasShopOwner: false,
 hasBooth: false,
 isSuperAdmin: false,
 isSaasOwner: false,
 platformRole: null,
 shops: [],
 booths: [],
 });
 }

 // Check restaurant_memberships (Shop Owner)
 let shops: Array<{ id: string; name: string; role: string; isActive?: boolean; schedule?: any }> = [];
 try {
 const { data: restMemberships } = await auth.client
 .from('restaurant_memberships')
 .select('restaurant_id, role, restaurants(id, name, is_active, schedule)')
 .eq('user_id', auth.user.id);

 if (restMemberships) {
 shops = restMemberships.map((m: any) => ({
 id: m.restaurants?.id || m.restaurant_id,
 name: m.restaurants?.name || 'Food Hall',
 isActive: m.restaurants?.is_active ?? true,
 schedule: m.restaurants?.schedule,
 role: m.role || 'owner',
 }));
 }
 } catch {
 // ignore
 }

 // Check merchant_memberships (Booth Owner)
 let booths: Array<{
 id: string;
 name: string;
 role: string;
 isOpen?: boolean;
 isActive?: boolean;
 schedule?: any;
 venueId?: string;
 venueName?: string;
 venueIsActive?: boolean;
 venueSchedule?: any;
 }> = [];
 try {
 const { data: merchMemberships } = await auth.client
 .from('merchant_memberships')
 .select('food_outlet_id, role, food_outlets(id, name, is_open, is_active, schedule, airwallex_account_id, restaurants(id, name, is_active, schedule))')
 .eq('user_id', auth.user.id);

 if (merchMemberships) {
 booths = merchMemberships.map((m: any) => ({
 id: m.food_outlets?.id || m.food_outlet_id,
 name: m.food_outlets?.name || 'Stall',
 isOpen: m.food_outlets?.is_open ?? true,
 isActive: m.food_outlets?.is_active ?? true,
 schedule: m.food_outlets?.schedule,
 airwallex_account_id: m.food_outlets?.airwallex_account_id || null,
 role: m.role || 'owner',
 venueId: m.food_outlets?.restaurants?.id,
 venueName: m.food_outlets?.restaurants?.name,
 venueIsActive: m.food_outlets?.restaurants?.is_active ?? true,
 venueSchedule: m.food_outlets?.restaurants?.schedule,
 }));
 }
 } catch {
 // ignore
 }

 const { isSuperAdmin, isSaasOwner, role: platformRole } = await getPlatformRole(
 auth.client,
 auth.user.id,
 auth.user.email
 );

 return NextResponse.json({
 isCustomer: true,
 hasShopOwner: shops.length > 0,
 hasBooth: booths.length > 0,
 isSuperAdmin,
 isSaasOwner,
 platformRole,
 shops,
 booths,
 });
}
