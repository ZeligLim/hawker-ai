'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerReceipt, type ReceiptData } from '@/components/customer-receipt';
import { supabase } from '@/lib/supabase/client';

function mapOrderToReceipt(payload: any, targetId: string): ReceiptData | null {
 const orders = Array.isArray(payload?.orders) ? payload.orders : [];
 const direct = orders.find((entry: any) => String(entry?.id ?? '').toLowerCase() === targetId.toLowerCase());
 if (!direct) return null;

 const rawItems = Array.isArray(direct.merchant_orders)
 ? direct.merchant_orders.flatMap((merchant: any) =>
 Array.isArray(merchant.order_items)
 ? merchant.order_items.map((item: any) => ({
 id: item.id,
 dishId: item.dish_id,
 name: item.dish_name,
 price: Number(item.unit_price ?? 0),
 quantity: Number(item.quantity ?? 1),
 customizations: item.customizations,
 notes: item.notes,
 isRefunded: Boolean(item.is_refunded),
 refundAmount: Number(item.refund_amount ?? 0),
 refundReason: item.refund_reason,
 }))
 : []
 )
 : [];

 return {
 id: String(direct.id),
 tableLabel: direct.table_session_id ? 'Table Session' : undefined,
 venueName: 'Hawker Centre',
 subtotal: Number(direct.subtotal_amount ?? direct.subtotal ?? 0),
 serviceFee: Number(direct.platform_fee_amount ?? direct.service_fee ?? 0.50),
 total: Number(direct.total_amount ?? direct.total ?? 0),
 paymentStatus: (direct.payment_status ?? 'PAID') as any,
 refundAmount: Number(direct.refund_amount ?? 0),
 paymentIntentId: direct.payment_intent_id ?? direct.payment_reference,
 createdAt: direct.created_at ?? new Date().toISOString(),
 items: rawItems,
 };
}

export default function OrderDetailPage() {
 const params = useParams<{ id: string }>();
 const router = useRouter();
 const [receipt, setReceipt] = useState<ReceiptData | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const targetId = decodeURIComponent((params.id ?? '').trim());

 const loadOrder = async () => {
 setIsLoading(true);

 if (supabase) {
 const { data: sessionData } = await supabase.auth.getSession();
 if (sessionData.session?.access_token) {
 const response = await fetch('/api/orders', {
 headers: {
 Authorization: `Bearer ${sessionData.session.access_token}`,
 },
 });

 if (response.ok) {
 const payload = (await response.json().catch(() => ({}))) as { orders?: unknown[] };
 const nextReceipt = mapOrderToReceipt(payload, targetId);
 if (nextReceipt) {
 setReceipt(nextReceipt);
 setIsLoading(false);
 return;
 }
 }
 }
 }

 setReceipt(null);
 setIsLoading(false);
 };

 void loadOrder();
 }, [params.id]);

 if (isLoading) {
 return (
 <main className="min-h-screen bg-white px-4 pb-28 pt-8 text-black">
 <div className="mx-auto max-w-[480px]">
 <div className="rounded-3xl bg-neutral-50 p-6 shadow-sm">
 <p className="text-sm text-neutral-500">Loading your order receipt…</p>
 </div>
 </div>
 </main>
 );
 }

 if (!receipt) {
 return (
 <main className="min-h-screen bg-white px-4 pb-28 pt-8 text-black">
 <div className="mx-auto max-w-[480px]">
 <div className="rounded-3xl bg-neutral-50 p-6 shadow-sm">
 <p className="text-sm font-semibold text-black">Order not found or access expired.</p>
 <Link
 href="/profile"
 className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 "
 >
 Back to profile
 </Link>
 </div>
 </div>
 </main>
 );
 }

 return (
 <main className="min-h-screen bg-white px-4 pb-28 pt-6 text-black">
 <div className="mx-auto max-w-[480px]">
 <CustomerReceipt initialData={receipt} onBack={() => router.push('/profile')} />
 </div>
 </main>
 );
}
