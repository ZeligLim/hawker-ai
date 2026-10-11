'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { AlertCircle, ArrowLeft, Store, Camera, ScanLine } from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { setCurrentTableSession } from '@/lib/table-session';
import Link from 'next/link';

export default function CustomerScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const handleQrData = useCallback(async (text: string) => {
    if (processing) return;
    setProcessing(true);
    setError(null);

    try {
      // Validate that it's a URL
      let url: URL;
      try {
        url = new URL(text);
      } catch {
        throw new Error('Invalid QR code format. Not a recognized Hawker QR code.');
      }

      const tableId = url.searchParams.get('table_id');
      const outletId = url.searchParams.get('outlet_id'); // This is the restaurant_id

      if (!tableId || !outletId) {
        throw new Error('This QR code does not contain valid table information.');
      }

      // Call our backend to create/fetch a table session and get the centre slug
      const res = await fetch('/api/table-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId }),
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error || 'Failed to validate table.');
      }

      const { table } = await res.json();
      
      const centre = Array.isArray(table.restaurants) ? table.restaurants[0] : table.restaurants;
      
      if (!centre || !centre.slug) {
         throw new Error('Associated hawker centre not found.');
      }

      // Set the session globally
      setCurrentTableSession(table.table_number, table.id, {
        centreId: centre.id,
        centreSlug: centre.slug,
        centreName: centre.name,
      });

      // Redirect to the centre ordering interface
      router.replace(`/${centre.slug}`);
    } catch (err: any) {
      setError(err.message || 'Could not process QR code.');
      setProcessing(false);
    }
  }, [processing, router]);

  // We handle incoming URL parameters if they are already present
  // e.g. /scan?outlet_id=xxx&table_id=yyy (If camera app decoded the standard URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outletId = params.get('outlet_id');
    const tableId = params.get('table_id');
    
    if (outletId && tableId && !processing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleQrData(window.location.href);
    }
  }, [handleQrData, processing]);

  const handleCameraError = (err: unknown) => {
    console.error('Camera error:', err);
    setCameraError(true);
  };

  if (processing) {
    return <PageLoader text="Connecting to table..." />;
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between p-4 z-10 relative">
        <Link 
          href="/stall" 
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-sm font-semibold">Scan Table QR</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-red-500 text-white p-3 rounded-2xl text-xs font-semibold shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-1">
              ✕
            </button>
          </div>
        )}

        {cameraError ? (
          <div className="text-center p-8 max-w-sm">
            <Camera className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Camera Access Denied</h2>
            <p className="text-sm text-white/70 mb-6">
              We could not access your camera. Please check your browser permissions or manually enter your table number at the food court page.
            </p>
            <Link 
              href="/stall" 
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200"
            >
              <Store className="w-4 h-4" /> Go to Centres
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-md aspect-[3/4] sm:aspect-square relative overflow-hidden bg-black flex items-center justify-center">
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  handleQrData(result[0].rawValue);
                }
              }}
              onError={handleCameraError}
              constraints={{ facingMode: 'environment' }}
              components={{
                finder: false,
              }}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' },
              }}
            />
            
            {/* Scanning Overlay Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              <div className="flex-1 bg-black/40" />
              <div className="flex">
                <div className="w-12 sm:w-16 bg-black/40" />
                <div className="flex-1 aspect-square border-2 border-white/30 rounded-3xl relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-3xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-3xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-3xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-3xl" />
                  
                  {/* Scanning Animation Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
                <div className="w-12 sm:w-16 bg-black/40" />
              </div>
              <div className="flex-1 bg-black/40" />
            </div>
          </div>
        )}

        <div className="p-8 text-center relative z-10 w-full bg-black/40 backdrop-blur-md pb-safe">
          <ScanLine className="w-8 h-8 text-white/50 mx-auto mb-3" />
          <h3 className="font-semibold text-white">Position QR Code</h3>
          <p className="text-xs text-white/60 mt-1 max-w-[250px] mx-auto">
            Point your camera at the table QR code to start ordering
          </p>
          
          <Link 
             href="/stall" 
             className="mt-6 inline-flex text-xs font-semibold text-white/70 hover:text-white"
          >
            Enter table manually instead
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </main>
  );
}
