'use client';

import { use, useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Store } from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { authenticatedFetch } from '@/lib/supabase/client';

type Venue = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  phone: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    authenticatedFetch(`/api/owner/shops/${id}`)
      .then(async (response) => {
        const payload = (await response.json()) as { shop?: Venue; error?: string };
        if (!response.ok) throw new Error(payload.error ?? 'Unable to load venue details.');
        if (active) setVenue(payload.shop ?? null);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load venue details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <PageLoader text="Loading venue details" fullHeight={false} variant="form" />;
  if (error || !venue) return <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error || 'Venue not found.'}</div>;

  return (
    <section className="mx-auto max-w-2xl rounded-[26px] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f5f5f7] text-[#0071e3]">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-[#1d1d1f]">{venue.name}</h1>
          <p className="mt-0.5 truncate text-xs text-[#86868b]">/{venue.slug ?? 'no-slug'}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${venue.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f5f7] text-[#6e6e73]'}`}>
          {venue.status}
        </span>
      </div>

      <dl className="mt-5 space-y-2">
        <div className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] p-3.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#86868b]" />
          <div><dt className="text-[10px] font-medium text-[#86868b]">Address</dt><dd className="mt-0.5 text-xs text-[#1d1d1f]">{venue.address || 'Not provided'}</dd></div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] p-3.5">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#86868b]" />
          <div><dt className="text-[10px] font-medium text-[#86868b]">Phone</dt><dd className="mt-0.5 text-xs text-[#1d1d1f]">{venue.phone || 'Not provided'}</dd></div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] p-3.5">
          <Store className="mt-0.5 h-4 w-4 shrink-0 text-[#86868b]" />
          <div><dt className="text-[10px] font-medium text-[#86868b]">Venue ID</dt><dd className="mt-0.5 break-all font-mono text-xs text-[#1d1d1f]">{venue.id}</dd></div>
        </div>
      </dl>
    </section>
  );
}
