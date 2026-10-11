'use client';

import Link from 'next/link';
import { Check, PackageCheck, AlertCircle, RefreshCw, XCircle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageLoader, ButtonLoader } from '@/components/page-loader';
import { supabase } from '@/lib/supabase/client';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLATION_REQUESTED' | 'CANCELLED';

type TicketItem = {
 id: string;
 dishId?: string;
 name: string;
 unitPrice: number;
 quantity: number;
 customizations?: string[];
 notes?: string;
};

type OwnerOrder = {
 id: string;
 backendId: string;
 orderId: string;
 table: string;
 time: string;
 items: TicketItem[];
 stallSubtotal: number;
 status: OrderStatus;
 previousStatus?: OrderStatus;
};

const nextBackendStatus: Record<OrderStatus, OrderStatus> = {
 PENDING: 'PREPARING',
 CONFIRMED: 'PREPARING',
 PREPARING: 'READY',
 READY: 'COMPLETED',
 COMPLETED: 'COMPLETED',
 CANCELLATION_REQUESTED: 'CANCELLATION_REQUESTED',
 CANCELLED: 'CANCELLED'
};

const getActionLabel = (status: OrderStatus) => {
  if (status === 'PENDING' || status === 'CONFIRMED') return 'Accept & Prepare';
  if (status === 'PREPARING') return 'Mark Ready';
  if (status === 'READY') return 'Complete';
  return 'Done';
};

export default function OwnerOrdersPage() {
 const [orders, setOrders] = useState<OwnerOrder[]>([]);
 const [filter, setFilter] = useState<'active' | 'completed'>('active');
 const [error, setError] = useState('');
 const [actionSuccess, setActionSuccess] = useState<string | null>(null);
 const [processingId, setProcessingId] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);

 const [refreshTrigger, setRefreshTrigger] = useState(0);

 useEffect(() => {
 let active = true;

 const fetchOrders = async () => {
 if (!supabase) {
 if (active) setLoading(false);
 return;
 }
 const session = (await supabase.auth.getSession())?.data.session;
 if (!session?.access_token) {
 if (active) setLoading(false);
 return;
 }

 try {
 const response = await fetch('/api/owner/orders', {
 headers: { Authorization: `Bearer ${session.access_token}` },
 });
 if (!response.ok) {
 if (active) setError('Failed to load orders.');
 return;
 }

 const data = await response.json();
 if (active && data.orders) {
 setError('');
 setOrders(
 data.orders.map((mo: any) => {
 const rawItems = Array.isArray(mo.order_items)
 ? mo.order_items.map((i: any) => ({
 id: i.id,
 dishId: i.dish_id,
 name: i.dish_name,
 unitPrice: Number(i.unit_price),
 quantity: Number(i.quantity),
 customizations: Array.isArray(i.customizations) ? i.customizations : [],
 notes: i.notes,
 }))
 : [];
 const subtotal = Number(mo.subtotal) || 0;

 return {
 id: `#${mo.id.slice(0, 5).toUpperCase()}`,
 backendId: mo.id,
 orderId: mo.order_id,
 table: mo.orders?.table_session_id ? `Table Session` : 'Counter / Table',
 time: new Date(mo.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
 items: rawItems,
 stallSubtotal: subtotal,
 status: mo.status as OrderStatus,
 previousStatus: mo.previous_status,
 };
 })
 );
 }
 } catch {
 if (active) setError('Connection error while fetching orders.');
 } finally {
 if (active) setLoading(false);
 }
 };

 void fetchOrders();

 // Subscribe to realtime merchant orders
 if (!supabase) return;
 const channel = supabase
 .channel('owner-kitchen-orders')
 .on(
 'postgres_changes',
 { event: '*', schema: 'public', table: 'merchant_orders' },
 () => {
 void fetchOrders();
 }
 )
 .subscribe();

 return () => {
 active = false;
 supabase?.removeChannel(channel);
 };
 }, [refreshTrigger]);

 const visibleOrders = useMemo(
 () => orders.filter((order) => {
   const isCompleted = order.status === 'COMPLETED' || order.status === 'CANCELLED';
   return filter === 'active' ? !isCompleted : isCompleted;
 }),
 [filter, orders]
 );

 const advanceOrder = async (backendId: string, currentStatus: OrderStatus) => {
 if (!supabase) return;
 const backendSt = nextBackendStatus[currentStatus];
 if (!backendSt || backendSt === currentStatus) return;

 setProcessingId(backendId);
 setError('');

 const token = (await supabase.auth.getSession())?.data.session?.access_token;
 if (!token) return;

 const response = await fetch(`/api/owner/orders/${backendId}`, {
 method: 'PATCH',
 headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: backendSt }),
 });

 setProcessingId(null);
 if (!response.ok) {
 setError('Order status could not be saved. Please try again.');
 setRefreshTrigger((c) => c + 1);
 } else {
   setOrders((current) =>
     current.map((order) => (order.backendId === backendId ? { ...order, status: backendSt } : order))
   );
 }
 };

 const handleCancellation = async (backendId: string, action: 'approve' | 'reject') => {
   if (!supabase) return;
   setProcessingId(backendId);
   setError('');
   
   const token = (await supabase.auth.getSession())?.data.session?.access_token;
   if (!token) return;

   const endpoint = `/api/owner/orders/${backendId}/${action}-cancel`;

   const response = await fetch(endpoint, {
     method: 'POST',
     headers: { Authorization: `Bearer ${token}` }
   });

   setProcessingId(null);
   if (!response.ok) {
     setError(`Failed to ${action} cancellation request.`);
     setRefreshTrigger((c) => c + 1);
   } else {
     const result = await response.json();
     setActionSuccess(`Cancellation ${action}ed.`);
     setTimeout(() => setActionSuccess(null), 3000);
     
     setOrders((current) =>
       current.map((order) => (order.backendId === backendId ? { ...order, status: result.status } : order))
     );
   }
 };

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-6 text-[#1d1d1f] sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
 

 {/* Filter Tabs */}
 <div className="mt-5 grid grid-cols-2 rounded-[20px] bg-white p-1 shadow-[0_12px_26px_rgba(15,23,42,0.04)] .04]">
 {(['active', 'completed'] as const).map((option) => (
 <button
 key={option}
 type="button"
 onClick={() => setFilter(option)}
 className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-bold capitalize ${
 filter === option ? 'bg-[#111827] text-white shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
 }`}
 >
 {option} tickets
 </button>
 ))}
 </div>

 {/* Notification alerts */}
 {actionSuccess ? (
 <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 text-xs font-medium text-emerald-800 flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>{actionSuccess}</span>
 </div>
 ) : null}

 {error ? (
 <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 text-xs font-medium text-rose-800 flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
 <span>{error}</span>
 </div>
 ) : null}

 {/* Tickets Section */}
 <section className="mt-6">
 {loading ? (
 <PageLoader text="Loading kitchen tickets…" fullHeight={false} />
 ) : visibleOrders.length === 0 ? (
 <div className="rounded-[24px] bg-white p-10 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
 <PackageCheck className="mx-auto h-8 w-8 text-[#86868b]" />
 <p className="mt-3 text-sm font-medium text-[#1d1d1f]">No {filter} tickets</p>
 <p className="text-xs text-[#86868b] mt-1">Orders dispatched by diners will appear here in real time.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {visibleOrders.map((order) => {
 const isPendingCancel = order.status === 'CANCELLATION_REQUESTED';
 const isProcessing = processingId === order.backendId;

 return (
 <article
 key={order.backendId}
 className={`flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] ${isPendingCancel ? 'ring-2 ring-rose-500' : ''}`}
 >
 {/* Ticket Header: Table & Time */}
 <div className="flex items-start justify-between gap-3 pb-3.5">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-base font-bold tracking-tight text-[#1d1d1f]">
 {order.id}
 </span>
 <span className="px-2.5 py-0.5 rounded-full bg-[#111827] text-white text-[11px] font-semibold">
 {order.table}
 </span>
 </div>
 <p className="mt-1 text-xs text-[#6e6e73]">
 Received at {order.time}
 </p>
 </div>

 <div className="text-right">
 <span
 className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
 order.status === 'PENDING'
 ? 'bg-amber-100 text-amber-800'
 : order.status === 'PREPARING'
 ? 'bg-blue-100 text-blue-800'
 : order.status === 'READY'
 ? 'bg-emerald-100 text-emerald-800'
 : isPendingCancel
 ? 'bg-rose-100 text-rose-800'
 : 'bg-slate-100 text-slate-700'
 }`}
 >
 {isPendingCancel ? 'Cancel Requested' : order.status}
 </span>
 </div>
 </div>

 {/* Line Items */}
 <div className="mt-4 space-y-3">
 <p className="text-xs font-semibold text-[#86868b]">
 Kitchen line items
 </p>

 <div className="space-y-2">
 {order.items.map((item) => {
 const lineTotal = item.unitPrice * item.quantity;

 return (
 <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
 <div className="flex-1">
 <div className="flex items-baseline gap-2">
 <span className="text-sm font-bold text-[#1d1d1f]">
 {item.quantity}×
 </span>
 <span className="text-sm font-semibold text-[#1d1d1f]">
 {item.name}
 </span>
 </div>

 {item.customizations && item.customizations.length > 0 ? (
 <p className="text-xs text-[#6e6e73] ml-5 mt-0.5">
 {item.customizations.join(', ')}
 </p>
 ) : null}

 {item.notes ? (
 <p className="text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md inline-block ml-5 mt-1">
 Note: {item.notes}
 </p>
 ) : null}
 </div>

 <div className="text-right shrink-0 flex items-center gap-2">
 <span className="text-xs font-semibold text-[#1d1d1f]">
 RM {lineTotal.toFixed(2)}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Subtotal & Actions */}
 <div className="mt-4 pt-3.5 flex flex-col gap-3">
 <div className="flex justify-between items-center min-w-0">
 <p className="text-xs font-semibold text-[#86868b] truncate">
 Stall subtotal
 </p>
 <p className="text-sm font-semibold text-[#1d1d1f] truncate">
 RM {order.stallSubtotal.toFixed(2)}
 </p>
 </div>

 {isPendingCancel ? (
   <div className="flex items-center gap-2 mt-2">
     <button
       type="button"
       disabled={isProcessing}
       onClick={() => handleCancellation(order.backendId, 'reject')}
       className="flex-1 h-11 px-4 rounded-full bg-neutral-100 text-sm font-semibold text-neutral-800 hover:bg-neutral-200 disabled:opacity-50"
     >
       Reject
     </button>
     <button
       type="button"
       disabled={isProcessing}
       onClick={() => handleCancellation(order.backendId, 'approve')}
       className="flex-1 h-11 px-4 rounded-full bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
     >
       Approve Cancel
     </button>
   </div>
 ) : order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? (
 <button
 type="button"
 disabled={isProcessing}
 onClick={() => advanceOrder(order.backendId, order.status)}
 className="flex h-11 w-full mt-2 items-center justify-center gap-2 rounded-full bg-black text-sm font-semibold text-white hover:bg-neutral-800 shrink-0 disabled:opacity-50"
 >
 {isProcessing ? <ButtonLoader /> : (
   <>
     <Check className="h-4 w-4" />
     <span>{getActionLabel(order.status)}</span>
   </>
 )}
 </button>
 ) : null}
 </div>
 </article>
 );
 })}
 </div>
 )}
 </section>
 </div>
 
 <button
 type="button"
 onClick={() => setRefreshTrigger((c) => c + 1)}
 className="fixed bottom-24 sm:bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-lg hover:bg-neutral-50 disabled:opacity-50"
 aria-label="Refresh tickets"
 title="Refresh tickets"
 >
 <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin text-amber-600' : ''}`} />
 </button>
 </main>
 );
}
