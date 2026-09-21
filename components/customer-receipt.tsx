'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Clock3, ArrowLeft, Receipt, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export type ReceiptItem = {
 id: string;
 dishId?: string;
 name: string;
 price: number;
 quantity: number;
 customizations?: string[];
 notes?: string;
 isRefunded?: boolean;
 refundAmount?: number;
 refundReason?: string;
};

export type ReceiptData = {
 id: string;
 tableLabel?: string;
 venueName?: string;
 subtotal: number;
 serviceFee: number;
 total: number;
 paymentStatus: 'PAID' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED' | 'FAILED';
 refundAmount: number;
 paymentIntentId?: string;
 createdAt: string;
 items: ReceiptItem[];
};

export function CustomerReceipt({
 initialData,
 onBack,
}: {
 initialData: ReceiptData;
 onBack?: () => void;
}) {
 const [data, setData] = useState<ReceiptData>(initialData);
 const [liveBanner, setLiveBanner] = useState<string | null>(null);
 const [orderStatus, setOrderStatus] = useState<string>('preparing');

 useEffect(() => {
 if (!supabase || !data.id) return;

 // Initial fetch for order status
 supabase
 .from('orders')
 .select('status')
 .eq('id', data.id)
 .single()
 .then(({ data: d }) => {
 if (d) setOrderStatus(d.status);
 });

 const channel = supabase.channel(`order-${data.id}`)
 .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${data.id}` }, (payload: any) => {
 if (payload.new && payload.new.status) {
 setOrderStatus(payload.new.status);
 }
 })
 .on('broadcast', { event: 'order_refunded' }, (payload: any) => {
 const refundPayload = payload.payload;
 if (refundPayload) {
 setData((prev) => {
 const refundedIds = (refundPayload.refundedItems ?? []).map((i: any) => i.id);
 const updatedItems = prev.items.map((item) => {
 if (refundedIds.includes(item.id)) {
 return {
 ...item,
 isRefunded: true,
 refundAmount: Number(item.price) * item.quantity,
 refundReason: refundPayload.reason ?? 'Item Sold Out',
 };
 }
 return item;
 });

 return {
 ...prev,
 refundAmount: Number(refundPayload.totalRefundAmount ?? prev.refundAmount + refundPayload.refundAmount),
 paymentStatus: refundPayload.paymentStatus ?? 'PARTIALLY_REFUNDED',
 items: updatedItems,
 };
 });

 setLiveBanner(`Notice: RM ${Number(refundPayload.refundAmount).toFixed(2)} refunded automatically to your eWallet (Item Sold Out).`);
 setTimeout(() => setLiveBanner(null), 8000);
 }
 })
 .subscribe();

 return () => {
 supabase?.removeChannel(channel);
 };
 }, [data.id]);

 const adjustedTotal = Math.max(0, data.total - (data.refundAmount || 0));
 const hasRefund = (data.refundAmount || 0) > 0 || data.paymentStatus.includes('REFUNDED');

 return (
 <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-lg overflow-hidden text-black">
 {/* Real-time alert banner if item was sold out */}
 {liveBanner ? (
 <div className="bg-rose-100 px-4 py-3 flex items-start gap-2.5 text-xs text-rose-900">
 <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
 <p className="font-medium">{liveBanner}</p>
 </div>
 ) : null}

 {/* Live Status Banner */}
 <div className="bg-[#1d1d1f] px-4 py-3.5 flex items-center justify-between text-white">
 <div className="flex items-center gap-2">
 {orderStatus === 'served' ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
 ) : orderStatus === 'ready' ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
 ) : (
 <Clock3 className="w-5 h-5 text-neutral-400" />
 )}
 <span className="text-sm font-semibold">
 {orderStatus === 'served' || orderStatus === 'ready'
 ? 'Order Completed'
 : 'Preparing your food...'}
 </span>
 </div>
 {orderStatus !== 'served' && orderStatus !== 'ready' && (
 <span className="text-xs font-medium text-neutral-300">ETA 10-15 mins</span>
 )}
 </div>

 {/* Header */}
 <div className="p-6 pb-4 bg-neutral-50">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {onBack ? (
 <button
 type="button"
 onClick={onBack}
 className="p-1.5 -ml-1 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200 "
 >
 <ArrowLeft className="w-4 h-4" />
 </button>
 ) : null}
 <div className="flex items-center gap-2">
 <Receipt className="w-5 h-5 text-black" />
 <h2 className="text-base font-bold text-black">Customer Receipt</h2>
 </div>
 </div>
 <span className="text-xs font-mono font-medium text-neutral-500">
 #{data.id.slice(0, 8)}
 </span>
 </div>

 <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600">
 <div>
 <p className="font-semibold text-black">{data.venueName ?? 'Hawker Centre'}</p>
 <p className="text-[11px] text-neutral-500">
 {new Date(data.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
 </p>
 </div>
 {data.tableLabel ? (
 <span className="px-2.5 py-1 rounded-full bg-black/5 text-black font-semibold text-[11px]">
 {data.tableLabel}
 </span>
 ) : null}
 </div>
 </div>

 {/* Itemized Breakdown */}
 <div className="p-6 space-y-4">
 <div>
 <p className="text-xs font-semibold text-neutral-500 mb-2.5">
 Ordered items
 </p>
 <div className="space-y-2">
 {data.items.map((item) => {
 const itemTotal = item.price * item.quantity;
 return (
 <div key={item.id} className="py-2 bg-neutral-50 rounded-2xl px-3.5">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1">
 <div className="flex items-baseline gap-2">
 <span className="text-xs font-bold text-black">
 {item.quantity}×
 </span>
 <p className={`text-xs font-semibold ${item.isRefunded ? 'line-through text-neutral-400' : 'text-black'}`}>
 {item.name}
 </p>
 </div>
 {item.customizations && item.customizations.length > 0 ? (
 <p className="text-[11px] text-neutral-500 ml-5 mt-0.5">
 {item.customizations.join(', ')}
 </p>
 ) : null}
 {item.notes ? (
 <p className="text-[11px] text-neutral-500 italic ml-5 mt-0.5">
 &ldquo;{item.notes}&rdquo;
 </p>
 ) : null}
 {item.isRefunded ? (
 <div className="ml-5 mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
 <AlertCircle className="w-3 h-3" />
 <span>Item Sold Out — Refunded -RM {itemTotal.toFixed(2)}</span>
 </div>
 ) : null}
 </div>

 <div className="text-right">
 <span className={`text-xs font-semibold ${item.isRefunded ? 'line-through text-neutral-400' : 'text-black'}`}>
 RM {itemTotal.toFixed(2)}
 </span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Financial Breakdown */}
 <div className="pt-3 space-y-2 bg-neutral-50 p-4 rounded-2xl">
 <div className="flex items-center justify-between text-xs text-neutral-600">
 <span>Subtotal</span>
 <span className="font-semibold text-black">RM {data.subtotal.toFixed(2)}</span>
 </div>

 <div className="flex items-center justify-between text-xs text-neutral-600">
 <div className="flex items-center gap-1.5">
 <span>Platform Fee</span>
 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 text-neutral-600 font-semibold">
 Flat
 </span>
 </div>
 <span className="font-semibold text-black">RM {data.serviceFee.toFixed(2)}</span>
 </div>

 <div className="pt-2 flex items-center justify-between text-sm font-bold text-black">
 <span>Total Paid</span>
 <span className="text-base">RM {data.total.toFixed(2)}</span>
 </div>

 {/* Refund Breakdown if Applicable */}
 {hasRefund ? (
 <div className="mt-3 p-3 rounded-xl bg-rose-100 space-y-1.5 text-xs">
 <div className="flex items-center justify-between font-semibold text-rose-800">
 <span>Refunded to eWallet (Out-of-Stock)</span>
 <span>-RM {data.refundAmount.toFixed(2)}</span>
 </div>
 <div className="flex items-center justify-between pt-1 font-bold text-xs text-rose-950">
 <span>Adjusted Total</span>
 <span className="text-sm">RM {adjustedTotal.toFixed(2)}</span>
 </div>
 </div>
 ) : null}
 </div>

 {/* Payment & Trust Badge */}
 <div className="pt-1">
 <div className="rounded-2xl bg-neutral-50 p-3.5 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
 <CheckCircle2 className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-black">
 {data.paymentStatus === 'FULLY_REFUNDED'
 ? 'Fully refunded'
 : data.paymentStatus === 'PARTIALLY_REFUNDED'
 ? 'Partially refunded'
 : 'Paid via eWallet / DuitNow QR'}
 </p>
 <p className="text-[11px] text-neutral-500 font-mono">
 Ref: {data.paymentIntentId ?? 'Instant Settlement'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
 <ShieldCheck className="w-3.5 h-3.5 text-black" />
 <span>Verified</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
