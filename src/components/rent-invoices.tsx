'use client';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/supabase/client';
import { LoaderCircle, FileText, CheckCircle2 } from 'lucide-react';

type RentInvoice = {
 id: string;
 amount: number;
 description: string | null;
 status: string;
 created_at: string;
 restaurants: { name: string } | null;
};

export function RentInvoices({ boothId }: { boothId: string }) {
 const [invoices, setInvoices] = useState<RentInvoice[]>([]);
 const [loading, setLoading] = useState(true);
 const [payingInvoice, setPayingInvoice] = useState<RentInvoice | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'generating' | 'ready' | 'success' | 'error'>('idle');

 useEffect(() => {
 async function loadInvoices() {
 try {
 const res = await authenticatedFetch(`/api/owner/rent?type=booth&id=${boothId}`);
 const data = await res.json();
 setInvoices(data.invoices || []);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 }
 loadInvoices();
 }, [boothId]);

 
 const handlePay = async (invoice: RentInvoice) => {
    setPayingInvoice(invoice);
    setProcessingStatus('generating');
    try {
      await authenticatedFetch(`/api/owner/rent/${invoice.id}/pay`, { method: 'POST' });
      setProcessingStatus('success');
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: 'paid' } : inv));
    } catch (err) {
      setProcessingStatus('error');
    }
  };

 if (loading) return <div className="p-4 flex justify-center"><LoaderCircle className="h-5 w-5 animate-spin" /></div>;

 if (invoices.length === 0) return null;

 return (
 <section className="mt-6 rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
 <div className="flex items-center gap-2 mb-4">
 <FileText className="h-5 w-5 text-[#1d1d1f]" />
 <h3 className="text-sm font-semibold text-[#1d1d1f]">Rent Invoices</h3>
 </div>
 
 <div className="flex flex-col gap-3">
 {invoices.map((inv) => (
 <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[18px] bg-[#f5f5f7]">
 <div>
 <p className="text-sm font-semibold text-[#1d1d1f]">{inv.description || 'Stall Rent'}</p>
 <p className="text-xs text-[#6e6e73]">
 {new Date(inv.created_at).toLocaleDateString()} &bull; {inv.restaurants?.name}
 </p>
 <p className="mt-1 text-sm font-bold">RM {inv.amount.toFixed(2)}</p>
 </div>
 
 {inv.status === 'paid' ? (
 <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
 <CheckCircle2 className="h-3.5 w-3.5" />
 Paid
 </div>
 ) : (
 <button
 onClick={() => handlePay(inv)}
 disabled={processingStatus === 'generating' || processingStatus === 'ready'}
 className="rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-black shadow-xs disabled:opacity-50 self-start sm:self-auto"
 >
 {payingInvoice?.id === inv.id && processingStatus === 'generating' ? (
 <span className="flex items-center gap-1"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Processing...</span>
 ) : 'Pay Now'}
 </button>
 )}
 </div>
 ))}
 </div>

 
 {processingStatus === 'success' && (
 <div className="mt-4 p-4 rounded-[18px] bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2">
 <CheckCircle2 className="h-4 w-4" />
 Payment Successful!
 </div>
 )}
 </section>
 );
}
