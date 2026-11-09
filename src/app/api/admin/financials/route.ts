import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/server/auth/rbac';

const COST_CATEGORIES = ['hosting', 'infrastructure', 'software', 'other'] as const;

function validMonth(value: string | null): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

function monthWindow(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const next = new Date(Date.UTC(year, monthNumber, 1));
  const endDate = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const startPaidAt = new Date(Date.UTC(year, monthNumber - 1, 1) - 8 * 60 * 60 * 1000).toISOString();
  const endPaidAt = new Date(Date.UTC(year, monthNumber, 1) - 8 * 60 * 60 * 1000).toISOString();
  return { startDate, endDate, startPaidAt, endPaidAt };
}

function validYear(value: string | null): value is string {
  return Boolean(value && /^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 9998);
}

function yearWindow(yearText: string) {
  const year = Number(yearText);
  const startDate = `${yearText}-01-01`;
  const endDate = `${year + 1}-01-01`;
  const startPaidAt = new Date(Date.UTC(year, 0, 1) - 8 * 60 * 60 * 1000).toISOString();
  const endPaidAt = new Date(Date.UTC(year + 1, 0, 1) - 8 * 60 * 60 * 1000).toISOString();
  return { startDate, endDate, startPaidAt, endPaidAt };
}

export async function GET(request: NextRequest) {
  const auth = await requirePlatformAdmin(request);
  if (!auth.authorized) return auth.response;

  const month = request.nextUrl.searchParams.get('month');
  const year = request.nextUrl.searchParams.get('year');
  if (!validMonth(month) && !validYear(year)) {
    return NextResponse.json({ error: 'Provide a month in YYYY-MM or year in YYYY format.' }, { status: 400 });
  }

  const { startDate, endDate, startPaidAt, endPaidAt } = validYear(year) ? yearWindow(year) : monthWindow(month!);
  const client = createAdminClient();
  if (!client) {
    return NextResponse.json({ error: 'Platform service credentials are required for cross-venue financial data.' }, { status: 500 });
  }
  const revenueEntries: Array<{ id: string; paid_at: string; platform_fee_amount: number | null; service_fee: number; refund_amount: number }> = [];
  const costs: Array<{ id: string; incurred_on: string; category: string; vendor: string; description: string; amount: number; currency: string }> = [];

  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from('orders')
      .select('id, paid_at, platform_fee_amount, service_fee, refund_amount')
      .eq('status', 'COMPLETED')
      .eq('payment_status', 'PAID')
      .not('paid_at', 'is', null)
      .gte('paid_at', startPaidAt)
      .lt('paid_at', endPaidAt)
      .order('paid_at', { ascending: true })
      .range(offset, offset + 999);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revenueEntries.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from('platform_costs')
      .select('id, incurred_on, category, vendor, description, amount, currency')
      .gte('incurred_on', startDate)
      .lt('incurred_on', endDate)
      .order('incurred_on', { ascending: true })
      .range(offset, offset + 999);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    costs.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  return NextResponse.json({ revenueEntries, costs });
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformAdmin(request);
  if (!auth.authorized) return auth.response;

  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const incurredOn = String(payload?.incurredOn ?? '');
  const category = String(payload?.category ?? '');
  const vendor = String(payload?.vendor ?? '').trim();
  const description = String(payload?.description ?? '').trim();
  const amount = Number(payload?.amount);
  const parsedDate = new Date(`${incurredOn}T00:00:00Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(incurredOn) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== incurredOn ||
    !COST_CATEGORIES.includes(category as (typeof COST_CATEGORIES)[number]) ||
    !Number.isFinite(amount) || amount <= 0 || amount > 100000000 ||
    vendor.length > 120 || description.length > 300
  ) {
    return NextResponse.json({ error: 'Enter a valid date, cost type, and amount.' }, { status: 400 });
  }

  const client = createAdminClient() ?? auth.client;
  const { data, error } = await client
    .from('platform_costs')
    .insert({
      incurred_on: incurredOn,
      category,
      vendor,
      description,
      amount: Number(amount.toFixed(2)),
      currency: 'MYR',
      created_by: auth.user.id,
    })
    .select('id, incurred_on, category, vendor, description, amount, currency')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cost: data }, { status: 201 });
}
