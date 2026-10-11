'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Clock3, ArrowLeft, Receipt, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export type ReceiptItem = {
 id: string;
 dishId?: string;
 name: string;
 price?: number;
 unitPrice?: number;
 quantity: number;
 customizations?: string[];
 notes?: string;
 stallName?: string;
};

export type ReceiptData = {
 id: string;
 tableLabel?: string;
 venueName?: string;
 subtotal: number;
 serviceFee: number;
 total: number;
 status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLATION_REQUESTED' | 'CANCELLED';
 createdAt: string;
 items: ReceiptItem[];
};

export function CustomerReceipt({
  initialData,
  onBack,
  onClearActive,
  simplified = false,
}: {
  initialData: ReceiptData;
  onBack?: () => void;
  onClearActive?: () => void;
  simplified?: boolean;
}) {
  const [data, setData] = useState(initialData);
  const [eta, setEta] = useState<string>('Calculating...');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const orderStatus = data.status;

  // Realtime subscription for status updates
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel(`customer-order-${data.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${data.id}` },
        (payload) => {
          if (payload.new && payload.new.status) {
            setData((prev) => ({ ...prev, status: payload.new.status as any }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [data.id]);

  useEffect(() => {
    if (orderStatus === 'COMPLETED' || orderStatus === 'CANCELLED') return;
    let active = true;
    fetch(`/api/orders/${data.id}/eta`).then(res => res.json()).then(resData => {
      if (active && resData.eta) setEta(`ETA ${resData.eta}`);
    }).catch(() => {});
    return () => { active = false; };
  }, [data.id, orderStatus]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? The restaurant will be notified.')) return;
    setCancelling(true);
    setCancelError('');

    try {
      const response = await fetch(`/api/orders/${data.id}/cancel`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to cancel order.');
      
      setData((prev) => ({ ...prev, status: 'CANCELLATION_REQUESTED' }));
    } catch (err: any) {
      setCancelError(err.message || 'An error occurred.');
    } finally {
      setCancelling(false);
    }
  };

  const isCancellable = orderStatus === 'PENDING' || orderStatus === 'CONFIRMED' || orderStatus === 'PREPARING';

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-lg overflow-hidden text-black">
      {/* Mark as Received Button */}
      {onClearActive && (orderStatus === 'COMPLETED' || orderStatus === 'READY') ? (
        <div className="bg-[#f5f5f7] p-3 flex justify-center">
          <button
            onClick={onClearActive}
            className="w-full max-w-[200px] h-11 rounded-full bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
          >
            Food Received
          </button>
        </div>
      ) : null}

      {/* Live Status Banner */}
      <div className={`px-4 py-3.5 flex items-center justify-between text-white ${orderStatus === 'CANCELLED' ? 'bg-rose-600' : orderStatus === 'CANCELLATION_REQUESTED' ? 'bg-rose-500' : 'bg-[#1d1d1f]'}`}>
        <div className="flex items-center gap-2">
          {orderStatus === 'COMPLETED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : orderStatus === 'READY' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : orderStatus === 'CANCELLED' ? (
            <XCircle className="w-5 h-5 text-white" />
          ) : orderStatus === 'CANCELLATION_REQUESTED' ? (
            <AlertCircle className="w-5 h-5 text-white" />
          ) : (
            <Clock3 className="w-5 h-5 text-neutral-400" />
          )}
          <span className="text-sm font-semibold">
            {orderStatus === 'COMPLETED' || orderStatus === 'READY'
              ? 'Order Completed'
              : orderStatus === 'CANCELLED'
              ? 'Order Cancelled'
              : orderStatus === 'CANCELLATION_REQUESTED'
              ? 'Cancellation Pending...'
              : 'Preparing your food...'}
          </span>
        </div>
        {orderStatus !== 'COMPLETED' && orderStatus !== 'READY' && orderStatus !== 'CANCELLED' && orderStatus !== 'CANCELLATION_REQUESTED' && (
          <span className="text-xs font-medium text-neutral-300">{eta}</span>
        )}
      </div>

      {cancelError && (
        <div className="bg-rose-100 px-4 py-3 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-medium">{cancelError}</p>
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-4 bg-neutral-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 -ml-1 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-200 transition-colors"
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
              const itemTotal = (item.price || item.unitPrice || 0) * item.quantity;
              return (
                <div key={item.id} className="py-2 bg-neutral-50 rounded-2xl px-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-black">
                          {item.quantity}×
                        </span>
                        <p className="text-xs font-semibold text-black">
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
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-black">
                        RM {itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!simplified && (
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
            
            {isCancellable && (
               <div className="pt-4 mt-2">
                 <button
                   onClick={handleCancelOrder}
                   disabled={cancelling}
                   className="w-full py-2.5 rounded-full bg-white text-rose-600 font-semibold text-xs hover:bg-rose-50 disabled:opacity-50"
                 >
                   {cancelling ? 'Requesting...' : 'Cancel Order'}
                 </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
