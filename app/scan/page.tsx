'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, QrCode, ScanLine } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatTableLabel, parseTableReference, setCurrentTableSession } from '@/lib/table-session';

function ScanTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTable = searchParams.get('table') || '';
  const initialCentre = searchParams.get('centre') || searchParams.get('slug') || '';

  const [input, setInput] = useState(initialTable || '04');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const linkTable = async (rawTable: string, rawCentre?: string) => {
    setStatus('saving');
    setMessage('');

    const { tableNumber, tableId } = parseTableReference(rawTable);
    const label = formatTableLabel(tableNumber);

    try {
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          const response = await fetch('/api/table-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({
              tableId: tableId || undefined,
              tableNumber: tableNumber || undefined,
            }),
          });

          if (response.ok) {
            const payload = (await response.json().catch(() => ({}))) as {
              table?: { id: string; table_number?: string };
            };
            const sessionTable = payload.table?.table_number ?? tableNumber;
            const resolvedTableId = payload.table?.id ?? tableId;
            setCurrentTableSession(sessionTable, resolvedTableId, { centreSlug: rawCentre || undefined });
            setStatus('success');
            setMessage(`Linked to ${formatTableLabel(sessionTable)}. Redirecting to stall...`);
            setTimeout(() => {
              router.push('/stall' as any);
            }, 600);
            return;
          }
        }
      }

      setCurrentTableSession(tableNumber, tableId ?? null, { centreSlug: rawCentre || undefined });
      setStatus('success');
      setMessage(`Saved ${label}. Redirecting to stall...`);
      setTimeout(() => {
        router.push('/stall' as any);
      }, 600);
    } catch {
      setCurrentTableSession(tableNumber, tableId ?? null, { centreSlug: rawCentre || undefined });
      setStatus('success');
      setMessage(`Saved ${label}. Proceeding to stall...`);
      setTimeout(() => {
        router.push('/stall' as any);
      }, 600);
    }
  };

  // If table was passed directly via QR scan URL e.g. /scan?table=04
  useEffect(() => {
    if (initialTable) {
      const timer = setTimeout(() => {
        void linkTable(initialTable, initialCentre);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialTable, initialCentre]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void linkTable(input, initialCentre);
  };

  return (
    <div className="rounded-[28px] bg-white p-5 sm:p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)] border border-black/[0.04]">
      <div className="flex items-center gap-3">
        <Link
          href="/stall"
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
          aria-label="Back to stalls"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0071e3]">Table link</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">Scan Table QR</h1>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center rounded-[24px] bg-[#111827] p-6 text-white text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border border-white/20 bg-white/10 mb-3">
          <QrCode className="h-10 w-10 text-white" />
        </div>
        <p className="text-sm font-semibold">Scan Table QR to Order</p>
        <p className="text-xs text-white/70 mt-1 max-w-[240px]">
          Point your phone camera at the QR code sticker on your table.
        </p>
      </div>

      {/* Quick table picker for testing & manual input */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
          Or Select Quick Table
        </p>
        <div className="grid grid-cols-3 gap-2">
          {['04', '12', '01'].map((tbl) => (
            <button
              key={tbl}
              type="button"
              onClick={() => {
                setInput(tbl);
                void linkTable(tbl, initialCentre);
              }}
              className="py-2.5 px-3 rounded-2xl bg-[#f5f5f7] hover:bg-black/5 font-semibold text-xs text-[#1d1d1f] border border-black/[0.04] transition-colors"
            >
              Table {tbl}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-[#1d1d1f]">
          Manual Table Number
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. 04 or 12"
            className="mt-2 w-full rounded-[18px] border border-[#e5e7eb] bg-[#f5f5f7] px-3.5 py-3 text-base outline-none ring-0 placeholder:text-[#8a8a8e] focus:border-[#111827]"
          />
        </label>

        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:bg-black transition-colors disabled:opacity-70 shadow-sm"
        >
          <ScanLine className="h-4 w-4" />
          {status === 'saving' ? 'Linking table...' : 'Link Table & Order'}
        </button>
      </form>

      {message ? (
        <div
          className={`mt-4 rounded-[18px] p-3 text-sm flex items-center gap-2 ${
            status === 'error' ? 'bg-[#fff1f2] text-[#9f1239]' : 'bg-[#ecfdf5] text-[#166534]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : null}

      {status === 'success' && (
        <button
          onClick={() => router.push('/home' as any)}
          className="mt-3 w-full py-3 rounded-full bg-[#0071e3] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          Go to Menu Now <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="mt-5 rounded-[18px] bg-[#f5f5f7] p-3 text-xs text-[#6e6e73]">
        A table QR code connects your device to your specific table so stall woks know where to send hot food.
      </div>
    </div>
  );
}

export default function ScanTablePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <Suspense fallback={<div className="p-8 text-center text-sm text-[#86868b]">Loading scanner...</div>}>
          <ScanTableContent />
        </Suspense>
      </div>
    </main>
  );
}
