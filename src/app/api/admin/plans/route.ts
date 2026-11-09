import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/server/auth/rbac';

const PLAN_KEYS = ['ordering', 'online_payments'] as const;

export async function GET(request: NextRequest) {
  const auth = await requirePlatformAdmin(request);
  if (!auth.authorized) return auth.response;

  const client = createAdminClient() ?? auth.client;
  const { data, error } = await client
    .from('platform_plans')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data ?? [] });
}

export async function PUT(request: NextRequest) {
  const auth = await requirePlatformAdmin(request);
  if (!auth.authorized) return auth.response;

  const payload = (await request.json().catch(() => null)) as { plans?: unknown } | null;
  if (!Array.isArray(payload?.plans) || payload.plans.length !== PLAN_KEYS.length) {
    return NextResponse.json({ error: 'Submit both platform plans to save changes.' }, { status: 400 });
  }

  const plans = payload.plans.map((candidate) => {
    const plan = candidate as Record<string, unknown>;
    const planKey = String(plan.planKey ?? '');
    const name = String(plan.name ?? '').trim();
    const description = String(plan.description ?? '').trim();
    const monthlyPrice = Number(plan.monthlyPrice);
    const features = Array.isArray(plan.features)
      ? plan.features.map((feature) => String(feature).trim()).filter(Boolean)
      : [];

    if (
      !PLAN_KEYS.includes(planKey as (typeof PLAN_KEYS)[number]) ||
      !name || name.length > 80 || description.length > 300 ||
      !Number.isFinite(monthlyPrice) || monthlyPrice < 0 || monthlyPrice > 100000 ||
      features.length > 12 || features.some((feature) => feature.length > 180) ||
      typeof plan.isActive !== 'boolean' || typeof plan.onlinePaymentsEnabled !== 'boolean'
    ) return null;

    return {
      plan_key: planKey,
      name,
      description,
      monthly_price: Number(monthlyPrice.toFixed(2)),
      currency: 'MYR',
      is_active: plan.isActive,
      online_payments_enabled: plan.onlinePaymentsEnabled,
      features,
      display_order: PLAN_KEYS.indexOf(planKey as (typeof PLAN_KEYS)[number]) + 1,
      updated_at: new Date().toISOString(),
    };
  });

  if (plans.some((plan) => plan === null)) {
    return NextResponse.json({ error: 'One or more plan details are invalid.' }, { status: 400 });
  }

  const validPlans = plans.filter((plan): plan is Exclude<(typeof plans)[number], null> => plan !== null);
  if (new Set(validPlans.map((plan) => plan.plan_key)).size !== PLAN_KEYS.length) {
    return NextResponse.json({ error: 'Submit each platform plan once.' }, { status: 400 });
  }

  const client = createAdminClient() ?? auth.client;
  const { data, error } = await client
    .from('platform_plans')
    .upsert(validPlans, { onConflict: 'plan_key' })
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data ?? [] });
}
