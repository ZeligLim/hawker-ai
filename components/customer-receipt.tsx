'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowLeft, Receipt, ShieldCheck, RefreshCw } from 'lucide-react';
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


  useEffect(() => {
    if (!supabase || !data.id) return;

    const channel = supabase.channel(`order-${data.id}`)
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
    <div className="w-full max-w-lg mx-auto bg-white rounded-[28px] border border-black/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Real-time alert banner if item was sold out */}
      {liveBanner ? (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-medium">{liveBanner}</p>
        </div>
      ) : null}

      {/* Header */}
      <div className="p-6 pb-4 border-b border-black/[0.06] bg-[#fbfbfd]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 -ml-1 text-[#6e6e73] hover:text-[#1d1d1f] rounded-full hover:bg-black/5"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#0071e3]" />
              <h2 className="text-base font-semibold tracking-[-0.02em] text-[#1d1d1f]">Customer Receipt</h2>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-[#86868b]">
            #{data.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6e6e73]">
          <div>
            <p className="font-medium text-[#1d1d1f]">{data.venueName ?? 'Hawker Centre'}</p>
            <p className="text-[11px] text-[#86868b]">{new Date(data.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
          {data.tableLabel ? (
            <span className="px-2.5 py-1 rounded-full bg-black/5 text-[#1d1d1f] font-semibold text-[11px]">
              {data.tableLabel}
            </span>
          ) : null}
        </div>
      </div>

      {/* Itemized Breakdown */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-[#86868b] mb-2.5">
            Ordered items
          </p>
          <div className="divide-y divide-black/[0.04]">
            {data.items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-[#1d1d1f]">
                          {item.quantity}×
                        </span>
                        <p className={`text-xs font-medium ${item.isRefunded ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'}`}>
                          {item.name}
                        </p>
                      </div>
                      {item.customizations && item.customizations.length > 0 ? (
                        <p className="text-[11px] text-[#86868b] ml-5 mt-0.5">
                          {item.customizations.join(', ')}
                        </p>
                      ) : null}
                      {item.notes ? (
                        <p className="text-[11px] text-[#86868b] italic ml-5 mt-0.5">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      ) : null}
                      {item.isRefunded ? (
                        <div className="ml-5 mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Item Sold Out — Refunded -RM {itemTotal.toFixed(2)}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-medium ${item.isRefunded ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'}`}>
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
        <div className="pt-4 border-t border-black/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6e6e73]">
            <span>Subtotal</span>
            <span className="font-medium text-[#1d1d1f]">RM {data.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6e6e73]">
            <div className="flex items-center gap-1.5">
              <span>Platform / Service Fee</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 text-[#86868b] font-medium">
                Flat Diner Fee
              </span>
            </div>
            <span className="font-medium text-[#1d1d1f]">RM {data.serviceFee.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-sm font-semibold text-[#1d1d1f]">
            <span>Total Paid</span>
            <span className="text-base text-[#1d1d1f]">RM {data.total.toFixed(2)}</span>
          </div>

          {/* Refund Breakdown if Applicable */}
          {hasRefund ? (
            <div className="mt-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-rose-700">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  Refunded to eWallet (Out-of-Stock)
                </span>
                <span>-RM {data.refundAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-rose-200/60 font-bold text-xs text-rose-950">
                <span>Adjusted Total</span>
                <span className="text-sm">RM {adjustedTotal.toFixed(2)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Payment & Trust Badge */}
        <div className="pt-3">
          <div className="rounded-2xl bg-[#f5f5f7] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1d1d1f]">
                  {data.paymentStatus === 'FULLY_REFUNDED'
                    ? 'FULLY REFUNDED'
                    : data.paymentStatus === 'PARTIALLY_REFUNDED'
                    ? 'PARTIALLY REFUNDED'
                    : 'PAID via eWallet / DuitNow QR'}
                </p>
                <p className="text-[10px] text-[#86868b]">
                  {data.paymentIntentId ? `Ref: ${data.paymentIntentId}` : 'Instant verified payment'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white text-[#1d1d1f] shadow-sm border border-black/5">
              {data.paymentStatus}
            </span>
          </div>

          <p className="mt-3 text-center text-[11px] text-[#86868b] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Direct payment protection &bull; 0% stall commission
          </p>
        </div>
      </div>
    </div>
  );
}
