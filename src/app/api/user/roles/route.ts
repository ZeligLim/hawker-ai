import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getUserRoles } from '@/server/services/user-service';

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

  const rolesData = await getUserRoles(auth.client, auth.user.id, auth.user.email);
  return NextResponse.json(rolesData);
}
