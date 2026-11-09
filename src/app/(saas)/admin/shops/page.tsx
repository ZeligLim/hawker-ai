'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
 Building2,
 Store,
 ChevronRight,
} from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { authenticatedFetch } from '@/lib/supabase/client';

type Shop = {
 id: string;
 name: string;
 slug: string | null;
 address: string | null;
 createdAt: string | null;
 isActive: boolean;
 status: string;
 booths: Array<{ id: string; name: string; isOpen?: boolean; status?: string }>;
};

export default function AdminShopsListPage() {
 const [shops, setShops] = useState<Shop[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 let isMounted = true;
 authenticatedFetch('/api/owner/shops?all=true')
 .then(async (res) => {
 if (!isMounted) return;
 if (!res.ok) throw new Error(`Failed to load venues (${res.status})`);
 const data = (await res.json()) as { shops?: Shop[] };
 setShops(data.shops ?? []);
 setLoading(false);
 })
 .catch((err: any) => {
 if (!isMounted) return;
 setError(err.message ?? 'Failed to fetch venues');
 setLoading(false);
 });

 return () => {
 isMounted = false;
 };
 }, []);

 return (
 <div className="space-y-6 sm:space-y-8">

 {loading ? (
 <PageLoader text="Loading venues" fullHeight={false} variant="table" />
 ) : error ? (
 <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 ">
 {error}
 </div>
 ) : shops.length === 0 ? (
 <div className="rounded-3xl bg-white p-12 text-center text-[#86868b] ">
 <Building2 className="w-8 h-8 text-[#86868b] mx-auto mb-3" />
 <p className="text-base font-semibold text-[#1d1d1f]">No Venues Found</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {shops.map((shop) => {
 return (
 <div
 key={shop.id}
 className="rounded-3xl bg-white p-6 flex flex-col justify-between gap-5 hover:bg-neutral-50 "
 >
 <div>
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h2 className="text-base sm:text-lg font-semibold text-[#1d1d1f] truncate">{shop.name}</h2>
 <p className="text-xs text-[#86868b] font-mono mt-0.5">/{shop.slug ?? 'unknown'}</p>
 </div>
 </div>

 <p className="mt-2 text-xs text-[#86868b] line-clamp-2">
 {shop.address ?? 'Address not specified'}
 </p>

 <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6e6e73]">
 <Store className="w-3.5 h-3.5 text-[#86868b]" />
 <span>{shop.booths?.length ?? 0} stalls</span>
 </div>
 </div>

 <div className="pt-4">
 <Link
 href={`/admin/shops/${shop.id}` as any}
 className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-2.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.06] "
 >
 <span>Details</span>
 <ChevronRight className="w-3.5 h-3.5 text-[#6e6e73]" />
 </Link>

 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
