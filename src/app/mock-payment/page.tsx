'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const returnUrl = searchParams.get('returnUrl');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!paymentId || !orderId || !amount || !returnUrl) {
    return <div className="p-8 text-center text-red-500">Invalid payment request parameters.</div>;
  }

  const handleAction = async (status: 'PAID' | 'FAILED' | 'CANCELLED') => {
    setLoading(true);
    setError('');
    try {
      // Simulate Stripe server signing the webhook payload
      const payloadString = JSON.stringify({
        provider: 'mock',
        paymentId,
        orderId,
        status,
      });
      
      const signRes = await fetch('/api/payment/mock-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });
      if (!signRes.ok) throw new Error('Mock signing failed');
      const { signature } = await signRes.json();

      // Send the signed webhook
      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-signature': signature 
        },
        body: payloadString
      });
      
      if (!res.ok) throw new Error('Webhook failed');

      // Redirect back
      window.location.assign(returnUrl);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">MOCK PAYMENT</h1>
          <p className="text-blue-100 text-sm mt-1 uppercase tracking-wider font-semibold">Development Only</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
              <span className="text-gray-500 text-sm">Order ID</span>
              <span className="font-mono text-sm font-medium">{orderId.split('-')[0]}...</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
              <span className="text-gray-500 text-sm">Payment ID</span>
              <span className="font-mono text-xs text-gray-400">{paymentId}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-gray-900 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">RM {Number(amount).toFixed(2)}</span>
            </div>
          </div>

          {error && <div className="mb-4 text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">{error}</div>}

          <div className="space-y-3">
            <button
              onClick={() => handleAction('PAID')}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Approve Payment'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction('FAILED')}
                disabled={loading}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                Simulate Failure
              </button>
              <button
                onClick={() => handleAction('CANCELLED')}
                disabled={loading}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading mock checkout...</div>}>
      <MockPaymentContent />
    </Suspense>
  );
}
