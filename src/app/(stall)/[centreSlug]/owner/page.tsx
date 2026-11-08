'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { StallCalendar } from '@/components/stall/stall-calendar';
import { getStallSlug } from '@/lib/stall-route';

export default function StallOverviewPage() {
 const { centreSlug } = useParams<{ centreSlug: string }>();
 const { roles, refreshRoles } = useAuth();
 const booth = roles.booths.find((item) => getStallSlug(item) === centreSlug);

 if (roles.isLoading) {
 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pt-5">
 <div className="mx-auto max-w-5xl space-y-4">
 <div className="h-14 animate-pulse rounded-2xl bg-white" />
 <div className="h-[420px] animate-pulse rounded-[24px] bg-white" />
 </div>
 </main>
 );
 }

 if (!booth) {
 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pt-12 text-center text-sm text-[#6e6e73]">
 No stall is assigned to this link.
 </main>
 );
 }

 return (
 <StallCalendar
 key={booth.id}
 boothId={booth.id}
 initialSchedule={booth.schedule}
 refreshRoles={refreshRoles}
 />
 );
}
