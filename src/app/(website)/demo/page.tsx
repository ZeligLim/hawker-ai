'use client';

import { useState } from 'react';
import {
 Activity,
 ArrowUpRight,
 BadgeCheck,
 Banknote,
 Building2,
 CheckCircle2,
 Clock3,
 ClipboardList,
 ShieldCheck,
 Store,
 UtensilsCrossed,
} from 'lucide-react';
import {
 demoOrders,
 demoProfiles,
 demoRevenue,
 demoStalls,
 type DemoRole,
} from '@/lib/demo-data';

const money = (amount: number) =>
 new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);

function MetricCard({
 label,
 value,
 detail,
 icon: Icon,
}: {
 label: string;
 value: string;
 detail: string;
 icon: typeof Building2;
}) {
 return (
 <article className="min-w-0 rounded-2xl bg-white p-4 sm:p-5">
 <div className="flex items-start justify-between gap-2">
 <p className="text-xs font-medium text-[#6e6e73]">{label}</p>
 <Icon className="h-4 w-4 shrink-0 text-[#0071e3]" />
 </div>
 <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-[#1d1d1f]">{value}</p>
 <p className="mt-1 text-[11px] text-[#86868b]">{detail}</p>
 </article>
 );
}

export default function DemoPage() {
 const [activeRole, setActiveRole] = useState<DemoRole>('centre-owner');
 const activeProfile = demoProfiles.find((profile) => profile.id === activeRole)!;
 const isAdmin = activeRole === 'platform-admin';
 const isOwner = activeRole === 'centre-owner';
 const isWorker = activeRole === 'stall-worker';
 const isDiner = activeRole === 'diner';
 const visibleOrders = isWorker
 ? demoOrders.filter((order) => order.stall === 'Western')
 : demoOrders;
 const maxRevenue = Math.max(...demoRevenue.map((day) => day.amount));

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-10 pt-5 text-[#1d1d1f] sm:px-6 sm:pt-8">
 <div className="mx-auto max-w-6xl">
 <header className="flex flex-col gap-4 rounded-3xl bg-[#1d1d1f] p-5 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
 <div>
 <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
 <Activity className="h-3.5 w-3.5" /> Interactive demo · Mock data only
 </div>
 <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">Hawker Demo Workspace</h1>
 <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
 Preview populated platform, centre, and stall views using sample records. This demo does not sign in,
 read from, or write to your Supabase project.
 </p>
 </div>
 <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/75">
 <ShieldCheck className="h-4 w-4 text-emerald-300" />
 Demo profiles are not real login accounts
 </div>
 </header>

 <section className="mt-5">
 <div className="mb-3">
 <h2 className="text-sm font-semibold">Choose a test profile</h2>
 <p className="mt-1 text-xs text-[#6e6e73]">
 Sample identities for role previews only; no passwords or real accounts are created.
 </p>
 </div>
 <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
 {demoProfiles.map((profile) => {
 const selected = activeRole === profile.id;
 return (
 <button
 key={profile.id}
 type="button"
 onClick={() => setActiveRole(profile.id)}
 aria-pressed={selected}
 className={`min-w-0 rounded-2xl p-3.5 text-left transition-colors sm:p-4 ${
 selected ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#1d1d1f] hover:bg-neutral-50'
 }`}
 >
 <span className="flex items-center justify-between gap-2">
 <span className="truncate text-xs font-semibold sm:text-sm">{profile.name}</span>
 {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />}
 </span>
 <span className={`mt-1 block truncate text-[10px] ${selected ? 'text-white/65' : 'text-[#86868b]'}`}>
 {profile.email}
 </span>
 <span className={`mt-2 block text-[10px] ${selected ? 'text-white/80' : 'text-[#6e6e73]'}`}>
 {profile.description}
 </span>
 </button>
 );
 })}
 </div>
 </section>

 <section className="mt-5 rounded-2xl bg-white p-4 sm:flex sm:items-center sm:justify-between sm:px-5">
 <div className="min-w-0">
 <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">Previewing as</p>
 <p className="mt-1 truncate text-sm font-semibold">{activeProfile.name} <span className="font-normal text-[#6e6e73]">· {activeProfile.role}</span></p>
 </div>
 <p className="mt-2 truncate text-xs text-[#6e6e73] sm:mt-0">{activeProfile.email}</p>
 </section>

 {isDiner ? (
 <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
 <article className="rounded-3xl bg-white p-5 sm:p-7">
 <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
 <CheckCircle2 className="h-4 w-4" /> Sample order placed
 </div>
 <h2 className="mt-3 text-xl font-semibold">Order #HK-2047</h2>
 <p className="mt-1 text-xs text-[#86868b]">Setia Hawker Centre · Table 12 · Today, 12:37 PM</p>
 <div className="mt-5 divide-y divide-black/5 rounded-2xl bg-[#f5f5f7] px-4">
 <div className="flex justify-between gap-3 py-3 text-sm">
 <span>2× Curry Mee</span><span className="font-medium">{money(25)}</span>
 </div>
 <div className="flex justify-between gap-3 py-3 text-sm font-semibold">
 <span>Pay at the stall counter</span><span>{money(25)}</span>
 </div>
 </div>
 <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
 This is a mock receipt, not a real order. Live customer menus remain accessible only from their table QR codes.
 </p>
 </article>
 <article className="rounded-3xl bg-[#1d1d1f] p-5 text-white sm:p-7">
 <p className="text-xs font-semibold text-white/60">Sample live status</p>
 <p className="mt-3 text-2xl font-semibold">Ready for pickup</p>
 <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
 <Clock3 className="h-5 w-5 shrink-0 text-emerald-300" />
 <p className="text-xs leading-relaxed text-white/75">The sample stall marked this order ready at 12:51 PM.</p>
 </div>
 </article>
 </section>
 ) : (
 <>
 <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
 <MetricCard
 label={isAdmin ? 'Centres' : 'Today’s revenue'}
 value={isAdmin ? '12' : money(isWorker ? 428.5 : 2_486.5)}
 detail={isAdmin ? 'Across the platform' : 'Compared with sample data'}
 icon={Building2}
 />
 <MetricCard
 label={isAdmin ? 'Stalls' : 'Orders today'}
 value={isAdmin ? '86' : isWorker ? '18' : '73'}
 detail={isAdmin ? 'Registered stalls' : 'Sample order volume'}
 icon={Store}
 />
 <MetricCard
 label={isAdmin ? 'Orders today' : 'Open tickets'}
 value={isAdmin ? '642' : isWorker ? '3' : '11'}
 detail={isAdmin ? 'Across all centres' : 'Needs attention'}
 icon={ClipboardList}
 />
 <MetricCard
 label={isAdmin ? 'Platform status' : 'Average prep time'}
 value={isAdmin ? 'Healthy' : '12 min'}
 detail={isAdmin ? 'All sample services online' : 'This week · sample'}
 icon={BadgeCheck}
 />
 </section>

 {(isOwner || isAdmin) && (
 <section className="mt-4 rounded-3xl bg-white p-5 sm:p-6">
 <div className="flex items-start justify-between gap-3">
 <div>
 <h2 className="text-base font-semibold">{isAdmin ? 'Sample platform activity' : 'Weekly revenue'}</h2>
 <p className="mt-1 text-xs text-[#86868b]">{isAdmin ? 'Recent events across demo tenants' : 'Setia Hawker Centre · sample data'}</p>
 </div>
 <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Last 7 days</span>
 </div>
 <div className="mt-5 flex h-36 items-end gap-2 sm:h-48 sm:gap-4">
 {demoRevenue.map((day) => (
 <div key={day.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
 <span className="hidden text-[10px] text-[#86868b] sm:block">{money(day.amount)}</span>
 <div
 title={`${day.day}: ${money(day.amount)}`}
 className="w-full max-w-12 rounded-t-lg bg-[#0071e3]/75"
 style={{ height: `${Math.max(14, (day.amount / maxRevenue) * 100)}%` }}
 />
 <span className="text-[10px] font-medium text-[#6e6e73]">{day.day}</span>
 </div>
 ))}
 </div>
 </section>
 )}

 {(isOwner || isAdmin) && (
 <section className="mt-4 rounded-3xl bg-white p-5 sm:p-6">
 <div className="flex items-center justify-between gap-3">
 <div>
 <h2 className="text-base font-semibold">{isAdmin ? 'Venues' : 'Stall performance'}</h2>
 <p className="mt-1 text-xs text-[#86868b]">Setia Hawker Centre · sample records</p>
 </div>
 <Building2 className="h-5 w-5 text-[#0071e3]" />
 </div>
 <div className="mt-4 divide-y divide-black/5">
 {demoStalls.map((stall) => (
 <div key={stall.name} className="flex items-center justify-between gap-3 py-3">
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold">{stall.name}</p>
 <p className="mt-0.5 text-[11px] text-[#86868b]">{stall.category} · {stall.orders} orders</p>
 </div>
 <div className="shrink-0 text-right">
 <p className="text-sm font-semibold">{money(stall.revenue)}</p>
 <p className="mt-0.5 text-[10px] text-[#6e6e73]">{stall.status}</p>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {isWorker && (
 <section className="mt-4 rounded-3xl bg-white p-5 sm:p-6">
 <div className="flex items-center justify-between gap-3">
 <div>
 <h2 className="text-base font-semibold">Western · Kitchen tickets</h2>
 <p className="mt-1 text-xs text-[#86868b]">Sample queue · 3 active tickets</p>
 </div>
 <UtensilsCrossed className="h-5 w-5 text-[#0071e3]" />
 </div>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 {demoOrders.filter((order) => order.stall === 'Western').map((order) => (
 <article key={order.id} className="rounded-2xl bg-[#f5f5f7] p-4">
 <div className="flex items-center justify-between gap-2">
 <p className="text-sm font-semibold">#{order.id}</p>
 <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold">{order.status}</span>
 </div>
 <p className="mt-2 text-sm">{order.items}</p>
 <p className="mt-2 text-xs text-[#6e6e73]">{order.time} · {money(order.total)}</p>
 </article>
 ))}
 </div>
 </section>
 )}

 <section className="mt-4 overflow-hidden rounded-3xl bg-white">
 <div className="flex items-center justify-between gap-3 p-5 sm:px-6">
 <div>
 <h2 className="text-base font-semibold">{isWorker ? 'Recent stall orders' : 'Recent orders'}</h2>
 <p className="mt-1 text-xs text-[#86868b]">All rows are fictional demo data</p>
 </div>
 <ArrowUpRight className="h-5 w-5 text-[#86868b]" />
 </div>
 <div className="divide-y divide-black/5">
 {visibleOrders.map((order) => (
 <article key={order.id} className="flex items-start justify-between gap-3 px-5 py-3.5 sm:px-6">
 <div className="min-w-0">
 <p className="text-xs font-semibold">{order.id} <span className="font-normal text-[#86868b]">· {order.time}</span></p>
 <p className="mt-1 truncate text-xs text-[#6e6e73]">{order.stall} · {order.items}</p>
 </div>
 <div className="shrink-0 text-right">
 <p className="text-xs font-semibold">{money(order.total)}</p>
 <p className="mt-1 text-[10px] text-[#86868b]">{order.status}</p>
 </div>
 </article>
 ))}
 </div>
 </section>
 </>
 )}

 <footer className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-[#86868b]">
 <Banknote className="h-3.5 w-3.5" />
 Sample amounts and records only. No real payments, orders, accounts, or database changes.
 </footer>
 </div>
 </main>
 );
}
