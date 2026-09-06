'use client';

import Link from 'next/link';
import { ArrowLeft, QrCode, ScanLine } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatTableLabel, parseTableReference, setCurrentTableSession } from '@/lib/table-session';

export default function ScanTablePage() {
  const [input, setInput] = useState('12');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    const { tableNumber, tableId } = parseTableReference(input);
    const label = formatTableLabel(tableNumber);

    try {
      if (tableId && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          const response = await fetch('/api/table-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({ tableId }),
          });

          if (response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { table?: { table_number?: string } };
            const sessionTable = payload.table?.table_number ?? tableNumber;
            setCurrentTableSession(sessionTable, tableId);
            setStatus('success');
            setMessage(`Table session linked to ${formatTableLabel(sessionTable)}.`);
            return;
          }
        }
      }

      setCurrentTableSession(tableNumber, tableId ?? null);
      setStatus('success');
      setMessage(`Saved ${label}. You can keep browsing and place your order from this table.`);
    } catch {
      setCurrentTableSession(tableNumber, tableId ?? null);
      setStatus('error');
      setMessage('The code was saved locally, but the table session could not be validated.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]" aria-label="Back home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6e6e73]">Table link</p>
              <h1 className="text-3xl font-semibold tracking-[-0.06em]">Scan QR</h1>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center rounded-[28px] bg-[#111827] p-6 text-white">
            <div className="flex h-28 w-28 items-center justify-center rounded-[24px] border border-white/20 bg-white/5">
              <QrCode className="h-16 w-16" />
            </div>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-[#1d1d1f]">
              Enter the table code or scanned QR value
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="12 or a QR payload"
                className="mt-2 w-full rounded-[18px] border border-[#e5e7eb] bg-[#f5f5f7] px-3 py-3 text-base outline-none ring-0 placeholder:text-[#8a8a8e] focus:border-[#111827]"
              />
            </label>

            <button type="submit" disabled={status === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">
              <ScanLine className="h-4 w-4" />
              {status === 'saving' ? 'Linking table...' : 'Link table'}
            </button>
          </form>

          {message ? (
            <div className={`mt-4 rounded-[18px] p-3 text-sm ${status === 'error' ? 'bg-[#fff1f2] text-[#9f1239]' : 'bg-[#ecfdf5] text-[#166534]'}`}>
              {message}
            </div>
          ) : null}

          <div className="mt-5 rounded-[18px] bg-[#f5f5f7] p-3 text-sm text-[#6e6e73]">
            A QR code should identify the table, not the customer. Your app keeps the table context local while the order is being prepared.
          </div>
        </div>
      </div>
    </main>
  );
}
