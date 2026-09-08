import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim() ?? '';
  if (!token) {
    return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const auth = await requireRequestUser(request);
  const client = auth.client ?? createAdminClient();

  if (client) {
    try {
      const { data: rpcData, error: rpcError } = await client.rpc('get_booth_invitation_details', {
        p_token_hash: tokenHash,
      });

      if (!rpcError && rpcData && typeof rpcData === 'object' && (rpcData as any).valid) {
        return NextResponse.json(rpcData);
      }
    } catch {
      // Fall through to direct query
    }
  }

  const adminClient = createAdminClient() ?? auth.client;
  if (!adminClient) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const { data: invitation } = await adminClient
    .from('booth_invitations')
    .select('id, food_outlet_id, expires_at, used_at, invited_email')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ error: 'This invitation is invalid or expired.' }, { status: 404 });
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  if (invitation.used_at) {
    return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 409 });
  }

  const { data: outlet } = await adminClient
    .from('food_outlets')
    .select('id, name, restaurant_id')
    .eq('id', invitation.food_outlet_id)
    .maybeSingle();

  return NextResponse.json({
    valid: true,
    id: invitation.id,
    boothId: invitation.food_outlet_id,
    boothName: outlet?.name ?? 'Stall Slot',
    invitedEmail: invitation.invited_email,
    expiresAt: invitation.expires_at,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token.trim() : '';

  if (!token) {
    return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const stallName = typeof body?.stallName === 'string' ? body.stallName.trim() : typeof body?.boothName === 'string' ? body.boothName.trim() : '';

  // 1. Primary execution path: Atomic Postgres RPC function with SECURITY DEFINER
  // Executes with server authority so client-side RLS limits never block valid token redemptions
  try {
    const { data: rpcData, error: rpcError } = await auth.client.rpc('claim_booth_invitation', {
      p_token_hash: tokenHash,
      p_stall_name: stallName || null,
    });

    if (!rpcError && rpcData && typeof rpcData === 'object') {
      const result = rpcData as {
        success?: boolean;
        error?: string;
        status?: string;
        boothId?: string;
      };

      if (result.success) {
        return NextResponse.json({
          status: result.status ?? 'joined',
          boothId: result.boothId,
        });
      }

      if (result.error) {
        const errorMsg = result.error;
        let statusCode = 400;
        if (errorMsg.includes('specifically') || errorMsg.includes('Only the invited email')) {
          statusCode = 403;
        } else if (errorMsg.includes('expired')) {
          statusCode = 410;
        } else if (errorMsg.includes('already been used')) {
          statusCode = 409;
        } else if (errorMsg.includes('invalid or expired')) {
          statusCode = 404;
        }

        return NextResponse.json({ error: errorMsg }, { status: statusCode });
      }
    }
  } catch {
    // Continue to fallback handler
  }

  // 2. Fallback execution path: Direct table queries (using admin client or authenticated user client)
  const adminClient = createAdminClient() ?? auth.client;

  const { data: invitation, error: invitationError } = await adminClient
    .from('booth_invitations')
    .select('id, food_outlet_id, expires_at, used_at, invited_email')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (invitationError) {
    return NextResponse.json({ error: invitationError.message }, { status: 500 });
  }

  if (!invitation) {
    return NextResponse.json({ error: 'This invitation is invalid or expired.' }, { status: 404 });
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  if (invitation.used_at) {
    return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 409 });
  }

  // Security check: Only the invited email can claim this stall setup link
  if (invitation.invited_email && auth.user.email) {
    const invitedEmail = invitation.invited_email.toLowerCase().trim();
    const userEmail = auth.user.email.toLowerCase().trim();
    if (invitedEmail !== userEmail) {
      return NextResponse.json({
        error: `This setup link was sent specifically to ${invitation.invited_email}. You are currently signed in as ${auth.user.email}. Only the invited email can edit this stall. Please sign in with that email.`,
      }, { status: 403 });
    }
  }

  const { data: existingMembership, error: membershipCheckError } = await adminClient
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', invitation.food_outlet_id)
    .maybeSingle();

  if (membershipCheckError) {
    return NextResponse.json({ error: membershipCheckError.message }, { status: 500 });
  }

  if (existingMembership) {
    return NextResponse.json({ status: 'already-member', boothId: invitation.food_outlet_id });
  }

  if (stallName) {
    await adminClient.from('food_outlets').update({ name: stallName }).eq('id', invitation.food_outlet_id);
  }

  const userEmail = auth.user.email?.toLowerCase().trim() ?? invitation.invited_email?.toLowerCase().trim() ?? null;

  const { error: insertError } = await adminClient.from('merchant_memberships').insert({
    user_id: auth.user.id,
    food_outlet_id: invitation.food_outlet_id,
    role: 'owner',
    email: userEmail,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: markUsedError } = await adminClient
    .from('booth_invitations')
    .update({ used_at: new Date().toISOString(), used_by: auth.user.id })
    .eq('id', invitation.id);

  if (markUsedError) {
    return NextResponse.json({ error: markUsedError.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'joined', boothId: invitation.food_outlet_id });
}
